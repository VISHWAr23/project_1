export type PayrollStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';

export type AdjustmentType =
  | 'BONUS'
  | 'INCENTIVE'
  | 'LATE_DEDUCTION'
  | 'ADVANCE_DEDUCTION'
  | 'LOAN_DEDUCTION'
  | 'OTHER_DEDUCTION'
  | 'OTHER_ALLOWANCE';

export interface SalaryAdjustment {
  id: string;
  employeeId: string;
  payrollItemId?: string;
  month: number;
  year: number;
  type: AdjustmentType;
  amount: number;
  reason?: string;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  payrollItemId?: string | null;
  employeeId: string;
  paymentType?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  paymentDate: string;
  remarks?: string;
}

export interface SalarySlip {
  id: string;
  slipNumber: string;
  payrollItemId: string;
  employeeId: string;
  month: number;
  year: number;
  fileUrl?: string;
  generatedAt: string;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  salaryType: string;
  periodType?: 'MONTHLY' | 'WEEKLY' | string;
  baseWage: number;
  workingDaysInMonth: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  holidayCount: number;
  weeklyOffCount: number;
  payableDays: number;
  basicSalary: number;
  overtimeHours?: number;
  overtimeRate?: number;
  overtimeSalary?: number;
  shortageHours?: number;
  grossSalary: number;
  bonusAmount: number;
  incentiveAmount: number;
  lateDeduction: number;
  advanceDeduction: number;
  loanDeduction: number;
  pfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    bankName?: string;
    bankAccountNo?: string;
    bankIfsc?: string;
    upiId?: string;
    panNo?: string;
    salaryCycle?: string;
    otRatePerHour?: number;
    department?: { id: string; name: string; code: string };
    designation?: { id: string; name: string; code: string };
  };
  adjustments?: SalaryAdjustment[];
  payments?: SalaryPayment[];
  salarySlip?: SalarySlip;
}

export interface PayrollRun {
  id: string;
  payrollCode: string;
  month: number;
  year: number;
  periodType?: 'MONTHLY' | 'WEEKLY' | string;
  weekNumber?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalBonus: number;
  totalOvertime?: number;
  totalNet: number;
  status: PayrollStatus;
  remarks?: string;
  generatedAt: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  generatedByUser?: { id: string; email: string };
  approvedByUser?: { id: string; email: string };
  items?: PayrollItem[];
}

export interface SalaryDashboardSummary {
  kpis: {
    activeEmployees: number;
    totalRuns: number;
    pendingApprovals: number;
    approvedRuns: number;
    totalGrossSalary: number;
    totalDeductions: number;
    totalBonus: number;
    totalNetPayout: number;
  };
  currentRun?: PayrollRun;
  departmentBreakdown: Array<{
    departmentName: string;
    employeeCount: number;
    totalBaseWage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    totalGross: number;
    totalNet: number;
    status: PayrollStatus;
  }>;
}

export interface GeneratePayrollPayload {
  month: number;
  year: number;
  periodType?: 'MONTHLY' | 'WEEKLY';
  weekNumber?: number;
  startDate?: string;
  endDate?: string;
  remarks?: string;
}

export interface UpdatePayrollItemAdjustmentPayload {
  overtimeHours?: number;
  overtimeRate?: number;
  shortageHours?: number;
  bonusAmount?: number;
  incentiveAmount?: number;
  lateDeduction?: number;
  advanceDeduction?: number;
  loanDeduction?: number;
  pfDeduction?: number;
  esiDeduction?: number;
  professionalTax?: number;
  otherDeductions?: number;
  remarks?: string;
}

export interface RecordSalaryPaymentPayload {
  payrollItemId?: string;
  employeeId?: string;
  paymentType?: 'NORMAL_SALARY' | 'OVERTIME_SALARY' | 'ADVANCE_DISBURSEMENT' | 'ADVANCE_REPAYMENT' | 'FULL_SETTLEMENT';
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  remarks?: string;
}

export interface SalaryHistoryRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  salaryType: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  paymentDate?: string;
  snapshotData: any;
  createdAt: string;
  employee?: {
    employeeCode: string;
    firstName: string;
    lastName: string;
    department?: { name: string };
    designation?: { name: string };
  };
}
