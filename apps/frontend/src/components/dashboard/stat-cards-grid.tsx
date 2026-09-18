import React from 'react';
import {
  Users,
  Building2,
  Package,
  Boxes,
  TrendingUp,
  ArrowUpRight,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from './stat-card';
import { DashboardSummary } from '@/types/dashboard/dashboard.types';

interface StatCardsGridProps {
  summary?: DashboardSummary;
  isLoading?: boolean;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = ({ summary, isLoading }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
      {/* 1. Total Employees */}
      <StatCard
        title="Total Employees"
        value={summary ? `${summary.totalEmployees} Staff` : '0 Staff'}
        icon={<Users className="h-5 w-5" />}
        description={summary?.totalEmployees ? `${summary.totalEmployees} Active in System` : 'No employees registered'}
        trend={summary?.totalEmployeesChange ? { value: summary.totalEmployeesChange, isPositive: true } : undefined}
        colorTheme="emerald"
        isLoading={isLoading}
      />

      {/* 2. Job Working Companies */}
      <StatCard
        title="Job Work Vendors"
        value={summary ? `${summary.jobWorkCompanies} Vendors` : '0 Vendors'}
        icon={<Building2 className="h-5 w-5" />}
        description={`${summary?.activeJobChallans ?? 0} Active Challans`}
        colorTheme="purple"
        isLoading={isLoading}
      />

      {/* 3. Raw Materials */}
      <StatCard
        title="Raw Materials"
        value={summary ? `${summary.rawMaterialsCount} SKUs` : '0 SKUs'}
        icon={<Package className="h-5 w-5" />}
        description={
          summary && summary.totalStockValuation > 0
            ? `Valued at ₹ ${(summary.totalStockValuation / 100000).toFixed(2)} Lakhs`
            : 'Valued at ₹ 0.00 Lakhs'
        }
        colorTheme="emerald"
        isLoading={isLoading}
      />

      {/* 4. Finished Products */}
      <StatCard
        title="Finished Products"
        value={summary ? `${summary.finishedProductsCount} Items` : '0 Items'}
        icon={<Boxes className="h-5 w-5" />}
        description={summary?.finishedProductsCount ? 'Ready for Dispatch' : 'Nil in Stock'}
        colorTheme="indigo"
        isLoading={isLoading}
      />

      {/* 5. Today's Production */}
      <StatCard
        title="Today's Production"
        value={summary ? `${summary.todayProduction.toLocaleString()} Units` : '0 Units'}
        icon={<TrendingUp className="h-5 w-5" />}
        description={summary && summary.todayProduction > 0 ? 'Production Recorded' : 'Nil Today'}
        trend={summary?.todayProductionChange ? { value: summary.todayProductionChange, isPositive: true } : undefined}
        colorTheme="cyan"
        isLoading={isLoading}
      />

      {/* 6. Today's Material Issues */}
      <StatCard
        title="Today's Material Issues"
        value={
          summary && summary.todayMaterialIssues > 0
            ? `₹ ${(summary.todayMaterialIssues / 1000).toFixed(1)}k`
            : '₹ 0.0k'
        }
        icon={<ArrowUpRight className="h-5 w-5" />}
        description={`${summary?.todayMaterialIssuesCount ?? 0} Requisitions`}
        colorTheme="amber"
        isLoading={isLoading}
      />

      {/* 7. Product Returns */}
      <StatCard
        title="Product Returns"
        value={summary ? `${summary.productReturns} Units` : '0 Units'}
        icon={<RotateCcw className="h-5 w-5" />}
        description={`${summary?.rejectionRate ?? 0}% Rejection Rate`}
        colorTheme="rose"
        isLoading={isLoading}
      />

      {/* 8. Pending Work Orders */}
      <StatCard
        title="Pending Work Orders"
        value={summary ? `${summary.pendingWorkOrders} Orders` : '0 Orders'}
        icon={<Clock className="h-5 w-5" />}
        description={`${summary?.highPriorityPendingOrders ?? 0} High Priority`}
        colorTheme="orange"
        isLoading={isLoading}
      />

      {/* 9. Completed Work Orders */}
      <StatCard
        title="Completed Work Orders"
        value={summary ? `${summary.completedWorkOrders} Orders` : '0 Orders'}
        icon={<CheckCircle2 className="h-5 w-5" />}
        description={`${summary?.completedThisMonth ?? 0} Completed this month`}
        colorTheme="green"
        isLoading={isLoading}
      />

      {/* 10. Low Stock Items */}
      <StatCard
        title="Low Stock Items"
        value={summary ? `${summary.lowStockCount} SKUs` : '0 SKUs'}
        icon={<AlertTriangle className="h-5 w-5" />}
        description={summary && summary.lowStockCount > 0 ? 'Action Required: Reorder' : 'All Stock Healthy'}
        colorTheme={summary && summary.lowStockCount > 0 ? 'red' : 'emerald'}
        isLoading={isLoading}
      />
    </div>
  );
};

