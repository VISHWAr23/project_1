'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, FileText, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SalaryNavTabs } from '@/components/salary/salary-nav-tabs';
import { usePayrollRuns, useApprovePayroll } from '@/hooks/useSalary';
import { useToast } from '@/components/ui/toast';
import { PayrollRun } from '@/types/salary.types';

export default function PayrollApprovalPage() {
  const { toast } = useToast();
  const { data, isLoading } = usePayrollRuns({ status: 'DRAFT' as any });
  const approveMutation = useApprovePayroll();

  const runs = data?.items || [];

  const handleApprove = (id: string, code: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        toast('Payroll Approved', `Batch ${code} has been approved and locked for payout`, 'success');
      },
      onError: (err: any) => {
        toast('Approval Failed', err.message || 'Could not approve batch', 'error');
      },
    });
  };

  const columns: Column<PayrollRun>[] = [
    {
      key: 'payrollCode',
      header: 'Payroll Code',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{row.payrollCode}</span>
          <p className="text-[11px] text-muted-foreground">Generated {new Date(row.generatedAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'totalEmployees',
      header: 'Total Employees',
      align: 'center',
      render: (row) => <span className="font-mono text-center block">{row.totalEmployees} Staff</span>,
    },
    {
      key: 'totalGross',
      header: 'Gross Salary',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-semibold text-foreground">
          ₹ {Number(row.totalGross).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'totalNet',
      header: 'Net Salary Payout',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-emerald-400">
          ₹ {Number(row.totalNet).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <Badge variant="warning">{row.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Approval Action',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/salary/${row.id}`}>
            <Button variant="outline" size="sm" leftIcon={<Eye className="h-3 w-3" />}>
              Review Items
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleApprove(row.id, row.payrollCode)}
            isLoading={approveMutation.isPending}
            leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
          >
            Approve Batch
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Pending Payroll Approvals
          </h1>
        </div>
      </div>

      {/* Unified Module Navigation Tabs */}
      <SalaryNavTabs />

      <Card className="p-5 border border-border/60 space-y-4">
        {runs.length > 0 ? (
          <Table columns={columns} data={runs} isLoading={isLoading} keyExtractor={(row) => row.id} />
        ) : (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <CheckCircle className="h-10 w-10 mx-auto text-emerald-400/60" />
            <p className="text-sm font-semibold text-foreground">No Pending Approvals</p>
            <p className="text-xs">All generated monthly payroll batches have been approved or disbursed.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
