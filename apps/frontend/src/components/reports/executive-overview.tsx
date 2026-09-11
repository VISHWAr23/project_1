'use client';

import React from 'react';
import {
  Building2,
  PackageCheck,
  Factory,
  Users,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Scale,
  FileDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExecutiveOverviewResponse } from '@/types/reports.types';
import { exportExecutiveOverviewPDF } from '@/lib/reports-pdf-export';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface ExecutiveOverviewViewProps {
  data?: ExecutiveOverviewResponse;
  isLoading: boolean;
  onNavigateTab: (tabId: string) => void;
}

export function ExecutiveOverviewView({ data, isLoading, onNavigateTab }: ExecutiveOverviewViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-32 bg-muted/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-sm">No overview metrics available.</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalJobWorkOrders: 0,
    jobWorkIssuedKg: 0,
    jobWorkReturnedKg: 0,
    jobWorkWagesEarned: 0,
    jobWorkPendingSettlement: 0,
    totalInventoryValuation: 0,
    lowStockAlertCount: 0,
    productionYieldRate: 100,
    totalBatches: 0,
    payrollDisbursed: 0,
    activeStaffCount: 0,
    attendanceRate: 0,
    ordersRevenue: 0,
    orderFulfillmentRate: 100,
  };

  const handleExportPdf = () => {
    if (!data) return;
    exportExecutiveOverviewPDF(data);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Executive Operations & Scorecard
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Holistic plant performance across job-work, inventory valuation, yields, payroll & sales
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
          className="text-xs gap-1.5 whitespace-nowrap self-end sm:self-auto text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <FileDown className="h-3.5 w-3.5 text-rose-500" />
          <span>Export Overview PDF</span>
        </Button>
      </div>

      {/* High-level Operational Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Job Work Subcontracting Hub (Featured) */}
        <Card hoverElevation className="p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Job Work Subcontracting</h3>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Core Module
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Orders Processed:</span>
                <span className="font-bold text-foreground">{formatNumber(kpis.totalJobWorkOrders)} orders</span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Material Returned:</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatNumber(kpis.jobWorkReturnedKg)} / {formatNumber(kpis.jobWorkIssuedKg)} Kg
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Wages Earned:</span>
                <span className="font-bold text-foreground">
                  ₹{formatCurrency(kpis.jobWorkWagesEarned)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs pt-1 border-t border-border">
                <span className="text-amber-600 font-medium">Pending Balance:</span>
                <span className="font-bold text-amber-600">
                  ₹{formatCurrency(kpis.jobWorkPendingSettlement)}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('job-work')}
            className="mt-4 w-full text-xs justify-between hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            <span>Open Job Work Company Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        {/* 2. Stock Valuation & Inventory */}
        <Card hoverElevation className="p-5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Stock Asset Valuation</h3>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Total Valuation:</span>
                <span className="font-bold text-lg text-foreground">
                  ₹{formatCurrency(kpis.totalInventoryValuation)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Safety Stock Alerts:</span>
                <span
                  className={`font-semibold ${
                    kpis.lowStockAlertCount > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600'
                  }`}
                >
                  {kpis.lowStockAlertCount} SKUs below reorder
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('stock-valuation')}
            className="mt-4 w-full text-xs justify-between hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            <span>Audit Inventory Valuation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        {/* 3. Production Yield & Efficiency */}
        <Card hoverElevation className="p-5 border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <Factory className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Production Efficiency</h3>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Plant Yield Rate:</span>
                <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                  {kpis.productionYieldRate}%
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Active/Completed Batches:</span>
                <span className="font-semibold text-foreground">{kpis.totalBatches} batches</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('production')}
            className="mt-4 w-full text-xs justify-between hover:bg-purple-500/10 text-purple-600 dark:text-purple-400"
          >
            <span>Review Production Yields</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        {/* 4. Workforce & Payroll Disbursements */}
        <Card hoverElevation className="p-5 border-l-4 border-l-emerald-600 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Workforce & Payroll</h3>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Active Staff Roster:</span>
                <span className="font-semibold text-foreground">{formatNumber(kpis.activeStaffCount)} staff</span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Average Attendance:</span>
                <span className="font-semibold text-emerald-600">{kpis.attendanceRate}%</span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Net Wages Disbursed:</span>
                <span className="font-bold text-foreground">
                  ₹{formatCurrency(kpis.payrollDisbursed)}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('payroll')}
            className="mt-4 w-full text-xs justify-between hover:bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
          >
            <span>View Payroll Statements</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>

        {/* 5. Commercial Orders & Fulfillment */}
        <Card hoverElevation className="p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Orders & Fulfillment</h3>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Total Booked Value:</span>
                <span className="font-bold text-foreground">
                  ₹{formatCurrency(kpis.ordersRevenue)}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">Fulfillment Rate:</span>
                <span className="font-bold text-emerald-600">{kpis.orderFulfillmentRate}%</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('customer-orders')}
            className="mt-4 w-full text-xs justify-between hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            <span>View Commercial Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}
