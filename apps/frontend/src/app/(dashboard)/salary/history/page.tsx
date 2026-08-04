'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, History, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSalaryHistory } from '@/hooks/useSalary';
import { SalaryHistoryRecord } from '@/types/salary.types';

export default function SalaryHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: historyList = [], isLoading } = useSalaryHistory();

  const filtered = historyList.filter((row) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const name = `${row.employee?.firstName} ${row.employee?.lastName}`.toLowerCase();
    const code = row.employee?.employeeCode?.toLowerCase() || '';
    return name.includes(search) || code.includes(search);
  });

  const columns: Column<SalaryHistoryRecord>[] = [
    {
      key: 'period',
      header: 'Pay Period',
      sortable: true,
      render: (row) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return <span className="font-mono font-bold text-foreground">{monthNames[row.month - 1]} {row.year}</span>;
      },
    },
    {
      key: 'employee',
      header: 'Employee Code & Name',
      render: (row) => (
        <div>
          <span className="font-mono font-semibold text-[#3ECF8E]">{row.employee?.employeeCode}</span>
          <p className="font-medium text-foreground text-xs">{row.employee?.firstName} {row.employee?.lastName}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.employee?.department?.name || 'Manufacturing'}
        </span>
      ),
    },
    {
      key: 'grossSalary',
      header: 'Gross Salary',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold text-foreground">
          ₹ {Number(row.grossSalary).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'totalDeductions',
      header: 'Deductions',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-rose-500">
          - ₹ {Number(row.totalDeductions).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'netSalary',
      header: 'Net Salary',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-[#3ECF8E]">
          ₹ {Number(row.netSalary).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <Badge variant={row.status === 'PAID' ? 'success' : 'info'}>{row.status}</Badge>,
    },
    {
      key: 'paymentDate',
      header: 'Disbursement Date',
      align: 'right',
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.paymentDate ? new Date(row.paymentDate).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link href="/salary">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} className="px-2" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Employee Salary History Ledger</h1>
            <p className="text-xs text-muted-foreground">Historical snapshot of staff monthly payouts and tax records</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      <Card className="p-5 border border-border/60">
        <Table columns={columns} data={filtered} isLoading={isLoading} keyExtractor={(row) => row.id} />
      </Card>
    </motion.div>
  );
}
