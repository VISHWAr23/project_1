import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { prisma, GauzeProductionStatus, TransactionType, Prisma } from '@ims/database';
import { CreateGauzeProductionBatchDto, UpdateGauzeProductionBatchDto } from './dto/create-batch.dto';
import { SendToBleachingDto } from './dto/send-bleaching.dto';
import { ReceiveBleachingDto } from './dto/receive-bleaching.dto';
import { AddProcessingOperationDto } from './dto/add-operation.dto';
import { CreatePackingEntryDto } from './dto/create-packing.dto';
import {
  CreateGauzeTypeDto,
  CreateGauzeSizeDto,
  CreateBleachingTypeDto,
  CreateGauzeOperationTypeDto,
} from './dto/master.dto';
import { GauzeBatchQueryDto } from './dto/query.dto';

@Injectable()
export class GauzeProductionService implements OnModuleInit {
  async onModuleInit() {
    await this.ensureDefaultMasters();
  }

  /**
   * Automatically ensure standard default master records exist
   */
  async ensureDefaultMasters() {
    try {
      const typeCount = await prisma.gauzeType.count();
      if (typeCount === 0) {
        await prisma.gauzeType.createMany({
          data: [
            { name: 'BP17 Medical Gauze', code: 'BP17', description: 'British Pharmacopoeia 17 threads/sq.cm absorbent gauze' },
            { name: 'Type 13 Light Gauze', code: 'TYPE-13L', description: '13 threads/sq.cm lightweight breathable gauze' },
            { name: 'Type 20 Standard Gauze', code: 'TYPE-20S', description: '20 threads/sq.cm heavy duty surgical gauze' },
          ],
        });
      }

      const sizeCount = await prisma.gauzeSize.count();
      if (sizeCount === 0) {
        await prisma.gauzeSize.createMany({
          data: [
            { name: '120 cm x 20 m', width: 120, widthUom: 'cm', length: 20, lengthUom: 'm', description: 'Standard bulk roll' },
            { name: '100 cm x 10 m', width: 100, widthUom: 'cm', length: 10, lengthUom: 'm', description: 'Medium roll' },
            { name: '90 cm x 10 m', width: 90, widthUom: 'cm', length: 10, lengthUom: 'm', description: 'Narrow than roll' },
          ],
        });
      }

      const bleachCount = await prisma.bleachingType.count();
      if (bleachCount === 0) {
        await prisma.bleachingType.createMany({
          data: [
            { name: 'Hydrogen Peroxide Bleaching', code: 'BLEACH-H2O2', description: 'Eco-friendly high-absorbency peroxide scouring' },
            { name: 'Kier Boiling & Bleaching', code: 'BLEACH-KIER', description: 'Pressurized caustic kier scouring & bleaching' },
            { name: 'Chemical Hypochlorite Bleaching', code: 'BLEACH-CL', description: 'Rapid chemical hypochlorite bleaching' },
          ],
        });
      }

      const opCount = await prisma.gauzeOperationType.count();
      if (opCount === 0) {
        await prisma.gauzeOperationType.createMany({
          data: [
            { name: 'Cutting', code: 'OP-CUT', sequence: 1, description: 'Slitting into desired widths & lengths' },
            { name: 'Folding', code: 'OP-FOLD', sequence: 2, description: 'Surgical edge folding & layering' },
            { name: 'Inspection & QC', code: 'OP-QC', sequence: 3, description: 'Quality inspection & defect removal' },
            { name: 'Rolling', code: 'OP-ROLL', sequence: 4, description: 'Core rolling for roller bandages' },
            { name: 'Other Processing', code: 'OP-OTH', sequence: 5, description: 'Secondary stitching or conversion' },
          ],
        });
      }
    } catch (e) {
      console.warn('Masters initialization check:', e);
    }
  }

  /**
   * Helper to generate unique serial numbers
   */
  async generateSequenceNumber(prefix: string, model: 'batch' | 'job' | 'receipt' | 'operation' | 'packing'): Promise<string> {
    const year = new Date().getFullYear();
    const fullPrefix = `${prefix}-${year}-`;
    let count = 0;

    if (model === 'batch') count = await prisma.gauzeProductionBatch.count();
    else if (model === 'job') count = await prisma.gauzeBleachingJob.count();
    else if (model === 'receipt') count = await prisma.gauzeBleachingReceipt.count();
    else if (model === 'operation') count = await prisma.gauzeProductionOperation.count();
    else if (model === 'packing') count = await prisma.gauzePackingEntry.count();

    const seq = String(count + 1).padStart(5, '0');
    let code = `${fullPrefix}${seq}`;

    // Verify collision safety
    let exists = true;
    let increment = count + 1;
    while (exists) {
      code = `${fullPrefix}${String(increment).padStart(5, '0')}`;
      if (model === 'batch') exists = !!(await prisma.gauzeProductionBatch.findUnique({ where: { batchNumber: code } }));
      else if (model === 'job') exists = !!(await prisma.gauzeBleachingJob.findUnique({ where: { jobNumber: code } }));
      else if (model === 'receipt') exists = !!(await prisma.gauzeBleachingReceipt.findUnique({ where: { receiptNumber: code } }));
      else if (model === 'operation') exists = !!(await prisma.gauzeProductionOperation.findUnique({ where: { operationNumber: code } }));
      else if (model === 'packing') exists = !!(await prisma.gauzePackingEntry.findUnique({ where: { packingNumber: code } }));
      increment++;
    }

    return code;
  }

  /**
   * Aggregated KPI Dashboard Metrics
   */
  async getDashboardStats() {
    const [
      totalBatches,
      activeBatches,
      sentToBleaching,
      inProcessing,
      readyForPacking,
      completedBatches,
      allBatches,
      bleachingJobs,
      bleachingReceipts,
      operations,
    ] = await Promise.all([
      prisma.gauzeProductionBatch.count(),
      prisma.gauzeProductionBatch.count({
        where: {
          status: {
            notIn: [GauzeProductionStatus.COMPLETED, GauzeProductionStatus.CANCELLED],
          },
        },
      }),
      prisma.gauzeProductionBatch.count({
        where: { status: GauzeProductionStatus.SENT_TO_BLEACHING },
      }),
      prisma.gauzeProductionBatch.count({
        where: { status: GauzeProductionStatus.IN_PROCESSING },
      }),
      prisma.gauzeProductionBatch.count({
        where: { status: GauzeProductionStatus.READY_FOR_PACKING },
      }),
      prisma.gauzeProductionBatch.count({
        where: { status: GauzeProductionStatus.COMPLETED },
      }),
      prisma.gauzeProductionBatch.findMany({
        select: { inputQuantity: true, currentQuantity: true },
      }),
      prisma.gauzeBleachingJob.findMany({
        select: { quantitySent: true, status: true, vendor: { select: { companyName: true } } },
      }),
      prisma.gauzeBleachingReceipt.findMany({
        select: { quantityReceived: true, wastageQuantity: true, rejectedQuantity: true },
      }),
      prisma.gauzeProductionOperation.findMany({
        select: { wastageQuantity: true, rejectedQuantity: true },
      }),
    ]);

    // Calculate total material with vendors
    const totalSentToVendors = bleachingJobs.reduce((sum, j) => sum + Number(j.quantitySent), 0);
    const totalReceivedFromVendors = bleachingReceipts.reduce(
      (sum, r) => sum + Number(r.quantityReceived) + Number(r.wastageQuantity) + Number(r.rejectedQuantity),
      0
    );
    const pendingWithVendors = Math.max(0, totalSentToVendors - totalReceivedFromVendors);

    // Calculate total wastage across bleaching and internal operations
    const bleachingWastage = bleachingReceipts.reduce((sum, r) => sum + Number(r.wastageQuantity), 0);
    const processingWastage = operations.reduce((sum, o) => sum + Number(o.wastageQuantity), 0);
    const totalWastage = bleachingWastage + processingWastage;

    // Calculate total rejection
    const bleachingRejection = bleachingReceipts.reduce((sum, r) => sum + Number(r.rejectedQuantity), 0);
    const processingRejection = operations.reduce((sum, o) => sum + Number(o.rejectedQuantity), 0);
    const totalRejection = bleachingRejection + processingRejection;

    const pendingBleachingJobsCount = await prisma.gauzeBleachingJob.count({
      where: { status: { in: ['SENT', 'IN_PROGRESS', 'PARTIAL'] } },
    });

    return {
      totalBatches,
      activeBatches,
      sentToBleaching,
      pendingBleachingJobs: pendingBleachingJobsCount,
      inProcessing,
      readyForPacking,
      completedBatches,
      vendorHeldQuantity: pendingWithVendors,
      totalWastage,
      totalRejection,
    };
  }

  /**
   * Find all gauze production batches with filters, search, pagination
   */
  async findAllBatches(query: GauzeBatchQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GauzeProductionBatchWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.gauzeTypeId) where.gauzeTypeId = query.gauzeTypeId;
    if (query.gauzeSizeId) where.gauzeSizeId = query.gauzeSizeId;
    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.productId) where.productId = query.productId;

    if (query.search) {
      where.OR = [
        { batchNumber: { contains: query.search, mode: 'insensitive' } },
        { product: { name: { contains: query.search, mode: 'insensitive' } } },
        { product: { sku: { contains: query.search, mode: 'insensitive' } } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.gauzeProductionBatch.findMany({
        where,
        include: {
          product: true,
          gauzeType: true,
          gauzeSize: true,
          supplier: true,
          rawMaterials: true,
          _count: {
            select: {
              bleachingJobs: true,
              bleachingReceipts: true,
              operations: true,
              packingEntries: true,
              materialMovements: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.gauzeProductionBatch.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single batch complete detail tree
   */
  async getBatchById(id: string) {
    const batch = await prisma.gauzeProductionBatch.findUnique({
      where: { id },
      include: {
        product: true,
        gauzeType: true,
        gauzeSize: true,
        supplier: true,
        rawMaterialBatch: true,
        createdBy: {
          select: { id: true, email: true },
        },
        rawMaterials: {
          include: {
            product: true,
            supplier: true,
            gauzeType: true,
            gauzeSize: true,
            warehouse: true,
          },
        },
        bleachingJobs: {
          include: {
            vendor: true,
            bleachingType: true,
            receipts: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        bleachingReceipts: {
          include: {
            bleachingJob: {
              include: { vendor: true, bleachingType: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        operations: {
          include: {
            operationType: true,
            employee: true,
          },
          orderBy: { sequenceNumber: 'asc' },
        },
        packingEntries: {
          include: {
            product: true,
            finishedGoodsWarehouse: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        materialMovements: {
          include: {
            fromLocation: true,
            toLocation: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        statusHistory: {
          include: {
            changedByUser: {
              select: { id: true, email: true },
            },
          },
          orderBy: { changedAt: 'asc' },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Gauze Production Batch with ID ${id} not found`);
    }

    return batch;
  }

  /**
   * 1. Create a new Gauze Production Batch
   */
  async createBatch(dto: CreateGauzeProductionBatchDto, userId?: string) {
    const product = await prisma.rawMaterial.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Selected Raw Material / Product not found');
    }

    const batchNumber = await this.generateSequenceNumber('GZ', 'batch');

    const result = await prisma.$transaction(async (tx) => {
      // Create main batch
      const batch = await tx.gauzeProductionBatch.create({
        data: {
          batchNumber,
          productId: dto.productId,
          gauzeTypeId: dto.gauzeTypeId || null,
          gauzeSizeId: dto.gauzeSizeId || null,
          rawMaterialBatchId: dto.rawMaterialBatchId || null,
          supplierId: dto.supplierId || null,
          inputQuantity: dto.inputQuantity,
          inputUom: dto.inputUom,
          currentQuantity: dto.inputQuantity,
          currentUom: dto.inputUom,
          currentStage: 'RAW_MATERIAL',
          status: GauzeProductionStatus.RAW_MATERIAL_RECEIVED,
          productionStartDate: dto.productionStartDate ? new Date(dto.productionStartDate) : new Date(),
          expectedCompletionDate: dto.expectedCompletionDate ? new Date(dto.expectedCompletionDate) : null,
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // Create linked raw material roll record
      await tx.gauzeRawMaterial.create({
        data: {
          productionBatchId: batch.id,
          productId: dto.productId,
          supplierId: dto.supplierId || null,
          supplierReference: dto.supplierReference || null,
          rollOrThansNumber: dto.rollOrThansNumber || null,
          gauzeTypeId: dto.gauzeTypeId || null,
          gauzeSizeId: dto.gauzeSizeId || null,
          quantity: dto.inputQuantity,
          uom: dto.inputUom,
          receivedDate: dto.productionStartDate ? new Date(dto.productionStartDate) : new Date(),
          warehouseId: dto.warehouseId || null,
          notes: dto.notes || null,
        },
      });

      // Create initial material movement
      await tx.gauzeMaterialMovement.create({
        data: {
          productionBatchId: batch.id,
          referenceType: 'RAW_MATERIAL',
          referenceId: batch.id,
          movementType: 'RAW_MATERIAL_RECEIPT',
          toLocationId: dto.warehouseId || null,
          toLocationName: 'Raw Material Warehouse',
          quantity: dto.inputQuantity,
          uom: dto.inputUom,
          movementDate: new Date(),
          notes: `Batch created with initial raw material input of ${dto.inputQuantity} ${dto.inputUom}`,
          createdById: userId || null,
        },
      });

      // Audit status history
      await tx.gauzeBatchStatusHistory.create({
        data: {
          productionBatchId: batch.id,
          oldStatus: 'DRAFT',
          newStatus: GauzeProductionStatus.RAW_MATERIAL_RECEIVED,
          remarks: `Initial production batch created for ${dto.inputQuantity} ${dto.inputUom}`,
          changedById: userId || null,
        },
      });

      return batch;
    });

    return this.getBatchById(result.id);
  }

  /**
   * 2. Send Material to External Bleaching / Job Work
   */
  async sendToBleaching(batchId: string, dto: SendToBleachingDto, userId?: string) {
    const batch = await prisma.gauzeProductionBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException('Production Batch not found');

    if (
      batch.status !== GauzeProductionStatus.RAW_MATERIAL_RECEIVED &&
      batch.status !== GauzeProductionStatus.READY_FOR_BLEACHING &&
      batch.status !== GauzeProductionStatus.DRAFT
    ) {
      throw new BadRequestException(
        `Cannot send to bleaching. This batch is currently in '${batch.status}' stage. Raw material can only be dispatched to bleaching once from raw intake.`
      );
    }

    if (Number(dto.quantitySent) > Number(batch.currentQuantity)) {
      throw new BadRequestException(
        `Cannot send ${dto.quantitySent} ${dto.uom}. Available raw material in warehouse is only ${batch.currentQuantity} ${batch.currentUom}.`
      );
    }

    const vendor = await prisma.jobWorkCompany.findUnique({
      where: { id: dto.vendorId },
    });
    if (!vendor) throw new NotFoundException('Job Work / Bleaching vendor not found');

    const jobNumber = await this.generateSequenceNumber('BJ', 'job');
    const estimatedCost = dto.rate ? Number(dto.rate) * Number(dto.quantitySent) : null;
    const remainingQty = Math.max(0, Number(batch.currentQuantity) - Number(dto.quantitySent));

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Bleaching Job
      const job = await tx.gauzeBleachingJob.create({
        data: {
          jobNumber,
          productionBatchId: batchId,
          vendorId: dto.vendorId,
          bleachingTypeId: dto.bleachingTypeId,
          quantitySent: dto.quantitySent,
          uom: dto.uom,
          sentDate: new Date(dto.sentDate),
          expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : null,
          rate: dto.rate || null,
          estimatedCost,
          status: 'SENT',
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // 2. Update Batch Status, Stage, and remaining warehouse Quantity
      await tx.gauzeProductionBatch.update({
        where: { id: batchId },
        data: {
          status: GauzeProductionStatus.SENT_TO_BLEACHING,
          currentStage: 'BLEACHING',
          currentQuantity: remainingQty,
        },
      });

      // 3. Record Material Movement to Vendor
      await tx.gauzeMaterialMovement.create({
        data: {
          productionBatchId: batchId,
          referenceType: 'BLEACHING_JOB',
          referenceId: job.id,
          movementType: 'SEND_TO_BLEACHING',
          fromLocationName: 'Company Warehouse',
          toLocationName: vendor.companyName,
          quantity: dto.quantitySent,
          uom: dto.uom,
          movementDate: new Date(dto.sentDate),
          notes: `Sent ${dto.quantitySent} ${dto.uom} to ${vendor.companyName} for bleaching (Job: ${jobNumber})`,
          createdById: userId || null,
        },
      });

      // 4. Audit Status History
      await tx.gauzeBatchStatusHistory.create({
        data: {
          productionBatchId: batchId,
          oldStatus: batch.status,
          newStatus: GauzeProductionStatus.SENT_TO_BLEACHING,
          remarks: `Dispatched to bleaching vendor ${vendor.companyName} (${jobNumber})`,
          changedById: userId || null,
        },
      });

      return job;
    });

    return result;
  }

  /**
   * 3. Receive Bleached Material Back from Vendor
   */
  async receiveBleaching(batchId: string, dto: ReceiveBleachingDto, userId?: string) {
    const batch = await prisma.gauzeProductionBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException('Production Batch not found');

    const job = await prisma.gauzeBleachingJob.findUnique({
      where: { id: dto.bleachingJobId },
      include: { vendor: true },
    });
    if (!job) throw new NotFoundException('Bleaching Job not found');

    if (job.status === 'COMPLETED') {
      throw new BadRequestException('This bleaching dispatch job has already been received and completed.');
    }

    const totalAccounted = Number(dto.quantityReceived) + Number(dto.wastageQuantity || 0) + Number(dto.rejectedQuantity || 0);

    const receiptNumber = await this.generateSequenceNumber('BR', 'receipt');
    const actualCost = job.rate ? Number(job.rate) * Number(dto.quantityReceived) : null;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Bleaching Receipt
      const receipt = await tx.gauzeBleachingReceipt.create({
        data: {
          receiptNumber,
          bleachingJobId: job.id,
          productionBatchId: batchId,
          quantitySent: job.quantitySent,
          quantityReceived: dto.quantityReceived,
          wastageQuantity: dto.wastageQuantity || 0,
          rejectedQuantity: dto.rejectedQuantity || 0,
          uom: job.uom,
          receivedDate: new Date(dto.receivedDate),
          qualityStatus: dto.qualityStatus || 'PASSED',
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // 2. Update Job Status & Actual Cost
      await tx.gauzeBleachingJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          actualCost,
        },
      });

      // 3. Update Batch Current Quantity, Stage, Status
      await tx.gauzeProductionBatch.update({
        where: { id: batchId },
        data: {
          currentQuantity: dto.quantityReceived,
          status: GauzeProductionStatus.BLEACHING_RECEIVED,
          currentStage: 'BLEACHING_RECEIVED',
        },
      });

      // 4. Movement: Return from Vendor
      await tx.gauzeMaterialMovement.create({
        data: {
          productionBatchId: batchId,
          referenceType: 'BLEACHING_RECEIPT',
          referenceId: receipt.id,
          movementType: 'RECEIVE_FROM_BLEACHING',
          fromLocationName: job.vendor.companyName,
          toLocationName: 'Company Warehouse',
          quantity: dto.quantityReceived,
          uom: job.uom,
          movementDate: new Date(dto.receivedDate),
          notes: `Received ${dto.quantityReceived} ${job.uom} back from ${job.vendor.companyName} (${receiptNumber})`,
          createdById: userId || null,
        },
      });

      // 5. Movement: Wastage if any
      if (Number(dto.wastageQuantity) > 0) {
        await tx.gauzeMaterialMovement.create({
          data: {
            productionBatchId: batchId,
            referenceType: 'BLEACHING_RECEIPT',
            referenceId: receipt.id,
            movementType: 'WASTAGE',
            fromLocationName: job.vendor.companyName,
            quantity: dto.wastageQuantity!,
            uom: job.uom,
            movementDate: new Date(dto.receivedDate),
            notes: `Bleaching process loss / wastage: ${dto.wastageQuantity} ${job.uom}`,
            createdById: userId || null,
          },
        });
      }

      // 6. Movement: Rejection if any
      if (Number(dto.rejectedQuantity) > 0) {
        await tx.gauzeMaterialMovement.create({
          data: {
            productionBatchId: batchId,
            referenceType: 'BLEACHING_RECEIPT',
            referenceId: receipt.id,
            movementType: 'REJECTION',
            fromLocationName: job.vendor.companyName,
            quantity: dto.rejectedQuantity!,
            uom: job.uom,
            movementDate: new Date(dto.receivedDate),
            notes: `Bleaching quality rejection: ${dto.rejectedQuantity} ${job.uom}`,
            createdById: userId || null,
          },
        });
      }

      // 7. Status History
      await tx.gauzeBatchStatusHistory.create({
        data: {
          productionBatchId: batchId,
          oldStatus: batch.status,
          newStatus: GauzeProductionStatus.BLEACHING_RECEIVED,
          remarks: `Received ${dto.quantityReceived} ${job.uom} from ${job.vendor.companyName} (Wastage: ${dto.wastageQuantity || 0}, Rejected: ${dto.rejectedQuantity || 0})`,
          changedById: userId || null,
        },
      });

      return receipt;
    });

    return result;
  }

  /**
   * 4. Record Internal Processing Operation (Cutting, Folding, Rolling, etc.)
   */
  async addProcessingOperation(batchId: string, dto: AddProcessingOperationDto, userId?: string) {
    const batch = await prisma.gauzeProductionBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException('Production Batch not found');

    if (
      batch.status === GauzeProductionStatus.COMPLETED ||
      batch.status === GauzeProductionStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot add processing to batch in ${batch.status} status.`);
    }

    if (
      batch.status === GauzeProductionStatus.RAW_MATERIAL_RECEIVED ||
      batch.status === GauzeProductionStatus.READY_FOR_BLEACHING ||
      batch.status === GauzeProductionStatus.SENT_TO_BLEACHING ||
      batch.status === GauzeProductionStatus.DRAFT
    ) {
      throw new BadRequestException(
        `Cannot perform cutting/folding. Fabric is in '${batch.status}' stage and must first be dispatched to bleaching and received back from the mill.`
      );
    }

    if (Number(dto.inputQuantity) > Number(batch.currentQuantity)) {
      throw new BadRequestException(
        `Input quantity ${dto.inputQuantity} exceeds current batch quantity ${batch.currentQuantity} ${batch.currentUom}.`
      );
    }

    const opType = await prisma.gauzeOperationType.findUnique({
      where: { id: dto.operationTypeId },
    });
    if (!opType) throw new NotFoundException('Operation Type not found');

    const operationNumber = await this.generateSequenceNumber('PR', 'operation');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Operation record
      const operation = await tx.gauzeProductionOperation.create({
        data: {
          operationNumber,
          productionBatchId: batchId,
          operationTypeId: dto.operationTypeId,
          sequenceNumber: dto.sequenceNumber || 1,
          inputQuantity: dto.inputQuantity,
          outputQuantity: dto.outputQuantity,
          wastageQuantity: dto.wastageQuantity || 0,
          rejectedQuantity: dto.rejectedQuantity || 0,
          uom: dto.uom,
          employeeId: dto.employeeId || null,
          machineId: dto.machineId || null,
          operationDate: new Date(dto.operationDate),
          status: 'COMPLETED',
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // 2. Update Batch Current Quantity, Status & Stage
      await tx.gauzeProductionBatch.update({
        where: { id: batchId },
        data: {
          currentQuantity: dto.outputQuantity,
          status: GauzeProductionStatus.IN_PROCESSING,
          currentStage: 'PROCESSING',
        },
      });

      // 3. Movement: Processing Output
      await tx.gauzeMaterialMovement.create({
        data: {
          productionBatchId: batchId,
          referenceType: 'PROCESSING',
          referenceId: operation.id,
          movementType: 'PROCESSING_OUTPUT',
          fromLocationName: 'Processing Bay',
          toLocationName: 'WIP Staging Floor',
          quantity: dto.outputQuantity,
          uom: dto.uom,
          movementDate: new Date(dto.operationDate),
          notes: `Operation ${opType.name} output: ${dto.outputQuantity} ${dto.uom} (${operationNumber})`,
          createdById: userId || null,
        },
      });

      // 4. Movement: Wastage if any
      if (Number(dto.wastageQuantity) > 0) {
        await tx.gauzeMaterialMovement.create({
          data: {
            productionBatchId: batchId,
            referenceType: 'PROCESSING',
            referenceId: operation.id,
            movementType: 'WASTAGE',
            fromLocationName: 'Processing Bay',
            quantity: dto.wastageQuantity!,
            uom: dto.uom,
            movementDate: new Date(dto.operationDate),
            notes: `Operation ${opType.name} scrap/wastage: ${dto.wastageQuantity} ${dto.uom}`,
            createdById: userId || null,
          },
        });
      }

      // 5. Status History
      await tx.gauzeBatchStatusHistory.create({
        data: {
          productionBatchId: batchId,
          oldStatus: batch.status,
          newStatus: GauzeProductionStatus.IN_PROCESSING,
          remarks: `Operation ${opType.name} completed: Input=${dto.inputQuantity}, Output=${dto.outputQuantity}, Wastage=${dto.wastageQuantity || 0}`,
          changedById: userId || null,
        },
      });

      return operation;
    });

    return result;
  }

  /**
   * 5. Convert Processed Gauze into Finished Packed Goods
   */
  async createPackingEntry(batchId: string, dto: CreatePackingEntryDto, userId?: string) {
    const batch = await prisma.gauzeProductionBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException('Production Batch not found');

    if (
      batch.status === GauzeProductionStatus.RAW_MATERIAL_RECEIVED ||
      batch.status === GauzeProductionStatus.READY_FOR_BLEACHING ||
      batch.status === GauzeProductionStatus.SENT_TO_BLEACHING ||
      batch.status === GauzeProductionStatus.DRAFT
    ) {
      throw new BadRequestException(
        `Cannot pack raw or unbleached fabric. Fabric must first be bleached and processed before packing.`
      );
    }

    if (
      batch.status === GauzeProductionStatus.COMPLETED ||
      batch.status === GauzeProductionStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot pack a batch in ${batch.status} status.`);
    }

    const finishedProduct = await prisma.rawMaterial.findUnique({
      where: { id: dto.productId },
    });
    if (!finishedProduct) throw new NotFoundException('Finished Product not found in master catalogue');

    const totalPieces = dto.piecesPerPack * dto.numberOfPacks;
    const packingNumber = await this.generateSequenceNumber('PK', 'packing');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Packing Entry
      const packing = await tx.gauzePackingEntry.create({
        data: {
          packingNumber,
          productionBatchId: batchId,
          productId: dto.productId,
          sizeDescription: dto.sizeDescription || null,
          ply: dto.ply || null,
          piecesPerPack: dto.piecesPerPack,
          numberOfPacks: dto.numberOfPacks,
          totalPieces,
          packingDate: new Date(dto.packingDate),
          finishedGoodsWarehouseId: dto.finishedGoodsWarehouseId || null,
          status: 'PACKED',
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // 2. Update Finished Goods Inventory Stock Balance
      const currentStock = Number(finishedProduct.currentStockBalance);
      const newStock = currentStock + totalPieces;

      await tx.rawMaterial.update({
        where: { id: dto.productId },
        data: {
          currentStockBalance: newStock,
        },
      });

      // 3. Log Stock Transaction in Inventory Ledger
      if (userId) {
        await tx.inventoryTransaction.create({
          data: {
            rawMaterialId: dto.productId,
            transactionType: TransactionType.PURCHASE_RECEIPT,
            quantity: totalPieces,
            previousStock: currentStock,
            newStock,
            unitPrice: finishedProduct.unitCost,
            referenceNumber: packingNumber,
            referenceDocumentType: 'GAUZE_PRODUCTION_BATCH',
            referenceDocumentId: batch.id,
            notes: `Production conversion from batch ${batch.batchNumber} (${dto.numberOfPacks} packs x ${dto.piecesPerPack} pcs = ${totalPieces} pcs)`,
            createdByUserId: userId,
          },
        });
      }

      // 4. Update Batch Status
      const nextStatus = dto.markBatchCompleted ? GauzeProductionStatus.COMPLETED : GauzeProductionStatus.PACKED;
      await tx.gauzeProductionBatch.update({
        where: { id: batchId },
        data: {
          status: nextStatus,
          currentStage: 'FINISHED_GOODS',
          completionDate: dto.markBatchCompleted ? new Date(dto.packingDate) : null,
        },
      });

      // 5. Material Movement to Finished Goods
      await tx.gauzeMaterialMovement.create({
        data: {
          productionBatchId: batchId,
          referenceType: 'PACKING',
          referenceId: packing.id,
          movementType: 'FINISHED_GOODS_RECEIPT',
          fromLocationName: 'Packing Floor',
          toLocationId: dto.finishedGoodsWarehouseId || null,
          toLocationName: 'Finished Goods Warehouse',
          quantity: totalPieces,
          uom: 'Pcs',
          movementDate: new Date(dto.packingDate),
          notes: `Packed ${dto.numberOfPacks} packs (${totalPieces} pieces) of ${finishedProduct.name}`,
          createdById: userId || null,
        },
      });

      // 6. Audit Status History
      await tx.gauzeBatchStatusHistory.create({
        data: {
          productionBatchId: batchId,
          oldStatus: batch.status,
          newStatus: nextStatus,
          remarks: `Packed ${dto.numberOfPacks} packs of ${finishedProduct.name} (${totalPieces} pcs). Status updated to ${nextStatus}.`,
          changedById: userId || null,
        },
      });

      return packing;
    });

    return result;
  }

  /**
   * 6. Update Batch Status Manually (e.g. Put On Hold, Resume, Cancel, Ready for packing)
   */
  async updateStatus(batchId: string, newStatus: GauzeProductionStatus, remarks?: string, userId?: string) {
    const batch = await prisma.gauzeProductionBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.gauzeProductionBatch.update({
        where: { id: batchId },
        data: {
          status: newStatus,
          completionDate: newStatus === GauzeProductionStatus.COMPLETED ? new Date() : batch.completionDate,
        },
      });

      await tx.gauzeBatchStatusHistory.create({
        data: {
          productionBatchId: batchId,
          oldStatus: batch.status,
          newStatus,
          remarks: remarks || `Status changed from ${batch.status} to ${newStatus}`,
          changedById: userId || null,
        },
      });

      return b;
    });

    return updated;
  }

  /**
   * 7. Forward and Reverse Traceability
   */
  async getTraceability(batchId: string) {
    const batch = await this.getBatchById(batchId);

    const forwardTraceability = {
      batchNumber: batch.batchNumber,
      supplier: batch.supplier ? { name: batch.supplier.name, code: batch.supplier.code } : null,
      rawMaterial: {
        sku: batch.product.sku,
        name: batch.product.name,
        inputQuantity: batch.inputQuantity,
        inputUom: batch.inputUom,
      },
      rawRolls: batch.rawMaterials.map((rm) => ({
        rollOrThan: rm.rollOrThansNumber || 'Standard Lot',
        quantity: rm.quantity,
        uom: rm.uom,
        receivedDate: rm.receivedDate,
      })),
      bleachingJobs: batch.bleachingJobs.map((bj) => ({
        jobNumber: bj.jobNumber,
        vendor: bj.vendor.companyName,
        bleachingType: bj.bleachingType.name,
        quantitySent: bj.quantitySent,
        sentDate: bj.sentDate,
        status: bj.status,
        receipts: bj.receipts.map((br) => ({
          receiptNumber: br.receiptNumber,
          quantityReceived: br.quantityReceived,
          wastage: br.wastageQuantity,
          rejected: br.rejectedQuantity,
          receivedDate: br.receivedDate,
          quality: br.qualityStatus,
        })),
      })),
      processingOperations: batch.operations.map((op) => ({
        operationNumber: op.operationNumber,
        operationType: op.operationType.name,
        input: op.inputQuantity,
        output: op.outputQuantity,
        wastage: op.wastageQuantity,
        rejected: op.rejectedQuantity,
        date: op.operationDate,
        employee: op.employee ? `${op.employee.firstName} ${op.employee.lastName}` : null,
      })),
      packingEntries: batch.packingEntries.map((pk) => ({
        packingNumber: pk.packingNumber,
        product: pk.product.name,
        size: pk.sizeDescription,
        ply: pk.ply,
        packs: pk.numberOfPacks,
        piecesPerPack: pk.piecesPerPack,
        totalPieces: pk.totalPieces,
        packingDate: pk.packingDate,
      })),
    };

    const reverseTraceability = {
      finishedProducts: batch.packingEntries.map((pk) => ({
        packingNumber: pk.packingNumber,
        product: pk.product.name,
        totalPieces: pk.totalPieces,
        packs: pk.numberOfPacks,
        packingDate: pk.packingDate,
        derivedFromOperations: batch.operations.map((op) => `${op.operationType.name} (${op.operationNumber})`),
        derivedFromBleaching: batch.bleachingReceipts.map(
          (br) => `Bleaching Receipt ${br.receiptNumber} from ${br.bleachingJob.vendor.companyName}`
        ),
        originRawMaterial: `${batch.product.name} (${batch.product.sku}) - Batch ${batch.batchNumber}`,
        originSupplier: batch.supplier?.name || 'In-house Stock',
      })),
    };

    return {
      forwardTraceability,
      reverseTraceability,
    };
  }

  /**
   * 8. Bleaching Jobs Listing & Vendor Balances
   */
  async getBleachingJobs(query: { vendorId?: string; status?: string; search?: string }) {
    const where: Prisma.GauzeBleachingJobWhereInput = {};
    if (query.vendorId) where.vendorId = query.vendorId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { jobNumber: { contains: query.search, mode: 'insensitive' } },
        { vendor: { companyName: { contains: query.search, mode: 'insensitive' } } },
        { productionBatch: { batchNumber: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.gauzeBleachingJob.findMany({
      where,
      include: {
        vendor: true,
        bleachingType: true,
        productionBatch: {
          include: { product: true },
        },
        receipts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 9. Vendor Held Material Register
   */
  async getVendorStockRegister() {
    const jobs = await prisma.gauzeBleachingJob.findMany({
      include: {
        vendor: true,
        bleachingType: true,
        productionBatch: { select: { batchNumber: true, product: { select: { name: true } } } },
        receipts: true,
      },
      orderBy: { sentDate: 'desc' },
    });

    const vendorMap: Record<
      string,
      {
        vendorId: string;
        vendorName: string;
        contactPerson: string | null;
        phone: string | null;
        totalSent: number;
        totalReceived: number;
        totalWastage: number;
        totalRejected: number;
        pendingQuantity: number;
        jobs: any[];
      }
    > = {};

    for (const job of jobs) {
      const vid = job.vendorId;
      if (!vendorMap[vid]) {
        vendorMap[vid] = {
          vendorId: vid,
          vendorName: job.vendor.companyName,
          contactPerson: job.vendor.contactPerson,
          phone: job.vendor.phone,
          totalSent: 0,
          totalReceived: 0,
          totalWastage: 0,
          totalRejected: 0,
          pendingQuantity: 0,
          jobs: [],
        };
      }

      const receivedSum = job.receipts.reduce((s, r) => s + Number(r.quantityReceived), 0);
      const wastageSum = job.receipts.reduce((s, r) => s + Number(r.wastageQuantity), 0);
      const rejectedSum = job.receipts.reduce((s, r) => s + Number(r.rejectedQuantity), 0);
      const jobPending = Math.max(0, Number(job.quantitySent) - receivedSum - wastageSum - rejectedSum);

      vendorMap[vid].totalSent += Number(job.quantitySent);
      vendorMap[vid].totalReceived += receivedSum;
      vendorMap[vid].totalWastage += wastageSum;
      vendorMap[vid].totalRejected += rejectedSum;
      vendorMap[vid].pendingQuantity += jobPending;

      vendorMap[vid].jobs.push({
        jobId: job.id,
        jobNumber: job.jobNumber,
        batchNumber: job.productionBatch.batchNumber,
        productName: job.productionBatch.product.name,
        bleachingType: job.bleachingType.name,
        sentQuantity: Number(job.quantitySent),
        receivedQuantity: receivedSum,
        wastageQuantity: wastageSum,
        rejectedQuantity: rejectedSum,
        pendingQuantity: jobPending,
        sentDate: job.sentDate,
        expectedReturnDate: job.expectedReturnDate,
        status: job.status,
      });
    }

    return Object.values(vendorMap);
  }

  /**
   * 10. Reports Engine
   */
  async getReports(type: 'batches' | 'bleaching' | 'vendor-pending' | 'wastage' | 'finished-goods') {
    if (type === 'batches') {
      return prisma.gauzeProductionBatch.findMany({
        include: {
          product: true,
          gauzeType: true,
          gauzeSize: true,
          supplier: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (type === 'bleaching') {
      return prisma.gauzeBleachingJob.findMany({
        include: {
          vendor: true,
          bleachingType: true,
          productionBatch: { include: { product: true } },
          receipts: true,
        },
        orderBy: { sentDate: 'desc' },
      });
    }

    if (type === 'vendor-pending') {
      return this.getVendorStockRegister();
    }

    if (type === 'wastage') {
      const [bleachingReceipts, operations] = await Promise.all([
        prisma.gauzeBleachingReceipt.findMany({
          include: {
            bleachingJob: { include: { vendor: true } },
            productionBatch: { include: { product: true } },
          },
        }),
        prisma.gauzeProductionOperation.findMany({
          include: {
            operationType: true,
            productionBatch: { include: { product: true } },
          },
        }),
      ]);

      const records = [
        ...bleachingReceipts.map((br) => ({
          batchNumber: br.productionBatch.batchNumber,
          productName: br.productionBatch.product.name,
          stage: `Bleaching (${br.bleachingJob.vendor.companyName})`,
          input: Number(br.quantitySent),
          output: Number(br.quantityReceived),
          wastage: Number(br.wastageQuantity),
          rejected: Number(br.rejectedQuantity),
          wastagePercent: Number(br.quantitySent) > 0 ? (Number(br.wastageQuantity) / Number(br.quantitySent)) * 100 : 0,
          date: br.receivedDate,
        })),
        ...operations.map((op) => ({
          batchNumber: op.productionBatch.batchNumber,
          productName: op.productionBatch.product.name,
          stage: `Processing - ${op.operationType.name}`,
          input: Number(op.inputQuantity),
          output: Number(op.outputQuantity),
          wastage: Number(op.wastageQuantity),
          rejected: Number(op.rejectedQuantity),
          wastagePercent: Number(op.inputQuantity) > 0 ? (Number(op.wastageQuantity) / Number(op.inputQuantity)) * 100 : 0,
          date: op.operationDate,
        })),
      ];

      return records;
    }

    if (type === 'finished-goods') {
      return prisma.gauzePackingEntry.findMany({
        include: {
          product: true,
          productionBatch: true,
          finishedGoodsWarehouse: true,
        },
        orderBy: { packingDate: 'desc' },
      });
    }

    return [];
  }

  /**
   * 11. Master Data CRUD
   */
  async getMasters() {
    const [types, sizes, bleachingTypes, operationTypes] = await Promise.all([
      prisma.gauzeType.findMany({ orderBy: { name: 'asc' } }),
      prisma.gauzeSize.findMany({ orderBy: { width: 'asc' } }),
      prisma.bleachingType.findMany({ orderBy: { name: 'asc' } }),
      prisma.gauzeOperationType.findMany({ orderBy: { sequence: 'asc' } }),
    ]);

    return {
      gauzeTypes: types,
      gauzeSizes: sizes,
      bleachingTypes,
      operationTypes,
    };
  }

  async createGauzeType(dto: CreateGauzeTypeDto) {
    return prisma.gauzeType.create({ data: dto });
  }

  async updateGauzeType(id: string, dto: Partial<CreateGauzeTypeDto>) {
    return prisma.gauzeType.update({ where: { id }, data: dto });
  }

  async createGauzeSize(dto: CreateGauzeSizeDto) {
    return prisma.gauzeSize.create({ data: dto });
  }

  async updateGauzeSize(id: string, dto: Partial<CreateGauzeSizeDto>) {
    return prisma.gauzeSize.update({ where: { id }, data: dto });
  }

  async createBleachingType(dto: CreateBleachingTypeDto) {
    return prisma.bleachingType.create({ data: dto });
  }

  async updateBleachingType(id: string, dto: Partial<CreateBleachingTypeDto>) {
    return prisma.bleachingType.update({ where: { id }, data: dto });
  }

  async createOperationType(dto: CreateGauzeOperationTypeDto) {
    return prisma.gauzeOperationType.create({ data: dto });
  }

  async updateOperationType(id: string, dto: Partial<CreateGauzeOperationTypeDto>) {
    return prisma.gauzeOperationType.update({ where: { id }, data: dto });
  }
}
