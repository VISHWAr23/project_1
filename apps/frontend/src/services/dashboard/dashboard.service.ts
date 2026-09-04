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
    return await apiClient<DashboardSummary>('/dashboard/summary');
  },

  getChartsData: async (): Promise<DashboardChartsData> => {
    return await apiClient<DashboardChartsData>('/dashboard/charts');
  },

  getLowStockItems: async (): Promise<LowStockItem[]> => {
    return await apiClient<LowStockItem[]>('/dashboard/low-stock');
  },

  getPendingJobs: async (): Promise<PendingJobWorkOrder[]> => {
    return await apiClient<PendingJobWorkOrder[]>('/dashboard/pending-jobs');
  },

  getRecentWorkOrders: async (): Promise<RecentWorkOrder[]> => {
    return await apiClient<RecentWorkOrder[]>('/dashboard/recent-work-orders');
  },

  getActivities: async (): Promise<DashboardActivity[]> => {
    return await apiClient<DashboardActivity[]>('/dashboard/activities');
  },

  getLatestEmployees: async (): Promise<LatestEmployee[]> => {
    return await apiClient<LatestEmployee[]>('/dashboard/latest-employees');
  },
};
