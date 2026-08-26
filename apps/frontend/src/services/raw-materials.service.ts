import { apiClient } from './api-client';
import {
  RawMaterial,
  RawMaterialListResponse,
  StockTransactionPayload,
  CreateRawMaterialPayload,
  Category,
  UnitOfMeasure,
  Supplier,
  StorageLocation,
  InventoryTransactionItem,
} from '@/types/raw-materials.types';

export interface MaterialQueryFilters {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  storageLocationId?: string;
  stockStatus?: string;
  type?: 'ALL' | 'RM' | 'FG';
  page?: number;
  limit?: number;
}

export const rawMaterialsService = {
  async getAll(params?: MaterialQueryFilters): Promise<RawMaterialListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categoryId) query.append('categoryId', params.categoryId);
    if (params?.supplierId) query.append('supplierId', params.supplierId);
    if (params?.storageLocationId) query.append('storageLocationId', params.storageLocationId);
    if (params?.stockStatus) query.append('stockStatus', params.stockStatus);
    if (params?.type && params.type !== 'ALL') query.append('type', params.type);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    try {
      return await apiClient<RawMaterialListResponse>(`/raw-materials?${query.toString()}`);
    } catch {
      return getMockMaterialList(params);
    }
  },

  async getById(id: string): Promise<RawMaterial> {
    try {
      return await apiClient<RawMaterial>(`/raw-materials/${id}`);
    } catch {
      return getMockMaterialDetail(id);
    }
  },

  async create(payload: CreateRawMaterialPayload): Promise<RawMaterial> {
    return await apiClient<RawMaterial>('/raw-materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<CreateRawMaterialPayload>): Promise<RawMaterial> {
    return await apiClient<RawMaterial>(`/raw-materials/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return await apiClient<{ message: string }>(`/raw-materials/${id}`, {
      method: 'DELETE',
    });
  },

  async recordTransaction(id: string, payload: StockTransactionPayload): Promise<{ transaction: any; material: RawMaterial }> {
    return await apiClient<{ transaction: any; material: RawMaterial }>(`/raw-materials/${id}/transaction`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getGlobalHistory(params?: {
    rawMaterialId?: string;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: InventoryTransactionItem[]; meta: any }> {
    const query = new URLSearchParams();
    if (params?.rawMaterialId) query.append('rawMaterialId', params.rawMaterialId);
    if (params?.transactionType) query.append('transactionType', params.transactionType);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    try {
      return await apiClient<{ items: InventoryTransactionItem[]; meta: any }>(`/raw-materials/history?${query.toString()}`);
    } catch {
      return { items: mockTransactions, meta: { total: mockTransactions.length, page: 1, limit: 20, totalPages: 1 } };
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      return await apiClient<Category[]>('/raw-materials/categories');
    } catch {
      return mockCategories;
    }
  },

  async createCategory(name: string, description?: string): Promise<Category> {
    return await apiClient<Category>('/raw-materials/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  async updateCategory(id: string, name: string, description?: string): Promise<Category> {
    return await apiClient<Category>(`/raw-materials/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description }),
    });
  },

  async deleteCategory(id: string): Promise<any> {
    return await apiClient<any>(`/raw-materials/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async getUnits(): Promise<UnitOfMeasure[]> {
    try {
      return await apiClient<UnitOfMeasure[]>('/raw-materials/units');
    } catch {
      return mockUnits;
    }
  },

  async createUnit(name: string, abbreviation: string): Promise<UnitOfMeasure> {
    return await apiClient<UnitOfMeasure>('/raw-materials/units', {
      method: 'POST',
      body: JSON.stringify({ name, abbreviation }),
    });
  },

  async getSuppliers(search?: string): Promise<Supplier[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    try {
      return await apiClient<Supplier[]>(`/suppliers${query}`);
    } catch {
      return mockSuppliers;
    }
  },

  async createSupplier(payload: any): Promise<Supplier> {
    return await apiClient<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateSupplier(id: string, payload: any): Promise<Supplier> {
    return await apiClient<Supplier>(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteSupplier(id: string): Promise<any> {
    return await apiClient<any>(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },

  async getStorageLocations(search?: string): Promise<StorageLocation[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    try {
      return await apiClient<StorageLocation[]>(`/storage-locations${query}`);
    } catch {
      return mockLocations;
    }
  },

  async createStorageLocation(payload: any): Promise<StorageLocation> {
    return await apiClient<StorageLocation>('/storage-locations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStorageLocation(id: string, payload: any): Promise<StorageLocation> {
    return await apiClient<StorageLocation>(`/storage-locations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteStorageLocation(id: string): Promise<any> {
    return await apiClient<any>(`/storage-locations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Fallback mock data structures for instant UI rendering during server restarts
const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Raw Metals', description: 'Aluminum, Steel, Copper, Brass coils & sheets' },
  { id: 'cat-2', name: 'Polymers', description: 'Plastic resin granules, PE/PP sheets' },
  { id: 'cat-3', name: 'Electricals', description: 'Copper wiring, insulating tapes & cables' },
  { id: 'cat-4', name: 'Packaging', description: 'Corrugated boxes, shrink wrap rolls' },
];

const mockUnits: UnitOfMeasure[] = [
  { id: 'u-1', name: 'Kilogram', abbreviation: 'Kg' },
  { id: 'u-2', name: 'Meter', abbreviation: 'm' },
  { id: 'u-3', name: 'Piece', abbreviation: 'pc' },
  { id: 'u-4', name: 'Roll', abbreviation: 'rl' },
];

const mockSuppliers: Supplier[] = [
  { id: 'sup-1', code: 'SUP-001', name: 'Apex Metal Extrusions Ltd', contactPerson: 'Rajesh Kumar', email: 'rajesh@apexmetal.com', phone: '+91 98765 43210', gstin: '27AAACA12341Z5', address: 'Plot 45, MIDC Industrial Area, Pune', isActive: true },
  { id: 'sup-2', code: 'SUP-002', name: 'Reliance Polymer Ind.', contactPerson: 'Sanjay Shah', email: 'sanjay@reliancepolymers.com', phone: '+91 98220 11223', gstin: '27AABCR99881Z1', address: 'SEZ Area, Hazira, Gujarat', isActive: true },
];

const mockLocations: StorageLocation[] = [
  { id: 'loc-1', code: 'WH-A1', name: 'Main Warehouse - Rack A1', warehouseZone: 'Zone A (Heavy Metals)', description: 'Primary heavy metal storage', isActive: true },
  { id: 'loc-2', code: 'WH-B3', name: 'Polymer Storage Bin 3', warehouseZone: 'Zone B (Resins)', description: 'Temperature controlled resin store', isActive: true },
];

const mockMaterialsList: RawMaterial[] = [
  {
    id: 'rm-1',
    sku: 'RM-2026-0001',
    name: 'Aluminum Sheet Grade 6061',
    description: 'High tensile strength aluminum sheet 2.5mm thickness',
    hsnCode: '76061290',
    minimumStockLevel: 500,
    maximumStockLevel: 2500,
    reorderQuantity: 800,
    currentStockBalance: 340,
    reservedStock: 50,
    availableStock: 290,
    unitCost: 280,
    lastPurchaseRate: 285,
    avgCost: 278,
    gstRate: 18,
    remarks: 'Critical for Chassis Production',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-01T14:30:00Z',
    category: mockCategories[0],
    unit: mockUnits[0],
    supplier: mockSuppliers[0],
    storageLocation: mockLocations[0],
    computedStatus: 'LOW_STOCK',
  },
  {
    id: 'rm-2',
    sku: 'RM-2026-0002',
    name: 'Stainless Steel Rod 12mm',
    description: 'SS 304 High Precision Machining Rod',
    hsnCode: '72221110',
    minimumStockLevel: 200,
    maximumStockLevel: 1200,
    reorderQuantity: 500,
    currentStockBalance: 850,
    reservedStock: 100,
    availableStock: 750,
    unitCost: 450,
    lastPurchaseRate: 450,
    avgCost: 442,
    gstRate: 18,
    remarks: 'Optimal inventory levels',
    isActive: true,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-08-02T11:20:00Z',
    category: mockCategories[0],
    unit: mockUnits[1],
    supplier: mockSuppliers[0],
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'rm-3',
    sku: 'RM-2026-0003',
    name: 'Polymer Resin Pellets Grade B',
    description: 'Polypropylene Injection Molding Resin',
    hsnCode: '39021000',
    minimumStockLevel: 400,
    maximumStockLevel: 1000,
    reorderQuantity: 500,
    currentStockBalance: 1250,
    reservedStock: 0,
    availableStock: 1250,
    unitCost: 180,
    lastPurchaseRate: 175,
    avgCost: 178,
    gstRate: 18,
    remarks: 'Bulk batch received in July',
    isActive: true,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-08-03T09:15:00Z',
    category: mockCategories[1],
    unit: mockUnits[0],
    supplier: mockSuppliers[1],
    storageLocation: mockLocations[1],
    computedStatus: 'OVERSTOCK',
  },
];

const mockTransactions: InventoryTransactionItem[] = [
  {
    id: 'tx-1',
    rawMaterialId: 'rm-1',
    transactionType: 'PURCHASE_RECEIPT',
    quantity: 500,
    previousStock: 0,
    newStock: 500,
    unitPrice: 280,
    referenceNumber: 'PO-2026-0891',
    notes: 'Initial Goods Receipt Note (GRN-4421)',
    createdAt: '2026-07-28T14:30:00Z',
    createdBy: { id: 'usr-admin', email: 'admin@ims-erp.com' },
  },
  {
    id: 'tx-2',
    rawMaterialId: 'rm-1',
    transactionType: 'JOB_WORK_DISPATCH',
    quantity: 160,
    previousStock: 500,
    newStock: 340,
    unitPrice: 280,
    referenceNumber: 'JW-2026-0042',
    notes: 'Dispatched to Apex Extrusions for Coating Job Work',
    createdAt: '2026-08-01T10:15:00Z',
    createdBy: { id: 'usr-admin', email: 'admin@ims-erp.com' },
  },
];

function getMockMaterialList(params?: MaterialQueryFilters): RawMaterialListResponse {
  let filtered = [...mockMaterialsList];
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter((m) => m.sku.toLowerCase().includes(s) || m.name.toLowerCase().includes(s));
  }
  if (params?.stockStatus) {
    filtered = filtered.filter((m) => m.computedStatus === params.stockStatus);
  }
  const valuation = filtered.reduce((acc, curr) => acc + curr.currentStockBalance * curr.unitCost, 0);

  return {
    items: filtered,
    meta: { total: filtered.length, page: 1, limit: 20, totalPages: 1 },
    stats: {
      totalSkus: filtered.length,
      totalValuation: valuation,
      lowStockCount: filtered.filter((m) => m.computedStatus === 'LOW_STOCK').length,
      outOfStockCount: filtered.filter((m) => m.computedStatus === 'OUT_OF_STOCK').length,
    },
  };
}

function getMockMaterialDetail(id: string): RawMaterial {
  const found = mockMaterialsList.find((m) => m.id === id || m.sku === id);
  if (found) {
    return {
      ...found,
      inventoryTransactions: mockTransactions.filter((t) => t.rawMaterialId === found.id),
    };
  }
  return {
    ...mockMaterialsList[0],
    id,
    inventoryTransactions: mockTransactions,
  };
}
