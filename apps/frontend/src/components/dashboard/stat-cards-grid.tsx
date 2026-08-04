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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {/* 1. Total Employees */}
      <StatCard
        title="Total Employees"
        value={summary ? `${summary.totalEmployees} Staff` : '112 Staff'}
        icon={<Users className="h-5 w-5" />}
        description="98.2% Present Today"
        trend={{ value: summary?.totalEmployeesChange || 3.8, isPositive: true }}
        colorTheme="blue"
        isLoading={isLoading}
      />

      {/* 2. Job Working Companies */}
      <StatCard
        title="Job Work Vendors"
        value={summary ? `${summary.jobWorkCompanies} Vendors` : '14 Vendors'}
        icon={<Building2 className="h-5 w-5" />}
        description={`${summary?.activeJobChallans || 8} Active Challans`}
        colorTheme="purple"
        isLoading={isLoading}
      />

      {/* 3. Raw Materials */}
      <StatCard
        title="Raw Materials"
        value={summary ? `${summary.rawMaterialsCount} SKUs` : '342 SKUs'}
        icon={<Package className="h-5 w-5" />}
        description={
          summary
            ? `Valued at ₹ ${(summary.totalStockValuation / 100000).toFixed(2)} Lakhs`
            : 'Valued at ₹ 48.25 Lakhs'
        }
        colorTheme="emerald"
        isLoading={isLoading}
      />

      {/* 4. Finished Products */}
      <StatCard
        title="Finished Products"
        value={summary ? `${summary.finishedProductsCount} Items` : '86 Items'}
        icon={<Boxes className="h-5 w-5" />}
        description="Ready for Dispatch"
        colorTheme="indigo"
        isLoading={isLoading}
      />

      {/* 5. Today's Production */}
      <StatCard
        title="Today's Production"
        value={summary ? `${summary.todayProduction.toLocaleString()} Units` : '1,450 Units'}
        icon={<TrendingUp className="h-5 w-5" />}
        description="Target Met"
        trend={{ value: summary?.todayProductionChange || 12.5, isPositive: true }}
        colorTheme="cyan"
        isLoading={isLoading}
      />

      {/* 6. Today's Material Issues */}
      <StatCard
        title="Today's Material Issues"
        value={
          summary
            ? `₹ ${(summary.todayMaterialIssues / 1000).toFixed(1)}k`
            : '₹ 128.4k'
        }
        icon={<ArrowUpRight className="h-5 w-5" />}
        description={`${summary?.todayMaterialIssuesCount || 14} Requisitions`}
        colorTheme="amber"
        isLoading={isLoading}
      />

      {/* 7. Product Returns */}
      <StatCard
        title="Product Returns"
        value={summary ? `${summary.productReturns} Units` : '12 Units'}
        icon={<RotateCcw className="h-5 w-5" />}
        description={`${summary?.rejectionRate || 0.8}% Rejection Rate`}
        trend={{ value: -0.2, isPositive: true }}
        colorTheme="rose"
        isLoading={isLoading}
      />

      {/* 8. Pending Work Orders */}
      <StatCard
        title="Pending Work Orders"
        value={summary ? `${summary.pendingWorkOrders} Orders` : '18 Orders'}
        icon={<Clock className="h-5 w-5" />}
        description={`${summary?.highPriorityPendingOrders || 4} High Priority`}
        colorTheme="orange"
        isLoading={isLoading}
      />

      {/* 9. Completed Work Orders */}
      <StatCard
        title="Completed Work Orders"
        value={summary ? `${summary.completedWorkOrders} Orders` : '142 Orders'}
        icon={<CheckCircle2 className="h-5 w-5" />}
        description={`${summary?.completedThisMonth || 38} Completed this month`}
        colorTheme="green"
        isLoading={isLoading}
      />

      {/* 10. Low Stock Items */}
      <StatCard
        title="Low Stock Items"
        value={summary ? `${summary.lowStockCount} SKUs` : '7 SKUs'}
        icon={<AlertTriangle className="h-5 w-5" />}
        description="Action Required: Reorder"
        colorTheme="red"
        isLoading={isLoading}
      />
    </div>
  );
};
