'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Bed,
  Layers,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  Scale,
  Sparkles,
  Truck,
  Users,
  Building2,
  FileText,
  Boxes,
  Check,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  usePillowBedsheetBatchDetail,
  useUpdatePillowBedsheetBatchStatus,
  useUpdatePillowBedsheetProgress,
} from '@/hooks/usePillowBedsheetProduction';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';
import { PillowBedsheetBatchStatus } from '@/services/pillow-bedsheet-production.service';

export default function PillowBedsheetBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: batch, isLoading, error } = usePillowBedsheetBatchDetail(id);
  const updateStatusMutation = useUpdatePillowBedsheetBatchStatus();
  const updateProgressMutation = useUpdatePillowBedsheetProgress();
  const { toast } = useToast();

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [newCompletedQuantity, setNewCompletedQuantity] = useState<number | ''>('');

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <SkeletonLoader className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader className="h-64 md:col-span-2" />
          <SkeletonLoader className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-foreground">Production Batch Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          The requested Pillow Cover or Bed Sheet batch does not exist or has been removed.
        </p>
        <Link href="/pillow-bedsheet-production">
          <Button size="sm" variant="outline">
            Back to Production Line
          </Button>
        </Link>
      </div>
    );
  }

  const progressPct = batch.outputQuantity > 0
    ? Math.min(100, Math.round((batch.completedQuantity / batch.outputQuantity) * 100))
    : 0;
  const earnedSalary = batch.completedQuantity * batch.salaryRatePerUnit;
  const workerList = batch.workerNames ? batch.workerNames.split(',').map((w) => w.trim()).filter(Boolean) : [];
  const workerCount = workerList.length > 0 ? workerList.length : 1;
  const perWorkerSalary = batch.workerSalaryShare || (batch.totalSalary / workerCount);
  const perWorkerEarned = earnedSalary / workerCount;

  const handleStatusUpdate = async (status: PillowBedsheetBatchStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: batch.id, status });
      toast('Status Updated', `Batch marked as ${status}`, 'success');
    } catch (e: any) {
      toast('Update Failed', e?.message || 'Failed to update status', 'error');
    }
  };

  const handleSaveProgress = async () => {
    const val = Number(newCompletedQuantity);
    if (isNaN(val) || val < 0) {
      toast('Invalid Value', 'Completed pieces must be 0 or greater', 'warning');
      return;
    }
    if (val > batch.outputQuantity) {
      toast('Exceeds Output', `Completed pieces cannot exceed total target of ${batch.outputQuantity}`, 'warning');
      return;
    }

    try {
      await updateProgressMutation.mutateAsync({
        id: batch.id,
        completedQuantity: val,
      });
      toast('Progress Logged', `Logged ${val} pieces completed out of ${batch.outputQuantity}`, 'success');
      setIsProgressModalOpen(false);
    } catch (e: any) {
      toast('Update Failed', e?.message || 'Failed to update progress', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/pillow-bedsheet-production">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
                {batch.batchNumber}
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                batch.productType === 'BED_SHEET'
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
              }`}>
                {batch.productType === 'BED_SHEET' ? 'Bed Sheet' : 'Pillow Cover'}
              </span>
              {batch.status === 'COMPLETED' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Completed
                </span>
              ) : batch.status === 'CANCELLED' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Cancelled
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> In Progress
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Created {formatDate(batch.createdAt)} • Last updated {formatDate(batch.updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewCompletedQuantity(batch.completedQuantity);
              setIsProgressModalOpen(true);
            }}
            className="h-8 text-xs gap-1.5"
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Update Progress</span>
          </Button>

          {batch.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('COMPLETED')}
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-semibold"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark Completed</span>
            </Button>
          )}

          {batch.status === 'COMPLETED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              className="h-8 text-xs text-muted-foreground"
            >
              Reopen Batch
            </Button>
          )}
        </div>
      </div>

      {/* Primary 3-Column Info Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Mathematical Model & Raw Materials Intake */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sizing & Cutting Specifications Card */}
          <Card className="p-5 border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Roll Intake & Material Specifications</h2>
                </div>
              </div>
            </div>

            {/* Raw Material Roll Attributes */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Weight</span>
                <span className="text-base font-bold font-mono text-foreground mt-0.5 block">{batch.weightKg} KG</span>
                <span className="text-[10px] text-muted-foreground">Scale weight</span>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Fabric GSM</span>
                <span className="text-base font-bold font-mono text-foreground mt-0.5 block">{batch.gsm} g/m²</span>
                <span className="text-[10px] text-muted-foreground">Density</span>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Roll Width</span>
                <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                  {batch.rollWidth} {batch.rollWidthUom}
                </span>
                <span className="text-[10px] text-muted-foreground">({batch.rollWidthInMeters} m)</span>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] text-purple-700 dark:text-purple-300 block uppercase font-bold tracking-wider">Total Roll Length</span>
                <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5 block">
                  {batch.totalLength.toFixed(2)} m
                </span>
                <span className="text-[10px] text-muted-foreground">Linear meters</span>
              </div>
            </div>

            {/* Output Sizing Yield Breakdown */}
            <div className="border-t border-border/80 pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cutting Sizing & Yield Engine
              </h3>

              {batch.productType === 'BED_SHEET' ? (
                <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900 dark:text-blue-200">Bed Sheet Sizing Specifications:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-2 rounded bg-background border border-border/70">
                      <span className="text-[10px] text-muted-foreground block">Piece Length</span>
                      <span className="font-mono font-bold text-foreground">
                        {batch.bedSheetLength} {batch.bedSheetLengthUom || 'm'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background border border-border/70">
                      <span className="text-[10px] text-muted-foreground block">Calculated Yield</span>
                      <span className="font-mono font-bold text-emerald-600 text-sm">
                        {batch.outputQuantity} pcs
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background border border-border/70">
                      <span className="text-[10px] text-muted-foreground block">Remnant Length</span>
                      <span className="font-mono font-bold text-muted-foreground">
                        {batch.remnantLength !== undefined ? `${batch.remnantLength.toFixed(2)} m` : '0 m'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">Pillow Cover Sizing Specifications:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-2 rounded bg-background border border-border/70">
                      <span className="text-[10px] text-muted-foreground block">Cutting Length (PCL)</span>
                      <span className="font-mono font-bold text-foreground">
                        {batch.pillowCoverCuttingLength} {batch.pillowCoverCuttingLengthUom || 'm'}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background border border-border/70">
                      <span className="text-[10px] text-muted-foreground block">Cutting Count</span>
                      <span className="font-mono font-bold text-foreground">
                        {batch.cuttingCount || 1} cuts
                      </span>
                    </div>
                    <div className="p-2 rounded bg-background border border-border/70">
                      <span className="text-[10px] text-muted-foreground block">Total Yield</span>
                      <span className="font-mono font-bold text-emerald-600 text-sm">
                        {batch.outputQuantity} pcs
                      </span>
                    </div>
                  </div>
                  {batch.remnantLength !== undefined && (
                    <div className="text-[10px] text-muted-foreground font-mono pt-1">
                      Remnant length remaining from roll: <strong>{batch.remnantLength.toFixed(2)} meters</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Delivery & Job Work Logistics Card */}
          <Card className="p-5 border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Challan & Logistics Control</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Delivery tracking, item specs, and transportation parameters
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-secondary/30 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">DC Number</span>
                <span className="font-mono font-bold text-foreground mt-0.5 block">{batch.dcNo || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded bg-secondary/30 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">DC Date</span>
                <span className="font-mono font-bold text-foreground mt-0.5 block">
                  {batch.dcDate ? formatDate(batch.dcDate) : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-secondary/30 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Ends Specification</span>
                <span className="font-mono font-bold text-foreground mt-0.5 block">{batch.ends || 'Standard'}</span>
              </div>
              <div className="p-2.5 rounded bg-secondary/30 border border-border/60">
                <span className="text-[10px] text-muted-foreground block">Item Type</span>
                <span className="font-mono font-bold text-foreground mt-0.5 block">{batch.itemType || 'Standard'}</span>
              </div>
            </div>

            {batch.executorType === 'COMPANY' && (
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Jobworking Company</span>
                  <span className="font-bold text-foreground text-sm">{batch.companyName || 'Outsourced Partner'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  {batch.deliveryPerson && (
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Delivery Person</span>
                      <span className="font-semibold text-foreground">{batch.deliveryPerson}</span>
                    </div>
                  )}
                  {batch.vehicleNumber && (
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Vehicle Number</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{batch.vehicleNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Salary Voucher & Production Progress */}
        <div className="space-y-6">
          {/* Production Progress Card */}
          <Card className="p-5 border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Production Output</h2>
                  <p className="text-[11px] text-muted-foreground">Cumulative progress tracking</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Pieces Completed:</span>
                <span className="font-mono text-xl font-bold text-foreground">
                  {batch.completedQuantity} <span className="text-xs font-normal text-muted-foreground">/ {batch.outputQuantity} pcs</span>
                </span>
              </div>

              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPct === 100 ? 'bg-emerald-500' : 'bg-purple-600'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>Completion: {progressPct}%</span>
                <span>Pending: {Math.max(0, batch.outputQuantity - batch.completedQuantity)} pcs</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewCompletedQuantity(batch.completedQuantity);
                  setIsProgressModalOpen(true);
                }}
                className="w-full text-xs font-semibold"
              >
                Update Output Count
              </Button>
            </div>
          </Card>

          {/* Salary per Quantity Voucher Card */}
          <Card className="p-5 border-border bg-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Salary Compensation</h2>
                  <p className="text-[11px] text-muted-foreground">Calculated per finished quantity</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                ₹{batch.salaryRatePerUnit} / pc
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded bg-secondary/30 border border-border/60">
                <span className="text-muted-foreground">Total Batch Target Value:</span>
                <span className="font-mono font-bold text-foreground">
                  ₹{batch.totalSalary.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold">Earned to Date ({batch.completedQuantity} pcs):</span>
                <span className="font-mono font-bold text-sm">
                  ₹{earnedSalary.toLocaleString()}
                </span>
              </div>

              {/* Workforce Distribution */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-purple-600" />
                    Assigned Workforce ({workerCount})
                  </span>
                  {workerList.length > 1 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ₹{perWorkerSalary.toFixed(0)}/worker
                    </span>
                  )}
                </div>

                {batch.executorType === 'WORKERS' ? (
                  <div className="space-y-1.5">
                    {workerList.length === 0 ? (
                      <div className="text-[11px] text-muted-foreground italic">No specific worker assigned</div>
                    ) : (
                      workerList.map((workerName: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 rounded bg-secondary/20 border border-border/40 text-xs"
                        >
                          <span className="font-medium text-foreground">{workerName}</span>
                          <div className="text-right font-mono">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                              ₹{perWorkerEarned.toFixed(0)} earned
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              of ₹{perWorkerSalary.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-2 rounded bg-secondary/30 text-xs text-muted-foreground">
                    Direct billing to jobworking company: <strong className="text-foreground">{batch.companyName || 'Vendor'}</strong>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Log Progress Modal */}
      {isProgressModalOpen && (
        <Modal
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          title={`Update Completed Output — ${batch.batchNumber}`}
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-secondary/30 rounded-lg border border-border/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-semibold text-foreground">{batch.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Output:</span>
                <span className="font-mono font-bold text-foreground">{batch.outputQuantity} pieces</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary Rate:</span>
                <span className="font-mono font-bold text-foreground">₹{batch.salaryRatePerUnit} / pc</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Completed Pieces (Cumulative)
              </label>
              <Input
                type="number"
                min="0"
                max={batch.outputQuantity}
                value={newCompletedQuantity}
                onChange={(e) => setNewCompletedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`0 to ${batch.outputQuantity}`}
                className="font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Enter total pieces finished to date. Max: {batch.outputQuantity} pcs.
              </p>
            </div>

            {typeof newCompletedQuantity === 'number' && (
              <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/20 text-xs flex justify-between items-center">
                <span className="text-purple-700 dark:text-purple-300 font-medium">Earned Salary:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300 text-sm">
                  ₹{(newCompletedQuantity * batch.salaryRatePerUnit).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProgressModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProgress}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                Save Progress
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
