"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocumentSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
exports.createEmployeeSchema = zod_1.z.object({
    employeeCode: zod_1.z.string().optional(),
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    alternatePhone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    avatarUrl: zod_1.z.string().optional().or(zod_1.z.literal('')),
    gender: zod_1.z.string().optional().or(zod_1.z.literal('')),
    dob: zod_1.z.string().optional().or(zod_1.z.literal('')),
    bloodGroup: zod_1.z.string().optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().optional().or(zod_1.z.literal('')),
    city: zod_1.z.string().optional().or(zod_1.z.literal('')),
    state: zod_1.z.string().optional().or(zod_1.z.literal('')),
    pinCode: zod_1.z.string().optional().or(zod_1.z.literal('')),
    emergencyContact: zod_1.z.string().optional().or(zod_1.z.literal('')),
    emergencyPhone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    aadhaarNo: zod_1.z.string().optional().or(zod_1.z.literal('')),
    panNo: zod_1.z.string().optional().or(zod_1.z.literal('')),
    joiningDate: zod_1.z.string().min(1, 'Joining date is required'),
    employmentType: zod_1.z.string().default('Permanent'),
    shift: zod_1.z.string().default('General Day'),
    salaryType: zod_1.z.string().default('Monthly Salary'),
    baseWage: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    bankName: zod_1.z.string().optional().or(zod_1.z.literal('')),
    bankAccountNo: zod_1.z.string().optional().or(zod_1.z.literal('')),
    bankIfsc: zod_1.z.string().optional().or(zod_1.z.literal('')),
    upiId: zod_1.z.string().optional().or(zod_1.z.literal('')),
    departmentId: zod_1.z.string().uuid('Invalid department ID').optional().or(zod_1.z.literal('')).nullable(),
    designationId: zod_1.z.string().uuid('Invalid designation ID').optional().or(zod_1.z.literal('')).nullable(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'RESIGNED']).default('ACTIVE'),
});
exports.updateEmployeeSchema = exports.createEmployeeSchema.partial();
exports.uploadDocumentSchema = zod_1.z.object({
    documentType: zod_1.z.string().min(1, 'Document type is required'),
    fileName: zod_1.z.string().min(1, 'File name is required'),
    fileUrl: zod_1.z.string().url('Valid file URL is required'),
    storagePath: zod_1.z.string().optional(),
});
//# sourceMappingURL=employee.schema.js.map