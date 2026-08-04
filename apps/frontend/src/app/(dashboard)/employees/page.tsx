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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
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

  // Queries & Mutations
  const { data: employeesData, isLoading, refetch } = useEmployees({
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
    baseWage: 850,
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
        baseWage: 850,
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
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.joiningDate).toLocaleDateString()}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#3ECF8E]" />
            Staff & Employee Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Master records, departmental allocations, and employee status management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Employee Intake
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono">Total Staff</div>
            <div className="text-xl font-bold font-mono text-foreground">{stats.totalEmployees}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono">Active Staff</div>
            <div className="text-xl font-bold font-mono text-foreground">{stats.activeEmployees}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <UserX className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-mono">Inactive Staff</div>
            <div className="text-xl font-bold font-mono text-foreground">{stats.inactiveEmployees}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border/80 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Employee ID, Name, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-xs rounded-lg pl-9 pr-4 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E] font-mono"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="TERMINATED">TERMINATED</option>
              <option value="RESIGNED">RESIGNED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Employee Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-muted-foreground bg-card border border-border rounded-xl">
          Loading Staff Directory from Database...
        </div>
      ) : employees.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-card border border-border rounded-xl">
          <Users className="h-8 w-8 text-muted-foreground mx-auto" />
          <div className="text-sm font-bold text-foreground">No Employees Found</div>
          <div className="text-xs text-muted-foreground max-w-sm mx-auto">
            No active staff match the search query. Try clearing filters or create a new employee intake.
          </div>
        </div>
      ) : (
        <Table columns={columns} data={employees} keyExtractor={(row) => row.id} />
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New Employee Intake Form"
        description="Register a new staff member into the ERP database."
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

          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground block mb-1">Department</label>
              <select
                value={formData.departmentId || ''}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Designation</label>
              <select
                value={formData.designationId || ''}
                onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                className="w-full bg-secondary/50 border border-border text-xs rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              >
                <option value="">Select Designation</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground block mb-1">Joining Date</label>
              <Input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-muted-foreground block mb-1">Base Wage / Salary (₹)</label>
              <Input
                type="number"
                placeholder="850.00"
                value={formData.baseWage || ''}
                onChange={(e) => setFormData({ ...formData, baseWage: Number(e.target.value) })}
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
        description="Are you sure you want to deactivate and soft-delete this staff member?"
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
    </motion.div>
  );
}
