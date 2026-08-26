'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, CheckCircle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, Column } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePayrollRuns } from '@/hooks/useSalary';

export default function SalaryPaymentsPage() {
  const { data, isLoading } = usePayrollRuns({ status: 'APPROVED' as any });
  const approvedRuns = data?.items || [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Link href="/salary">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} className="px-2" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Salary Disbursement & Payment Ledger</h1>
        </div>

      </div>

      <Card className="p-5 border border-border/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground">Approved Batches Ready For Payment</h3>
          <span className="text-xs text-muted-foreground">{approvedRuns.length} Batches Awaiting Disbursement</span>
        </div>

        {approvedRuns.length > 0 ? (
          <div className="space-y-3">
            {approvedRuns.map((run) => (
              <div
                key={run.id}
                className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#3ECF8E] text-sm">{run.payrollCode}</span>
                    <Badge variant="info">APPROVED</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {run.totalEmployees} Employees • Net Payout: <span className="font-bold text-foreground font-mono">₹ {Number(run.totalNet).toLocaleString('en-IN')}</span>
                  </p>
                </div>

                <Link href={`/salary/${run.id}`}>
                  <Button variant="primary" size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />}>
                    Process Staff Payments
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <CheckCircle className="h-10 w-10 mx-auto text-[#3ECF8E]/60" />
            <p className="text-sm font-semibold text-foreground">All Payouts Disbursed</p>
            <p className="text-xs">There are no approved payroll batches pending payment processing.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
