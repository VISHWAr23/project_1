import { Injectable, NotFoundException, BadRequestException, ConflictException, OnModuleInit } from '@nestjs/common';
import { prisma, GamjeeProductionStatus, TransactionType, Prisma } from '@ims/database';
import { CreateGamjeeProductionBatchDto, UpdateGamjeeProductionBatchDto } from './dto/create-batch.dto';
import { IssueGamjeeMaterialsDto } from './dto/issue-materials.dto';
import { AddGamjeeOperationDto } from './dto/add-operation.dto';
import { CreateGamjeeRollingDto } from './dto/create-rolling.dto';
import {
  CreateGamjeeSizeDto,
  CreateGamjeeOperationTypeDto,
  CreateGamjeeProductMasterDto,
  CreateGamjeeCottonSpecDto,
} from './dto/master.dto';
import { GamjeeBatchQueryDto } from './dto/query.dto';

@Injectable()
export class GamjeeProductionService implements OnModuleInit {
  async onModuleInit() {
    await this.ensureDefaultMasters();
  }

  /**
   * Automatically ensure standard default master records exist
   */
  async ensureDefaultMasters() {
    try {
      const sizeCount = await prisma.gamjeeSizeMaster.count();
      if (sizeCount === 0) {
        await prisma.gamjeeSizeMaster.createMany({
          data: [
            { name: '15 cm x 8 m', width: 15, widthUom: 'cm', length: 8, lengthUom: 'm', description: 'Standard clinical Gamjee Roll 15cm x 8m' },
            { name: '15 cm x 3 m', width: 15, widthUom: 'cm', length: 3, lengthUom: 'm', description: 'Compact hospital Gamjee Roll 15cm x 3m' },
            { name: '10 cm x 8 m', width: 10, widthUom: 'cm', length: 8, lengthUom: 'm', description: 'Narrow Gamjee Roll 10cm x 8m' },
            { name: '10 cm x 3 m', width: 10, widthUom: 'cm', length: 3, lengthUom: 'm', description: 'Small wound dressing Gamjee Roll 10cm x 3m' },
          ],
        });
      }

      const opCount = await prisma.gamjeeOperationMaster.count();
      if (opCount === 0) {
        await prisma.gamjeeOperationMaster.createMany({
          data: [
            { name: 'Fabric Preparation (Pinning, Folding & Cutting)', code: 'OP-FABPREP', sequence: 1, description: 'Pinning fold alignment, longitudinal folding, and precision cutting to Gamjee roll pieces' },
            { name: 'Pinning', code: 'OP-PIN', sequence: 2, description: 'Fabric pinning & edge alignment' },
            { name: 'Folding', code: 'OP-FOLD', sequence: 3, description: 'Multi-layer longitudinal folding' },
            { name: 'Cutting', code: 'OP-CUT', sequence: 4, description: 'Precision sizing and cut-off to required roll width' },
            { name: 'Cotton Preparation', code: 'OP-COTPREP', sequence: 5, description: 'Cotton wool layer prep & weight inspection' },
            { name: 'Rolling', code: 'OP-ROLL', sequence: 6, description: 'Combining prepared fabric + cotton and rolling into finished rolls' },
            { name: 'Inspection', code: 'OP-QC', sequence: 7, description: 'Finished roll QC and visual inspection' },
          ],
        });
      } else {
        const prepOpExists = await prisma.gamjeeOperationMaster.findFirst({
          where: { code: 'OP-FABPREP' },
        });
        if (!prepOpExists) {
          await prisma.gamjeeOperationMaster.create({
            data: {
              name: 'Fabric Preparation (Pinning, Folding & Cutting)',
              code: 'OP-FABPREP',
              sequence: 1,
              description: 'Pinning fold alignment, longitudinal folding, and precision cutting to Gamjee roll pieces',
            },
          });
        }
      }

      const prodCount = await prisma.gamjeeProductMaster.count();
      if (prodCount === 0) {
        await prisma.gamjeeProductMaster.createMany({
          data: [
            { productName: 'Cotton Gamjee Roll (15cm x 8m)', gamjeeType: 'Standard Heavy Discharge', width: 15, widthUom: 'cm', rollLength: 8, lengthUom: 'm', cottonRequirement: 0.100, cottonUom: 'kg', fabricRequirement: 8.0, fabricUom: 'm' },
            { productName: 'Cotton Gamjee Roll (15cm x 3m)', gamjeeType: 'Medium Dressing', width: 15, widthUom: 'cm', rollLength: 3, lengthUom: 'm', cottonRequirement: 0.040, cottonUom: 'kg', fabricRequirement: 3.0, fabricUom: 'm' },
            { productName: 'Cotton Gamjee Roll (10cm x 8m)', gamjeeType: 'Narrow Band', width: 10, widthUom: 'cm', rollLength: 8, lengthUom: 'm', cottonRequirement: 0.070, cottonUom: 'kg', fabricRequirement: 8.0, fabricUom: 'm' },
          ],
        });
      }

      const cottonSpecCount = await (prisma as any).gamjeeCottonSpecification?.count?.();
      if (cottonSpecCount === 0) {
        await (prisma as any).gamjeeCottonSpecification.createMany({
          data: [
            { cottonType: '1 KG 900 Web', weightKg: 1.0, web: 900, gamjeeWidthCm: 15, piecesPerRoll: 12, description: 'Standard 1KG 900 Web cotton roll for 15cm width' },
            { cottonType: '1 KG 900 Web', weightKg: 1.0, web: 900, gamjeeWidthCm: 10, piecesPerRoll: 15, description: 'Standard 1KG 900 Web cotton roll for 10cm width' },
          ],
        });
      }

      // Ensure planning columns exist on gamjee_production_batches individually
      const columns = [
        `ALTER TABLE gamjee_production_batches ADD COLUMN IF NOT EXISTS calculation_mode VARCHAR(50) DEFAULT 'FROM_FABRIC'`,
        `ALTER TABLE gamjee_production_batches ADD COLUMN IF NOT EXISTS pinning_size_meters NUMERIC(10, 2)`,
        `ALTER TABLE gamjee_production_batches ADD COLUMN IF NOT EXISTS folding_cuts_count INT`,
        `ALTER TABLE gamjee_production_batches ADD COLUMN IF NOT EXISTS cotton_spec_id UUID`,
        `ALTER TABLE gamjee_production_batches ADD COLUMN IF NOT EXISTS cotton_type_name VARCHAR(150)`,
        `ALTER TABLE gamjee_production_batches ADD COLUMN IF NOT EXISTS planned_fabric_meters NUMERIC(10, 2)`,
        `ALTER TABLE gamjee_production_batches ADD COLUMN IF NOT EXISTS planned_cotton_kg NUMERIC(10, 3)`,
      ];

      for (const colSql of columns) {
        try {
          await prisma.$executeRawUnsafe(colSql);
        } catch {
          // Column already exists
        }
      }
    } catch (e) {
      console.warn('Gamjee masters initialization check:', e);
    }
  }

  /**
   * Helper to generate unique serial numbers
   */
  async generateSequenceNumber(prefix: string, model: 'batch' | 'operation' | 'rolling' | 'finished_roll'): Promise<string> {
    const year = new Date().getFullYear();
    const fullPrefix = `${prefix}-${year}-`;
    let count = 0;

    if (model === 'batch') count = await prisma.gamjeeProductionBatch.count();
    else if (model === 'operation') count = await prisma.gamjeeProductionOperation.count();
    else if (model === 'rolling') count = await prisma.gamjeeRollingEntry.count();
    else if (model === 'finished_roll') count = await prisma.gamjeeFinishedRoll.count();

    let seq = String(count + 1).padStart(5, '0');
    let code = `${fullPrefix}${seq}`;

    // Verify collision safety
    let exists = true;
    let increment = count + 1;
    while (exists) {
      code = `${fullPrefix}${String(increment).padStart(5, '0')}`;
      if (model === 'batch') exists = !!(await prisma.gamjeeProductionBatch.findUnique({ where: { batchNumber: code } }));
      else if (model === 'operation') exists = !!(await prisma.gamjeeProductionOperation.findUnique({ where: { operationNumber: code } }));
      else if (model === 'rolling') exists = !!(await prisma.gamjeeRollingEntry.findUnique({ where: { rollingNumber: code } }));
      else if (model === 'finished_roll') exists = !!(await prisma.gamjeeFinishedRoll.findFirst({ where: { rollBatchNumber: code } }));
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
      materialsSelected,
      fabricProcessing,
      readyForRolling,
      rollingBatches,
      completedBatches,
      finishedRollsAgg,
      materialMovements,
      recentBatches,
    ] = await Promise.all([
      prisma.gamjeeProductionBatch.count(),
      prisma.gamjeeProductionBatch.count({
        where: {
          status: {
            notIn: [GamjeeProductionStatus.COMPLETED, GamjeeProductionStatus.CANCELLED],
          },
        },
      }),
      prisma.gamjeeProductionBatch.count({
        where: { status: GamjeeProductionStatus.MATERIALS_SELECTED },
      }),
      prisma.gamjeeProductionBatch.count({
        where: {
          status: {
            in: [GamjeeProductionStatus.PINNING, GamjeeProductionStatus.FOLDING, GamjeeProductionStatus.CUTTING],
          },
        },
      }),
      prisma.gamjeeProductionBatch.count({
        where: { status: { in: [GamjeeProductionStatus.COTTON_PREPARATION, GamjeeProductionStatus.READY_FOR_ROLLING] } },
      }),
      prisma.gamjeeProductionBatch.count({
        where: { status: GamjeeProductionStatus.ROLLING },
      }),
      prisma.gamjeeProductionBatch.count({
        where: { status: GamjeeProductionStatus.COMPLETED },
      }),
      prisma.gamjeeFinishedRoll.aggregate({
        _sum: {
          rollCount: true,
          totalLength: true,
        },
      }),
      prisma.gamjeeMaterialMovement.findMany({
        select: { movementType: true, quantity: true, uom: true },
      }),
      prisma.gamjeeProductionBatch.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          finishedProduct: { select: { id: true, name: true, sku: true } },
          gamjeeSize: true,
        },
      }),
    ]);

    // Calculate wastage and consumption
    let totalFabricUsed = 0;
    let totalCottonUsed = 0;
    let totalWastage = 0;

    materialMovements.forEach((mov) => {
      const q = Number(mov.quantity) || 0;
      if (mov.movementType === 'FABRIC_ISSUE_TO_PRODUCTION' || mov.movementType === 'FABRIC_CONSUMPTION_FOR_ROLLING') {
        totalFabricUsed += q;
      } else if (mov.movementType === 'COTTON_ISSUE_TO_PRODUCTION' || mov.movementType === 'COTTON_CONSUMPTION_FOR_ROLLING') {
        totalCottonUsed += q;
      } else if (mov.movementType === 'PRODUCTION_WASTAGE') {
        totalWastage += q;
      }
    });

    return {
      kpis: {
        totalBatches,
        activeBatches,
        materialsSelected,
        fabricProcessing,
        readyForRolling,
        rollingBatches,
        completedBatches,
        totalFinishedRolls: finishedRollsAgg._sum.rollCount || 0,
        totalFinishedMeters: Number(finishedRollsAgg._sum.totalLength || 0),
        totalFabricUsed,
        totalCottonUsed,
        totalWastage,
      },
      recentBatches,
    };
  }

  /**
   * List all Gamjee production batches
   */
  async findAllBatches(query: GamjeeBatchQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GamjeeProductionBatchWhereInput = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as GamjeeProductionStatus;
    }
    if (query.gamjeeSizeId && query.gamjeeSizeId !== 'ALL') {
      where.gamjeeSizeId = query.gamjeeSizeId;
    }
    if (query.finishedProductId && query.finishedProductId !== 'ALL') {
      where.finishedProductId = query.finishedProductId;
    }

    if (query.startDate && query.endDate) {
      where.productionDate = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    if (query.search) {
      where.OR = [
        { batchNumber: { contains: query.search, mode: 'insensitive' } },
        { finishedProduct: { name: { contains: query.search, mode: 'insensitive' } } },
        { finishedProduct: { sku: { contains: query.search, mode: 'insensitive' } } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.gamjeeProductionBatch.findMany({
        where,
        include: {
          finishedProduct: true,
          gamjeeSize: true,
          materialInputs: {
            include: { product: true, warehouse: true },
          },
          rollingEntries: true,
          finishedRolls: true,
          _count: {
            select: {
              operations: true,
              rollingEntries: true,
              finishedRolls: true,
              materialMovements: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.gamjeeProductionBatch.count({ where }),
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
    let batch: any = null;
    const baseInclude = {
      finishedProduct: {
        include: {
          unit: true,
          category: true,
          storageLocation: true,
        },
      },
      gamjeeSize: true,
      createdBy: {
        select: { id: true, email: true },
      },
      materialInputs: {
        include: {
          product: {
            include: { unit: true },
          },
          inventoryBatch: true,
          warehouse: true,
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
      rollingEntries: {
        include: {
          employee: true,
          finishedRolls: {
            include: { warehouse: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      finishedRolls: {
        include: {
          finishedProduct: true,
          warehouse: true,
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
    };

    try {
      batch = await (prisma.gamjeeProductionBatch as any).findUnique({
        where: { id },
        include: {
          ...baseInclude,
          cottonSpec: true,
        },
      });
    } catch {
      batch = await (prisma.gamjeeProductionBatch as any).findUnique({
        where: { id },
        include: baseInclude,
      });
    }

    if (!batch) {
      throw new NotFoundException(`Gamjee Production Batch ${id} not found`);
    }

    // Ensure planning fields are populated
    if (batch && batch.calculationMode === undefined) {
      try {
        const extra: any[] = await prisma.$queryRawUnsafe(
          `SELECT calculation_mode, pinning_size_meters, folding_cuts_count, cotton_spec_id, cotton_type_name, planned_fabric_meters, planned_cotton_kg FROM gamjee_production_batches WHERE id = $1::uuid`,
          batch.id
        );
        if (extra && extra.length > 0) {
          batch.calculationMode = extra[0].calculation_mode;
          batch.pinningSizeMeters = extra[0].pinning_size_meters;
          batch.foldingCutsCount = extra[0].folding_cuts_count;
          batch.cottonSpecId = extra[0].cotton_spec_id;
          batch.cottonTypeName = extra[0].cotton_type_name;
          batch.plannedFabricMeters = extra[0].planned_fabric_meters;
          batch.plannedCottonKg = extra[0].planned_cotton_kg;
        }
      } catch {
        // Ignore fallback error
      }
    }

    return batch;
  }

  /**
   * 1. Create a new Gamjee Production Batch
   */
  async createBatch(dto: CreateGamjeeProductionBatchDto, userId?: string) {
    const product = await prisma.rawMaterial.findUnique({
      where: { id: dto.finishedProductId },
    });
    if (!product) {
      throw new NotFoundException('Selected Finished Gamjee Product not found');
    }

    const batchNumber = await this.generateSequenceNumber('GR', 'batch');

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create base batch record
      const batch = await (tx as any).gamjeeProductionBatch.create({
        data: {
          batchNumber,
          finishedProductId: dto.finishedProductId,
          gamjeeSizeId: dto.gamjeeSizeId || null,
          productionQuantity: dto.productionQuantity || null,
          productionUom: dto.productionUom || 'Rolls',
          currentQuantity: 0,
          currentUom: 'meter',
          currentStage: 'DRAFT',
          status: GamjeeProductionStatus.DRAFT,
          productionDate: new Date(dto.productionDate),
          expectedCompletionDate: dto.expectedCompletionDate ? new Date(dto.expectedCompletionDate) : null,
          notes: dto.notes || null,
          createdById: userId || null,
        },
        include: {
          finishedProduct: true,
          gamjeeSize: true,
        },
      });

      // 2. Persist calculation & planning parameters to PostgreSQL table
      try {
        const calcMode = dto.calculationMode || 'FROM_FABRIC';
        const pinSize = dto.pinningSizeMeters ? Number(dto.pinningSizeMeters) : null;
        const foldCuts = dto.foldingCutsCount ? Number(dto.foldingCutsCount) : null;
        const cotSpecId = dto.cottonSpecId || null;
        const cotName = dto.cottonTypeName || null;
        const planFab = dto.plannedFabricMeters ? Number(dto.plannedFabricMeters) : null;
        const planCot = dto.plannedCottonKg ? Number(dto.plannedCottonKg) : null;

        if (cotSpecId) {
          await tx.$executeRaw`
            UPDATE gamjee_production_batches 
            SET calculation_mode = ${calcMode}, 
                pinning_size_meters = ${pinSize}, 
                folding_cuts_count = ${foldCuts}, 
                cotton_spec_id = ${cotSpecId}::uuid, 
                cotton_type_name = ${cotName}, 
                planned_fabric_meters = ${planFab}, 
                planned_cotton_kg = ${planCot} 
            WHERE id = ${batch.id}::uuid
          `;
        } else {
          await tx.$executeRaw`
            UPDATE gamjee_production_batches 
            SET calculation_mode = ${calcMode}, 
                pinning_size_meters = ${pinSize}, 
                folding_cuts_count = ${foldCuts}, 
                cotton_type_name = ${cotName}, 
                planned_fabric_meters = ${planFab}, 
                planned_cotton_kg = ${planCot} 
            WHERE id = ${batch.id}::uuid
          `;
        }
      } catch (err) {
        console.warn('Could not update extra planning fields on gamjee_production_batches:', err);
      }

      // 3. Audit status creation
      await tx.gamjeeBatchStatusHistory.create({
        data: {
          productionBatchId: batch.id,
          oldStatus: null,
          newStatus: GamjeeProductionStatus.DRAFT,
          changedById: userId || null,
          remarks: 'Gamjee Production Batch initiated in DRAFT stage',
        },
      });

      // Attach planning fields to returned object
      (batch as any).calculationMode = dto.calculationMode || 'FROM_FABRIC';
      (batch as any).pinningSizeMeters = dto.pinningSizeMeters || null;
      (batch as any).foldingCutsCount = dto.foldingCutsCount || null;
      (batch as any).cottonSpecId = dto.cottonSpecId || null;
      (batch as any).cottonTypeName = dto.cottonTypeName || null;
      (batch as any).plannedFabricMeters = dto.plannedFabricMeters || null;
      (batch as any).plannedCottonKg = dto.plannedCottonKg || null;

      return batch;
    });

    return result;
  }

  /**
   * 2. Issue Raw Materials (Bleached Fabric + Cotton Roll) to Batch
   */
  async issueMaterials(batchId: string, dto: IssueGamjeeMaterialsDto, userId?: string) {
    const batch = await prisma.gamjeeProductionBatch.findUnique({
      where: { id: batchId },
      include: { materialInputs: true },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    if (batch.status === GamjeeProductionStatus.COMPLETED || batch.status === GamjeeProductionStatus.CANCELLED) {
      throw new BadRequestException(`Cannot issue materials to a ${batch.status} batch`);
    }

    // Verify raw material stocks
    const fabricProduct = await prisma.rawMaterial.findUnique({ where: { id: dto.fabricProductId } });
    if (!fabricProduct) throw new NotFoundException('Selected Bleached Fabric product not found');

    const cottonProduct = await prisma.rawMaterial.findUnique({ where: { id: dto.cottonProductId } });
    if (!cottonProduct) throw new NotFoundException('Selected Cotton Roll product not found');

    if (Number(fabricProduct.currentStockBalance) < dto.fabricQuantityIssued) {
      throw new BadRequestException(
        `Insufficient Bleached Fabric stock. Available: ${fabricProduct.currentStockBalance} ${fabricProduct.sku}, Requested: ${dto.fabricQuantityIssued}`
      );
    }

    if (Number(cottonProduct.currentStockBalance) < dto.cottonQuantityIssued) {
      throw new BadRequestException(
        `Insufficient Cotton Roll stock. Available: ${cottonProduct.currentStockBalance} ${cottonProduct.sku}, Requested: ${dto.cottonQuantityIssued}`
      );
    }

    const issuedDate = new Date(dto.issuedDate);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Fabric Input Record
      const fabricInput = await tx.gamjeeMaterialInput.create({
        data: {
          productionBatchId: batch.id,
          materialType: 'BLEACHED_FABRIC',
          productId: dto.fabricProductId,
          inventoryBatchId: dto.fabricInventoryBatchId || null,
          rollOrBatchNumber: dto.fabricRollOrBatchNumber || null,
          quantityIssued: dto.fabricQuantityIssued,
          quantityConsumed: 0,
          quantityRemaining: dto.fabricQuantityIssued,
          uom: dto.fabricUom || 'meter',
          warehouseId: dto.fabricWarehouseId || fabricProduct.storageLocationId || null,
          issuedDate,
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // 2. Create Cotton Input Record
      const cottonInput = await tx.gamjeeMaterialInput.create({
        data: {
          productionBatchId: batch.id,
          materialType: 'COTTON_ROLL',
          productId: dto.cottonProductId,
          inventoryBatchId: dto.cottonInventoryBatchId || null,
          rollOrBatchNumber: dto.cottonRollOrBatchNumber || null,
          quantityIssued: dto.cottonQuantityIssued,
          quantityConsumed: 0,
          quantityRemaining: dto.cottonQuantityIssued,
          uom: dto.cottonUom || 'kg',
          warehouseId: dto.cottonWarehouseId || cottonProduct.storageLocationId || null,
          issuedDate,
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // 3. Deduct Fabric from Raw Material stock
      const newFabricStock = Math.max(0, Number(fabricProduct.currentStockBalance) - dto.fabricQuantityIssued);
      await tx.rawMaterial.update({
        where: { id: dto.fabricProductId },
        data: { currentStockBalance: newFabricStock },
      });

      if (dto.fabricInventoryBatchId) {
        await tx.inventoryBatch.update({
          where: { id: dto.fabricInventoryBatchId },
          data: { quantityRemaining: { decrement: dto.fabricQuantityIssued } },
        });
      }

      if (userId) {
        await tx.inventoryTransaction.create({
          data: {
            rawMaterialId: dto.fabricProductId,
            transactionType: TransactionType.WORK_ORDER_ISSUE,
            quantity: dto.fabricQuantityIssued,
            previousStock: fabricProduct.currentStockBalance,
            newStock: newFabricStock,
            referenceNumber: batch.batchNumber,
            referenceDocumentType: 'GAMJEE_PRODUCTION_BATCH',
            referenceDocumentId: batch.id,
            notes: `Issued Bleached Fabric to Gamjee Batch ${batch.batchNumber}`,
            createdByUserId: userId,
          },
        });
      }

      // 4. Deduct Cotton from Raw Material stock
      const newCottonStock = Math.max(0, Number(cottonProduct.currentStockBalance) - dto.cottonQuantityIssued);
      await tx.rawMaterial.update({
        where: { id: dto.cottonProductId },
        data: { currentStockBalance: newCottonStock },
      });

      if (dto.cottonInventoryBatchId) {
        await tx.inventoryBatch.update({
          where: { id: dto.cottonInventoryBatchId },
          data: { quantityRemaining: { decrement: dto.cottonQuantityIssued } },
        });
      }

      if (userId) {
        await tx.inventoryTransaction.create({
          data: {
            rawMaterialId: dto.cottonProductId,
            transactionType: TransactionType.WORK_ORDER_ISSUE,
            quantity: dto.cottonQuantityIssued,
            previousStock: cottonProduct.currentStockBalance,
            newStock: newCottonStock,
            referenceNumber: batch.batchNumber,
            referenceDocumentType: 'GAMJEE_PRODUCTION_BATCH',
            referenceDocumentId: batch.id,
            notes: `Issued Cotton Roll to Gamjee Batch ${batch.batchNumber}`,
            createdByUserId: userId,
          },
        });
      }

      // 5. Create Material Movements
      await tx.gamjeeMaterialMovement.createMany({
        data: [
          {
            productionBatchId: batch.id,
            referenceType: 'MATERIAL_ISSUE',
            referenceId: fabricInput.id,
            movementType: 'FABRIC_ISSUE_TO_PRODUCTION',
            productId: dto.fabricProductId,
            fromLocationId: dto.fabricWarehouseId || fabricProduct.storageLocationId || null,
            quantity: dto.fabricQuantityIssued,
            uom: dto.fabricUom || 'meter',
            movementDate: issuedDate,
            notes: `Bleached Fabric issued to production floor`,
            createdById: userId || null,
          },
          {
            productionBatchId: batch.id,
            referenceType: 'MATERIAL_ISSUE',
            referenceId: cottonInput.id,
            movementType: 'COTTON_ISSUE_TO_PRODUCTION',
            productId: dto.cottonProductId,
            fromLocationId: dto.cottonWarehouseId || cottonProduct.storageLocationId || null,
            quantity: dto.cottonQuantityIssued,
            uom: dto.cottonUom || 'kg',
            movementDate: issuedDate,
            notes: `Cotton Roll issued to production floor`,
            createdById: userId || null,
          },
        ],
      });

      // 6. Update Batch Stage & Status
      const updatedBatch = await tx.gamjeeProductionBatch.update({
        where: { id: batch.id },
        data: {
          currentQuantity: dto.fabricQuantityIssued,
          currentUom: dto.fabricUom || 'meter',
          currentStage: 'PINNING',
          status: GamjeeProductionStatus.MATERIALS_SELECTED,
        },
        include: {
          finishedProduct: true,
          gamjeeSize: true,
          materialInputs: { include: { product: true } },
        },
      });

      // 7. Audit Status
      await tx.gamjeeBatchStatusHistory.create({
        data: {
          productionBatchId: batch.id,
          oldStatus: batch.status,
          newStatus: GamjeeProductionStatus.MATERIALS_SELECTED,
          changedById: userId || null,
          remarks: `Issued ${dto.fabricQuantityIssued} ${dto.fabricUom || 'meter'} Fabric & ${dto.cottonQuantityIssued} ${dto.cottonUom || 'kg'} Cotton to Batch`,
        },
      });

      return updatedBatch;
    });

    return result;
  }

  /**
   * 3. Record Processing Operation (Pinning, Folding, Cutting)
   */
  async addProcessingOperation(batchId: string, dto: AddGamjeeOperationDto, userId?: string) {
    const batch = await prisma.gamjeeProductionBatch.findUnique({
      where: { id: batchId },
      include: { operations: true, materialInputs: true },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    if (batch.status === GamjeeProductionStatus.COMPLETED || batch.status === GamjeeProductionStatus.CANCELLED) {
      throw new BadRequestException(`Cannot record operations on a ${batch.status} batch`);
    }

    const opType = await prisma.gamjeeOperationMaster.findUnique({
      where: { id: dto.operationTypeId },
    });
    if (!opType) throw new NotFoundException('Operation Type not found');

    const opNumber = await this.generateSequenceNumber('GOP', 'operation');
    const opDate = new Date(dto.operationDate);

    // Determine next stage based on operation code
    let nextStage = 'READY_FOR_ROLLING';
    let nextStatus = GamjeeProductionStatus.READY_FOR_ROLLING;

    if (
      opType.code === 'OP-FABPREP' ||
      opType.code === 'OP-CUT' ||
      opType.code === 'OP-PIN' ||
      opType.code === 'OP-FOLD' ||
      opType.name.toLowerCase().includes('prep') ||
      opType.name.toLowerCase().includes('cut') ||
      opType.name.toLowerCase().includes('pin') ||
      opType.name.toLowerCase().includes('fold')
    ) {
      nextStage = 'READY_FOR_ROLLING';
      nextStatus = GamjeeProductionStatus.READY_FOR_ROLLING;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Operation record
      const operation = await tx.gamjeeProductionOperation.create({
        data: {
          operationNumber: opNumber,
          productionBatchId: batch.id,
          operationTypeId: dto.operationTypeId,
          sequenceNumber: dto.sequenceNumber || batch.operations.length + 1,
          inputQuantity: dto.inputQuantity,
          inputUom: dto.inputUom || 'meter',
          outputQuantity: dto.outputQuantity,
          outputUom: dto.outputUom || 'meter',
          wastageQuantity: dto.wastageQuantity || 0,
          rejectedQuantity: dto.rejectedQuantity || 0,
          employeeId: dto.employeeId || null,
          machineId: dto.machineId || null,
          operationDate: opDate,
          status: 'COMPLETED',
          notes: dto.notes || null,
          createdById: userId || null,
        },
        include: {
          operationType: true,
          employee: true,
        },
      });

      // 2. Create Material Movements
      let movementType = 'FABRIC_AFTER_PINNING';
      if (opType.code === 'OP-FOLD') movementType = 'FABRIC_AFTER_FOLDING';
      if (opType.code === 'OP-CUT') movementType = 'FABRIC_AFTER_CUTTING';

      await tx.gamjeeMaterialMovement.create({
        data: {
          productionBatchId: batch.id,
          referenceType: 'OPERATION',
          referenceId: operation.id,
          movementType,
          quantity: dto.outputQuantity,
          uom: dto.outputUom || 'meter',
          movementDate: opDate,
          notes: `${opType.name} completed: Input ${dto.inputQuantity}, Output ${dto.outputQuantity}`,
          createdById: userId || null,
        },
      });

      if (dto.wastageQuantity && dto.wastageQuantity > 0) {
        await tx.gamjeeMaterialMovement.create({
          data: {
            productionBatchId: batch.id,
            referenceType: 'OPERATION_WASTAGE',
            referenceId: operation.id,
            movementType: 'PRODUCTION_WASTAGE',
            quantity: dto.wastageQuantity,
            uom: dto.outputUom || 'meter',
            movementDate: opDate,
            notes: `Wastage recorded during ${opType.name}: ${dto.wastageQuantity} ${dto.outputUom || 'meter'}`,
            createdById: userId || null,
          },
        });
      }

      if (dto.rejectedQuantity && dto.rejectedQuantity > 0) {
        await tx.gamjeeMaterialMovement.create({
          data: {
            productionBatchId: batch.id,
            referenceType: 'OPERATION_REJECTION',
            referenceId: operation.id,
            movementType: 'PRODUCTION_REJECTION',
            quantity: dto.rejectedQuantity,
            uom: dto.outputUom || 'meter',
            movementDate: opDate,
            notes: `Rejection recorded during ${opType.name}: ${dto.rejectedQuantity} ${dto.outputUom || 'meter'}`,
            createdById: userId || null,
          },
        });
      }

      // 3. Update Batch Current Quantity & Stage
      const updatedBatch = await tx.gamjeeProductionBatch.update({
        where: { id: batch.id },
        data: {
          currentQuantity: dto.outputQuantity,
          currentUom: dto.outputUom || 'meter',
          currentStage: nextStage,
          status: nextStatus,
        },
      });

      // 4. Audit Status
      await tx.gamjeeBatchStatusHistory.create({
        data: {
          productionBatchId: batch.id,
          oldStatus: batch.status,
          newStatus: nextStatus,
          changedById: userId || null,
          remarks: `Completed ${opType.name} (Output: ${dto.outputQuantity} ${dto.outputUom || 'meter'})`,
        },
      });

      return operation;
    });

    return result;
  }

  /**
   * 4. Record Rolling Operation & Finished Rolls Generation
   */
  async createRollingEntry(batchId: string, dto: CreateGamjeeRollingDto, userId?: string) {
    const batch = await prisma.gamjeeProductionBatch.findUnique({
      where: { id: batchId },
      include: {
        finishedProduct: true,
        gamjeeSize: true,
        materialInputs: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    if (batch.status === GamjeeProductionStatus.COMPLETED || batch.status === GamjeeProductionStatus.CANCELLED) {
      throw new BadRequestException(`Cannot roll on a ${batch.status} batch`);
    }

    const fabricInput = batch.materialInputs.find((m) => m.materialType === 'BLEACHED_FABRIC');
    const cottonInput = batch.materialInputs.find((m) => m.materialType === 'COTTON_ROLL');

    if (!fabricInput || !cottonInput) {
      throw new BadRequestException('Batch must have both Bleached Fabric and Cotton Roll issued before rolling');
    }

    const rollingNumber = await this.generateSequenceNumber('GRL', 'rolling');
    const rollBatchNumber = await this.generateSequenceNumber('GFR', 'finished_roll');
    const rollingDate = new Date(dto.rollingDate);

    // Calculate roll lengths if provided
    const singleLength = dto.finishedRollLength || (batch.gamjeeSize ? Number(batch.gamjeeSize.length) : null);
    const singleWidth = dto.finishedRollWidth || (batch.gamjeeSize ? Number(batch.gamjeeSize.width) : null);
    const totalLength = singleLength ? singleLength * dto.finishedRollQuantity : null;

    const destinationWarehouseId = dto.warehouseId || batch.finishedProduct.storageLocationId || null;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Rolling Entry
      const rollingEntry = await tx.gamjeeRollingEntry.create({
        data: {
          rollingNumber,
          productionBatchId: batch.id,
          fabricInputQuantity: dto.fabricInputQuantity,
          fabricInputUom: dto.fabricInputUom || 'meter',
          cottonInputQuantity: dto.cottonInputQuantity,
          cottonInputUom: dto.cottonInputUom || 'kg',
          finishedRollQuantity: dto.finishedRollQuantity,
          finishedRollUom: dto.finishedRollUom || 'Rolls',
          finishedRollLength: singleLength,
          finishedRollLengthUom: dto.finishedRollLengthUom || 'm',
          finishedRollWidth: singleWidth,
          finishedRollWidthUom: dto.finishedRollWidthUom || 'cm',
          wastageQuantity: dto.wastageQuantity || 0,
          rejectedRollQuantity: dto.rejectedRollQuantity || 0,
          employeeId: dto.employeeId || null,
          machineId: dto.machineId || null,
          rollingDate,
          status: 'COMPLETED',
          notes: dto.notes || null,
          createdById: userId || null,
        },
      });

      // 2. Create Finished Rolls Record
      const finishedRoll = await tx.gamjeeFinishedRoll.create({
        data: {
          productionBatchId: batch.id,
          rollingEntryId: rollingEntry.id,
          finishedProductId: batch.finishedProductId,
          rollBatchNumber,
          rollCount: dto.finishedRollQuantity,
          rollLength: singleLength,
          rollLengthUom: dto.finishedRollLengthUom || 'm',
          rollWidth: singleWidth,
          rollWidthUom: dto.finishedRollWidthUom || 'cm',
          totalLength,
          totalLengthUom: 'm',
          qualityStatus: 'PASSED',
          warehouseId: destinationWarehouseId,
          stockStatus: 'IN_STOCK',
        },
      });

      // 3. Update Material Inputs (Consume fabric and cotton)
      await tx.gamjeeMaterialInput.update({
        where: { id: fabricInput.id },
        data: {
          quantityConsumed: { increment: dto.fabricInputQuantity },
          quantityRemaining: { decrement: dto.fabricInputQuantity },
        },
      });

      await tx.gamjeeMaterialInput.update({
        where: { id: cottonInput.id },
        data: {
          quantityConsumed: { increment: dto.cottonInputQuantity },
          quantityRemaining: { decrement: dto.cottonInputQuantity },
        },
      });

      // 4. Update Finished Goods Inventory Stock
      const newStock = Number(batch.finishedProduct.currentStockBalance) + dto.finishedRollQuantity;
      await tx.rawMaterial.update({
        where: { id: batch.finishedProductId },
        data: { currentStockBalance: newStock },
      });

      if (userId) {
        await tx.inventoryTransaction.create({
          data: {
            rawMaterialId: batch.finishedProductId,
            transactionType: TransactionType.PURCHASE_RECEIPT,
            quantity: dto.finishedRollQuantity,
            previousStock: batch.finishedProduct.currentStockBalance,
            newStock,
            referenceNumber: batch.batchNumber,
            referenceDocumentType: 'GAMJEE_PRODUCTION_BATCH',
            referenceDocumentId: batch.id,
            notes: `Received ${dto.finishedRollQuantity} Gamjee Rolls into stock from Batch ${batch.batchNumber}`,
            createdByUserId: userId,
          },
        });
      }

      // 5. Create Material Movements
      await tx.gamjeeMaterialMovement.createMany({
        data: [
          {
            productionBatchId: batch.id,
            referenceType: 'ROLLING_FABRIC',
            referenceId: rollingEntry.id,
            movementType: 'FABRIC_CONSUMPTION_FOR_ROLLING',
            quantity: dto.fabricInputQuantity,
            uom: dto.fabricInputUom || 'meter',
            movementDate: rollingDate,
            notes: `Fabric consumed during rolling: ${dto.fabricInputQuantity} ${dto.fabricInputUom || 'meter'}`,
            createdById: userId || null,
          },
          {
            productionBatchId: batch.id,
            referenceType: 'ROLLING_COTTON',
            referenceId: rollingEntry.id,
            movementType: 'COTTON_CONSUMPTION_FOR_ROLLING',
            quantity: dto.cottonInputQuantity,
            uom: dto.cottonInputUom || 'kg',
            movementDate: rollingDate,
            notes: `Cotton consumed during rolling: ${dto.cottonInputQuantity} ${dto.cottonInputUom || 'kg'}`,
            createdById: userId || null,
          },
          {
            productionBatchId: batch.id,
            referenceType: 'FINISHED_ROLLS',
            referenceId: finishedRoll.id,
            movementType: 'FINISHED_GAMJEE_ROLL_RECEIPT',
            productId: batch.finishedProductId,
            toLocationId: destinationWarehouseId,
            quantity: dto.finishedRollQuantity,
            uom: dto.finishedRollUom || 'Rolls',
            movementDate: rollingDate,
            notes: `Manufactured ${dto.finishedRollQuantity} finished Gamjee Rolls (Lot: ${rollBatchNumber})`,
            createdById: userId || null,
          },
        ],
      });

      if (dto.wastageQuantity && dto.wastageQuantity > 0) {
        await tx.gamjeeMaterialMovement.create({
          data: {
            productionBatchId: batch.id,
            referenceType: 'ROLLING_WASTAGE',
            referenceId: rollingEntry.id,
            movementType: 'PRODUCTION_WASTAGE',
            quantity: dto.wastageQuantity,
            uom: dto.fabricInputUom || 'meter',
            movementDate: rollingDate,
            notes: `Rolling wastage: ${dto.wastageQuantity}`,
            createdById: userId || null,
          },
        });
      }

      // 6. Complete Batch
      const shouldComplete = dto.markBatchCompleted !== false;
      const finalStatus = shouldComplete ? GamjeeProductionStatus.COMPLETED : GamjeeProductionStatus.ROLLING;
      const finalStage = shouldComplete ? 'COMPLETED' : 'ROLLING';

      await tx.gamjeeProductionBatch.update({
        where: { id: batch.id },
        data: {
          productionQuantity: dto.finishedRollQuantity,
          productionUom: dto.finishedRollUom || 'Rolls',
          currentStage: finalStage,
          status: finalStatus,
          completionDate: shouldComplete ? rollingDate : null,
        },
      });

      // 7. Audit Status
      await tx.gamjeeBatchStatusHistory.create({
        data: {
          productionBatchId: batch.id,
          oldStatus: batch.status,
          newStatus: finalStatus,
          changedById: userId || null,
          remarks: `Rolling completed. Produced ${dto.finishedRollQuantity} Gamjee Rolls (Lot: ${rollBatchNumber})`,
        },
      });

      return { rollingEntry, finishedRoll };
    });

    return result;
  }

  /**
   * 5. Update Batch Status (e.g. ON_HOLD, CANCELLED, etc.)
   */
  async updateStatus(batchId: string, newStatus: GamjeeProductionStatus, remarks?: string, userId?: string) {
    const batch = await prisma.gamjeeProductionBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.gamjeeProductionBatch.update({
        where: { id: batchId },
        data: { status: newStatus },
      });

      await tx.gamjeeBatchStatusHistory.create({
        data: {
          productionBatchId: batchId,
          oldStatus: batch.status,
          newStatus,
          changedById: userId || null,
          remarks: remarks || `Batch status updated to ${newStatus}`,
        },
      });

      return b;
    });

    return updated;
  }

  /**
   * 6. Complete Traceability Chain
   */
  async getTraceability(batchId: string) {
    const batch: any = await this.getBatchById(batchId);

    const fabricInput = batch.materialInputs?.find((m: any) => m.materialType === 'BLEACHED_FABRIC');
    const cottonInput = batch.materialInputs?.find((m: any) => m.materialType === 'COTTON_ROLL');

    return {
      batchSummary: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        productName: batch.finishedProduct.name,
        size: batch.gamjeeSize ? batch.gamjeeSize.name : 'Standard',
        status: batch.status,
        currentStage: batch.currentStage,
        productionDate: batch.productionDate,
        completionDate: batch.completionDate,
        totalRolls: (batch.finishedRolls || []).reduce((acc: number, r: any) => acc + (r.rollCount || 0), 0),
      },
      forwardTraceability: {
        rawMaterials: {
          bleachedFabric: fabricInput
            ? {
                product: fabricInput.product?.name,
                sku: fabricInput.product?.sku,
                lotNumber: fabricInput.rollOrBatchNumber || fabricInput.inventoryBatch?.batchNumber || 'N/A',
                quantityIssued: fabricInput.quantityIssued,
                uom: fabricInput.uom,
              }
            : null,
          cottonRoll: cottonInput
            ? {
                product: cottonInput.product?.name,
                sku: cottonInput.product?.sku,
                lotNumber: cottonInput.rollOrBatchNumber || cottonInput.inventoryBatch?.batchNumber || 'N/A',
                quantityIssued: cottonInput.quantityIssued,
                uom: cottonInput.uom,
              }
            : null,
        },
        operations: (batch.operations || []).map((op: any) => ({
          operation: op.operationType?.name,
          sequence: op.sequenceNumber,
          input: op.inputQuantity,
          output: op.outputQuantity,
          wastage: op.wastageQuantity,
          operator: op.employee ? `${op.employee.firstName} ${op.employee.lastName}` : 'Unassigned',
          date: op.operationDate,
        })),
        rolling: (batch.rollingEntries || []).map((rl: any) => ({
          rollingNumber: rl.rollingNumber,
          fabricUsed: rl.fabricInputQuantity,
          cottonUsed: rl.cottonInputQuantity,
          rollsProduced: rl.finishedRollQuantity,
          rollLength: rl.finishedRollLength,
          operator: rl.employee ? `${rl.employee.firstName} ${rl.employee.lastName}` : 'Unassigned',
          date: rl.rollingDate,
        })),
        finishedGoods: (batch.finishedRolls || []).map((fr: any) => ({
          rollBatchNumber: fr.rollBatchNumber,
          rollCount: fr.rollCount,
          totalLength: fr.totalLength,
          warehouse: fr.warehouse ? fr.warehouse.name : 'Main FG Warehouse',
          quality: fr.qualityStatus,
        })),
      },
      materialMovements: batch.materialMovements,
    };
  }

  /**
   * 7. Generate specialized reports
   */
  async getReports(type: 'production' | 'consumption' | 'wastage' | 'finished_goods') {
    if (type === 'production') {
      const batches = await prisma.gamjeeProductionBatch.findMany({
        include: {
          finishedProduct: true,
          gamjeeSize: true,
          materialInputs: true,
          rollingEntries: true,
          finishedRolls: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return batches.map((b) => {
        const fabric = b.materialInputs.find((m) => m.materialType === 'BLEACHED_FABRIC');
        const cotton = b.materialInputs.find((m) => m.materialType === 'COTTON_ROLL');
        const rollsCount = b.finishedRolls.reduce((acc, r) => acc + r.rollCount, 0);
        const totalLen = b.finishedRolls.reduce((acc, r) => acc + Number(r.totalLength || 0), 0);

        return {
          batchNumber: b.batchNumber,
          product: b.finishedProduct.name,
          size: b.gamjeeSize?.name || 'Standard',
          fabricUsed: fabric ? Number(fabric.quantityConsumed || fabric.quantityIssued) : 0,
          cottonUsed: cotton ? Number(cotton.quantityConsumed || cotton.quantityIssued) : 0,
          finishedRolls: rollsCount,
          totalLength: totalLen,
          status: b.status,
          productionDate: b.productionDate,
          completionDate: b.completionDate,
        };
      });
    }

    if (type === 'consumption') {
      const inputs = await prisma.gamjeeMaterialInput.findMany({
        include: {
          productionBatch: {
            include: { finishedProduct: true, gamjeeSize: true },
          },
          product: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return inputs.map((inp) => ({
        batchNumber: inp.productionBatch.batchNumber,
        finishedProduct: inp.productionBatch.finishedProduct.name,
        size: inp.productionBatch.gamjeeSize?.name || 'Standard',
        materialType: inp.materialType,
        rawMaterial: inp.product.name,
        quantityIssued: Number(inp.quantityIssued),
        quantityConsumed: Number(inp.quantityConsumed || 0),
        quantityRemaining: Number(inp.quantityRemaining || 0),
        uom: inp.uom,
        issuedDate: inp.issuedDate,
      }));
    }

    if (type === 'wastage') {
      const operations = await prisma.gamjeeProductionOperation.findMany({
        include: {
          productionBatch: {
            include: { finishedProduct: true, gamjeeSize: true },
          },
          operationType: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return operations.map((op) => {
        const inp = Number(op.inputQuantity) || 0;
        const out = Number(op.outputQuantity) || 0;
        const waste = Number(op.wastageQuantity) || 0;
        const wastePct = inp > 0 ? ((waste / inp) * 100).toFixed(2) : '0.00';

        return {
          batchNumber: op.productionBatch.batchNumber,
          product: op.productionBatch.finishedProduct.name,
          operation: op.operationType.name,
          inputQuantity: inp,
          outputQuantity: out,
          wastageQuantity: waste,
          rejectedQuantity: Number(op.rejectedQuantity) || 0,
          wastagePercentage: `${wastePct}%`,
          operationDate: op.operationDate,
        };
      });
    }

    if (type === 'finished_goods') {
      const finishedRolls = await prisma.gamjeeFinishedRoll.findMany({
        include: {
          productionBatch: {
            include: { gamjeeSize: true },
          },
          finishedProduct: true,
          warehouse: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return finishedRolls.map((fr) => ({
        batchNumber: fr.productionBatch.batchNumber,
        lotNumber: fr.rollBatchNumber,
        product: fr.finishedProduct.name,
        size: fr.productionBatch.gamjeeSize?.name || `${fr.rollWidth || 15} cm x ${fr.rollLength || 8} m`,
        rollCount: fr.rollCount,
        rollLength: Number(fr.rollLength || 0),
        totalLength: Number(fr.totalLength || 0),
        warehouse: fr.warehouse?.name || 'Main Warehouse',
        stockStatus: fr.stockStatus,
        createdAt: fr.createdAt,
      }));
    }

    return [];
  }

  /**
   * Master Data APIs
   */
  async getMasters() {
    const [sizes, operations, products, cottonSpecs] = await Promise.all([
      prisma.gamjeeSizeMaster.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      prisma.gamjeeOperationMaster.findMany({ where: { active: true }, orderBy: { sequence: 'asc' } }),
      prisma.gamjeeProductMaster.findMany({ where: { active: true }, orderBy: { productName: 'asc' } }),
      (prisma as any).gamjeeCottonSpecification.findMany({
        where: { active: true },
        orderBy: [{ cottonType: 'asc' }, { gamjeeWidthCm: 'asc' }],
      }),
    ]);

    return { sizes, operations, products, cottonSpecs: cottonSpecs || [] };
  }

  async createSize(dto: CreateGamjeeSizeDto) {
    return prisma.gamjeeSizeMaster.create({ data: dto });
  }

  async updateSize(id: string, dto: Partial<CreateGamjeeSizeDto>) {
    const size = await prisma.gamjeeSizeMaster.findUnique({ where: { id } });
    if (!size) throw new NotFoundException(`Size with ID ${id} not found`);
    return prisma.gamjeeSizeMaster.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSize(id: string) {
    const size = await prisma.gamjeeSizeMaster.findUnique({ where: { id } });
    if (!size) throw new NotFoundException(`Size with ID ${id} not found`);
    return prisma.gamjeeSizeMaster.delete({
      where: { id },
    });
  }

  async createOperation(dto: CreateGamjeeOperationTypeDto) {
    return prisma.gamjeeOperationMaster.create({ data: dto });
  }

  async updateOperation(id: string, dto: Partial<CreateGamjeeOperationTypeDto>) {
    const op = await prisma.gamjeeOperationMaster.findUnique({ where: { id } });
    if (!op) throw new NotFoundException(`Operation with ID ${id} not found`);
    return prisma.gamjeeOperationMaster.update({
      where: { id },
      data: dto,
    });
  }

  async deleteOperation(id: string) {
    const op = await prisma.gamjeeOperationMaster.findUnique({ where: { id } });
    if (!op) throw new NotFoundException(`Operation with ID ${id} not found`);
    return prisma.gamjeeOperationMaster.delete({
      where: { id },
    });
  }

  async createProductMaster(dto: CreateGamjeeProductMasterDto) {
    return prisma.gamjeeProductMaster.create({ data: dto });
  }

  async updateProductMaster(id: string, dto: Partial<CreateGamjeeProductMasterDto>) {
    const prod = await prisma.gamjeeProductMaster.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException(`Product master with ID ${id} not found`);
    return prisma.gamjeeProductMaster.update({
      where: { id },
      data: dto,
    });
  }

  async deleteProductMaster(id: string) {
    const prod = await prisma.gamjeeProductMaster.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException(`Product master with ID ${id} not found`);
    return prisma.gamjeeProductMaster.delete({
      where: { id },
    });
  }

  /**
   * Cotton Roll Specification Master APIs
   */
  async createCottonSpec(dto: CreateGamjeeCottonSpecDto) {
    if (dto.weightKg <= 0) throw new BadRequestException('Cotton weight must be greater than 0');
    if (dto.web <= 0) throw new BadRequestException('Web must be greater than 0');
    if (dto.gamjeeWidthCm <= 0) throw new BadRequestException('Gamjee width must be greater than 0');
    if (dto.piecesPerRoll <= 0) throw new BadRequestException('Pieces per roll must be greater than 0');

    // Duplicate check for compound key: cottonType + weightKg + web + gamjeeWidthCm
    const existing = await (prisma as any).gamjeeCottonSpecification.findFirst({
      where: {
        cottonType: dto.cottonType,
        weightKg: dto.weightKg,
        web: dto.web,
        gamjeeWidthCm: dto.gamjeeWidthCm,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Cotton specification for "${dto.cottonType}" (${dto.weightKg} KG, Web: ${dto.web}) with Gamjee Width ${dto.gamjeeWidthCm} CM already exists.`
      );
    }

    return (prisma as any).gamjeeCottonSpecification.create({
      data: {
        cottonType: dto.cottonType,
        weightKg: dto.weightKg,
        web: dto.web,
        gamjeeWidthCm: dto.gamjeeWidthCm,
        piecesPerRoll: dto.piecesPerRoll,
        description: dto.description || null,
        active: dto.active ?? true,
      },
    });
  }

  async updateCottonSpec(id: string, dto: Partial<CreateGamjeeCottonSpecDto>) {
    const spec = await (prisma as any).gamjeeCottonSpecification.findUnique({ where: { id } });
    if (!spec) throw new NotFoundException(`Cotton specification with ID ${id} not found`);

    if (dto.weightKg !== undefined && dto.weightKg <= 0) throw new BadRequestException('Cotton weight must be greater than 0');
    if (dto.web !== undefined && dto.web <= 0) throw new BadRequestException('Web must be greater than 0');
    if (dto.gamjeeWidthCm !== undefined && dto.gamjeeWidthCm <= 0) throw new BadRequestException('Gamjee width must be greater than 0');
    if (dto.piecesPerRoll !== undefined && dto.piecesPerRoll <= 0) throw new BadRequestException('Pieces per roll must be greater than 0');

    if (dto.cottonType || dto.weightKg !== undefined || dto.web !== undefined || dto.gamjeeWidthCm !== undefined) {
      const cottonType = dto.cottonType ?? spec.cottonType;
      const weightKg = dto.weightKg !== undefined ? dto.weightKg : Number(spec.weightKg);
      const web = dto.web !== undefined ? dto.web : Number(spec.web);
      const gamjeeWidthCm = dto.gamjeeWidthCm !== undefined ? dto.gamjeeWidthCm : Number(spec.gamjeeWidthCm);

      const duplicate = await (prisma as any).gamjeeCottonSpecification.findFirst({
        where: {
          cottonType,
          weightKg,
          web,
          gamjeeWidthCm,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Cotton specification for "${cottonType}" (${weightKg} KG, Web: ${web}) with Gamjee Width ${gamjeeWidthCm} CM already exists.`
        );
      }
    }

    return (prisma as any).gamjeeCottonSpecification.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCottonSpec(id: string) {
    const spec = await (prisma as any).gamjeeCottonSpecification.findUnique({ where: { id } });
    if (!spec) throw new NotFoundException(`Cotton specification with ID ${id} not found`);
    return (prisma as any).gamjeeCottonSpecification.delete({
      where: { id },
    });
  }

  /**
   * Helper to find matching cotton specification for automatic piece count calculation
   */
  async findCottonSpec(cottonType: string, gamjeeWidthCm: number) {
    return (prisma as any).gamjeeCottonSpecification.findFirst({
      where: {
        cottonType,
        gamjeeWidthCm,
        active: true,
      },
    });
  }
}
