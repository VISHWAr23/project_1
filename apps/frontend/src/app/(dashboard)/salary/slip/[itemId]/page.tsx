'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalarySlipDocument } from '@/components/salary/salary-slip-document';
import { useSalarySlip } from '@/hooks/useSalary';

export default function SalarySlipPage() {
  const params = useParams();
  const itemId = params.itemId as string;

  const { data: item, isLoading } = useSalarySlip(itemId);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Generating Salary Slip Document...</div>;
  }

  if (!item) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Salary slip document not found.
        <div className="mt-3">
          <Link href="/salary"><Button variant="outline" size="sm">Back to Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4 print:hidden">
        <Link href="/salary">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} className="px-2" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Employee Payslip PDF</h1>
          <p className="text-xs text-muted-foreground">Detailed salary slip for {item.employee?.firstName} {item.employee?.lastName}</p>
        </div>
      </div>

      <SalarySlipDocument item={item} />
    </motion.div>
  );
}
