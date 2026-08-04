"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovePayrollSchema = exports.RecordSalaryPaymentSchema = exports.UpdatePayrollItemAdjustmentSchema = exports.GeneratePayrollSchema = void 0;
const zod_1 = require("zod");
exports.GeneratePayrollSchema = zod_1.z.object({
    month: zod_1.z.number().int().min(1).max(12),
    year: zod_1.z.number().int().min(2020).max(2100),
    remarks: zod_1.z.string().optional(),
});
exports.UpdatePayrollItemAdjustmentSchema = zod_1.z.object({
    bonusAmount: zod_1.z.number().min(0).optional(),
    incentiveAmount: zod_1.z.number().min(0).optional(),
    lateDeduction: zod_1.z.number().min(0).optional(),
    advanceDeduction: zod_1.z.number().min(0).optional(),
    loanDeduction: zod_1.z.number().min(0).optional(),
    pfDeduction: zod_1.z.number().min(0).optional(),
    esiDeduction: zod_1.z.number().min(0).optional(),
    professionalTax: zod_1.z.number().min(0).optional(),
    otherDeductions: zod_1.z.number().min(0).optional(),
    remarks: zod_1.z.string().optional(),
});
exports.RecordSalaryPaymentSchema = zod_1.z.object({
    payrollItemId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive('Payment amount must be positive'),
    paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE']),
    transactionRef: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional(),
});
exports.ApprovePayrollSchema = zod_1.z.object({
    remarks: zod_1.z.string().optional(),
});
//# sourceMappingURL=salary.schema.js.map