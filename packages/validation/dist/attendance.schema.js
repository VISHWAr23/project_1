"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAttendanceSchema = exports.bulkAttendanceSchema = exports.bulkAttendanceItemSchema = exports.createAttendanceSchema = exports.attendanceStatusEnum = void 0;
const zod_1 = require("zod");
exports.attendanceStatusEnum = zod_1.z.enum([
    'PRESENT',
    'ABSENT',
    'HALF_DAY',
    'LEAVE',
    'HOLIDAY',
    'WEEKLY_OFF',
]);
exports.createAttendanceSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid('Invalid employee ID'),
    date: zod_1.z.string().min(1, 'Date is required'),
    checkIn: zod_1.z.string().optional().or(zod_1.z.literal('')).nullable(),
    checkOut: zod_1.z.string().optional().or(zod_1.z.literal('')).nullable(),
    status: exports.attendanceStatusEnum.default('PRESENT'),
    workingHours: zod_1.z.number().min(0).max(24).optional().default(8),
    remarks: zod_1.z.string().optional().or(zod_1.z.literal('')),
});
exports.bulkAttendanceItemSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid('Invalid employee ID'),
    status: exports.attendanceStatusEnum.default('PRESENT'),
    checkIn: zod_1.z.string().optional().or(zod_1.z.literal('')).nullable(),
    checkOut: zod_1.z.string().optional().or(zod_1.z.literal('')).nullable(),
    workingHours: zod_1.z.number().optional().default(8),
    remarks: zod_1.z.string().optional().or(zod_1.z.literal('')),
});
exports.bulkAttendanceSchema = zod_1.z.object({
    date: zod_1.z.string().min(1, 'Date is required'),
    departmentId: zod_1.z.string().optional().or(zod_1.z.literal('')),
    records: zod_1.z.array(exports.bulkAttendanceItemSchema).min(1, 'At least one attendance record is required'),
});
exports.updateAttendanceSchema = exports.createAttendanceSchema.partial();
//# sourceMappingURL=attendance.schema.js.map