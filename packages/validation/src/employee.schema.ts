import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeCode: z.string().optional(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  alternatePhone: z.string().optional().or(z.literal('')),
  avatarUrl: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')),
  bloodGroup: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pinCode: z.string().optional().or(z.literal('')),
  emergencyContact: z.string().optional().or(z.literal('')),
  emergencyPhone: z.string().optional().or(z.literal('')),
  aadhaarNo: z.string().optional().or(z.literal('')),
  panNo: z.string().optional().or(z.literal('')),
  joiningDate: z.string().min(1, 'Joining date is required'),
  employmentType: z.string().default('Permanent'),
  shift: z.string().default('General Day'),
  salaryType: z.string().default('Monthly Salary'),
  baseWage: z.union([z.number(), z.string()]).optional(),
  bankName: z.string().optional().or(z.literal('')),
  bankAccountNo: z.string().optional().or(z.literal('')),
  bankIfsc: z.string().optional().or(z.literal('')),
  upiId: z.string().optional().or(z.literal('')),
  departmentId: z.string().uuid('Invalid department ID').optional().or(z.literal('')).nullable(),
  designationId: z.string().uuid('Invalid designation ID').optional().or(z.literal('')).nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'RESIGNED']).default('ACTIVE'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const uploadDocumentSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  storagePath: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
