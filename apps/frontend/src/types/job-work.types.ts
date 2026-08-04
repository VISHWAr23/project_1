export type JobWorkStatus =
  | 'CREATED'
  | 'MATERIALS_ISSUED'
  | 'IN_PROGRESS'
  | 'PARTIAL_RETURN'
  | 'COMPLETED'
  | 'CLOSED'
  | 'CANCELLED';

export interface JobWorkCompany {
  id: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  creditDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterialUnit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface RawMaterialItem {
  id: string;
  sku: string;
  name: string;
  hsnCode?: string;
  minimumStockLevel: number;
  reorderQuantity: number;
  currentStockBalance: number;
  unitCost: number;
  unit?: RawMaterialUnit;
}

export interface JobWorkIssueItem {
  id: string;
  rollNumber: string;
  batchId?: string;
  issuedWeight: number;
  issuedQty: number;
  remarks?: string;
  createdAt: string;
}

export interface JobWorkReturnItem {
  id: string;
  returnedDate: string;
  rollNumber: string;
  finishedProductId: string;
  finishedProduct?: RawMaterialItem;
  returnedWeight: number;
  returnedQty: number;
  wastageWeight: number;
  wastageQty: number;
  photoUrls?: string[];
  remarks?: string;
  receivedByUser?: { email: string };
  createdAt: string;
  jobWorkOrder?: JobWorkOrder;
}

export interface JobWorkStatusHistory {
  id: string;
  fromStatus?: JobWorkStatus;
  toStatus: JobWorkStatus;
  notes?: string;
  createdAt: string;
  performedByUser?: { email: string };
}

export interface JobWorkOrder {
  id: string;
  jobWorkNumber: string;
  challanNumber?: string;
  expectedReturnDate: string;
  status: JobWorkStatus;
  totalIssuedWeight: number;
  totalIssuedQty: number;
  totalReturnedWeight: number;
  totalReturnedQty: number;
  totalWastageWeight: number;
  totalWastageQty: number;
  pendingWeight: number;
  pendingQty: number;
  vehicleNumber?: string;
  driverName?: string;
  remarks?: string;
  closedAt?: string;
  jobWorkCompanyId: string;
  jobWorkCompany: JobWorkCompany;
  rawMaterialId: string;
  rawMaterial: RawMaterialItem;
  finishedProductId?: string;
  finishedProduct?: RawMaterialItem;
  closedByUser?: { email: string };
  issueItems?: JobWorkIssueItem[];
  returnItems?: JobWorkReturnItem[];
  statusHistory?: JobWorkStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface JobWorkStats {
  totalOrders: number;
  created: number;
  materialsIssued: number;
  inProgress: number;
  partialReturn: number;
  completed: number;
  closed: number;
  activeVendorsCount: number;
}

export interface CreateJobWorkOrderPayload {
  jobWorkCompanyId: string;
  rawMaterialId: string;
  finishedProductId?: string;
  expectedReturnDate: string;
  remarks?: string;
}

export interface IssueMaterialsPayload {
  vehicleNumber: string;
  driverName: string;
  remarks?: string;
  items: {
    rollNumber: string;
    batchId?: string;
    issuedWeight: number;
    issuedQty: number;
    remarks?: string;
  }[];
}

export interface ReceiveReturnPayload {
  returnedDate: string;
  items: {
    finishedProductId: string;
    rollNumber: string;
    returnedWeight: number;
    returnedQty: number;
    wastageWeight?: number;
    wastageQty?: number;
    photoUrls?: string[];
    remarks?: string;
  }[];
  remarks?: string;
}

export interface CloseJobWorkOrderPayload {
  remarks?: string;
  confirmed: boolean;
}
