import { apiClient } from './api-client';
import {
  AttendanceRecord,
  AttendanceListResponse,
  TodayAttendanceStats,
  MonthSummaryResponse,
  CreateAttendancePayload,
  BulkAttendancePayload,
  UpdateAttendancePayload,
} from '@/types/attendance.types';

export const attendanceService = {
  async getAll(params?: {
    date?: string;
    search?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<AttendanceListResponse> {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.search) query.append('search', params.search);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    return await apiClient<AttendanceListResponse>(`/attendance?${query.toString()}`);
  },

  async getTodaySummary(date?: string): Promise<TodayAttendanceStats> {
    const query = date ? `?date=${date}` : '';
    return await apiClient<TodayAttendanceStats>(`/attendance/today${query}`);
  },

  async getMonthSummary(month: number, year: number, departmentId?: string): Promise<MonthSummaryResponse> {
    const query = new URLSearchParams();
    query.append('month', String(month));
    query.append('year', String(year));
    if (departmentId) query.append('departmentId', departmentId);

    return await apiClient<MonthSummaryResponse>(`/attendance/month?${query.toString()}`);
  },

  async getEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string): Promise<{ employee: any; logs: AttendanceRecord[] }> {
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    return await apiClient<{ employee: any; logs: AttendanceRecord[] }>(`/attendance/employee/${employeeId}?${query.toString()}`);
  },

  async create(payload: CreateAttendancePayload): Promise<AttendanceRecord> {
    return await apiClient<AttendanceRecord>('/attendance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async bulkCreate(payload: BulkAttendancePayload): Promise<{ message: string; processedCount: number; records: AttendanceRecord[] }> {
    return await apiClient<{ message: string; processedCount: number; records: AttendanceRecord[] }>('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpdateAttendancePayload): Promise<AttendanceRecord> {
    return await apiClient<AttendanceRecord>(`/attendance/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<{ message: string; id: string }> {
    return await apiClient<{ message: string; id: string }>(`/attendance/${id}`, {
      method: 'DELETE',
    });
  },
};
