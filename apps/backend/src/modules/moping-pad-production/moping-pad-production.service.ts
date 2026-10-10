import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma, Prisma } from '@ims/database';
import {
  CreateMopingPadBatchDto,
  UpdateMopingPadProgressDto,
  UpdateMopingPadStatusDto,
} from './dto/create-batch.dto';
import { QueryMopingPadBatchesDto } from './dto/query.dto';

@Injectable()
export class MopingPadProductionService {
  /**
   * Generates a unique, sequentially padded batch number (e.g. MPP-2026-001)
   */
  private async generateBatchNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MPP-${year}-`;
    const count = await prisma.mopingPadProductionBatch.count({
      where: {
        batchNumber: {
          startsWith: prefix,
        },
      },
    });
    const nextSeq = String(count + 1).padStart(3, '0');
    let candidate = `${prefix}${nextSeq}`;

    // Ensure uniqueness
    const exists = await prisma.mopingPadProductionBatch.findUnique({
      where: { batchNumber: candidate },
    });

    if (exists) {
      candidate = `${prefix}${Date.now().toString().slice(-4)}`;
    }
    return candidate;
  }

  /**
   * Creates a new Moping Pad production batch with complete metric calculations
   */
  async create(dto: CreateMopingPadBatchDto, userId?: string) {
    const batchNumber = dto.batchNumber?.trim() || (await this.generateBatchNumber());

    // Calculate total linear meters from raw material inputs
    let totalLength = 0;
    if (dto.materialType === 'ROLL') {
      totalLength = Number(dto.rollLength || 0);
    } else {
      const pieceLenInM =
        dto.pieceLengthUom === 'cm'
          ? Number(dto.pieceLength || 0) / 100
          : Number(dto.pieceLength || 0);
      totalLength = Number(dto.pieceCount || 0) * pieceLenInM;
    }

    // Standardize pinning size into meters
    const pinningSizeInMeters =
      dto.pinningSizeUom === 'cm'
        ? Number(dto.pinningSize || 0) / 100
        : Number(dto.pinningSize || 0);

    if (pinningSizeInMeters <= 0) {
      throw new BadRequestException('Pinning size must be greater than zero');
    }

    // Calculate theoretical outputs and remnant
    const outputQuantity = Math.floor(totalLength / pinningSizeInMeters);
    const remnantLength = Number((totalLength % pinningSizeInMeters).toFixed(3));
    const completedQuantity = Number(dto.completedQuantity || 0);
    const pendingQuantity = Math.max(0, outputQuantity - completedQuantity);
    const completionPercentage =
      outputQuantity > 0 ? Number(((completedQuantity / outputQuantity) * 100).toFixed(2)) : 0;

    const initialStatus =
      completedQuantity >= outputQuantity && outputQuantity > 0
        ? 'COMPLETED'
        : 'IN_PROGRESS';

    const batch = await prisma.mopingPadProductionBatch.create({
      data: {
        batchNumber,
        productName: dto.productName.trim(),
        materialType: dto.materialType,

        // Roll dimensions
        rollWidth: dto.rollWidth !== undefined ? dto.rollWidth : null,
        rollWidthUom: dto.rollWidthUom || 'cm',
        rollLength: dto.rollLength !== undefined ? dto.rollLength : null,
        rollLengthUom: dto.rollLengthUom || 'm',

        // Pieces dimensions
        pieceLength: dto.pieceLength !== undefined ? dto.pieceLength : null,
        pieceLengthUom: dto.pieceLengthUom || 'cm',
        pieceWidth: dto.pieceWidth !== undefined ? dto.pieceWidth : null,
        pieceWidthUom: dto.pieceWidthUom || 'cm',
        pieceCount: dto.pieceCount !== undefined ? dto.pieceCount : null,

        // Computed metrics
        totalLength,
        pinningSize: dto.pinningSize,
        pinningSizeUom: dto.pinningSizeUom || 'm',
        outputQuantity,
        remnantLength,
        completedQuantity,
        pendingQuantity,
        completionPercentage,

        // Workforce & Dispatch
        executorType: dto.executorType,
        workerIds: dto.workerIds || [],
        workerNames: dto.workerNames?.trim() || null,
        companyId: dto.companyId || null,
        companyName: dto.companyName?.trim() || null,
        deliveryPerson: dto.deliveryPerson?.trim() || null,
        vehicleNumber: dto.vehicleNumber?.trim() || null,

        // Notebook / Job Work fields
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
   * Retrieves all batches with search, status filtering, and pagination
   */
  async findAll(query: QueryMopingPadBatchesDto) {
    const { search, status, materialType, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MopingPadProductionBatchWhereInput = {};

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
      'totalLength',
      'outputQuantity',
      'completedQuantity',
      'completionPercentage',
      'startDate',
      'status',
    ];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await Promise.all([
      prisma.mopingPadProductionBatch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      prisma.mopingPadProductionBatch.count({ where }),
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
    const batch = await prisma.mopingPadProductionBatch.findUnique({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException(`Moping pad production batch with ID "${id}" not found`);
    }

    return this.formatBatch(batch);
  }

  /**
   * Updates batch status
   */
  async updateStatus(id: string, dto: UpdateMopingPadStatusDto) {
    const existing = await this.findOne(id);

    const updateData: Prisma.MopingPadProductionBatchUpdateInput = {
      status: dto.status,
    };

    if (dto.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.completionDate = new Date();
      updateData.completedQuantity = existing.outputQuantity;
      updateData.pendingQuantity = 0;
      updateData.completionPercentage = 100;
    }

    const updated = await prisma.mopingPadProductionBatch.update({
      where: { id },
      data: updateData,
    });
    return this.formatBatch(updated);
  }

  /**
   * Updates batch progress (completed pads quantity & wastage notes)
   */
  async updateProgress(id: string, dto: UpdateMopingPadProgressDto) {
    const existing = await this.findOne(id);

    const completed = Math.min(dto.completedQuantity, existing.outputQuantity);
    const pending = Math.max(0, existing.outputQuantity - completed);
    const completionPercentage =
      existing.outputQuantity > 0
        ? Number(((completed / existing.outputQuantity) * 100).toFixed(2))
        : 0;

    let newStatus = dto.status || existing.status;
    let completionDate = existing.completionDate;

    if (completed >= existing.outputQuantity && existing.outputQuantity > 0) {
      newStatus = 'COMPLETED';
      completionDate = new Date();
    } else if (newStatus === 'COMPLETED' && completed < existing.outputQuantity) {
      newStatus = 'IN_PROGRESS';
      completionDate = null;
    }

    const updated = await prisma.mopingPadProductionBatch.update({
      where: { id },
      data: {
        completedQuantity: completed,
        pendingQuantity: pending,
        completionPercentage,
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
      totalLength: b.totalLength !== null && b.totalLength !== undefined ? Number(b.totalLength) : 0,
      remnantLength: b.remnantLength !== null && b.remnantLength !== undefined ? Number(b.remnantLength) : 0,
      pinningSize: b.pinningSize !== null && b.pinningSize !== undefined ? Number(b.pinningSize) : 0,
      completionPercentage: b.completionPercentage !== null && b.completionPercentage !== undefined ? Number(b.completionPercentage) : 0,
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
    await prisma.mopingPadProductionBatch.delete({ where: { id } });
    return { success: true, message: 'Batch removed successfully' };
  }

  /**
   * Aggregate dashboard statistics for Moping Pad production
   */
  async getDashboardStats() {
    const totalBatches = await prisma.mopingPadProductionBatch.count();

    if (totalBatches === 0) {
      return {
        totalBatches: 0,
        activeBatches: 0,
        completedBatches: 0,
        totalOutputPads: 0,
        totalCompletedPads: 0,
        totalFabricMeters: 0,
      };
    }

    const [activeBatches, completedBatches, aggregates] = await Promise.all([
      prisma.mopingPadProductionBatch.count({
        where: { status: 'IN_PROGRESS' },
      }),
      prisma.mopingPadProductionBatch.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.mopingPadProductionBatch.aggregate({
        _sum: {
          outputQuantity: true,
          completedQuantity: true,
          totalLength: true,
        },
      }),
    ]);

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      totalOutputPads: aggregates._sum.outputQuantity || 0,
      totalCompletedPads: aggregates._sum.completedQuantity || 0,
      totalFabricMeters: Number((Number(aggregates._sum.totalLength) || 0).toFixed(2)),
    };
  }
}
