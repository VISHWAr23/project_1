'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Scissors,
  Layers,
  Calculator,
  Plus,
  ArrowLeft,
  Search,
  Filter,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  Boxes,
  Eye,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  useMopingPadBatches,
  useMopingPadDashboard,
  useUpdateMopingPadBatchStatus,
  useUpdateMopingPadProgress,
} from '@/hooks/useMopingPadProduction';
import {
  ProductionAssignmentModal,
  ProductionType,
} from '@/components/job-work/production-assignment-modal';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';

export default function MopingPadProductionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchForProgress, setSelectedBatchForProgress] = useState<any | null>(null);
  const [newCompletedQuantity, setNewCompletedQuantity] = useState<number | ''>('');

  const { data: stats } = useMopingPadDashboard();
  const { data: batchesData, isLoading } = useMopingPadBatches({
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    materialType: materialFilter !== 'ALL' ? materialFilter : undefined,
  });

  const updateStatusMutation = useUpdateMopingPadBatchStatus();
  const updateProgressMutation = useUpdateMopingPadProgress();
  const { toast } = useToast();

  const batches = batchesData?.items || [];

  const handleStatusChange = async (id: string, newStatus: any) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast('Status Updated', `Batch marked as ${newStatus}`, 'success');
    } catch (e: any) {
      toast('Error', e?.message || 'Failed to update status', 'error');
    }
  };

  const handleSaveProgress = async (id: string, outputQuantity: number) => {
    const val = Number(newCompletedQuantity);
    if (isNaN(val) || val < 0) {
      toast('Invalid Value', 'Completed pads must be 0 or greater', 'warning');
      return;
    }
    if (val > outputQuantity) {
      toast('Exceeds Output', `Completed pads cannot exceed target of ${outputQuantity}`, 'warning');
      return;
    }

    try {
      await updateProgressMutation.mutateAsync({
        id,
        completedQuantity: val,
      });
      toast('Progress Logged', `Logged ${val} pads completed out of ${outputQuantity}`, 'success');
      setSelectedBatchForProgress(null);
      setNewCompletedQuantity('');
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
                Moping Pad Production
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Operations Line
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
            className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Moping Pad Batch</span>
          </Button>
        </div>
      </div>

      {/* Metric Strips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active WIP Batches</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {stats?.activeBatches ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">In Progress</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Output Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {(stats?.totalCompletedPads ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              of {(stats?.totalOutputPads ?? 0).toLocaleString()} Pads
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Fabric Intake Processed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {(stats?.totalFabricMeters ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">meters</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Runs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {stats?.totalBatches ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">Completed: {stats?.completedBatches ?? 0}</span>
          </div>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search batch #, product or handler..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Material Type Filter */}
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground"
          >
            <option value="ALL">All Material Types</option>
            <option value="ROLL">Roll Form Only</option>
            <option value="PIECES">Pieces Form Only</option>
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
                <th className="py-3 px-4 font-semibold">Specs & Item Type</th>
                <th className="py-3 px-4 font-semibold">Intake Form</th>
                <th className="py-3 px-4 font-semibold">Dimensions & Count</th>
                <th className="py-3 px-4 font-semibold">Total Length</th>
                <th className="py-3 px-4 font-semibold">Pinning Size</th>
                <th className="py-3 px-4 font-semibold min-w-[170px]">Output & Progress</th>
                <th className="py-3 px-4 font-semibold">Handler & Carrier</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground text-xs">
                    No moping pad batches found matching your filters.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-secondary/20 transition-colors">
                    {/* Batch Number, Product & DC */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">
                        {batch.batchNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px] block">
                        {batch.productName}
                      </span>
                      {batch.dcNo && (
                        <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          {batch.dcNo}
                        </span>
                      )}
                    </td>

                    {/* Specs & Construction (Ends, Item Type, Output Width) */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Ends: </span>
                        <strong className="font-mono text-foreground">{batch.ends ? `${batch.ends} E` : '1140 E'}</strong>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Item: </span>
                        <strong className="font-mono text-foreground">{batch.itemType || '22x14'}</strong>
                      </div>
                      <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 truncate max-w-[140px]">
                        {batch.outputProductWidth || '30cm x 30cm - 8 ply'}
                      </div>
                    </td>

                    {/* Intake Form */}
                    <td className="py-3.5 px-4">
                      {batch.materialType === 'ROLL' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          <Layers className="h-3 w-3" />
                          Roll Form
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          <Scissors className="h-3 w-3" />
                          Pieces Form
                        </span>
                      )}
                    </td>

                    {/* Dimensions & Count */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {batch.materialType === 'ROLL' ? (
                        <span>
                          {batch.rollWidth}{batch.rollWidthUom} × {batch.rollLength}{batch.rollLengthUom}
                        </span>
                      ) : (
                        <span>
                          {batch.pieceCount} pcs ({batch.pieceLength}{batch.pieceLengthUom} × {batch.pieceWidth}{batch.pieceWidthUom})
                        </span>
                      )}
                    </td>

                    {/* Total Length */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                      {batch.totalLength} m
                    </td>

                    {/* Pinning Size */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {batch.pinningSize} {batch.pinningSizeUom || 'm'}
                    </td>

                    {/* Calculated Output & Partial Completion */}
                    <td className="py-3.5 px-4 min-w-[170px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-foreground">
                            {batch.completedQuantity || 0} / {batch.outputQuantity} pads
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            {batch.completionPercentage || 0}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              (batch.completionPercentage || 0) >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(batch.completionPercentage || 0, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {batch.pendingQuantity ?? Math.max(0, batch.outputQuantity - (batch.completedQuantity || 0))} pads pending
                        </div>
                      </div>
                    </td>

                    {/* Handler & Carrier */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {batch.executorType === 'WORKERS' ? (
                          <Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        )}
                        <span className="truncate max-w-[140px] text-foreground font-medium">
                          {batch.executorType === 'WORKERS'
                            ? batch.workerNames || 'In-House Staff'
                            : batch.companyName || 'Jobworker'}
                        </span>
                      </div>
                      {batch.executorType === 'COMPANY' && (batch.deliveryPerson || batch.vehicleNumber) && (
                        <div className="mt-1 text-[10px] text-muted-foreground font-mono space-y-0.5">
                          {batch.deliveryPerson && (
                            <span className="block truncate max-w-[140px]">
                              Carrier: {batch.deliveryPerson}
                            </span>
                          )}
                          {batch.vehicleNumber && (
                            <span className="block font-bold text-foreground">
                              {batch.vehicleNumber}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          batch.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      {batch.status !== 'COMPLETED' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBatchForProgress(batch);
                            setNewCompletedQuantity(batch.completedQuantity || 0);
                          }}
                          className="h-7 px-2.5 text-[11px] gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30"
                        >
                          <span>Log Progress</span>
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3.5 w-3.5" /> Finished
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dedicated Log Production Progress Modal */}
      {selectedBatchForProgress && (
        <Modal
          isOpen={!!selectedBatchForProgress}
          onClose={() => {
            setSelectedBatchForProgress(null);
            setNewCompletedQuantity('');
          }}
          title="Log Production Progress"
          description={`Update completed pads for batch ${selectedBatchForProgress.batchNumber}`}
          size="md"
        >
          <div className="space-y-5">
            {/* Batch Info Card */}
            <div className="p-3.5 rounded-lg bg-secondary/50 border border-border/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Batch Number:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {selectedBatchForProgress.batchNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Product / Spec:</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {selectedBatchForProgress.productName || selectedBatchForProgress.productSpecification || 'Moping Pad'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Target Output Quantity:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedBatchForProgress.outputQuantity} pads
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Currently Logged:</span>
                <span className="font-mono text-foreground font-semibold">
                  {selectedBatchForProgress.completedQuantity || 0} pads ({selectedBatchForProgress.completionPercentage || 0}%)
                </span>
              </div>
            </div>

            {/* Input Field with full visibility */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Total Completed Pads (Cumulative)</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Target: {selectedBatchForProgress.outputQuantity} pads
                </span>
              </label>

              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max={selectedBatchForProgress.outputQuantity}
                  value={newCompletedQuantity}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setNewCompletedQuantity(val);
                  }}
                  placeholder={`e.g. ${selectedBatchForProgress.completedQuantity || 0}`}
                  className="h-12 text-lg font-mono font-bold px-4 bg-background text-foreground border-input focus-visible:ring-amber-500"
                  autoFocus
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground font-semibold">
                  / {selectedBatchForProgress.outputQuantity} pads
                </span>
              </div>

              {/* Quick Increment buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1">Quick Add:</span>
                {[10, 50, 100].map((inc) => (
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
                    className="h-7 px-2.5 text-xs font-mono"
                  >
                    +{inc}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCompletedQuantity(selectedBatchForProgress.outputQuantity)}
                  className="h-7 px-2.5 text-xs font-mono text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                >
                  Complete All ({selectedBatchForProgress.outputQuantity})
                </Button>
              </div>
            </div>

            {/* Live Progress Preview */}
            {(() => {
              const val = typeof newCompletedQuantity === 'number' ? newCompletedQuantity : 0;
              const total = selectedBatchForProgress.outputQuantity;
              const pct = total > 0 ? Math.min(100, Math.round((val / total) * 1000) / 10) : 0;
              const pending = Math.max(0, total - val);

              return (
                <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-foreground">
                      Progress Preview: {val} / {total} pads
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>{pending} pads remaining</span>
                    {pct === 100 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Ready to mark Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedBatchForProgress(null);
                  setNewCompletedQuantity('');
                }}
                disabled={updateProgressMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  handleSaveProgress(selectedBatchForProgress.id, selectedBatchForProgress.outputQuantity)
                }
                disabled={
                  updateProgressMutation.isPending ||
                  newCompletedQuantity === '' ||
                  Number(newCompletedQuantity) < 0 ||
                  Number(newCompletedQuantity) > selectedBatchForProgress.outputQuantity
                }
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                <Check className="h-4 w-4" />
                {updateProgressMutation.isPending ? 'Saving...' : 'Save & Update Progress'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assignment Modal if triggered from "+ New Batch" */}
      <ProductionAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productionType="MOPING_PAD"
      />
    </div>
  );
}
