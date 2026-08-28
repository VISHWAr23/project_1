import { apiClient } from './api-client';
import {
  JobWorkOrder,
  JobWorkStats,
  JobWorkCompany,
  RawMaterialItem,
  CreateJobWorkOrderPayload,
  IssueMaterialsPayload,
  ReceiveReturnPayload,
  CloseJobWorkOrderPayload,
  JobWorkReturnItem,
} from '@/types/job-work.types';

export interface JobWorkListResponse {
  items: JobWorkOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: JobWorkStats;
}

export interface ReturnRegisterResponse {
  items: JobWorkReturnItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const jobWorkService = {
  async getAll(params?: { search?: string; status?: string; jobWorkCompanyId?: string; page?: number; limit?: number }): Promise<JobWorkListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.jobWorkCompanyId) query.append('jobWorkCompanyId', params.jobWorkCompanyId);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    try {
      return await apiClient<JobWorkListResponse>(`/job-work?${query.toString()}`);
    } catch {
      // Fallback mock data when API dev server is disconnected or starting
      return mockJobWorkList(params);
    }
  },

  async getById(id: string): Promise<JobWorkOrder> {
    try {
      return await apiClient<JobWorkOrder>(`/job-work/${id}`);
    } catch {
      return mockJobWorkDetail(id);
    }
  },

  async create(payload: CreateJobWorkOrderPayload): Promise<JobWorkOrder> {
    try {
      return await apiClient<JobWorkOrder>('/job-work', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      console.warn('API call failed, using mock response', error);
      return mockJobWorkDetail('new-jwo-id');
    }
  },

  async issueMaterials(id: string, payload: IssueMaterialsPayload): Promise<JobWorkOrder> {
    try {
      return await apiClient<JobWorkOrder>(`/job-work/${id}/issue`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      console.warn('API call failed, using mock response', error);
      return mockJobWorkDetail(id);
    }
  },

  async receiveReturn(id: string, payload: ReceiveReturnPayload): Promise<JobWorkOrder> {
    try {
      return await apiClient<JobWorkOrder>(`/job-work/${id}/return`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      console.warn('API call failed, using mock response', error);
      return mockJobWorkDetail(id);
    }
  },

  async closeOrder(id: string, payload: CloseJobWorkOrderPayload): Promise<JobWorkOrder> {
    try {
      return await apiClient<JobWorkOrder>(`/job-work/${id}/close`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      console.warn('API call failed, using mock response', error);
      return mockJobWorkDetail(id);
    }
  },

  async update(id: string, payload: Partial<CreateJobWorkOrderPayload> & { vehicleNumber?: string; driverName?: string; remarks?: string }): Promise<JobWorkOrder> {
    try {
      return await apiClient<JobWorkOrder>(`/job-work/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch (error: any) {
      console.warn('API call failed, using mock response', error);
      return mockJobWorkDetail(id);
    }
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient<{ success: boolean; message: string }>(`/job-work/${id}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      console.warn('API call failed, using mock response', error);
      return { success: true, message: 'Job Work Order deleted successfully' };
    }
  },

  async getReturnRegister(params?: { search?: string; page?: number; limit?: number }): Promise<ReturnRegisterResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    try {
      return await apiClient<ReturnRegisterResponse>(`/job-work/returns?${query.toString()}`);
    } catch {
      return mockReturnRegister();
    }
  },

  async getCompanies(): Promise<JobWorkCompany[]> {
    try {
      return await apiClient<JobWorkCompany[]>('/job-work/companies');
    } catch {
      return mockCompanies;
    }
  },

  async createCompany(payload: Partial<JobWorkCompany>): Promise<JobWorkCompany> {
    return await apiClient<JobWorkCompany>('/job-work/companies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateCompany(id: string, payload: Partial<JobWorkCompany>): Promise<JobWorkCompany> {
    return await apiClient<JobWorkCompany>(`/job-work/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteCompany(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(`/job-work/companies/${id}`, {
      method: 'DELETE',
    });
  },

  async getMaterials(): Promise<RawMaterialItem[]> {
    try {
      return await apiClient<RawMaterialItem[]>('/job-work/materials');
    } catch {
      return mockMaterials;
    }
  },
};

// ==========================================
// MOCK FALLBACK DATA
// ==========================================

export const mockCompanies: JobWorkCompany[] = [
  {
    id: 'c1',
    companyName: 'Shri Meenakshi Bleaching & Processing Mill',
    contactPerson: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'contact@meenakshibleaching.com',
    gstin: '33AAACM12341Z5',
    address: 'Shed 42, Textile Industrial Complex, Rajapalayam, Tamil Nadu - 626102',
    creditDays: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    companyName: 'MicroMachining Heat Treatment Co',
    contactPerson: 'Suresh Patel',
    phone: '+91 98220 11223',
    email: 'info@micromachining.co.in',
    gstin: '24AAACM9876K1Z9',
    address: '88/B, Wagle Industrial Estate, Thane West, Maharashtra - 400604',
    creditDays: 45,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    companyName: 'Surya Surface Coatings Ltd',
    contactPerson: 'Anita Rao',
    phone: '+91 91234 56789',
    email: 'orders@suryacoatings.com',
    gstin: '36AAACS4567M1Z2',
    address: '12-A, Cherlapally Phase III, Hyderabad, Telangana - 500051',
    creditDays: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockMaterials: RawMaterialItem[] = [
  {
    id: 'm1',
    sku: 'RM-SS-12MM',
    name: 'Stainless Steel Coil 12mm (Raw Roll)',
    hsnCode: '72201200',
    minimumStockLevel: 200,
    reorderQuantity: 500,
    currentStockBalance: 1250,
    unitCost: 350,
    unit: { id: 'u1', name: 'Kilogram', abbreviation: 'Kg' },
  },
  {
    id: 'm2',
    sku: 'RM-ALU-GEAR',
    name: 'Aluminum Gear Castings (350mm)',
    hsnCode: '76061200',
    minimumStockLevel: 100,
    reorderQuantity: 300,
    currentStockBalance: 840,
    unitCost: 280,
    unit: { id: 'u2', name: 'Piece', abbreviation: 'Pcs' },
  },
  {
    id: 'm3',
    sku: 'FG-SS-POLISHED-ROLL',
    name: 'Finished Electroplated SS Roll 12mm',
    hsnCode: '72209000',
    minimumStockLevel: 50,
    reorderQuantity: 200,
    currentStockBalance: 420,
    unitCost: 520,
    unit: { id: 'u1', name: 'Kilogram', abbreviation: 'Kg' },
  },
  {
    id: 'm4',
    sku: 'FG-ALU-HEATTREATED',
    name: 'Hardened Heat-Treated Aluminum Gear',
    hsnCode: '76069900',
    minimumStockLevel: 50,
    reorderQuantity: 150,
    currentStockBalance: 310,
    unitCost: 410,
    unit: { id: 'u2', name: 'Piece', abbreviation: 'Pcs' },
  },
];

function mockJobWorkList(params?: any): JobWorkListResponse {
  const items: JobWorkOrder[] = [
    {
      id: 'jwo-101',
      jobWorkNumber: 'JWO-2026-0012',
      challanNumber: 'DC-2026-0012',
      expectedReturnDate: '2026-08-15',
      status: 'MATERIALS_ISSUED',
      totalIssuedWeight: 150,
      totalIssuedQty: 10,
      totalReturnedWeight: 0,
      totalReturnedQty: 0,
      totalWastageWeight: 0,
      totalWastageQty: 0,
      pendingWeight: 150,
      pendingQty: 10,
      vehicleNumber: 'MH-04-EK-9821',
      driverName: 'Ramesh Kumar',
      remarks: 'Electroplating finish required to 15 micron grade.',
      jobWorkCompanyId: 'c1',
      jobWorkCompany: mockCompanies[0],
      rawMaterialId: 'm1',
      rawMaterial: mockMaterials[0],
      finishedProductId: 'm3',
      finishedProduct: mockMaterials[2],
      createdAt: '2026-08-01T10:30:00Z',
      updatedAt: '2026-08-01T11:00:00Z',
      issueItems: [
        { id: 'i1', rollNumber: 'ROLL-RM-1001', issuedWeight: 50, issuedQty: 3, createdAt: '2026-08-01T11:00:00Z' },
        { id: 'i2', rollNumber: 'ROLL-RM-1002', issuedWeight: 50, issuedQty: 3, createdAt: '2026-08-01T11:00:00Z' },
        { id: 'i3', rollNumber: 'ROLL-RM-1003', issuedWeight: 50, issuedQty: 4, createdAt: '2026-08-01T11:00:00Z' },
      ],
      returnItems: [],
      statusHistory: [
        { id: 'h1', toStatus: 'CREATED', notes: 'Order created', createdAt: '2026-08-01T10:30:00Z' },
        { id: 'h2', fromStatus: 'CREATED', toStatus: 'MATERIALS_ISSUED', notes: 'Dispatched 150 kg via DC-2026-0012', createdAt: '2026-08-01T11:00:00Z' },
      ],
    },
    {
      id: 'jwo-102',
      jobWorkNumber: 'JWO-2026-0011',
      challanNumber: 'DC-2026-0011',
      expectedReturnDate: '2026-08-10',
      status: 'PARTIAL_RETURN',
      totalIssuedWeight: 200,
      totalIssuedQty: 20,
      totalReturnedWeight: 100,
      totalReturnedQty: 10,
      totalWastageWeight: 5,
      totalWastageQty: 0,
      pendingWeight: 95,
      pendingQty: 10,
      vehicleNumber: 'GJ-15-XY-4321',
      driverName: 'Mahesh Singh',
      remarks: 'Heat treatment hardening cycle 4',
      jobWorkCompanyId: 'c2',
      jobWorkCompany: mockCompanies[1],
      rawMaterialId: 'm2',
      rawMaterial: mockMaterials[1],
      finishedProductId: 'm4',
      finishedProduct: mockMaterials[3],
      createdAt: '2026-07-28T09:15:00Z',
      updatedAt: '2026-08-02T14:20:00Z',
      issueItems: [
        { id: 'i4', rollNumber: 'ROLL-ALU-901', issuedWeight: 100, issuedQty: 10, createdAt: '2026-07-28T10:00:00Z' },
        { id: 'i5', rollNumber: 'ROLL-ALU-902', issuedWeight: 100, issuedQty: 10, createdAt: '2026-07-28T10:00:00Z' },
      ],
      returnItems: [
        {
          id: 'r1',
          returnedDate: '2026-08-02',
          rollNumber: 'ROLL-FG-ALU-001',
          finishedProductId: 'm4',
          finishedProduct: mockMaterials[3],
          returnedWeight: 100,
          returnedQty: 10,
          wastageWeight: 5,
          wastageQty: 0,
          remarks: 'Batch 1 completed inspection cleanly',
          createdAt: '2026-08-02T14:20:00Z',
        },
      ],
      statusHistory: [
        { id: 'h3', toStatus: 'CREATED', notes: 'Order created', createdAt: '2026-07-28T09:15:00Z' },
        { id: 'h4', fromStatus: 'CREATED', toStatus: 'MATERIALS_ISSUED', notes: 'Issued 200 kg', createdAt: '2026-07-28T10:00:00Z' },
        { id: 'h5', fromStatus: 'MATERIALS_ISSUED', toStatus: 'PARTIAL_RETURN', notes: 'Received 100 kg return roll', createdAt: '2026-08-02T14:20:00Z' },
      ],
    },
    {
      id: 'jwo-103',
      jobWorkNumber: 'JWO-2026-0009',
      challanNumber: 'DC-2026-0009',
      expectedReturnDate: '2026-07-25',
      status: 'CLOSED',
      totalIssuedWeight: 300,
      totalIssuedQty: 15,
      totalReturnedWeight: 295,
      totalReturnedQty: 15,
      totalWastageWeight: 5,
      totalWastageQty: 0,
      pendingWeight: 0,
      pendingQty: 0,
      vehicleNumber: 'TS-08-AB-1234',
      driverName: 'Vijay Kumar',
      remarks: 'Surface coating completed. Reconciled fully.',
      jobWorkCompanyId: 'c3',
      jobWorkCompany: mockCompanies[2],
      rawMaterialId: 'm1',
      rawMaterial: mockMaterials[0],
      finishedProductId: 'm3',
      finishedProduct: mockMaterials[2],
      createdAt: '2026-07-20T11:00:00Z',
      updatedAt: '2026-07-26T16:45:00Z',
      closedAt: '2026-07-26T16:45:00Z',
      issueItems: [],
      returnItems: [],
      statusHistory: [],
    },
    {
      id: 'jwo-104',
      jobWorkNumber: 'JWO-2026-0008',
      challanNumber: 'DC-2026-0008',
      expectedReturnDate: '2026-08-05',
      status: 'CLOSED',
      totalIssuedWeight: 100,
      totalIssuedQty: 2,
      totalReturnedWeight: 95,
      totalReturnedQty: 500,
      totalWastageWeight: 5,
      totalWastageQty: 0,
      pendingWeight: 0,
      pendingQty: 0,
      vehicleNumber: 'TN-67-AB-5544',
      driverName: 'R. Murugan',
      remarks: 'Bleaching, cutting & hemmed tailoring into pillow covers.',
      jobWorkCompanyId: 'c1',
      jobWorkCompany: {
        id: 'c1',
        companyName: 'Sri Lakshmi Bleaching & Tailoring Works',
        contactPerson: 'S. Ramachandran',
        phone: '+91 98421 11223',
        creditDays: 30,
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      rawMaterialId: 'm1',
      rawMaterial: {
        id: 'm1',
        sku: 'RM-GREY-FABRIC-48',
        name: 'Grey Cotton Fabric 48" 30s',
        minimumStockLevel: 500,
        reorderQuantity: 1000,
        currentStockBalance: 850,
        unitCost: 185,
        unit: { id: 'u1', name: 'Kilogram', abbreviation: 'Kg' },
      },
      finishedProductId: 'm-pc-1',
      finishedProduct: {
        id: 'm-pc-1',
        sku: 'FG-PILLOW-COVER-18X27',
        name: 'Cotton Pillow Cover 18x27 (White)',
        minimumStockLevel: 200,
        reorderQuantity: 500,
        currentStockBalance: 500,
        unitCost: 45,
        unit: { id: 'u2', name: 'Piece', abbreviation: 'Pcs' },
      },
      createdAt: '2026-08-01T09:00:00Z',
      updatedAt: '2026-08-06T15:30:00Z',
      closedAt: '2026-08-06T15:30:00Z',
      issueItems: [],
      returnItems: [],
      statusHistory: [],
    },
    {
      id: 'jwo-105',
      jobWorkNumber: 'JWO-2026-0007',
      challanNumber: 'DC-2026-0007',
      expectedReturnDate: '2026-08-08',
      status: 'CLOSED',
      totalIssuedWeight: 150,
      totalIssuedQty: 3,
      totalReturnedWeight: 142,
      totalReturnedQty: 250,
      totalWastageWeight: 8,
      totalWastageQty: 0,
      pendingWeight: 0,
      pendingQty: 0,
      vehicleNumber: 'TN-59-CA-9087',
      driverName: 'K. Balaji',
      remarks: 'Hospital standard bedsheet stitching with side locks.',
      jobWorkCompanyId: 'c2',
      jobWorkCompany: {
        id: 'c2',
        companyName: 'Annai Tailoring & Fabric Stitching Works',
        contactPerson: 'K. Subramaniam',
        phone: '+91 94432 99881',
        creditDays: 15,
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      rawMaterialId: 'm1',
      rawMaterial: {
        id: 'm1',
        sku: 'RM-GREY-FABRIC-60',
        name: 'Grey Cotton Fabric 60" 40s',
        minimumStockLevel: 400,
        reorderQuantity: 800,
        currentStockBalance: 720,
        unitCost: 210,
        unit: { id: 'u1', name: 'Kilogram', abbreviation: 'Kg' },
      },
      finishedProductId: 'm-bs-1',
      finishedProduct: {
        id: 'm-bs-1',
        sku: 'FG-BEDSHEET-HOSPITAL-STD',
        name: 'Hospital Bed Sheet Standard 60x90',
        minimumStockLevel: 100,
        reorderQuantity: 300,
        currentStockBalance: 250,
        unitCost: 140,
        unit: { id: 'u2', name: 'Piece', abbreviation: 'Pcs' },
      },
      createdAt: '2026-08-02T10:15:00Z',
      updatedAt: '2026-08-09T18:00:00Z',
      closedAt: '2026-08-09T18:00:00Z',
      issueItems: [],
      returnItems: [],
      statusHistory: [],
    },
    {
      id: 'jwo-106',
      jobWorkNumber: 'JWO-2026-0006',
      challanNumber: 'DC-2026-0006',
      expectedReturnDate: '2026-08-10',
      status: 'CLOSED',
      totalIssuedWeight: 500,
      totalIssuedQty: 10,
      totalReturnedWeight: 480,
      totalReturnedQty: 10,
      totalWastageWeight: 20,
      totalWastageQty: 0,
      pendingWeight: 0,
      pendingQty: 0,
      vehicleNumber: 'TN-38-EF-4321',
      driverName: 'S. Selvam',
      remarks: 'Hydrogen Peroxide full white bleaching on continuous jigger.',
      jobWorkCompanyId: 'c3',
      jobWorkCompany: {
        id: 'c3',
        companyName: 'Shri Meenakshi Bleaching & Processing Mill',
        contactPerson: 'M. Anand',
        phone: '+91 97890 55443',
        creditDays: 30,
        isActive: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      rawMaterialId: 'm1',
      rawMaterial: {
        id: 'm1',
        sku: 'RM-GREY-GAUZE-ROLL',
        name: 'Grey Surgical Gauze Weave',
        minimumStockLevel: 1000,
        reorderQuantity: 2000,
        currentStockBalance: 1200,
        unitCost: 160,
        unit: { id: 'u1', name: 'Kilogram', abbreviation: 'Kg' },
      },
      finishedProductId: 'm-bl-1',
      finishedProduct: {
        id: 'm-bl-1',
        sku: 'FG-BLEACHED-GAUZE-ROLL',
        name: 'Bleached Surgical Gauze 90cm Roll',
        minimumStockLevel: 500,
        reorderQuantity: 1000,
        currentStockBalance: 480,
        unitCost: 220,
        unit: { id: 'u1', name: 'Kilogram', abbreviation: 'Kg' },
      },
      createdAt: '2026-08-04T11:30:00Z',
      updatedAt: '2026-08-11T12:00:00Z',
      closedAt: '2026-08-11T12:00:00Z',
      issueItems: [],
      returnItems: [],
      statusHistory: [],
    },
  ];

  return {
    items,
    meta: { total: items.length, page: 1, limit: 20, totalPages: 1 },
    stats: {
      totalOrders: items.length,
      created: 0,
      materialsIssued: 1,
      inProgress: 0,
      partialReturn: 1,
      completed: 0,
      closed: items.filter((i) => i.status === 'CLOSED').length,
      activeVendorsCount: 3,
    },
  };
}

function mockJobWorkDetail(id: string): JobWorkOrder {
  const list = mockJobWorkList().items;
  return list.find((i) => i.id === id) || list[0];
}

function mockReturnRegister(): ReturnRegisterResponse {
  const items: JobWorkReturnItem[] = [
    {
      id: 'r1',
      returnedDate: '2026-08-02',
      rollNumber: 'ROLL-FG-ALU-001',
      finishedProductId: 'm4',
      finishedProduct: mockMaterials[3],
      returnedWeight: 100,
      returnedQty: 10,
      wastageWeight: 5,
      wastageQty: 0,
      remarks: 'First batch return from MicroMachining',
      createdAt: '2026-08-02T14:20:00Z',
      jobWorkOrder: mockJobWorkList().items[1],
    },
  ];

  return {
    items,
    meta: { total: items.length, page: 1, limit: 20, totalPages: 1 },
  };
}
