'use client';

import React, { useState } from 'react';
import {
  Factory,
  TrendingUp,
  AlertOctagon,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  FileDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductionEfficiencyReportResponse } from '@/types/reports.types';
import { exportToCsv } from '@/lib/export-utils';
import { exportProductionEfficiencyPDF } from '@/lib/reports-pdf-export';
import { formatNumber } from '@/lib/format-utils';

interface ProductionEfficiencyReportViewProps {
  data?: ProductionEfficiencyReportResponse;
  isLoading: boolean;
}

export function ProductionEfficiencyReportView({ data, isLoading }: ProductionEfficiencyReportViewProps) {
  const [activeDept, setActiveDept] = useState<'gauze' | 'gamjee'>('gauze');

  const summary = data?.summary || {
    totalBatches: 0,
    totalInputWeightKg: 0,
    totalOutputWeightKg: 0,
    totalWastageKg: 0,
    overallYieldRate: 100,
    gauzeBatchesCount: 0,
    gamjeeBatchesCount: 0,
  };

  const gauzeProduction = data?.gauzeProduction || {
    totalBatches: 0,
    avgYieldRate: 100,
    batches: [],
  };

  const gamjeeProduction = data?.gamjeeProduction || {
    totalBatches: 0,
    avgYieldRate: 100,
    batches: [],
  };

  const gauzeBatches = Array.isArray(gauzeProduction.batches) ? gauzeProduction.batches : [];
  const gamjeeBatches = Array.isArray(gamjeeProduction.batches) ? gamjeeProduction.batches : [];
  const dateRange = data?.dateRange || {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };

  const handleExportCsv = () => {
    const rows: Record<string, any>[] = [];

    gauzeBatches.forEach((b) => {
      rows.push({
        Department: 'Gauze Production',
        'Batch Number': b.batchNumber,
        Status: b.status,
        'Input Quantity': b.inputQuantity,
        'Output Quantity': b.outputQuantity,
        'Yield %': `${b.yieldPercentage}%`,
        'Start Date': b.startDate ? b.startDate.split('T')[0] : '',
        'Completed Date': b.completedDate ? b.completedDate.split('T')[0] : 'In Progress',
      });
    });

    gamjeeBatches.forEach((b) => {
      rows.push({
        Department: 'Gamjee Production',
        'Batch Number': b.batchNumber,
        Status: b.status,
        'Input Quantity': b.productionQuantity,
        'Output Quantity': b.outputQuantity,
        'Yield %': `${b.yieldPercentage}%`,
        'Start Date': b.startDate ? b.startDate.split('T')[0] : '',
        'Completed Date': b.completedDate ? b.completedDate.split('T')[0] : 'In Progress',
      });
    });

    exportToCsv(
      `Production_Yield_Efficiency_${dateRange.startDate}_to_${dateRange.endDate}`,
      rows
    );
  };

  const handleExportPdf = () => {
    if (!data) return;
    exportProductionEfficiencyPDF(data, activeDept);
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
        <p className="text-muted-foreground text-sm">No production data available for selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Overall Plant Yield
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={`text-2xl sm:text-3xl font-bold ${
                summary.overallYieldRate >= 95
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : summary.overallYieldRate >= 90
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {summary.overallYieldRate}%
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Standard benchmark: &gt; 95%</div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Batches Executed
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">{summary.totalBatches}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {summary.gauzeBatchesCount} Gauze • {summary.gamjeeBatchesCount} Gamjee
          </div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Input Consumed
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatNumber(summary.totalInputWeightKg)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Units/Kg</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Fabric & cotton input</div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Output vs Scrap
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatNumber(summary.totalOutputWeightKg)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Produced</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Scrap: {formatNumber(summary.totalWastageKg)}
          </div>
        </Card>
      </div>

      {/* Department Selector & Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveDept('gauze')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeDept === 'gauze'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            Gauze Batches ({gauzeProduction.totalBatches}) • {gauzeProduction.avgYieldRate}% Yield
          </button>
          <button
            type="button"
            onClick={() => setActiveDept('gamjee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              activeDept === 'gamjee'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            Gamjee Batches ({gamjeeProduction.totalBatches}) • {gamjeeProduction.avgYieldRate}% Yield
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="text-xs gap-1.5 whitespace-nowrap text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-500" />
            <span>Export Production PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Production CSV</span>
          </Button>
        </div>
      </div>

      {/* Batches Table */}
      <Card hoverElevation={false} className="overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Batch Number</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Input Qty</th>
                <th className="py-2.5 px-3 text-right">Output Produced</th>
                <th className="py-2.5 px-3 text-right">Yield Rate</th>
                <th className="py-2.5 px-3 text-right">Start Date</th>
                <th className="py-2.5 px-3 text-right">Completion Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {activeDept === 'gauze' ? (
                gauzeBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No gauze batches recorded for this date range.
                    </td>
                  </tr>
                ) : (
                  gauzeBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                        {b.batchNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            b.status === 'COMPLETED'
                              ? 'success'
                              : b.status === 'CANCELLED'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {(b.status || 'UNKNOWN').replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {formatNumber(b.inputQuantity)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                        {formatNumber(b.outputQuantity)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span
                          className={`font-bold ${
                            b.yieldPercentage >= 95
                              ? 'text-emerald-600'
                              : b.yieldPercentage >= 90
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {b.yieldPercentage}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {b.startDate ? b.startDate.split('T')[0] : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                        {b.completedDate ? b.completedDate.split('T')[0] : 'Active'}
                      </td>
                    </tr>
                  ))
                )
              ) : gamjeeBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No gamjee batches recorded for this date range.
                  </td>
                </tr>
              ) : (
                gamjeeBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      {b.batchNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          b.status === 'COMPLETED'
                            ? 'success'
                            : b.status === 'CANCELLED'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {b.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {formatNumber(b.productionQuantity)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                      {formatNumber(b.outputQuantity)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={`font-bold ${
                          b.yieldPercentage >= 95
                            ? 'text-emerald-600'
                            : b.yieldPercentage >= 90
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {b.yieldPercentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {b.startDate ? b.startDate.split('T')[0] : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {b.completedDate ? b.completedDate.split('T')[0] : 'Active'}
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
