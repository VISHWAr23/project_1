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
exports.JobWorkController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const job_work_service_1 = require("./job-work.service");
const create_job_work_order_dto_1 = require("./dto/create-job-work-order.dto");
const issue_materials_dto_1 = require("./dto/issue-materials.dto");
const receive_return_dto_1 = require("./dto/receive-return.dto");
const close_job_work_dto_1 = require("./dto/close-job-work.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const database_1 = require("@ims/database");
let JobWorkController = class JobWorkController {
    constructor(jobWorkService) {
        this.jobWorkService = jobWorkService;
    }
    async findAll(search, status, jobWorkCompanyId, page, limit) {
        return this.jobWorkService.findAll({ search, status, jobWorkCompanyId, page, limit });
    }
    async getCompanies() {
        return this.jobWorkService.getCompanies();
    }
    async getMaterials() {
        return this.jobWorkService.getMaterials();
    }
    async getReturnRegister(search, page, limit) {
        return this.jobWorkService.getReturnRegister({ search, page, limit });
    }
    async create(dto, req) {
        const userId = req.user?.id;
        return this.jobWorkService.create(dto, userId);
    }
    async findOne(id) {
        return this.jobWorkService.findOne(id);
    }
    async issueMaterials(id, dto, req) {
        const userId = req.user?.id;
        return this.jobWorkService.issueMaterials(id, dto, userId);
    }
    async receiveReturn(id, dto, req) {
        const userId = req.user?.id;
        return this.jobWorkService.receiveReturn(id, dto, userId);
    }
    async closeOrder(id, dto, req) {
        const userId = req.user?.id;
        return this.jobWorkService.closeOrder(id, dto, userId);
    }
    async update(id, dto, req) {
        const userId = req.user?.id;
        return this.jobWorkService.update(id, dto, userId);
    }
    async deleteOrder(id, req) {
        const userId = req.user?.id;
        return this.jobWorkService.delete(id, userId);
    }
};
exports.JobWorkController = JobWorkController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all Job Work Orders with search, filters and metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: database_1.JobWorkStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'jobWorkCompanyId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('jobWorkCompanyId')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('companies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active Job Working Vendor companies for dropdowns' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Get)('materials'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active raw materials and finished goods for dropdowns' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "getMaterials", null);
__decorate([
    (0, common_1.Get)('returns'),
    (0, swagger_1.ApiOperation)({ summary: 'Get return register entries across all vendors' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "getReturnRegister", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new Job Work Order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_job_work_order_dto_1.CreateJobWorkOrderDto, Object]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single Job Work Order details, roll items, timeline & documents' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/issue'),
    (0, swagger_1.ApiOperation)({ summary: 'Issue raw material rolls, update stock balances, generate Delivery Challan' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, issue_materials_dto_1.IssueMaterialsDto, Object]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "issueMaterials", null);
__decorate([
    (0, common_1.Post)(':id/return'),
    (0, swagger_1.ApiOperation)({ summary: 'Receive returned finished rolls, log return register, update finished goods stock' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, receive_return_dto_1.ReceiveReturnDto, Object]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "receiveReturn", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Reconcile wastage/differences and close Job Work Order' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, close_job_work_dto_1.CloseJobWorkOrderDto, Object]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "closeOrder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update Job Work Order details, schedule, or vehicle info' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete or cancel a Job Work Order and reverse stock if needed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobWorkController.prototype, "deleteOrder", null);
exports.JobWorkController = JobWorkController = __decorate([
    (0, swagger_1.ApiTags)('Job Work Management'),
    (0, common_1.Controller)('job-work'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [job_work_service_1.JobWorkService])
], JobWorkController);
//# sourceMappingURL=job-work.controller.js.map