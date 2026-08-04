import { z } from 'zod';
export declare const GeneratePayrollSchema: z.ZodObject<{
    month: z.ZodNumber;
    year: z.ZodNumber;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    month: number;
    year: number;
    remarks?: string | undefined;
}, {
    month: number;
    year: number;
    remarks?: string | undefined;
}>;
export type GeneratePayrollInput = z.infer<typeof GeneratePayrollSchema>;
export declare const UpdatePayrollItemAdjustmentSchema: z.ZodObject<{
    bonusAmount: z.ZodOptional<z.ZodNumber>;
    incentiveAmount: z.ZodOptional<z.ZodNumber>;
    lateDeduction: z.ZodOptional<z.ZodNumber>;
    advanceDeduction: z.ZodOptional<z.ZodNumber>;
    loanDeduction: z.ZodOptional<z.ZodNumber>;
    pfDeduction: z.ZodOptional<z.ZodNumber>;
    esiDeduction: z.ZodOptional<z.ZodNumber>;
    professionalTax: z.ZodOptional<z.ZodNumber>;
    otherDeductions: z.ZodOptional<z.ZodNumber>;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    remarks?: string | undefined;
    bonusAmount?: number | undefined;
    incentiveAmount?: number | undefined;
    lateDeduction?: number | undefined;
    advanceDeduction?: number | undefined;
    loanDeduction?: number | undefined;
    pfDeduction?: number | undefined;
    esiDeduction?: number | undefined;
    professionalTax?: number | undefined;
    otherDeductions?: number | undefined;
}, {
    remarks?: string | undefined;
    bonusAmount?: number | undefined;
    incentiveAmount?: number | undefined;
    lateDeduction?: number | undefined;
    advanceDeduction?: number | undefined;
    loanDeduction?: number | undefined;
    pfDeduction?: number | undefined;
    esiDeduction?: number | undefined;
    professionalTax?: number | undefined;
    otherDeductions?: number | undefined;
}>;
export type UpdatePayrollItemAdjustmentInput = z.infer<typeof UpdatePayrollItemAdjustmentSchema>;
export declare const RecordSalaryPaymentSchema: z.ZodObject<{
    payrollItemId: z.ZodString;
    amount: z.ZodNumber;
    paymentMethod: z.ZodEnum<["CASH", "BANK_TRANSFER", "UPI", "CHEQUE"]>;
    transactionRef: z.ZodOptional<z.ZodString>;
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    payrollItemId: string;
    amount: number;
    paymentMethod: "CASH" | "BANK_TRANSFER" | "UPI" | "CHEQUE";
    remarks?: string | undefined;
    transactionRef?: string | undefined;
}, {
    payrollItemId: string;
    amount: number;
    paymentMethod: "CASH" | "BANK_TRANSFER" | "UPI" | "CHEQUE";
    remarks?: string | undefined;
    transactionRef?: string | undefined;
}>;
export type RecordSalaryPaymentInput = z.infer<typeof RecordSalaryPaymentSchema>;
export declare const ApprovePayrollSchema: z.ZodObject<{
    remarks: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    remarks?: string | undefined;
}, {
    remarks?: string | undefined;
}>;
export type ApprovePayrollInput = z.infer<typeof ApprovePayrollSchema>;
//# sourceMappingURL=salary.schema.d.ts.map