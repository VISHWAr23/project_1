"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
let SuppliersService = class SuppliersService {
    async findAll(search) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { gstin: { contains: search, mode: 'insensitive' } },
            ];
        }
        return await database_1.prisma.supplier.findMany({
            where,
            include: {
                _count: {
                    select: { rawMaterials: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const supplier = await database_1.prisma.supplier.findUnique({
            where: { id },
            include: {
                rawMaterials: true,
            },
        });
        if (!supplier)
            throw new common_1.NotFoundException(`Supplier with ID ${id} not found.`);
        return supplier;
    }
    async create(dto) {
        const exists = await database_1.prisma.supplier.findUnique({ where: { code: dto.code } });
        if (exists)
            throw new common_1.ConflictException(`Supplier code ${dto.code} already exists.`);
        return await database_1.prisma.supplier.create({
            data: dto,
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return await database_1.prisma.supplier.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        const supplier = await this.findOne(id);
        if (supplier.rawMaterials.length > 0) {
            return await database_1.prisma.supplier.update({
                where: { id },
                data: { isActive: false },
            });
        }
        return await database_1.prisma.supplier.delete({ where: { id } });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)()
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map