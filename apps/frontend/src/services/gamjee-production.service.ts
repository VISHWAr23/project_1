import { apiClient } from './api-client';
import {
  GamjeeProductionBatch,
  GamjeeDashboardStats,
  GamjeeMastersResponse,
  GamjeeTraceabilityData,
  GamjeeSize,
  GamjeeOperationType,
  GamjeeProductMaster,
  GamjeeCottonSpecification,
  CreateGamjeeCottonSpecInput,
} from '@/types/gamjee-production.types';
import {
  CreateGamjeeProductionBatchInput,
  IssueGamjeeMaterialsInput,
  AddGamjeeOperationInput,
  CreateGamjeeRollingInput,
  GamjeeSizeInput,
  GamjeeOperationInput,
  GamjeeProductMasterInput,
} from '@ims/validation';

export const gamjeeProductionService = {
  // Dashboard & Batches
  getDashboardStats: async (): Promise<GamjeeDashboardStats> => {
    return apiClient<GamjeeDashboardStats>('/gamjee-production/dashboard');
  },

  getAllBatches: async (params?: {
    search?: string;
    status?: string;
    gamjeeSizeId?: string;
    finishedProductId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: GamjeeProductionBatch[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.gamjeeSizeId && params.gamjeeSizeId !== 'ALL') query.append('gamjeeSizeId', params.gamjeeSizeId);
    if (params?.finishedProductId && params.finishedProductId !== 'ALL') query.append('finishedProductId', params.finishedProductId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return apiClient(`/gamjee-production/batches?${query.toString()}`);
  },

  getBatchById: async (id: string): Promise<GamjeeProductionBatch> => {
    return apiClient<GamjeeProductionBatch>(`/gamjee-production/batches/${id}`);
  },

  createBatch: async (payload: CreateGamjeeProductionBatchInput): Promise<GamjeeProductionBatch> => {
    return apiClient<GamjeeProductionBatch>('/gamjee-production/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateBatchStatus: async (
    id: string,
    status: string,
    remarks?: string
  ): Promise<GamjeeProductionBatch> => {
    return apiClient<GamjeeProductionBatch>(`/gamjee-production/batches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  },

  // Operations & Materials
  issueMaterials: async (batchId: string, payload: IssueGamjeeMaterialsInput) => {
    return apiClient(`/gamjee-production/batches/${batchId}/issue-materials`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addProcessingOperation: async (batchId: string, payload: AddGamjeeOperationInput) => {
    return apiClient(`/gamjee-production/batches/${batchId}/operations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createRollingEntry: async (batchId: string, payload: CreateGamjeeRollingInput) => {
    return apiClient(`/gamjee-production/batches/${batchId}/rolling`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getTraceability: async (batchId: string): Promise<GamjeeTraceabilityData> => {
    return apiClient<GamjeeTraceabilityData>(`/gamjee-production/batches/${batchId}/traceability`);
  },

  getReports: async (type: 'production' | 'consumption' | 'wastage' | 'finished_goods') => {
    return apiClient<any[]>(`/gamjee-production/reports?type=${type}`);
  },

  // Master Data
  getMasters: async (): Promise<GamjeeMastersResponse> => {
    return apiClient<GamjeeMastersResponse>('/gamjee-production/masters');
  },

  createSize: async (payload: GamjeeSizeInput): Promise<GamjeeSize> => {
    return apiClient<GamjeeSize>('/gamjee-production/masters/sizes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateSize: async (id: string, payload: Partial<GamjeeSizeInput>): Promise<GamjeeSize> => {
    return apiClient<GamjeeSize>(`/gamjee-production/masters/sizes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteSize: async (id: string): Promise<any> => {
    return apiClient(`/gamjee-production/masters/sizes/${id}`, {
      method: 'DELETE',
    });
  },

  createOperation: async (payload: GamjeeOperationInput): Promise<GamjeeOperationType> => {
    return apiClient<GamjeeOperationType>('/gamjee-production/masters/operations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateOperation: async (id: string, payload: Partial<GamjeeOperationInput>): Promise<GamjeeOperationType> => {
    return apiClient<GamjeeOperationType>(`/gamjee-production/masters/operations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteOperation: async (id: string): Promise<any> => {
    return apiClient(`/gamjee-production/masters/operations/${id}`, {
      method: 'DELETE',
    });
  },

  createProductMaster: async (payload: GamjeeProductMasterInput): Promise<GamjeeProductMaster> => {
    return apiClient<GamjeeProductMaster>('/gamjee-production/masters/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateProductMaster: async (id: string, payload: Partial<GamjeeProductMasterInput>): Promise<GamjeeProductMaster> => {
    return apiClient<GamjeeProductMaster>(`/gamjee-production/masters/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteProductMaster: async (id: string): Promise<any> => {
    return apiClient(`/gamjee-production/masters/products/${id}`, {
      method: 'DELETE',
    });
  },

  createCottonSpec: async (payload: CreateGamjeeCottonSpecInput): Promise<GamjeeCottonSpecification> => {
    return apiClient<GamjeeCottonSpecification>('/gamjee-production/masters/cotton-specs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateCottonSpec: async (
    id: string,
    payload: Partial<CreateGamjeeCottonSpecInput>
  ): Promise<GamjeeCottonSpecification> => {
    return apiClient<GamjeeCottonSpecification>(`/gamjee-production/masters/cotton-specs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCottonSpec: async (id: string): Promise<any> => {
    return apiClient(`/gamjee-production/masters/cotton-specs/${id}`, {
      method: 'DELETE',
    });
  },
};
