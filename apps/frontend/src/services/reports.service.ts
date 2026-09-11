import { apiClient } from './api-client';
import {
  ReportQueryFilter,
  JobWorkCompanyReportResponse,
  StockValuationReportResponse,
  ProductionEfficiencyReportResponse,
  PayrollExpenseReportResponse,
  CustomerOrdersReportResponse,
  ExecutiveOverviewResponse,
} from '@/types/reports.types';

function buildQueryString(params?: ReportQueryFilter): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.startDate) searchParams.append('startDate', params.startDate);
  if (params.endDate) searchParams.append('endDate', params.endDate);
  if (params.jobWorkCompanyId) searchParams.append('jobWorkCompanyId', params.jobWorkCompanyId);
  if (params.departmentId) searchParams.append('departmentId', params.departmentId);
  if (params.status) searchParams.append('status', params.status);
  if (params.search) searchParams.append('search', params.search);
  const q = searchParams.toString();
  return q ? `?${q}` : '';
}

export const reportsService = {
  async getJobWorkCompanyReport(params?: ReportQueryFilter): Promise<JobWorkCompanyReportResponse> {
    return apiClient<JobWorkCompanyReportResponse>(`/reports/job-work-company${buildQueryString(params)}`);
  },

  async getStockValuationReport(): Promise<StockValuationReportResponse> {
    return apiClient<StockValuationReportResponse>('/reports/stock-valuation');
  },

  async getProductionEfficiencyReport(params?: ReportQueryFilter): Promise<ProductionEfficiencyReportResponse> {
    return apiClient<ProductionEfficiencyReportResponse>(`/reports/production-efficiency${buildQueryString(params)}`);
  },

  async getPayrollExpenseReport(params?: ReportQueryFilter): Promise<PayrollExpenseReportResponse> {
    return apiClient<PayrollExpenseReportResponse>(`/reports/payroll-expenses${buildQueryString(params)}`);
  },

  async getCustomerOrdersReport(params?: ReportQueryFilter): Promise<CustomerOrdersReportResponse> {
    return apiClient<CustomerOrdersReportResponse>(`/reports/customer-orders${buildQueryString(params)}`);
  },

  async getExecutiveOverview(params?: ReportQueryFilter): Promise<ExecutiveOverviewResponse> {
    return apiClient<ExecutiveOverviewResponse>(`/reports/executive-summary${buildQueryString(params)}`);
  },
};
