import React, { useState } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRecordSalaryPayment } from '@/hooks/useSalary';
import { useToast } from '@/components/ui/toast';
import { PayrollItem, PaymentMethod } from '@/types/salary.types';

interface PaymentModalProps {
  item: PayrollItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ item, isOpen, onClose }: PaymentModalProps) {
  const { toast } = useToast();
  const paymentMutation = useRecordSalaryPayment();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !item) return null;

  const netAmount = Number(item.netSalary || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    paymentMutation.mutate(
      {
        payrollItemId: item.id,
        amount: netAmount,
        paymentMethod,
        transactionRef,
        remarks,
      },
      {
        onSuccess: () => {
          toast('Payment Recorded', `Recorded disbursement of ₹ ${netAmount.toLocaleString('en-IN')} for ${item.employee?.firstName}`, 'success');
          onClose();
        },
        onError: (err: any) => {
          toast('Payment Failed', err.message || 'Could not record payment', 'error');
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-border rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#3ECF8E]/10 text-[#3ECF8E]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Disburse Salary Payment</h2>
              <p className="text-xs text-muted-foreground">
                {item.employee?.firstName} {item.employee?.lastName} ({item.employee?.employeeCode})
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 text-center">
            <span className="text-xs text-muted-foreground block">Net Salary Payout</span>
            <span className="text-2xl font-bold font-mono text-[#3ECF8E]">
              ₹ {netAmount.toLocaleString('en-IN')}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Bank: {item.employee?.bankName || 'N/A'} • A/C: {item.employee?.bankAccountNo || 'N/A'}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full h-9 rounded-md bg-background border border-border px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#3ECF8E]"
            >
              <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
              <option value="UPI">UPI Payment</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CASH">Cash Payment</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Transaction Reference / UTR Number
            </label>
            <Input
              placeholder="e.g. UTR123456789 or Cheque #00412"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Payment Remarks (Optional)</label>
            <Input
              placeholder="e.g. Cleared via corporate account"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={paymentMutation.isPending}
              leftIcon={<CreditCard className="h-3.5 w-3.5" />}
            >
              Confirm Disbursement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
