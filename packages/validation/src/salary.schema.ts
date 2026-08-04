import { z } from 'zod';

export const GeneratePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  remarks: z.string().optional(),
});

export type GeneratePayrollInput = z.infer<typeof GeneratePayrollSchema>;

export const UpdatePayrollItemAdjustmentSchema = z.object({
  bonusAmount: z.number().min(0).optional(),
  incentiveAmount: z.number().min(0).optional(),
  lateDeduction: z.number().min(0).optional(),
  advanceDeduction: z.number().min(0).optional(),
  loanDeduction: z.number().min(0).optional(),
  pfDeduction: z.number().min(0).optional(),
  esiDeduction: z.number().min(0).optional(),
  professionalTax: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  remarks: z.string().optional(),
});

export type UpdatePayrollItemAdjustmentInput = z.infer<typeof UpdatePayrollItemAdjustmentSchema>;

export const RecordSalaryPaymentSchema = z.object({
  payrollItemId: z.string().uuid(),
  amount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE']),
  transactionRef: z.string().optional(),
  remarks: z.string().optional(),
});

export type RecordSalaryPaymentInput = z.infer<typeof RecordSalaryPaymentSchema>;

export const ApprovePayrollSchema = z.object({
  remarks: z.string().optional(),
});

export type ApprovePayrollInput = z.infer<typeof ApprovePayrollSchema>;
