import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { prisma, TransactionType, Prisma } from '@ims/database';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { StockTransactionDto } from './dto/stock-transaction.dto';

@Injectable()
export class RawMaterialsService {
  /**
   * Helper to generate unique material code if not provided
   */
  async generateMaterialCode(prefixType: 'RM' | 'PM' | 'FG' = 'RM'): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `${prefixType}-${year}-`;
    const count = await prisma.rawMaterial.count();
    const seq = String(count + 1).padStart(4, '0');
    let code = `${prefix}${seq}`;
    let exists = await prisma.rawMaterial.findUnique({ where: { sku: code } });
    let counter = count + 1;
    while (exists) {
      counter++;
      code = `${prefix}${String(counter).padStart(4, '0')}`;
      exists = await prisma.rawMaterial.findUnique({ where: { sku: code } });
    }
    return code;
  }

  /**
   * List raw materials with search, category, supplier, location, stock status filters and pagination
   */
  async findAll(query: {
    search?: string;
    categoryId?: string;
    supplierId?: string;
    storageLocationId?: string;
    stockStatus?: 'OPTIMAL' | 'LOW_STOCK' | 'OVERSTOCK' | 'OUT_OF_STOCK';
    type?: 'ALL' | 'RM' | 'PM' | 'FG';
    itemSource?: 'ALL' | 'MANUFACTURED' | 'TRADED';
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.RawMaterialWhereInput = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }
    if (query.storageLocationId) {
      where.storageLocationId = query.storageLocationId;
    }

    if (query.search) {
      where.OR = [
        { sku: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { hsnCode: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Helper to identify Packaging Materials
    const isItemPM = (item: any) => {
      const sku = item.sku || '';
      if (
        sku.startsWith('PM-') ||
        sku.startsWith('PKG-') ||
        sku.startsWith('BX-') ||
        sku.startsWith('TP-') ||
        sku.startsWith('CV-')
      ) {
        return true;
      }
      const catName = item.category?.name?.toLowerCase() || '';
      const name = item.name?.toLowerCase() || '';
      if (
        catName.includes('packaging') ||
        catName.includes('box') ||
        catName.includes('cover') ||
        catName.includes('tape') ||
        catName.includes('carton') ||
        catName.includes('pouch') ||
        catName.includes('bag') ||
        catName.includes('wrapper') ||
        name.includes('box') ||
        name.includes('tape') ||
        name.includes('cover') ||
        name.includes('carton') ||
        name.includes('pouch') ||
        name.includes('polybag') ||
        name.includes('poly bag') ||
        name.includes('roll tape') ||
        name.includes('corrugated')
      ) {
        return true;
      }
      return false;
    };

    // Helper to identify Finished Goods
    const isItemFG = (item: any) => {
      const sku = item.sku || '';
      if (sku.startsWith('FP-') || sku.startsWith('FG-') || sku.startsWith('PROD-')) return true;
      if (isItemPM(item)) return false;
      if (sku.startsWith('RM-')) return false;
      const catName = item.category?.name?.toLowerCase() || '';
      if (
        catName.includes('raw') ||
        catName.includes('yarn') ||
        catName.includes('cotton') ||
        catName.includes('liquid') ||
        catName.includes('chemical') ||
        catName.includes('botanical') ||
        catName.includes('component') ||
        catName.includes('metals')
      ) {
        return false;
      }
      return true;
    };

    // Fetch all materials matching basic filter to evaluate stock status in database or post-query
    const [rawItems, total] = await Promise.all([
      prisma.rawMaterial.findMany({
        where,
        include: {
          category: true,
          unit: true,
          secondaryUnit: true,
          supplier: true,
          storageLocation: true,
          _count: {
            select: {
              inventoryTransactions: true,
              issuedJobWorkOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rawMaterial.count({ where }),
    ]);

    // Format & filter by stockStatus, type, and itemSource
    const items = rawItems
      .map((item) => {
        const current = Math.max(0, Number(item.currentStockBalance));
        const min = Math.max(0, Number(item.minimumStockLevel));
        const max = Math.max(0, Number(item.maximumStockLevel));
        const reserved = Math.max(0, Number(item.reservedStock));
        const available = Math.max(0, current - reserved);

        let status: 'OPTIMAL' | 'LOW_STOCK' | 'OVERSTOCK' | 'OUT_OF_STOCK' = 'OPTIMAL';
        if (current <= 0) {
          status = 'OUT_OF_STOCK';
        } else if (current <= min) {
          status = 'LOW_STOCK';
        } else if (max > 0 && current > max) {
          status = 'OVERSTOCK';
        }

        const isPM = isItemPM(item);
        const isFG = !isPM && isItemFG(item);
        const isRM = !isPM && !isFG;

        return {
          ...item,
          currentStockBalance: current,
          minimumStockLevel: min,
          maximumStockLevel: max,
          reservedStock: reserved,
          availableStock: available,
          reorderQuantity: Number(item.reorderQuantity),
          unitCost: Number(item.unitCost),
          lastPurchaseRate: Number(item.lastPurchaseRate),
          avgCost: Number(item.avgCost),
          gstRate: Number(item.gstRate),
          computedStatus: status,
          isPackagingMaterial: isPM,
          isFinishedGood: isFG,
          isRawMaterial: isRM,
          classification: isPM ? 'PM' : isFG ? 'FG' : 'RM',
          itemSource: (item.itemSource || 'MANUFACTURED') as 'MANUFACTURED' | 'TRADED',
        };
      })
      .filter((item) => {
        if (!query.stockStatus) return true;
        return item.computedStatus === query.stockStatus;
      })
      .filter((item) => {
        if (!query.type || query.type === 'ALL') return true;
        if (query.type === 'PM') return item.isPackagingMaterial;
        if (query.type === 'FG') return item.isFinishedGood;
        if (query.type === 'RM') return item.isRawMaterial;
        return true;
      })
      .filter((item) => {
        if (!query.itemSource || query.itemSource === 'ALL') return true;
        return (item.itemSource || 'MANUFACTURED') === query.itemSource;
      });

    const paginatedItems = items.slice(skip, skip + limit);

    // Calculate Summary Stats
    const totalSkus = rawItems.length;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let packagingSkusCount = 0;
    let packagingValuation = 0;
    let manufacturedFgCount = 0;
    let manufacturedFgValuation = 0;
    let tradedFgCount = 0;
    let tradedFgValuation = 0;

    rawItems.forEach((m) => {
      const current = Number(m.currentStockBalance);
      const cost = Number(m.avgCost) || Number(m.unitCost) || 0;
      const val = current * cost;
      totalValuation += val;

      if (isItemPM(m)) {
        packagingSkusCount++;
        packagingValuation += val;
      }

      const isFG = !isItemPM(m) && isItemFG(m);
      if (isFG) {
        if (m.itemSource === 'TRADED') {
          tradedFgCount++;
          tradedFgValuation += val;
        } else {
          manufacturedFgCount++;
          manufacturedFgValuation += val;
        }
      }

      if (current <= 0) outOfStockCount++;
      else if (current <= Number(m.minimumStockLevel)) lowStockCount++;
    });

    return {
      items: paginatedItems,
      meta: {
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit) || 1,
      },
      stats: {
        totalSkus,
        totalValuation,
        lowStockCount,
        outOfStockCount,
        packagingSkusCount,
        packagingValuation,
        manufacturedFgCount,
        manufacturedFgValuation,
        tradedFgCount,
        tradedFgValuation,
      },
    };
  }

  /**
   * Get single material details with full linked relations and 6-month transaction history
   */
  async findOne(id: string) {
    const item = await prisma.rawMaterial.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        secondaryUnit: true,
        supplier: true,
        storageLocation: true,
        inventoryTransactions: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, email: true },
            },
          },
        },
        issuedJobWorkOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            jobWorkCompany: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Raw material with ID ${id} not found`);
    }

    const current = Math.max(0, Number(item.currentStockBalance));
    const min = Math.max(0, Number(item.minimumStockLevel));
    const max = Math.max(0, Number(item.maximumStockLevel));
    const reserved = Math.max(0, Number(item.reservedStock));
    const available = Math.max(0, current - reserved);

    return {
      ...item,
      currentStockBalance: current,
      minimumStockLevel: min,
      maximumStockLevel: max,
      reservedStock: reserved,
      availableStock: available,
      unitCost: Number(item.unitCost),
      lastPurchaseRate: Number(item.lastPurchaseRate),
      avgCost: Number(item.avgCost),
      gstRate: Number(item.gstRate),
      reorderQuantity: Number(item.reorderQuantity),
    };
  }

  /**
   * Create a new Raw Material Master Item
   */
  async create(dto: CreateRawMaterialDto, userId: string) {
    // Generate code if missing
    let sku = dto.sku;
    if (!sku) {
      sku = await this.generateMaterialCode();
    }

    // Check duplicate code
    const existingSku = await prisma.rawMaterial.findUnique({ where: { sku } });
    if (existingSku) {
      throw new ConflictException(`Material Code ${sku} already exists.`);
    }

    // Check duplicate name
    const existingName = await prisma.rawMaterial.findFirst({
      where: { name: { equals: dto.name, mode: 'insensitive' } },
    });
    if (existingName) {
      throw new ConflictException(`Raw material with name "${dto.name}" already exists.`);
    }

    // Validate Min <= Max stock
    if (dto.maximumStockLevel && dto.maximumStockLevel > 0 && dto.minimumStockLevel > dto.maximumStockLevel) {
      throw new BadRequestException('Minimum stock level cannot be greater than Maximum stock level.');
    }

    const initialStock = dto.initialStock || 0;
    const unitCost = dto.unitCost || 0;

    return await prisma.$transaction(async (tx) => {
      const material = await tx.rawMaterial.create({
        data: {
          sku,
          name: dto.name,
          description: dto.description,
          hsnCode: dto.hsnCode,
          minimumStockLevel: dto.minimumStockLevel,
          maximumStockLevel: dto.maximumStockLevel || 0,
          reorderQuantity: dto.reorderQuantity || 0,
          currentStockBalance: initialStock,
          reservedStock: 0,
          unitCost: unitCost,
          lastPurchaseRate: unitCost,
          avgCost: unitCost,
          gstRate: dto.gstRate || 0,
          remarks: dto.remarks,
          isActive: dto.isActive ?? true,
          brand: dto.brand,
          itemSource: dto.itemSource || 'MANUFACTURED',
          size: dto.size,
          dimensionInches: dto.dimensionInches,
          dimensionCm: dto.dimensionCm,
          packSize: dto.packSize,
          innerPackQty: dto.innerPackQty,
          packUnit: dto.packUnit,
          boxSize: dto.boxSize,
          masterCartonQty: dto.masterCartonQty,
          features: dto.features,
          variantType: dto.variantType,
          secondaryUnitId: dto.secondaryUnitId || null,
          conversionFactor: dto.conversionFactor || null,
          secondaryUnitName: dto.secondaryUnitName || null,
          categoryId: dto.categoryId || null,
          unitId: dto.unitId || null,
          supplierId: dto.supplierId || null,
          storageLocationId: dto.storageLocationId || null,
        },
        include: {
          category: true,
          unit: true,
          secondaryUnit: true,
          supplier: true,
          storageLocation: true,
        },
      });

      // Record initial stock transaction if initialStock > 0
      if (initialStock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            rawMaterialId: material.id,
            transactionType: TransactionType.PURCHASE_RECEIPT,
            quantity: initialStock,
            previousStock: 0,
            newStock: initialStock,
            unitPrice: unitCost,
            notes: 'Initial Stock Balance Setup',
            createdByUserId: userId,
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_RAW_MATERIAL',
          entityName: 'RawMaterial',
          entityId: material.id,
          newValues: JSON.parse(JSON.stringify(material)),
          userId,
        },
      });

      return material;
    });
  }

  /**
   * Update Raw Material details
   */
  async update(id: string, dto: UpdateRawMaterialDto, userId: string) {
    const existing = await prisma.rawMaterial.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Raw material with ID ${id} not found.`);
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const duplicateSku = await prisma.rawMaterial.findUnique({ where: { sku: dto.sku } });
      if (duplicateSku) {
        throw new ConflictException(`Material Code ${dto.sku} already exists.`);
      }
    }

    if (dto.name && dto.name !== existing.name) {
      const duplicateName = await prisma.rawMaterial.findFirst({
        where: { name: { equals: dto.name, mode: 'insensitive' }, id: { not: id } },
      });
      if (duplicateName) {
        throw new ConflictException(`Raw material name "${dto.name}" already exists.`);
      }
    }

    const minStock = dto.minimumStockLevel ?? Number(existing.minimumStockLevel);
    const maxStock = dto.maximumStockLevel ?? Number(existing.maximumStockLevel);
    if (maxStock > 0 && minStock > maxStock) {
      throw new BadRequestException('Minimum stock level cannot be greater than Maximum stock level.');
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.rawMaterial.update({
        where: { id },
        data: {
          sku: dto.sku,
          name: dto.name,
          description: dto.description,
          hsnCode: dto.hsnCode,
          minimumStockLevel: dto.minimumStockLevel,
          maximumStockLevel: dto.maximumStockLevel,
          reorderQuantity: dto.reorderQuantity,
          unitCost: dto.unitCost,
          gstRate: dto.gstRate,
          remarks: dto.remarks,
          isActive: dto.isActive,
          brand: dto.brand,
          itemSource: dto.itemSource !== undefined ? dto.itemSource : undefined,
          size: dto.size,
          dimensionInches: dto.dimensionInches,
          dimensionCm: dto.dimensionCm,
          packSize: dto.packSize,
          innerPackQty: dto.innerPackQty,
          packUnit: dto.packUnit,
          boxSize: dto.boxSize,
          masterCartonQty: dto.masterCartonQty,
          features: dto.features,
          variantType: dto.variantType,
          secondaryUnitId: dto.secondaryUnitId !== undefined ? dto.secondaryUnitId : undefined,
          conversionFactor: dto.conversionFactor !== undefined ? dto.conversionFactor : undefined,
          secondaryUnitName: dto.secondaryUnitName !== undefined ? dto.secondaryUnitName : undefined,
          categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
          unitId: dto.unitId !== undefined ? dto.unitId : undefined,
          supplierId: dto.supplierId !== undefined ? dto.supplierId : undefined,
          storageLocationId: dto.storageLocationId !== undefined ? dto.storageLocationId : undefined,
        },
        include: {
          category: true,
          unit: true,
          secondaryUnit: true,
          supplier: true,
          storageLocation: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'UPDATE_RAW_MATERIAL',
          entityName: 'RawMaterial',
          entityId: id,
          oldValues: JSON.parse(JSON.stringify(existing)),
          newValues: JSON.parse(JSON.stringify(updated)),
          userId,
        },
      });

      return updated;
    });
  }

  /**
   * Delete or soft-delete raw material
   */
  async remove(id: string, userId: string) {
    const existing = await prisma.rawMaterial.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventoryTransactions: true,
            issuedJobWorkOrders: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Raw material with ID ${id} not found.`);
    }

    // Strict safety check: If material has history, prevent hard deletion
    if (existing._count.inventoryTransactions > 0 || existing._count.issuedJobWorkOrders > 0) {
      // Perform soft delete by setting isActive: false
      const deactivated = await prisma.rawMaterial.update({
        where: { id },
        data: { isActive: false },
      });

      await prisma.auditLog.create({
        data: {
          action: 'DEACTIVATE_RAW_MATERIAL',
          entityName: 'RawMaterial',
          entityId: id,
          oldValues: { note: 'Soft deleted because transactions exist' },
          userId,
        },
      });

      return {
        message: 'Material deactivated (soft deleted) because transaction history exists.',
        material: deactivated,
      };
    }

    return await prisma.$transaction(async (tx) => {
      const deleted = await tx.rawMaterial.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          action: 'DELETE_RAW_MATERIAL',
          entityName: 'RawMaterial',
          entityId: id,
          oldValues: JSON.parse(JSON.stringify(existing)),
          userId,
        },
      });

      return { message: 'Raw material deleted successfully', material: deleted };
    });
  }

  /**
   * Perform stock movement transaction (Adjustment, Receipt, Manual Correction, Transfer)
   * Enforces strict stock non-negativity constraint.
   */
  async recordStockTransaction(id: string, dto: StockTransactionDto, userId: string) {
    const material = await prisma.rawMaterial.findUnique({ where: { id } });
    if (!material) {
      throw new NotFoundException(`Raw material with ID ${id} not found.`);
    }

    const currentStock = Number(material.currentStockBalance);
    const qty = Number(dto.quantity);
    let delta = 0;

    const additionTypes: TransactionType[] = [
      TransactionType.PURCHASE_RECEIPT,
      TransactionType.ADJUSTMENT_ADD,
      TransactionType.JOB_WORK_RETURN,
      TransactionType.MANUAL_CORRECTION,
    ];

    const subtractionTypes: TransactionType[] = [
      TransactionType.WORK_ORDER_ISSUE,
      TransactionType.JOB_WORK_DISPATCH,
      TransactionType.ADJUSTMENT_SUBTRACT,
    ];

    const isAddition = additionTypes.includes(dto.transactionType);
    const isSubtraction = subtractionTypes.includes(dto.transactionType);

    if (isAddition) {
      delta = qty;
    } else if (isSubtraction) {
      delta = -qty;
    } else if (dto.transactionType === TransactionType.TRANSFER) {
      delta = -qty; // Transfer out of current location
    }

    const newStock = currentStock + delta;

    // Strict Non-Negative Stock Enforcement
    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock balance. Current stock is ${currentStock}, requested adjustment is ${delta}, which results in negative stock (${newStock}).`
      );
    }

    const unitPrice = dto.unitPrice || Number(material.unitCost) || 0;

    // Calculate moving average cost if purchase receipt
    let newAvgCost = Number(material.avgCost);
    let lastPurchaseRate = Number(material.lastPurchaseRate);
    if (dto.transactionType === TransactionType.PURCHASE_RECEIPT && qty > 0) {
      lastPurchaseRate = unitPrice;
      const currentTotalValuation = currentStock * newAvgCost;
      const additionValuation = qty * unitPrice;
      newAvgCost = (currentTotalValuation + additionValuation) / (currentStock + qty);
    }

    return await prisma.$transaction(async (tx) => {
      // Update Raw Material balance
      const updatedMaterial = await tx.rawMaterial.update({
        where: { id },
        data: {
          currentStockBalance: newStock,
          avgCost: newAvgCost,
          lastPurchaseRate: lastPurchaseRate,
          unitCost: unitPrice > 0 ? unitPrice : material.unitCost,
        },
      });

      // Create immutable transaction ledger record
      const transaction = await tx.inventoryTransaction.create({
        data: {
          rawMaterialId: id,
          transactionType: dto.transactionType,
          quantity: qty,
          previousStock: currentStock,
          newStock: newStock,
          unitPrice: unitPrice,
          referenceNumber: dto.referenceNumber || null,
          referenceDocumentType: dto.referenceDocumentType || null,
          referenceDocumentId: dto.referenceDocumentId || null,
          notes: dto.notes || null,
          createdByUserId: userId,
        },
        include: {
          createdBy: {
            select: { id: true, email: true },
          },
        },
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          action: `STOCK_${dto.transactionType}`,
          entityName: 'InventoryTransaction',
          entityId: transaction.id,
          newValues: JSON.parse(JSON.stringify(transaction)),
          userId,
        },
      });

      return {
        transaction,
        material: updatedMaterial,
      };
    });
  }

  /**
   * Get transaction history ledger for a specific material or globally
   */
  async getTransactionHistory(params: {
    rawMaterialId?: string;
    transactionType?: TransactionType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryTransactionWhereInput = {};

    if (params.rawMaterialId) {
      where.rawMaterialId = params.rawMaterialId;
    }
    if (params.transactionType) {
      where.transactionType = params.transactionType;
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [items, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          rawMaterial: {
            include: {
              unit: true,
              category: true,
            },
          },
          createdBy: {
            select: { id: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        previousStock: Number(item.previousStock),
        newStock: Number(item.newStock),
        unitPrice: Number(item.unitPrice),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Categories list & create
   */
  async getCategories() {
    return await prisma.category.findMany({
      include: {
        _count: { select: { rawMaterials: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string, description?: string) {
    const exists = await prisma.category.findUnique({ where: { name } });
    if (exists) {
      throw new ConflictException(`Category "${name}" already exists.`);
    }
    return await prisma.category.create({
      data: { name, description },
    });
  }

  async updateCategory(id: string, name?: string, description?: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    if (name && name !== category.name) {
      const exists = await prisma.category.findUnique({ where: { name } });
      if (exists) {
        throw new ConflictException(`Category "${name}" already exists.`);
      }
    }
    return await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    await prisma.rawMaterial.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    return await prisma.category.delete({ where: { id } });
  }

  /**
   * Units list & create
   */
  async getUnits() {
    return await prisma.unitOfMeasure.findMany({
      include: {
        _count: { select: { rawMaterials: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createUnit(name: string, abbreviation: string) {
    const exists = await prisma.unitOfMeasure.findUnique({ where: { name } });
    if (exists) {
      throw new ConflictException(`Unit of measure "${name}" already exists.`);
    }
    return await prisma.unitOfMeasure.create({
      data: { name, abbreviation },
    });
  }

  async updateUnit(id: string, name?: string, abbreviation?: string) {
    const unit = await prisma.unitOfMeasure.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found.`);
    }
    if (name && name !== unit.name) {
      const exists = await prisma.unitOfMeasure.findUnique({ where: { name } });
      if (exists) {
        throw new ConflictException(`Unit "${name}" already exists.`);
      }
    }
    if (abbreviation && abbreviation !== unit.abbreviation) {
      const existsAbbr = await prisma.unitOfMeasure.findUnique({ where: { abbreviation } });
      if (existsAbbr) {
        throw new ConflictException(`Unit abbreviation "${abbreviation}" already exists.`);
      }
    }
    return await prisma.unitOfMeasure.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(abbreviation !== undefined ? { abbreviation } : {}),
      },
    });
  }

  async deleteUnit(id: string) {
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id },
      include: {
        _count: { select: { rawMaterials: true, secondaryRawMaterials: true } },
      },
    });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found.`);
    }
    if (unit._count.rawMaterials > 0 || unit._count.secondaryRawMaterials > 0) {
      throw new BadRequestException(
        `Cannot delete unit "${unit.name}" as it is associated with ${unit._count.rawMaterials + unit._count.secondaryRawMaterials} raw material(s).`
      );
    }
    return await prisma.unitOfMeasure.delete({ where: { id } });
  }
}
