'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useGamjeeBatchDetail,
  useUpdateGamjeeBatchStatus,
} from '@/hooks/useGamjeeProduction';
import { GamjeeBatchStatusBadge } from '@/components/gamjee-production/batch-status-badge';
import { GamjeeProductionTimeline } from '@/components/gamjee-production/production-timeline';
import { IssueMaterialsModal } from '@/components/gamjee-production/issue-materials-modal';
import { FabricOperationModal } from '@/components/gamjee-production/fabric-operation-modal';
import { RollingEntryModal } from '@/components/gamjee-production/rolling-entry-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { toast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Package,
  Layers,
  Scissors,
  Scroll,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pin,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

export default function GamjeeBatchDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: batch, isLoading, error } = useGamjeeBatchDetail(id);
  const updateStatusMutation = useUpdateGamjeeBatchStatus();

  const [activeTab, setActiveTab] = useState<'materials' | 'processing' | 'rolling'>('materials');

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false);
  const [isRollingModalOpen, setIsRollingModalOpen] = useState(false);
  const [activeOperationCode, setActiveOperationCode] = useState<string | undefined>(undefined);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <SkeletonLoader className="h-20 w-full" />
        <SkeletonLoader className="h-48 w-full" />
        <SkeletonLoader className="h-64 w-full" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-foreground">Gamjee Batch Not Found</h3>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          The requested production batch does not exist or has been removed.
        </p>
        <Link href="/gamjee-production/batches">
          <Button size="sm" variant="outline">
            Back to Batches
          </Button>
        </Link>
      </div>
    );
  }

  const fabricInput = batch.materialInputs?.find((m) => m.materialType === 'BLEACHED_FABRIC');
  const cottonInput = batch.materialInputs?.find((m) => m.materialType === 'COTTON_ROLL');
  const operations = batch.operations || [];
  const rollingEntries = batch.rollingEntries || [];
  const finishedRolls = batch.finishedRolls || [];
  const movements = batch.materialMovements || [];
  const history = batch.statusHistory || [];

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        batchId: batch.id,
        status: newStatus,
        remarks: `Status manually changed to ${newStatus}`,
      });
      toast.success(`Batch status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    }
  };

  // Determine next action button
  const renderNextActionButton = () => {
    if (batch.status === 'DRAFT') {
      return (
        <Button
          onClick={() => setIsIssueModalOpen(true)}
          className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
        >
          <Package className="h-4 w-4" />
          <span>Issue Materials (Fabric + Cotton)</span>
        </Button>
      );
    }

    if (batch.status === 'MATERIALS_SELECTED' || batch.currentStage === 'PINNING') {
      return (
        <Button
          onClick={() => {
            setActiveOperationCode('OP-PIN');
            setIsOperationModalOpen(true);
          }}
          className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
        >
          <Pin className="h-4 w-4" />
          <span>Record Fabric Pinning</span>
        </Button>
      );
    }

    if (batch.status === 'PINNING' || batch.currentStage === 'FOLDING') {
      return (
        <Button
          onClick={() => {
            setActiveOperationCode('OP-FOLD');
            setIsOperationModalOpen(true);
          }}
          className="h-9 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs font-semibold"
        >
          <Layers className="h-4 w-4" />
          <span>Record Fabric Folding</span>
        </Button>
      );
    }

    if (batch.status === 'FOLDING' || batch.currentStage === 'CUTTING') {
      return (
        <Button
          onClick={() => {
            setActiveOperationCode('OP-CUT');
            setIsOperationModalOpen(true);
          }}
          className="h-9 gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white shadow-xs font-semibold"
        >
          <Scissors className="h-4 w-4" />
          <span>Record Fabric Cutting</span>
        </Button>
      );
    }

    if (
      batch.status === 'CUTTING' ||
      batch.status === 'READY_FOR_ROLLING' ||
      batch.status === 'COTTON_PREPARATION' ||
      batch.currentStage === 'READY_FOR_ROLLING' ||
      batch.currentStage === 'ROLLING'
    ) {
      return (
        <Button
          onClick={() => setIsRollingModalOpen(true)}
          className="h-9 gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-xs font-semibold animate-pulse"
        >
          <Scroll className="h-4 w-4" />
          <span>Combine & Start Rolling</span>
        </Button>
      );
    }

    if (batch.status === 'COMPLETED') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="h-4 w-4" />
          <span>Completed ({batch.productionQuantity || 0} Finished Rolls in Stock)</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Hub Card */}
      <Card className="p-5 bg-card border-border shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link href="/gamjee-production/batches">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mt-0.5">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-foreground">
                  {batch.batchNumber}
                </h1>
                <GamjeeBatchStatusBadge status={batch.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Product:{' '}
                <strong className="text-foreground">{batch.finishedProduct?.name}</strong> | Size:{' '}
                <strong className="text-foreground">{batch.gamjeeSize?.name || 'Standard'}</strong> | Production
                Date: <span className="font-mono">{formatDate(batch.productionDate)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {renderNextActionButton()}

            {batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs"
                onClick={() =>
                  handleStatusChange(batch.status === 'ON_HOLD' ? 'MATERIALS_SELECTED' : 'ON_HOLD')
                }
              >
                {batch.status === 'ON_HOLD' ? 'Resume Batch' : 'Pause Batch'}
              </Button>
            )}
          </div>
        </div>

        {/* Quick KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border text-xs">
          <div>
            <span className="text-muted-foreground text-[11px]">Bleached Fabric Issued:</span>
            <p className="font-mono font-bold text-foreground">
              {fabricInput ? `${Number(fabricInput.quantityIssued)} ${fabricInput.uom}` : 'Not Issued'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Cotton Roll Issued:</span>
            <p className="font-mono font-bold text-foreground">
              {cottonInput ? `${Number(cottonInput.quantityIssued)} ${cottonInput.uom}` : 'Not Issued'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Current Stage WIP:</span>
            <p className="font-mono font-bold text-foreground">
              {Number(batch.currentQuantity)} {batch.currentUom || 'meter'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Finished Output:</span>
            <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {finishedRolls.reduce((acc, r) => acc + r.rollCount, 0) || batch.productionQuantity || 0} Rolls
            </p>
          </div>
        </div>
      </Card>

      {/* Visual Pipeline Timeline */}
      <GamjeeProductionTimeline batch={batch} />

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'materials', label: '1. Raw Materials', icon: Package, count: batch.materialInputs?.length },
            { id: 'processing', label: '2. Fabric Operations', icon: Scissors, count: operations.length },
            { id: 'rolling', label: '3. Rolling & Finished Goods', icon: Scroll, count: finishedRolls.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Raw Materials */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Raw Materials Issued to Batch</h3>
            {batch.status !== 'COMPLETED' && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setIsIssueModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Issue Additional Material</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fabric Card */}
            <Card className="p-4 bg-card border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-xs uppercase">Bleached Fabric Input</span>
                </div>
                {fabricInput ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ALLOCATED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    PENDING
                  </span>
                )}
              </div>

              {fabricInput ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <strong className="text-foreground">{fabricInput.product?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-mono text-foreground">{fabricInput.product?.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roll / Batch Lot:</span>
                    <span className="font-mono text-foreground">
                      {fabricInput.rollOrBatchNumber || fabricInput.inventoryBatch?.batchNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity Issued:</span>
                    <strong className="font-mono text-foreground">
                      {Number(fabricInput.quantityIssued)} {fabricInput.uom}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity Consumed:</span>
                    <span className="font-mono text-muted-foreground">
                      {Number(fabricInput.quantityConsumed || 0)} {fabricInput.uom}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No Bleached Fabric issued to this batch yet.
                </div>
              )}
            </Card>

            {/* Cotton Card */}
            <Card className="p-4 bg-card border-border space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-xs uppercase">Cotton Roll (400g) Input</span>
                </div>
                {cottonInput ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ALLOCATED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    PENDING
                  </span>
                )}
              </div>

              {cottonInput ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <strong className="text-foreground">{cottonInput.product?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-mono text-foreground">{cottonInput.product?.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roll / Batch Lot:</span>
                    <span className="font-mono text-foreground">
                      {cottonInput.rollOrBatchNumber || cottonInput.inventoryBatch?.batchNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity Issued:</span>
                    <strong className="font-mono text-foreground">
                      {Number(cottonInput.quantityIssued)} {cottonInput.uom}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity Consumed:</span>
                    <span className="font-mono text-muted-foreground">
                      {Number(cottonInput.quantityConsumed || 0)} {cottonInput.uom}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No Cotton Rolls issued to this batch yet.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Fabric Operations */}
      {activeTab === 'processing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Fabric Preparation Operations Log</h3>
            {batch.status !== 'COMPLETED' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setActiveOperationCode('OP-PIN');
                    setIsOperationModalOpen(true);
                  }}
                >
                  <Pin className="h-3.5 w-3.5" />
                  <span>Pinning</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setActiveOperationCode('OP-FOLD');
                    setIsOperationModalOpen(true);
                  }}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Folding</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => {
                    setActiveOperationCode('OP-CUT');
                    setIsOperationModalOpen(true);
                  }}
                >
                  <Scissors className="h-3.5 w-3.5" />
                  <span>Cutting</span>
                </Button>
              </div>
            )}
          </div>

          <Card className="p-5 bg-card border-border">
            {operations.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No processing operations recorded yet. Record Pinning, Folding, or Cutting above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-y border-border">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Step</th>
                      <th className="px-3 py-2.5 font-semibold">Operation</th>
                      <th className="px-3 py-2.5 font-semibold">Input Qty</th>
                      <th className="px-3 py-2.5 font-semibold">Output Qty</th>
                      <th className="px-3 py-2.5 font-semibold">Wastage / Scrap</th>
                      <th className="px-3 py-2.5 font-semibold">Operator</th>
                      <th className="px-3 py-2.5 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {operations.map((op) => (
                      <tr key={op.id} className="hover:bg-secondary/20">
                        <td className="px-3 py-3 font-mono font-bold text-foreground">
                          Step {op.sequenceNumber}
                        </td>
                        <td className="px-3 py-3 font-semibold text-foreground">
                          {op.operationType?.name || op.operationTypeId}
                        </td>
                        <td className="px-3 py-3 font-mono">
                          {Number(op.inputQuantity)} {op.inputUom || 'm'}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-foreground">
                          {Number(op.outputQuantity)} {op.outputUom || 'm'}
                        </td>
                        <td className="px-3 py-3 font-mono text-rose-500 font-semibold">
                          {Number(op.wastageQuantity) > 0 ? `${Number(op.wastageQuantity)} ${op.outputUom || 'm'}` : '-'}
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {op.employee ? `${op.employee.firstName} ${op.employee.lastName}` : 'Unassigned'}
                        </td>
                        <td className="px-3 py-3 font-mono text-muted-foreground">{formatDate(op.operationDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Rolling & Finished Goods */}
      {activeTab === 'rolling' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Rolling & Finished Gamjee Rolls Output</h3>
            {batch.status !== 'COMPLETED' && (
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setIsRollingModalOpen(true)}
              >
                <Scroll className="h-3.5 w-3.5" />
                <span>Combine & Start Rolling</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-card border-border space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2 font-bold text-xs uppercase">
                <Scroll className="h-4 w-4 text-purple-500" />
                <span>Rolling Transaction Details</span>
              </div>
              {rollingEntries.length > 0 ? (
                rollingEntries.map((rl) => (
                  <div key={rl.id} className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rolling Ref:</span>
                      <span className="font-bold text-foreground">{rl.rollingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fabric Consumed:</span>
                      <span>{Number(rl.fabricInputQuantity)} {rl.fabricInputUom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cotton Consumed:</span>
                      <span>{Number(rl.cottonInputQuantity)} {rl.cottonInputUom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rolls Produced:</span>
                      <span className="font-bold text-emerald-600">{rl.finishedRollQuantity} Rolls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rolling Date:</span>
                      <span>{formatDate(rl.rollingDate)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">No rolling recorded yet.</div>
              )}
            </Card>

            <Card className="p-4 bg-card border-border space-y-3">
              <div className="flex items-center gap-2 border-b border-border pb-2 font-bold text-xs uppercase">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Finished Goods Warehouse Inventory</span>
              </div>
              {finishedRolls.length > 0 ? (
                finishedRolls.map((fr) => (
                  <div key={fr.id} className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lot Batch Number:</span>
                      <span className="font-bold text-foreground">{fr.rollBatchNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Finished Rolls in Stock:</span>
                      <span className="font-bold text-emerald-600">{fr.rollCount} Rolls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Length:</span>
                      <span>{Number(fr.totalLength || 0)} Meters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warehouse:</span>
                      <span>{fr.warehouse?.name || 'Finished Goods Warehouse'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock Status:</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                        {fr.stockStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Awaiting finished rolls confirmation.
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Modals */}
      <IssueMaterialsModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        batch={batch}
      />

      <FabricOperationModal
        isOpen={isOperationModalOpen}
        onClose={() => {
          setIsOperationModalOpen(false);
          setActiveOperationCode(undefined);
        }}
        batch={batch}
        defaultOperationCode={activeOperationCode}
      />

      <RollingEntryModal
        isOpen={isRollingModalOpen}
        onClose={() => setIsRollingModalOpen(false)}
        batch={batch}
      />
    </div>
  );
}
