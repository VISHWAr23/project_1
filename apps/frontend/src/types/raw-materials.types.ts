export type StockStatus = 'OPTIMAL' | 'LOW_STOCK' | 'OVERSTOCK' | 'OUT_OF_STOCK';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  _count?: {
    rawMaterials: number;
  };
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
  _count?: {
    rawMaterials: number;
  };
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt?: string;
  _count?: {
    rawMaterials: number;
  };
}

export interface StorageLocation {
  id: string;
  code: string;
  name: string;
  warehouseZone?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  _count?: {
    rawMaterials: number;
  };
}

export interface InventoryTransactionItem {
  id: string;
  rawMaterialId: string;
  transactionType:
    | 'PURCHASE_RECEIPT'
    | 'WORK_ORDER_ISSUE'
    | 'JOB_WORK_DISPATCH'
    | 'JOB_WORK_RETURN'
    | 'ADJUSTMENT_ADD'
    | 'ADJUSTMENT_SUBTRACT'
    | 'TRANSFER'
    | 'MANUAL_CORRECTION';
  quantity: number;
  previousStock: number;
  newStock: number;
  unitPrice: number;
  referenceNumber?: string | null;
  referenceDocumentType?: string | null;
  referenceDocumentId?: string | null;
  notes?: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    email: string;
  };
  rawMaterial?: {
    id: string;
    name: string;
    sku: string;
    unit?: UnitOfMeasure;
  };
}

export interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  hsnCode?: string | null;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderQuantity: number;
  currentStockBalance: number;
  reservedStock: number;
  availableStock: number;
  unitCost: number;
  lastPurchaseRate: number;
  avgCost: number;
  gstRate: number;
  remarks?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  categoryId?: string | null;
  category?: Category | null;

  unitId?: string | null;
  unit?: UnitOfMeasure | null;

  supplierId?: string | null;
  supplier?: Supplier | null;

  storageLocationId?: string | null;
  storageLocation?: StorageLocation | null;

  computedStatus: StockStatus;
  inventoryTransactions?: InventoryTransactionItem[];
  issuedJobWorkOrders?: any[];
  _count?: {
    inventoryTransactions: number;
    issuedJobWorkOrders: number;
  };
}

export interface RawMaterialStats {
  totalSkus: number;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface RawMaterialListResponse {
  items: RawMaterial[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: RawMaterialStats;
}

export interface StockTransactionPayload {
  transactionType:
    | 'PURCHASE_RECEIPT'
    | 'WORK_ORDER_ISSUE'
    | 'JOB_WORK_DISPATCH'
    | 'JOB_WORK_RETURN'
    | 'ADJUSTMENT_ADD'
    | 'ADJUSTMENT_SUBTRACT'
    | 'TRANSFER'
    | 'MANUAL_CORRECTION';
  quantity: number;
  unitPrice?: number;
  referenceNumber?: string;
  referenceDocumentType?: string;
  referenceDocumentId?: string;
  notes?: string;
}

export interface CreateRawMaterialPayload {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitId?: string;
  supplierId?: string;
  storageLocationId?: string;
  hsnCode?: string;
  gstRate?: number;
  minimumStockLevel: number;
  maximumStockLevel?: number;
  reorderQuantity?: number;
  initialStock?: number;
  unitCost?: number;
  remarks?: string;
  isActive?: boolean;
}
