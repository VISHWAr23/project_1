import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, Prisma } from '@ims/database';
import {
  CreateDryingBatchDto,
  UpdateDryingProgressDto,
  UpdateDryingStatusDto,
} from './dto/create-batch.dto';
import { QueryDryingBatchesDto } from './dto/query.dto';

@Injectable()
export class DryingService {
  /**
   * Generates a unique, sequentially padded batch number (e.g. DRY-2026-001)
   */
  private async generateBatchNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `DRY-${year}-`;
    const count = await prisma.dryingBatch.count({
      where: {
        batchNumber: {
          startsWith: prefix,
        },
      },
    });
    const nextSeq = String(count + 1).padStart(3, '0');
    let candidate = `${prefix}${nextSeq}`;

    const exists = await prisma.dryingBatch.findUnique({
      where: { batchNumber: candidate },
    });

    if (exists) {
      candidate = `${prefix}${Date.now().toString().slice(-4)}`;
    }
    return candidate;
  }

  /**
   * Creates a new Drying production batch with piece-to-meter and salary computations
   */
  async create(dto: CreateDryingBatchDto, userId?: string) {
    const batchNumber = dto.batchNumber?.trim() || (await this.generateBatchNumber());

    const totalPieces = Number(dto.totalPieces || 0);
    if (totalPieces <= 0) {
      throw new BadRequestException('Total pieces must be greater than zero');
    }

    const pieceLenInM =
      dto.pieceLengthUom === 'cm'
        ? Number(dto.pieceLength || 0) / 100
        : Number(dto.pieceLength || 0);

    if (pieceLenInM <= 0) {
      throw new BadRequestException('Piece length must be greater than zero');
    }

    const totalLength = Number((totalPieces * pieceLenInM).toFixed(3));
    const completedPieces = Number(dto.completedPieces || 0);
    const pendingPieces = Math.max(0, totalPieces - completedPieces);
    const completedLength = Number((completedPieces * pieceLenInM).toFixed(3));
    const completionPercentage =
      totalPieces > 0 ? Number(((completedPieces / totalPieces) * 100).toFixed(2)) : 0;

    const salaryRatePerMeter =
      dto.salaryRatePerMeter !== undefined ? Number(dto.salaryRatePerMeter) : 0.1;
    const totalSalary = Number((totalLength * salaryRatePerMeter).toFixed(2));
    const earnedSalary = Number((completedLength * salaryRatePerMeter).toFixed(2));

    const workerIds = dto.workerIds || [];
    const workerCount = Math.max(1, workerIds.length);
    const workerSalaryShare = Number((earnedSalary / workerCount).toFixed(2));

    const initialStatus =
      completedPieces >= totalPieces && totalPieces > 0 ? 'COMPLETED' : 'IN_PROGRESS';

    const batch = await prisma.dryingBatch.create({
      data: {
        batchNumber,
        productName: dto.productName.trim(),
        totalPieces,
        pieceLength: dto.pieceLength,
        pieceLengthUom: dto.pieceLengthUom || 'm',
        ...(dto.pieceWidth !== undefined ? { pieceWidth: dto.pieceWidth } : {}),
        pieceWidthUom: dto.pieceWidthUom || 'cm',
        totalLength,
        completedPieces,
        pendingPieces,
        completedLength,
        completionPercentage,
        salaryRatePerMeter,
        totalSalary,
        earnedSalary,
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
        outputProductWidth: dto.outputProductWidth?.trim() || null,

        // Status & Lifecycle
        status: initialStatus,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
        completionDate: initialStatus === 'COMPLETED' ? new Date() : null,
        notes: dto.notes?.trim() || null,
      },
    });

    return this.formatBatch(batch);
  }

  /**
   * Retrieves all drying batches with search, status filtering, and pagination
   */
  async findAll(query: QueryDryingBatchesDto) {
    const { search, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DryingBatchWhereInput = {};

    if (status && status.trim()) {
      where.status = status.trim();
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
      'totalPieces',
      'totalLength',
      'completedPieces',
      'completionPercentage',
      'earnedSalary',
      'startDate',
      'status',
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.dryingBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      prisma.dryingBatch.count({ where }),
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
   * Retrieves a single drying batch by ID
   */
  async findOne(id: string) {
    const batch = await prisma.dryingBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException(`Drying batch with ID "${id}" not found`);
    }

    return this.formatBatch(batch);
  }

  /**
   * Updates batch status
   */
  async updateStatus(id: string, dto: UpdateDryingStatusDto) {
    const existing = await this.findOne(id);

    const updateData: Prisma.DryingBatchUpdateInput = {
      status: dto.status,
    };

    if (dto.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      const pieceLenInM =
        existing.pieceLengthUom === 'cm'
          ? Number(existing.pieceLength) / 100
          : Number(existing.pieceLength);
      const totalLen = Number(existing.totalLength);
      const earnedSalary = Number((totalLen * Number(existing.salaryRatePerMeter)).toFixed(2));
      const workerCount = Math.max(1, (existing.workerIds || []).length);

      updateData.completionDate = new Date();
      updateData.completedPieces = existing.totalPieces;
      updateData.pendingPieces = 0;
      updateData.completedLength = totalLen;
      updateData.completionPercentage = 100;
      updateData.earnedSalary = earnedSalary;
      updateData.workerSalaryShare = Number((earnedSalary / workerCount).toFixed(2));
    }

    const updated = await prisma.dryingBatch.update({
      where: { id },
      data: updateData,
    });
    return this.formatBatch(updated);
  }

  /**
   * Updates drying progress (completed pieces count & notes)
   */
  async updateProgress(id: string, dto: UpdateDryingProgressDto) {
    const existing = await this.findOne(id);

    const completed = Math.min(dto.completedPieces, existing.totalPieces);
    const pending = Math.max(0, existing.totalPieces - completed);

    const pieceLenInM =
      existing.pieceLengthUom === 'cm'
        ? Number(existing.pieceLength) / 100
        : Number(existing.pieceLength);

    const completedLength = Number((completed * pieceLenInM).toFixed(3));
    const completionPercentage =
      existing.totalPieces > 0
        ? Number(((completed / existing.totalPieces) * 100).toFixed(2))
        : 0;

    const earnedSalary = Number(
      (completedLength * Number(existing.salaryRatePerMeter)).toFixed(2),
    );
    const workerCount = Math.max(1, (existing.workerIds || []).length);
    const workerSalaryShare = Number((earnedSalary / workerCount).toFixed(2));

    let newStatus = dto.status || existing.status;
    let completionDate = existing.completionDate;

    if (completed >= existing.totalPieces && existing.totalPieces > 0) {
      newStatus = 'COMPLETED';
      completionDate = new Date();
    } else if (newStatus === 'COMPLETED' && completed < existing.totalPieces) {
      newStatus = 'IN_PROGRESS';
      completionDate = null;
    }

    const updated = await prisma.dryingBatch.update({
      where: { id },
      data: {
        completedPieces: completed,
        pendingPieces: pending,
        completedLength,
        completionPercentage,
        earnedSalary,
        workerSalaryShare,
        status: newStatus,
        completionDate,
        notes: dto.notes !== undefined ? dto.notes : existing.notes,
      },
    });
    return this.formatBatch(updated);
  }

  private formatBatch(b: any) {
    if (!b) return b;
    return {
      ...b,
      pieceLength: b.pieceLength !== null && b.pieceLength !== undefined ? Number(b.pieceLength) : 0,
      pieceWidth: b.pieceWidth !== null && b.pieceWidth !== undefined ? Number(b.pieceWidth) : null,
      totalLength: b.totalLength !== null && b.totalLength !== undefined ? Number(b.totalLength) : 0,
      completedLength: b.completedLength !== null && b.completedLength !== undefined ? Number(b.completedLength) : 0,
      completionPercentage: b.completionPercentage !== null && b.completionPercentage !== undefined ? Number(b.completionPercentage) : 0,
      salaryRatePerMeter: b.salaryRatePerMeter !== null && b.salaryRatePerMeter !== undefined ? Number(b.salaryRatePerMeter) : 0,
      totalSalary: b.totalSalary !== null && b.totalSalary !== undefined ? Number(b.totalSalary) : 0,
      earnedSalary: b.earnedSalary !== null && b.earnedSalary !== undefined ? Number(b.earnedSalary) : 0,
      workerSalaryShare: b.workerSalaryShare !== null && b.workerSalaryShare !== undefined ? Number(b.workerSalaryShare) : 0,
    };
  }

  /**
   * Deletes a drying batch record
   */
  async delete(id: string) {
    await this.findOne(id);
    await prisma.dryingBatch.delete({ where: { id } });
    return { success: true, message: 'Drying batch removed successfully' };
  }

  /**
   * Aggregate dashboard statistics for Drying production
   */
  async getDashboardStats() {
    const totalBatches = await prisma.dryingBatch.count();

    if (totalBatches === 0) {
      return {
        totalBatches: 0,
        activeBatches: 0,
        completedBatches: 0,
        totalPiecesProcessed: 0,
        totalMetersDried: 0,
        totalSalaryPaid: 0,
      };
    }

    const [activeBatches, completedBatches, aggregates] = await Promise.all([
      prisma.dryingBatch.count({
        where: { status: 'IN_PROGRESS' },
      }),
      prisma.dryingBatch.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.dryingBatch.aggregate({
        _sum: {
          completedPieces: true,
          completedLength: true,
          earnedSalary: true,
        },
      }),
    ]);

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      totalPiecesProcessed: aggregates._sum.completedPieces || 0,
      totalMetersDried: Number((Number(aggregates._sum.completedLength) || 0).toFixed(2)),
      totalSalaryPaid: Number((Number(aggregates._sum.earnedSalary) || 0).toFixed(2)),
    };
  }
}
