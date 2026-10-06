import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, Prisma } from '@ims/database';
import {
  CreatePillowBedsheetBatchDto,
  UpdatePillowBedsheetProgressDto,
  UpdatePillowBedsheetStatusDto,
} from './dto/create-batch.dto';
import { QueryPillowBedsheetBatchesDto } from './dto/query.dto';

@Injectable()
export class PillowBedsheetProductionService {
  /**
   * Generates a unique, sequentially padded batch number (e.g. PBS-2026-001)
   */
  private async generateBatchNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PBS-${year}-`;
    const count = await prisma.pillowBedsheetBatch.count({
      where: {
        batchNumber: {
          startsWith: prefix,
        },
      },
    });
    const nextSeq = String(count + 1).padStart(3, '0');
    let candidate = `${prefix}${nextSeq}`;

    const exists = await prisma.pillowBedsheetBatch.findUnique({
      where: { batchNumber: candidate },
    });

    if (exists) {
      candidate = `${prefix}${Date.now().toString().slice(-4)}`;
    }
    return candidate;
  }

  /**
   * Helper: Converts roll width to meters
   */
  convertWidthToMeters(width: number, uom: string = 'cm'): number {
    if (uom === 'cm') return width / 100;
    if (uom === 'inch') return width * 0.0254;
    return width;
  }

  /**
   * Helper: Calculates total length in meters from fabric weight (KG), GSM, and width (meters)
   * Formula: Total Length (m) = ((Weight in KG * 1000) / Width in Meters) / GSM
   */
  calculateTotalLength(weightKg: number, gsm: number, widthInMeters: number): number {
    if (gsm <= 0 || widthInMeters <= 0 || weightKg <= 0) return 0;
    const totalLength = ((weightKg * 1000) / widthInMeters) / gsm;
    return Number(totalLength.toFixed(3));
  }

  /**
   * Helper: Calculates output units and remnant length
   */
  calculateOutput(
    productType: 'BED_SHEET' | 'PILLOW_COVER',
    totalLength: number,
    bedSheetLength?: number,
    bedSheetLengthUom: string = 'm',
    pillowCoverCuttingLength?: number,
    pillowCoverCuttingLengthUom: string = 'm',
    cuttingCount: number = 1,
  ): { outputQuantity: number; remnantLength: number } {
    if (totalLength <= 0) {
      return { outputQuantity: 0, remnantLength: 0 };
    }

    if (productType === 'BED_SHEET') {
      let pieceLengthM = Number(bedSheetLength || 0);
      if (bedSheetLengthUom === 'cm') pieceLengthM = pieceLengthM / 100;
      if (bedSheetLengthUom === 'inch') pieceLengthM = pieceLengthM * 0.0254;

      if (pieceLengthM <= 0) return { outputQuantity: 0, remnantLength: totalLength };

      const outputQuantity = Math.floor(totalLength / pieceLengthM);
      const remnantLength = Number((totalLength % pieceLengthM).toFixed(3));
      return { outputQuantity, remnantLength };
    } else {
      let cutLengthM = Number(pillowCoverCuttingLength || 0);
      if (pillowCoverCuttingLengthUom === 'cm') cutLengthM = cutLengthM / 100;
      if (pillowCoverCuttingLengthUom === 'inch') cutLengthM = cutLengthM * 0.0254;

      if (cutLengthM <= 0) return { outputQuantity: 0, remnantLength: totalLength };

      const cuts = Math.floor(totalLength / cutLengthM);
      const multiplier = Math.max(1, Number(cuttingCount || 1));
      const outputQuantity = cuts * multiplier;
      const remnantLength = Number((totalLength % cutLengthM).toFixed(3));
      return { outputQuantity, remnantLength };
    }
  }

  /**
   * Creates a new Pillow & Bedsheet production batch
   */
  async create(dto: CreatePillowBedsheetBatchDto, userId?: string) {
    const batchNumber = dto.batchNumber?.trim() || (await this.generateBatchNumber());

    const rollWidthInMeters = this.convertWidthToMeters(dto.rollWidth, dto.rollWidthUom || 'cm');
    if (rollWidthInMeters <= 0) {
      throw new BadRequestException('Roll width must be greater than zero');
    }

    const totalLength = this.calculateTotalLength(dto.weightKg, dto.gsm, rollWidthInMeters);
    if (totalLength <= 0) {
      throw new BadRequestException('Calculated fabric length must be greater than zero');
    }

    const { outputQuantity, remnantLength } = this.calculateOutput(
      dto.productType,
      totalLength,
      dto.bedSheetLength,
      dto.bedSheetLengthUom || 'm',
      dto.pillowCoverCuttingLength,
      dto.pillowCoverCuttingLengthUom || 'm',
      dto.cuttingCount || 1,
    );

    const completedQuantity = Number(dto.completedQuantity || 0);
    const pendingQuantity = Math.max(0, outputQuantity - completedQuantity);
    const completionPercentage = outputQuantity > 0 ? Number(((completedQuantity / outputQuantity) * 100).toFixed(2)) : 0;

    const salaryRatePerUnit = Number(dto.salaryRatePerUnit || 0);
    const totalSalary = Number((outputQuantity * salaryRatePerUnit).toFixed(2));
    const workerIds = dto.workerIds || [];
    const workerCount = Math.max(1, workerIds.length);
    const workerSalaryShare = Number((totalSalary / workerCount).toFixed(2));

    const initialStatus = completedQuantity >= outputQuantity && outputQuantity > 0 ? 'COMPLETED' : 'IN_PROGRESS';

    const batch = await prisma.pillowBedsheetBatch.create({
      data: {
        batchNumber,
        productName: dto.productName.trim(),
        productType: dto.productType,
        weightKg: dto.weightKg,
        gsm: dto.gsm,
        rollWidth: dto.rollWidth,
        rollWidthUom: dto.rollWidthUom || 'cm',
        rollWidthInMeters,
        totalLength,

        bedSheetLength: dto.bedSheetLength !== undefined ? dto.bedSheetLength : null,
        bedSheetLengthUom: dto.bedSheetLengthUom || 'm',

        pillowCoverCuttingLength: dto.pillowCoverCuttingLength !== undefined ? dto.pillowCoverCuttingLength : null,
        pillowCoverCuttingLengthUom: dto.pillowCoverCuttingLengthUom || 'm',
        cuttingCount: dto.cuttingCount !== undefined ? dto.cuttingCount : 1,

        outputQuantity,
        remnantLength,
        completedQuantity,
        pendingQuantity,
        completionPercentage,

        salaryRatePerUnit,
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
        status: initialStatus,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        completionDate: initialStatus === 'COMPLETED' ? new Date() : null,
        notes: dto.notes?.trim() || null,
      },
    });

    return batch;
  }

  /**
   * Retrieves all batches with filters, search, and pagination
   */
  async findAll(query: QueryPillowBedsheetBatchesDto) {
    const { search, status, productType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PillowBedsheetBatchWhereInput = {};

    if (status && status.trim()) {
      where.status = status.trim();
    }

    if (productType && productType.trim()) {
      where.productType = productType.trim();
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
      'productType',
      'weightKg',
      'totalLength',
      'outputQuantity',
      'completedQuantity',
      'completionPercentage',
      'totalSalary',
      'startDate',
      'status',
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.pillowBedsheetBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      prisma.pillowBedsheetBatch.count({ where }),
    ]);

    return {
      items,
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
    const batch = await prisma.pillowBedsheetBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException(`Pillow & Bedsheet batch with ID "${id}" not found`);
    }

    return batch;
  }

  /**
   * Updates batch progress (completed pieces, completion percentage, pending quantity)
   */
  async updateProgress(id: string, dto: UpdatePillowBedsheetProgressDto) {
    const existing = await this.findOne(id);

    const completedQuantity = dto.completedQuantity;
    const pendingQuantity = Math.max(0, existing.outputQuantity - completedQuantity);
    const completionPercentage =
      existing.outputQuantity > 0
        ? Number(((completedQuantity / existing.outputQuantity) * 100).toFixed(2))
        : 0;

    let newStatus = dto.status || existing.status;
    let completionDate = existing.completionDate;

    if (completedQuantity >= existing.outputQuantity && existing.outputQuantity > 0) {
      newStatus = 'COMPLETED';
      completionDate = new Date();
    } else if (newStatus === 'COMPLETED' && existing.status !== 'COMPLETED') {
      completionDate = new Date();
    } else if (newStatus !== 'COMPLETED' && existing.status === 'COMPLETED') {
      completionDate = null;
    }

    return prisma.pillowBedsheetBatch.update({
      where: { id },
      data: {
        completedQuantity,
        pendingQuantity,
        completionPercentage,
        status: newStatus,
        completionDate,
        notes: dto.notes !== undefined ? dto.notes?.trim() || null : existing.notes,
      },
    });
  }

  /**
   * Updates batch status
   */
  async updateStatus(id: string, dto: UpdatePillowBedsheetStatusDto) {
    const existing = await this.findOne(id);

    const updateData: Prisma.PillowBedsheetBatchUpdateInput = {
      status: dto.status,
    };

    if (dto.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.completionDate = new Date();
    } else if (dto.status !== 'COMPLETED' && existing.status === 'COMPLETED') {
      updateData.completionDate = null;
    }

    return prisma.pillowBedsheetBatch.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deletes a batch record
   */
  async delete(id: string) {
    await this.findOne(id);
    await prisma.pillowBedsheetBatch.delete({ where: { id } });
    return { success: true, message: 'Pillow & Bedsheet batch removed successfully' };
  }

  /**
   * Aggregate dashboard statistics
   */
  async getDashboardStats() {
    const totalBatches = await prisma.pillowBedsheetBatch.count();

    if (totalBatches === 0) {
      return {
        totalBatches: 0,
        activeBatches: 0,
        completedBatches: 0,
        totalBedSheets: 0,
        totalBedSheetsOutput: 0,
        totalPillowCovers: 0,
        totalPillowCoversOutput: 0,
        totalFabricKg: 0,
        totalLengthMeters: 0,
        totalSalaryPaid: 0,
        totalSalaryDisbursed: 0,
      };
    }

    const [activeBatches, completedBatches, aggregates, bedSheetAgg, pillowCoverAgg] = await Promise.all([
      prisma.pillowBedsheetBatch.count({
        where: { status: 'IN_PROGRESS' },
      }),
      prisma.pillowBedsheetBatch.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.pillowBedsheetBatch.aggregate({
        _sum: {
          weightKg: true,
          totalLength: true,
          totalSalary: true,
          completedQuantity: true,
        },
      }),
      prisma.pillowBedsheetBatch.aggregate({
        where: { productType: 'BED_SHEET' },
        _sum: { outputQuantity: true },
      }),
      prisma.pillowBedsheetBatch.aggregate({
        where: { productType: 'PILLOW_COVER' },
        _sum: { outputQuantity: true },
      }),
    ]);

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      totalBedSheets: bedSheetAgg._sum.outputQuantity || 0,
      totalBedSheetsOutput: bedSheetAgg._sum.outputQuantity || 0,
      totalPillowCovers: pillowCoverAgg._sum.outputQuantity || 0,
      totalPillowCoversOutput: pillowCoverAgg._sum.outputQuantity || 0,
      totalFabricKg: Number((Number(aggregates._sum.weightKg) || 0).toFixed(2)),
      totalLengthMeters: Number((Number(aggregates._sum.totalLength) || 0).toFixed(2)),
      totalSalaryPaid: Number((Number(aggregates._sum.totalSalary) || 0).toFixed(2)),
      totalSalaryDisbursed: Number((Number(aggregates._sum.totalSalary) || 0).toFixed(2)),
    };
  }
}
