import React, { useState } from 'react';
import { Play, Calendar, AlertCircle, Clock, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGeneratePayroll } from '@/hooks/useSalary';
import { useToast } from '@/components/ui/toast';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GeneratePayrollModal({ isOpen, onClose }: GeneratePayrollModalProps) {
  const { toast } = useToast();
  const generateMutation = useGeneratePayroll();

  const now = new Date();
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'WEEKLY'>('MONTHLY');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [weekNumber, setWeekNumber] = useState(1);
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

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
          toast('Payroll Generated', `Payroll batch ${data.payrollCode} calculated successfully (${periodType})`, 'success');
          onClose();
        },
        onError: (err: any) => {
          toast('Generation Failed', err.message || 'Could not generate payroll', 'error');
        },
      },
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-500">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Run Payroll Engine</h2>
              <p className="text-xs text-muted-foreground">Automated Base + OT + Advance deduction processing</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cycle Type Selector */}
          <div>
            <label className="text-muted-foreground block mb-1">Payroll Cycle *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriodType('MONTHLY')}
                className={`py-2 px-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  periodType === 'MONTHLY'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-bold'
                    : 'border-border text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Monthly Run</span>
              </button>

              <button
                type="button"
                onClick={() => setPeriodType('WEEKLY')}
                className={`py-2 px-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  periodType === 'WEEKLY'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold'
                    : 'border-border text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Weekly (Saturday)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground block mb-1">Month *</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full h-9 rounded-md bg-secondary/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-blue-500"
              >
                {monthNames.map((name, index) => (
                  <option key={index + 1} value={index + 1}>
                    {name} ({index + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Year *</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2100}
                className="text-xs"
              />
            </div>
          </div>

          {periodType === 'WEEKLY' && (
            <div>
              <label className="text-muted-foreground block mb-1">Week of Month (Saturday Salary Day) *</label>
              <select
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                className="w-full h-9 rounded-md bg-secondary/50 border border-border px-3 text-xs text-foreground focus:outline-none focus:border-purple-500"
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
            <label className="text-muted-foreground block mb-1">Batch Remarks (Optional)</label>
            <Input
              placeholder="e.g. Regular Saturday payroll with overtime"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {periodType === 'MONTHLY'
                ? `The engine will scan all monthly employees for ${monthNames[month - 1]} ${year}, calculate Base Salary + Total OT Pay, and deduct active advance installments.`
                : `The engine will calculate Week ${weekNumber} (Mon-Sat) for weekly employees, compute Base Weekly Salary + Saturday OT Pay, and deduct weekly advance repayments.`}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={generateMutation.isPending}
              leftIcon={<Play className="h-3.5 w-3.5 fill-current" />}
            >
              Generate {periodType === 'WEEKLY' ? 'Weekly' : 'Monthly'} Batch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

