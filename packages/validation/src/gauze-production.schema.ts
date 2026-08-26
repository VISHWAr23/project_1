import { z } from 'zod';

export const gauzeTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type GauzeTypeInput = z.infer<typeof gauzeTypeSchema>;

export const gauzeSizeSchema = z.object({
  name: z.string().min(1, 'Size name is required').max(100),
  width: z.number().positive('Width must be greater than 0'),
  widthUom: z.string().default('cm'),
  length: z.number().positive('Length must be greater than 0'),
  lengthUom: z.string().default('m'),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type GauzeSizeInput = z.infer<typeof gauzeSizeSchema>;

export const bleachingTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type BleachingTypeInput = z.infer<typeof bleachingTypeSchema>;

export const gauzeOperationTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50),
  description: z.string().optional().nullable(),
  sequence: z.number().int().min(1).default(1),
  active: z.boolean().default(true),
});

export type GauzeOperationTypeInput = z.infer<typeof gauzeOperationTypeSchema>;

export const createGauzeProductionBatchSchema = z.object({
  productId: z.string().uuid('Raw Material / Product is required'),
  gauzeTypeId: z.string().uuid('Gauze Type is required').optional().nullable(),
  gauzeSizeId: z.string().uuid('Gauze Size is required').optional().nullable(),
  rawMaterialBatchId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid('Supplier is required').optional().nullable(),
  supplierReference: z.string().optional().nullable(),
  rollOrThansNumber: z.string().optional().nullable(),
  inputQuantity: z.number().positive('Input quantity must be greater than 0'),
  inputUom: z.string().min(1, 'UOM is required').default('meter'),
  productionStartDate: z.string().optional().nullable(),
  expectedCompletionDate: z.string().optional().nullable(),
  warehouseId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateGauzeProductionBatchInput = z.infer<typeof createGauzeProductionBatchSchema>;

export const updateGauzeProductionBatchSchema = z.object({
  gauzeTypeId: z.string().uuid().optional().nullable(),
  gauzeSizeId: z.string().uuid().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  expectedCompletionDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum([
    'DRAFT',
    'RAW_MATERIAL_RECEIVED',
    'READY_FOR_BLEACHING',
    'SENT_TO_BLEACHING',
    'BLEACHING_RECEIVED',
    'IN_PROCESSING',
    'READY_FOR_PACKING',
    'PACKED',
    'COMPLETED',
    'ON_HOLD',
    'CANCELLED',
  ]).optional(),
});

export type UpdateGauzeProductionBatchInput = z.infer<typeof updateGauzeProductionBatchSchema>;

export const sendToBleachingSchema = z.object({
  vendorId: z.string().uuid('Bleaching vendor is required'),
  bleachingTypeId: z.string().uuid('Bleaching process type is required'),
  quantitySent: z.number().positive('Quantity sent must be greater than 0'),
  uom: z.string().min(1, 'UOM is required').default('meter'),
  sentDate: z.string().min(1, 'Sent date is required'),
  expectedReturnDate: z.string().optional().nullable(),
  rate: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type SendToBleachingInput = z.infer<typeof sendToBleachingSchema>;

export const receiveBleachingSchema = z.object({
  bleachingJobId: z.string().uuid('Bleaching job is required'),
  quantityReceived: z.number().min(0, 'Received quantity cannot be negative'),
  wastageQuantity: z.number().min(0, 'Wastage cannot be negative').default(0),
  rejectedQuantity: z.number().min(0, 'Rejection cannot be negative').default(0),
  receivedDate: z.string().min(1, 'Received date is required'),
  qualityStatus: z.enum(['PASSED', 'REJECTED', 'ACCEPTED_WITH_DEVIATION']).default('PASSED'),
  notes: z.string().optional().nullable(),
});

export type ReceiveBleachingInput = z.infer<typeof receiveBleachingSchema>;

export const addProcessingOperationSchema = z.object({
  operationTypeId: z.string().uuid('Operation type is required'),
  sequenceNumber: z.number().int().min(1).default(1),
  inputQuantity: z.number().positive('Input quantity must be greater than 0'),
  outputQuantity: z.number().min(0, 'Output quantity cannot be negative'),
  wastageQuantity: z.number().min(0, 'Wastage cannot be negative').default(0),
  rejectedQuantity: z.number().min(0, 'Rejection cannot be negative').default(0),
  uom: z.string().min(1, 'UOM is required').default('meter'),
  employeeId: z.string().uuid().optional().nullable(),
  machineId: z.string().optional().nullable(),
  operationDate: z.string().min(1, 'Operation date is required'),
  notes: z.string().optional().nullable(),
});

export type AddProcessingOperationInput = z.infer<typeof addProcessingOperationSchema>;

export const createPackingEntrySchema = z.object({
  productId: z.string().uuid('Finished Product is required'),
  sizeDescription: z.string().optional().nullable(),
  ply: z.number().int().min(1).optional().nullable(),
  piecesPerPack: z.number().int().positive('Pieces per pack must be greater than 0'),
  numberOfPacks: z.number().int().positive('Number of packs must be greater than 0'),
  packingDate: z.string().min(1, 'Packing date is required'),
  finishedGoodsWarehouseId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  markBatchCompleted: z.boolean().default(true),
});

export type CreatePackingEntryInput = z.infer<typeof createPackingEntrySchema>;
