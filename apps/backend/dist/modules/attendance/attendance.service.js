"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@ims/database");
let AttendanceService = class AttendanceService {
    parseDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            throw new common_1.BadRequestException(`Invalid date format: ${dateStr}`);
        }
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    validateNotFutureDate(date) {
        const today = new Date();
        const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        if (date.getTime() > todayUtc.getTime()) {
            throw new common_1.BadRequestException('Future dates are not allowed for attendance logging');
        }
    }
    calculateHours(checkInStr, checkOutStr, status) {
        if (status === database_1.AttendanceStatus.ABSENT || status === database_1.AttendanceStatus.LEAVE || status === database_1.AttendanceStatus.HOLIDAY || status === database_1.AttendanceStatus.WEEKLY_OFF) {
            return { workingHours: 0, overtimeHours: 0 };
        }
        if (status === database_1.AttendanceStatus.HALF_DAY) {
            return { workingHours: 4 };
        }
        if (!checkInStr || !checkOutStr) {
            return { workingHours: 8 };
        }
        try {
            const inTime = new Date(checkInStr).getTime();
            const outTime = new Date(checkOutStr).getTime();
            if (outTime > inTime) {
                const totalMinutes = (outTime - inTime) / (1000 * 60);
                const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
                const workingHours = Math.min(totalHours, 8);
                return { workingHours };
            }
        }
        catch {
        }
        return { workingHours: 8 };
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 30;
        const skip = (page - 1) * limit;
        const where = {
            employee: {
                deletedAt: null,
            },
        };
        if (query.date) {
            where.date = this.parseDate(query.date);
        }
        else {
            const today = new Date();
            where.date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        }
        if (query.status && query.status !== 'ALL') {
            where.status = query.status;
        }
        if (query.departmentId && query.departmentId !== 'ALL') {
            where.employee = {
                ...where.employee,
                departmentId: query.departmentId,
            };
        }
        if (query.search) {
            const searchLower = query.search.trim();
            where.employee = {
                ...where.employee,
                OR: [
                    { firstName: { contains: searchLower, mode: 'insensitive' } },
                    { lastName: { contains: searchLower, mode: 'insensitive' } },
                    { employeeCode: { contains: searchLower, mode: 'insensitive' } },
                ],
            };
        }
        const [items, total] = await Promise.all([
            database_1.prisma.attendanceLog.findMany({
                where,
                include: {
                    employee: {
                        include: {
                            department: true,
                            designation: true,
                        },
                    },
                },
                orderBy: { employee: { firstName: 'asc' } },
                skip,
                take: limit,
            }),
            database_1.prisma.attendanceLog.count({ where }),
        ]);
        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getTodaySummary(targetDateStr) {
        const today = targetDateStr ? this.parseDate(targetDateStr) : new Date();
        const dateUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const activeEmployeesCount = await database_1.prisma.employee.count({
            where: { deletedAt: null, status: database_1.EmployeeStatus.ACTIVE },
        });
        const logs = await database_1.prisma.attendanceLog.findMany({
            where: {
                date: dateUtc,
                employee: { deletedAt: null },
            },
            select: { status: true },
        });
        const presentCount = logs.filter((l) => l.status === database_1.AttendanceStatus.PRESENT).length;
        const absentCount = logs.filter((l) => l.status === database_1.AttendanceStatus.ABSENT).length;
        const halfDayCount = logs.filter((l) => l.status === database_1.AttendanceStatus.HALF_DAY).length;
        const leaveCount = logs.filter((l) => l.status === database_1.AttendanceStatus.LEAVE).length;
        const unmarkedCount = Math.max(0, activeEmployeesCount - logs.length);
        return {
            date: dateUtc.toISOString().split('T')[0],
            totalActiveEmployees: activeEmployeesCount,
            presentToday: presentCount,
            absentToday: absentCount,
            halfDayToday: halfDayCount,
            leaveToday: leaveCount,
            unmarkedToday: unmarkedCount,
        };
    }
    async getMonthSummary(month, year, departmentId) {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));
        const empWhere = { deletedAt: null, status: database_1.EmployeeStatus.ACTIVE };
        if (departmentId && departmentId !== 'ALL') {
            empWhere.departmentId = departmentId;
        }
        const employees = await database_1.prisma.employee.findMany({
            where: empWhere,
            include: {
                department: true,
                designation: true,
                attendanceLogs: {
                    where: {
                        date: {
                            gte: startDate,
                            lte: endDate,
                        },
                    },
                },
            },
            orderBy: { firstName: 'asc' },
        });
        const summary = employees.map((emp) => {
            const logs = emp.attendanceLogs;
            const totalPresent = logs.filter((l) => l.status === database_1.AttendanceStatus.PRESENT).length;
            const totalAbsent = logs.filter((l) => l.status === database_1.AttendanceStatus.ABSENT).length;
            const totalHalfDay = logs.filter((l) => l.status === database_1.AttendanceStatus.HALF_DAY).length;
            const totalLeave = logs.filter((l) => l.status === database_1.AttendanceStatus.LEAVE).length;
            const totalWorkingHours = logs.reduce((acc, l) => acc + Number(l.workingHours || 0), 0);
            return {
                employeeId: emp.id,
                employeeCode: emp.employeeCode,
                name: `${emp.firstName} ${emp.lastName}`,
                department: emp.department?.name || 'Unassigned',
                designation: emp.designation?.name || 'Staff',
                totalPresent,
                totalAbsent,
                totalHalfDay,
                totalLeave,
                totalWorkingHours,
                logs: logs.map((l) => ({
                    date: l.date.toISOString().split('T')[0],
                    status: l.status,
                    workingHours: l.workingHours,
                })),
            };
        });
        return {
            month,
            year,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            employees: summary,
        };
    }
    async getEmployeeAttendance(employeeId, startDateStr, endDateStr) {
        const employee = await database_1.prisma.employee.findFirst({
            where: { id: employeeId, deletedAt: null },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${employeeId} not found`);
        }
        const where = { employeeId };
        if (startDateStr && endDateStr) {
            where.date = {
                gte: this.parseDate(startDateStr),
                lte: this.parseDate(endDateStr),
            };
        }
        const logs = await database_1.prisma.attendanceLog.findMany({
            where,
            orderBy: { date: 'desc' },
        });
        return {
            employee: {
                id: employee.id,
                code: employee.employeeCode,
                name: `${employee.firstName} ${employee.lastName}`,
            },
            logs,
        };
    }
    async create(dto, userId) {
        const employee = await database_1.prisma.employee.findFirst({
            where: { id: dto.employeeId, deletedAt: null },
        });
        if (!employee) {
            throw new common_1.BadRequestException('Employee not found or is soft-deleted');
        }
        if (employee.status !== database_1.EmployeeStatus.ACTIVE) {
            throw new common_1.BadRequestException(`Cannot log attendance for ${employee.status} employee`);
        }
        const dateStr = dto.date || new Date().toISOString().split('T')[0];
        const date = this.parseDate(dateStr);
        this.validateNotFutureDate(date);
        const checkIn = dto.checkIn ? new Date(dto.checkIn) : null;
        const checkOut = dto.checkOut ? new Date(dto.checkOut) : null;
        const computed = this.calculateHours(dto.checkIn, dto.checkOut, dto.status);
        const workingHours = dto.workingHours !== undefined ? dto.workingHours : computed.workingHours;
        const record = await database_1.prisma.attendanceLog.upsert({
            where: {
                employeeId_date: {
                    employeeId: dto.employeeId,
                    date,
                },
            },
            update: {
                status: dto.status,
                checkIn,
                checkOut,
                workingHours,
                remarks: dto.remarks,
                createdByUserId: userId || null,
            },
            create: {
                employeeId: dto.employeeId,
                date,
                status: dto.status,
                checkIn,
                checkOut,
                workingHours,
                remarks: dto.remarks,
                createdByUserId: userId || null,
            },
            include: {
                employee: true,
            },
        });
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'LOG_ATTENDANCE',
                    entityName: 'AttendanceLog',
                    entityId: record.id,
                    newValues: record,
                    userId: userId || null,
                },
            });
        }
        catch {
        }
        return record;
    }
    async bulkCreate(dto, userId) {
        const date = this.parseDate(dto.date);
        this.validateNotFutureDate(date);
        const results = [];
        for (const item of dto.records) {
            try {
                const res = await this.create({
                    employeeId: item.employeeId,
                    date: dto.date,
                    status: item.status,
                    checkIn: item.checkIn,
                    checkOut: item.checkOut,
                    workingHours: item.workingHours,
                    remarks: item.remarks,
                }, userId);
                results.push(res);
            }
            catch (err) {
            }
        }
        return {
            message: `Successfully processed ${results.length} out of ${dto.records.length} attendance entries`,
            processedCount: results.length,
            records: results,
        };
    }
    async update(id, dto, userId) {
        const existing = await database_1.prisma.attendanceLog.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Attendance record with ID ${id} not found`);
        }
        const dataToUpdate = {};
        if (dto.status)
            dataToUpdate.status = dto.status;
        if (dto.checkIn !== undefined)
            dataToUpdate.checkIn = dto.checkIn ? new Date(dto.checkIn) : null;
        if (dto.checkOut !== undefined)
            dataToUpdate.checkOut = dto.checkOut ? new Date(dto.checkOut) : null;
        if (dto.workingHours !== undefined)
            dataToUpdate.workingHours = dto.workingHours;
        if (dto.remarks !== undefined)
            dataToUpdate.remarks = dto.remarks;
        const updated = await database_1.prisma.attendanceLog.update({
            where: { id },
            data: dataToUpdate,
            include: { employee: true },
        });
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'UPDATE_ATTENDANCE',
                    entityName: 'AttendanceLog',
                    entityId: id,
                    oldValues: existing,
                    newValues: updated,
                    userId: userId || null,
                },
            });
        }
        catch {
        }
        return updated;
    }
    async delete(id, userId) {
        const existing = await database_1.prisma.attendanceLog.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Attendance record with ID ${id} not found`);
        }
        await database_1.prisma.attendanceLog.delete({ where: { id } });
        try {
            await database_1.prisma.auditLog.create({
                data: {
                    action: 'DELETE_ATTENDANCE',
                    entityName: 'AttendanceLog',
                    entityId: id,
                    oldValues: existing,
                    userId: userId || null,
                },
            });
        }
        catch {
        }
        return { message: 'Attendance record deleted successfully', id };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)()
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map