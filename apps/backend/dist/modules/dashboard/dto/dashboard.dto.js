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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSummaryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class DashboardSummaryDto {
}
exports.DashboardSummaryDto = DashboardSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "totalEmployees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "totalEmployeesChange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "jobWorkCompanies", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "activeJobChallans", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "rawMaterialsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "totalStockValuation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "finishedProductsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "todayProduction", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "todayProductionChange", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "todayMaterialIssues", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "todayMaterialIssuesCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "productReturns", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "rejectionRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "pendingWorkOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "highPriorityPendingOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "completedWorkOrders", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "completedThisMonth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "lowStockCount", void 0);
//# sourceMappingURL=dashboard.dto.js.map