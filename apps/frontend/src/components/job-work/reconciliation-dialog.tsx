import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { JobWorkOrder } from '@/types/job-work.types';

interface ReconciliationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: JobWorkOrder;
  onConfirmClose: (remarks: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReconciliationDialog({
  isOpen,
  onClose,
  order,
  onConfirmClose,
  isLoading,
}: ReconciliationDialogProps) {
  const [remarks, setRemarks] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const issuedWeight = Number(order.totalIssuedWeight) || 0;
  const returnedWeight = Number(order.totalReturnedWeight) || 0;
  const wastageWeight = Number(order.totalWastageWeight) || 0;
  const pendingWeight = Number(order.pendingWeight) || 0;

  const totalAccounted = returnedWeight + wastageWeight;
  const difference = issuedWeight - totalAccounted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    await onConfirmClose(remarks);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Close Job Work Order & Reconcile Variance"
      description={`Reconcile material balance for ${order.jobWorkNumber} (${order.jobWorkCompany.companyName})`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Reconcile Metrics Card */}
        <div className="bg-muted/30 border border-border p-4 rounded-lg space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Issued Weight</span>
              <span className="font-mono font-bold text-foreground text-sm">{issuedWeight.toFixed(2)} Kg</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Returned Weight</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{returnedWeight.toFixed(2)} Kg</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Scrap / Wastage</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{wastageWeight.toFixed(2)} Kg</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Variance / Loss</span>
              <span className={`font-mono font-bold text-sm ${difference > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {difference.toFixed(2)} Kg
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-3 flex items-center justify-between text-xs font-mono">
            <span>Pending Weight Status:</span>
            {pendingWeight > 0 ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {pendingWeight.toFixed(2)} Kg Remaining
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                0.00 Kg (Fully Accounted)
              </span>
            )}
          </div>
        </div>

        {difference > 0 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              There is an unaccounted variance of <strong>{difference.toFixed(2)} Kg</strong>. Closing this order will log this variance into the stock loss audit ledger.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-foreground">
            Closing Remarks & Wastage Notes
          </label>
          <textarea
            rows={3}
            placeholder="Enter scrap wastage, shrinkage reasons, or closure variance notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-sans"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="confirm-close"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
          />
          <label htmlFor="confirm-close" className="text-xs text-foreground font-medium cursor-pointer">
            I confirm all return rolls have been inspected and this Job Work Order should be permanently closed.
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!confirmed || isLoading}
            isLoading={isLoading}
            leftIcon={<Lock className="h-4 w-4" />}
          >
            Close Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
