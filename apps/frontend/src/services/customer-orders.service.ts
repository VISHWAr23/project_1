import { apiClient } from './api-client';
import {
  CustomerOrder,
  CustomerOrderStats,
  CustomerOrderListResponse,
  CreateCustomerOrderPayload,
  RecordOrderDispatchPayload,
  CustomerOrderQueryFilters,
} from '@/types/customer-orders.types';

export const customerOrdersService = {
  async getAll(params?: CustomerOrderQueryFilters): Promise<CustomerOrderListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return await apiClient<CustomerOrderListResponse>(`/customer-orders?${query.toString()}`);
  },

  async getStats(): Promise<CustomerOrderStats> {
    return await apiClient<CustomerOrderStats>('/customer-orders/stats');
  },

  async getById(id: string): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}`);
  },

  async create(payload: CreateCustomerOrderPayload): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>('/customer-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<CreateCustomerOrderPayload>): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateStatus(id: string, payload: { status: string; notes?: string }): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async recordDispatch(id: string, payload: RecordOrderDispatchPayload): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}/dispatch`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async recordPayment(
    id: string,
    payload: { amount: number; paymentMethod?: string; paymentStatus?: string; notes?: string }
  ): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return await apiClient<{ message: string }>(`/customer-orders/${id}`, {
      method: 'DELETE',
    });
  },
};
