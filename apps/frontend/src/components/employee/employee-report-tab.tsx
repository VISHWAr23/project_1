'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  Printer,
  FileText,
  Clock,
  Zap,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Building2,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEmployeeReport } from '@/hooks/useEmployees';
import { formatWorkHours } from '@/lib/date-utils';
import { exportEmployeeReportToExcel, exportEmployeeReportToPDF } from '@/lib/employee-report-export';

interface EmployeeReportTabProps {
  employeeId: string;
  employee: any;
}

export function EmployeeReportTab({ employeeId, employee }: EmployeeReportTabProps) {
  // Preset mode: 'this_month' | 'last_month' | 'last_30_days' | 'custom'
  const [filterMode, setFilterMode] = useState<'this_month' | 'last_month' | 'last_30_days' | 'custom'>('this_month');

  const today = useMemo(() => new Date(), []);

  const defaultDates = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const startOfCurrentMonth = new Date(Date.UTC(y, m, 1)).toISOString().split('T')[0];
    const endOfCurrentMonth = new Date(Date.UTC(y, m + 1, 0)).toISOString().split('T')[0];
    return {
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    };
  }, []);

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Handle Preset Changes
  const handlePresetSelect = (mode: 'this_month' | 'last_month' | 'last_30_days' | 'custom') => {
    setFilterMode(mode);
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    if (mode === 'this_month') {
      const start = new Date(Date.UTC(y, m, 1)).toISOString().split('T')[0];
      const end = new Date(Date.UTC(y, m + 1, 0)).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
      setSelectedMonth(m + 1);
      setSelectedYear(y);
    } else if (mode === 'last_month') {
      const start = new Date(Date.UTC(y, m - 1, 1)).toISOString().split('T')[0];
      const end = new Date(Date.UTC(y, m, 0)).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
      setSelectedMonth(m === 0 ? 12 : m);
      setSelectedYear(m === 0 ? y - 1 : y);
    } else if (mode === 'last_30_days') {
      const startObj = new Date(now);
      startObj.setDate(now.getDate() - 30);
      setStartDate(startObj.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  // Fetch report data
  const { data: report, isLoading, refetch, isFetching } = useEmployeeReport(
    employeeId,
    {
      startDate,
      endDate,
    },
    { enabled: Boolean(employeeId) }
  );

  // Professional Excel Export Handler (.xlsx)
  const handleExportExcel = () => {
    if (!report) return;
    exportEmployeeReportToExcel(report);
  };

  // Professional Vector PDF Generation Handler (.pdf)
  const handleExportPDF = () => {
    if (!report) return;
    exportEmployeeReportToPDF(report);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Filter & Control Bar */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                Work & Attendance Report Generator
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isLoading || !report}
              leftIcon={<Download className="h-4 w-4 text-emerald-500" />}
              className="text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
            >
              Download Excel (.xlsx)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isLoading || !report}
              leftIcon={<FileText className="h-4 w-4 text-rose-500" />}
              className="text-xs border-rose-500/30 hover:bg-rose-500/10 text-rose-400"
            >
              Generate PDF Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isLoading || !report}
              leftIcon={<Printer className="h-4 w-4" />}
              className="text-xs"
            >
              Print
            </Button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-1.5 bg-secondary/60 p-1 rounded-xl border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => handlePresetSelect('this_month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === 'this_month'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('last_month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === 'last_month'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last Month
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('last_30_days')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === 'last_30_days'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('custom')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === 'custom'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Custom Range
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            className="text-xs text-muted-foreground"
          >
            Refresh
          </Button>
        </div>

        {/* Date Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end pt-1">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setFilterMode('custom');
              }}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setFilterMode('custom');
              }}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Month Preset
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                const m = Number(e.target.value);
                setSelectedMonth(m);
                const start = new Date(Date.UTC(selectedYear, m - 1, 1)).toISOString().split('T')[0];
                const end = new Date(Date.UTC(selectedYear, m, 0)).toISOString().split('T')[0];
                setStartDate(start);
                setEndDate(end);
                setFilterMode('custom');
              }}
              className="w-full h-9 bg-secondary/50 border border-border rounded-lg px-2.5 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                const y = Number(e.target.value);
                setSelectedYear(y);
                const start = new Date(Date.UTC(y, selectedMonth - 1, 1)).toISOString().split('T')[0];
                const end = new Date(Date.UTC(y, selectedMonth, 0)).toISOString().split('T')[0];
                setStartDate(start);
                setEndDate(end);
                setFilterMode('custom');
              }}
              className="w-full h-9 bg-secondary/50 border border-border rounded-lg px-2.5 text-xs text-foreground focus:outline-none focus:border-blue-500"
            >
              {[2024, 2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl space-y-3">
          <RefreshCw className="h-6 w-6 text-blue-500 animate-spin mx-auto" />
          <p>Compiling attendance, overtime, and wage report...</p>
        </div>
      ) : !report ? (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
          No attendance records found for this period.
        </div>
      ) : (
        <div className="space-y-6 print:space-y-4">
          {/* Header Banner */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden print:border-black print:bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4 print:border-black">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground print:text-black">
                    Shri Lathikka Surgicals
                  </h2>
                  <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 print:border-black print:text-black">
                    Work Statement
                  </span>
                </div>
                <p className="text-xs text-muted-foreground print:text-slate-600 mt-0.5">
                  Report for <strong>{report.employee.firstName} {report.employee.lastName}</strong> ({report.employee.employeeCode}) • {report.employee.department}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-blue-500 print:text-black block">
                  {report.period.formattedRange}
                </span>
                <span className="text-[10px] text-muted-foreground print:text-slate-600">
                  {report.period.totalCalendarDays} Calendar Days
                </span>
              </div>
            </div>

            {/* Quick Rates Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Daily Base Wage</span>
                <span className="font-bold text-foreground print:text-black">₹{report.employee.baseWage} / day</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Overtime Rate</span>
                <span className="font-bold text-purple-500 print:text-black">₹{report.employee.otRatePerHour} / hr</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Salary Cycle</span>
                <span className="font-bold text-foreground print:text-black">{report.employee.salaryCycle}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Total Payable Days</span>
                <span className="font-bold text-emerald-500 print:text-black">{report.attendanceSummary.payableDays} Days</span>
              </div>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Attendance</span>
              <div className="text-lg font-bold text-emerald-500">
                {report.attendanceSummary.presentDays} Full <span className="text-xs font-normal text-muted-foreground">({report.attendanceSummary.halfDays} Half)</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {report.attendanceSummary.absentDays} Absent • {report.attendanceSummary.leaveDays} Leave
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Regular Work Time</span>
              <div className="text-lg font-bold text-foreground">
                {formatWorkHours(report.attendanceSummary.totalWorkingHours, { zeroText: '0 hr' })}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Base Earned: <strong className="text-foreground">₹{report.financialSummary.baseSalaryEarned}</strong>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Logged Overtime</span>
              <div className="text-lg font-bold text-purple-500">
                +{formatWorkHours(report.attendanceSummary.totalOvertimeHours, { zeroText: '0 hr' })}
              </div>
              <div className="text-[10px] text-muted-foreground">
                OT Earned: <strong className="text-purple-500">₹{report.financialSummary.otSalaryEarned}</strong>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Gross Earnings</span>
              <div className="text-lg font-bold text-emerald-500">
                ₹{report.financialSummary.totalGrossEarned.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-muted-foreground">
                Disbursed: <strong>₹{report.financialSummary.totalDisbursedInPeriod}</strong>
              </div>
            </div>
          </div>

          {/* Daily Punch Logs Breakdown */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-secondary/40 px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Daily Attendance & Punch Logs ({report.dailyLogs.length} Entries)
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Standard shift: 8 hr 30 min (09:00 - 18:30 IST)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/20 border-b border-border text-muted-foreground text-[11px]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Day</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Check IN (IST)</th>
                    <th className="p-3 text-center">Check OUT (IST)</th>
                    <th className="p-3 text-right">Regular Work</th>
                    <th className="p-3 text-right">Overtime</th>
                    <th className="p-3 text-right">OT Earned</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {report.dailyLogs.length > 0 ? (
                    report.dailyLogs.map((log: any) => {
                      const isSunday = log.dayOfWeek === 'Sun';
                      const inTime = log.checkIn ? new Date(log.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
                      const outTime = log.checkOut ? new Date(log.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

                      return (
                        <tr
                          key={log.id || log.date}
                          className={`hover:bg-secondary/20 transition-colors ${
                            isSunday ? 'bg-rose-500/5' : ''
                          }`}
                        >
                          <td className="p-3 font-bold text-foreground">{log.date}</td>
                          <td className={`p-3 font-medium ${isSunday ? 'text-rose-500' : 'text-muted-foreground'}`}>
                            {log.dayOfWeek}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'PRESENT'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  : log.status === 'HALF_DAY'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : log.status === 'ABSENT'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-center text-muted-foreground font-mono">{inTime}</td>
                          <td className="p-3 text-center text-muted-foreground font-mono">{outTime}</td>
                          <td className="p-3 text-right font-bold text-foreground">
                            {formatWorkHours(log.workingHours, { zeroText: '—' })}
                          </td>
                          <td className="p-3 text-right font-bold">
                            {log.overtimeHours > 0 ? (
                              <span className="text-purple-500">+{formatWorkHours(log.overtimeHours)}</span>
                            ) : (log as any).shortageHours > 0 ? (
                              <span className="text-rose-500">-{formatWorkHours((log as any).shortageHours)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-medium text-emerald-500">
                            {log.otAmount > 0 ? `₹${log.otAmount}` : '—'}
                          </td>
                          <td className="p-3 text-muted-foreground text-[11px] truncate max-w-[150px]">
                            {log.remarks || '—'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No daily punch logs recorded in this period.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-secondary/40 font-bold border-t-2 border-border">
                  <tr>
                    <td colSpan={5} className="p-3 text-right uppercase text-muted-foreground">
                      Period Totals:
                    </td>
                    <td className="p-3 text-right text-foreground">
                      {formatWorkHours(report.attendanceSummary.totalWorkingHours)}
                    </td>
                    <td className="p-3 text-right text-purple-500">
                      +{formatWorkHours(report.attendanceSummary.totalOvertimeHours)}
                    </td>
                    <td className="p-3 text-right text-emerald-500">
                      ₹{report.financialSummary.otSalaryEarned.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-muted-foreground text-[10px]">
                      {report.attendanceSummary.payableDays} Payable Days
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
