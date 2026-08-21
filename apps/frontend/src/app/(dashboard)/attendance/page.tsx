'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Check,
  Clock,
  Users,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Edit,
  Award,
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
  useBulkAttendance,
  useUpdateAttendance,
} from '@/hooks/useAttendance';
import { useEmployees, useDepartments } from '@/hooks/useEmployees';
import { AttendanceRecord, AttendanceStatus } from '@/types/attendance.types';

export default function AttendancePage() {
  const { toast } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  // State
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [activeTab, setActiveTab] = useState<'daily' | 'mark' | 'bulk' | 'calendar'>('daily');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Month Calendar State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Modals
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  // Queries
  const { data: todayStats } = useTodayAttendance(selectedDate);
  const { data: attendanceData, isLoading, refetch } = useAttendance({
    date: selectedDate,
    search,
    departmentId: deptFilter,
    status: statusFilter,
  });

  const { data: activeEmployeesData } = useEmployees({ status: 'ACTIVE', limit: 100 });
  const { data: departments = [] } = useDepartments();
  const { data: monthSummaryData } = useMonthAttendance(selectedMonth, selectedYear, deptFilter);

  // Mutations
  const markMutation = useMarkAttendance();
  const bulkMutation = useBulkAttendance();
  const updateMutation = useUpdateAttendance();

  // Single Mark Form State
  const [singleForm, setSingleForm] = useState({
    employeeId: '',
    date: todayStr,
    status: 'PRESENT' as AttendanceStatus,
    remarks: '',
  });

  // Bulk Attendance State
  const [bulkRecords, setBulkRecords] = useState<{ [empId: string]: AttendanceStatus }>({});

  const activeEmployees = activeEmployeesData?.items || [];

  // Auto-initialize bulkRecords to PRESENT for all active employees
  React.useEffect(() => {
    if (activeEmployees.length > 0) {
      setBulkRecords((prev) => {
        const updated = { ...prev };
        activeEmployees.forEach((emp) => {
          if (!updated[emp.id]) {
            updated[emp.id] = 'PRESENT';
          }
        });
        return updated;
      });
    }
  }, [activeEmployees]);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.employeeId) {
      toast('Validation Error', 'Please select an active employee', 'error');
      return;
    }

    try {
      await markMutation.mutateAsync({
        employeeId: singleForm.employeeId,
        date: singleForm.date,
        status: singleForm.status,
        remarks: singleForm.remarks,
      });

      toast('Attendance Marked', 'Log saved successfully in database', 'success');
      setSingleForm({
        employeeId: '',
        date: todayStr,
        status: 'PRESENT',
        remarks: '',
      });
      setActiveTab('daily');
    } catch (err: any) {
      toast('Submission Failed', err?.message || 'Could not save attendance log', 'error');
    }
  };

  const handleBulkSubmit = async () => {
    if (activeEmployees.length === 0) {
      toast('No Active Employees', 'No active staff found to mark attendance', 'warning');
      return;
    }

    const recordsToSubmit = activeEmployees.map((emp) => {
      const status = bulkRecords[emp.id] || 'PRESENT';
      return {
        employeeId: emp.id,
        date: selectedDate,
        status,
      };
    });

    try {
      await bulkMutation.mutateAsync({
        date: selectedDate,
        records: recordsToSubmit,
      });

      toast('Bulk Attendance Saved', `Processed attendance for ${recordsToSubmit.length} active employees`, 'success');
      setActiveTab('daily');
    } catch (err: any) {
      toast('Bulk Failed', err?.message || 'Could not save bulk attendance', 'error');
    }
  };

  const handleEditRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      await updateMutation.mutateAsync({
        id: editingRecord.id,
        payload: {
          status: editingRecord.status,
          remarks: editingRecord.remarks || undefined,
        },
      });

      toast('Record Updated', 'Attendance modifications saved', 'success');
      setEditingRecord(null);
    } catch (err: any) {
      toast('Update Failed', err?.message || 'Could not update log', 'error');
    }
  };

  const logs = attendanceData?.items || [];

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'employeeCode',
      header: 'Emp Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#3ECF8E]">{row.employee?.employeeCode}</span>
      ),
    },
    {
      key: 'name',
      header: 'Employee Name & Dept',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={`${row.employee?.firstName} ${row.employee?.lastName}`} size="sm" />
          <div>
            <div className="font-semibold text-foreground text-xs">
              {row.employee?.firstName} {row.employee?.lastName}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {row.employee?.department?.name || 'Unassigned'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Attendance Status',
      align: 'center',
      render: (row) => (
        <Badge
          variant={
            row.status === 'PRESENT'
              ? 'success'
              : row.status === 'ABSENT'
              ? 'error'
              : 'warning'
          }
        >
          {row.status === 'PRESENT' ? 'PRESENT (Full Day)' : row.status === 'HALF_DAY' ? 'HALF DAY' : row.status}
        </Badge>
      ),
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.remarks || '—'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditingRecord(row)}
          leftIcon={<Edit className="h-3.5 w-3.5" />}
        >
          Edit Status
        </Button>
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Daily Attendance Register
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-secondary/50 border border-border px-3 py-1.5 rounded-lg">
            <CalendarIcon className="h-4 w-4 text-[#3ECF8E]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-mono text-foreground focus:outline-none"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Sync
          </Button>
        </div>
      </div>

      {/* KPI Dashboard Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E]">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-mono">Active Staff</div>
            <div className="text-lg font-bold font-mono text-foreground">{todayStats?.totalActiveEmployees || 0}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-mono">Present (Full Day)</div>
            <div className="text-lg font-bold font-mono text-emerald-400">{todayStats?.presentToday || 0}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
            <UserX className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-mono">Absent Today</div>
            <div className="text-lg font-bold font-mono text-red-400">{todayStats?.absentToday || 0}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-mono">Half Day</div>
            <div className="text-lg font-bold font-mono text-amber-400">{todayStats?.halfDayToday || 0}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground font-mono">On Leave</div>
            <div className="text-lg font-bold font-mono text-blue-400">{todayStats?.leaveToday || 0}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 font-mono text-xs overflow-x-auto">
        {[
          { key: 'daily', label: '📋 Daily Attendance Sheet' },
          { key: 'mark', label: '✍️ Mark Single Attendance' },
          { key: 'bulk', label: '⚡ Bulk Attendance Marking' },
          { key: 'calendar', label: '📅 Monthly Calendar Grid' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/30 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Daily Attendance Sheet */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="bg-card border border-border/80 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employee name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-xs rounded-lg pl-9 pr-4 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E] font-mono"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E] font-mono"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E] font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">PRESENT (Full Day)</option>
              <option value="HALF_DAY">HALF DAY</option>
              <option value="ABSENT">ABSENT</option>
              <option value="LEAVE">LEAVE</option>
            </select>
          </div>

          <Table
            columns={columns}
            data={logs}
            isLoading={isLoading}
            emptyMessage={`No attendance logs found for ${selectedDate}. Use the Mark Single or Bulk Attendance tabs to record entries.`}
            keyExtractor={(row) => row.id}
          />
        </div>
      )}

      {/* Tab 2: Mark Single Attendance */}
      {activeTab === 'mark' && (
        <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
            Log Attendance for Individual Employee
          </h3>

          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-muted-foreground mb-1">Select Active Employee *</label>
              <select
                required
                value={singleForm.employeeId}
                onChange={(e) => setSingleForm({ ...singleForm, employeeId: e.target.value })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              >
                <option value="">-- Choose Active Staff Member --</option>
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeCode} - {emp.firstName} {emp.lastName} ({emp.department?.name || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1">Attendance Date *</label>
                <Input
                  type="date"
                  max={todayStr}
                  value={singleForm.date}
                  onChange={(e) => setSingleForm({ ...singleForm, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Attendance Status *</label>
                <select
                  value={singleForm.status}
                  onChange={(e) => setSingleForm({ ...singleForm, status: e.target.value as AttendanceStatus })}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
                >
                  <option value="PRESENT">PRESENT (Full Day)</option>
                  <option value="HALF_DAY">HALF DAY</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LEAVE">LEAVE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Remarks</label>
              <Input
                placeholder="e.g. Approved leave / regular duty"
                value={singleForm.remarks}
                onChange={(e) => setSingleForm({ ...singleForm, remarks: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button type="submit" variant="primary" isLoading={markMutation.isPending}>
                Save Attendance Log
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Bulk Attendance Marking */}
      {activeTab === 'bulk' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-foreground">Bulk Staff Attendance Sheet</div>
              <div className="text-muted-foreground text-[11px]">
                Mark status (Present / Half Day / Absent / Leave) for active staff on: <strong>{selectedDate}</strong>
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={handleBulkSubmit} isLoading={bulkMutation.isPending}>
              Save Bulk Attendance ({activeEmployees.length} staff)
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            {activeEmployees.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No active employees found to mark bulk attendance.</div>
            ) : (
              <div className="divide-y divide-border/40">
                {activeEmployees.map((emp) => {
                  const currentStatus = bulkRecords[emp.id] || 'PRESENT';
                  return (
                    <div key={emp.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                        <div>
                          <div className="font-bold text-foreground">
                            {emp.firstName} {emp.lastName} <span className="text-[#3ECF8E]">({emp.employeeCode})</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {emp.department?.name || 'Staff'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { key: 'PRESENT', label: 'Full Day' },
                          { key: 'HALF_DAY', label: 'Half Day' },
                          { key: 'ABSENT', label: 'Absent' },
                          { key: 'LEAVE', label: 'Leave' },
                        ].map((st) => (
                          <button
                            key={st.key}
                            type="button"
                            onClick={() => setBulkRecords({ ...bulkRecords, [emp.id]: st.key as AttendanceStatus })}
                            className={`px-3 py-1.5 rounded text-[11px] font-bold border transition-all ${
                              currentStatus === st.key
                                ? st.key === 'PRESENT'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : st.key === 'ABSENT'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                  : st.key === 'HALF_DAY'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                  : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Monthly Calendar Matrix View */}
      {activeTab === 'calendar' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm font-bold text-foreground">Monthly Attendance Breakdown</div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-secondary/50 border border-border text-xs rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    Month {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-secondary/50 border border-border text-xs rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
            {monthSummaryData?.employees?.length ? (
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="p-2 min-w-[150px]">Employee</th>
                    <th className="p-2 text-center">Present (Full Day)</th>
                    <th className="p-2 text-center">Half Day</th>
                    <th className="p-2 text-center">Absent</th>
                    <th className="p-2 text-center">Leave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {monthSummaryData.employees.map((emp) => (
                    <tr key={emp.employeeId} className="hover:bg-secondary/30">
                      <td className="p-2">
                        <div className="font-bold text-foreground">{emp.name}</div>
                        <div className="text-[10px] text-muted-foreground">{emp.employeeCode} • {emp.department}</div>
                      </td>
                      <td className="p-2 text-center font-bold text-emerald-400">{emp.totalPresent} Days</td>
                      <td className="p-2 text-center font-bold text-amber-400">{emp.totalHalfDay} Days</td>
                      <td className="p-2 text-center font-bold text-red-400">{emp.totalAbsent} Days</td>
                      <td className="p-2 text-center font-bold text-blue-400">{emp.totalLeave} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No monthly logs found for selected month.</div>
            )}
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      <Modal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Edit Attendance Log"
        description="Modify employee attendance status."
      >
        {editingRecord && (
          <form onSubmit={handleEditRecordSubmit} className="space-y-4 pt-2 font-mono text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">Employee</label>
              <div className="font-bold text-foreground">
                {editingRecord.employee?.firstName} {editingRecord.employee?.lastName} ({editingRecord.employee?.employeeCode})
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Attendance Status</label>
              <select
                value={editingRecord.status}
                onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as AttendanceStatus })}
                className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              >
                <option value="PRESENT">PRESENT (Full Day)</option>
                <option value="HALF_DAY">HALF DAY</option>
                <option value="ABSENT">ABSENT</option>
                <option value="LEAVE">LEAVE</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Remarks</label>
              <Input
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
