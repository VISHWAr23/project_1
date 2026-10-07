'use client';

import React from 'react';
import { Trash2, AlertTriangle, AlertCircle, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useDeleteJobWorkOrder } from '@/hooks/useJobWork';
import { JobWorkOrder } from '@/types/job-work.types';

interface JobWorkDeleteModalProps {
  order: JobWorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JobWorkDeleteModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: JobWorkDeleteModalProps) {
  const { toast } = useToast();
  const deleteMutation = useDeleteJobWorkOrder();

  if (!order) return null;

  const isCreated = order.status === 'CREATED';
  const isIssued = order.status === 'MATERIALS_ISSUED' || order.status === 'IN_PROGRESS';
  const isClosed = order.status === 'CLOSED';
  const hasReturns = Number(order.totalReturnedWeight) > 0 || (order.returnItems && order.returnItems.length > 0);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(order.id);
      toast(
        isIssued && !isClosed && !hasReturns ? 'Order Cancelled & Stock Restored' : 'Order Deleted',
        isIssued && !isClosed && !hasReturns
          ? `Job Work ${order.jobWorkNumber} cancelled and ${Number(order.totalIssuedWeight).toFixed(2)} kg restored to material inventory.`
          : `Job Work ${order.jobWorkNumber} has been permanently deleted.`,
        'success'
      );
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast('Action Failed', error?.message || 'Could not delete job work order', 'error');
    }
  };

  const getButtonText = () => {
    if (isClosed) return 'Permanently Delete Closed Order';
    if (hasReturns) return 'Delete Order & Remove Returns';
    if (isIssued) return 'Cancel Order & Restore Stock';
    return 'Delete Order';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete Job Work Order (${order.jobWorkType || 'STANDARD'})`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Notice based on order status and returns */}
        {isClosed ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs text-amber-300">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Delete Closed / Reconciled Order
            </div>
            <p>
              Job Work Order <strong className="text-foreground">{order.jobWorkNumber}</strong> is marked as <strong className="text-amber-400">CLOSED</strong>.
            </p>
            <p>
              Deleting will permanently remove this completed job work order along with its reconciliation details, received logs, and ledger items.
            </p>
          </div>
        ) : hasReturns ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs text-amber-300">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Delete Order with Recorded Returns
            </div>
            <p>
              Job Work Order <strong className="text-foreground">{order.jobWorkNumber}</strong> has already recorded returned goods ({Number(order.totalReturnedWeight).toFixed(2)} Kg).
            </p>
            <p>
              Deleting will remove this job work order and purge its associated return entries and received goods records.
            </p>
          </div>
        ) : isIssued ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3 text-xs text-red-300">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Cancel & Reverse Issued Stock
            </div>
            <p>
              This job work order is currently in <strong>{order.status}</strong> stage with <strong>{Number(order.totalIssuedWeight).toFixed(2)} Kg</strong> of raw materials dispatched.
            </p>
            <div className="p-2.5 bg-background/60 rounded-lg border border-red-500/20 text-foreground flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Deleting will cancel the order and automatically restore <strong>{Number(order.totalIssuedWeight).toFixed(2)} Kg</strong> back into your material inventory.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-secondary/40 border border-border rounded-xl space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
              <Trash2 className="h-4 w-4 text-red-400" />
              Confirm Deletion
            </div>
            <p>
              Are you sure you want to permanently delete Job Work Order <strong className="text-foreground">{order.jobWorkNumber}</strong> for <strong className="text-foreground">{order.jobWorkCompany?.companyName}</strong>?
            </p>
            <p className="text-muted-foreground">No materials have been dispatched yet. This action cannot be undone.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white border-none"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
