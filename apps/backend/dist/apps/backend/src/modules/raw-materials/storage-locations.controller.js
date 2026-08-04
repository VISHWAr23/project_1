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
exports.StorageLocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const storage_locations_service_1 = require("./storage-locations.service");
const create_storage_location_dto_1 = require("./dto/create-storage-location.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let StorageLocationsController = class StorageLocationsController {
    constructor(storageLocationsService) {
        this.storageLocationsService = storageLocationsService;
    }
    async findAll(search) {
        return this.storageLocationsService.findAll(search);
    }
    async findOne(id) {
        return this.storageLocationsService.findOne(id);
    }
    async create(dto) {
        return this.storageLocationsService.create(dto);
    }
    async update(id, dto) {
        return this.storageLocationsService.update(id, dto);
    }
    async remove(id) {
        return this.storageLocationsService.remove(id);
    }
};
exports.StorageLocationsController = StorageLocationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of all warehouse storage locations' }),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageLocationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single storage location detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageLocationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new storage location' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_storage_location_dto_1.CreateStorageLocationDto]),
    __metadata("design:returntype", Promise)
], StorageLocationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update storage location detail' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StorageLocationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete or deactivate storage location' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageLocationsController.prototype, "remove", null);
exports.StorageLocationsController = StorageLocationsController = __decorate([
    (0, swagger_1.ApiTags)('Storage Locations Management'),
    (0, common_1.Controller)('storage-locations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [storage_locations_service_1.StorageLocationsService])
], StorageLocationsController);
//# sourceMappingURL=storage-locations.controller.js.map