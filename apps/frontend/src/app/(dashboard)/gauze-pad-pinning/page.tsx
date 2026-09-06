'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scissors,
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
  Coins,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useGauzePadPinningBatches,
  useGauzePadPinningDashboard,
  useUpdateGauzePadPinningBatchStatus,
} from '@/hooks/useGauzePadPinning';
import { ProductionAssignmentModal } from '@/components/job-work/production-assignment-modal';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';

export default function GauzePadPinningPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: stats } = useGauzePadPinningDashboard();
  const { data: batchesData } = useGauzePadPinningBatches({
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    materialType: materialFilter !== 'ALL' ? materialFilter : undefined,
  });

  const updateStatusMutation = useUpdateGauzePadPinningBatchStatus();
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
                Gauze Pad Pinning
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Operations Line
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pinning size and cutting size dual division operation with automated workforce salary calculation.
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
            className="h-8 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Pinning Batch</span>
          </Button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active WIP Batches</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
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
            <span className="text-xs font-medium text-muted-foreground">Total Output Pads</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {(stats?.totalOutputPads ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">Pads</span>
          </div>
        </Card>

        <Card className="p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Fabric Processed</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
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
            <span className="text-xs font-medium text-muted-foreground">Total Accrued Salary</span>
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
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-md border border-input bg-background text-foreground"
          >
            <option value="ALL">All Material Types</option>
            <option value="ROLL">Roll Form Only</option>
            <option value="PIECES">Pieces Form Only</option>
          </select>

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
                <th className="py-3 px-4 font-semibold">Intake Form</th>
                <th className="py-3 px-4 font-semibold">Total Length</th>
                <th className="py-3 px-4 font-semibold">Division Operation</th>
                <th className="py-3 px-4 font-semibold text-right">Output Pads</th>
                <th className="py-3 px-4 font-semibold text-right">Salary (Total / Split)</th>
                <th className="py-3 px-4 font-semibold">Handler</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground text-xs">
                    No gauze pad pinning batches found matching your filters.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 block">
                        {batch.batchNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px] block">
                        {batch.productName}
                      </span>
                    </td>

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

                    <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                      {batch.totalLength} m
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>÷ {batch.pinningSize}m (pin)</div>
                      <div className="text-muted-foreground">÷ {batch.cuttingSize} (cuts)</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400 block">
                        {batch.outputQuantity} Pads
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                        ₹{batch.totalSalary.toFixed(2)}
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
                            : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20'
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
                          onClick={() => handleStatusChange(batch.id, 'COMPLETED')}
                          className="h-7 px-2 text-[11px] gap-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="h-3 w-3" />
                          <span>Complete</span>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Finished</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ProductionAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productionType="GAUZE_PAD_PINNING"
      />
    </div>
  );
}
