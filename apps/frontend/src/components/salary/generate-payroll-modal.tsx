import React, { useState } from 'react';
import { Play, Calendar, AlertCircle } from 'lucide-react';
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
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(
      { month, year, remarks },
      {
        onSuccess: (data) => {
          toast('Payroll Generated', `Payroll batch ${data.payrollCode} calculated successfully`, 'success');
          onClose();
        },
        onError: (err: any) => {
          toast('Generation Failed', err.message || 'Could not generate monthly payroll', 'error');
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
      <div className="bg-[#121214] border border-border rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Run Monthly Payroll Engine</h2>
              <p className="text-xs text-muted-foreground">Extract attendance & calculate salaries</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full h-9 rounded-md bg-background border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              >
                {monthNames.map((name, index) => (
                  <option key={index + 1} value={index + 1}>
                    {name} ({index + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Year</label>
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

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Batch Remarks (Optional)</label>
            <Input
              placeholder="e.g. Regular monthly payroll run with shift incentives"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              The engine will scan all daily check-in/out records for {monthNames[month - 1]} {year} and aggregate working days, OT hours, and statutory tax deductions.
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
              Execute Calculation Engine
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
