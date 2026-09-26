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
  itemSource?: 'ALL' | 'MANUFACTURED' | 'TRADED';
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
    if (params?.itemSource && params.itemSource !== 'ALL') query.append('itemSource', params.itemSource);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return await apiClient<RawMaterialListResponse>(`/raw-materials?${query.toString()}`);
  },

  async getById(id: string): Promise<RawMaterial> {
    return await apiClient<RawMaterial>(`/raw-materials/${id}`);
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

    return await apiClient<{ items: InventoryTransactionItem[]; meta: any }>(`/raw-materials/history?${query.toString()}`);
  },

  async getCategories(): Promise<Category[]> {
    return await apiClient<Category[]>('/raw-materials/categories');
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
    return await apiClient<UnitOfMeasure[]>('/raw-materials/units');
  },

  async createUnit(name: string, abbreviation: string): Promise<UnitOfMeasure> {
    return await apiClient<UnitOfMeasure>('/raw-materials/units', {
      method: 'POST',
      body: JSON.stringify({ name, abbreviation }),
    });
  },

  async updateUnit(id: string, name: string, abbreviation: string): Promise<UnitOfMeasure> {
    return await apiClient<UnitOfMeasure>(`/raw-materials/units/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, abbreviation }),
    });
  },

  async deleteUnit(id: string): Promise<any> {
    return await apiClient<any>(`/raw-materials/units/${id}`, {
      method: 'DELETE',
    });
  },

  async getSuppliers(search?: string): Promise<Supplier[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return await apiClient<Supplier[]>(`/suppliers${query}`);
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
    return await apiClient<StorageLocation[]>(`/storage-locations${query}`);
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

