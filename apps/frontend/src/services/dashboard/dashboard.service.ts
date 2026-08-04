import { apiClient } from '../api-client';
import {
  DashboardSummary,
  DashboardChartsData,
  LowStockItem,
  PendingJobWorkOrder,
  RecentWorkOrder,
  DashboardActivity,
  LatestEmployee,
} from '@/types/dashboard/dashboard.types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    return apiClient<DashboardSummary>('/dashboard/summary');
  },

  getChartsData: async (): Promise<DashboardChartsData> => {
    return apiClient<DashboardChartsData>('/dashboard/charts');
  },

  getLowStockItems: async (): Promise<LowStockItem[]> => {
    return apiClient<LowStockItem[]>('/dashboard/low-stock');
  },

  getPendingJobs: async (): Promise<PendingJobWorkOrder[]> => {
    return apiClient<PendingJobWorkOrder[]>('/dashboard/pending-jobs');
  },

  getRecentWorkOrders: async (): Promise<RecentWorkOrder[]> => {
    return apiClient<RecentWorkOrder[]>('/dashboard/recent-work-orders');
  },

  getActivities: async (): Promise<DashboardActivity[]> => {
    return apiClient<DashboardActivity[]>('/dashboard/activities');
  },

  getLatestEmployees: async (): Promise<LatestEmployee[]> => {
    return apiClient<LatestEmployee[]>('/dashboard/latest-employees');
  },
};
