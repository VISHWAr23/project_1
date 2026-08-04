import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { prisma, RollStatus, RollStage, Prisma } from '@ims/database';
import { CreateRollDto } from './dto/create-roll.dto';
import { UpdateRollStatusDto } from './dto/update-roll-status.dto';

@Injectable()
export class RollTrackingService {
  /**
   * Helper to generate unique serial roll number token
   */
  async generateRollNumber(): Promise<{ rollNumber: string; barcode: string }> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ROL-${todayStr}-`;
    const count = await prisma.cottonRoll.count();
    const seq = String(count + 1).padStart(4, '0');
    let rollNumber = `${prefix}${seq}`;
    let exists = await prisma.cottonRoll.findUnique({ where: { rollNumber } });
    let counter = count + 1;

    while (exists) {
      counter++;
      rollNumber = `${prefix}${String(counter).padStart(4, '0')}`;
      exists = await prisma.cottonRoll.findUnique({ where: { rollNumber } });
    }

    const barcode = `BAR-${rollNumber}`;
    return { rollNumber, barcode };
  }

  /**
   * Create a new Cotton Roll with unique serial token and initial status ledger entry
   */
  async createRoll(dto: CreateRollDto) {
    const { rollNumber, barcode } = await this.generateRollNumber();

    const roll = await prisma.cottonRoll.create({
      data: {
        rollNumber,
        barcode,
        materialName: dto.materialName,
        batchNumber: dto.batchNumber,
        widthInches: dto.widthInches,
        lengthMeters: dto.lengthMeters,
        weightKg: dto.weightKg,
        gsm: dto.gsm,
        stage: dto.stage || RollStage.GREY_FABRIC_ROLL,
        currentStatus: dto.status || RollStatus.RAW_RECEIVED,
        currentLocation: dto.currentLocation,
        parentRollId: dto.parentRollId,
        jobWorkCompanyId: dto.jobWorkCompanyId,
        productionBatchId: dto.productionBatchId,
        finishedProductId: dto.finishedProductId,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: dto.status || RollStatus.RAW_RECEIVED,
            location: dto.currentLocation,
            remarks: 'Initial roll creation and receipt',
            performedBy: 'System / Intake',
          },
        },
      },
      include: {
        parentRoll: true,
        jobWorkCompany: true,
        productionBatch: true,
        finishedProduct: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return roll;
  }

  /**
   * Bulk create serialized cotton rolls from GRN / Procurement intake
   */
  async bulkCreateRolls(items: CreateRollDto[]) {
    const createdRolls = [];
    for (const item of items) {
      const roll = await this.createRoll(item);
      createdRolls.push(roll);
    }
    return {
      success: true,
      count: createdRolls.length,
      rolls: createdRolls,
    };
  }

  /**
   * List cotton rolls with filtering and pagination
   */
  async findAll(query: {
    search?: string;
    status?: RollStatus;
    stage?: RollStage;
    batchNumber?: string;
    jobWorkCompanyId?: string;
    location?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CottonRollWhereInput = {};

    if (query.search) {
      where.OR = [
        { rollNumber: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
        { batchNumber: { contains: query.search, mode: 'insensitive' } },
        { materialName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.currentStatus = query.status;
    }

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.batchNumber) {
      where.batchNumber = query.batchNumber;
    }

    if (query.jobWorkCompanyId) {
      where.jobWorkCompanyId = query.jobWorkCompanyId;
    }

    if (query.location) {
      where.currentLocation = { contains: query.location, mode: 'insensitive' };
    }

    const [total, rolls] = await Promise.all([
      prisma.cottonRoll.count({ where }),
      prisma.cottonRoll.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          jobWorkCompany: { select: { id: true, companyName: true } },
          productionBatch: { select: { id: true, batchNumber: true, targetProduct: true } },
          finishedProduct: { select: { id: true, name: true, productCode: true } },
        },
      }),
    ]);

    return {
      data: rolls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find single roll by rollNumber or Barcode
   */
  async findByRollNumber(rollNumber: string) {
    const roll = await prisma.cottonRoll.findFirst({
      where: {
        OR: [{ rollNumber }, { barcode: rollNumber }],
      },
      include: {
        parentRoll: true,
        childRolls: true,
        jobWorkCompany: true,
        productionBatch: true,
        finishedProduct: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        qcInspections: {
          orderBy: { inspectedAt: 'desc' },
        },
      },
    });

    if (!roll) {
      throw new NotFoundException(`Cotton Roll '${rollNumber}' not found`);
    }

    return roll;
  }

  /**
   * Get 360° Roll Genealogy Lineage (Ancestors and Descendants)
   */
  async getGenealogy(rollNumber: string) {
    const roll = await this.findByRollNumber(rollNumber);

    // Fetch full parent tree recursively if present
    let parentChain = [];
    let currentParentId = roll.parentRollId;

    while (currentParentId) {
      const parent = await prisma.cottonRoll.findUnique({
        where: { id: currentParentId },
        select: {
          id: true,
          rollNumber: true,
          materialName: true,
          stage: true,
          currentStatus: true,
          parentRollId: true,
        },
      });
      if (parent) {
        parentChain.unshift(parent);
        currentParentId = parent.parentRollId;
      } else {
        break;
      }
    }

    // Fetch immediate child slit rolls
    const childRolls = await prisma.cottonRoll.findMany({
      where: { parentRollId: roll.id },
      select: {
        id: true,
        rollNumber: true,
        barcode: true,
        materialName: true,
        stage: true,
        widthInches: true,
        lengthMeters: true,
        weightKg: true,
        currentStatus: true,
        currentLocation: true,
        createdAt: true,
      },
    });

    return {
      roll,
      ancestors: parentChain,
      children: childRolls,
    };
  }

  /**
   * Update Roll Status and record event in RollStatusHistory ledger
   */
  async updateStatus(rollNumber: string, dto: UpdateRollStatusDto) {
    const roll = await prisma.cottonRoll.findFirst({
      where: { OR: [{ rollNumber }, { barcode: rollNumber }] },
    });

    if (!roll) {
      throw new NotFoundException(`Cotton Roll '${rollNumber}' not found`);
    }

    const previousStatus = roll.currentStatus;

    const updatedRoll = await prisma.cottonRoll.update({
      where: { id: roll.id },
      data: {
        currentStatus: dto.status,
        currentLocation: dto.location,
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: dto.status,
            location: dto.location,
            remarks: dto.remarks || `Status changed from ${previousStatus} to ${dto.status}`,
            performedBy: dto.performedBy,
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return updatedRoll;
  }

  /**
   * Summary metrics for roll inventory dashboards
   */
  async getStats() {
    const [totalRolls, rollsByStatus, rollsByStage, aggregateWeight] = await Promise.all([
      prisma.cottonRoll.count(),
      prisma.cottonRoll.groupBy({
        by: ['currentStatus'],
        _count: { _all: true },
        _sum: { weightKg: true },
      }),
      prisma.cottonRoll.groupBy({
        by: ['stage'],
        _count: { _all: true },
        _sum: { weightKg: true },
      }),
      prisma.cottonRoll.aggregate({
        _sum: { weightKg: true, lengthMeters: true },
      }),
    ]);

    return {
      totalRolls,
      totalWeightKg: aggregateWeight._sum.weightKg || 0,
      totalLengthMeters: aggregateWeight._sum.lengthMeters || 0,
      statusBreakdown: rollsByStatus,
      stageBreakdown: rollsByStage,
    };
  }
}
