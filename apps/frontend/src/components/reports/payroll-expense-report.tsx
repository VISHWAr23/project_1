'use client';

import React from 'react';
import {
  Users,
  CreditCard,
  CalendarCheck,
  FileSpreadsheet,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PayrollExpenseReportResponse } from '@/types/reports.types';
import { exportToCsv } from '@/lib/export-utils';
import { exportPayrollExpensePDF } from '@/lib/reports-pdf-export';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface PayrollExpenseReportViewProps {
  data?: PayrollExpenseReportResponse;
  isLoading: boolean;
}

export function PayrollExpenseReportView({ data, isLoading }: PayrollExpenseReportViewProps) {
  const summary = data?.summary || {
    activeStaff: 0,
    totalRuns: 0,
    totalPayrollRuns: 0,
    totalGrossSalary: 0,
    totalGrossPayroll: 0,
    totalDeductions: 0,
    totalOvertimePay: 0,
    totalNetDisbursed: 0,
    attendanceRate: 0,
    presentDaysCount: 0,
    presentDaysRecorded: 0,
    absentDaysCount: 0,
  };

  const attendanceSummary = Array.isArray(data?.attendanceSummary) ? data.attendanceSummary : [];
  const payrollRuns = Array.isArray(data?.payrollRuns) ? data.payrollRuns : [];
  const dateRange = data?.dateRange || {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };

  const handleExportCsv = () => {
    if (!payrollRuns.length) return;

    const rows = payrollRuns.map((r) => ({
      'Payroll Code': r.payrollCode || '—',
      Month: r.month,
      Year: r.year,
      'Period Type': r.periodType,
      'Employees Count': r.totalEmployees,
      'Total Gross (₹)': r.totalGross,
      'Total Net Disbursed (₹)': r.totalNet,
      Status: r.status,
      'Generated Date': r.generatedAt ? r.generatedAt.split('T')[0] : '',
    }));

    exportToCsv(
      `Payroll_Disbursements_${dateRange.startDate}_to_${dateRange.endDate}`,
      rows
    );
  };

  const handleExportPdf = () => {
    if (!data) return;
    exportPayrollExpensePDF(data);
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
        <p className="text-muted-foreground text-sm">No payroll records found for selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Staff
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">{summary.activeStaff}</span>
            <span className="text-xs text-muted-foreground">employees</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">On company roster</div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Attendance Rate
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.attendanceRate}%
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {summary.presentDaysRecorded} attendance logs recorded
          </div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Gross Payroll
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              ₹{formatCurrency(summary.totalGrossPayroll)}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Before deductions</div>
        </Card>

        <Card hoverElevation={false} className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Net Wages Disbursed
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{formatCurrency(summary.totalNetDisbursed)}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Across {formatNumber(summary.totalPayrollRuns)} payroll cycles
          </div>
        </Card>
      </div>

      {/* Attendance distribution */}
      {attendanceSummary.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Attendance Status Breakdown</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {attendanceSummary.map((a) => (
              <div key={a.status} className="p-3 bg-muted/30 border border-border/70 rounded-lg">
                <span className="text-xs font-semibold text-foreground block">
                  {a.status.replace(/_/g, ' ')}
                </span>
                <span className="text-lg font-bold text-foreground mt-0.5 block">
                  {formatNumber(a.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll Runs Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Payroll Runs & Disbursements
        </h3>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="text-xs gap-1.5 whitespace-nowrap text-rose-600 hover:text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <FileDown className="h-3.5 w-3.5 text-rose-500" />
            <span>Export Payroll PDF</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5 whitespace-nowrap"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Payroll CSV</span>
          </Button>
        </div>
      </div>

      {/* Payroll Table */}
      <Card hoverElevation={false} className="overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Payroll Code</th>
                <th className="py-2.5 px-3">Cycle / Period</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Employees</th>
                <th className="py-2.5 px-3 text-right">Total Gross (₹)</th>
                <th className="py-2.5 px-3 text-right">Total Net Paid (₹)</th>
                <th className="py-2.5 px-3 text-right">Generated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {payrollRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No payroll cycles processed in this date range.
                  </td>
                </tr>
              ) : (
                payrollRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-foreground">
                      {r.payrollCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-foreground">
                        {r.periodType} ({r.month}/{r.year})
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          r.status === 'PAID'
                            ? 'success'
                            : r.status === 'CANCELLED'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {formatNumber(r.totalEmployees)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{formatCurrency(r.totalGross)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{formatCurrency(r.totalNet)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                      {r.generatedAt ? r.generatedAt.split('T')[0] : '—'}
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
