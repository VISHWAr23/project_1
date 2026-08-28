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
  type?: 'ALL' | 'RM' | 'PM' | 'FG';
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
  { id: 'sup-1', code: 'SUP-001', name: 'Lakshmi Cotton Spinning Mills', contactPerson: 'Rajesh Kumar', email: 'contact@lakshmicotton.com', phone: '+91 98765 43210', gstin: '33AAACL12341Z5', address: 'Industrial Estate, Rajapalayam, Tamil Nadu', isActive: true },
  { id: 'sup-2', code: 'SUP-002', name: 'Meenakshi Corrugated Box Ind.', contactPerson: 'Sanjay Shah', email: 'sales@meenakshibox.com', phone: '+91 98220 11223', gstin: '33AABCM99881Z1', address: 'Shed 12, SIPCOT Industrial Complex, Madurai', isActive: true },
];

const mockLocations: StorageLocation[] = [
  { id: 'loc-1', code: 'WH-A1', name: 'Main Warehouse - Yarn Bay 1', warehouseZone: 'Zone A (Raw Cotton & Yarn)', description: 'Primary grey cotton yarn storage', isActive: true },
  { id: 'loc-2', code: 'WH-B3', name: 'Packaging Store Bin 3', warehouseZone: 'Zone B (Packaging Supplies)', description: 'Boxes, poly bags, roll tapes store', isActive: true },
];

const mockMaterialsList: RawMaterial[] = [
  // Raw Materials
  {
    id: 'rm-1',
    sku: 'RM-YARN-40S',
    name: '100% Combed Cotton Grey Yarn 40s',
    description: 'High grade surgical cotton yarn 40s count for surgical gauze weaving',
    hsnCode: '52051200',
    minimumStockLevel: 500,
    maximumStockLevel: 2500,
    reorderQuantity: 800,
    currentStockBalance: 850,
    reservedStock: 50,
    availableStock: 800,
    unitCost: 280,
    lastPurchaseRate: 285,
    avgCost: 278,
    gstRate: 5,
    remarks: 'Weaving raw yarn stock (1 Bale = 170 Kg)',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-01T14:30:00Z',
    category: { id: 'cat-1', name: 'Raw Cotton & Yarn' },
    unit: { id: 'u-1', name: 'Kilogram', abbreviation: 'Kg' },
    secondaryUnit: { id: 'u-bale', name: 'Bales', abbreviation: 'Bales' },
    secondaryUnitName: 'Bales',
    conversionFactor: 170,
    supplier: mockSuppliers[0],
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'rm-2',
    sku: 'RM-BLG-003',
    name: 'Bleached Medical Gauze Roll 48"',
    description: '100% absorbent bleached surgical gauze woven fabric roll',
    hsnCode: '300590',
    minimumStockLevel: 300,
    maximumStockLevel: 2000,
    reorderQuantity: 500,
    currentStockBalance: 650,
    reservedStock: 100,
    availableStock: 550,
    unitCost: 190,
    lastPurchaseRate: 190,
    avgCost: 185,
    gstRate: 5,
    remarks: 'Ready for cutting and folding (1 Roll = 100 Meters)',
    isActive: true,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-08-02T11:20:00Z',
    category: { id: 'cat-2', name: 'Bleached Gauze Fabric' },
    unit: { id: 'u-2', name: 'Meter', abbreviation: 'm' },
    secondaryUnit: { id: 'u-roll', name: 'Rolls', abbreviation: 'Rolls' },
    secondaryUnitName: 'Rolls',
    conversionFactor: 100,
    supplier: mockSuppliers[0],
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  // Packaging Materials
  {
    id: 'pm-1',
    sku: 'PM-BOX-5PLY',
    name: 'Corrugated 5-Ply Master Outer Carton Box',
    description: 'Heavy duty corrugated packing carton for export and domestic transit',
    hsnCode: '481910',
    minimumStockLevel: 200,
    maximumStockLevel: 1500,
    reorderQuantity: 400,
    currentStockBalance: 450,
    reservedStock: 0,
    availableStock: 450,
    unitCost: 35,
    lastPurchaseRate: 35,
    avgCost: 34,
    gstRate: 18,
    isPackagingMaterial: true,
    remarks: 'Master packing outer cartons',
    isActive: true,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-08-03T09:15:00Z',
    category: { id: 'cat-pkg', name: 'Packaging Materials' },
    unit: { id: 'u-3', name: 'Boxes', abbreviation: 'bx' },
    supplier: mockSuppliers[1],
    storageLocation: mockLocations[1],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'pm-2',
    sku: 'PM-TAPE-ROLL',
    name: 'BOPP Packaging Sealing Tape 2 Inch',
    description: 'High adhesion transparent / brown carton sealing tape 65m',
    hsnCode: '391910',
    minimumStockLevel: 50,
    maximumStockLevel: 300,
    reorderQuantity: 100,
    currentStockBalance: 120,
    reservedStock: 0,
    availableStock: 120,
    unitCost: 85,
    lastPurchaseRate: 85,
    avgCost: 82,
    gstRate: 18,
    isPackagingMaterial: true,
    remarks: 'Carton sealing tapes',
    isActive: true,
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-08-04T09:15:00Z',
    category: { id: 'cat-pkg', name: 'Packaging Materials' },
    unit: { id: 'u-4', name: 'Rolls', abbreviation: 'rl' },
    supplier: mockSuppliers[1],
    storageLocation: mockLocations[1],
    computedStatus: 'OPTIMAL',
  },
  // Authentic Client Finished Goods from IndiaMART
  {
    id: 'fg-1',
    sku: 'FG-MEDIBATH-WIPES',
    name: 'Medi Bath Body Wipes (10 Wipes/Pack)',
    description: 'Antiseptic chlorhexidine patient bathing wipes with skin conditioners',
    hsnCode: '330790',
    minimumStockLevel: 200,
    maximumStockLevel: 2000,
    reorderQuantity: 500,
    currentStockBalance: 850,
    reservedStock: 100,
    availableStock: 750,
    unitCost: 65,
    lastPurchaseRate: 65,
    avgCost: 62,
    gstRate: 18,
    isFinishedGood: true,
    remarks: 'Certified patient bathing care',
    isActive: true,
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-pk', name: 'Packs', abbreviation: 'pk' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-2',
    sku: 'FG-COT-BALLS-500G',
    name: 'Surgical Cotton Balls (500g Pack)',
    description: '100% pure absorbent sterile surgical cotton wool balls for clinical prep',
    hsnCode: '300590',
    minimumStockLevel: 150,
    maximumStockLevel: 1500,
    reorderQuantity: 300,
    currentStockBalance: 620,
    reservedStock: 50,
    availableStock: 570,
    unitCost: 180,
    lastPurchaseRate: 180,
    avgCost: 175,
    gstRate: 12,
    isFinishedGood: true,
    remarks: 'High absorbency IP grade cotton',
    isActive: true,
    createdAt: '2026-02-12T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-pk', name: 'Packs', abbreviation: 'pk' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-3',
    sku: 'FG-GAUZE-ROLL-10X10',
    name: 'Bleached Gauze Bandage Roll (10cm x 10m)',
    description: 'High tensile bleached 100% cotton woven gauze bandage roll',
    hsnCode: '300590',
    minimumStockLevel: 500,
    maximumStockLevel: 5000,
    reorderQuantity: 1000,
    currentStockBalance: 2400,
    reservedStock: 200,
    availableStock: 2200,
    unitCost: 42,
    lastPurchaseRate: 42,
    avgCost: 40,
    gstRate: 12,
    isFinishedGood: true,
    remarks: 'Standard surgical dressing roll',
    isActive: true,
    createdAt: '2026-02-14T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-rl', name: 'Rolls', abbreviation: 'rl' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-4',
    sku: 'FG-COT-ROLL-400G',
    name: '400 Gram Surgical Cotton Wool Roll',
    description: 'Absorbent surgical cotton roll 400g net weight, IP Grade',
    hsnCode: '300590',
    minimumStockLevel: 250,
    maximumStockLevel: 2000,
    reorderQuantity: 500,
    currentStockBalance: 1100,
    reservedStock: 100,
    availableStock: 1000,
    unitCost: 155,
    lastPurchaseRate: 155,
    avgCost: 150,
    gstRate: 12,
    isFinishedGood: true,
    remarks: 'IP/BP Grade surgical cotton wool',
    isActive: true,
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-rl', name: 'Rolls', abbreviation: 'rl' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-5',
    sku: 'FG-GAMJEE-ROLL-15X3',
    name: 'Cotton Gamjee Roll (15cm x 3m)',
    description: 'High absorbency bleached gamjee roll with thick absorbent cotton layer',
    hsnCode: '300590',
    minimumStockLevel: 300,
    maximumStockLevel: 2500,
    reorderQuantity: 600,
    currentStockBalance: 950,
    reservedStock: 50,
    availableStock: 900,
    unitCost: 125,
    lastPurchaseRate: 125,
    avgCost: 120,
    gstRate: 12,
    isFinishedGood: true,
    remarks: 'Heavy discharge surgical pad',
    isActive: true,
    createdAt: '2026-02-16T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-rl', name: 'Rolls', abbreviation: 'rl' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-6',
    sku: 'FG-GAUZE-SWAB-10X10',
    name: 'Sterile Gauze Swab 10cm x 10cm (12-Ply)',
    description: '100% cotton sterile surgical gauze swabs, 12 ply, folded edges, 100 pcs/box',
    hsnCode: '300590',
    minimumStockLevel: 400,
    maximumStockLevel: 3000,
    reorderQuantity: 800,
    currentStockBalance: 1650,
    reservedStock: 150,
    availableStock: 1500,
    unitCost: 280,
    lastPurchaseRate: 280,
    avgCost: 275,
    gstRate: 12,
    isFinishedGood: true,
    remarks: 'Hospital standard 12-ply swab box',
    isActive: true,
    createdAt: '2026-02-18T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-bx', name: 'Boxes', abbreviation: 'bx' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-7',
    sku: 'FG-SURG-GOWN-SMS',
    name: 'Medical & Surgical Protective Clothing (Gown)',
    description: 'Disposable reinforced SMS sterile surgical gown with cuffs, 45 GSM',
    hsnCode: '621010',
    minimumStockLevel: 100,
    maximumStockLevel: 1000,
    reorderQuantity: 250,
    currentStockBalance: 420,
    reservedStock: 20,
    availableStock: 400,
    unitCost: 210,
    lastPurchaseRate: 210,
    avgCost: 200,
    gstRate: 5,
    isFinishedGood: true,
    remarks: 'Sterile OT protective apparel',
    isActive: true,
    createdAt: '2026-02-20T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-pc', name: 'Pieces', abbreviation: 'pc' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-8',
    sku: 'FG-LAP-SPONGE-30X30',
    name: 'Abdominal Lap Sponge Pad 30cm x 30cm',
    description: 'Pre-washed X-Ray detectable absorbent laparotomy sponge pad',
    hsnCode: '300590',
    minimumStockLevel: 150,
    maximumStockLevel: 1200,
    reorderQuantity: 300,
    currentStockBalance: 580,
    reservedStock: 30,
    availableStock: 550,
    unitCost: 320,
    lastPurchaseRate: 320,
    avgCost: 310,
    gstRate: 12,
    isFinishedGood: true,
    remarks: 'OT Laparotomy surgery sponge',
    isActive: true,
    createdAt: '2026-02-22T08:00:00Z',
    updatedAt: '2026-08-05T09:15:00Z',
    category: { id: 'cat-fg', name: 'Finished Surgical Products' },
    unit: { id: 'u-pk', name: 'Packs', abbreviation: 'pk' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  // Dr. C Adult Pullups - Premium (Multi-Variant Products from Sizing Spec)
  {
    id: 'fg-drc-m',
    sku: 'FG-DRC-PULLUPS-M',
    name: 'Dr. C Adult Pullups - Premium (Medium)',
    brand: 'Dr. C Premium',
    variantType: 'Adult Pullups - Premium',
    size: 'MEDIUM (M)',
    dimensionInches: '28"-44"',
    dimensionCm: '70-110 CM',
    packSize: '10 PCS/PACK',
    innerPackQty: 10,
    packUnit: 'Packs',
    boxSize: '12 PACKS/BOX (120 PCS)',
    masterCartonQty: 12,
    features: 'Soft Waist Panel, Anti Bacterial, Super Absorbent, Super Leak guard, Wetness indicator, Easy Pull on-Pull off',
    description: 'Premium disposable adult pullups with soft elastic waist panel, rapid absorption core, anti-bacterial protection, leak guards, and wetness indicator for waist 28"-44" (70-110 cm). Pack of 10 Pcs, 12 Packs per master box.',
    hsnCode: '961900',
    minimumStockLevel: 200,
    maximumStockLevel: 3000,
    reorderQuantity: 500,
    currentStockBalance: 1200,
    reservedStock: 100,
    availableStock: 1100,
    unitCost: 380,
    lastPurchaseRate: 380,
    avgCost: 375,
    gstRate: 12,
    isFinishedGood: true,
    remarks: '10 Pcs/Pack, 12 Packs/Box (120 Pcs Master Box)',
    isActive: true,
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-08-06T09:15:00Z',
    category: { id: 'cat-drc', name: 'Hygiene & Incontinence Care' },
    unit: { id: 'u-pk', name: 'Packs', abbreviation: 'pk' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-drc-l',
    sku: 'FG-DRC-PULLUPS-L',
    name: 'Dr. C Adult Pullups - Premium (Large)',
    brand: 'Dr. C Premium',
    variantType: 'Adult Pullups - Premium',
    size: 'LARGE (L)',
    dimensionInches: '40"-54"',
    dimensionCm: '100-135 CM',
    packSize: '10 PCS/PACK',
    innerPackQty: 10,
    packUnit: 'Packs',
    boxSize: '12 PACKS/BOX (120 PCS)',
    masterCartonQty: 12,
    features: 'Soft Waist Panel, Anti Bacterial, Super Absorbent, Super Leak guard, Wetness indicator, Easy Pull on-Pull off',
    description: 'Premium disposable adult pullups with soft elastic waist panel, rapid absorption core, anti-bacterial protection, leak guards, and wetness indicator for waist 40"-54" (100-135 cm). Pack of 10 Pcs, 12 Packs per master box.',
    hsnCode: '961900',
    minimumStockLevel: 200,
    maximumStockLevel: 3000,
    reorderQuantity: 500,
    currentStockBalance: 1500,
    reservedStock: 150,
    availableStock: 1350,
    unitCost: 420,
    lastPurchaseRate: 420,
    avgCost: 415,
    gstRate: 12,
    isFinishedGood: true,
    remarks: '10 Pcs/Pack, 12 Packs/Box (120 Pcs Master Box)',
    isActive: true,
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-08-06T09:15:00Z',
    category: { id: 'cat-drc', name: 'Hygiene & Incontinence Care' },
    unit: { id: 'u-pk', name: 'Packs', abbreviation: 'pk' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
  },
  {
    id: 'fg-drc-xl',
    sku: 'FG-DRC-PULLUPS-XL',
    name: 'Dr. C Adult Pullups - Premium (Extra Large)',
    brand: 'Dr. C Premium',
    variantType: 'Adult Pullups - Premium',
    size: 'EXTRA LARGE (XL)',
    dimensionInches: '52"-63"',
    dimensionCm: '130-160 CM',
    packSize: '10 PCS/PACK',
    innerPackQty: 10,
    packUnit: 'Packs',
    boxSize: '12 PACKS/BOX (120 PCS)',
    masterCartonQty: 12,
    features: 'Soft Waist Panel, Anti Bacterial, Super Absorbent, Super Leak guard, Wetness indicator, Easy Pull on-Pull off',
    description: 'Premium disposable adult pullups with soft elastic waist panel, rapid absorption core, anti-bacterial protection, leak guards, and wetness indicator for waist 52"-63" (130-160 cm). Pack of 10 Pcs, 12 Packs per master box.',
    hsnCode: '961900',
    minimumStockLevel: 200,
    maximumStockLevel: 3000,
    reorderQuantity: 500,
    currentStockBalance: 1100,
    reservedStock: 100,
    availableStock: 1000,
    unitCost: 460,
    lastPurchaseRate: 460,
    avgCost: 450,
    gstRate: 12,
    isFinishedGood: true,
    remarks: '10 Pcs/Pack, 12 Packs/Box (120 Pcs Master Box)',
    isActive: true,
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-08-06T09:15:00Z',
    category: { id: 'cat-drc', name: 'Hygiene & Incontinence Care' },
    unit: { id: 'u-pk', name: 'Packs', abbreviation: 'pk' },
    storageLocation: mockLocations[0],
    computedStatus: 'OPTIMAL',
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
    notes: 'Dispatched to Bleaching Mill for Gauze Processing',
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
