'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Scale, Save, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useJobWorkOrderDetail, useReceiveJobWorkReturn, useJobWorkMaterials } from '@/hooks/useJobWork';
import { MultiRollReturnTable, RollReturnRow } from '@/components/job-work/multi-roll-return-table';
import Link from 'next/link';

export default function ReceiveReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: order, isLoading: isLoadingOrder } = useJobWorkOrderDetail(id);
  const { data: materials = [] } = useJobWorkMaterials();
  const returnMutation = useReceiveJobWorkReturn();

  const [returnedDate, setReturnedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [isMarkAsFinal, setIsMarkAsFinal] = useState(false);
  const [wastageDescription, setWastageDescription] = useState('');

  const [rows, setRows] = useState<RollReturnRow[]>([]);

  // Initialize rows once order is loaded
  React.useEffect(() => {
    if (order && rows.length === 0) {
      const defaultTargetProduct = order.finishedProductId || order.rawMaterialId;
      const pendingW = Number(order.pendingWeight) || 50;
      const defaultUnit = Math.min(50, pendingW);
      setRows([
        {
          id: 'r1',
          finishedProductId: defaultTargetProduct,
          rollNumber: 'ROLL-FG-5001',
          unitWeight: defaultUnit,
          returnedWeight: defaultUnit,
          returnedQty: 1,
          wastageWeight: 0,
          wastageQty: 0,
          remarks: 'QC Passed',
        },
      ]);
    }
  }, [order, rows.length]);

  if (isLoadingOrder || !order) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-sm">
        Loading Job Work Order Details...
      </div>
    );
  }

  const pendingWeight = Number(order.pendingWeight) || 0;
  const totalBatchReturned = rows.reduce((sum, r) => sum + (Number(r.returnedWeight) || 0), 0);
  const totalBatchWastage = rows.reduce((sum, r) => sum + (Number(r.wastageWeight) || 0), 0);
  const remainingWeight = Math.max(0, pendingWeight - totalBatchReturned - totalBatchWastage);
  const isOrderFinishing = isMarkAsFinal || remainingWeight <= 0.001;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rows.length === 0) {
      toast('Empty Return', 'Please add at least one returned roll', 'warning');
      return;
    }

    const finalRemarks = isOrderFinishing
      ? (wastageDescription.trim() || generalRemarks.trim() || undefined)
      : (generalRemarks.trim() || undefined);

    try {
      const updated = await returnMutation.mutateAsync({
        id: order.id,
        payload: {
          returnedDate,
          remarks: finalRemarks,
          isFinal: isOrderFinishing,
          items: rows.map((r) => ({
            finishedProductId: r.finishedProductId,
            rollNumber: r.rollNumber,
            returnedWeight: Number(r.returnedWeight),
            returnedQty: Number(r.returnedQty),
            wastageWeight: Number(r.wastageWeight || 0),
            wastageQty: Number(r.wastageQty || 0),
            remarks: r.remarks,
          })),
        },
      });

      toast(
        isOrderFinishing ? 'Job Work Order Completed' : 'Returned Goods Recorded',
        `Return registered! Status updated to ${updated.status}`,
        'success'
      );
      router.push(`/job-work/${order.id}`);
    } catch (err: any) {
      toast('Return Failed', err.message || 'Unable to record return goods', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/job-work/${order.id}`}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Order
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-emerald-400" />
              Receive Returned Finished Goods
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details Header Card */}
        <Card className="p-5 bg-card border-border grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block">Job Work Order</span>
            <span className="font-mono font-bold text-primary text-sm">{order.jobWorkNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Vendor Company</span>
            <span className="font-semibold text-foreground text-sm">{order.jobWorkCompany?.companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Total Issued Weight</span>
            <span className="font-mono font-bold text-foreground text-sm">
              {Number(order.totalIssuedWeight).toFixed(2)} Kg
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Pending Return Balance</span>
            <span className="font-mono font-bold text-amber-400 text-sm flex items-center gap-1">
              <Scale className="h-4 w-4" />
              {pendingWeight.toFixed(2)} Kg
            </span>
          </div>
        </Card>

        {/* Date & Batch Notes */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Return Receipt Date *"
              type="date"
              value={returnedDate}
              onChange={(e) => setReturnedDate(e.target.value)}
              required
            />
            <Input
              label="Return Batch Notes / QC Inward Reference"
              placeholder="e.g. Inward Gate Pass #IN-9081..."
              value={generalRemarks}
              onChange={(e) => setGeneralRemarks(e.target.value)}
            />
          </div>
        </Card>

        {/* Multi-Roll Return Entry Table */}
        <Card className="p-5 bg-card border-border">
          <MultiRollReturnTable
            rows={rows}
            onChange={setRows}
            availableProducts={materials}
            pendingWeight={pendingWeight}
          />
        </Card>

        {/* Final Entry & Wastage Description Section */}
        <Card className={`p-5 transition-all border-2 ${
          isOrderFinishing
            ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20'
            : 'border-border bg-card'
        } space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="markAsFinalCheck"
                checked={isMarkAsFinal}
                onChange={(e) => setIsMarkAsFinal(e.target.checked)}
                className="rounded border-border text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="markAsFinalCheck" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5">
                <span>Mark as Final / Last Return Entry</span>
                {remainingWeight <= 0.001 && (
                  <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 font-mono">
                    (Auto-detected: 0.00 Kg remaining balance)
                  </span>
                )}
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-muted-foreground">Remaining after this entry:</span>
              <span className={`font-bold ${remainingWeight <= 0.001 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {remainingWeight.toFixed(2)} Kg
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isOrderFinishing ? 'Final Wastage & Closure Remarks' : 'Return Remarks & Wastage Notes'}</span>
              </label>
              {isOrderFinishing && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Order Closes as Completed
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={wastageDescription}
              onChange={(e) => setWastageDescription(e.target.value)}
              placeholder={
                isOrderFinishing
                  ? 'Enter fabric scrap, process shrinkage, or QC closure remarks (optional)...'
                  : 'Enter scrap, roll quality observations, or delivery remarks (optional)...'
              }
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
            />
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/job-work/${order.id}`}>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            isLoading={returnMutation.isPending}
            className={isOrderFinishing ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
            leftIcon={isOrderFinishing ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          >
            {isOrderFinishing ? 'Finish Order & Save Final Return' : 'Save Return Register & Increase Stock'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
