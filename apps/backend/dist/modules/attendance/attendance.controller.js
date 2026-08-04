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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const create_attendance_dto_1 = require("./dto/create-attendance.dto");
const bulk_attendance_dto_1 = require("./dto/bulk-attendance.dto");
const update_attendance_dto_1 = require("./dto/update-attendance.dto");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async findAll(date, search, departmentId, status, page, limit) {
        return this.attendanceService.findAll({ date, search, departmentId, status, page, limit });
    }
    async getTodaySummary(date) {
        return this.attendanceService.getTodaySummary(date);
    }
    async getMonthSummary(month, year, departmentId) {
        const m = Number(month) || new Date().getMonth() + 1;
        const y = Number(year) || new Date().getFullYear();
        return this.attendanceService.getMonthSummary(m, y, departmentId);
    }
    async getEmployeeAttendance(id, startDate, endDate) {
        return this.attendanceService.getEmployeeAttendance(id, startDate, endDate);
    }
    async create(createDto, req) {
        const userId = req?.user?.id;
        return this.attendanceService.create(createDto, userId);
    }
    async bulkCreate(bulkDto, req) {
        const userId = req?.user?.id;
        return this.attendanceService.bulkCreate(bulkDto, userId);
    }
    async update(id, updateDto, req) {
        const userId = req?.user?.id;
        return this.attendanceService.update(id, updateDto, userId);
    }
    async delete(id, req) {
        const userId = req?.user?.id;
        return this.attendanceService.delete(id, userId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List daily punch logs with search, status, and department filters' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'YYYY-MM-DD' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'departmentId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('departmentId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Today’s Attendance KPI Stats Summary' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getTodaySummary", null);
__decorate([
    (0, common_1.Get)('month'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Monthly Attendance Grid Summary for Calendar View' }),
    (0, swagger_1.ApiQuery)({ name: 'month', required: true, description: '1-12' }),
    (0, swagger_1.ApiQuery)({ name: 'year', required: true, description: 'YYYY' }),
    (0, swagger_1.ApiQuery)({ name: 'departmentId', required: false }),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMonthSummary", null);
__decorate([
    (0, common_1.Get)('employee/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance history for specific employee' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getEmployeeAttendance", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mark single employee attendance' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attendance_dto_1.CreateAttendanceDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk mark attendance for active employees' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_attendance_dto_1.BulkAttendanceDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an attendance log entry' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_attendance_dto_1.UpdateAttendanceDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an attendance log entry' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "delete", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance Management'),
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map