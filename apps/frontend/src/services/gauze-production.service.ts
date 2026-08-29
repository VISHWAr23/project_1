import { apiClient } from './api-client';
import {
  GauzeProductionBatch,
  GauzeDashboardStats,
  GauzeMastersResponse,
  VendorHeldStockRecord,
  GauzeTraceabilityData,
  GauzeBleachingJobItem,
  GauzeType,
  GauzeSize,
  BleachingType,
  GauzeOperationType,
} from '@/types/gauze-production.types';
import {
  CreateGauzeProductionBatchInput,
  UpdateGauzeProductionBatchInput,
  SendToBleachingInput,
  ReceiveBleachingInput,
  AddProcessingOperationInput,
  CreatePackingEntryInput,
  GauzeTypeInput,
  GauzeSizeInput,
  BleachingTypeInput,
  GauzeOperationTypeInput,
} from '@ims/validation';

export const gauzeProductionService = {
  // Dashboard & Batches
  getDashboardStats: async (): Promise<GauzeDashboardStats> => {
    return apiClient<GauzeDashboardStats>('/gauze-production/dashboard');
  },

  getAllBatches: async (params?: {
    search?: string;
    status?: string;
    gauzeTypeId?: string;
    gauzeSizeId?: string;
    supplierId?: string;
    productId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: GauzeProductionBatch[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.gauzeTypeId && params.gauzeTypeId !== 'ALL') query.append('gauzeTypeId', params.gauzeTypeId);
    if (params?.gauzeSizeId && params.gauzeSizeId !== 'ALL') query.append('gauzeSizeId', params.gauzeSizeId);
    if (params?.supplierId && params.supplierId !== 'ALL') query.append('supplierId', params.supplierId);
    if (params?.productId && params.productId !== 'ALL') query.append('productId', params.productId);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return apiClient(`/gauze-production/batches?${query.toString()}`);
  },

  getBatchById: async (id: string): Promise<GauzeProductionBatch> => {
    return apiClient<GauzeProductionBatch>(`/gauze-production/batches/${id}`);
  },

  createBatch: async (payload: CreateGauzeProductionBatchInput): Promise<GauzeProductionBatch> => {
    return apiClient<GauzeProductionBatch>('/gauze-production/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateBatchStatus: async (
    id: string,
    status: string,
    remarks?: string
  ): Promise<GauzeProductionBatch> => {
    return apiClient<GauzeProductionBatch>(`/gauze-production/batches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    });
  },

  // Bleaching Stage
  sendToBleaching: async (batchId: string, payload: SendToBleachingInput) => {
    return apiClient(`/gauze-production/batches/${batchId}/bleaching`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  receiveBleaching: async (batchId: string, payload: ReceiveBleachingInput) => {
    return apiClient(`/gauze-production/batches/${batchId}/bleaching-receipt`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getBleachingJobs: async (params?: { vendorId?: string; status?: string; search?: string }): Promise<GauzeBleachingJobItem[]> => {
    const query = new URLSearchParams();
    if (params?.vendorId && params.vendorId !== 'ALL') query.append('vendorId', params.vendorId);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    return apiClient<GauzeBleachingJobItem[]>(`/gauze-production/bleaching-jobs?${query.toString()}`);
  },

  getVendorStockRegister: async (): Promise<VendorHeldStockRecord[]> => {
    return apiClient<VendorHeldStockRecord[]>('/gauze-production/vendor-stock');
  },

  // Internal Processing Stage
  addProcessingOperation: async (batchId: string, payload: AddProcessingOperationInput) => {
    return apiClient(`/gauze-production/batches/${batchId}/operations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Packing & Finished Goods Stage
  createPackingEntry: async (batchId: string, payload: CreatePackingEntryInput) => {
    return apiClient(`/gauze-production/batches/${batchId}/packing`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Traceability
  getTraceability: async (batchId: string): Promise<GauzeTraceabilityData> => {
    return apiClient<GauzeTraceabilityData>(`/gauze-production/batches/${batchId}/traceability`);
  },

  // Reports
  getReports: async (type: 'batches' | 'bleaching' | 'vendor-pending' | 'wastage' | 'finished-goods') => {
    return apiClient(`/gauze-production/reports?type=${type}`);
  },

  // Masters
  getMasters: async (): Promise<GauzeMastersResponse> => {
    return apiClient<GauzeMastersResponse>('/gauze-production/masters');
  },

  createGauzeType: async (payload: GauzeTypeInput): Promise<GauzeType> => {
    return apiClient<GauzeType>('/gauze-production/masters/types', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateGauzeType: async (id: string, payload: Partial<GauzeTypeInput>): Promise<GauzeType> => {
    return apiClient<GauzeType>(`/gauze-production/masters/types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteGauzeType: async (id: string): Promise<any> => {
    return apiClient(`/gauze-production/masters/types/${id}`, {
      method: 'DELETE',
    });
  },

  createGauzeSize: async (payload: GauzeSizeInput): Promise<GauzeSize> => {
    return apiClient<GauzeSize>('/gauze-production/masters/sizes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateGauzeSize: async (id: string, payload: Partial<GauzeSizeInput>): Promise<GauzeSize> => {
    return apiClient<GauzeSize>(`/gauze-production/masters/sizes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteGauzeSize: async (id: string): Promise<any> => {
    return apiClient(`/gauze-production/masters/sizes/${id}`, {
      method: 'DELETE',
    });
  },

  createBleachingType: async (payload: BleachingTypeInput): Promise<BleachingType> => {
    return apiClient<BleachingType>('/gauze-production/masters/bleaching', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateBleachingType: async (id: string, payload: Partial<BleachingTypeInput>): Promise<BleachingType> => {
    return apiClient<BleachingType>(`/gauze-production/masters/bleaching/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteBleachingType: async (id: string): Promise<any> => {
    return apiClient(`/gauze-production/masters/bleaching/${id}`, {
      method: 'DELETE',
    });
  },

  createOperationType: async (payload: GauzeOperationTypeInput): Promise<GauzeOperationType> => {
    return apiClient<GauzeOperationType>('/gauze-production/masters/operations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateOperationType: async (id: string, payload: Partial<GauzeOperationTypeInput>): Promise<GauzeOperationType> => {
    return apiClient<GauzeOperationType>(`/gauze-production/masters/operations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteOperationType: async (id: string): Promise<any> => {
    return apiClient(`/gauze-production/masters/operations/${id}`, {
      method: 'DELETE',
    });
  },
};
