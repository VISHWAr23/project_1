export type GauzeProductionStatus =
  | 'DRAFT'
  | 'RAW_MATERIAL_RECEIVED'
  | 'READY_FOR_BLEACHING'
  | 'SENT_TO_BLEACHING'
  | 'BLEACHING_RECEIVED'
  | 'IN_PROCESSING'
  | 'READY_FOR_PACKING'
  | 'PACKED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export interface GauzeType {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GauzeSize {
  id: string;
  name: string;
  width: number;
  widthUom: string;
  length: number;
  lengthUom: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BleachingType {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GauzeOperationType {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  sequence: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GauzeRawMaterialItem {
  id: string;
  productionBatchId: string;
  productId: string;
  supplierId?: string | null;
  supplierReference?: string | null;
  rollOrThansNumber?: string | null;
  gauzeTypeId?: string | null;
  gauzeSizeId?: string | null;
  quantity: number;
  uom: string;
  receivedDate?: string | null;
  warehouseId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string; sku: string };
  supplier?: { id: string; name: string; code: string } | null;
  gauzeType?: GauzeType | null;
  gauzeSize?: GauzeSize | null;
  warehouse?: { id: string; name: string; code: string } | null;
}

export interface GauzeBleachingReceiptItem {
  id: string;
  receiptNumber: string;
  bleachingJobId: string;
  productionBatchId: string;
  quantitySent: number;
  quantityReceived: number;
  wastageQuantity: number;
  rejectedQuantity: number;
  uom: string;
  receivedDate: string;
  qualityStatus?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  bleachingJob?: {
    id: string;
    jobNumber: string;
    vendor: { id: string; companyName: string };
    bleachingType: { id: string; name: string };
  };
}

export interface GauzeBleachingJobItem {
  id: string;
  jobNumber: string;
  productionBatchId: string;
  vendorId: string;
  bleachingTypeId: string;
  quantitySent: number;
  uom: string;
  sentDate: string;
  expectedReturnDate?: string | null;
  rate?: number | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: { id: string; companyName: string; contactPerson?: string | null; phone?: string | null };
  bleachingType: BleachingType;
  receipts: GauzeBleachingReceiptItem[];
  productionBatch?: { id: string; batchNumber: string; product: { id: string; name: string } };
}

export interface GauzeOperationItem {
  id: string;
  operationNumber: string;
  productionBatchId: string;
  operationTypeId: string;
  sequenceNumber: number;
  inputQuantity: number;
  outputQuantity: number;
  wastageQuantity: number;
  rejectedQuantity: number;
  uom: string;
  employeeId?: string | null;
  machineId?: string | null;
  operationDate: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  operationType: GauzeOperationType;
  employee?: { id: string; firstName: string; lastName: string; employeeCode: string } | null;
}

export interface GauzePackingItem {
  id: string;
  packingNumber: string;
  productionBatchId: string;
  productId: string;
  sizeDescription?: string | null;
  ply?: number | null;
  piecesPerPack: number;
  numberOfPacks: number;
  totalPieces: number;
  packingDate: string;
  finishedGoodsWarehouseId?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product: { id: string; name: string; sku: string };
  finishedGoodsWarehouse?: { id: string; name: string; code: string } | null;
  productionBatch?: { id: string; batchNumber: string };
}

export interface GauzeMaterialMovementItem {
  id: string;
  productionBatchId: string;
  referenceType: string;
  referenceId: string;
  movementType: string;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  fromLocationName?: string | null;
  toLocationName?: string | null;
  quantity: number;
  uom: string;
  movementDate: string;
  notes?: string | null;
  createdAt: string;
  fromLocation?: { id: string; name: string } | null;
  toLocation?: { id: string; name: string } | null;
}

export interface GauzeStatusHistoryItem {
  id: string;
  productionBatchId: string;
  oldStatus?: string | null;
  newStatus: string;
  changedById?: string | null;
  changedAt: string;
  remarks?: string | null;
  changedByUser?: { id: string; email: string } | null;
}

export interface GauzeProductionBatch {
  id: string;
  batchNumber: string;
  productId: string;
  gauzeTypeId?: string | null;
  gauzeSizeId?: string | null;
  rawMaterialBatchId?: string | null;
  supplierId?: string | null;
  inputQuantity: number;
  inputUom: string;
  currentQuantity: number;
  currentUom: string;
  currentStage: string;
  status: GauzeProductionStatus;
  productionStartDate?: string | null;
  expectedCompletionDate?: string | null;
  completionDate?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    unitCost?: number;
    currentStockBalance?: number;
  };
  gauzeType?: GauzeType | null;
  gauzeSize?: GauzeSize | null;
  supplier?: { id: string; name: string; code: string } | null;
  rawMaterials: GauzeRawMaterialItem[];
  bleachingJobs: GauzeBleachingJobItem[];
  bleachingReceipts: GauzeBleachingReceiptItem[];
  operations: GauzeOperationItem[];
  packingEntries: GauzePackingItem[];
  materialMovements: GauzeMaterialMovementItem[];
  statusHistory: GauzeStatusHistoryItem[];
  createdBy?: { id: string; email: string } | null;
  _count?: {
    bleachingJobs: number;
    bleachingReceipts: number;
    operations: number;
    packingEntries: number;
    materialMovements: number;
  };
}

export interface GauzeDashboardStats {
  totalBatches: number;
  activeBatches: number;
  sentToBleaching: number;
  pendingBleachingJobs: number;
  inProcessing: number;
  readyForPacking: number;
  completedBatches: number;
  vendorHeldQuantity: number;
  totalWastage: number;
  totalRejection: number;
}

export interface VendorHeldStockRecord {
  vendorId: string;
  vendorName: string;
  contactPerson: string | null;
  phone: string | null;
  totalSent: number;
  totalReceived: number;
  totalWastage: number;
  totalRejected: number;
  pendingQuantity: number;
  jobs: {
    jobId: string;
    jobNumber: string;
    batchNumber: string;
    productName: string;
    bleachingType: string;
    sentQuantity: number;
    receivedQuantity: number;
    wastageQuantity: number;
    rejectedQuantity: number;
    pendingQuantity: number;
    sentDate: string;
    expectedReturnDate: string | null;
    status: string;
  }[];
}

export interface GauzeTraceabilityData {
  forwardTraceability: {
    batchNumber: string;
    supplier: { name: string; code: string } | null;
    rawMaterial: { sku: string; name: string; inputQuantity: number; inputUom: string };
    rawRolls: { rollOrThan: string; quantity: number; uom: string; receivedDate: string | null }[];
    bleachingJobs: {
      jobNumber: string;
      vendor: string;
      bleachingType: string;
      quantitySent: number;
      sentDate: string;
      status: string;
      receipts: {
        receiptNumber: string;
        quantityReceived: number;
        wastage: number;
        rejected: number;
        receivedDate: string;
        quality: string | null;
      }[];
    }[];
    processingOperations: {
      operationNumber: string;
      operationType: string;
      input: number;
      output: number;
      wastage: number;
      rejected: number;
      date: string;
      employee: string | null;
    }[];
    packingEntries: {
      packingNumber: string;
      product: string;
      size: string | null;
      ply: number | null;
      packs: number;
      piecesPerPack: number;
      totalPieces: number;
      packingDate: string;
    }[];
  };
  reverseTraceability: {
    finishedProducts: {
      packingNumber: string;
      product: string;
      totalPieces: number;
      packs: number;
      packingDate: string;
      derivedFromOperations: string[];
      derivedFromBleaching: string[];
      originRawMaterial: string;
      originSupplier: string;
    }[];
  };
}

export interface GauzeMastersResponse {
  gauzeTypes: GauzeType[];
  gauzeSizes: GauzeSize[];
  bleachingTypes: BleachingType[];
  operationTypes: GauzeOperationType[];
}
