import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard/dashboard.service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  charts: () => [...dashboardKeys.all, 'charts'] as const,
  lowStock: () => [...dashboardKeys.all, 'low-stock'] as const,
  pendingJobs: () => [...dashboardKeys.all, 'pending-jobs'] as const,
  recentWorkOrders: () => [...dashboardKeys.all, 'recent-work-orders'] as const,
  activities: () => [...dashboardKeys.all, 'activities'] as const,
  latestEmployees: () => [...dashboardKeys.all, 'latest-employees'] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getSummary(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: dashboardKeys.charts(),
    queryFn: () => dashboardService.getChartsData(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: dashboardKeys.lowStock(),
    queryFn: () => dashboardService.getLowStockItems(),
    staleTime: 30000,
  });
}

export function usePendingJobs() {
  return useQuery({
    queryKey: dashboardKeys.pendingJobs(),
    queryFn: () => dashboardService.getPendingJobs(),
    staleTime: 30000,
  });
}

export function useRecentWorkOrders() {
  return useQuery({
    queryKey: dashboardKeys.recentWorkOrders(),
    queryFn: () => dashboardService.getRecentWorkOrders(),
    staleTime: 30000,
  });
}

export function useDashboardActivities() {
  return useQuery({
    queryKey: dashboardKeys.activities(),
    queryFn: () => dashboardService.getActivities(),
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

export function useLatestEmployees() {
  return useQuery({
    queryKey: dashboardKeys.latestEmployees(),
    queryFn: () => dashboardService.getLatestEmployees(),
    staleTime: 60000,
  });
}
