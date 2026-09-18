import { Employee } from './employee.types';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'LEAVE';

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  status: AttendanceStatus;
  workingHours: number;
  overtimeHours?: number;
  shortageHours?: number;
  otAmount?: number;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
  employeeId: string;
  employee: Employee;
}

export interface TodayAttendanceStats {
  date: string;
  totalActiveEmployees: number;
  presentToday: number;
  absentToday: number;
  halfDayToday: number;
  leaveToday: number;
  unmarkedToday: number;
  totalOvertimeHours?: number;
  totalShortageHours?: number;
  totalOvertimeAmount?: number;
}

export interface CreateAttendancePayload {
  employeeId: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  status: AttendanceStatus;
  workingHours?: number;
  overtimeHours?: number;
  shortageHours?: number;
  otAmount?: number;
  remarks?: string;
}

export interface BulkAttendanceItemPayload {
  employeeId: string;
  status: AttendanceStatus;
  checkIn?: string | null;
  checkOut?: string | null;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  workingHours?: number;
  overtimeHours?: number;
  shortageHours?: number;
  otAmount?: number;
  remarks?: string;
}

export interface BulkAttendancePayload {
  date: string;
  departmentId?: string;
  records: BulkAttendanceItemPayload[];
}

export interface UpdateAttendancePayload extends Partial<CreateAttendancePayload> {}

export interface AttendanceListResponse {
  items: AttendanceRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MonthSummaryEmployeeLog {
  date: string;
  status: AttendanceStatus;
  workingHours: number;
  overtimeHours?: number;
  shortageHours?: number;
  otAmount?: number;
  checkIn?: string | null;
  checkOut?: string | null;
  lunchStart?: string | null;
  lunchEnd?: string | null;
}

export interface MonthSummaryEmployee {
  employeeId: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  otRatePerHour?: number;
  salaryCycle?: string;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalLeave: number;
  totalWorkingHours: number;
  totalOvertimeHours?: number;
  totalShortageHours?: number;
  totalOtAmount?: number;
  logs: MonthSummaryEmployeeLog[];
}

export interface MonthSummaryResponse {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  employees: MonthSummaryEmployee[];
}
