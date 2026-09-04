import { apiClient } from './api-client';
import {
  Customer,
  CustomerStats,
  CustomerListResponse,
  CreateCustomerPayload,
  CustomerQueryFilters,
} from '@/types/customers.types';

export const customersService = {
  async getAll(params?: CustomerQueryFilters): Promise<CustomerListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.customerType) query.append('customerType', params.customerType);
    if (params?.isActive !== undefined) query.append('isActive', params.isActive);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return await apiClient<CustomerListResponse>(`/customers?${query.toString()}`);
  },

  async getStats(): Promise<CustomerStats> {
    return await apiClient<CustomerStats>('/customers/stats');
  },

  async getById(id: string): Promise<Customer> {
    return await apiClient<Customer>(`/customers/${id}`);
  },

  async create(payload: CreateCustomerPayload): Promise<Customer> {
    return await apiClient<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<CreateCustomerPayload>): Promise<Customer> {
    return await apiClient<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return await apiClient<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};
