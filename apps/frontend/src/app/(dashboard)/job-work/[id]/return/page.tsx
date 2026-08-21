'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Scale, Save } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rows.length === 0) {
      toast('Empty Return', 'Please add at least one returned roll', 'warning');
      return;
    }

    try {
      const updated = await returnMutation.mutateAsync({
        id: order.id,
        payload: {
          returnedDate,
          remarks: generalRemarks,
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

      toast('Returned Goods Recorded', `Return registered! Status updated to ${updated.status}`, 'success');
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
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Return Register & Increase Stock
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
