import React, { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, CreditCard, Edit3, ArrowUpDown } from 'lucide-react';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PayrollItem } from '@/types/salary.types';
import { formatWorkHours } from '@/lib/date-utils';

interface PayrollTableProps {
  items: PayrollItem[];
  isLoading?: boolean;
  onEditAdjustment?: (item: PayrollItem) => void;
  onRecordPayment?: (item: PayrollItem) => void;
}

export function PayrollTable({ items, isLoading, onEditAdjustment, onRecordPayment }: PayrollTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof PayrollItem>('netSalary');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const name = `${item.employee?.firstName} ${item.employee?.lastName}`.toLowerCase();
    const code = item.employee?.employeeCode.toLowerCase() || '';
    const dept = item.employee?.department?.name.toLowerCase() || '';
    return name.includes(search) || code.includes(search) || dept.includes(search);
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof PayrollItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const columns: Column<PayrollItem>[] = [
    {
      key: 'employeeCode',
      header: 'Employee Code',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-blue-500">{row.employee?.employeeCode}</span>
          <p className="text-[11px] text-muted-foreground">{row.salaryType}</p>
        </div>
      ),
    },
    {
      key: 'employeeName',
      header: 'Employee Name & Cycle',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.employee?.firstName} {row.employee?.lastName}</p>
          <p className="text-[11px] text-muted-foreground">
            {row.employee?.department?.name} • <span className="text-purple-400 font-bold">{row.periodType || row.employee?.salaryCycle || 'MONTHLY'}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'payableDays',
      header: 'Present / Payable',
      align: 'center',
      render: (row) => (
        <div className="text-center">
          <span className="font-mono font-medium text-foreground">{Number(row.presentDays)} / {Number(row.payableDays)} Days</span>
          {Number(row.absentDays) > 0 && (
            <p className="text-[10px] text-rose-500">{Number(row.absentDays)} Days Absent</p>
          )}
        </div>
      ),
    },
    {
      key: 'basicSalary',
      header: 'Base Salary',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className="font-mono text-xs font-semibold text-foreground">
            ₹{Number(row.basicSalary || 0).toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'overtimeSalary',
      header: 'Overtime (OT)',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className="font-mono text-xs font-semibold text-purple-400">
            +₹{Number(row.overtimeSalary || 0).toLocaleString('en-IN')}
          </span>
          <p className="text-[10px] text-muted-foreground">
            {formatWorkHours(row.overtimeHours, { zeroText: '0 hr' })} @ ₹{Number(row.overtimeRate || 0)}/hr
          </p>
        </div>
      ),
    },
    {
      key: 'grossSalary',
      header: 'Gross (Base+OT)',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-emerald-400">
            ₹{Number(row.grossSalary).toLocaleString('en-IN')}
          </span>
          {Number(row.bonusAmount) > 0 && (
            <p className="text-[10px] text-emerald-500">+₹{Number(row.bonusAmount)} Bonus</p>
          )}
        </div>
      ),
    },
    {
      key: 'totalDeductions',
      header: 'Deductions & Advance',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className="font-mono text-xs font-semibold text-rose-400">
            -₹{Number(row.totalDeductions).toLocaleString('en-IN')}
          </span>
          <p className="text-[10px] text-amber-400">
            Adv Ded: ₹{Number(row.advanceDeduction || 0)}
          </p>
        </div>
      ),
    },
    {
      key: 'netSalary',
      header: 'Net Payable',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className="font-mono text-sm font-bold text-blue-400">
            ₹{Number(row.netSalary).toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => {
        let variant: 'neutral' | 'success' | 'warning' | 'error' | 'info' = 'neutral';
        if (row.status === 'PAID') variant = 'success';
        else if (row.status === 'APPROVED') variant = 'info';
        else if (row.status === 'DRAFT') variant = 'warning';
        else if (row.status === 'CANCELLED') variant = 'error';

        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'DRAFT' && onEditAdjustment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditAdjustment(row)}
              leftIcon={<Edit3 className="h-3 w-3 text-amber-400" />}
              className="h-7 text-xs px-2"
            >
              Adjust
            </Button>
          )}

          {row.status === 'APPROVED' && onRecordPayment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRecordPayment(row)}
              leftIcon={<CreditCard className="h-3 w-3 text-[#2563EB]" />}
              className="h-7 text-xs px-2 text-[#2563EB] border-[#2563EB]/30"
            >
              Pay
            </Button>
          )}

          <Link href={`/salary/slip/${row.id}`} target="_blank">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FileText className="h-3 w-3 text-cyan-400" />}
              className="h-7 text-xs px-2"
            >
              Slip
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee code, name, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{sortedItems.length}</span> of {items.length} records
        </div>
      </div>

      <Table columns={columns} data={sortedItems} isLoading={isLoading} keyExtractor={(row) => row.id} />
    </div>
  );
}
