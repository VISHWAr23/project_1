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
exports.SalaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const salary_service_1 = require("./salary.service");
const database_1 = require("@ims/database");
const generate_payroll_dto_1 = require("./dto/generate-payroll.dto");
const update_payroll_item_dto_1 = require("./dto/update-payroll-item.dto");
const record_payment_dto_1 = require("./dto/record-payment.dto");
let SalaryController = class SalaryController {
    constructor(salaryService) {
        this.salaryService = salaryService;
    }
    getDashboardSummary() {
        return this.salaryService.getDashboardSummary();
    }
    findAll(month, year, status, page, limit) {
        return this.salaryService.findAll({ month, year, status, page, limit });
    }
    getSalaryHistory(employeeId, year) {
        return this.salaryService.getSalaryHistory(employeeId, year);
    }
    getSalarySlip(itemId) {
        return this.salaryService.getSalarySlip(itemId);
    }
    findOne(id) {
        return this.salaryService.findOne(id);
    }
    generatePayroll(dto, req) {
        const userId = req.user?.id;
        return this.salaryService.generatePayroll(dto, userId);
    }
    updatePayrollItemAdjustment(itemId, dto, req) {
        const userId = req.user?.id;
        return this.salaryService.updatePayrollItemAdjustment(itemId, dto, userId);
    }
    approvePayroll(id, req) {
        const userId = req.user?.id;
        return this.salaryService.approvePayroll(id, userId);
    }
    cancelPayroll(id, req) {
        const userId = req.user?.id;
        return this.salaryService.cancelPayroll(id, userId);
    }
    recordPayment(dto, req) {
        const userId = req.user?.id;
        return this.salaryService.recordPayment(dto, userId);
    }
};
exports.SalaryController = SalaryController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Salary & Payroll Dashboard KPIs & Metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all monthly payroll runs' }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Number, Number]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Search historical salary payout records' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "getSalaryHistory", null);
__decorate([
    (0, common_1.Get)('items/:itemId/slip'),
    (0, swagger_1.ApiOperation)({ summary: 'Get salary slip details for an employee' }),
    __param(0, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "getSalarySlip", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single payroll run details with line items' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Run monthly payroll calculation engine' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_payroll_dto_1.GeneratePayrollDto, Object]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "generatePayroll", null);
__decorate([
    (0, common_1.Patch)('items/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update adjustments for a salary line item' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payroll_item_dto_1.UpdatePayrollItemAdjustmentDto, Object]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "updatePayrollItemAdjustment", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve payroll batch and generate pay slips' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "approvePayroll", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a payroll batch' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "cancelPayroll", null);
__decorate([
    (0, common_1.Post)('items/:itemId/payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Record disbursement payment for employee salary' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [record_payment_dto_1.RecordSalaryPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "recordPayment", null);
exports.SalaryController = SalaryController = __decorate([
    (0, swagger_1.ApiTags)('Salary & Payroll Management'),
    (0, common_1.Controller)('salary'),
    __metadata("design:paramtypes", [salary_service_1.SalaryService])
], SalaryController);
//# sourceMappingURL=salary.controller.js.map