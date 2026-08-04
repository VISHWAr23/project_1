"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeJobWorkOrderSchema = exports.receiveReturnSchema = exports.returnItemSchema = exports.issueMaterialsSchema = exports.issueItemSchema = exports.createJobWorkOrderSchema = exports.createJobWorkCompanySchema = void 0;
const zod_1 = require("zod");
exports.createJobWorkCompanySchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2, 'Company name is required'),
    contactPerson: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email format').optional().or(zod_1.z.literal('')),
    gstin: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    creditDays: zod_1.z.number().int().min(0).default(30),
});
exports.createJobWorkOrderSchema = zod_1.z.object({
    jobWorkCompanyId: zod_1.z.string().uuid('Valid Job Working Company is required'),
    rawMaterialId: zod_1.z.string().uuid('Valid Raw Material is required'),
    finishedProductId: zod_1.z.string().uuid('Valid Finished Product is required').optional().nullable(),
    expectedReturnDate: zod_1.z.string().min(1, 'Expected return date is required'),
    remarks: zod_1.z.string().optional(),
});
exports.issueItemSchema = zod_1.z.object({
    rollNumber: zod_1.z.string().min(1, 'Roll number is required'),
    batchId: zod_1.z.string().uuid().optional().nullable(),
    issuedWeight: zod_1.z.number().positive('Issued weight must be greater than 0'),
    issuedQty: zod_1.z.number().positive('Issued quantity must be greater than 0'),
    remarks: zod_1.z.string().optional(),
});
exports.issueMaterialsSchema = zod_1.z.object({
    vehicleNumber: zod_1.z.string().min(1, 'Vehicle number is required'),
    driverName: zod_1.z.string().min(1, 'Driver name is required'),
    remarks: zod_1.z.string().optional(),
    items: zod_1.z.array(exports.issueItemSchema).min(1, 'At least one roll must be issued'),
});
exports.returnItemSchema = zod_1.z.object({
    finishedProductId: zod_1.z.string().uuid('Valid Finished Product is required'),
    rollNumber: zod_1.z.string().min(1, 'Roll number is required'),
    returnedWeight: zod_1.z.number().positive('Returned weight must be greater than 0'),
    returnedQty: zod_1.z.number().positive('Returned quantity must be greater than 0'),
    wastageWeight: zod_1.z.number().min(0).default(0),
    wastageQty: zod_1.z.number().min(0).default(0),
    photoUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
    remarks: zod_1.z.string().optional(),
});
exports.receiveReturnSchema = zod_1.z.object({
    returnedDate: zod_1.z.string().min(1, 'Return date is required'),
    items: zod_1.z.array(exports.returnItemSchema).min(1, 'At least one returned item/roll is required'),
    remarks: zod_1.z.string().optional(),
});
exports.closeJobWorkOrderSchema = zod_1.z.object({
    remarks: zod_1.z.string().optional(),
    confirmed: zod_1.z.boolean().refine((val) => val === true, {
        message: 'You must confirm order closure',
    }),
});
//# sourceMappingURL=job-work.schema.js.map