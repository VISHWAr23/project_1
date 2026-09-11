'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bed,
  Layers,
  Calculator,
  Plus,
  ArrowLeft,
  Search,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  Boxes,
  Eye,
  Check,
  Truck,
  IndianRupee,
  Scale,
  Sparkles,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  usePillowBedsheetBatches,
  usePillowBedsheetDashboard,
  useUpdatePillowBedsheetBatchStatus,
  useUpdatePillowBedsheetProgress,
} from '@/hooks/usePillowBedsheetProduction';
import {
  ProductionAssignmentModal,
} from '@/components/job-work/production-assignment-modal';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';
import { PillowBedsheetBatch, PillowBedsheetBatchStatus } from '@/services/pillow-bedsheet-production.service';

export default function PillowBedsheetProductionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productTypeFilter, setProductTypeFilter] = useState<'ALL' | 'BED_SHEET' | 'PILLOW_COVER'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchForProgress, setSelectedBatchForProgress] = useState<PillowBedsheetBatch | null>(null);
  const [newCompletedQuantity, setNewCompletedQuantity] = useState<number | ''>('');
  const [isMarkFinal, setIsMarkFinal] = useState(false);
  const [wastageDescription, setWastageDescription] = useState('');

  const { data: stats } = usePillowBedsheetDashboard();
  const { data: batchesData, isLoading } = usePillowBedsheetBatches({
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    productType: productTypeFilter !== 'ALL' ? productTypeFilter : undefined,
  });

  const updateStatusMutation = useUpdatePillowBedsheetBatchStatus();
  const updateProgressMutation = useUpdatePillowBedsheetProgress();
  const { toast } = useToast();

  const batches = batchesData?.items || [];

  const handleStatusChange = async (id: string, newStatus: PillowBedsheetBatchStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast('Status Updated', `Batch marked as ${newStatus}`, 'success');
    } catch (e: any) {
      toast('Error', e?.message || 'Failed to update status', 'error');
    }
  };

  const handleSaveProgress = async (batch: PillowBedsheetBatch) => {
    const val = Number(newCompletedQuantity);
    if (isNaN(val) || val < 0) {
      toast('Invalid Value', 'Completed pieces must be 0 or greater', 'warning');
      return;
    }
    if (val > batch.outputQuantity) {
      toast('Exceeds Output', `Completed pieces cannot exceed total target of ${batch.outputQuantity}`, 'warning');
      return;
    }

    const isFinishing = isMarkFinal || val >= batch.outputQuantity;

    try {
      await updateProgressMutation.mutateAsync({
        id: batch.id,
        completedQuantity: val,
        status: isFinishing ? 'COMPLETED' : undefined,
        notes: wastageDescription.trim() || undefined,
      });
      toast(
        isFinishing ? 'Batch Completed' : 'Progress Logged',
        isFinishing
          ? `Batch finished with ${val} / ${batch.outputQuantity} pieces and logged final wastage description.`
          : `Logged ${val} pieces completed out of ${batch.outputQuantity}`,
        'success'
      );
      setSelectedBatchForProgress(null);
      setNewCompletedQuantity('');
      setIsMarkFinal(false);
      setWastageDescription('');
    } catch (e: any) {
      toast('Update Failed', e?.message || 'Failed to update progress', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Pillow Cover & Bed Sheet Production
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Textile Sizing Line
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/job-work">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Operations Hub
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Production Batch</span>
          </Button>
        </div>
      </div>

      {/* Metric Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active WIP Batches</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {stats?.activeBatches ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              of {stats?.totalBatches ?? 0} total
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Bed Sheets Output</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {(stats?.totalBedSheetsOutput ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              pcs target
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pillow Covers Output</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {(stats?.totalPillowCoversOutput ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              pcs target
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Production Salary</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              ₹{(stats?.totalSalaryDisbursed ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Target pool
            </span>
          </div>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search batch #, product, DC no, or worker/vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Product Type Filter */}
          <select
            value={productTypeFilter}
            onChange={(e) => setProductTypeFilter(e.target.value as any)}
            className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground"
          >
            <option value="ALL">All Products (Bed Sheets & Pillow Covers)</option>
            <option value="BED_SHEET">Bed Sheets Only</option>
            <option value="PILLOW_COVER">Pillow Covers Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <Card className="border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border/70 text-muted-foreground">
              <tr>
                <th className="py-3 px-4 font-semibold">Batch & Challan</th>
                <th className="py-3 px-4 font-semibold">Product & Specs</th>
                <th className="py-3 px-4 font-semibold">Roll Intake</th>
                <th className="py-3 px-4 font-semibold">Cutting & Sizing</th>
                <th className="py-3 px-4 font-semibold min-w-[170px]">Output & Progress</th>
                <th className="py-3 px-4 font-semibold">Salary Voucher</th>
                <th className="py-3 px-4 font-semibold">Handler & Logistics</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground text-xs">
                    No pillow cover or bed sheet production batches found matching your filters.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const progressPct = batch.outputQuantity > 0
                    ? Math.min(100, Math.round((batch.completedQuantity / batch.outputQuantity) * 100))
                    : 0;
                  const earnedBatchSalary = batch.completedQuantity * batch.salaryRatePerUnit;

                  return (
                    <tr key={batch.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Batch Number & DC */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/pillow-bedsheet-production/batches/${batch.id}`}
                          className="font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline block"
                        >
                          {batch.batchNumber}
                        </Link>
                        {batch.dcNo ? (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                              DC: {batch.dcNo}
                            </span>
                            {batch.dcDate && (
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(batch.dcDate)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No DC</span>
                        )}
                      </td>

                      {/* Product & Specs */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            batch.productType === 'BED_SHEET'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          }`}>
                            <Bed className="h-3 w-3" />
                            {batch.productType === 'BED_SHEET' ? 'Bed Sheet' : 'Pillow Cover'}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-foreground truncate max-w-[200px]" title={batch.productName}>
                          {batch.productName}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                          {batch.ends && <span>Ends: {batch.ends}</span>}
                          {batch.itemType && <span>• Item: {batch.itemType}</span>}
                        </div>
                      </td>

                      {/* Roll Intake */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Scale className="h-3 w-3 text-purple-500" />
                          <span className="font-mono font-semibold text-foreground">{batch.weightKg} kg</span>
                          <span className="text-muted-foreground text-[10px]">@ {batch.gsm} GSM</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Width: <span className="font-mono text-foreground">{batch.rollWidth} {batch.rollWidthUom}</span>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                          {batch.totalLength.toFixed(2)} m
                        </div>
                      </td>

                      {/* Cutting & Sizing */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        {batch.productType === 'BED_SHEET' ? (
                          <>
                            <div className="text-[11px] font-mono text-foreground">
                              Length: <strong>{batch.bedSheetLength} {batch.bedSheetLengthUom || 'm'}</strong>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Yield: <span className="font-mono text-emerald-600 font-semibold">{batch.outputQuantity} pcs</span>
                            </div>
                            {batch.remnantLength !== undefined && (
                              <div className="text-[10px] text-muted-foreground font-mono">
                                Remnant: {batch.remnantLength.toFixed(2)} m
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-[11px] font-mono text-foreground">
                              PCL: <strong>{batch.pillowCoverCuttingLength} {batch.pillowCoverCuttingLengthUom || 'm'}</strong>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              Count: <span className="font-mono text-foreground font-semibold">{batch.cuttingCount || 1} cuts</span>
                            </div>
                            <div className="text-[10px] text-emerald-600 font-mono font-semibold">
                              Yield: {batch.outputQuantity} pcs
                            </div>
                          </>
                        )}
                      </td>

                      {/* Output & Progress */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                          <span className="font-bold text-foreground">
                            {batch.completedQuantity} / {batch.outputQuantity} pcs
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              progressPct === 100 ? 'bg-emerald-500' : 'bg-purple-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Pending: {Math.max(0, batch.outputQuantity - batch.completedQuantity)}</span>
                          <button
                            onClick={() => {
                              setSelectedBatchForProgress(batch);
                              setNewCompletedQuantity(batch.completedQuantity);
                              setIsMarkFinal((batch.completedQuantity || 0) >= batch.outputQuantity);
                              setWastageDescription(batch.notes || '');
                            }}
                            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold text-[10px]"
                          >
                            Update
                          </button>
                        </div>
                      </td>

                      {/* Salary Voucher */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="text-[11px] font-mono font-bold text-foreground">
                          ₹{batch.salaryRatePerUnit} / pc
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Total: <span className="font-mono font-semibold text-foreground">₹{batch.totalSalary.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                          Earned: ₹{earnedBatchSalary.toLocaleString()}
                        </div>
                        {batch.workerSalaryShare > 0 && batch.executorType === 'WORKERS' && (
                          <div className="text-[9px] text-muted-foreground">
                            Share/worker: ₹{batch.workerSalaryShare.toFixed(0)}
                          </div>
                        )}
                      </td>

                      {/* Handler & Logistics */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {batch.executorType === 'WORKERS' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                              <Users className="h-3 w-3" />
                              Internal Workforce
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                              <Building2 className="h-3 w-3" />
                              {batch.companyName || 'Jobworking Company'}
                            </span>
                          )}
                        </div>

                        {batch.workerNames && (
                          <div className="text-[10px] text-muted-foreground truncate max-w-[160px]" title={batch.workerNames}>
                            {batch.workerNames}
                          </div>
                        )}

                        {batch.deliveryPerson && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                            <Truck className="h-3 w-3 text-purple-500" />
                            <span>{batch.deliveryPerson}</span>
                            {batch.vehicleNumber && <span>({batch.vehicleNumber})</span>}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {batch.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        ) : batch.status === 'CANCELLED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                            <Clock className="h-3 w-3" />
                            In Progress
                          </span>
                        )}
                        {batch.notes && (
                          <span className="block mt-1 text-[10px] text-muted-foreground italic truncate max-w-[120px]" title={batch.notes}>
                            📝 {batch.notes}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/pillow-bedsheet-production/batches/${batch.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="View Batch Details & Sizing Formula"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBatchForProgress(batch);
                              setNewCompletedQuantity(batch.completedQuantity || batch.outputQuantity);
                              setIsMarkFinal(batch.status === 'COMPLETED' || (batch.completedQuantity || 0) >= batch.outputQuantity);
                              setWastageDescription(batch.notes || '');
                            }}
                            className="h-7 px-1.5 text-[10px] text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 gap-1 border border-purple-500/20"
                            title="Log Progress & Record Wastage"
                          >
                            <FileText className="h-3 w-3" />
                            <span>Log/Wastage</span>
                          </Button>

                          {batch.status === 'IN_PROGRESS' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(batch.id, 'COMPLETED')}
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              title="Mark Batch as Complete"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Progress Modal */}
      {selectedBatchForProgress && (
        <Modal
          isOpen={!!selectedBatchForProgress}
          onClose={() => {
            setSelectedBatchForProgress(null);
            setNewCompletedQuantity('');
            setIsMarkFinal(false);
            setWastageDescription('');
          }}
          title={`Log Completed Output — ${selectedBatchForProgress.batchNumber}`}
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-secondary/30 rounded-lg border border-border/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-semibold text-foreground">{selectedBatchForProgress.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output Target:</span>
                <span className="font-mono font-bold text-foreground">{selectedBatchForProgress.outputQuantity} pieces</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-mono font-bold text-foreground">₹{selectedBatchForProgress.salaryRatePerUnit} / piece</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center justify-between">
                <span>Completed Pieces (Cumulative)</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Target: {selectedBatchForProgress.outputQuantity} pcs
                </span>
              </label>
              <Input
                type="number"
                min="0"
                max={selectedBatchForProgress.outputQuantity}
                value={newCompletedQuantity}
                onChange={(e) => setNewCompletedQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={`0 to ${selectedBatchForProgress.outputQuantity}`}
                className="font-mono h-11 text-base font-bold"
              />

              {/* Quick Add Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[11px] text-muted-foreground mr-1">Quick Add:</span>
                {[5, 10, 25].map((inc) => (
                  <Button
                    key={inc}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = Number(newCompletedQuantity) || 0;
                      const nextVal = Math.min(selectedBatchForProgress.outputQuantity, current + inc);
                      setNewCompletedQuantity(nextVal);
                    }}
                    className="h-7 px-2 text-xs font-mono"
                  >
                    +{inc}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCompletedQuantity(selectedBatchForProgress.outputQuantity)}
                  className="h-7 px-2 text-xs font-mono text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                >
                  Complete All ({selectedBatchForProgress.outputQuantity})
                </Button>
              </div>
            </div>

            {/* Live Progress Preview, Salary & Wastage Section */}
            {(() => {
              const val = typeof newCompletedQuantity === 'number' ? newCompletedQuantity : 0;
              const total = selectedBatchForProgress.outputQuantity;
              const pct = total > 0 ? Math.min(100, Math.round((val / total) * 1000) / 10) : 0;
              const pending = Math.max(0, total - val);
              const isFinishing = isMarkFinal || val >= total;

              return (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-foreground">
                        Progress: {val} / {total} pieces
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct === 100 ? 'bg-emerald-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>{pending} pieces pending</span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                        Salary Earned: ₹{(val * selectedBatchForProgress.salaryRatePerUnit).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Final Entry Toggle */}
                  <div className="flex items-center gap-2.5 px-1 py-1">
                    <input
                      type="checkbox"
                      id="markFinalPillow"
                      checked={isFinishing}
                      onChange={(e) => setIsMarkFinal(e.target.checked)}
                      disabled={val >= total}
                      className="rounded border-border text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer disabled:opacity-75"
                    />
                    <label htmlFor="markFinalPillow" className="text-xs font-semibold cursor-pointer flex-1 flex items-center justify-between">
                      <span className="text-foreground">Mark as Final Entry (Complete Batch)</span>
                      {val >= total ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          100% Target Met
                        </span>
                      ) : isMarkFinal ? (
                        <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                          Ready to Close
                        </span>
                      ) : null}
                    </label>
                  </div>

                  {/* Wastage & Completion Remarks */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{isFinishing ? 'Wastage & Completion Remarks' : 'Wastage & Shift Remarks'}</span>
                      </label>
                      {isFinishing && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          Final Closure
                        </span>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={wastageDescription}
                      onChange={(e) => setWastageDescription(e.target.value)}
                      placeholder={
                        isFinishing
                          ? 'Enter fabric cutting scrap, hem defect count, or closure remarks (optional)...'
                          : 'Enter shift notes or scrap details (optional)...'
                      }
                      className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                    />
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBatchForProgress(null);
                  setNewCompletedQuantity('');
                  setIsMarkFinal(false);
                  setWastageDescription('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleSaveProgress(selectedBatchForProgress)}
                disabled={
                  updateProgressMutation.isPending ||
                  newCompletedQuantity === '' ||
                  Number(newCompletedQuantity) < 0 ||
                  Number(newCompletedQuantity) > selectedBatchForProgress.outputQuantity
                }
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {updateProgressMutation.isPending
                  ? 'Saving...'
                  : (isMarkFinal || Number(newCompletedQuantity) >= selectedBatchForProgress.outputQuantity)
                  ? 'Finish Batch & Save Final Entry'
                  : 'Save Progress'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Step 1 Assignment Modal for New Batch */}
      <ProductionAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productionType="PILLOW_BEDSHEET"
      />
    </div>
  );
}
