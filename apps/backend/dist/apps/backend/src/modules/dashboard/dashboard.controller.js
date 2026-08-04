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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getSummary() {
        return this.dashboardService.getSummary();
    }
    async getChartsData() {
        return this.dashboardService.getChartsData();
    }
    async getLowStockItems() {
        return this.dashboardService.getLowStockItems();
    }
    async getPendingJobs() {
        return this.dashboardService.getPendingJobs();
    }
    async getRecentWorkOrders() {
        return this.dashboardService.getRecentWorkOrders();
    }
    async getActivities() {
        return this.dashboardService.getActivities();
    }
    async getLatestEmployees() {
        return this.dashboardService.getLatestEmployees();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get executive dashboard KPI summary cards metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('charts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get analytical chart datasets (Production, Material Usage, Salary, Trends)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getChartsData", null);
__decorate([
    (0, common_1.Get)('low-stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Get raw materials below minimum safety levels' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getLowStockItems", null);
__decorate([
    (0, common_1.Get)('pending-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active work orders in pending/approval status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPendingJobs", null);
__decorate([
    (0, common_1.Get)('recent-work-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent work orders' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRecentWorkOrders", null);
__decorate([
    (0, common_1.Get)('activities'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time audit activities log feed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getActivities", null);
__decorate([
    (0, common_1.Get)('latest-employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Get newly onboarded employee staff' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getLatestEmployees", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map