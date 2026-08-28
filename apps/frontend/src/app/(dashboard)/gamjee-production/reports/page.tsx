'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGamjeeReports } from '@/hooks/useGamjeeProduction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  FileBarChart,
  Download,
  Boxes,
  Scroll,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function GamjeeReportsPage() {
  const [activeReport, setActiveReport] = useState<'production' | 'consumption' | 'wastage' | 'finished_goods'>('production');

  const { data: reportData, isLoading } = useGamjeeReports(activeReport);
  const rows = reportData || [];

  const handleExportCSV = () => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).join(',');
    const csvContent = [
      headers,
      ...rows.map((row) =>
        Object.values(row)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gamjee_${activeReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/gamjee-production">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Gamjee Production Reports & Analytics
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Production metrics, raw material consumption, wastage analysis, and finished goods stock registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs"
            onClick={handleExportCSV}
            disabled={!rows.length}
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'production', label: 'Batch Production Summary', icon: Scroll, desc: 'Yield & status per job' },
          { id: 'consumption', label: 'Material Consumption', icon: Boxes, desc: 'Fabric & cotton consumed' },
          { id: 'wastage', label: 'Wastage & Loss Analysis', icon: Scissors, desc: 'Operation-level scrap & loss' },
          { id: 'finished_goods', label: 'Finished Goods Register', icon: CheckCircle2, desc: 'Finished rolls in warehouse' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20'
                  : 'bg-card border-border hover:bg-secondary/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                <h4 className="text-xs font-bold text-foreground">{tab.label}</h4>
              </div>
              <p className="text-[11px] text-muted-foreground">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Report Table */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-xs">
            {activeReport.replace('_', ' ')} Report Data
          </h3>
          <span className="text-xs font-mono text-muted-foreground">{rows.length} Records</span>
        </div>

        {isLoading ? (
          <SkeletonLoader className="h-48 w-full" />
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No report data available for the selected view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-y border-border">
                <tr>
                  {Object.keys(rows[0]).map((key) => (
                    <th key={key} className="px-3 py-2.5 font-semibold capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    {Object.entries(row).map(([k, val]: [string, any], vIdx: number) => (
                      <td key={vIdx} className="px-3 py-3 font-mono">
                        {k.toLowerCase().includes('date') && val
                          ? formatDate(val)
                          : typeof val === 'number'
                          ? val.toLocaleString()
                          : String(val ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
