"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawMaterialsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
let RawMaterialsService = class RawMaterialsService {
    async generateMaterialCode() {
        const year = new Date().getFullYear();
        const prefix = `RM-${year}-`;
        const count = await database_1.prisma.rawMaterial.count();
        const seq = String(count + 1).padStart(4, '0');
        let code = `${prefix}${seq}`;
        let exists = await database_1.prisma.rawMaterial.findUnique({ where: { sku: code } });
        let counter = count + 1;
        while (exists) {
            counter++;
            code = `${prefix}${String(counter).padStart(4, '0')}`;
            exists = await database_1.prisma.rawMaterial.findUnique({ where: { sku: code } });
        }
        return code;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
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
        const [rawItems, total] = await Promise.all([
            database_1.prisma.rawMaterial.findMany({
                where,
                include: {
                    category: true,
                    unit: true,
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
            database_1.prisma.rawMaterial.count({ where }),
        ]);
        const items = rawItems
            .map((item) => {
            const current = Number(item.currentStockBalance);
            const min = Number(item.minimumStockLevel);
            const max = Number(item.maximumStockLevel);
            const reserved = Number(item.reservedStock);
            const available = Math.max(0, current - reserved);
            let status = 'OPTIMAL';
            if (current <= 0) {
                status = 'OUT_OF_STOCK';
            }
            else if (current <= min) {
                status = 'LOW_STOCK';
            }
            else if (max > 0 && current > max) {
                status = 'OVERSTOCK';
            }
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
            };
        })
            .filter((item) => {
            if (!query.stockStatus)
                return true;
            return item.computedStatus === query.stockStatus;
        });
        const paginatedItems = items.slice(skip, skip + limit);
        const totalSkus = rawItems.length;
        let totalValuation = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        rawItems.forEach((m) => {
            const current = Number(m.currentStockBalance);
            const cost = Number(m.avgCost) || Number(m.unitCost) || 0;
            totalValuation += current * cost;
            if (current <= 0)
                outOfStockCount++;
            else if (current <= Number(m.minimumStockLevel))
                lowStockCount++;
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
            },
        };
    }
    async findOne(id) {
        const item = await database_1.prisma.rawMaterial.findUnique({
            where: { id },
            include: {
                category: true,
                unit: true,
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
            throw new common_1.NotFoundException(`Raw material with ID ${id} not found`);
        }
        const current = Number(item.currentStockBalance);
        const min = Number(item.minimumStockLevel);
        const max = Number(item.maximumStockLevel);
        const reserved = Number(item.reservedStock);
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
    async create(dto, userId) {
        let sku = dto.sku;
        if (!sku) {
            sku = await this.generateMaterialCode();
        }
        const existingSku = await database_1.prisma.rawMaterial.findUnique({ where: { sku } });
        if (existingSku) {
            throw new common_1.ConflictException(`Material Code ${sku} already exists.`);
        }
        const existingName = await database_1.prisma.rawMaterial.findFirst({
            where: { name: { equals: dto.name, mode: 'insensitive' } },
        });
        if (existingName) {
            throw new common_1.ConflictException(`Raw material with name "${dto.name}" already exists.`);
        }
        if (dto.maximumStockLevel && dto.maximumStockLevel > 0 && dto.minimumStockLevel > dto.maximumStockLevel) {
            throw new common_1.BadRequestException('Minimum stock level cannot be greater than Maximum stock level.');
        }
        const initialStock = dto.initialStock || 0;
        const unitCost = dto.unitCost || 0;
        return await database_1.prisma.$transaction(async (tx) => {
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
                    categoryId: dto.categoryId || null,
                    unitId: dto.unitId || null,
                    supplierId: dto.supplierId || null,
                    storageLocationId: dto.storageLocationId || null,
                },
                include: {
                    category: true,
                    unit: true,
                    supplier: true,
                    storageLocation: true,
                },
            });
            if (initialStock > 0) {
                await tx.inventoryTransaction.create({
                    data: {
                        rawMaterialId: material.id,
                        transactionType: database_1.TransactionType.PURCHASE_RECEIPT,
                        quantity: initialStock,
                        previousStock: 0,
                        newStock: initialStock,
                        unitPrice: unitCost,
                        notes: 'Initial Stock Balance Setup',
                        createdByUserId: userId,
                    },
                });
            }
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
    async update(id, dto, userId) {
        const existing = await database_1.prisma.rawMaterial.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Raw material with ID ${id} not found.`);
        }
        if (dto.sku && dto.sku !== existing.sku) {
            const duplicateSku = await database_1.prisma.rawMaterial.findUnique({ where: { sku: dto.sku } });
            if (duplicateSku) {
                throw new common_1.ConflictException(`Material Code ${dto.sku} already exists.`);
            }
        }
        if (dto.name && dto.name !== existing.name) {
            const duplicateName = await database_1.prisma.rawMaterial.findFirst({
                where: { name: { equals: dto.name, mode: 'insensitive' }, id: { not: id } },
            });
            if (duplicateName) {
                throw new common_1.ConflictException(`Raw material name "${dto.name}" already exists.`);
            }
        }
        const minStock = dto.minimumStockLevel ?? Number(existing.minimumStockLevel);
        const maxStock = dto.maximumStockLevel ?? Number(existing.maximumStockLevel);
        if (maxStock > 0 && minStock > maxStock) {
            throw new common_1.BadRequestException('Minimum stock level cannot be greater than Maximum stock level.');
        }
        return await database_1.prisma.$transaction(async (tx) => {
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
                    categoryId: dto.categoryId !== undefined ? dto.categoryId : undefined,
                    unitId: dto.unitId !== undefined ? dto.unitId : undefined,
                    supplierId: dto.supplierId !== undefined ? dto.supplierId : undefined,
                    storageLocationId: dto.storageLocationId !== undefined ? dto.storageLocationId : undefined,
                },
                include: {
                    category: true,
                    unit: true,
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
    async remove(id, userId) {
        const existing = await database_1.prisma.rawMaterial.findUnique({
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
            throw new common_1.NotFoundException(`Raw material with ID ${id} not found.`);
        }
        if (existing._count.inventoryTransactions > 0 || existing._count.issuedJobWorkOrders > 0) {
            const deactivated = await database_1.prisma.rawMaterial.update({
                where: { id },
                data: { isActive: false },
            });
            await database_1.prisma.auditLog.create({
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
        return await database_1.prisma.$transaction(async (tx) => {
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
    async recordStockTransaction(id, dto, userId) {
        const material = await database_1.prisma.rawMaterial.findUnique({ where: { id } });
        if (!material) {
            throw new common_1.NotFoundException(`Raw material with ID ${id} not found.`);
        }
        const currentStock = Number(material.currentStockBalance);
        const qty = Number(dto.quantity);
        let delta = 0;
        const additionTypes = [
            database_1.TransactionType.PURCHASE_RECEIPT,
            database_1.TransactionType.ADJUSTMENT_ADD,
            database_1.TransactionType.JOB_WORK_RETURN,
            database_1.TransactionType.MANUAL_CORRECTION,
        ];
        const subtractionTypes = [
            database_1.TransactionType.WORK_ORDER_ISSUE,
            database_1.TransactionType.JOB_WORK_DISPATCH,
            database_1.TransactionType.ADJUSTMENT_SUBTRACT,
        ];
        const isAddition = additionTypes.includes(dto.transactionType);
        const isSubtraction = subtractionTypes.includes(dto.transactionType);
        if (isAddition) {
            delta = qty;
        }
        else if (isSubtraction) {
            delta = -qty;
        }
        else if (dto.transactionType === database_1.TransactionType.TRANSFER) {
            delta = -qty;
        }
        const newStock = currentStock + delta;
        if (newStock < 0) {
            throw new common_1.BadRequestException(`Insufficient stock balance. Current stock is ${currentStock}, requested adjustment is ${delta}, which results in negative stock (${newStock}).`);
        }
        const unitPrice = dto.unitPrice || Number(material.unitCost) || 0;
        let newAvgCost = Number(material.avgCost);
        let lastPurchaseRate = Number(material.lastPurchaseRate);
        if (dto.transactionType === database_1.TransactionType.PURCHASE_RECEIPT && qty > 0) {
            lastPurchaseRate = unitPrice;
            const currentTotalValuation = currentStock * newAvgCost;
            const additionValuation = qty * unitPrice;
            newAvgCost = (currentTotalValuation + additionValuation) / (currentStock + qty);
        }
        return await database_1.prisma.$transaction(async (tx) => {
            const updatedMaterial = await tx.rawMaterial.update({
                where: { id },
                data: {
                    currentStockBalance: newStock,
                    avgCost: newAvgCost,
                    lastPurchaseRate: lastPurchaseRate,
                    unitCost: unitPrice > 0 ? unitPrice : material.unitCost,
                },
            });
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
    async getTransactionHistory(params) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.rawMaterialId) {
            where.rawMaterialId = params.rawMaterialId;
        }
        if (params.transactionType) {
            where.transactionType = params.transactionType;
        }
        if (params.startDate || params.endDate) {
            where.createdAt = {};
            if (params.startDate)
                where.createdAt.gte = new Date(params.startDate);
            if (params.endDate)
                where.createdAt.lte = new Date(params.endDate);
        }
        const [items, total] = await Promise.all([
            database_1.prisma.inventoryTransaction.findMany({
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
            database_1.prisma.inventoryTransaction.count({ where }),
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
    async getCategories() {
        return await database_1.prisma.category.findMany({
            include: {
                _count: { select: { rawMaterials: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(name, description) {
        const exists = await database_1.prisma.category.findUnique({ where: { name } });
        if (exists) {
            throw new common_1.ConflictException(`Category "${name}" already exists.`);
        }
        return await database_1.prisma.category.create({
            data: { name, description },
        });
    }
    async getUnits() {
        return await database_1.prisma.unitOfMeasure.findMany({
            include: {
                _count: { select: { rawMaterials: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createUnit(name, abbreviation) {
        const exists = await database_1.prisma.unitOfMeasure.findUnique({ where: { name } });
        if (exists) {
            throw new common_1.ConflictException(`Unit of measure "${name}" already exists.`);
        }
        return await database_1.prisma.unitOfMeasure.create({
            data: { name, abbreviation },
        });
    }
};
exports.RawMaterialsService = RawMaterialsService;
exports.RawMaterialsService = RawMaterialsService = __decorate([
    (0, common_1.Injectable)()
], RawMaterialsService);
//# sourceMappingURL=raw-materials.service.js.map