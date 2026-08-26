'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Calendar, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
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
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'WEEKLY'>('MONTHLY');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [weekNumber, setWeekNumber] = useState(1);
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(
      {
        periodType,
        month,
        year,
        weekNumber: periodType === 'WEEKLY' ? weekNumber : undefined,
        remarks,
      },
      {
        onSuccess: (data) => {
          toast('Payroll Batch Created', `Generated ${periodType} batch ${data.payrollCode}`, 'success');
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto font-mono text-xs">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/salary">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} className="px-2" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Generate Payroll Run</h1>
        </div>

      </div>

      <Card className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cycle Type Radio Toggle */}
          <div>
            <label className="text-muted-foreground font-semibold block mb-2">Select Payroll Frequency *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPeriodType('MONTHLY')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  periodType === 'MONTHLY'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                    : 'border-border text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Calendar className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-foreground">Monthly Payroll</div>
                  <div className="text-[11px] text-muted-foreground">1st to end-of-month calendar cycle</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPeriodType('WEEKLY')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  periodType === 'WEEKLY'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                    : 'border-border text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <CalendarDays className="h-5 w-5 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-foreground">Weekly Payroll (Saturday)</div>
                  <div className="text-[11px] text-muted-foreground">Mon-Sat work week with Saturday salary day</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Target Month *</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full h-10 rounded-md bg-secondary/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Target Year *</label>
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

          {periodType === 'WEEKLY' && (
            <div>
              <label className="text-muted-foreground font-semibold block mb-1">Week of Month (Saturday Cycle) *</label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="w-full h-10 rounded-md bg-secondary/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
              >
                <option value={1}>Week 1 (1st Saturday cycle)</option>
                <option value={2}>Week 2 (2nd Saturday cycle)</option>
                <option value={3}>Week 3 (3rd Saturday cycle)</option>
                <option value={4}>Week 4 (4th Saturday cycle)</option>
                <option value={5}>Week 5 (5th Saturday cycle)</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-muted-foreground font-semibold block mb-1">Calculation Remarks</label>
            <Input
              placeholder="e.g. Regular Saturday payroll with overtime calculation"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Automated Rules applied:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-muted-foreground">
              <li>Pulls attendance logs for active employees matching the <strong>{periodType}</strong> cycle.</li>
              <li>Standard Shift: <strong>09:00 AM – 06:30 PM</strong> (8 hr 30 min regular work) with 1 hr Lunch (1:30 - 2:30 PM).</li>
              <li>Calculates Overtime = net worked hours beyond 8 hr 30 min × individual OT hourly rate.</li>
              <li>Automatically deducts weekly advance repayment installments from gross wages.</li>
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
              Run {periodType === 'WEEKLY' ? 'Weekly' : 'Monthly'} Payroll
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
