'use client';

import React, { useState } from 'react';
import {
  PackageCheck,
  AlertTriangle,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  TrendingDown,
  Layers,
  FileDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StockValuationReportResponse } from '@/types/reports.types';
import { exportToCsv } from '@/lib/export-utils';
import { exportStockValuationPDF } from '@/lib/reports-pdf-export';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface StockValuationReportViewProps {
  data?: StockValuationReportResponse;
  isLoading: boolean;
}

export function StockValuationReportView({ data, isLoading }: StockValuationReportViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const summary = data?.summary || {
    totalItems: 0,
    totalValuation: 0,
    lowStockCount: 0,
    normalStockCount: 0,
  };

  const rawCategories = Array.isArray(data?.categoryBreakdown)
    ? data.categoryBreakdown
    : Array.isArray((data as any)?.categories)
    ? (data as any).categories
    : [];

  const categoryBreakdown: { category: string; itemCount: number; valuation: number }[] = rawCategories.map((c: any) => ({
    category: String(c.category || c.categoryName || 'General'),
    itemCount: Number(c.itemCount || 0),
    valuation: Number(c.valuation ?? c.totalValuation ?? 0),
  }));

  const items = Array.isArray(data?.items) ? data.items : [];
  const asOfDate = data?.asOfDate || new Date().toISOString().split('T')[0];

  const handleExportCsv = () => {
    if (!items.length) return;

    const rows = items.map((i) => ({
      'Item Code': i.itemCode || (i as any).sku || '—',
      'Item Name': i.name || 'Unnamed',
      Category: i.category || 'General',
      'Current Stock': i.currentStock ?? 0,
      UOM: i.uom || (i as any).unit || 'unit',
      'Reorder Level': i.reorderLevel ?? (i as any).minimumStockLevel ?? 0,
      'Unit Cost (₹)': i.unitCost ?? 0,
      'Total Valuation (₹)': i.totalValuation ?? 0,
      'Low Stock Alert': i.isLowStock ? 'YES' : 'NO',
      Location: i.warehouseLocation || 'Main Store',
    }));

    exportToCsv(`Inventory_Stock_Valuation_${asOfDate}`, rows);
  };

  const handleExportPdf = () => {
    if (!data) return;
    exportStockValuationPDF(data, categoryFilter || undefined, onlyLowStock);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
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
        <p className="text-muted-foreground text-sm">No inventory data available.</p>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    const itemName = item.name || '';
    const itemCode = item.itemCode || (item as any).sku || '';
    const matchesSearch =
      itemName.toLowerCase().includes(search.toLowerCase()) ||
      itemCode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? (item.category || 'General') === categoryFilter : true;
    const matchesLowStock = onlyLowStock ? Boolean(item.isLowStock) : true;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categories = Array.from(new Set(items.map((i) => i.category || 'General')));

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Inventory Asset Value
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              ₹{formatCurrency(summary.totalValuation)}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">FIFO weighted inventory balance</div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Catalog SKUs
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">{formatNumber(summary.totalItems)}</span>
            <span className="text-xs text-muted-foreground">material codes</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Across {categoryBreakdown.length} item categories</div>
        </Card>

        <Card
          hoverElevation={false}
          className={`p-4 ${Number(summary.lowStockCount) > 0 ? 'bg-amber-500/5 border-amber-500/30' : 'bg-muted/20'}`}
        >
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Low Stock Alerts
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-bold ${Number(summary.lowStockCount) > 0 ? 'text-amber-600' : 'text-foreground'}`}>
              {formatNumber(summary.lowStockCount)}
            </span>
            <span className="text-xs text-muted-foreground">items below safety reorder</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Action required for replenishment</div>
        </Card>
      </div>

      {/* Category Distribution Pills */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-emerald-500" />
          <span>Category Valuation Breakdown</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {categoryBreakdown.map((cat: { category: string; itemCount: number; valuation: number }) => (
            <div
              key={cat.category}
              className="p-3 bg-muted/30 border border-border/80 rounded-lg hover:border-emerald-500/40 transition-colors"
            >
              <div className="text-xs font-semibold text-foreground truncate">
                {(cat.category || 'General').replace(/_/g, ' ')}
              </div>
              <div className="text-sm font-bold text-foreground mt-0.5">
                ₹{formatCurrency(cat.valuation)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {cat.itemCount} {cat.itemCount === 1 ? 'item' : 'items'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search code or material..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 outline-none w-48 sm:w-56"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {(c || 'General').replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Low Stock Toggle */}
          <button
            type="button"
            onClick={() => setOnlyLowStock((prev) => !prev)}
            className={`px-2.5 py-1.5 text-xs rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
              onlyLowStock
                ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Low Stock Only ({summary.lowStockCount})</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="text-xs gap-1.5 whitespace-nowrap text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-500" />
            <span>Export Valuation PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Valuation CSV</span>
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <Card hoverElevation={false} className="overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Item Code</th>
                <th className="py-2.5 px-3">Description / Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Stock</th>
                <th className="py-2.5 px-3 text-right">Reorder Level</th>
                <th className="py-2.5 px-3 text-right">Unit Cost (₹)</th>
                <th className="py-2.5 px-3 text-right">Valuation (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No material items match the filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      {item.itemCode || (item as any).sku || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{item.name || 'Unnamed'}</div>
                      {item.warehouseLocation && (
                        <div className="text-[10px] text-muted-foreground">
                          Loc: {item.warehouseLocation}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-muted-foreground">
                        {(item.category || 'General').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      {formatNumber(item.currentStock)} {item.uom || (item as any).unit || 'units'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {formatNumber(item.reorderLevel ?? (item as any).minimumStockLevel ?? 0)} {item.uom || (item as any).unit || 'units'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{formatCurrency(item.unitCost)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{formatCurrency(item.totalValuation)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.isLowStock ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Healthy</Badge>
                      )}
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
