'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Clock,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Search,
  Calendar as CalendarIcon,
  Clock3,
  Edit,
  LogIn,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Grid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, Column } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import {
  useAttendance,
  useTodayAttendance,
  useMonthAttendance,
  useMarkAttendance,
  useUpdateAttendance,
} from '@/hooks/useAttendance';
import { useEmployees, useDepartments } from '@/hooks/useEmployees';
import { AttendanceRecord, AttendanceStatus } from '@/types/attendance.types';
import { formatWorkHours } from '@/lib/date-utils';

// ==========================================
// IST Date & Time Local Utility Functions
// ==========================================

const getTodayISTDateStr = (): string => {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
};

const getCurrentISTHHMM = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatISTTime = (isoString?: string | null): string => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

const extractISTHHMM = (isoString?: string | null): string => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '';
  }
};

const buildISTIsoString = (dateStr: string, timeStr: string): string => {
  const cleanTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return `${dateStr}T${cleanTime}+05:30`;
};

export default function AttendancePage() {
  const { toast } = useToast();
  const todayIST = getTodayISTDateStr();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');

  // Filters & State
  const [selectedDate, setSelectedDate] = useState(todayIST);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  // Month Calendar Grid State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthViewMode, setMonthViewMode] = useState<'summary' | 'matrix'>('summary');

  // Live IST Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Modals
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Queries
  const { data: todayStats, refetch: refetchToday } = useTodayAttendance(selectedDate);
  const { data: attendanceData, isLoading, refetch: refetchAttendance } = useAttendance({
    date: selectedDate,
    search,
    departmentId: deptFilter,
    status: statusFilter,
  });

  const { data: monthSummaryData, isLoading: isMonthLoading, refetch: refetchMonth } = useMonthAttendance(
    selectedMonth,
    selectedYear,
    deptFilter
  );

  const { data: activeEmployeesData, refetch: refetchEmployees } = useEmployees({ status: 'ACTIVE', limit: 100 });
  const { data: departments = [] } = useDepartments();

  const markMutation = useMarkAttendance();
  const updateMutation = useUpdateAttendance();

  const activeEmployees = activeEmployeesData?.items || [];
  const attendanceList = attendanceData?.items || [];

  // Fast Punch Form State (in IST)
  const [punchForm, setPunchForm] = useState({
    employeeId: '',
    date: todayIST,
    actionType: 'IN' as 'IN' | 'OUT' | 'FULL_DAY' | 'ABSENT' | 'LEAVE',
    punchTime: getCurrentISTHHMM(),
    checkIn: '09:00',
    checkOut: '18:30',
    lunchStart: '13:30',
    lunchEnd: '14:30',
    status: 'PRESENT' as AttendanceStatus,
    remarks: '',
  });

  // Find if selected employee already has a punch today
  const existingLogForSelected = useMemo(() => {
    if (!punchForm.employeeId) return null;
    return attendanceList.find((a) => a.employeeId === punchForm.employeeId);
  }, [punchForm.employeeId, attendanceList]);

  // When an employee is selected, automatically configure the form
  const handleEmployeeSelect = (empId: string) => {
    const existing = attendanceList.find((a) => a.employeeId === empId);
    const nowHHMM = getCurrentISTHHMM();

    if (existing) {
      if (existing.checkIn && !existing.checkOut) {
        const inTimeStr = extractISTHHMM(existing.checkIn) || '09:00';
        setPunchForm((prev) => ({
          ...prev,
          employeeId: empId,
          actionType: 'OUT',
          checkIn: inTimeStr,
          checkOut: nowHHMM,
          punchTime: nowHHMM,
          status: existing.status || 'PRESENT',
        }));
      } else {
        const inTimeStr = extractISTHHMM(existing.checkIn) || '09:00';
        const outTimeStr = extractISTHHMM(existing.checkOut) || '18:30';
        setPunchForm((prev) => ({
          ...prev,
          employeeId: empId,
          actionType: 'FULL_DAY',
          checkIn: inTimeStr,
          checkOut: outTimeStr,
          punchTime: nowHHMM,
          status: existing.status || 'PRESENT',
        }));
      }
    } else {
      setPunchForm((prev) => ({
        ...prev,
        employeeId: empId,
        actionType: 'IN',
        checkIn: nowHHMM,
        checkOut: '18:30',
        punchTime: nowHHMM,
        status: 'PRESENT',
      }));
    }
  };

  // Open Quick Punch Modal
  const openQuickPunch = (empId = '', action: 'IN' | 'OUT' = 'IN') => {
    const nowHHMM = getCurrentISTHHMM();
    setPunchForm({
      employeeId: empId,
      date: selectedDate,
      actionType: action,
      punchTime: nowHHMM,
      checkIn: action === 'IN' ? nowHHMM : '09:00',
      checkOut: action === 'OUT' ? nowHHMM : '18:30',
      lunchStart: '13:30',
      lunchEnd: '14:30',
      status: 'PRESENT',
      remarks: '',
    });
    if (empId) {
      handleEmployeeSelect(empId);
    }
    setIsPunchModalOpen(true);
  };

  // Sync Button Handler
  const handleSyncAll = async () => {
    try {
      setIsSyncing(true);
      await Promise.all([
        refetchAttendance(),
        refetchToday(),
        refetchMonth(),
        refetchEmployees(),
      ]);
      toast('Synchronized', 'Attendance data refreshed in IST', 'success');
    } catch (err: any) {
      toast('Sync Failed', err?.message || 'Could not refresh data', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit Punch (IN, OUT, FULL_DAY, ABSENT, LEAVE)
  const handlePunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchForm.employeeId) {
      toast('Required', 'Please select an employee', 'error');
      return;
    }

    try {
      const dateStr = punchForm.date || selectedDate;
      let checkInIso: string | undefined = undefined;
      let checkOutIso: string | undefined = undefined;
      let lunchStartIso: string | undefined = undefined;
      let lunchEndIso: string | undefined = undefined;

      if (punchForm.actionType === 'ABSENT' || punchForm.actionType === 'LEAVE') {
        await markMutation.mutateAsync({
          employeeId: punchForm.employeeId,
          date: dateStr,
          status: punchForm.actionType === 'ABSENT' ? 'ABSENT' : 'LEAVE',
          remarks: punchForm.remarks || undefined,
        });
      } else {
        if (punchForm.actionType === 'IN') {
          checkInIso = buildISTIsoString(dateStr, punchForm.checkIn || getCurrentISTHHMM());
          if (existingLogForSelected?.checkOut) {
            checkOutIso = existingLogForSelected.checkOut;
          }
        } else if (punchForm.actionType === 'OUT') {
          if (existingLogForSelected?.checkIn) {
            checkInIso = existingLogForSelected.checkIn;
          } else {
            checkInIso = buildISTIsoString(dateStr, punchForm.checkIn || '09:00');
          }
          checkOutIso = buildISTIsoString(dateStr, punchForm.checkOut || getCurrentISTHHMM());
        } else {
          checkInIso = buildISTIsoString(dateStr, punchForm.checkIn || '09:00');
          checkOutIso = buildISTIsoString(dateStr, punchForm.checkOut || '18:30');
        }

        if (punchForm.lunchStart && punchForm.lunchEnd) {
          lunchStartIso = buildISTIsoString(dateStr, punchForm.lunchStart);
          lunchEndIso = buildISTIsoString(dateStr, punchForm.lunchEnd);
        }

        await markMutation.mutateAsync({
          employeeId: punchForm.employeeId,
          date: dateStr,
          status: punchForm.status || 'PRESENT',
          checkIn: checkInIso,
          checkOut: checkOutIso,
          lunchStart: lunchStartIso,
          lunchEnd: lunchEndIso,
          remarks: punchForm.remarks || undefined,
        });
      }

      toast('Attendance Recorded', 'Punch logged successfully in IST', 'success');
      setIsPunchModalOpen(false);
      refetchAttendance();
      refetchToday();
      refetchMonth();
    } catch (err: any) {
      toast('Failed', err?.message || 'Could not record attendance', 'error');
    }
  };

  // Quick One-Click Row Punch Out
  const handleQuickRowPunchOut = async (record: AttendanceRecord) => {
    try {
      const nowHHMM = getCurrentISTHHMM();
      const dateStr = record.date ? record.date.split('T')[0] : selectedDate;
      const outIso = buildISTIsoString(dateStr, nowHHMM);
      const lunchStartIso = record.lunchStart || buildISTIsoString(dateStr, '13:30');
      const lunchEndIso = record.lunchEnd || buildISTIsoString(dateStr, '14:30');

      await updateMutation.mutateAsync({
        id: record.id,
        payload: {
          checkOut: outIso,
          lunchStart: lunchStartIso,
          lunchEnd: lunchEndIso,
          status: 'PRESENT',
        },
      });
      toast('Checked Out', `${record.employee?.firstName} checked out at ${formatISTTime(outIso)} (IST)`, 'success');
      refetchAttendance();
      refetchToday();
      refetchMonth();
    } catch (err: any) {
      toast('Punch Out Failed', err?.message || 'Could not update checkout time', 'error');
    }
  };

  // Edit Record Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      const dateStr = editingRecord.date ? editingRecord.date.split('T')[0] : selectedDate;
      const inTime = (editingRecord as any)._inTime;
      const outTime = (editingRecord as any)._outTime;
      const lStartTime = (editingRecord as any)._lunchStartTime;
      const lEndTime = (editingRecord as any)._lunchEndTime;

      const checkInIso = inTime ? buildISTIsoString(dateStr, inTime) : undefined;
      const checkOutIso = outTime ? buildISTIsoString(dateStr, outTime) : undefined;
      const lunchStartIso = lStartTime ? buildISTIsoString(dateStr, lStartTime) : undefined;
      const lunchEndIso = lEndTime ? buildISTIsoString(dateStr, lEndTime) : undefined;

      await updateMutation.mutateAsync({
        id: editingRecord.id,
        payload: {
          status: editingRecord.status,
          checkIn: checkInIso,
          checkOut: checkOutIso,
          lunchStart: lunchStartIso,
          lunchEnd: lunchEndIso,
          remarks: editingRecord.remarks || undefined,
        },
      });

      toast('Record Updated', 'Attendance details saved successfully in IST', 'success');
      setEditingRecord(null);
      refetchAttendance();
      refetchToday();
      refetchMonth();
    } catch (err: any) {
      toast('Update Failed', err?.message || 'Could not update record', 'error');
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const monthName = useMemo(() => {
    return new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  }, [selectedMonth, selectedYear]);

  // Table Columns for Daily View
  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={`${row.employee?.firstName} ${row.employee?.lastName}`}
            src={row.employee?.avatarUrl || undefined}
            size="sm"
          />
          <div>
            <div className="font-semibold text-foreground">
              {row.employee?.firstName} {row.employee?.lastName}
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {row.employee?.employeeCode}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.employee?.department?.name || 'General'}
        </span>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check IN (IST)',
      align: 'center',
      render: (row) => {
        if (!row.checkIn) return <span className="text-muted-foreground font-mono text-xs">—</span>;
        return (
          <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {formatISTTime(row.checkIn)}
          </span>
        );
      },
    },
    {
      key: 'lunch',
      header: 'Lunch Break (IST)',
      align: 'center',
      render: (row) => {
        if (!row.lunchStart || !row.lunchEnd) {
          return <span className="text-muted-foreground font-mono text-xs text-slate-400">01:30 PM - 02:30 PM</span>;
        }
        return (
          <span className="font-mono text-xs text-muted-foreground">
            {formatISTTime(row.lunchStart)} - {formatISTTime(row.lunchEnd)}
          </span>
        );
      },
    },
    {
      key: 'checkOut',
      header: 'Check OUT (IST)',
      align: 'center',
      render: (row) => {
        if (!row.checkOut) {
          return (
            <span className="font-mono text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
              On Shift
            </span>
          );
        }
        return (
          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {formatISTTime(row.checkOut)}
          </span>
        );
      },
    },
    {
      key: 'workingHours',
      header: 'Worked / Overtime',
      align: 'right',
      render: (row) => {
        const reg = Number(row.workingHours || 0);
        const ot = Number(row.overtimeHours || 0);
        if (row.status !== 'PRESENT' && row.status !== 'HALF_DAY') {
          return <span className="font-mono text-xs text-muted-foreground">—</span>;
        }
        return (
          <div className="text-right font-mono text-xs space-y-0.5">
            <div className="text-foreground font-semibold">{formatWorkHours(reg)}</div>
            {ot > 0 && (
              <span className="inline-block text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">
                +{formatWorkHours(ot)} OT
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge
          variant={
            row.status === 'PRESENT'
              ? 'success'
              : row.status === 'HALF_DAY'
              ? 'warning'
              : row.status === 'ABSENT'
              ? 'error'
              : 'info'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.checkIn && !row.checkOut && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickRowPunchOut(row)}
              leftIcon={<LogOut className="h-3 w-3 text-amber-500" />}
              className="h-7 text-xs px-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
            >
              Punch OUT
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const inStr = extractISTHHMM(row.checkIn);
              const outStr = extractISTHHMM(row.checkOut);
              const lSStr = extractISTHHMM(row.lunchStart) || '13:30';
              const lEStr = extractISTHHMM(row.lunchEnd) || '14:30';

              setEditingRecord({
                ...row,
                _inTime: inStr,
                _outTime: outStr,
                _lunchStartTime: lSStr,
                _lunchEndTime: lEStr,
              } as any);
            }}
            leftIcon={<Edit className="h-3.5 w-3.5" />}
            className="h-7 text-xs px-2"
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Live IST Clock & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Attendance Management
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Clock Pill (IST) */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl font-mono text-xs shadow-sm">
            <Clock className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
            <span className="font-bold text-foreground">{currentTime || '--:--:--'} (IST)</span>
            <span className="text-muted-foreground hidden md:inline">• {currentDateFormatted}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            isLoading={isSyncing}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            Sync
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openQuickPunch()}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Log Attendance
          </Button>
        </div>
      </div>

      {/* Main View Tabs (Daily Register vs Monthly Calendar Grid) */}
      <div className="flex items-center gap-2 border-b border-border pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'daily'
              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30 font-bold shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          Daily Attendance Register
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'monthly'
              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30 font-bold shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          Monthly Calendar Overview
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY ATTENDANCE REGISTER */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* 4 Crisp KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono">Present Today</span>
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {todayStats?.presentToday || 0}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                Out of {todayStats?.totalActiveEmployees || 0} staff
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono">On Shift (Active)</span>
                <Clock3 className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-500">
                {attendanceList.filter((a) => a.checkIn && !a.checkOut).length}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                Punched IN, pending OUT
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono">Overtime Logged</span>
                <Zap className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-purple-500">
                {formatWorkHours(todayStats?.totalOvertimeHours, { zeroText: '0 hr' })}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                Beyond 8 hr 30 min standard shift
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-mono">Absent / Leave</span>
                <UserX className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-500">
                {(todayStats?.absentToday || 0) + (todayStats?.leaveToday || 0)}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                {todayStats?.absentToday || 0} Absent, {todayStats?.leaveToday || 0} Leave
              </p>
            </div>
          </div>

          {/* Fast Quick Punch IN / OUT Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-sm font-mono flex items-center gap-2">
                <LogIn className="h-4 w-4 text-blue-500" />
                Quick Punch IN / OUT (IST)
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                Fast input with current IST time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              {/* Select Employee */}
              <div>
                <label className="text-muted-foreground block mb-1">Employee *</label>
                <select
                  value={punchForm.employeeId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {activeEmployees.map((emp) => (
                    <option key={`qp-emp-${emp.id}`} value={emp.id}>
                      {emp.employeeCode} - {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-muted-foreground block mb-1">Date</label>
                <Input
                  type="date"
                  value={punchForm.date}
                  onChange={(e) => setPunchForm({ ...punchForm, date: e.target.value })}
                />
              </div>

              {/* Action Type */}
              <div>
                <label className="text-muted-foreground block mb-1">Action Type</label>
                <select
                  value={punchForm.actionType}
                  onChange={(e) => setPunchForm({ ...punchForm, actionType: e.target.value as any })}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="IN">Punch IN (Arrival)</option>
                  <option value="OUT">Punch OUT (Departure)</option>
                  <option value="FULL_DAY">Full Day (Custom Times)</option>
                  <option value="ABSENT">Mark Absent</option>
                  <option value="LEAVE">Mark Leave</option>
                </select>
              </div>

              {/* Punch Trigger Button */}
              <div className="flex items-end">
                <Button
                  variant="primary"
                  onClick={handlePunchSubmit}
                  isLoading={markMutation.isPending}
                  disabled={!punchForm.employeeId}
                  className="w-full justify-center font-bold"
                >
                  {punchForm.actionType === 'IN'
                    ? 'Record Punch IN'
                    : punchForm.actionType === 'OUT'
                    ? 'Record Punch OUT'
                    : 'Save Attendance'}
                </Button>
              </div>
            </div>

            {/* Custom Times Inputs */}
            {punchForm.actionType === 'FULL_DAY' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 font-mono text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1">Check IN (IST)</label>
                  <Input
                    type="time"
                    value={punchForm.checkIn}
                    onChange={(e) => setPunchForm({ ...punchForm, checkIn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Lunch Start (IST)</label>
                  <Input
                    type="time"
                    value={punchForm.lunchStart}
                    onChange={(e) => setPunchForm({ ...punchForm, lunchStart: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Lunch End (IST)</label>
                  <Input
                    type="time"
                    value={punchForm.lunchEnd}
                    onChange={(e) => setPunchForm({ ...punchForm, lunchEnd: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1">Check OUT (IST)</label>
                  <Input
                    type="time"
                    value={punchForm.checkOut}
                    onChange={(e) => setPunchForm({ ...punchForm, checkOut: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Daily Attendance Register Table */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff name or code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={`daily-dept-${d.id}`} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(todayIST)}
                  className={selectedDate === todayIST ? 'border-blue-500 text-blue-500 font-bold' : ''}
                >
                  Today
                </Button>

                <div className="relative">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs font-mono w-36"
                  />
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={attendanceList}
              keyExtractor={(row) => row.id}
              isLoading={isLoading}
              emptyMessage="No attendance logs found for this date in IST."
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MONTHLY ATTENDANCE CALENDAR GRID */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Month Controls & Department Filter */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>

              <div className="text-sm font-bold text-foreground min-w-[160px] text-center">
                {monthName}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={`month-dept-${d.id}`} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Toggle Summary Table vs Day Matrix */}
              <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
                <button
                  onClick={() => setMonthViewMode('summary')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                    monthViewMode === 'summary'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  Monthly Summary
                </button>
                <button
                  onClick={() => setMonthViewMode('matrix')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                    monthViewMode === 'matrix'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                  Day-by-Day (1-{daysInMonth})
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 1: CLEAN MONTHLY SUMMARY TABLE (Matching User Screenshot Exactly) */}
          {monthViewMode === 'summary' && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  Employee Monthly Attendance Summary ({monthName})
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Total Staff: {monthSummaryData?.employees?.length || 0}
                </span>
              </div>

              {isMonthLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  Loading Monthly Summary Data...
                </div>
              ) : monthSummaryData?.employees?.length ? (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-muted-foreground text-[11px]">
                        <th className="p-3">Employee</th>
                        <th className="p-3 text-center">Present (Full Day)</th>
                        <th className="p-3 text-center">Half Day</th>
                        <th className="p-3 text-center">Absent</th>
                        <th className="p-3 text-center">Leave</th>
                        <th className="p-3 text-right">Overtime</th>
                        <th className="p-3 text-right">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {monthSummaryData.employees.map((emp: any, empIdx: number) => (
                        <tr key={`summary-row-${emp.id || emp.employeeCode || empIdx}`} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={`${emp.firstName} ${emp.lastName}`}
                                src={emp.avatarUrl || undefined}
                                size="sm"
                              />
                              <div>
                                <div className="font-bold text-foreground">
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  {emp.employeeCode} • {emp.department}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Present */}
                          <td className="p-3 text-center">
                            <span className="text-emerald-500 font-bold">
                              {emp.totalPresent || 0} Days
                            </span>
                          </td>

                          {/* Half Day */}
                          <td className="p-3 text-center">
                            <span className={emp.totalHalfDay > 0 ? 'text-amber-500 font-bold' : 'text-amber-500/60'}>
                              {emp.totalHalfDay || 0} Days
                            </span>
                          </td>

                          {/* Absent */}
                          <td className="p-3 text-center">
                            <span className={emp.totalAbsent > 0 ? 'text-rose-500 font-bold' : 'text-rose-500/60'}>
                              {emp.totalAbsent || 0} Days
                            </span>
                          </td>

                          {/* Leave */}
                          <td className="p-3 text-center">
                            <span className={emp.totalLeave > 0 ? 'text-blue-500 font-bold' : 'text-blue-500/60'}>
                              {emp.totalLeave || 0} Days
                            </span>
                          </td>

                          {/* OT */}
                          <td className="p-3 text-right">
                            <span className="text-purple-500 font-bold">
                              {emp.totalOvertimeHours > 0 ? `+${formatWorkHours(emp.totalOvertimeHours)}` : '0 hr'}
                            </span>
                          </td>

                          {/* Total Hours */}
                          <td className="p-3 text-right font-bold text-foreground">
                            {formatWorkHours(emp.totalWorkingHours, { zeroText: '0 hr' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No employees found for {monthName}.
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: DAY-BY-DAY MATRIX GRID (1 to 31) */}
          {monthViewMode === 'matrix' && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-500" />
                  Day-by-Day Attendance Matrix ({monthName})
                </h3>
                <span className="text-[11px] text-muted-foreground">
                  Total Staff: {monthSummaryData?.employees?.length || 0}
                </span>
              </div>

              {isMonthLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                  Loading Monthly Matrix Data...
                </div>
              ) : monthSummaryData?.employees?.length ? (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-center border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-secondary/60 border-b border-border text-muted-foreground">
                        <th className="p-2.5 text-left min-w-[160px] sticky left-0 bg-secondary/90 z-10">
                          Employee
                        </th>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                          const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                          const isSunday = dateObj.getDay() === 0;
                          const isSaturday = dateObj.getDay() === 6;
                          return (
                            <th
                              key={`matrix-th-day-${day}`}
                              className={`p-1.5 min-w-[28px] border-l border-border/40 ${
                                isSunday
                                  ? 'bg-rose-500/10 text-rose-500 font-bold'
                                  : isSaturday
                                  ? 'bg-purple-500/10 text-purple-500 font-bold'
                                  : ''
                              }`}
                            >
                              <div>{day}</div>
                              <div className="text-[8px] text-muted-foreground/70 font-normal">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][dateObj.getDay()]}
                              </div>
                            </th>
                          );
                        })}
                        <th className="p-2 min-w-[50px] border-l border-border bg-secondary/80 text-emerald-500 font-bold">
                          P (Days)
                        </th>
                        <th className="p-2 min-w-[60px] border-l border-border bg-secondary/80 text-foreground font-bold">
                          Hours
                        </th>
                        <th className="p-2 min-w-[60px] border-l border-border bg-secondary/80 text-purple-500 font-bold">
                          OT (h)
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border/40">
                      {monthSummaryData.employees.map((emp: any, empIdx: number) => {
                        const logsByDay: { [day: number]: any } = {};
                        emp.attendanceLogs?.forEach((log: any) => {
                          const d = new Date(log.date).getUTCDate();
                          logsByDay[d] = log;
                        });

                        return (
                          <tr key={`matrix-row-${emp.id || emp.employeeCode || empIdx}`} className="hover:bg-secondary/30">
                            <td className="p-2.5 text-left font-semibold text-foreground sticky left-0 bg-card z-10 border-r border-border flex items-center gap-2">
                              <Avatar
                                name={`${emp.firstName} ${emp.lastName}`}
                                src={emp.avatarUrl || undefined}
                                size="sm"
                                className="h-6 w-6 text-[10px]"
                              />
                              <div className="truncate max-w-[120px]">
                                <div className="truncate leading-tight">
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div className="text-[9px] text-muted-foreground font-normal">
                                  {emp.employeeCode}
                                </div>
                              </div>
                            </td>

                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                              const log = logsByDay[day];
                              const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                              const isSunday = dateObj.getDay() === 0;

                              let content = <span className="text-muted-foreground/30">—</span>;
                              if (log) {
                                if (log.status === 'PRESENT') {
                                  content = (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                                      P
                                    </span>
                                  );
                                } else if (log.status === 'HALF_DAY') {
                                  content = (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30">
                                      HD
                                    </span>
                                  );
                                } else if (log.status === 'ABSENT') {
                                  content = (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 font-bold border border-rose-500/30">
                                      A
                                    </span>
                                  );
                                } else if (log.status === 'LEAVE') {
                                  content = (
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-500 font-bold border border-blue-500/30">
                                      L
                                    </span>
                                  );
                                }
                              } else if (isSunday) {
                                content = <span className="text-rose-400/50">Off</span>;
                              }

                              return (
                                <td
                                  key={`matrix-td-${emp.id || emp.employeeCode || empIdx}-${day}`}
                                  className={`p-1 border-l border-border/40 ${
                                    isSunday ? 'bg-rose-500/5' : ''
                                  }`}
                                >
                                  {content}
                                </td>
                              );
                            })}

                            <td className="p-2 border-l border-border font-bold text-emerald-600 dark:text-emerald-400">
                              {emp.totalPresent || 0}
                            </td>
                            <td className="p-2 border-l border-border font-bold text-foreground">
                              {formatWorkHours(emp.totalWorkingHours, { zeroText: '0 hr' })}
                            </td>
                            <td className="p-2 border-l border-border font-bold text-purple-600 dark:text-purple-400">
                              {emp.totalOvertimeHours > 0 ? `+${formatWorkHours(emp.totalOvertimeHours)}` : '0 hr'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No employees or attendance logs found for {monthName}.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK PUNCH MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
        title="Record Attendance Punch (IST)"
        description="Select staff and log In/Out time in Indian Standard Time."
      >
        <form onSubmit={handlePunchSubmit} className="space-y-4 pt-2 font-mono text-xs">
          <div>
            <label className="block text-muted-foreground mb-1">Employee *</label>
            <select
              required
              value={punchForm.employeeId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select Employee --</option>
              {activeEmployees.map((emp) => (
                <option key={`modal-emp-${emp.id}`} value={emp.id}>
                  {emp.employeeCode} - {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Date *</label>
              <Input
                type="date"
                value={punchForm.date}
                onChange={(e) => setPunchForm({ ...punchForm, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Punch Action *</label>
              <select
                value={punchForm.actionType}
                onChange={(e) => setPunchForm({ ...punchForm, actionType: e.target.value as any })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
              >
                <option value="IN">Punch IN (Arrival)</option>
                <option value="OUT">Punch OUT (Departure)</option>
                <option value="FULL_DAY">Full Day (Custom Times)</option>
                <option value="ABSENT">Absent</option>
                <option value="LEAVE">Leave</option>
              </select>
            </div>
          </div>

          {punchForm.actionType === 'IN' && (
            <div>
              <label className="block text-muted-foreground mb-1">Check IN Time (IST)</label>
              <Input
                type="time"
                value={punchForm.checkIn}
                onChange={(e) => setPunchForm({ ...punchForm, checkIn: e.target.value })}
              />
            </div>
          )}

          {punchForm.actionType === 'OUT' && (
            <div>
              <label className="block text-muted-foreground mb-1">Check OUT Time (IST)</label>
              <Input
                type="time"
                value={punchForm.checkOut}
                onChange={(e) => setPunchForm({ ...punchForm, checkOut: e.target.value })}
              />
            </div>
          )}

          {punchForm.actionType === 'FULL_DAY' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Check IN (IST)</label>
                <Input
                  type="time"
                  value={punchForm.checkIn}
                  onChange={(e) => setPunchForm({ ...punchForm, checkIn: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Check OUT (IST)</label>
                <Input
                  type="time"
                  value={punchForm.checkOut}
                  onChange={(e) => setPunchForm({ ...punchForm, checkOut: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-muted-foreground mb-1">Remarks (Optional)</label>
            <Input
              placeholder="e.g. Regular shift / Urgent overtime"
              value={punchForm.remarks}
              onChange={(e) => setPunchForm({ ...punchForm, remarks: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsPunchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={markMutation.isPending}>
              Confirm Punch
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* EDIT RECORD MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title={`Edit Attendance: ${editingRecord?.employee?.firstName} ${editingRecord?.employee?.lastName}`}
      >
        {editingRecord && (
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Date</label>
                <Input
                  disabled
                  value={editingRecord.date ? editingRecord.date.split('T')[0] : selectedDate}
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Status</label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
                >
                  <option value="PRESENT">Present</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Check IN (IST)</label>
                <Input
                  type="time"
                  value={(editingRecord as any)._inTime || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, _inTime: e.target.value } as any)}
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Check OUT (IST)</label>
                <Input
                  type="time"
                  value={(editingRecord as any)._outTime || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, _outTime: e.target.value } as any)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Lunch Start (IST)</label>
                <Input
                  type="time"
                  value={(editingRecord as any)._lunchStartTime || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, _lunchStartTime: e.target.value } as any)}
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Lunch End (IST)</label>
                <Input
                  type="time"
                  value={(editingRecord as any)._lunchEndTime || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, _lunchEndTime: e.target.value } as any)}
                />
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Remarks</label>
              <Input
                placeholder="Remarks"
                value={editingRecord.remarks || ''}
                onChange={(e) => setEditingRecord({ ...editingRecord, remarks: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
}
