'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Briefcase,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle,
  UserCheck,
  UserX,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { Table, Column } from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import {
  useEmployees,
  useDepartments,
  useDesignations,
  useCreateEmployee,
  useDeleteEmployee,
} from '@/hooks/useEmployees';
import { Employee, CreateEmployeePayload } from '@/types/employee.types';
import { EmployeeReportModal } from '@/components/employee/employee-report-modal';

export default function EmployeesPage() {
  const { toast } = useToast();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [reportEmployee, setReportEmployee] = useState<Employee | null>(null);

  // Queries & Mutations
  const { data: employeesData, isLoading, isError, error, refetch } = useEmployees({
    search,
    departmentId: deptFilter,
    status: statusFilter,
    page,
    limit: 15,
  });

  const { data: departments = [] } = useDepartments();
  const { data: designations = [] } = useDesignations();

  const createEmployeeMutation = useCreateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  // Intake Form State
  const [formData, setFormData] = useState<CreateEmployeePayload>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salaryType: 'Monthly Salary',
    salaryCycle: 'MONTHLY',
    baseWage: 15000,
    otRatePerHour: 100,
    departmentId: '',
    designationId: '',
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast('Validation Error', 'First name and last name are required', 'error');
      return;
    }

    try {
      const created = await createEmployeeMutation.mutateAsync({
        ...formData,
        departmentId: formData.departmentId || undefined,
        designationId: formData.designationId || undefined,
      });

      toast('Employee Profile Created', `${created.firstName} ${created.lastName} (${created.employeeCode}) added successfully`, 'success');
      setIsCreateModalOpen(false);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        joiningDate: new Date().toISOString().split('T')[0],
        salaryType: 'Monthly Salary',
        salaryCycle: 'MONTHLY',
        baseWage: 15000,
        otRatePerHour: 100,
        departmentId: '',
        designationId: '',
      });
    } catch (err: any) {
      toast('Creation Failed', err?.message || 'Unable to save employee record', 'error');
    }
  };

  const handleConfirmSoftDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteEmployeeMutation.mutateAsync(deleteTargetId);
      toast('Staff Deactivated', 'Employee soft-deleted and set to inactive state', 'warning');
      setDeleteTargetId(null);
    } catch (err: any) {
      toast('Delete Failed', err?.message || 'Could not soft delete employee', 'error');
    }
  };

  const employees = employeesData?.items || [];
  const stats = employeesData?.stats || {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
  };

  const columns: Column<Employee>[] = [
    {
      key: 'employeeCode',
      header: 'Employee ID',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-[#3ECF8E] tracking-wider">{row.employeeCode}</span>
      ),
    },
    {
      key: 'firstName',
      header: 'Employee Name & Role',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={`${row.firstName} ${row.lastName}`}
            src={row.avatarUrl || undefined}
            size="sm"
          />
          <div>
            <div className="font-semibold text-foreground hover:text-[#3ECF8E] transition-colors">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {row.designation?.name || 'Staff'} • {row.department?.name || 'Unassigned'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Info',
      render: (row) => (
        <div className="space-y-0.5 font-mono text-xs">
          <div className="text-foreground">{row.phone || '—'}</div>
          <div className="text-muted-foreground text-[11px] truncate max-w-[180px]">
            {row.email ? row.email : 'No email'}
          </div>
        </div>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joined Date',
      width: '130px',
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.joiningDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'baseWage',
      header: 'Base Salary (₹/day)',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-500">
          ₹{Number(row.baseWage || 0).toLocaleString()} / day
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge
          variant={row.status === 'ACTIVE' ? 'success' : row.status === 'INACTIVE' ? 'warning' : 'error'}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReportEmployee(row)}
            leftIcon={<FileText className="h-3.5 w-3.5 text-blue-400" />}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            Report
          </Button>
          <Link href={`/employees/${row.id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
              Profile
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => setDeleteTargetId(row.id)}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Remove
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2 sm:gap-2.5">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 shrink-0" />
            Staff & Employee Directory
          </h1>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            className="flex-1 sm:flex-initial justify-center"
          >
            Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="flex-1 sm:flex-initial justify-center whitespace-nowrap"
          >
            New Intake
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-card border border-border rounded-xl p-2.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E] w-fit">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">Total Staff</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">{stats.totalEmployees}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-2.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">Active Staff</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">{stats.activeEmployees}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-2.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-amber-500/10 text-amber-400 w-fit">
            <UserX className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">Inactive Staff</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-foreground">{stats.inactiveEmployees}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border/80 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-sm sm:text-xs rounded-lg pl-9 pr-4 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E] font-mono"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-secondary/50 border border-border text-sm sm:text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E] font-mono flex-1 sm:flex-initial min-w-[130px]"
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
              className="bg-secondary/50 border border-border text-sm sm:text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E] font-mono flex-1 sm:flex-initial min-w-[120px]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="TERMINATED">TERMINATED</option>
              <option value="RESIGNED">RESIGNED</option>
            </select>
          </div>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-rose-400 font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              Unable to fetch employees: {(error as Error)?.message || 'Server or network error'}.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Main Employee Table */}
      <Table
        columns={columns}
        data={employees}
        isLoading={isLoading}
        emptyMessage="No active staff match the search query. Try clearing filters or create a new employee intake."
        keyExtractor={(row) => row.id}
      />

      {/* Add Employee Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Employee Intake Form"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground block mb-1">First Name *</label>
              <Input
                required
                placeholder="e.g. Ramesh"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Last Name *</label>
              <Input
                required
                placeholder="e.g. Kumar"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground block mb-1">Phone Number</label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Email Address (Optional)</label>
              <Input
                type="email"
                placeholder="Optional"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MasterEntityDropdown
              label="Department"
              entityType="department"
              placeholder="Select Department..."
              options={departments.map((d) => ({ label: d.name, value: d.id, raw: d }))}
              value={formData.departmentId || ''}
              onChange={(val) => setFormData({ ...formData, departmentId: val })}
            />

            <MasterEntityDropdown
              label="Designation"
              entityType="designation"
              placeholder="Select Designation..."
              options={designations.map((d) => ({ label: d.name, value: d.id, raw: d }))}
              value={formData.designationId || ''}
              onChange={(val) => setFormData({ ...formData, designationId: val })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-muted-foreground block mb-1">Salary Cycle *</label>
              <select
                value={formData.salaryCycle || 'MONTHLY'}
                onChange={(e) => setFormData({ ...formData, salaryCycle: e.target.value })}
                className="w-full bg-secondary/50 border border-border text-sm sm:text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly (Saturday Pay)</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Base Salary (₹ / Day) *</label>
              <Input
                type="number"
                placeholder="e.g. 850"
                value={formData.baseWage || ''}
                onChange={(e) => setFormData({ ...formData, baseWage: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">OT Rate / Hour (₹) *</label>
              <Input
                type="number"
                placeholder="e.g. 150"
                value={formData.otRatePerHour || ''}
                onChange={(e) => setFormData({ ...formData, otRatePerHour: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createEmployeeMutation.isPending}>
              Create Employee
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Modal */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Soft Delete Employee Record"
      >

        <div className="space-y-4 pt-2">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 text-amber-400 text-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              This will mark the employee as <strong>INACTIVE</strong> and set a deletion timestamp.
              Historical attendance logs and audit logs will remain intact.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmSoftDelete}
              isLoading={deleteEmployeeMutation.isPending}
            >
              Confirm Soft Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Employee Report Modal */}
      {reportEmployee && (
        <EmployeeReportModal
          isOpen={Boolean(reportEmployee)}
          onClose={() => setReportEmployee(null)}
          employeeId={reportEmployee.id}
          employeeName={`${reportEmployee.firstName} ${reportEmployee.lastName}`}
        />
      )}
    </motion.div>
  );
}

