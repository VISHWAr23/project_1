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
exports.RollTrackingController = void 0;
const common_1 = require("@nestjs/common");
const roll_tracking_service_1 = require("./roll-tracking.service");
const create_roll_dto_1 = require("./dto/create-roll.dto");
const update_roll_status_dto_1 = require("./dto/update-roll-status.dto");
const database_1 = require("@ims/database");
let RollTrackingController = class RollTrackingController {
    constructor(rollTrackingService) {
        this.rollTrackingService = rollTrackingService;
    }
    async createRoll(dto) {
        return this.rollTrackingService.createRoll(dto);
    }
    async bulkCreateRolls(dto) {
        return this.rollTrackingService.bulkCreateRolls(dto.items);
    }
    async getStats() {
        return this.rollTrackingService.getStats();
    }
    async findAll(search, status, stage, batchNumber, jobWorkCompanyId, location, page, limit) {
        return this.rollTrackingService.findAll({
            search,
            status,
            stage,
            batchNumber,
            jobWorkCompanyId,
            location,
            page,
            limit,
        });
    }
    async findByRollNumber(rollNumber) {
        return this.rollTrackingService.findByRollNumber(rollNumber);
    }
    async getGenealogy(rollNumber) {
        return this.rollTrackingService.getGenealogy(rollNumber);
    }
    async updateStatus(rollNumber, dto) {
        return this.rollTrackingService.updateStatus(rollNumber, dto);
    }
};
exports.RollTrackingController = RollTrackingController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_roll_dto_1.CreateRollDto]),
    __metadata("design:returntype", Promise)
], RollTrackingController.prototype, "createRoll", null);
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RollTrackingController.prototype, "bulkCreateRolls", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RollTrackingController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('stage')),
    __param(3, (0, common_1.Query)('batchNumber')),
    __param(4, (0, common_1.Query)('jobWorkCompanyId')),
    __param(5, (0, common_1.Query)('location')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], RollTrackingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':rollNumber'),
    __param(0, (0, common_1.Param)('rollNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RollTrackingController.prototype, "findByRollNumber", null);
__decorate([
    (0, common_1.Get)(':rollNumber/genealogy'),
    __param(0, (0, common_1.Param)('rollNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RollTrackingController.prototype, "getGenealogy", null);
__decorate([
    (0, common_1.Put)(':rollNumber/status'),
    __param(0, (0, common_1.Param)('rollNumber')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_roll_status_dto_1.UpdateRollStatusDto]),
    __metadata("design:returntype", Promise)
], RollTrackingController.prototype, "updateStatus", null);
exports.RollTrackingController = RollTrackingController = __decorate([
    (0, common_1.Controller)('rolls'),
    __metadata("design:paramtypes", [roll_tracking_service_1.RollTrackingService])
], RollTrackingController);
//# sourceMappingURL=roll-tracking.controller.js.map