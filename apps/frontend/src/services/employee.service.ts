import { apiClient } from './api-client';
import {
  Employee,
  Department,
  Designation,
  EmployeeDocument,
  EmployeeListResponse,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  UploadDocumentPayload,
} from '@/types/employee.types';

export const employeeService = {
  async getAll(params?: {
    search?: string;
    departmentId?: string;
    designationId?: string;
    status?: string;
    employmentType?: string;
    page?: number;
    limit?: number;
  }): Promise<EmployeeListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.designationId) query.append('designationId', params.designationId);
    if (params?.status) query.append('status', params.status);
    if (params?.employmentType) query.append('employmentType', params.employmentType);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return await apiClient<EmployeeListResponse>(`/employees?${query.toString()}`);
  },

  async getById(id: string): Promise<Employee> {
    return await apiClient<Employee>(`/employees/${id}`);
  },

  async create(payload: CreateEmployeePayload): Promise<Employee> {
    return await apiClient<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpdateEmployeePayload): Promise<Employee> {
    return await apiClient<Employee>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async softDelete(id: string): Promise<{ message: string; id: string }> {
    return await apiClient<{ message: string; id: string }>(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  async getDepartments(): Promise<Department[]> {
    return await apiClient<Department[]>('/employees/departments');
  },

  async createDepartment(payload: { name: string; code?: string; description?: string }): Promise<Department> {
    return await apiClient<Department>('/employees/departments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateDepartment(id: string, payload: { name?: string; code?: string; description?: string }): Promise<Department> {
    return await apiClient<Department>(`/employees/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(`/employees/departments/${id}`, {
      method: 'DELETE',
    });
  },

  async getDesignations(): Promise<Designation[]> {
    return await apiClient<Designation[]>('/employees/designations');
  },

  async createDesignation(payload: { name: string; code?: string; description?: string }): Promise<Designation> {
    return await apiClient<Designation>('/employees/designations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateDesignation(id: string, payload: { name?: string; code?: string; description?: string }): Promise<Designation> {
    return await apiClient<Designation>(`/employees/designations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteDesignation(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient<{ success: boolean; message: string }>(`/employees/designations/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadDocument(employeeId: string, payload: UploadDocumentPayload): Promise<EmployeeDocument> {
    return await apiClient<EmployeeDocument>(`/employees/${employeeId}/documents`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteDocument(docId: string): Promise<{ message: string; id: string }> {
    return await apiClient<{ message: string; id: string }>(`/employees/documents/${docId}`, {
      method: 'DELETE',
    });
  },

  async getFinancialSummary(employeeId: string): Promise<any> {
    return await apiClient<any>(`/employees/${employeeId}/financial-summary`);
  },

  async createAdvance(employeeId: string, payload: any): Promise<any> {
    return await apiClient<any>(`/employees/${employeeId}/advances`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async repayAdvance(employeeId: string, payload: any): Promise<any> {
    return await apiClient<any>(`/employees/${employeeId}/repay-advance`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async settlePayment(employeeId: string, payload: any): Promise<any> {
    return await apiClient<any>(`/employees/${employeeId}/settle-payment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getPaymentHistory(employeeId: string): Promise<any> {
    return await apiClient<any>(`/employees/${employeeId}/payment-history`);
  },

  async getReport(
    employeeId: string,
    params?: { startDate?: string; endDate?: string; month?: number; year?: number }
  ): Promise<any> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.month) query.append('month', String(params.month));
    if (params?.year) query.append('year', String(params.year));

    return await apiClient<any>(`/employees/${employeeId}/report?${query.toString()}`);
  },
};

