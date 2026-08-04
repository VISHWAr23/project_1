import { z } from 'zod';

export const rawMaterialBaseSchema = z.object({
  sku: z.string().min(2, 'Material Code / SKU is required').max(50),
  name: z.string().min(2, 'Material Name is required').max(255),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID').optional().nullable().or(z.literal('')),
  unitId: z.string().uuid('Invalid unit ID').optional().nullable().or(z.literal('')),
  supplierId: z.string().uuid('Invalid supplier ID').optional().nullable().or(z.literal('')),
  storageLocationId: z.string().uuid('Invalid location ID').optional().nullable().or(z.literal('')),
  hsnCode: z.string().optional().nullable(),
  gstRate: z.number().min(0, 'GST Rate cannot be negative').default(0),
  minimumStockLevel: z.number().min(0, 'Minimum stock level must be positive'),
  maximumStockLevel: z.number().min(0, 'Maximum stock level must be positive').default(0),
  reorderQuantity: z.number().min(0, 'Reorder level must be positive').default(0),
  initialStock: z.number().min(0, 'Initial stock cannot be negative').default(0),
  unitCost: z.number().min(0, 'Purchase rate / Unit cost must be positive').default(0),
  remarks: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const createRawMaterialSchema = rawMaterialBaseSchema.refine(
  (data) => {
    if (data.maximumStockLevel && data.maximumStockLevel > 0) {
      return data.minimumStockLevel <= data.maximumStockLevel;
    }
    return true;
  },
  {
    message: 'Minimum stock level must be less than or equal to Maximum stock level',
    path: ['minimumStockLevel'],
  }
);

export type CreateRawMaterialInput = z.infer<typeof createRawMaterialSchema>;

export const updateRawMaterialSchema = rawMaterialBaseSchema.partial();
export type UpdateRawMaterialInput = z.infer<typeof updateRawMaterialSchema>;

export const stockTransactionSchema = z.object({
  rawMaterialId: z.string().uuid('Invalid material ID'),
  transactionType: z.enum([
    'PURCHASE_RECEIPT',
    'WORK_ORDER_ISSUE',
    'JOB_WORK_DISPATCH',
    'JOB_WORK_RETURN',
    'ADJUSTMENT_ADD',
    'ADJUSTMENT_SUBTRACT',
    'TRANSFER',
    'MANUAL_CORRECTION',
  ]),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative').optional().default(0),
  referenceNumber: z.string().optional().nullable(),
  referenceDocumentType: z.string().optional().nullable(),
  referenceDocumentId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type StockTransactionInput = z.infer<typeof stockTransactionSchema>;

export const createSupplierSchema = z.object({
  code: z.string().min(2, 'Supplier code is required'),
  name: z.string().min(2, 'Supplier name is required'),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  gstin: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const createStorageLocationSchema = z.object({
  code: z.string().min(2, 'Location code is required'),
  name: z.string().min(2, 'Location name is required'),
  warehouseZone: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CreateStorageLocationInput = z.infer<typeof createStorageLocationSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
