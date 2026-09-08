import { apiClient } from './api-client';
import {
  GreyFabricCosting,
  CreateFabricCostingInput,
  FabricCostingStats,
  FabricCostingListResponse,
  FabricCostingCalculationResult,
} from '@/types/fabric-costing.types';

export const fabricCostingService = {
  async getAll(params: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<FabricCostingListResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient<FabricCostingListResponse>(`/fabric-costing${queryString}`);
  },

  async getById(id: string): Promise<GreyFabricCosting> {
    return apiClient<GreyFabricCosting>(`/fabric-costing/${id}`);
  },

  async create(data: CreateFabricCostingInput): Promise<GreyFabricCosting> {
    return apiClient<GreyFabricCosting>('/fabric-costing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async calculatePreview(data: CreateFabricCostingInput): Promise<FabricCostingCalculationResult> {
    return apiClient<FabricCostingCalculationResult>('/fabric-costing/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getStats(): Promise<FabricCostingStats> {
    return apiClient<FabricCostingStats>('/fabric-costing/stats');
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient<{ success: boolean; message: string }>(`/fabric-costing/${id}`, {
      method: 'DELETE',
    });
  },
};
