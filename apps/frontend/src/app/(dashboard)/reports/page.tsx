'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  PackageCheck,
  Factory,
  Users,
  ShoppingBag,
  LayoutDashboard,
  FileBarChart,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { ReportDateRangeFilter, DateRangeState } from '@/components/reports/report-date-range-filter';
import { JobWorkCompanyReportView } from '@/components/reports/job-work-company-report';
import { StockValuationReportView } from '@/components/reports/stock-valuation-report';
import { ProductionEfficiencyReportView } from '@/components/reports/production-efficiency-report';
import { PayrollExpenseReportView } from '@/components/reports/payroll-expense-report';
import { CustomerOrdersReportView } from '@/components/reports/customer-orders-report';
import { ExecutiveOverviewView } from '@/components/reports/executive-overview';
import {
  useJobWorkCompanyReport,
  useStockValuationReport,
  useProductionEfficiencyReport,
  usePayrollExpenseReport,
  useCustomerOrdersReport,
  useExecutiveOverview,
} from '@/hooks/useReports';
import { useJobWorkCompanies } from '@/hooks/useJobWork';
import { exportAllReportsConsolidatedPDF } from '@/lib/reports-pdf-export';

export default function ReportsPage() {
  // Default to current month
  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState<DateRangeState>({
    startDate: firstDayStr,
    endDate: todayStr,
  });

  const [activeTab, setActiveTab] = useState<string>('job-work');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Fetch Companies list for dropdown
  const { data: companiesData } = useJobWorkCompanies();
  const companiesList = (companiesData || []).map((c) => ({
    id: c.id,
    companyName: c.companyName,
  }));

  // Fetch Reports Data based on active tab and filters
  const {
    data: jobWorkReport,
    isLoading: isJobWorkLoading,
    refetch: refetchJobWork,
  } = useJobWorkCompanyReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    jobWorkCompanyId: selectedCompanyId || undefined,
  });

  const {
    data: stockReport,
    isLoading: isStockLoading,
    refetch: refetchStock,
  } = useStockValuationReport();

  const {
    data: productionReport,
    isLoading: isProductionLoading,
    refetch: refetchProduction,
  } = useProductionEfficiencyReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const {
    data: payrollReport,
    isLoading: isPayrollLoading,
    refetch: refetchPayroll,
  } = usePayrollExpenseReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const {
    data: customerOrdersReport,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useCustomerOrdersReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const {
    data: overviewReport,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useExecutiveOverview({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const handleRefresh = () => {
    switch (activeTab) {
      case 'job-work':
        refetchJobWork();
        break;
      case 'overview':
        refetchOverview();
        break;
      case 'stock-valuation':
        refetchStock();
        break;
      case 'production':
        refetchProduction();
        break;
      case 'payroll':
        refetchPayroll();
        break;
      case 'customer-orders':
        refetchOrders();
        break;
    }
  };

  const isCurrentLoading =
    (activeTab === 'job-work' && isJobWorkLoading) ||
    (activeTab === 'overview' && isOverviewLoading) ||
    (activeTab === 'stock-valuation' && isStockLoading) ||
    (activeTab === 'production' && isProductionLoading) ||
    (activeTab === 'payroll' && isPayrollLoading) ||
    (activeTab === 'customer-orders' && isOrdersLoading);

  const handleDownloadAllReportsPdf = () => {
    exportAllReportsConsolidatedPDF({
      dateRange,
      overview: overviewReport,
      jobWork: jobWorkReport,
      stock: stockReport,
      production: productionReport,
      payroll: payrollReport,
      orders: customerOrdersReport,
    });
  };

  const tabs: TabItem[] = [
    {
      id: 'job-work',
      label: 'Job Work Company Ledger',
      icon: <Building2 className="h-4 w-4 text-emerald-500" />,
      count: jobWorkReport?.companies?.length,
    },
    {
      id: 'overview',
      label: 'Executive Overview',
      icon: <LayoutDashboard className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 'stock-valuation',
      label: 'Stock Valuation & Audit',
      icon: <PackageCheck className="h-4 w-4 text-amber-500" />,
      count: stockReport?.summary?.lowStockCount,
    },
    {
      id: 'production',
      label: 'Production Efficiency',
      icon: <Factory className="h-4 w-4 text-purple-500" />,
    },
    {
      id: 'payroll',
      label: 'Payroll & Expenses',
      icon: <Users className="h-4 w-4 text-emerald-600" />,
    },
    {
      id: 'customer-orders',
      label: 'Customer Orders',
      icon: <ShoppingBag className="h-4 w-4 text-indigo-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Reports & Analytics Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live IMS Ledger
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Subcontractor job-work volume & wages reconciliation, inventory valuation, production yields, and payroll statements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleDownloadAllReportsPdf}
            disabled={isCurrentLoading}
            className="gap-2 shadow-sm whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <FileDown className="h-4 w-4" />
            <span>Download All Reports (PDF)</span>
          </Button>
        </div>
      </div>

      {/* Date Range Controller (Global for all time-based reports) */}
      <ReportDateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        onRefresh={handleRefresh}
        isLoading={isCurrentLoading}
      />

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'job-work' && (
            <JobWorkCompanyReportView
              data={jobWorkReport}
              isLoading={isJobWorkLoading}
              selectedCompanyId={selectedCompanyId}
              onSelectCompanyId={setSelectedCompanyId}
              companiesList={companiesList}
            />
          )}

          {activeTab === 'overview' && (
            <ExecutiveOverviewView
              data={overviewReport}
              isLoading={isOverviewLoading}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'stock-valuation' && (
            <StockValuationReportView data={stockReport} isLoading={isStockLoading} />
          )}

          {activeTab === 'production' && (
            <ProductionEfficiencyReportView
              data={productionReport}
              isLoading={isProductionLoading}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollExpenseReportView data={payrollReport} isLoading={isPayrollLoading} />
          )}

          {activeTab === 'customer-orders' && (
            <CustomerOrdersReportView
              data={customerOrdersReport}
              isLoading={isOrdersLoading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
