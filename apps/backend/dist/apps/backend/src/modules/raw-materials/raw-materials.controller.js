"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawMaterialsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const raw_materials_service_1 = require("./raw-materials.service");
const create_raw_material_dto_1 = require("./dto/create-raw-material.dto");
const update_raw_material_dto_1 = require("./dto/update-raw-material.dto");
const stock_transaction_dto_1 = require("./dto/stock-transaction.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const database_1 = require("@ims/database");
let RawMaterialsController = class RawMaterialsController {
    constructor(rawMaterialsService) {
        this.rawMaterialsService = rawMaterialsService;
    }
    async findAll(search, categoryId, supplierId, storageLocationId, stockStatus, page, limit) {
        return this.rawMaterialsService.findAll({
            search,
            categoryId,
            supplierId,
            storageLocationId,
            stockStatus,
            page,
            limit,
        });
    }
    async getCategories() {
        return this.rawMaterialsService.getCategories();
    }
    async createCategory(body) {
        return this.rawMaterialsService.createCategory(body.name, body.description);
    }
    async getUnits() {
        return this.rawMaterialsService.getUnits();
    }
    async createUnit(body) {
        return this.rawMaterialsService.createUnit(body.name, body.abbreviation);
    }
    async getTransactionHistory(rawMaterialId, transactionType, startDate, endDate, page, limit) {
        return this.rawMaterialsService.getTransactionHistory({
            rawMaterialId,
            transactionType,
            startDate,
            endDate,
            page,
            limit,
        });
    }
    async findOne(id) {
        return this.rawMaterialsService.findOne(id);
    }
    async getItemHistory(id, page, limit) {
        return this.rawMaterialsService.getTransactionHistory({ rawMaterialId: id, page, limit });
    }
    async create(dto, req) {
        const userId = req.user?.id;
        return this.rawMaterialsService.create(dto, userId);
    }
    async update(id, dto, req) {
        const userId = req.user?.id;
        return this.rawMaterialsService.update(id, dto, userId);
    }
    async remove(id, req) {
        const userId = req.user?.id;
        return this.rawMaterialsService.remove(id, userId);
    }
    async recordStockTransaction(id, dto, req) {
        const userId = req.user?.id;
        return this.rawMaterialsService.recordStockTransaction(id, dto, userId);
    }
};
exports.RawMaterialsController = RawMaterialsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List raw materials with filters, search, and inventory metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'categoryId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'supplierId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'storageLocationId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'stockStatus', required: false, enum: ['OPTIMAL', 'LOW_STOCK', 'OVERSTOCK', 'OUT_OF_STOCK'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('supplierId')),
    __param(3, (0, common_1.Query)('storageLocationId')),
    __param(4, (0, common_1.Query)('stockStatus')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all raw material categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new raw material category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('units'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all units of measure' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "getUnits", null);
__decorate([
    (0, common_1.Post)('units'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new unit of measure' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global stock movement history ledger' }),
    (0, swagger_1.ApiQuery)({ name: 'rawMaterialId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'transactionType', enum: database_1.TransactionType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('rawMaterialId')),
    __param(1, (0, common_1.Query)('transactionType')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "getTransactionHistory", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single raw material details, metrics, history & job work orders' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock history ledger for specific raw material' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "getItemHistory", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new raw material SKU' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_raw_material_dto_1.CreateRawMaterialDto, Object]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update raw material SKU details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_raw_material_dto_1.UpdateRawMaterialDto, Object]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete or deactivate raw material' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/transaction'),
    (0, swagger_1.ApiOperation)({ summary: 'Record stock transaction (Adjustment, Receipt, Transfer, Correction)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stock_transaction_dto_1.StockTransactionDto, Object]),
    __metadata("design:returntype", Promise)
], RawMaterialsController.prototype, "recordStockTransaction", null);
exports.RawMaterialsController = RawMaterialsController = __decorate([
    (0, swagger_1.ApiTags)('Raw Materials Management'),
    (0, common_1.Controller)('raw-materials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [raw_materials_service_1.RawMaterialsService])
], RawMaterialsController);
//# sourceMappingURL=raw-materials.controller.js.map