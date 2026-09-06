'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sun,
  Wind,
  Calculator,
  Plus,
  ArrowLeft,
  Search,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  Boxes,
  Coins,
  Check,
  Percent,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  useDryingBatches,
  useDryingDashboard,
  useUpdateDryingProgress,
} from '@/hooks/useDrying';
import { ProductionAssignmentModal } from '@/components/job-work/production-assignment-modal';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';

export default function DryingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchForProgress, setSelectedBatchForProgress] = useState<any | null>(null);
  const [newCompletedPieces, setNewCompletedPieces] = useState<number | ''>('');

  const { data: stats } = useDryingDashboard();
  const { data: batchesData } = useDryingBatches({
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const updateProgressMutation = useUpdateDryingProgress();
  const { toast } = useToast();

  const batches = batchesData?.items || [];

  const handleSaveProgress = async (id: string, totalPieces: number) => {
    if (newCompletedPieces === '' || Number(newCompletedPieces) < 0) {
      toast('Invalid Value', 'Please enter a valid count of completed pieces', 'warning');
      return;
    }
    const val = Number(newCompletedPieces);
    if (val > totalPieces) {
      toast('Value Exceeded', `Cannot exceed total pieces of ${totalPieces}`, 'warning');
      return;
    }

    try {
      await updateProgressMutation.mutateAsync({
        id,
        completedPieces: val,
        status: val >= totalPieces ? 'COMPLETED' : 'IN_PROGRESS',
      });
      toast('Progress Updated', `Updated drying progress to ${val} / ${totalPieces} pieces`, 'success');
      setSelectedBatchForProgress(null);
      setNewCompletedPieces('');
    } catch (e: any) {
      toast('Error', e?.message || 'Failed to update progress', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
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
                Drying Operations
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Operations Line
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Fabric drying progress tracking (pieces completed vs pending) with real-time per-meter salary disbursement.
            </p>
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
            className="h-8 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Drying Batch</span>
          </Button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Drying Runs</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
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
            <span className="text-xs font-medium text-muted-foreground">Total Pieces Dried</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {(stats?.totalPiecesProcessed ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">pieces</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Meters Dried</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sun className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {(stats?.totalMetersDried ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">meters</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Accrued Earned Salary</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{(stats?.totalSalaryPaid ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search batch #, product or worker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
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
                <th className="py-3 px-4 font-semibold">Batch & Product</th>
                <th className="py-3 px-4 font-semibold">Intake Specs</th>
                <th className="py-3 px-4 font-semibold">Total Length</th>
                <th className="py-3 px-4 font-semibold min-w-[180px]">Drying Progress</th>
                <th className="py-3 px-4 font-semibold text-right">Earned Salary (Split)</th>
                <th className="py-3 px-4 font-semibold">Handler</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                    No drying batches found matching your filters.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-orange-600 dark:text-orange-400 block">
                        {batch.batchNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px] block">
                        {batch.productName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>{batch.totalPieces} pcs</div>
                      <div className="text-muted-foreground">({batch.pieceLength}m × {batch.pieceWidth}cm)</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                      {batch.totalLength.toLocaleString()} m
                    </td>

                    {/* Progress Column */}
                    <td className="py-3.5 px-4 min-w-[170px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-foreground">
                            {batch.completedPieces} / {batch.totalPieces} pcs
                          </span>
                          <span className="text-orange-600 dark:text-orange-400 font-semibold">
                            {batch.completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              batch.completionPercentage >= 100 ? 'bg-emerald-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.min(batch.completionPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {batch.completedLength}m dried • {batch.pendingPieces} pcs pending
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                        ₹{batch.earnedSalary.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        (₹{batch.workerSalaryShare.toFixed(2)} / person)
                      </span>
                    </td>

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
                            : batch.companyName || 'Vendor'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          batch.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                            : 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {batch.status !== 'COMPLETED' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBatchForProgress(batch);
                            setNewCompletedPieces(batch.completedPieces);
                          }}
                          className="h-7 px-2.5 text-[11px] gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10 border-orange-500/30"
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

      {/* Dedicated Log Drying Progress Modal */}
      {selectedBatchForProgress && (
        <Modal
          isOpen={!!selectedBatchForProgress}
          onClose={() => {
            setSelectedBatchForProgress(null);
            setNewCompletedPieces('');
          }}
          title="Log Drying Progress"
          description={`Update completed drying pieces for batch ${selectedBatchForProgress.batchNumber}`}
          size="md"
        >
          <div className="space-y-5">
            {/* Batch Info Card */}
            <div className="p-3.5 rounded-lg bg-secondary/50 border border-border/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Batch Number:</span>
                <span className="font-mono font-bold text-orange-600 dark:text-orange-400">
                  {selectedBatchForProgress.batchNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Product Specification:</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {selectedBatchForProgress.productName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Target Total Pieces:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedBatchForProgress.totalPieces} pieces ({selectedBatchForProgress.pieceLength}m each)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Total Batch Length:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedBatchForProgress.totalLength} meters
                </span>
              </div>
            </div>

            {/* Input Field with full visibility */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Completed Pieces So Far (Cumulative)</span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Target: {selectedBatchForProgress.totalPieces} pcs
                </span>
              </label>

              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max={selectedBatchForProgress.totalPieces}
                  value={newCompletedPieces}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setNewCompletedPieces(val);
                  }}
                  placeholder={`e.g. ${selectedBatchForProgress.completedPieces}`}
                  className="h-12 text-lg font-mono font-bold px-4 bg-background text-foreground border-input focus-visible:ring-orange-500"
                  autoFocus
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground font-semibold">
                  / {selectedBatchForProgress.totalPieces} pcs
                </span>
              </div>

              {/* Quick Increment buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-muted-foreground mr-1">Quick Add:</span>
                {[5, 10, 25, 50].map((inc) => (
                  <Button
                    key={inc}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = Number(newCompletedPieces) || 0;
                      const nextVal = Math.min(selectedBatchForProgress.totalPieces, current + inc);
                      setNewCompletedPieces(nextVal);
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
                  onClick={() => setNewCompletedPieces(selectedBatchForProgress.totalPieces)}
                  className="h-7 px-2.5 text-xs font-mono text-orange-600 dark:text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                >
                  Complete All ({selectedBatchForProgress.totalPieces})
                </Button>
              </div>
            </div>

            {/* Live Progress Preview & Salary Calculation */}
            {(() => {
              const val = typeof newCompletedPieces === 'number' ? newCompletedPieces : 0;
              const total = selectedBatchForProgress.totalPieces;
              const pct = total > 0 ? Math.min(100, Math.round((val / total) * 1000) / 10) : 0;
              const pending = Math.max(0, total - val);
              const pieceLen = selectedBatchForProgress.pieceLength || 0;
              const completedMeters = val * pieceLen;
              const earned = completedMeters * (selectedBatchForProgress.salaryPerMeter || 10);
              const workerCount = Math.max(1, selectedBatchForProgress.workerCount || 1);
              const perWorker = earned / workerCount;

              return (
                <div className="p-3.5 rounded-lg bg-orange-500/5 border border-orange-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-foreground">
                      Progress: {val} / {total} pieces ({completedMeters}m dried)
                    </span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>{pending} pieces pending</span>
                    {pct === 100 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Ready to mark Completed
                      </span>
                    )}
                  </div>

                  {/* Realtime Salary preview */}
                  <div className="pt-2 border-t border-orange-500/20 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Salary Earned So Far:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{earned.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[11px]">Per Worker ({workerCount}):</span>
                      <span className="font-mono font-semibold text-foreground">
                        ₹{perWorker.toFixed(2)}
                      </span>
                    </div>
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
                  setNewCompletedPieces('');
                }}
                disabled={updateProgressMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() =>
                  handleSaveProgress(selectedBatchForProgress.id, selectedBatchForProgress.totalPieces)
                }
                disabled={
                  updateProgressMutation.isPending ||
                  newCompletedPieces === '' ||
                  Number(newCompletedPieces) < 0 ||
                  Number(newCompletedPieces) > selectedBatchForProgress.totalPieces
                }
                className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5"
              >
                <Check className="h-4 w-4" />
                {updateProgressMutation.isPending ? 'Saving...' : 'Save & Update Progress'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ProductionAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productionType="DRYING"
      />
    </div>
  );
}
