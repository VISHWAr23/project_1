import { z } from 'zod';

export const GeneratePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  periodType: z.enum(['MONTHLY', 'WEEKLY']).default('MONTHLY'),
  weekNumber: z.number().int().min(1).max(53).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  remarks: z.string().optional(),
});

export type GeneratePayrollInput = z.infer<typeof GeneratePayrollSchema>;

export const UpdatePayrollItemAdjustmentSchema = z.object({
  bonusAmount: z.number().min(0).optional(),
  incentiveAmount: z.number().min(0).optional(),
  overtimeHours: z.number().min(0).optional(),
  overtimeRate: z.number().min(0).optional(),
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
  payrollItemId: z.string().uuid().optional().nullable(),
  employeeId: z.string().uuid().optional(),
  paymentType: z.enum(['NORMAL_SALARY', 'OVERTIME_SALARY', 'ADVANCE_DISBURSEMENT', 'ADVANCE_REPAYMENT', 'FULL_SETTLEMENT']).default('NORMAL_SALARY'),
  amount: z.number().positive('Payment amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE']),
  transactionRef: z.string().optional(),
  remarks: z.string().optional(),
});

export type RecordSalaryPaymentInput = z.infer<typeof RecordSalaryPaymentSchema>;

export const CreateAdvanceSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  amount: z.number().positive('Advance amount must be greater than 0'),
  weeklyDeduction: z.number().min(0).optional().default(0),
  reason: z.string().optional().or(z.literal('')),
  issueDate: z.string().optional(),
});

export type CreateAdvanceInput = z.infer<typeof CreateAdvanceSchema>;

export const RepayAdvanceSchema = z.object({
  advanceId: z.string().uuid('Invalid advance ID'),
  employeeId: z.string().uuid().optional(),
  amount: z.number().positive('Repayment amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE']).default('CASH'),
  notes: z.string().optional().or(z.literal('')),
});

export type RepayAdvanceInput = z.infer<typeof RepayAdvanceSchema>;

export const SettleEmployeePaymentSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  paymentType: z.enum(['NORMAL_SALARY', 'OVERTIME_SALARY', 'ADVANCE_DISBURSEMENT', 'ADVANCE_REPAYMENT', 'FULL_SETTLEMENT']),
  amount: z.number().positive('Amount must be greater than 0'),
  weeklyDeduction: z.number().min(0).optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE']).default('CASH'),
  transactionRef: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
  advanceId: z.string().uuid().optional().nullable(),
});

export type SettleEmployeePaymentInput = z.infer<typeof SettleEmployeePaymentSchema>;

export const ApprovePayrollSchema = z.object({
  remarks: z.string().optional(),
});

export type ApprovePayrollInput = z.infer<typeof ApprovePayrollSchema>;
