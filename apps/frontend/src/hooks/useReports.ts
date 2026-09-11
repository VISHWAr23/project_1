import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { ReportQueryFilter } from '@/types/reports.types';

export function useJobWorkCompanyReport(params?: ReportQueryFilter) {
  return useQuery({
    queryKey: ['jobWorkCompanyReport', params],
    queryFn: () => reportsService.getJobWorkCompanyReport(params),
  });
}

export function useStockValuationReport() {
  return useQuery({
    queryKey: ['stockValuationReport'],
    queryFn: () => reportsService.getStockValuationReport(),
  });
}

export function useProductionEfficiencyReport(params?: ReportQueryFilter) {
  return useQuery({
    queryKey: ['productionEfficiencyReport', params],
    queryFn: () => reportsService.getProductionEfficiencyReport(params),
  });
}

export function usePayrollExpenseReport(params?: ReportQueryFilter) {
  return useQuery({
    queryKey: ['payrollExpenseReport', params],
    queryFn: () => reportsService.getPayrollExpenseReport(params),
  });
}

export function useCustomerOrdersReport(params?: ReportQueryFilter) {
  return useQuery({
    queryKey: ['customerOrdersReport', params],
    queryFn: () => reportsService.getCustomerOrdersReport(params),
  });
}

export function useExecutiveOverview(params?: ReportQueryFilter) {
  return useQuery({
    queryKey: ['executiveOverviewReport', params],
    queryFn: () => reportsService.getExecutiveOverview(params),
  });
}
