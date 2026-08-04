'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Plus, ListFilter, CheckCircle, Clock, ShieldCheck, History, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SalaryKpiCards } from '@/components/salary/salary-kpi-cards';

import { PayrollTable } from '@/components/salary/payroll-table';
import { GeneratePayrollModal } from '@/components/salary/generate-payroll-modal';
import { AdjustmentModal } from '@/components/salary/adjustment-modal';
import { PaymentModal } from '@/components/salary/payment-modal';
import { useSalaryDashboard, usePayrollRuns } from '@/hooks/useSalary';
import { PayrollItem } from '@/types/salary.types';

export default function SalaryDashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useSalaryDashboard();
  const { data: runsData, isLoading: isRunsLoading } = usePayrollRuns({ page: 1, limit: 1 });

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedAdjustmentItem, setSelectedAdjustmentItem] = useState<PayrollItem | null>(null);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<PayrollItem | null>(null);

  const currentRun = summary?.currentRun || runsData?.items?.[0];
  const items = currentRun?.items || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Salary & Payroll Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Attendance-driven monthly payroll engine, deductions, approval workflows, and payslips.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/salary/history">
            <Button variant="outline" size="sm" leftIcon={<History className="h-3.5 w-3.5" />}>
              Salary History
            </Button>
          </Link>
          <Link href="/salary/approval">
            <Button variant="outline" size="sm" leftIcon={<CheckCircle className="h-3.5 w-3.5 text-cyan-400" />}>
              Approvals
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            leftIcon={<Play className="h-3.5 w-3.5 fill-current" />}
          >
            Run Monthly Payroll
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <SalaryKpiCards summary={summary} isLoading={isSummaryLoading} />


      {/* Active Run Table Section */}
      <Card className="p-5 border border-border/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm">
                  {currentRun ? `Payroll Batch ${currentRun.payrollCode}` : 'Current Month Payroll'}
                </h3>
                {currentRun && (
                  <Badge
                    variant={
                      currentRun.status === 'PAID'
                        ? 'success'
                        : currentRun.status === 'APPROVED'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {currentRun.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentRun ? `${currentRun.totalEmployees} Employee Records Calculated` : 'No active batch generated yet.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/salary/list">
              <Button variant="ghost" size="sm" leftIcon={<ListFilter className="h-3.5 w-3.5" />}>
                View All Batches
              </Button>
            </Link>
            {currentRun && (
              <Link href={`/salary/${currentRun.id}`}>
                <Button variant="outline" size="sm">
                  Batch Details
                </Button>
              </Link>
            )}
          </div>
        </div>

        {items.length > 0 ? (
          <PayrollTable
            items={items}
            isLoading={isRunsLoading}
            onEditAdjustment={(item) => setSelectedAdjustmentItem(item)}
            onRecordPayment={(item) => setSelectedPaymentItem(item)}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground space-y-3">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="text-xs font-medium">No payroll batch currently open for this period.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateOpen(true)}
              leftIcon={<Play className="h-3.5 w-3.5 fill-current" />}
            >
              Generate Payroll Now
            </Button>
          </div>
        )}
      </Card>

      {/* Modals */}
      <GeneratePayrollModal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} />
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
