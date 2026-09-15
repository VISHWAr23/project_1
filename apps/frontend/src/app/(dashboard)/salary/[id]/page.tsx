'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, FileText, DollarSign, Download, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PayrollTable } from '@/components/salary/payroll-table';
import { AdjustmentModal } from '@/components/salary/adjustment-modal';
import { PaymentModal } from '@/components/salary/payment-modal';
import { usePayrollRunDetail, useApprovePayroll, useCancelPayroll } from '@/hooks/useSalary';
import { useToast } from '@/components/ui/toast';
import { PayrollItem } from '@/types/salary.types';

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();

  const { data: run, isLoading } = usePayrollRunDetail(id);
  const approveMutation = useApprovePayroll();
  const cancelMutation = useCancelPayroll();

  const [selectedAdjustmentItem, setSelectedAdjustmentItem] = useState<PayrollItem | null>(null);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PayrollItem | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading payroll batch details...</div>;
  }

  if (!run) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Payroll run not found.
        <div className="mt-3">
          <Link href="/salary"><Button variant="outline" size="sm">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        toast('Payroll Approved', `Batch ${run.payrollCode} has been approved and locked. Salary slips generated.`, 'success');
      },
      onError: (err: any) => {
        toast('Approval Failed', err.message || 'Could not approve payroll', 'error');
      },
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast('Payroll Cancelled', `Batch ${run.payrollCode} has been cancelled.`, 'warning');
      },
      onError: (err: any) => {
        toast('Cancellation Failed', err.message || 'Could not cancel payroll', 'error');
      },
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="px-2"
            title="Back"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-foreground">{run.payrollCode}</h1>
              <Badge
                variant={
                  run.status === 'PAID'
                    ? 'success'
                    : run.status === 'APPROVED'
                    ? 'info'
                    : run.status === 'DRAFT'
                    ? 'warning'
                    : 'error'
                }
              >
                {run.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Period: {monthNames[run.month - 1]} {run.year} • Generated {new Date(run.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {run.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              isLoading={approveMutation.isPending}
              leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
            >
              Approve Payroll Batch
            </Button>
          )}

          {run.status !== 'PAID' && run.status !== 'CANCELLED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              isLoading={cancelMutation.isPending}
              leftIcon={<XCircle className="h-3.5 w-3.5" />}
            >
              Cancel Batch
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground block">Total Staff Processed</span>
          <span className="text-xl font-bold font-mono text-foreground mt-1 block">{run.totalEmployees} Staff</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground block">Total Gross Salary</span>
          <span className="text-xl font-bold font-mono text-foreground mt-1 block">
            ₹ {Number(run.totalGross).toLocaleString('en-IN')}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground block">Total Deductions</span>
          <span className="text-xl font-bold font-mono text-rose-500 mt-1 block">
            - ₹ {Number(run.totalDeductions).toLocaleString('en-IN')}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground block">Total Net Payout</span>
          <span className="text-xl font-bold font-mono text-[#3ECF8E] mt-1 block">
            ₹ {Number(run.totalNet).toLocaleString('en-IN')}
          </span>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="p-5 border border-border/60">
        <PayrollTable
          items={run.items || []}
          isLoading={false}
          onEditAdjustment={(item) => setSelectedAdjustmentItem(item)}
          onRecordPayment={(item) => setSelectedPaymentItem(item)}
        />
      </Card>

      {/* Modals */}
      <AdjustmentModal
        item={selectedAdjustmentItem}
        isOpen={Boolean(selectedAdjustmentItem)}
        onClose={() => setSelectedAdjustmentItem(null)}
      />
      <PaymentModal
        item={selectedPaymentItem}
        isOpen={Boolean(selectedPaymentItem)}
        onClose={() => setSelectedPaymentItem(null)}
      />
    </motion.div>
  );
}
