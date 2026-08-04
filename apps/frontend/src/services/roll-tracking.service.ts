import { apiClient } from './api-client';

export type RollStatus =
  | 'RAW_RECEIVED'
  | 'STORED_IN_RM'
  | 'ISSUED_TO_JOBWORK'
  | 'PROCESS_IN_PROGRESS'
  | 'RETURNED_FROM_JOBWORK'
  | 'QC_PENDING'
  | 'QC_APPROVED'
  | 'QC_REJECTED'
  | 'IN_PRODUCTION'
  | 'CONVERTED'
  | 'PACKED'
  | 'DISPATCHED'
  | 'SCRAPPED';

export type RollStage =
  | 'RAW_COTTON_BALE'
  | 'GREY_FABRIC_ROLL'
  | 'BLEACHED_GAUZE_ROLL'
  | 'SLIT_ROLL'
  | 'FINISHED_PRODUCT_ROLL';

export interface CottonRoll {
  id: string;
  rollNumber: string;
  barcode: string;
  batchNumber: string;
  materialName: string;
  stage: RollStage;
  widthInches: number;
  lengthMeters: number;
  weightKg: number;
  gsm?: number;
  currentStatus: RollStatus;
  currentLocation: string;
  issueDate?: string;
  returnDate?: string;
  parentRollId?: string;
  parentRoll?: CottonRoll;
  childRolls?: CottonRoll[];
  jobWorkCompany?: { id: string; companyName: string };
  productionBatch?: { id: string; batchNumber: string; targetProduct: string };
  finishedProduct?: { id: string; name: string; productCode: string };
  statusHistory?: RollStatusHistoryItem[];
  qcInspections?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface RollStatusHistoryItem {
  id: string;
  rollId: string;
  fromStatus?: RollStatus;
  toStatus: RollStatus;
  location: string;
  remarks?: string;
  performedBy: string;
  createdAt: string;
}

export interface RollQueryParams {
  search?: string;
  status?: RollStatus;
  stage?: RollStage;
  batchNumber?: string;
  jobWorkCompanyId?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface RollStats {
  totalRolls: number;
  totalWeightKg: number | string;
  totalLengthMeters: number | string;
  statusBreakdown: { currentStatus: RollStatus; _count: { _all: number }; _sum: { weightKg: number } }[];
  stageBreakdown: { stage: RollStage; _count: { _all: number }; _sum: { weightKg: number } }[];
}

export const rollTrackingService = {
  async getRolls(params: RollQueryParams = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.stage) query.append('stage', params.stage);
    if (params.batchNumber) query.append('batchNumber', params.batchNumber);
    if (params.jobWorkCompanyId) query.append('jobWorkCompanyId', params.jobWorkCompanyId);
    if (params.location) query.append('location', params.location);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<{
      data: CottonRoll[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/rolls${queryString}`);
  },

  async getRollByNumber(rollNumber: string) {
    return apiClient<CottonRoll>(`/rolls/${encodeURIComponent(rollNumber)}`);
  },

  async getRollGenealogy(rollNumber: string) {
    return apiClient<{
      roll: CottonRoll;
      ancestors: Partial<CottonRoll>[];
      children: Partial<CottonRoll>[];
    }>(`/rolls/${encodeURIComponent(rollNumber)}/genealogy`);
  },

  async getRollStats() {
    return apiClient<RollStats>('/rolls/stats');
  },

  async updateRollStatus(
    rollNumber: string,
    data: { status: RollStatus; location: string; remarks?: string; performedBy: string },
  ) {
    return apiClient<CottonRoll>(`/rolls/${encodeURIComponent(rollNumber)}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async createRoll(data: {
    materialName: string;
    batchNumber: string;
    widthInches: number;
    lengthMeters: number;
    weightKg: number;
    gsm?: number;
    stage?: RollStage;
    status?: RollStatus;
    currentLocation: string;
    parentRollId?: string;
    jobWorkCompanyId?: string;
    productionBatchId?: string;
    finishedProductId?: string;
  }) {
    return apiClient<CottonRoll>('/rolls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
