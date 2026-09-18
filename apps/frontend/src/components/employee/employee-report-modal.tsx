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
  X,
  RefreshCw,
  Building2,
  User,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useEmployeeReport } from '@/hooks/useEmployees';
import { formatWorkHours } from '@/lib/date-utils';
import { EmployeeReportData, EmployeeReportDailyLog } from '@/types/employee.types';
import { exportEmployeeReportToExcel, exportEmployeeReportToPDF } from '@/lib/employee-report-export';

interface EmployeeReportModalProps {
  employeeId: string;
  employeeName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeReportModal({
  employeeId,
  employeeName,
  isOpen,
  onClose,
}: EmployeeReportModalProps) {
  // Preset mode: 'this_month' | 'last_month' | 'last_30_days' | 'custom'
  const [filterMode, setFilterMode] = useState<'this_month' | 'last_month' | 'last_30_days' | 'custom'>('this_month');

  // Compute default dates
  const today = useMemo(() => new Date(), []);
  
  const defaultDates = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    
    // First and last day of current month
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
    { enabled: isOpen && Boolean(employeeId) }
  );

  if (!isOpen) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-card border border-border rounded-2xl w-full max-w-5xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:bg-white">
        {/* Modal Top Header (Screen Only) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground font-mono flex items-center gap-2">
                Employee Work & Performance Report
                {report && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-normal">
                    {report.employee.employeeCode}
                  </span>
                )}
              </h2>
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
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Date Filter Toolbar (Screen Only) */}
        <div className="p-4 bg-secondary/20 border-b border-border space-y-3 print:hidden">
          {/* Preset Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2">
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

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                isLoading={isFetching}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                className="text-xs text-muted-foreground"
              >
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end pt-1">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Start Date (From)
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
                End Date (To)
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
                Quick Month Selection
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

        {/* Scrollable Report Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs print:overflow-visible print:p-8 print:text-black">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-muted-foreground">Compiling attendance logs, overtime calculations, and financial records...</p>
            </div>
          ) : !report ? (
            <div className="py-20 text-center text-muted-foreground space-y-2">
              <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
              <p>No report records found for the selected date range.</p>
            </div>
          ) : (
            <div className="space-y-6 print:space-y-4">
              {/* Official Document Header (Cleanly styled for Print & Screen) */}
              <div className="border border-border/80 rounded-xl p-5 bg-card/60 relative overflow-hidden print:border-black print:bg-white print:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4 print:border-black">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl print:border print:border-black">
                      LS
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-bold text-foreground print:text-black tracking-tight">
                        Shri Lathikka Surgicals
                      </h1>
                      <p className="text-xs text-muted-foreground print:text-slate-600">
                        Samsigapuram, Rajapalayam, Tamil Nadu - 626102
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-block font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 print:border-black print:text-black">
                      Work & Wage Statement
                    </span>
                    <div className="text-xs text-muted-foreground print:text-slate-600 mt-1">
                      Generated: {new Date(report.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                {/* Employee Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Employee Code & Name</span>
                    <span className="font-bold text-foreground print:text-black">
                      {report.employee.firstName} {report.employee.lastName} ({report.employee.employeeCode})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Department / Designation</span>
                    <span className="font-medium text-foreground print:text-black">
                      {report.employee.department} • {report.employee.designation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Wage Structure</span>
                    <span className="font-medium text-foreground print:text-black">
                      ₹{report.employee.baseWage}/day • OT: ₹{report.employee.otRatePerHour}/hr
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Report Period</span>
                    <span className="font-bold text-blue-500 print:text-black">
                      {report.period.formattedRange}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 High-Impact KPI Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
                {/* Card 1: Attendance Breakdown */}
                <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 print:border-slate-300 print:bg-white">
                  <div className="flex items-center justify-between text-muted-foreground print:text-black">
                    <span className="text-[10px] uppercase font-semibold">Attendance Logged</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 print:hidden" />
                  </div>
                  <div className="text-lg font-bold text-emerald-500 print:text-black">
                    {report.attendanceSummary.presentDays} Present <span className="text-xs font-normal text-muted-foreground">({report.attendanceSummary.halfDays} Half)</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground print:text-slate-600">
                    Payable: <strong>{report.attendanceSummary.payableDays} Days</strong> • {report.attendanceSummary.absentDays} Absent
                  </div>
                </div>

                {/* Card 2: Regular & OT Work Time */}
                <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 print:border-slate-300 print:bg-white">
                  <div className="flex items-center justify-between text-muted-foreground print:text-black">
                    <span className="text-[10px] uppercase font-semibold">Work Time & OT</span>
                    <Clock className="h-3.5 w-3.5 text-blue-500 print:hidden" />
                  </div>
                  <div className="text-lg font-bold text-foreground print:text-black">
                    {formatWorkHours(report.attendanceSummary.totalWorkingHours, { zeroText: '0 hr' })}
                  </div>
                  <div className="text-[10px] text-purple-500 print:text-slate-600 font-semibold">
                    Overtime: +{formatWorkHours(report.attendanceSummary.totalOvertimeHours, { zeroText: '0 hr' })}
                  </div>
                </div>

                {/* Card 3: Gross Period Earnings */}
                <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 print:border-slate-300 print:bg-white">
                  <div className="flex items-center justify-between text-muted-foreground print:text-black">
                    <span className="text-[10px] uppercase font-semibold">Total Gross Earned</span>
                    <DollarSign className="h-3.5 w-3.5 text-emerald-500 print:hidden" />
                  </div>
                  <div className="text-lg font-bold text-emerald-500 print:text-black">
                    ₹{report.financialSummary.totalGrossEarned.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-muted-foreground print:text-slate-600">
                    Base: ₹{report.financialSummary.baseSalaryEarned} + OT: ₹{report.financialSummary.otSalaryEarned}
                  </div>
                </div>

                {/* Card 4: Advances & Settlements */}
                <div className="bg-card border border-border rounded-xl p-3.5 space-y-1 print:border-slate-300 print:bg-white">
                  <div className="flex items-center justify-between text-muted-foreground print:text-black">
                    <span className="text-[10px] uppercase font-semibold">Advances & Payouts</span>
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500 print:hidden" />
                  </div>
                  <div className="text-lg font-bold text-amber-500 print:text-black">
                    ₹{report.financialSummary.totalDisbursedInPeriod.toLocaleString('en-IN')} <span className="text-xs font-normal text-muted-foreground">Paid</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground print:text-slate-600">
                    Active Loan Bal: <strong>₹{report.financialSummary.totalOutstandingAdvance}</strong>
                  </div>
                </div>
              </div>

              {/* Detailed Daily Attendance & Work Breakdown Table */}
              <div className="border border-border rounded-xl overflow-hidden bg-card print:border-slate-400 print:bg-white">
                <div className="bg-secondary/40 px-4 py-3 border-b border-border flex items-center justify-between print:bg-slate-100 print:border-black">
                  <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2 print:text-black">
                    <Calendar className="h-4 w-4 text-blue-500 print:hidden" />
                    Daily Attendance & Punch Logs ({report.dailyLogs.length} Records)
                  </h3>
                  <span className="text-[11px] text-muted-foreground print:text-slate-600">
                    Standard shift: 8 hr 30 min (09:00 - 18:30 IST)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary/20 border-b border-border text-muted-foreground text-[11px] print:bg-slate-50 print:text-black print:border-black">
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Day</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-center">Check IN (IST)</th>
                        <th className="p-2.5 text-center">Check OUT (IST)</th>
                        <th className="p-2.5 text-right">Regular Work</th>
                        <th className="p-2.5 text-right">Overtime</th>
                        <th className="p-2.5 text-right">OT Earned</th>
                        <th className="p-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 print:divide-slate-200">
                      {report.dailyLogs.length > 0 ? (
                        report.dailyLogs.map((log: EmployeeReportDailyLog) => {
                          const isSunday = log.dayOfWeek === 'Sun';
                          const inTime = log.checkIn ? new Date(log.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
                          const outTime = log.checkOut ? new Date(log.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

                          return (
                            <tr
                              key={log.id || log.date}
                              className={`hover:bg-secondary/20 transition-colors ${
                                isSunday ? 'bg-rose-500/5 print:bg-slate-50' : ''
                              }`}
                            >
                              <td className="p-2.5 font-bold text-foreground print:text-black">{log.date}</td>
                              <td className={`p-2.5 font-medium ${isSunday ? 'text-rose-500' : 'text-muted-foreground'}`}>
                                {log.dayOfWeek}
                              </td>
                              <td className="p-2.5 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    log.status === 'PRESENT'
                                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 print:text-black print:border-none'
                                      : log.status === 'HALF_DAY'
                                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 print:text-black print:border-none'
                                      : log.status === 'ABSENT'
                                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 print:text-black print:border-none'
                                      : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 print:text-black print:border-none'
                                  }`}
                                >
                                  {log.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-center text-muted-foreground font-mono">{inTime}</td>
                              <td className="p-2.5 text-center text-muted-foreground font-mono">{outTime}</td>
                              <td className="p-2.5 text-right font-bold text-foreground print:text-black">
                                {formatWorkHours(log.workingHours, { zeroText: '—' })}
                              </td>
                              <td className="p-2.5 text-right font-bold print:text-black">
                                {log.overtimeHours > 0 ? (
                                  <span className="text-purple-500">+{formatWorkHours(log.overtimeHours)}</span>
                                ) : (log as any).shortageHours > 0 ? (
                                  <span className="text-rose-500">-{formatWorkHours((log as any).shortageHours)}</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="p-2.5 text-right font-medium text-emerald-500 print:text-black">
                                {log.otAmount > 0 ? `₹${log.otAmount}` : '—'}
                              </td>
                              <td className="p-2.5 text-muted-foreground text-[11px] truncate max-w-[150px]">
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
                    {/* Totals Summary Footer */}
                    <tfoot className="bg-secondary/40 font-bold border-t-2 border-border print:border-black print:bg-slate-100">
                      <tr>
                        <td colSpan={5} className="p-3 text-right uppercase text-muted-foreground print:text-black">
                          Period Totals:
                        </td>
                        <td className="p-3 text-right text-foreground print:text-black">
                          {formatWorkHours(report.attendanceSummary.totalWorkingHours)}
                        </td>
                        <td className="p-3 text-right text-purple-500 print:text-black">
                          +{formatWorkHours(report.attendanceSummary.totalOvertimeHours)}
                        </td>
                        <td className="p-3 text-right text-emerald-500 print:text-black">
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

              {/* Financial Disbursals & Advance Activity in Range */}
              {report.payments && report.payments.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden bg-card print:border-slate-400">
                  <div className="bg-secondary/40 px-4 py-2.5 border-b border-border font-bold text-xs uppercase text-foreground print:text-black">
                    Disbursements & Settlements in Period ({report.payments.length} Payments)
                  </div>
                  <div className="p-3 divide-y divide-border/40">
                    {report.payments.map((p: any) => (
                      <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-foreground print:text-black">{p.paymentType}</span>
                          <span className="text-[11px] text-muted-foreground ml-2">
                            • {new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMethod}
                          </span>
                          {p.remarks && <p className="text-[10px] text-muted-foreground">{p.remarks}</p>}
                        </div>
                        <span className="font-bold text-emerald-500 print:text-black">
                          ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Signatures & Verification Stamp (For Print Compliance) */}
              <div className="pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs print:grid print:pt-10 print:border-black">
                <div className="space-y-10">
                  <div className="border-b border-dashed border-border/80 w-3/4 mx-auto print:border-black" />
                  <span className="text-muted-foreground print:text-black block text-[11px]">
                    Employee Signature
                  </span>
                </div>

                <div className="space-y-10">
                  <div className="border-b border-dashed border-border/80 w-3/4 mx-auto print:border-black" />
                  <span className="text-muted-foreground print:text-black block text-[11px]">
                    HR / Shift Supervisor
                  </span>
                </div>

                <div className="space-y-10 col-span-2 sm:col-span-1">
                  <div className="border-b border-dashed border-border/80 w-3/4 mx-auto print:border-black" />
                  <span className="text-muted-foreground print:text-black block text-[11px]">
                    Accounts Officer / Factory Manager
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer (Screen Only) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-secondary/30 text-xs text-muted-foreground print:hidden">
          <span>Shri Lathikka Surgicals ERP • Attendance & Payroll Engine</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Report
          </Button>
        </div>
      </div>
    </div>
  );
}
