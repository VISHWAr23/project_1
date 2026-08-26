import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useRecordStockTransaction } from '@/hooks/useRawMaterials';
import { RawMaterial, StockTransactionPayload } from '@/types/raw-materials.types';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, AlertCircle } from 'lucide-react';

interface StockAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  material: RawMaterial;
}

export function StockAdjustmentDialog({ isOpen, onClose, material }: StockAdjustmentDialogProps) {
  const { toast } = useToast();
  const recordTransaction = useRecordStockTransaction();

  const [transactionType, setTransactionType] = useState<StockTransactionPayload['transactionType']>('ADJUSTMENT_ADD');
  const [quantity, setQuantity] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>(String(material.unitCost || ''));
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const numQty = Number(quantity) || 0;
  const isSubtraction = ['WORK_ORDER_ISSUE', 'JOB_WORK_DISPATCH', 'ADJUSTMENT_SUBTRACT', 'TRANSFER'].includes(transactionType);
  const projectedStock = isSubtraction
    ? material.currentStockBalance - numQty
    : material.currentStockBalance + numQty;

  const isNegativeError = projectedStock < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) {
      toast('Invalid Quantity', 'Adjustment quantity must be greater than 0', 'warning');
      return;
    }
    if (isNegativeError) {
      toast('Stock Error', 'Transaction would result in negative stock balance!', 'error');
      return;
    }

    try {
      await recordTransaction.mutateAsync({
        id: material.id,
        payload: {
          transactionType,
          quantity: numQty,
          unitPrice: Number(unitPrice) || 0,
          referenceNumber: referenceNumber || undefined,
          notes: notes || undefined,
        },
      });
      toast('Stock Adjusted', `Successfully recorded ${transactionType.replace('_', ' ')} of ${numQty} ${material.unit?.abbreviation || ''}`, 'success');
      onClose();
      setQuantity('');
      setReferenceNumber('');
      setNotes('');
    } catch (err: any) {
      toast('Transaction Failed', err.message || 'Could not process stock transaction', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock Movement / Adjustment - ${material.sku}`}
      description={`Record inventory transaction for ${material.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Stock Banner */}
        <div className="bg-secondary/40 border border-border rounded-lg p-3 flex justify-between items-center text-xs">
          <div>
            <span className="text-muted-foreground block">Current Stock:</span>
            <span className="font-mono font-bold text-sm text-foreground">
              {material.currentStockBalance} {material.unit?.abbreviation || 'Units'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block">Projected Stock:</span>
            <span
              className={`font-mono font-bold text-sm ${
                isNegativeError ? 'text-rose-500' : 'text-[#2563EB]'
              }`}
            >
              {projectedStock} {material.unit?.abbreviation || 'Units'}
            </span>
          </div>
        </div>

        {isNegativeError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Negative stock prohibited! Maximum available stock is {material.currentStockBalance}.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Transaction Type</label>
            <Select
              options={[
                { label: 'Purchase Receipt (+)', value: 'PURCHASE_RECEIPT' },
                { label: 'Adjustment Add (+)', value: 'ADJUSTMENT_ADD' },
                { label: 'Job Work Return (+)', value: 'JOB_WORK_RETURN' },
                { label: 'Issue to Work Order (-)', value: 'WORK_ORDER_ISSUE' },
                { label: 'Job Work Dispatch (-)', value: 'JOB_WORK_DISPATCH' },
                { label: 'Adjustment Subtract (-)', value: 'ADJUSTMENT_SUBTRACT' },
                { label: 'Warehouse Transfer (-)', value: 'TRANSFER' },
                { label: 'Manual Correction', value: 'MANUAL_CORRECTION' },
              ]}

              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as any)}
            />
          </div>

          <Input
            label={`Quantity (${material.unit?.abbreviation || 'Units'})`}
            type="number"
            step="0.001"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Unit Rate (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
          <Input
            label="Reference Doc / Ref No."
            placeholder="e.g. PO-991, GRN-402, JW-108"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Transaction Remarks / Reason</label>
          <textarea
            className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#2563EB]"
            rows={2}
            placeholder="Reason for adjustment, physical verification discrepancy, vendor delivery note..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={recordTransaction.isPending || isNegativeError || numQty <= 0}
            leftIcon={recordTransaction.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : undefined}
          >
            Submit Stock Movement
          </Button>
        </div>
      </form>
    </Modal>
  );
}
