"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollTrackingService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
let RollTrackingService = class RollTrackingService {
    async generateRollNumber() {
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const prefix = `ROL-${todayStr}-`;
        const count = await database_1.prisma.cottonRoll.count();
        const seq = String(count + 1).padStart(4, '0');
        let rollNumber = `${prefix}${seq}`;
        let exists = await database_1.prisma.cottonRoll.findUnique({ where: { rollNumber } });
        let counter = count + 1;
        while (exists) {
            counter++;
            rollNumber = `${prefix}${String(counter).padStart(4, '0')}`;
            exists = await database_1.prisma.cottonRoll.findUnique({ where: { rollNumber } });
        }
        const barcode = `BAR-${rollNumber}`;
        return { rollNumber, barcode };
    }
    async createRoll(dto) {
        const { rollNumber, barcode } = await this.generateRollNumber();
        const roll = await database_1.prisma.cottonRoll.create({
            data: {
                rollNumber,
                barcode,
                materialName: dto.materialName,
                batchNumber: dto.batchNumber,
                widthInches: dto.widthInches,
                lengthMeters: dto.lengthMeters,
                weightKg: dto.weightKg,
                gsm: dto.gsm,
                stage: dto.stage || database_1.RollStage.GREY_FABRIC_ROLL,
                currentStatus: dto.status || database_1.RollStatus.RAW_RECEIVED,
                currentLocation: dto.currentLocation,
                parentRollId: dto.parentRollId,
                jobWorkCompanyId: dto.jobWorkCompanyId,
                productionBatchId: dto.productionBatchId,
                finishedProductId: dto.finishedProductId,
                statusHistory: {
                    create: {
                        fromStatus: null,
                        toStatus: dto.status || database_1.RollStatus.RAW_RECEIVED,
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
    async bulkCreateRolls(items) {
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
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
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
            database_1.prisma.cottonRoll.count({ where }),
            database_1.prisma.cottonRoll.findMany({
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
    async findByRollNumber(rollNumber) {
        const roll = await database_1.prisma.cottonRoll.findFirst({
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
            throw new common_1.NotFoundException(`Cotton Roll '${rollNumber}' not found`);
        }
        return roll;
    }
    async getGenealogy(rollNumber) {
        const roll = await this.findByRollNumber(rollNumber);
        let parentChain = [];
        let currentParentId = roll.parentRollId;
        while (currentParentId) {
            const parent = await database_1.prisma.cottonRoll.findUnique({
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
            }
            else {
                break;
            }
        }
        const childRolls = await database_1.prisma.cottonRoll.findMany({
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
    async updateStatus(rollNumber, dto) {
        const roll = await database_1.prisma.cottonRoll.findFirst({
            where: { OR: [{ rollNumber }, { barcode: rollNumber }] },
        });
        if (!roll) {
            throw new common_1.NotFoundException(`Cotton Roll '${rollNumber}' not found`);
        }
        const previousStatus = roll.currentStatus;
        const updatedRoll = await database_1.prisma.cottonRoll.update({
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
    async getStats() {
        const [totalRolls, rollsByStatus, rollsByStage, aggregateWeight] = await Promise.all([
            database_1.prisma.cottonRoll.count(),
            database_1.prisma.cottonRoll.groupBy({
                by: ['currentStatus'],
                _count: { _all: true },
                _sum: { weightKg: true },
            }),
            database_1.prisma.cottonRoll.groupBy({
                by: ['stage'],
                _count: { _all: true },
                _sum: { weightKg: true },
            }),
            database_1.prisma.cottonRoll.aggregate({
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
};
exports.RollTrackingService = RollTrackingService;
exports.RollTrackingService = RollTrackingService = __decorate([
    (0, common_1.Injectable)()
], RollTrackingService);
//# sourceMappingURL=roll-tracking.service.js.map