import { apiClient } from './api-client';
import {
  SalaryDashboardSummary,
  PayrollRun,
  PayrollItem,
  GeneratePayrollPayload,
  UpdatePayrollItemAdjustmentPayload,
  RecordSalaryPaymentPayload,
  SalaryHistoryRecord,
  PayrollStatus,
} from '@/types/salary.types';

export const salaryService = {
  getDashboardSummary: async (): Promise<SalaryDashboardSummary> => {
    return apiClient<SalaryDashboardSummary>('/salary/dashboard');
  },

  getAll: async (params?: {
    month?: number;
    year?: number;
    status?: PayrollStatus;
    page?: number;
    limit?: number;
  }): Promise<{ items: PayrollRun[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
    const query = new URLSearchParams();
    if (params?.month) query.append('month', params.month.toString());
    if (params?.year) query.append('year', params.year.toString());
    if (params?.status && params.status !== ('ALL' as any)) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/salary${queryString}`);
  },

  getById: async (id: string): Promise<PayrollRun> => {
    return apiClient<PayrollRun>(`/salary/${id}`);
  },

  generatePayroll: async (payload: GeneratePayrollPayload): Promise<PayrollRun> => {
    return apiClient<PayrollRun>('/salary/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateAdjustment: async (itemId: string, payload: UpdatePayrollItemAdjustmentPayload): Promise<PayrollItem> => {
    return apiClient<PayrollItem>(`/salary/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  approvePayroll: async (id: string): Promise<PayrollRun> => {
    return apiClient<PayrollRun>(`/salary/${id}/approve`, {
      method: 'POST',
    });
  },

  cancelPayroll: async (id: string): Promise<PayrollRun> => {
    return apiClient<PayrollRun>(`/salary/${id}/cancel`, {
      method: 'POST',
    });
  },

  recordPayment: async (payload: RecordSalaryPaymentPayload): Promise<any> => {
    return apiClient(`/salary/items/${payload.payrollItemId}/payment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getSalarySlip: async (itemId: string): Promise<PayrollItem> => {
    return apiClient<PayrollItem>(`/salary/items/${itemId}/slip`);
  },

  getHistory: async (params?: { employeeId?: string; year?: number }): Promise<SalaryHistoryRecord[]> => {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.year) query.append('year', params.year.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/salary/history${queryString}`);
  },
};
