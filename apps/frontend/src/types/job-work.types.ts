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
  _count?: {
    jobWorkOrders?: number;
    jobWorkChallans?: number;
    cottonRolls?: number;
    gauzeBleachingJobs?: number;
  };
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
  category?: {
    id: string;
    name: string;
    description?: string;
  };
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
  deliveryPerson?: string;
  dcNo?: string;
  dcDate?: string;
  ends?: string;
  itemType?: string;
  outputProductWidth?: string;
  remarks?: string;
  closedAt?: string;
  jobWorkType?: 'STANDARD' | 'WEAVING' | 'BLEACHING';
  jobWorkCompanyId: string;
  jobWorkCompany: JobWorkCompany;
  rawMaterialId?: string | null;
  rawMaterial?: RawMaterialItem | null;
  finishedProductId?: string;
  finishedProduct?: RawMaterialItem;
  closedByUser?: { email: string };
  issueItems?: JobWorkIssueItem[];
  returnItems?: JobWorkReturnItem[];
  statusHistory?: JobWorkStatusHistory[];
  weavingDetail?: WeavingJobWorkDetail | null;
  weavingReceivedItems?: WeavingReceivedItem[];
  bleachingDetail?: BleachingJobWorkDetail | null;
  bleachingReceivedItems?: BleachingReceivedItem[];
  bleachingInputWeavingItems?: WeavingReceivedItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MarkBreakdownItem {
  mark: number;
  paavu: number;
  pieces?: number;
}

export interface WeavingJobWorkDetail {
  id: string;
  jobWorkOrderId: string;
  ends: number;
  reed: number;
  pick: number;
  totalPaavu: number;
  pieceLengthYards: number;
  pieceLengthMeters: number;
  weftCount: number;
  warpCount?: number | null;
  yarnConstant: number;
  markBreakdown: MarkBreakdownItem[];
  totalPieces: number;
  weftWeightPerPieceKg: number;
  totalWeftWeightKg: number;
  warpWeightKg: number;
  totalReceivableWeightKg: number;
  salaryType: 'Roll' | 'Than' | 'Custom';
  ratePerMeter: number;
  baseReedPicks: number;
  salaryPerPiece: number;
  totalSalary: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeavingReceivedItem {
  id: string;
  jobWorkOrderId: string;
  date: string;
  inPassNumber: string;
  description: string;
  rollOrThan?: string | null;
  lengthMeters?: number | null;
  weightKg: number;
  wastageDescription?: string | null;
  wastageWeightKg: number;
  receivedByUserId?: string | null;
  receivedByUser?: { id?: string; email: string };
  bleachingJobWorkOrderId?: string | null;
  isBleached?: boolean;
  jobWorkOrder?: Partial<JobWorkOrder> & {
    id?: string;
    jobWorkNumber?: string;
    status?: JobWorkStatus;
    jobWorkCompany?: Partial<JobWorkCompany>;
    weavingDetail?: Partial<WeavingJobWorkDetail> | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WeavingReturnRegisterResponse {
  items: WeavingReceivedItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type BleachingType = 'BEAM_DYEING' | 'PEROXIDE_BLEACHING';

export interface BleachingJobWorkDetail {
  id: string;
  jobWorkOrderId: string;
  bleachingType: BleachingType;
  rateType: 'PER_KG' | 'PER_METER';
  rate: number;
  totalInputWeightKg: number;
  totalInputLengthMeters?: number | null;
  totalPiecesOrRolls: number;
  processLossPercentage: number;
  expectedOutputWeightKg: number;
  totalCost: number;
  beamNumber?: string | null;
  chemicalFormula?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BleachingReceivedItem {
  id: string;
  jobWorkOrderId: string;
  date: string;
  inPassNumber: string;
  description: string;
  rollOrThan?: string | null;
  lengthMeters?: number | null;
  weightKg: number;
  whitenessIndex?: string | null;
  wastageDescription?: string | null;
  wastageWeightKg: number;
  receivedByUserId?: string | null;
  receivedByUser?: { id?: string; email: string };
  jobWorkOrder?: Partial<JobWorkOrder> & {
    id?: string;
    jobWorkNumber?: string;
    status?: JobWorkStatus;
    jobWorkCompany?: Partial<JobWorkCompany>;
    bleachingDetail?: Partial<BleachingJobWorkDetail> | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BleachingReturnRegisterResponse {
  items: BleachingReceivedItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

export interface CreateWeavingJobWorkPayload {
  jobWorkCompanyId: string;
  jobWorkType?: 'WEAVING';
  rawMaterialId?: string | null;
  expectedReturnDate: string;
  remarks?: string;

  // Weaving Specs
  ends: number;
  reed: number;
  pick: number;
  totalPaavu: number;
  pieceLengthYards?: number;
  pieceLengthMeters?: number;
  weftCount: number;
  warpCount?: number | null;
  yarnConstant?: number;
  markBreakdown: MarkBreakdownItem[];
  totalPieces: number;

  // Calculations
  weftWeightPerPieceKg: number;
  totalWeftWeightKg: number;
  warpWeightKg?: number;
  totalReceivableWeightKg: number;

  // Salary
  salaryType: 'Roll' | 'Than' | 'Custom';
  ratePerMeter: number;
  baseReedPicks?: number;
  salaryPerPiece: number;
  totalSalary: number;
}

export interface WeavingReceivedItemPayload {
  date: string;
  inPassNumber: string;
  description: string;
  rollOrThan?: string;
  lengthMeters?: number | null;
  weightKg: number;
  wastageDescription?: string;
  wastageWeightKg?: number;
}

export interface ReceiveWeavingReturnPayload {
  returnedDate: string;
  items: WeavingReceivedItemPayload[];
  remarks?: string;
  isFinal?: boolean;
}

export interface CreateBleachingJobWorkPayload {
  jobWorkCompanyId: string;
  jobWorkType?: 'BLEACHING';
  expectedReturnDate: string;
  remarks?: string;

  // Process Specs
  bleachingType: BleachingType;
  rateType: 'PER_KG' | 'PER_METER';
  rate: number;
  processLossPercentage?: number;
  beamNumber?: string;
  chemicalFormula?: string;

  // Selected Weaving Received Goods
  selectedWeavingItemIds: string[];

  // Totals
  totalInputWeightKg: number;
  totalInputLengthMeters?: number | null;
  totalPiecesOrRolls: number;
  expectedOutputWeightKg: number;
  totalCost: number;
}

export interface BleachingReceivedItemPayload {
  date: string;
  inPassNumber: string;
  description: string;
  rollOrThan?: 'Roll' | 'Than';
  lengthMeters?: number | null;
  weightKg: number;
  whitenessIndex?: string;
  wastageDescription?: string;
  wastageWeightKg?: number;
}

export interface ReceiveBleachingReturnPayload {
  returnedDate: string;
  items: BleachingReceivedItemPayload[];
  remarks?: string;
  isFinal?: boolean;
}

export interface IssueMaterialsPayload {
  vehicleNumber: string;
  driverName: string;
  deliveryPerson?: string;
  dcNo?: string;
  dcDate?: string;
  ends?: string;
  itemType?: string;
  outputProductWidth?: string;
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
  isFinal?: boolean;
}

export interface CloseJobWorkOrderPayload {
  remarks?: string;
  confirmed: boolean;
}

