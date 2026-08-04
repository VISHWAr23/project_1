import { z } from 'zod';

export const createJobWorkCompanySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  gstin: z.string().optional(),
  address: z.string().optional(),
  creditDays: z.number().int().min(0).default(30),
});

export type CreateJobWorkCompanyInput = z.infer<typeof createJobWorkCompanySchema>;

export const createJobWorkOrderSchema = z.object({
  jobWorkCompanyId: z.string().uuid('Valid Job Working Company is required'),
  rawMaterialId: z.string().uuid('Valid Raw Material is required'),
  finishedProductId: z.string().uuid('Valid Finished Product is required').optional().nullable(),
  expectedReturnDate: z.string().min(1, 'Expected return date is required'),
  remarks: z.string().optional(),
});

export type CreateJobWorkOrderInput = z.infer<typeof createJobWorkOrderSchema>;

export const issueItemSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required'),
  batchId: z.string().uuid().optional().nullable(),
  issuedWeight: z.number().positive('Issued weight must be greater than 0'),
  issuedQty: z.number().positive('Issued quantity must be greater than 0'),
  remarks: z.string().optional(),
});

export type IssueItemInput = z.infer<typeof issueItemSchema>;

export const issueMaterialsSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  driverName: z.string().min(1, 'Driver name is required'),
  remarks: z.string().optional(),
  items: z.array(issueItemSchema).min(1, 'At least one roll must be issued'),
});

export type IssueMaterialsInput = z.infer<typeof issueMaterialsSchema>;

export const returnItemSchema = z.object({
  finishedProductId: z.string().uuid('Valid Finished Product is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  returnedWeight: z.number().positive('Returned weight must be greater than 0'),
  returnedQty: z.number().positive('Returned quantity must be greater than 0'),
  wastageWeight: z.number().min(0).default(0),
  wastageQty: z.number().min(0).default(0),
  photoUrls: z.array(z.string().url()).optional(),
  remarks: z.string().optional(),
});

export type ReturnItemInput = z.infer<typeof returnItemSchema>;

export const receiveReturnSchema = z.object({
  returnedDate: z.string().min(1, 'Return date is required'),
  items: z.array(returnItemSchema).min(1, 'At least one returned item/roll is required'),
  remarks: z.string().optional(),
});

export type ReceiveReturnInput = z.infer<typeof receiveReturnSchema>;

export const closeJobWorkOrderSchema = z.object({
  remarks: z.string().optional(),
  confirmed: z.boolean().refine((val) => val === true, {
    message: 'You must confirm order closure',
  }),
});

export type CloseJobWorkOrderInput = z.infer<typeof closeJobWorkOrderSchema>;
