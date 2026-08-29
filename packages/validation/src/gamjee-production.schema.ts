import { z } from 'zod';

export const gamjeeSizeSchema = z.object({
  name: z.string().min(1, 'Size name is required').max(100),
  width: z.number().positive('Width must be greater than 0'),
  widthUom: z.string().default('cm'),
  length: z.number().positive('Length must be greater than 0'),
  lengthUom: z.string().default('m'),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type GamjeeSizeInput = z.infer<typeof gamjeeSizeSchema>;

export const gamjeeOperationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(50),
  sequence: z.number().int().min(1).default(1),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type GamjeeOperationInput = z.infer<typeof gamjeeOperationSchema>;

export const gamjeeProductMasterSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  productName: z.string().min(1, 'Product name is required').max(255),
  gamjeeType: z.string().optional().nullable(),
  width: z.number().positive().optional().nullable(),
  widthUom: z.string().default('cm'),
  rollLength: z.number().positive().optional().nullable(),
  lengthUom: z.string().default('m'),
  cottonRequirement: z.number().positive().optional().nullable(),
  cottonUom: z.string().default('kg'),
  fabricRequirement: z.number().positive().optional().nullable(),
  fabricUom: z.string().default('m'),
  active: z.boolean().default(true),
});

export type GamjeeProductMasterInput = z.infer<typeof gamjeeProductMasterSchema>;

export const createGamjeeProductionBatchSchema = z.object({
  finishedProductId: z.string().uuid('Finished Gamjee Product is required'),
  gamjeeSizeId: z.string().uuid('Gamjee Size is required').optional().nullable(),
  productionQuantity: z.number().positive('Planned quantity must be greater than 0').optional().nullable(),
  productionUom: z.string().default('Rolls'),
  productionDate: z.string().min(1, 'Production date is required'),
  expectedCompletionDate: z.string().optional().nullable(),
  calculationMode: z.enum(['FROM_FABRIC', 'FROM_PIECES']).default('FROM_FABRIC').optional().nullable(),
  pinningSizeMeters: z.number().positive().optional().nullable(),
  foldingCutsCount: z.number().int().positive().optional().nullable(),
  cottonSpecId: z.string().uuid().optional().nullable(),
  cottonTypeName: z.string().optional().nullable(),
  plannedFabricMeters: z.number().positive().optional().nullable(),
  plannedCottonKg: z.number().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateGamjeeProductionBatchInput = z.infer<typeof createGamjeeProductionBatchSchema>;

export const updateGamjeeProductionBatchSchema = z.object({
  gamjeeSizeId: z.string().uuid().optional().nullable(),
  productionQuantity: z.number().positive().optional().nullable(),
  expectedCompletionDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum([
    'DRAFT',
    'MATERIALS_SELECTED',
    'PINNING',
    'FOLDING',
    'CUTTING',
    'COTTON_PREPARATION',
    'READY_FOR_ROLLING',
    'ROLLING',
    'COMPLETED',
    'ON_HOLD',
    'CANCELLED',
  ]).optional(),
});

export type UpdateGamjeeProductionBatchInput = z.infer<typeof updateGamjeeProductionBatchSchema>;

export const issueGamjeeMaterialsSchema = z.object({
  fabricProductId: z.string().uuid('Bleached Fabric product is required'),
  fabricInventoryBatchId: z.string().uuid().optional().nullable(),
  fabricRollOrBatchNumber: z.string().optional().nullable(),
  fabricQuantityIssued: z.number().positive('Fabric quantity must be greater than 0'),
  fabricUom: z.string().min(1, 'Fabric UOM is required').default('meter'),
  fabricWarehouseId: z.string().uuid().optional().nullable(),

  cottonProductId: z.string().uuid('Cotton Roll product is required'),
  cottonInventoryBatchId: z.string().uuid().optional().nullable(),
  cottonRollOrBatchNumber: z.string().optional().nullable(),
  cottonQuantityIssued: z.number().positive('Cotton quantity must be greater than 0'),
  cottonUom: z.string().min(1, 'Cotton UOM is required').default('kg'),
  cottonWarehouseId: z.string().uuid().optional().nullable(),

  issuedDate: z.string().min(1, 'Issued date is required'),
  notes: z.string().optional().nullable(),
});

export type IssueGamjeeMaterialsInput = z.infer<typeof issueGamjeeMaterialsSchema>;

export const addGamjeeOperationSchema = z.object({
  operationTypeId: z.string().uuid('Operation type is required'),
  sequenceNumber: z.number().int().min(1).default(1),
  inputQuantity: z.number().positive('Input quantity must be greater than 0'),
  inputUom: z.string().min(1, 'UOM is required').default('meter'),
  outputQuantity: z.number().min(0, 'Output quantity cannot be negative'),
  outputUom: z.string().min(1, 'UOM is required').default('meter'),
  wastageQuantity: z.number().min(0, 'Wastage cannot be negative').default(0),
  rejectedQuantity: z.number().min(0, 'Rejection cannot be negative').default(0),
  employeeId: z.string().uuid().optional().nullable(),
  machineId: z.string().optional().nullable(),
  operationDate: z.string().min(1, 'Operation date is required'),
  notes: z.string().optional().nullable(),
});

export type AddGamjeeOperationInput = z.infer<typeof addGamjeeOperationSchema>;

export const createGamjeeRollingSchema = z.object({
  fabricInputQuantity: z.number().positive('Fabric input quantity must be greater than 0'),
  fabricInputUom: z.string().default('meter'),
  cottonInputQuantity: z.number().positive('Cotton input quantity must be greater than 0'),
  cottonInputUom: z.string().default('kg'),
  finishedRollQuantity: z.number().int().positive('Finished roll count must be greater than 0'),
  finishedRollUom: z.string().default('Rolls'),
  finishedRollLength: z.number().positive().optional().nullable(),
  finishedRollLengthUom: z.string().default('m'),
  finishedRollWidth: z.number().positive().optional().nullable(),
  finishedRollWidthUom: z.string().default('cm'),
  wastageQuantity: z.number().min(0).default(0),
  rejectedRollQuantity: z.number().int().min(0).default(0),
  employeeId: z.string().uuid().optional().nullable(),
  machineId: z.string().optional().nullable(),
  rollingDate: z.string().min(1, 'Rolling date is required'),
  warehouseId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  markBatchCompleted: z.boolean().default(true),
});

export type CreateGamjeeRollingInput = z.infer<typeof createGamjeeRollingSchema>;

export const gamjeeBatchQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  gamjeeSizeId: z.string().uuid().optional(),
  finishedProductId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GamjeeBatchQueryInput = z.infer<typeof gamjeeBatchQuerySchema>;
