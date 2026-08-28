export type GamjeeProductionStatus =
  | 'DRAFT'
  | 'MATERIALS_SELECTED'
  | 'PINNING'
  | 'FOLDING'
  | 'CUTTING'
  | 'COTTON_PREPARATION'
  | 'READY_FOR_ROLLING'
  | 'ROLLING'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export interface GamjeeSize {
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

export interface GamjeeOperationType {
  id: string;
  name: string;
  code: string;
  sequence: number;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamjeeProductMaster {
  id: string;
  productId?: string | null;
  productName: string;
  gamjeeType?: string | null;
  width?: number | null;
  widthUom: string;
  rollLength?: number | null;
  lengthUom: string;
  cottonRequirement?: number | null;
  cottonUom: string;
  fabricRequirement?: number | null;
  fabricUom: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamjeeMaterialInputItem {
  id: string;
  productionBatchId: string;
  materialType: 'BLEACHED_FABRIC' | 'COTTON_ROLL';
  productId: string;
  inventoryBatchId?: string | null;
  rollOrBatchNumber?: string | null;
  quantityIssued: number;
  quantityConsumed?: number | null;
  quantityRemaining?: number | null;
  uom: string;
  warehouseId?: string | null;
  issuedDate: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit?: { id: string; name: string; abbreviation: string };
  };
  inventoryBatch?: {
    id: string;
    batchNumber: string;
    quantityRemaining: number;
  } | null;
  warehouse?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface GamjeeOperationItem {
  id: string;
  operationNumber: string;
  productionBatchId: string;
  operationTypeId: string;
  sequenceNumber: number;
  inputQuantity?: number | null;
  inputUom?: string | null;
  outputQuantity?: number | null;
  outputUom?: string | null;
  wastageQuantity: number;
  rejectedQuantity: number;
  employeeId?: string | null;
  machineId?: string | null;
  operationDate: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  operationType?: GamjeeOperationType;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface GamjeeRollingEntryItem {
  id: string;
  rollingNumber: string;
  productionBatchId: string;
  fabricInputQuantity: number;
  fabricInputUom: string;
  cottonInputQuantity: number;
  cottonInputUom: string;
  finishedRollQuantity: number;
  finishedRollUom: string;
  finishedRollLength?: number | null;
  finishedRollLengthUom?: string | null;
  finishedRollWidth?: number | null;
  finishedRollWidthUom?: string | null;
  wastageQuantity: number;
  rejectedRollQuantity: number;
  employeeId?: string | null;
  machineId?: string | null;
  rollingDate: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  } | null;
  finishedRolls?: GamjeeFinishedRollItem[];
}

export interface GamjeeFinishedRollItem {
  id: string;
  productionBatchId: string;
  rollingEntryId: string;
  finishedProductId: string;
  rollBatchNumber: string;
  rollCount: number;
  rollLength?: number | null;
  rollLengthUom?: string | null;
  rollWidth?: number | null;
  rollWidthUom?: string | null;
  totalLength?: number | null;
  totalLengthUom?: string | null;
  qualityStatus?: string | null;
  warehouseId?: string | null;
  stockStatus: string;
  createdAt: string;
  updatedAt: string;
  finishedProduct?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface GamjeeMaterialMovementItem {
  id: string;
  productionBatchId: string;
  referenceType: string;
  referenceId: string;
  movementType: string;
  productId?: string | null;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  fromLocationName?: string | null;
  toLocationName?: string | null;
  quantity: number;
  uom: string;
  movementDate: string;
  notes?: string | null;
  createdAt: string;
  fromLocation?: { id: string; name: string; code: string } | null;
  toLocation?: { id: string; name: string; code: string } | null;
}

export interface GamjeeBatchStatusHistoryItem {
  id: string;
  productionBatchId: string;
  oldStatus?: string | null;
  newStatus: string;
  changedById?: string | null;
  changedAt: string;
  remarks?: string | null;
  changedByUser?: {
    id: string;
    email: string;
  } | null;
}

export interface GamjeeProductionBatch {
  id: string;
  batchNumber: string;
  finishedProductId: string;
  gamjeeSizeId?: string | null;
  productionQuantity?: number | null;
  productionUom?: string | null;
  currentQuantity: number;
  currentUom: string;
  currentStage: string;
  status: GamjeeProductionStatus;
  productionDate: string;
  expectedCompletionDate?: string | null;
  completionDate?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;

  finishedProduct?: {
    id: string;
    name: string;
    sku: string;
    description?: string | null;
    currentStockBalance: number;
    unit?: { id: string; name: string; abbreviation: string };
    category?: { id: string; name: string };
    storageLocation?: { id: string; name: string; code: string };
  };
  gamjeeSize?: GamjeeSize | null;
  createdBy?: {
    id: string;
    email: string;
  } | null;

  materialInputs?: GamjeeMaterialInputItem[];
  operations?: GamjeeOperationItem[];
  rollingEntries?: GamjeeRollingEntryItem[];
  finishedRolls?: GamjeeFinishedRollItem[];
  materialMovements?: GamjeeMaterialMovementItem[];
  statusHistory?: GamjeeBatchStatusHistoryItem[];

  _count?: {
    operations: number;
    rollingEntries: number;
    finishedRolls: number;
    materialMovements: number;
  };
}

export interface GamjeeDashboardStats {
  kpis: {
    totalBatches: number;
    activeBatches: number;
    materialsSelected: number;
    fabricProcessing: number;
    readyForRolling: number;
    rollingBatches: number;
    completedBatches: number;
    totalFinishedRolls: number;
    totalFinishedMeters: number;
    totalFabricUsed: number;
    totalCottonUsed: number;
    totalWastage: number;
  };
  recentBatches: Array<{
    id: string;
    batchNumber: string;
    status: GamjeeProductionStatus;
    currentStage: string;
    productionDate: string;
    finishedProduct?: { id: string; name: string; sku: string };
    gamjeeSize?: GamjeeSize | null;
  }>;
}

export interface GamjeeMastersResponse {
  sizes: GamjeeSize[];
  operations: GamjeeOperationType[];
  products: GamjeeProductMaster[];
}

export interface GamjeeTraceabilityData {
  batchSummary: {
    id: string;
    batchNumber: string;
    productName: string;
    size: string;
    status: GamjeeProductionStatus;
    currentStage: string;
    productionDate: string;
    completionDate?: string | null;
    totalRolls: number;
  };
  forwardTraceability: {
    rawMaterials: {
      bleachedFabric: {
        product: string;
        sku: string;
        lotNumber: string;
        quantityIssued: number;
        uom: string;
      } | null;
      cottonRoll: {
        product: string;
        sku: string;
        lotNumber: string;
        quantityIssued: number;
        uom: string;
      } | null;
    };
    operations: Array<{
      operation: string;
      sequence: number;
      input: number;
      output: number;
      wastage: number;
      operator: string;
      date: string;
    }>;
    rolling: Array<{
      rollingNumber: string;
      fabricUsed: number;
      cottonUsed: number;
      rollsProduced: number;
      rollLength?: number | null;
      operator: string;
      date: string;
    }>;
    finishedGoods: Array<{
      rollBatchNumber: string;
      rollCount: number;
      totalLength?: number | null;
      warehouse: string;
      quality?: string | null;
    }>;
  };
  materialMovements: GamjeeMaterialMovementItem[];
}
