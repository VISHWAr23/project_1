import { z } from 'zod';

export const attendanceStatusEnum = z.enum([
  'PRESENT',
  'ABSENT',
  'HALF_DAY',
  'LEAVE',
  'HOLIDAY',
  'WEEKLY_OFF',
]);

export const createAttendanceSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  date: z.string().min(1, 'Date is required'),
  checkIn: z.string().optional().or(z.literal('')).nullable(),
  checkOut: z.string().optional().or(z.literal('')).nullable(),
  status: attendanceStatusEnum.default('PRESENT'),
  workingHours: z.number().min(0).max(24).optional().default(8),
  remarks: z.string().optional().or(z.literal('')),
});

export const bulkAttendanceItemSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  status: attendanceStatusEnum.default('PRESENT'),
  checkIn: z.string().optional().or(z.literal('')).nullable(),
  checkOut: z.string().optional().or(z.literal('')).nullable(),
  workingHours: z.number().optional().default(8),
  remarks: z.string().optional().or(z.literal('')),
});

export const bulkAttendanceSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  departmentId: z.string().optional().or(z.literal('')),
  records: z.array(bulkAttendanceItemSchema).min(1, 'At least one attendance record is required'),
});

export const updateAttendanceSchema = createAttendanceSchema.partial();

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
