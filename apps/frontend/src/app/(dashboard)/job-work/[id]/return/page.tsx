'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Scale,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Info,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import {
  useJobWorkOrderDetail,
  useReceiveJobWorkReturn,
  useReceiveWeavingReturn,
  useJobWorkMaterials,
} from '@/hooks/useJobWork';
import { MultiRollReturnTable, RollReturnRow } from '@/components/job-work/multi-roll-return-table';
import Link from 'next/link';

interface WeavingInPassRow {
  id: string;
  date: string;
  inPassNumber: string;
  description: string;
  weightKg: number | '';
  wastageDescription: string;
  wastageWeightKg: number | '';
}

export default function ReceiveReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: order, isLoading: isLoadingOrder } = useJobWorkOrderDetail(id);
  const { data: materials = [] } = useJobWorkMaterials();
  const standardReturnMutation = useReceiveJobWorkReturn();
  const weavingReturnMutation = useReceiveWeavingReturn();

  const [returnedDate, setReturnedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Standard Return Rows
  const [rows, setRows] = useState<RollReturnRow[]>([]);

  // Weaving In-Pass Rows
  const [weavingRows, setWeavingRows] = useState<WeavingInPassRow[]>([
    {
      id: 'w1',
      date: new Date().toISOString().split('T')[0],
      inPassNumber: 'INP-2026-001',
      description: 'Grey Woven Gauze Fabric',
      weightKg: '',
      wastageDescription: '',
      wastageWeightKg: '',
    },
  ]);

  // Initialize standard rows once order is loaded
  React.useEffect(() => {
    if (order && rows.length === 0 && order.jobWorkType !== 'WEAVING') {
      const defaultTargetProduct = order.finishedProductId || order.rawMaterialId || '';
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

    if (order && order.jobWorkType === 'WEAVING') {
      const pendingW = Number(order.pendingWeight) || 0;
      setWeavingRows([
        {
          id: 'w1',
          date: new Date().toISOString().split('T')[0],
          inPassNumber: `INP-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`,
          description: order.weavingDetail
            ? `Grey Woven Fabric (${order.weavingDetail.ends} Ends × ${order.weavingDetail.reed} Reed, ${order.weavingDetail.pick} Pick)`
            : 'Grey Woven Gauze Fabric',
          weightKg: pendingW > 0 ? Number(pendingW.toFixed(2)) : '',
          wastageDescription: 'Loom cut bits and end salvage',
          wastageWeightKg: 0,
        },
      ]);
    }
  }, [order]);

  if (isLoadingOrder || !order) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-sm">
        Loading Job Work Order Details...
      </div>
    );
  }

  const isWeaving = order.jobWorkType === 'WEAVING';
  const pendingWeight = Number(order.pendingWeight) || 0;

  // Weaving calculation helper
  const totalWeavingBatchReturned = weavingRows.reduce(
    (sum, r) => sum + (Number(r.weightKg) || 0),
    0
  );
  const totalWeavingBatchWastage = weavingRows.reduce(
    (sum, r) => sum + (Number(r.wastageWeightKg) || 0),
    0
  );
  const weavingRemainingWeight = Math.max(
    0,
    pendingWeight - totalWeavingBatchReturned - totalWeavingBatchWastage
  );

  // Standard calculation helper
  const totalBatchReturned = rows.reduce((sum, r) => sum + (Number(r.returnedWeight) || 0), 0);
  const totalBatchWastage = rows.reduce((sum, r) => sum + (Number(r.wastageWeight) || 0), 0);
  const standardRemainingWeight = Math.max(0, pendingWeight - totalBatchReturned - totalBatchWastage);

  const effectiveRemainingWeight = isWeaving ? weavingRemainingWeight : standardRemainingWeight;
  const isOrderFinishing = effectiveRemainingWeight <= 0.001;

  // Handlers for Weaving In-Pass rows
  const addWeavingRow = () => {
    setWeavingRows((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        date: returnedDate,
        inPassNumber: `INP-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`,
        description: 'Grey Woven Fabric Consignment',
        weightKg: '',
        wastageDescription: '',
        wastageWeightKg: 0,
      },
    ]);
  };

  const removeWeavingRow = (id: string) => {
    if (weavingRows.length <= 1) {
      toast('Cannot Remove', 'At least one in-pass record is required', 'warning');
      return;
    }
    setWeavingRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateWeavingRow = (id: string, field: keyof WeavingInPassRow, val: any) => {
    setWeavingRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isWeaving) {
      // Validate weaving rows
      for (const row of weavingRows) {
        if (!row.inPassNumber.trim()) {
          toast('In-Pass Number Required', 'Please provide an In-Pass number for every row', 'warning');
          return;
        }
        if (!row.description.trim()) {
          toast('Description Required', 'Please enter a description for every row', 'warning');
          return;
        }
        if (!row.weightKg || Number(row.weightKg) <= 0) {
          toast('Weight Required', 'Please enter a valid weight in KG for every row', 'warning');
          return;
        }
      }

      try {
        const updated = await weavingReturnMutation.mutateAsync({
          id: order.id,
          payload: {
            returnedDate,
            remarks: generalRemarks.trim() || undefined,
            isFinal: isOrderFinishing,
            items: weavingRows.map((r) => ({
              date: r.date || returnedDate,
              inPassNumber: r.inPassNumber.trim(),
              description: r.description.trim(),
              weightKg: Number(r.weightKg),
              wastageDescription: r.wastageDescription.trim() || undefined,
              wastageWeightKg: Number(r.wastageWeightKg) || 0,
            })),
          },
        });

        toast(
          isOrderFinishing ? 'Weaving Order Completed' : 'In-Pass Goods Registered',
          `Successfully recorded ${weavingRows.length} in-pass item(s). Order status: ${updated.status}`,
          'success'
        );
        router.push(`/job-work/${order.id}`);
      } catch (err: any) {
        toast('In-Pass Failed', err.message || 'Unable to record weaving return goods', 'error');
      }
    } else {
      // Standard return handling
      if (rows.length === 0) {
        toast('Empty Return', 'Please add at least one returned roll', 'warning');
        return;
      }

      const finalRemarks = generalRemarks.trim() || undefined;

      try {
        const updated = await standardReturnMutation.mutateAsync({
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
    }
  };

  const isPending = standardReturnMutation.isPending || weavingReturnMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 w-full max-w-7xl mx-auto pb-16"
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
              <span>{isWeaving ? 'Receive Weaving In-Pass Finished Goods' : 'Receive Returned Finished Goods'}</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isWeaving
                ? 'Register incoming woven fabric directly into the Weaving In-Pass register table (bypassing raw materials stock)'
                : 'Log returned rolls and increment finished goods warehouse stock'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details Header Card */}
        <Card className="p-5 bg-card border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block">Job Work Order</span>
            <span className="font-mono font-bold text-primary text-sm">{order.jobWorkNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Vendor Company</span>
            <span className="font-semibold text-foreground text-sm">{order.jobWorkCompany?.companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">
              {isWeaving ? 'Total Expected Receivable' : 'Total Issued Weight'}
            </span>
            <span className="font-mono font-bold text-foreground text-sm">
              {Number(order.totalIssuedWeight).toFixed(2)} Kg
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Pending Balance Weight</span>
            <span className="font-mono font-bold text-amber-400 text-sm flex items-center gap-1">
              <Scale className="h-4 w-4" />
              {pendingWeight.toFixed(2)} Kg
            </span>
          </div>
        </Card>

        {/* Date & General Reference */}
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
              label="Inward Batch Notes / Gate Reference"
              placeholder="e.g. Delivery Gate Pass #GP-8891..."
              value={generalRemarks}
              onChange={(e) => setGeneralRemarks(e.target.value)}
            />
          </div>
        </Card>

        {/* WEAVING DEDICATED IN-PASS FORM */}
        {isWeaving ? (
          <Card className="p-5 bg-card border-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Weaving In-Pass Consignments</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter Date, In-Pass Number, Weights, and full fabric descriptions for each received consignment.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWeavingRow}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Add In-Pass Item
              </Button>
            </div>

            {/* In-Pass Notice Banner */}
            <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2.5 text-xs">
              <Info className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-foreground">
                <strong>Inventory Isolation Active:</strong> These finished goods will be recorded into the dedicated{' '}
                <code className="text-emerald-500 font-mono">weaving_received_items</code> table and will <strong>NOT</strong> alter the raw materials warehouse stock balance.
              </p>
            </div>

            {/* In-Pass Consignments List (No horizontal scroll, 2-line layout) */}
            <div className="space-y-3">
              {weavingRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="p-4 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-all space-y-3 shadow-2xs"
                >
                  {/* Line 1: Identification & Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        #{idx + 1} In-Pass Date *
                      </label>
                      <input
                        type="date"
                        className="w-full h-8 px-2.5 rounded border border-border bg-background text-foreground text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        value={row.date}
                        onChange={(e) => updateWeavingRow(row.id, 'date', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        In-Pass Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. INP-2026-001"
                        className="w-full h-8 px-2.5 rounded border border-border bg-background text-foreground font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        value={row.inPassNumber}
                        onChange={(e) => updateWeavingRow(row.id, 'inPassNumber', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1 text-right">
                        Net Weight (Kg) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full h-8 px-2.5 text-right rounded border border-border bg-background text-emerald-400 font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        value={row.weightKg}
                        onChange={(e) => updateWeavingRow(row.id, 'weightKg', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1 text-right">
                        Wastage (Kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full h-8 px-2.5 text-right rounded border border-border bg-background text-amber-400 font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        value={row.wastageWeightKg}
                        onChange={(e) => updateWeavingRow(row.id, 'wastageWeightKg', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-end pb-0.5 col-span-2 sm:col-span-4 md:col-span-1">
                      {weavingRows.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeWeavingRow(row.id)}
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete consignment item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">Consignment #1</span>
                      )}
                    </div>
                  </div>

                  {/* Line 2: Moved to next line for wide, spacious description boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Fabric Description *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grey Woven Fabric (1266 Ends × 23 Reed, 18 Pick)"
                        className="w-full h-8 px-2.5 rounded border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        value={row.description}
                        onChange={(e) => updateWeavingRow(row.id, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                        Wastage Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Loom cut bits and end salvage"
                        className="w-full h-8 px-2.5 rounded border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        value={row.wastageDescription}
                        onChange={(e) => updateWeavingRow(row.id, 'wastageDescription', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Totals Summary Footer Bar */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-muted-foreground font-sans">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  <span>Total In-Pass Consignments: <strong>{weavingRows.length}</strong></span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-muted-foreground font-sans mr-2">Batch Intake Total:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {totalWeavingBatchReturned.toFixed(2)} Kg
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-sans mr-2">Wastage Total:</span>
                    <span className="text-sm font-bold text-amber-400">
                      {totalWeavingBatchWastage.toFixed(2)} Kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          /* STANDARD MULTI-ROLL RETURN TABLE */
          <Card className="p-5 bg-card border-border">
            <MultiRollReturnTable
              rows={rows}
              onChange={setRows}
              availableProducts={materials}
              pendingWeight={pendingWeight}
            />
          </Card>
        )}

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
            isLoading={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            leftIcon={isOrderFinishing ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          >
            {isWeaving ? 'Record Weaving In-Pass Delivery' : 'Save Return Register & Increase Stock'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
