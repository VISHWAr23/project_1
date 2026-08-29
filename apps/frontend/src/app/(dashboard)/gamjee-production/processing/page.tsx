'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGamjeeBatches, useGamjeeReports } from '@/hooks/useGamjeeProduction';
import { GamjeeBatchStatusBadge } from '@/components/gamjee-production/batch-status-badge';
import { FabricOperationModal } from '@/components/gamjee-production/fabric-operation-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Scissors,
  Layers,
  Pin,
  Plus,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function GamjeeProcessingStationPage() {
  const { data: batchesData, isLoading: loadingBatches } = useGamjeeBatches({ limit: 50 });
  const { data: wastageReports, isLoading: loadingOps } = useGamjeeReports('wastage');

  const [selectedBatchForOp, setSelectedBatchForOp] = useState<any | null>(null);

  const batches = batchesData?.items || [];
  const operations = wastageReports || [];

  // Filter batches currently in fabric processing
  const processingBatches = batches.filter(
    (b) =>
      b.status === 'MATERIALS_SELECTED' ||
      b.status === 'PINNING' ||
      b.status === 'FOLDING' ||
      b.status === 'CUTTING'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/gamjee-production">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Fabric Processing Station
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Execute unified fabric preparation (Pinning, Folding & Cutting) to produce cut Gamjee pieces for rolling.
          </p>
        </div>

        <Link href="/gamjee-production/rolling">
          <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5">
            <span>Go to Rolling Station</span>
          </Button>
        </Link>
      </div>

      {/* Active Batches Waiting for Processing */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Batches Awaiting Fabric Preparation</h3>
            <p className="text-xs text-muted-foreground">Select a batch to complete pinning, folding & cutting preparation</p>
          </div>
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
            {processingBatches.length} Active Jobs
          </span>
        </div>

        {loadingBatches ? (
          <SkeletonLoader className="h-20 w-full" />
        ) : processingBatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No batches currently waiting in fabric processing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processingBatches.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-border bg-secondary/20 hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-foreground">{b.batchNumber}</span>
                  <GamjeeBatchStatusBadge status={b.status} size="sm" />
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {b.finishedProduct?.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Size: {b.gamjeeSize?.name || 'Standard'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                  <span className="text-muted-foreground font-mono">
                    Target: <strong>{Number(b.productionQuantity || 0)} Pieces</strong>
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => setSelectedBatchForOp(b)}
                  >
                    <Scissors className="h-3 w-3" />
                    <span>Prepare Fabric</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed Operations History */}
      <Card className="p-5 bg-card border-border">
        <h3 className="text-sm font-bold text-foreground mb-3">Recent Operation Logs & Wastage Analysis</h3>
        {loadingOps ? (
          <SkeletonLoader className="h-32 w-full" />
        ) : operations.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">No operations recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-y border-border">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Batch</th>
                  <th className="px-3 py-2.5 font-semibold">Product</th>
                  <th className="px-3 py-2.5 font-semibold">Operation</th>
                  <th className="px-3 py-2.5 font-semibold">Input (m)</th>
                  <th className="px-3 py-2.5 font-semibold">Output (m)</th>
                  <th className="px-3 py-2.5 font-semibold">Wastage</th>
                  <th className="px-3 py-2.5 font-semibold">Wastage %</th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {operations.map((op: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/20">
                    <td className="px-3 py-3 font-mono font-bold text-foreground">{op.batchNumber}</td>
                    <td className="px-3 py-3 text-foreground">{op.product}</td>
                    <td className="px-3 py-3 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-secondary text-[11px] font-mono">
                        {op.operation}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono">{op.inputQuantity}</td>
                    <td className="px-3 py-3 font-mono font-bold text-emerald-600">{op.outputQuantity}</td>
                    <td className="px-3 py-3 font-mono text-rose-500">{op.wastageQuantity}</td>
                    <td className="px-3 py-3 font-mono font-semibold">{op.wastagePercentage}</td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">{formatDate(op.operationDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {selectedBatchForOp && (
        <FabricOperationModal
          isOpen={Boolean(selectedBatchForOp)}
          onClose={() => setSelectedBatchForOp(null)}
          batch={selectedBatchForOp}
        />
      )}
    </div>
  );
}
