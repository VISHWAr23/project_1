import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, Prisma } from '@ims/database';
import {
  CreateGauzePadPinningBatchDto,
  UpdateGauzePadPinningStatusDto,
} from './dto/create-batch.dto';
import { QueryGauzePadPinningBatchesDto } from './dto/query.dto';

@Injectable()
export class GauzePadPinningService {
  /**
   * Generates a unique, sequentially padded batch number (e.g. GPP-2026-001)
   */
  private async generateBatchNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `GPP-${year}-`;
    const count = await prisma.gauzePadPinningBatch.count({
      where: {
        batchNumber: {
          startsWith: prefix,
        },
      },
    });
    const nextSeq = String(count + 1).padStart(3, '0');
    let candidate = `${prefix}${nextSeq}`;

    const exists = await prisma.gauzePadPinningBatch.findUnique({
      where: { batchNumber: candidate },
    });

    if (exists) {
      candidate = `${prefix}${Date.now().toString().slice(-4)}`;
    }
    return candidate;
  }

  /**
   * Helper: Total length in linear meters
   */
  calculateTotalLength(
    materialType: 'ROLL' | 'PIECES',
    rollLength?: number,
    pieceLength?: number,
    pieceLengthUom: string = 'cm',
    pieceCount?: number,
  ): number {
    if (materialType === 'ROLL') {
      return Number(rollLength || 0);
    } else {
      let lengthM = Number(pieceLength || 0);
      if (pieceLengthUom === 'cm') lengthM = lengthM / 100;
      const count = Number(pieceCount || 0);
      return Number((count * lengthM).toFixed(3));
    }
  }

  /**
   * Helper: Dual division operation -> (totalLength / pinningSize) / cuttingSize
   */
  calculateOutputQuantity(
    totalLengthInMeters: number,
    pinningSize: number,
    pinningSizeUom: string = 'cm',
    cuttingSize: number = 1,
  ): { piecesAfterPinning: number; outputQuantity: number; remnantLength: number } {
    let sizeM = Number(pinningSize || 0);
    if (pinningSizeUom === 'cm') sizeM = sizeM / 100;
    const cuts = Number(cuttingSize || 1);

    if (sizeM <= 0 || totalLengthInMeters <= 0 || cuts <= 0) {
      return { piecesAfterPinning: 0, outputQuantity: 0, remnantLength: 0 };
    }

    const piecesAfterPinning = Math.floor(totalLengthInMeters / sizeM);
    const outputQuantity = Math.floor(piecesAfterPinning / cuts);
    const remnantLength = Number((totalLengthInMeters % (sizeM * cuts)).toFixed(3));

    return { piecesAfterPinning, outputQuantity, remnantLength };
  }

  /**
   * Creates a new Gauze Pad Pinning production batch
   */
  async create(dto: CreateGauzePadPinningBatchDto, userId?: string) {
    const batchNumber = dto.batchNumber?.trim() || (await this.generateBatchNumber());

    const totalLength = this.calculateTotalLength(
      dto.materialType,
      dto.rollLength,
      dto.pieceLength,
      dto.pieceLengthUom || 'cm',
      dto.pieceCount,
    );

    if (totalLength <= 0) {
      throw new BadRequestException('Total calculated fabric length must be greater than zero');
    }

    const { outputQuantity, remnantLength } = this.calculateOutputQuantity(
      totalLength,
      dto.pinningSize,
      dto.pinningSizeUom || 'cm',
      dto.cuttingSize,
    );

    const salaryRatePerPiece = Number(dto.salaryRatePerPiece || 0);
    const totalSalary = Number((outputQuantity * salaryRatePerPiece).toFixed(2));
    const workerIds = dto.workerIds || [];
    const workerCount = Math.max(1, workerIds.length);
    const workerSalaryShare = Number((totalSalary / workerCount).toFixed(2));

    const batch = await prisma.gauzePadPinningBatch.create({
      data: {
        batchNumber,
        productName: dto.productName.trim(),
        materialType: dto.materialType,

        rollWidth: dto.rollWidth !== undefined ? dto.rollWidth : null,
        rollWidthUom: dto.rollWidthUom || 'cm',
        rollLength: dto.rollLength !== undefined ? dto.rollLength : null,
        rollLengthUom: dto.rollLengthUom || 'm',

        pieceLength: dto.pieceLength !== undefined ? dto.pieceLength : null,
        pieceLengthUom: dto.pieceLengthUom || 'cm',
        pieceWidth: dto.pieceWidth !== undefined ? dto.pieceWidth : null,
        pieceWidthUom: dto.pieceWidthUom || 'cm',
        pieceCount: dto.pieceCount !== undefined ? dto.pieceCount : null,

        totalLength,
        pinningSize: dto.pinningSize,
        pinningSizeUom: dto.pinningSizeUom || 'cm',
        cuttingSize: dto.cuttingSize,
        outputQuantity,
        remnantLength,

        salaryRatePerPiece,
        totalSalary,
        workerSalaryShare,

        // Workforce & Assignment
        executorType: dto.executorType,
        workerIds,
        workerNames: dto.workerNames?.trim() || null,
        companyId: dto.companyId || null,
        companyName: dto.companyName?.trim() || null,
        deliveryPerson: dto.deliveryPerson?.trim() || null,
        vehicleNumber: dto.vehicleNumber?.trim() || null,

        // Notebook fields
        dcNo: dto.dcNo?.trim() || null,
        dcDate: dto.dcDate ? new Date(dto.dcDate) : null,
        ends: dto.ends?.trim() || null,
        itemType: dto.itemType?.trim() || null,

        // Lifecycle
        status: 'IN_PROGRESS',
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        notes: dto.notes?.trim() || null,
      },
    });

    return this.formatBatch(batch);
  }

  /**
   * Retrieves all batches with filters, search, and pagination
   */
  async findAll(query: QueryGauzePadPinningBatchesDto) {
    const { search, status, materialType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GauzePadPinningBatchWhereInput = {};

    if (status && status.trim()) {
      where.status = status.trim();
    }

    if (materialType && materialType.trim()) {
      where.materialType = materialType.trim();
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { batchNumber: { contains: q, mode: 'insensitive' } },
        { productName: { contains: q, mode: 'insensitive' } },
        { workerNames: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { dcNo: { contains: q, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields = [
      'createdAt',
      'batchNumber',
      'productName',
      'materialType',
      'totalLength',
      'outputQuantity',
      'totalSalary',
      'startDate',
      'status',
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.gauzePadPinningBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      prisma.gauzePadPinningBatch.count({ where }),
    ]);

    return {
      items: items.map((b) => this.formatBatch(b)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves a single batch by ID
   */
  async findOne(id: string) {
    const batch = await prisma.gauzePadPinningBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException(`Gauze Pad Pinning batch with ID "${id}" not found`);
    }

    return this.formatBatch(batch);
  }

  /**
   * Updates batch status
   */
  async updateStatus(id: string, dto: UpdateGauzePadPinningStatusDto) {
    const existing = await this.findOne(id);

    const updateData: Prisma.GauzePadPinningBatchUpdateInput = {
      status: dto.status,
    };

    if (dto.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.completionDate = new Date();
    } else if (dto.status !== 'COMPLETED' && existing.status === 'COMPLETED') {
      updateData.completionDate = null;
    }

    const updated = await prisma.gauzePadPinningBatch.update({
      where: { id },
      data: updateData,
    });
    return this.formatBatch(updated);
  }

  private formatBatch(b: any) {
    if (!b) return b;
    return {
      ...b,
      totalLength: b.totalLength !== null && b.totalLength !== undefined ? Number(b.totalLength) : 0,
      salaryRatePerPiece: b.salaryRatePerPiece !== null && b.salaryRatePerPiece !== undefined ? Number(b.salaryRatePerPiece) : 0,
      totalSalary: b.totalSalary !== null && b.totalSalary !== undefined ? Number(b.totalSalary) : 0,
      workerSalaryShare: b.workerSalaryShare !== null && b.workerSalaryShare !== undefined ? Number(b.workerSalaryShare) : 0,
      remnantLength: b.remnantLength !== null && b.remnantLength !== undefined ? Number(b.remnantLength) : 0,
      rollLength: b.rollLength !== null && b.rollLength !== undefined ? Number(b.rollLength) : null,
      rollWidth: b.rollWidth !== null && b.rollWidth !== undefined ? Number(b.rollWidth) : null,
      pieceLength: b.pieceLength !== null && b.pieceLength !== undefined ? Number(b.pieceLength) : null,
      pieceWidth: b.pieceWidth !== null && b.pieceWidth !== undefined ? Number(b.pieceWidth) : null,
    };
  }

  /**
   * Deletes a batch record
   */
  async delete(id: string) {
    await this.findOne(id);
    await prisma.gauzePadPinningBatch.delete({ where: { id } });
    return { success: true, message: 'Gauze Pad Pinning batch removed successfully' };
  }

  /**
   * Aggregate dashboard statistics
   */
  async getDashboardStats() {
    const totalBatches = await prisma.gauzePadPinningBatch.count();

    if (totalBatches === 0) {
      return {
        totalBatches: 0,
        activeBatches: 0,
        completedBatches: 0,
        totalOutputPads: 0,
        totalFabricMeters: 0,
        totalSalaryPaid: 0,
      };
    }

    const [activeBatches, completedBatches, aggregates] = await Promise.all([
      prisma.gauzePadPinningBatch.count({
        where: { status: 'IN_PROGRESS' },
      }),
      prisma.gauzePadPinningBatch.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.gauzePadPinningBatch.aggregate({
        _sum: {
          outputQuantity: true,
          totalLength: true,
          totalSalary: true,
        },
      }),
    ]);

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      totalOutputPads: aggregates._sum.outputQuantity || 0,
      totalFabricMeters: Number((Number(aggregates._sum.totalLength) || 0).toFixed(2)),
      totalSalaryPaid: Number((Number(aggregates._sum.totalSalary) || 0).toFixed(2)),
    };
  }
}
