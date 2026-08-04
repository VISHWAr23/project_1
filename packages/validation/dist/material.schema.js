"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = exports.createStorageLocationSchema = exports.createSupplierSchema = exports.stockTransactionSchema = exports.updateRawMaterialSchema = exports.createRawMaterialSchema = exports.rawMaterialBaseSchema = void 0;
const zod_1 = require("zod");
exports.rawMaterialBaseSchema = zod_1.z.object({
    sku: zod_1.z.string().min(2, 'Material Code / SKU is required').max(50),
    name: zod_1.z.string().min(2, 'Material Name is required').max(255),
    description: zod_1.z.string().optional().nullable(),
    categoryId: zod_1.z.string().uuid('Invalid category ID').optional().nullable().or(zod_1.z.literal('')),
    unitId: zod_1.z.string().uuid('Invalid unit ID').optional().nullable().or(zod_1.z.literal('')),
    supplierId: zod_1.z.string().uuid('Invalid supplier ID').optional().nullable().or(zod_1.z.literal('')),
    storageLocationId: zod_1.z.string().uuid('Invalid location ID').optional().nullable().or(zod_1.z.literal('')),
    hsnCode: zod_1.z.string().optional().nullable(),
    gstRate: zod_1.z.number().min(0, 'GST Rate cannot be negative').default(0),
    minimumStockLevel: zod_1.z.number().min(0, 'Minimum stock level must be positive'),
    maximumStockLevel: zod_1.z.number().min(0, 'Maximum stock level must be positive').default(0),
    reorderQuantity: zod_1.z.number().min(0, 'Reorder level must be positive').default(0),
    initialStock: zod_1.z.number().min(0, 'Initial stock cannot be negative').default(0),
    unitCost: zod_1.z.number().min(0, 'Purchase rate / Unit cost must be positive').default(0),
    remarks: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
exports.createRawMaterialSchema = exports.rawMaterialBaseSchema.refine((data) => {
    if (data.maximumStockLevel && data.maximumStockLevel > 0) {
        return data.minimumStockLevel <= data.maximumStockLevel;
    }
    return true;
}, {
    message: 'Minimum stock level must be less than or equal to Maximum stock level',
    path: ['minimumStockLevel'],
});
exports.updateRawMaterialSchema = exports.rawMaterialBaseSchema.partial();
exports.stockTransactionSchema = zod_1.z.object({
    rawMaterialId: zod_1.z.string().uuid('Invalid material ID'),
    transactionType: zod_1.z.enum([
        'PURCHASE_RECEIPT',
        'WORK_ORDER_ISSUE',
        'JOB_WORK_DISPATCH',
        'JOB_WORK_RETURN',
        'ADJUSTMENT_ADD',
        'ADJUSTMENT_SUBTRACT',
        'TRANSFER',
        'MANUAL_CORRECTION',
    ]),
    quantity: zod_1.z.number().positive('Quantity must be greater than 0'),
    unitPrice: zod_1.z.number().min(0, 'Unit price cannot be negative').optional().default(0),
    referenceNumber: zod_1.z.string().optional().nullable(),
    referenceDocumentType: zod_1.z.string().optional().nullable(),
    referenceDocumentId: zod_1.z.string().uuid().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
});
exports.createSupplierSchema = zod_1.z.object({
    code: zod_1.z.string().min(2, 'Supplier code is required'),
    name: zod_1.z.string().min(2, 'Supplier name is required'),
    contactPerson: zod_1.z.string().optional().nullable(),
    email: zod_1.z.string().email('Invalid email address').optional().nullable().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().nullable(),
    gstin: zod_1.z.string().optional().nullable(),
    address: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
exports.createStorageLocationSchema = zod_1.z.object({
    code: zod_1.z.string().min(2, 'Location code is required'),
    name: zod_1.z.string().min(2, 'Location name is required'),
    warehouseZone: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Category name is required'),
    description: zod_1.z.string().optional().nullable(),
});
//# sourceMappingURL=material.schema.js.map