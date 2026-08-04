"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobWorkService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
let JobWorkService = class JobWorkService {
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.jobWorkCompanyId) {
            where.jobWorkCompanyId = query.jobWorkCompanyId;
        }
        if (query.search) {
            where.OR = [
                { jobWorkNumber: { contains: query.search, mode: 'insensitive' } },
                { challanNumber: { contains: query.search, mode: 'insensitive' } },
                { vehicleNumber: { contains: query.search, mode: 'insensitive' } },
                { driverName: { contains: query.search, mode: 'insensitive' } },
                { jobWorkCompany: { companyName: { contains: query.search, mode: 'insensitive' } } },
                { rawMaterial: { name: { contains: query.search, mode: 'insensitive' } } },
            ];
        }
        const [items, total] = await Promise.all([
            database_1.prisma.jobWorkOrder.findMany({
                where,
                include: {
                    jobWorkCompany: true,
                    rawMaterial: true,
                    finishedProduct: true,
                    _count: {
                        select: { issueItems: true, returnItems: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.jobWorkOrder.count({ where }),
        ]);
        const [stats] = await Promise.all([
            database_1.prisma.jobWorkOrder.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
        ]);
        const activeVendorsCount = await database_1.prisma.jobWorkCompany.count({ where: { isActive: true } });
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalOrders: total,
                created: stats.find((s) => s.status === database_1.JobWorkStatus.CREATED)?._count.id || 0,
                materialsIssued: stats.find((s) => s.status === database_1.JobWorkStatus.MATERIALS_ISSUED)?._count.id || 0,
                inProgress: stats.find((s) => s.status === database_1.JobWorkStatus.IN_PROGRESS)?._count.id || 0,
                partialReturn: stats.find((s) => s.status === database_1.JobWorkStatus.PARTIAL_RETURN)?._count.id || 0,
                completed: stats.find((s) => s.status === database_1.JobWorkStatus.COMPLETED)?._count.id || 0,
                closed: stats.find((s) => s.status === database_1.JobWorkStatus.CLOSED)?._count.id || 0,
                activeVendorsCount,
            },
        };
    }
    async findOne(id) {
        const order = await database_1.prisma.jobWorkOrder.findUnique({
            where: { id },
            include: {
                jobWorkCompany: true,
                rawMaterial: {
                    include: { unit: true, category: true },
                },
                finishedProduct: {
                    include: { unit: true },
                },
                closedByUser: {
                    select: { id: true, email: true },
                },
                issueItems: {
                    include: { batch: true },
                    orderBy: { createdAt: 'asc' },
                },
                returnItems: {
                    include: {
                        finishedProduct: true,
                        receivedByUser: { select: { id: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                statusHistory: {
                    include: {
                        performedByUser: { select: { id: true, email: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Job Work Order with ID ${id} not found`);
        }
        return order;
    }
    async create(dto, userId) {
        const company = await database_1.prisma.jobWorkCompany.findUnique({
            where: { id: dto.jobWorkCompanyId },
        });
        if (!company) {
            throw new common_1.BadRequestException('Invalid Job Working Company specified');
        }
        const rawMaterial = await database_1.prisma.rawMaterial.findUnique({
            where: { id: dto.rawMaterialId },
        });
        if (!rawMaterial) {
            throw new common_1.BadRequestException('Invalid Raw Material specified');
        }
        const count = await database_1.prisma.jobWorkOrder.count();
        const year = new Date().getFullYear();
        const jobWorkNumber = `JWO-${year}-${String(count + 1).padStart(4, '0')}`;
        const order = await database_1.prisma.$transaction(async (tx) => {
            const createdOrder = await tx.jobWorkOrder.create({
                data: {
                    jobWorkNumber,
                    jobWorkCompanyId: dto.jobWorkCompanyId,
                    rawMaterialId: dto.rawMaterialId,
                    finishedProductId: dto.finishedProductId || null,
                    expectedReturnDate: new Date(dto.expectedReturnDate),
                    remarks: dto.remarks,
                    status: database_1.JobWorkStatus.CREATED,
                },
                include: {
                    jobWorkCompany: true,
                    rawMaterial: true,
                },
            });
            await tx.jobWorkStatusHistory.create({
                data: {
                    jobWorkOrderId: createdOrder.id,
                    toStatus: database_1.JobWorkStatus.CREATED,
                    notes: 'Job Work Order created in system',
                    performedByUserId: userId || null,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'CREATE_JOB_WORK_ORDER',
                    entityName: 'JobWorkOrder',
                    entityId: createdOrder.id,
                    newValues: createdOrder,
                    userId: userId || null,
                },
            });
            return createdOrder;
        });
        return order;
    }
    async issueMaterials(id, dto, userId) {
        const order = await database_1.prisma.jobWorkOrder.findUnique({
            where: { id },
            include: { rawMaterial: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Job Work Order ${id} not found`);
        }
        if (order.status !== database_1.JobWorkStatus.CREATED && order.status !== database_1.JobWorkStatus.MATERIALS_ISSUED) {
            throw new common_1.BadRequestException(`Cannot issue materials for an order in status ${order.status}`);
        }
        const totalWeight = dto.items.reduce((sum, item) => sum + item.issuedWeight, 0);
        const totalQty = dto.items.reduce((sum, item) => sum + item.issuedQty, 0);
        const stockBalance = Number(order.rawMaterial.currentStockBalance);
        if (stockBalance < totalQty) {
            throw new common_1.BadRequestException(`Insufficient stock for ${order.rawMaterial.name}. Available: ${stockBalance}, Requested: ${totalQty}`);
        }
        const challanCount = await database_1.prisma.jobWorkOrder.count({
            where: { challanNumber: { not: null } },
        });
        const year = new Date().getFullYear();
        const challanNumber = dto.remarks?.includes('DC-')
            ? dto.remarks
            : `DC-${year}-${String(challanCount + 1).padStart(4, '0')}`;
        const updatedOrder = await database_1.prisma.$transaction(async (tx) => {
            await tx.rawMaterial.update({
                where: { id: order.rawMaterialId },
                data: {
                    currentStockBalance: { decrement: totalQty },
                },
            });
            await tx.inventoryTransaction.create({
                data: {
                    transactionType: database_1.TransactionType.JOB_WORK_DISPATCH,
                    rawMaterialId: order.rawMaterialId,
                    quantity: totalQty,
                    referenceDocumentType: 'JobWorkOrder',
                    referenceDocumentId: order.id,
                    notes: `Dispatched to Job Working Company via Delivery Challan ${challanNumber}. Vehicle: ${dto.vehicleNumber}`,
                    createdByUserId: userId || (await tx.user.findFirstOrThrow()).id,
                },
            });
            await tx.jobWorkIssueItem.createMany({
                data: dto.items.map((item) => ({
                    jobWorkOrderId: order.id,
                    rollNumber: item.rollNumber,
                    batchId: item.batchId || null,
                    issuedWeight: item.issuedWeight,
                    issuedQty: item.issuedQty,
                    remarks: item.remarks || null,
                })),
            });
            const newTotalIssuedWeight = Number(order.totalIssuedWeight) + totalWeight;
            const newTotalIssuedQty = Number(order.totalIssuedQty) + totalQty;
            const orderUpdated = await tx.jobWorkOrder.update({
                where: { id },
                data: {
                    challanNumber,
                    vehicleNumber: dto.vehicleNumber,
                    driverName: dto.driverName,
                    totalIssuedWeight: newTotalIssuedWeight,
                    totalIssuedQty: newTotalIssuedQty,
                    pendingWeight: newTotalIssuedWeight - Number(order.totalReturnedWeight) - Number(order.totalWastageWeight),
                    pendingQty: newTotalIssuedQty - Number(order.totalReturnedQty) - Number(order.totalWastageQty),
                    status: database_1.JobWorkStatus.MATERIALS_ISSUED,
                    remarks: dto.remarks || order.remarks,
                },
                include: {
                    jobWorkCompany: true,
                    rawMaterial: true,
                    issueItems: true,
                },
            });
            await tx.jobWorkStatusHistory.create({
                data: {
                    jobWorkOrderId: order.id,
                    fromStatus: order.status,
                    toStatus: database_1.JobWorkStatus.MATERIALS_ISSUED,
                    notes: `Issued ${dto.items.length} roll(s) weighing ${totalWeight} kg. Delivery Challan ${challanNumber} generated. Vehicle: ${dto.vehicleNumber}`,
                    performedByUserId: userId || null,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'ISSUE_JOB_WORK_MATERIALS',
                    entityName: 'JobWorkOrder',
                    entityId: order.id,
                    newValues: { challanNumber, totalWeight, totalQty, vehicleNumber: dto.vehicleNumber },
                    userId: userId || null,
                },
            });
            return orderUpdated;
        });
        return updatedOrder;
    }
    async receiveReturn(id, dto, userId) {
        const order = await database_1.prisma.jobWorkOrder.findUnique({
            where: { id },
            include: { rawMaterial: true, finishedProduct: true },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Job Work Order ${id} not found`);
        }
        if (order.status !== database_1.JobWorkStatus.MATERIALS_ISSUED &&
            order.status !== database_1.JobWorkStatus.IN_PROGRESS &&
            order.status !== database_1.JobWorkStatus.PARTIAL_RETURN) {
            throw new common_1.BadRequestException(`Cannot receive returns for order in status ${order.status}`);
        }
        const batchReturnedWeight = dto.items.reduce((sum, i) => sum + i.returnedWeight, 0);
        const batchReturnedQty = dto.items.reduce((sum, i) => sum + i.returnedQty, 0);
        const batchWastageWeight = dto.items.reduce((sum, i) => sum + (i.wastageWeight || 0), 0);
        const batchWastageQty = dto.items.reduce((sum, i) => sum + (i.wastageQty || 0), 0);
        const updatedOrder = await database_1.prisma.$transaction(async (tx) => {
            for (const item of dto.items) {
                await tx.jobWorkReturnItem.create({
                    data: {
                        jobWorkOrderId: order.id,
                        returnedDate: new Date(dto.returnedDate),
                        rollNumber: item.rollNumber,
                        finishedProductId: item.finishedProductId,
                        returnedWeight: item.returnedWeight,
                        returnedQty: item.returnedQty,
                        wastageWeight: item.wastageWeight || 0,
                        wastageQty: item.wastageQty || 0,
                        photoUrls: item.photoUrls || [],
                        remarks: item.remarks || null,
                        receivedByUserId: userId || null,
                    },
                });
                await tx.rawMaterial.update({
                    where: { id: item.finishedProductId },
                    data: {
                        currentStockBalance: { increment: item.returnedQty },
                    },
                });
                await tx.inventoryTransaction.create({
                    data: {
                        transactionType: database_1.TransactionType.JOB_WORK_RETURN,
                        rawMaterialId: item.finishedProductId,
                        quantity: item.returnedQty,
                        referenceDocumentType: 'JobWorkOrder',
                        referenceDocumentId: order.id,
                        notes: `Received from Job Working Company. Roll: ${item.rollNumber}, Weight: ${item.returnedWeight} kg`,
                        createdByUserId: userId || (await tx.user.findFirstOrThrow()).id,
                    },
                });
            }
            const totalReturnedWeight = Number(order.totalReturnedWeight) + batchReturnedWeight;
            const totalReturnedQty = Number(order.totalReturnedQty) + batchReturnedQty;
            const totalWastageWeight = Number(order.totalWastageWeight) + batchWastageWeight;
            const totalWastageQty = Number(order.totalWastageQty) + batchWastageQty;
            const totalIssuedWeight = Number(order.totalIssuedWeight);
            const totalIssuedQty = Number(order.totalIssuedQty);
            const pendingWeight = Math.max(0, totalIssuedWeight - totalReturnedWeight - totalWastageWeight);
            const pendingQty = Math.max(0, totalIssuedQty - totalReturnedQty - totalWastageQty);
            const nextStatus = pendingWeight <= 0.001 ? database_1.JobWorkStatus.COMPLETED : database_1.JobWorkStatus.PARTIAL_RETURN;
            const orderUpdated = await tx.jobWorkOrder.update({
                where: { id },
                data: {
                    totalReturnedWeight,
                    totalReturnedQty,
                    totalWastageWeight,
                    totalWastageQty,
                    pendingWeight,
                    pendingQty,
                    status: nextStatus,
                },
                include: {
                    jobWorkCompany: true,
                    returnItems: true,
                },
            });
            await tx.jobWorkStatusHistory.create({
                data: {
                    jobWorkOrderId: order.id,
                    fromStatus: order.status,
                    toStatus: nextStatus,
                    notes: `Received ${dto.items.length} returned roll(s) weighing ${batchReturnedWeight} kg (Scrap: ${batchWastageWeight} kg). Pending: ${pendingWeight} kg`,
                    performedByUserId: userId || null,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'RECEIVE_JOB_WORK_RETURN',
                    entityName: 'JobWorkOrder',
                    entityId: order.id,
                    newValues: { batchReturnedWeight, batchReturnedQty, nextStatus },
                    userId: userId || null,
                },
            });
            return orderUpdated;
        });
        return updatedOrder;
    }
    async closeOrder(id, dto, userId) {
        const order = await database_1.prisma.jobWorkOrder.findUnique({
            where: { id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Job Work Order ${id} not found`);
        }
        if (order.status === database_1.JobWorkStatus.CLOSED) {
            throw new common_1.BadRequestException(`Order ${order.jobWorkNumber} is already closed`);
        }
        const updatedOrder = await database_1.prisma.$transaction(async (tx) => {
            const orderClosed = await tx.jobWorkOrder.update({
                where: { id },
                data: {
                    status: database_1.JobWorkStatus.CLOSED,
                    closedAt: new Date(),
                    closedByUserId: userId || null,
                    remarks: dto.remarks ? `${order.remarks || ''}\nClosing Note: ${dto.remarks}` : order.remarks,
                },
            });
            await tx.jobWorkStatusHistory.create({
                data: {
                    jobWorkOrderId: order.id,
                    fromStatus: order.status,
                    toStatus: database_1.JobWorkStatus.CLOSED,
                    notes: dto.remarks || 'Work Order reconciled and closed',
                    performedByUserId: userId || null,
                },
            });
            await tx.auditLog.create({
                data: {
                    action: 'CLOSE_JOB_WORK_ORDER',
                    entityName: 'JobWorkOrder',
                    entityId: order.id,
                    newValues: { status: database_1.JobWorkStatus.CLOSED, remarks: dto.remarks },
                    userId: userId || null,
                },
            });
            return orderClosed;
        });
        return updatedOrder;
    }
    async getReturnRegister(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { rollNumber: { contains: query.search, mode: 'insensitive' } },
                { jobWorkOrder: { jobWorkNumber: { contains: query.search, mode: 'insensitive' } } },
                { jobWorkOrder: { jobWorkCompany: { companyName: { contains: query.search, mode: 'insensitive' } } } },
            ];
        }
        const [items, total] = await Promise.all([
            database_1.prisma.jobWorkReturnItem.findMany({
                where,
                include: {
                    finishedProduct: true,
                    jobWorkOrder: {
                        include: { jobWorkCompany: true },
                    },
                    receivedByUser: { select: { email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.jobWorkReturnItem.count({ where }),
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
    async getCompanies() {
        return database_1.prisma.jobWorkCompany.findMany({
            where: { isActive: true },
            orderBy: { companyName: 'asc' },
        });
    }
    async getMaterials() {
        return database_1.prisma.rawMaterial.findMany({
            where: { isActive: true },
            include: { unit: true },
            orderBy: { name: 'asc' },
        });
    }
};
exports.JobWorkService = JobWorkService;
exports.JobWorkService = JobWorkService = __decorate([
    (0, common_1.Injectable)()
], JobWorkService);
//# sourceMappingURL=job-work.service.js.map