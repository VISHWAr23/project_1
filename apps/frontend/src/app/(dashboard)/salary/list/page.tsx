'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, FileText, CheckCircle, Clock, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePayrollRuns } from '@/hooks/useSalary';
import { PayrollRun, PayrollStatus } from '@/types/salary.types';
import { GeneratePayrollModal } from '@/components/salary/generate-payroll-modal';

export default function PayrollListPage() {
  const [statusFilter, setStatusFilter] = useState<PayrollStatus | 'ALL'>('ALL');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const { data, isLoading } = usePayrollRuns({ status: statusFilter as any });

  const runs = data?.items || [];

  const columns: Column<PayrollRun>[] = [
    {
      key: 'payrollCode',
      header: 'Payroll Code',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-[#3ECF8E]">{row.payrollCode}</span>
          <p className="text-[11px] text-muted-foreground">Generated {new Date(row.generatedAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Period (Month/Year)',
      sortable: true,
      render: (row) => {
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return (
          <span className="font-semibold text-foreground">
            {monthNames[row.month - 1]} {row.year}
          </span>
        );
      },
    },
    {
      key: 'totalEmployees',
      header: 'Employees',
      align: 'center',
      render: (row) => <span className="font-mono text-center block">{row.totalEmployees}</span>,
    },
    {
      key: 'totalGross',
      header: 'Total Gross Payout',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold text-foreground">
          ₹ {Number(row.totalGross).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'totalDeductions',
      header: 'Total Deductions',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-rose-500">
          - ₹ {Number(row.totalDeductions).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'totalNet',
      header: 'Total Net Payout',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-[#3ECF8E]">
          ₹ {Number(row.totalNet).toLocaleString('en-IN')}
        </span>
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
        <Link href={`/salary/${row.id}`}>
          <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
            View Matrix
          </Button>
        </Link>
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
            <h1 className="text-xl font-bold text-foreground">Monthly Payroll Batches</h1>
          </div>

        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsGenerateOpen(true)}
          leftIcon={<Play className="h-3.5 w-3.5 fill-current" />}
        >
          New Payroll Run
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 rounded-md bg-background border border-border px-2 text-xs text-foreground focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={runs} isLoading={isLoading} keyExtractor={(row) => row.id} />
      </Card>

      <GeneratePayrollModal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} />
    </motion.div>
  );
}
