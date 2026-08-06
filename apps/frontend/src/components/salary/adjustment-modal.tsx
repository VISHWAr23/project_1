import React, { useState, useEffect } from 'react';
import { Edit3, DollarSign, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdatePayrollAdjustment } from '@/hooks/useSalary';
import { useToast } from '@/components/ui/toast';
import { PayrollItem } from '@/types/salary.types';

interface AdjustmentModalProps {
  item: PayrollItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdjustmentModal({ item, isOpen, onClose }: AdjustmentModalProps) {
  const { toast } = useToast();
  const updateMutation = useUpdatePayrollAdjustment();

  const [bonusAmount, setBonusAmount] = useState(0);
  const [incentiveAmount, setIncentiveAmount] = useState(0);
  const [lateDeduction, setLateDeduction] = useState(0);
  const [advanceDeduction, setAdvanceDeduction] = useState(0);
  const [loanDeduction, setLoanDeduction] = useState(0);
  const [pfDeduction, setPfDeduction] = useState(0);
  const [esiDeduction, setEsiDeduction] = useState(0);
  const [professionalTax, setProfessionalTax] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  useEffect(() => {
    if (item) {
      setBonusAmount(Number(item.bonusAmount || 0));
      setIncentiveAmount(Number(item.incentiveAmount || 0));
      setLateDeduction(Number(item.lateDeduction || 0));
      setAdvanceDeduction(Number(item.advanceDeduction || 0));
      setLoanDeduction(Number(item.loanDeduction || 0));
      setPfDeduction(Number(item.pfDeduction || 0));
      setEsiDeduction(Number(item.esiDeduction || 0));
      setProfessionalTax(Number(item.professionalTax || 0));
      setOtherDeductions(Number(item.otherDeductions || 0));
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const basic = Number(item.basicSalary || 0);
  const gross = basic + bonusAmount + incentiveAmount;
  const deductions = lateDeduction + advanceDeduction + loanDeduction + pfDeduction + esiDeduction + professionalTax + otherDeductions;
  const net = Math.max(0, gross - deductions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        itemId: item.id,
        payload: {
          bonusAmount,
          incentiveAmount,
          lateDeduction,
          advanceDeduction,
          loanDeduction,
          pfDeduction,
          esiDeduction,
          professionalTax,
          otherDeductions,
        },
      },
      {
        onSuccess: () => {
          toast('Adjustments Saved', `Updated salary line item for ${item.employee?.firstName}`, 'success');
          onClose();
        },
        onError: (err: any) => {
          toast('Update Failed', err.message || 'Could not update adjustments', 'error');
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-border rounded-xl w-full max-w-xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Salary Line Item Adjustments</h2>
            <p className="text-xs text-muted-foreground">
              {item.employee?.firstName} {item.employee?.lastName} ({item.employee?.employeeCode})
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Net Payable</span>
            <span className="text-lg font-bold font-mono text-[#2563EB]">₹ {net.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Allowances & Additions */}
            <div className="space-y-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Additions & Incentives</h4>
              <div>
                <label className="text-[11px] text-muted-foreground block">Bonus Amount (₹)</label>
                <Input
                  type="number"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(Number(e.target.value))}
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block">Production Incentive (₹)</label>
                <Input
                  type="number"
                  value={incentiveAmount}
                  onChange={(e) => setIncentiveAmount(Number(e.target.value))}
                  className="text-xs h-8"
                />
              </div>
            </div>

            {/* Deductions & Recoveries */}
            <div className="space-y-3 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Deductions & Recoveries</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground block">Late Deduction</label>
                  <Input
                    type="number"
                    value={lateDeduction}
                    onChange={(e) => setLateDeduction(Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block">Salary Advance</label>
                  <Input
                    type="number"
                    value={advanceDeduction}
                    onChange={(e) => setAdvanceDeduction(Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground block">Loan Installment</label>
                  <Input
                    type="number"
                    value={loanDeduction}
                    onChange={(e) => setLoanDeduction(Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block">Prof. Tax (PT)</label>
                  <Input
                    type="number"
                    value={professionalTax}
                    onChange={(e) => setProfessionalTax(Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground block">PF Deduction</label>
                  <Input
                    type="number"
                    value={pfDeduction}
                    onChange={(e) => setPfDeduction(Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block">ESI Deduction</label>
                  <Input
                    type="number"
                    value={esiDeduction}
                    onChange={(e) => setEsiDeduction(Number(e.target.value))}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-background border border-border flex items-center justify-between text-xs font-mono">
            <div>Gross Salary: <span className="text-foreground font-bold">₹ {gross.toLocaleString('en-IN')}</span></div>
            <div>Total Deductions: <span className="text-rose-400 font-bold">₹ {deductions.toLocaleString('en-IN')}</span></div>
            <div>Net Pay: <span className="text-[#2563EB] font-bold">₹ {net.toLocaleString('en-IN')}</span></div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={updateMutation.isPending}>
              Save & Recalculate Payout
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
