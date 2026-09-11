'use client';

import React from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Truck,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  FileDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerOrdersReportResponse } from '@/types/reports.types';
import { exportToCsv } from '@/lib/export-utils';
import { exportCustomerOrdersPDF } from '@/lib/reports-pdf-export';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface CustomerOrdersReportViewProps {
  data?: CustomerOrdersReportResponse;
  isLoading: boolean;
}

export function CustomerOrdersReportView({ data, isLoading }: CustomerOrdersReportViewProps) {
  const summary = data?.summary || {
    totalOrders: 0,
    fulfilledOrders: 0,
    pendingOrders: 0,
    fulfillmentRate: 100,
    totalRevenue: 0,
    deliveredRevenue: 0,
  };

  const topCustomers = Array.isArray(data?.topCustomers) ? data.topCustomers : [];
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const dateRange = data?.dateRange || {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };

  const handleExportCsv = () => {
    if (!orders.length) return;

    const rows = orders.map((o) => ({
      'Order Number': o.orderNumber || '—',
      'Customer Name': o.customerName || 'Walk-in Client',
      'Order Date': o.orderDate ? o.orderDate.split('T')[0] : '',
      'Delivery Due Date': o.deliveryDueDate ? o.deliveryDueDate.split('T')[0] : 'Not Specified',
      'Items Count': o.itemCount ?? 0,
      'Total Amount (₹)': o.totalAmount ?? 0,
      Status: o.status,
    }));

    exportToCsv(
      `Customer_Orders_Fulfillment_${dateRange.startDate}_to_${dateRange.endDate}`,
      rows
    );
  };

  const handleExportPdf = () => {
    if (!data) return;
    exportCustomerOrdersPDF(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-24 bg-muted/60 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-muted/40 rounded-xl"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-sm">No customer order data available for selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Orders Received
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">{summary.totalOrders}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {summary.fulfilledOrders} Delivered • {summary.pendingOrders} Active
          </div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Fulfillment Rate
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.fulfillmentRate}%
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Dispatched / Delivered ratio</div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Booked Value
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              ₹{formatCurrency(summary.totalRevenue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Gross customer orders</div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Delivered Revenue
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{formatCurrency(summary.deliveredRevenue)}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Completed fulfillment</div>
        </Card>
      </div>

      {/* Top Customers Leaderboard */}
      {topCustomers.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>Top Purchasing Clients</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {topCustomers.map((c, i) => (
              <div key={c.customerName} className="p-3 bg-muted/30 border border-border/70 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground truncate">{c.customerName}</span>
                  <Badge variant="neutral">#{i + 1}</Badge>
                </div>
                <div className="text-sm font-bold text-foreground mt-1">
                  ₹{formatCurrency(c.totalAmount)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatNumber(c.orderCount)} {c.orderCount === 1 ? 'order' : 'orders'} placed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Table Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Commercial Orders Register
        </h3>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="text-xs gap-1.5 whitespace-nowrap text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-500" />
            <span>Export Orders PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Orders CSV</span>
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card hoverElevation={false} className="overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Order Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Items</th>
                <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No customer orders found in this period.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      {o.orderNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {o.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {o.orderDate ? o.orderDate.split('T')[0] : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {o.deliveryDueDate ? o.deliveryDueDate.split('T')[0] : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {formatNumber(o.itemCount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      ₹{formatCurrency(o.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          o.status === 'DELIVERED'
                            ? 'success'
                            : o.status === 'CANCELLED'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {o.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
