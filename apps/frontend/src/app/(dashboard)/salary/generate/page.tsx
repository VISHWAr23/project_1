'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGeneratePayroll } from '@/hooks/useSalary';
import { useToast } from '@/components/ui/toast';

export default function GeneratePayrollPage() {
  const router = useRouter();
  const { toast } = useToast();
  const generateMutation = useGeneratePayroll();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(
      { month, year, remarks },
      {
        onSuccess: (data) => {
          toast('Payroll Batch Created', `Generated batch ${data.payrollCode}`, 'success');
          router.push(`/salary/${data.id}`);
        },
        onError: (err: any) => {
          toast('Generation Error', err.message || 'Could not generate payroll', 'error');
        },
      },
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/salary">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} className="px-2" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Generate Monthly Payroll</h1>
          <p className="text-xs text-muted-foreground">Extract attendance logs and run salary calculation rules</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Target Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full h-10 rounded-md bg-background border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Target Year</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2100}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Calculation Remarks</label>
            <Input
              placeholder="e.g. Monthly batch calculation for plant staff"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Automated Rules applied:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-muted-foreground">
              <li>Pulls attendance logs for active employees for the selected month.</li>
              <li>Calculates Basic Salary = (Base Wage / 26) × Payable Days.</li>
              <li>Applies Professional Tax slab (₹200 for Gross &gt; ₹15,000).</li>
              <li>Prepares draft batch ready for HR review & Admin approval.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/salary">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={generateMutation.isPending}
              leftIcon={<Play className="h-4 w-4 fill-current" />}
            >
              Run Payroll Engine Now
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
