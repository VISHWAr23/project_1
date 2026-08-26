export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'RESIGNED';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string | null;
  uploadedAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  alternatePhone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
  dob?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  aadhaarNo?: string | null;
  panNo?: string | null;
  joiningDate: string;
  employmentType?: 'Permanent' | 'Contract' | 'Temporary' | 'Intern' | string | null;
  shift?: string | null;
  salaryType?: 'Monthly Salary' | 'Weekly Wage' | 'Daily Wage' | string | null;
  salaryCycle?: 'MONTHLY' | 'WEEKLY' | string | null;
  baseWage?: number | string | null;
  otRatePerHour?: number | string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  bankIfsc?: string | null;
  upiId?: string | null;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  departmentId?: string | null;
  department?: Department | null;

  designationId?: string | null;
  designation?: Designation | null;

  documents?: EmployeeDocument[];
  advances?: EmployeeAdvance[];
}

export interface EmployeeAdvance {
  id: string;
  employeeId: string;
  amount: number;
  repaidAmount: number;
  balanceAmount: number;
  weeklyDeduction: number;
  reason?: string | null;
  status: 'ACTIVE' | 'FULLY_REPAID' | 'CANCELLED';
  issueDate: string;
  createdAt: string;
  repayments?: AdvanceRepayment[];
}

export interface AdvanceRepayment {
  id: string;
  advanceId: string;
  employeeId: string;
  amount: number;
  paymentMethod: string;
  notes?: string | null;
  repaymentDate: string;
  createdAt: string;
}

export interface EmployeeFinancialSummary {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
    salaryType: string;
    salaryCycle: string;
    baseWage: number;
    otRatePerHour: number;
  };
  currentCycle: {
    periodType: string;
    startDate: string;
    endDate: string;
    presentDays: number;
    halfDays: number;
    totalWorkingHours: number;
    totalOvertimeHours: number;
    baseSalaryEarned: number;
    otSalaryEarned: number;
  };
  advances: {
    activeAdvances: EmployeeAdvance[];
    totalAdvanceGiven: number;
    totalAdvanceRepaid: number;
    outstandingBalance: number;
    weeklyDeductionTotal: number;
  };
  recentPayments: any[];
  settlementSummary: {
    baseSalaryEarned: number;
    otSalaryEarned: number;
    totalGrossEarned: number;
    pendingAdvanceDeduction: number;
    estimatedNetPayout: number;
  };
}

export interface CreateAdvancePayload {
  employeeId: string;
  amount: number;
  weeklyDeduction?: number;
  reason?: string;
  issueDate?: string;
}

export interface RepayAdvancePayload {
  advanceId: string;
  employeeId?: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface SettlePaymentPayload {
  employeeId: string;
  paymentType: 'NORMAL_SALARY' | 'OVERTIME_SALARY' | 'ADVANCE_DISBURSEMENT' | 'ADVANCE_REPAYMENT' | 'FULL_SETTLEMENT';
  amount: number;
  weeklyDeduction?: number;
  paymentMethod?: string;
  transactionRef?: string;
  remarks?: string;
  advanceId?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  contractEmployees: number;
}

export interface CreateEmployeePayload {
  employeeCode?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  aadhaarNo?: string;
  panNo?: string;
  joiningDate: string;
  employmentType?: string;
  shift?: string;
  salaryType?: string;
  salaryCycle?: string;
  baseWage?: number;
  otRatePerHour?: number;
  bankName?: string;
  bankAccountNo?: string;
  bankIfsc?: string;
  upiId?: string;
  departmentId?: string;
  designationId?: string;
  status?: EmployeeStatus;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {}

export interface UploadDocumentPayload {
  documentType: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string;
}

export interface EmployeeListResponse {
  items: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: EmployeeStats;
}

export interface EmployeeReportDailyLog {
  id: string;
  date: string;
  dayOfWeek: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  overtimeHours: number;
  otAmount: number;
  remarks?: string | null;
}

export interface EmployeeReportData {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
    department: string;
    designation: string;
    joiningDate: string;
    employmentType: string;
    shift: string;
    salaryType: string;
    salaryCycle: string;
    baseWage: number;
    otRatePerHour: number;
    bankName?: string | null;
    bankAccountNo?: string | null;
    bankIfsc?: string | null;
    panNo?: string | null;
    aadhaarNo?: string | null;
  };
  period: {
    startDate: string;
    endDate: string;
    totalCalendarDays: number;
    formattedRange: string;
  };
  attendanceSummary: {
    totalLoggedRecords: number;
    presentDays: number;
    halfDays: number;
    absentDays: number;
    leaveDays: number;
    payableDays: number;
    totalWorkingHours: number;
    totalOvertimeHours: number;
  };
  financialSummary: {
    baseWage: number;
    otRatePerHour: number;
    payableDays: number;
    baseSalaryEarned: number;
    otSalaryEarned: number;
    totalGrossEarned: number;
    periodAdvanceGiven: number;
    totalOutstandingAdvance: number;
    totalDisbursedInPeriod: number;
  };
  dailyLogs: EmployeeReportDailyLog[];
  payments: any[];
  advances: any[];
  generatedAt: string;
}

