'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  RefreshCw,
  Plus,
  TrendingUp,
  Package,
  Users,
  FileText,
  Truck,
  BarChart3,
  LineChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useQueryClient } from '@tanstack/react-query';

// Hooks
import {
  useDashboardSummary,
  useDashboardCharts,
  useLowStockItems,
  usePendingJobs,
  useRecentWorkOrders,
  useDashboardActivities,
  useLatestEmployees,
  dashboardKeys,
} from '@/hooks/dashboard/use-dashboard';

// Components
import { StatCardsGrid } from '@/components/dashboard/stat-cards-grid';
import { ChartCard } from '@/components/dashboard/chart-card';
import { MonthlyProductionChart } from '@/components/dashboard/charts/monthly-production-chart';
import { MaterialUsageChart } from '@/components/dashboard/charts/material-usage-chart';
import { EmployeeProductivityChart } from '@/components/dashboard/charts/employee-productivity-chart';
import { SalaryExpenseChart } from '@/components/dashboard/charts/salary-expense-chart';
import { InventoryStatusChart } from '@/components/dashboard/charts/inventory-status-chart';
import { DailyProductionTrendChart } from '@/components/dashboard/charts/daily-production-trend-chart';
import { MonthlyPurchaseTrendChart } from '@/components/dashboard/charts/monthly-purchase-trend-chart';

import { LowStockTable } from '@/components/dashboard/tables/low-stock-table';
import { PendingJobsTable } from '@/components/dashboard/tables/pending-jobs-table';
import { RecentWorkOrdersTable } from '@/components/dashboard/tables/recent-work-orders-table';

import { RecentActivities } from '@/components/dashboard/widgets/recent-activities';
import { LatestEmployees } from '@/components/dashboard/widgets/latest-employees';
import { QuickActionsCard } from '@/components/dashboard/widgets/quick-actions-card';

import { DashboardSkeleton } from '@/components/dashboard/states/dashboard-skeleton';
import { DashboardErrorCard } from '@/components/dashboard/states/dashboard-error-card';

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Queries
  const summaryQuery = useDashboardSummary();
  const chartsQuery = useDashboardCharts();
  const lowStockQuery = useLowStockItems();
  const pendingJobsQuery = usePendingJobs();
  const recentOrdersQuery = useRecentWorkOrders();
  const activitiesQuery = useDashboardActivities();
  const latestEmployeesQuery = useLatestEmployees();

  const handleSyncLedger = () => {
    setIsSyncing(true);
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    setTimeout(() => {
      setIsSyncing(false);
      toast('Ledger Synced', 'All inventory valuation & operational telemetry updated from backend', 'success');
    }, 800);
  };

  const isAnyError = summaryQuery.isError || chartsQuery.isError;
  const isLoadingAll = summaryQuery.isLoading && chartsQuery.isLoading;

  if (isLoadingAll) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-8"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Executive Dashboard</h1>
            <Badge variant="success" icon={<Activity className="h-3 w-3 animate-pulse" />}>
              LIVE LEDGER
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time operations overview, stock valuations, shop-floor production trends, and workforce metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            isLoading={isSyncing}
            onClick={handleSyncLedger}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Sync Ledger
          </Button>
          {/* <Button
            variant="primary"
            size="sm"
            onClick={() => setIsIssueModalOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            New Material Issue
          </Button> */}
        </div>
      </div>

      {isAnyError && (
        <DashboardErrorCard
          onRetry={() => {
            summaryQuery.refetch();
            chartsQuery.refetch();
          }}
        />
      )}

      {/* 2. Summary Cards Grid (10 KPI Cards) */}
      <StatCardsGrid summary={summaryQuery.data} isLoading={summaryQuery.isLoading} />

      {/* 3. Primary Charts Row (Production & Material Usage) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Production Output"
            description="Planned target vs actual completed output units"
            badgeText="2026 YTD"
            icon={<TrendingUp className="h-4 w-4 text-[#3ECF8E]" />}
            isLoading={chartsQuery.isLoading}
          >
            <MonthlyProductionChart data={chartsQuery.data?.monthlyProduction} height={260} />
          </ChartCard>
        </div>

        <div>
          <ChartCard
            title="Material Usage Category Share"
            description="Raw material consumption distribution"
            badgeText="Categories"
            icon={<Package className="h-4 w-4 text-blue-500" />}
            isLoading={chartsQuery.isLoading}
          >
            <MaterialUsageChart data={chartsQuery.data?.materialUsage} height={210} />
          </ChartCard>
        </div>
      </div>

      {/* 4. Secondary Analytical Charts Row (Productivity, Salary, Inventory Status) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Employee Efficiency %"
          description="Shop-floor performance by department"
          badgeText="Workforce"
          icon={<Users className="h-4 w-4 text-purple-500" />}
          isLoading={chartsQuery.isLoading}
        >
          <EmployeeProductivityChart data={chartsQuery.data?.employeeProductivity} height={240} />
        </ChartCard>

        <ChartCard
          title="Monthly Payroll Expense"
          description="Gross payroll & deduction trends"
          badgeText="Financial"
          icon={<FileText className="h-4 w-4 text-blue-500" />}
          isLoading={chartsQuery.isLoading}
        >
          <SalaryExpenseChart data={chartsQuery.data?.salaryExpense} height={240} />
        </ChartCard>

        <ChartCard
          title="Inventory Status Breakdown"
          description="Stock levels across raw material categories"
          badgeText="Stock Levels"
          icon={<BarChart3 className="h-4 w-4 text-amber-500" />}
          isLoading={chartsQuery.isLoading}
        >
          <InventoryStatusChart data={chartsQuery.data?.inventoryStatus} height={240} />
        </ChartCard>
      </div>

      {/* 5. Additional Trends Row (Daily Production & Monthly Purchase Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Daily Production Trend (30 Days)"
          description="Smoothed daily output rate on main shop-floor"
          badgeText="Daily Spline"
          icon={<LineChart className="h-4 w-4 text-emerald-500" />}
          isLoading={chartsQuery.isLoading}
        >
          <DailyProductionTrendChart data={chartsQuery.data?.dailyProductionTrend} height={240} />
        </ChartCard>

        <ChartCard
          title="Monthly Purchase Procurement Trend"
          description="Raw material purchase order spend & volume"
          badgeText="Procurement"
          icon={<Truck className="h-4 w-4 text-indigo-500" />}
          isLoading={chartsQuery.isLoading}
        >
          <MonthlyPurchaseTrendChart data={chartsQuery.data?.monthlyPurchaseTrend} height={240} />
        </ChartCard>
      </div>

      {/* 6. Operational Data Tables Row (Low Stock Alert & Pending Work Orders) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LowStockTable items={lowStockQuery.data} isLoading={lowStockQuery.isLoading} />
        </div>
        <div>
          <PendingJobsTable items={pendingJobsQuery.data} isLoading={pendingJobsQuery.isLoading} />
        </div>
      </div>

      {/* 7. Recent Work Orders & Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <RecentWorkOrdersTable items={recentOrdersQuery.data} isLoading={recentOrdersQuery.isLoading} />
        </div>
        <div>
          <RecentActivities items={activitiesQuery.data} isLoading={activitiesQuery.isLoading} />
        </div>
        <div>
          <LatestEmployees items={latestEmployeesQuery.data} isLoading={latestEmployeesQuery.isLoading} />
        </div>
      </div>

      {/* 8. Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <QuickActionsCard onOpenMaterialIssueModal={() => setIsIssueModalOpen(true)} />
        </div>
      </div>

      {/* New Material Issue Requisition Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="New Material Issue Request"
        description="Disburse raw materials to active shop-floor work order"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsIssueModalOpen(false);
            toast('Material Issue Created', 'WO-2026-090 material requisition successfully processed', 'success');
          }}
          className="space-y-4"
        >
          <Input label="Work Order Reference" placeholder="WO-2026-090" required />
          <Select
            label="Select Raw Material SKU"
            options={[
              { label: 'RM-ALU-001 - Aluminum Sheet Grade 6061', value: 'RM-ALU-001' },
              { label: 'RM-STL-045 - Stainless Steel Rod 12mm', value: 'RM-STL-045' },
              { label: 'RM-COP-012 - Copper Wire Heavy Gauge', value: 'RM-COP-012' },
            ]}
          />
          <Input label="Disbursement Quantity" type="number" placeholder="100" required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Disburse Stock
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
