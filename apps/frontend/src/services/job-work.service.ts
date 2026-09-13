import { apiClient } from './api-client';
import {
  JobWorkOrder,
  JobWorkStats,
  JobWorkCompany,
  RawMaterialItem,
  CreateJobWorkOrderPayload,
  CreateWeavingJobWorkPayload,
  IssueMaterialsPayload,
  ReceiveReturnPayload,
  ReceiveWeavingReturnPayload,
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

    return await apiClient<JobWorkListResponse>(`/job-work?${query.toString()}`);
  },

  async getById(id: string): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>(`/job-work/${id}`);
  },

  async create(payload: CreateJobWorkOrderPayload): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>('/job-work', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async createWeavingOrder(payload: CreateWeavingJobWorkPayload): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>('/job-work/weaving', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async receiveWeavingReturn(id: string, payload: ReceiveWeavingReturnPayload): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>(`/job-work/${id}/weaving-return`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async issueMaterials(id: string, payload: IssueMaterialsPayload): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>(`/job-work/${id}/issue`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async receiveReturn(id: string, payload: ReceiveReturnPayload): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>(`/job-work/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async closeOrder(id: string, payload: CloseJobWorkOrderPayload): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>(`/job-work/${id}/close`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<CreateJobWorkOrderPayload> & { vehicleNumber?: string; driverName?: string; remarks?: string }): Promise<JobWorkOrder> {
    return await apiClient<JobWorkOrder>(`/job-work/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(`/job-work/${id}`, {
      method: 'DELETE',
    });
  },

  async getReturnRegister(params?: { search?: string; page?: number; limit?: number }): Promise<ReturnRegisterResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return await apiClient<ReturnRegisterResponse>(`/job-work/returns?${query.toString()}`);
  },

  async getCompanies(params?: { includeInactive?: boolean }): Promise<JobWorkCompany[]> {
    const query = new URLSearchParams();
    if (params?.includeInactive !== undefined) {
      query.append('includeInactive', String(params.includeInactive));
    }
    return await apiClient<JobWorkCompany[]>(`/job-work/companies${query.toString() ? `?${query.toString()}` : ''}`);
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
    return await apiClient<RawMaterialItem[]>('/job-work/materials');
  },
};
