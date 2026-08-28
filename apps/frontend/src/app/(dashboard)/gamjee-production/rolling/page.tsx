'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGamjeeBatches, useGamjeeReports } from '@/hooks/useGamjeeProduction';
import { GamjeeBatchStatusBadge } from '@/components/gamjee-production/batch-status-badge';
import { RollingEntryModal } from '@/components/gamjee-production/rolling-entry-modal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Scroll,
  Sparkles,
  Layers,
  CheckCircle2,
  Play,
  Boxes,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function GamjeeRollingStationPage() {
  const { data: batchesData, isLoading: loadingBatches } = useGamjeeBatches({ limit: 50 });
  const { data: fgReports, isLoading: loadingFG } = useGamjeeReports('finished_goods');

  const [selectedBatchForRolling, setSelectedBatchForRolling] = useState<any | null>(null);

  const batches = batchesData?.items || [];
  const finishedRolls = fgReports || [];

  // Filter batches ready for rolling or rolling
  const rollingBatches = batches.filter(
    (b) =>
      b.status === 'READY_FOR_ROLLING' ||
      b.status === 'COTTON_PREPARATION' ||
      b.status === 'ROLLING' ||
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
              Rolling & Finishing Station
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Combine prepared fabric and cotton wool rolls to manufacture finished Gamjee rolls.
          </p>
        </div>

        <Link href="/gamjee-production/reports">
          <Button size="sm" variant="outline" className="h-9 text-xs">
            Production Reports
          </Button>
        </Link>
      </div>

      {/* Batches Awaiting Rolling */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Batches Ready for Rolling</h3>
            <p className="text-xs text-muted-foreground">Select a batch to combine fabric + cotton into finished rolls</p>
          </div>
          <span className="text-xs font-mono font-semibold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">
            {rollingBatches.length} Ready Jobs
          </span>
        </div>

        {loadingBatches ? (
          <SkeletonLoader className="h-24 w-full" />
        ) : rollingBatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No batches currently waiting for rolling. Process fabric through cutting stage first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rollingBatches.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 transition-all space-y-3"
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
                    Prepared Fabric: <strong>{Number(b.currentQuantity)} m</strong>
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1 shadow-xs"
                    onClick={() => setSelectedBatchForRolling(b)}
                  >
                    <Scroll className="h-3 w-3" />
                    <span>Start Rolling</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Finished Rolls in Warehouse Stock */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Manufactured Finished Rolls in Stock</h3>
            <p className="text-xs text-muted-foreground">Finished goods batches stored in warehouse</p>
          </div>
        </div>

        {loadingFG ? (
          <SkeletonLoader className="h-32 w-full" />
        ) : finishedRolls.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">No finished rolls created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-y border-border">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Lot Batch #</th>
                  <th className="px-3 py-2.5 font-semibold">Production Job</th>
                  <th className="px-3 py-2.5 font-semibold">Product & Size</th>
                  <th className="px-3 py-2.5 font-semibold">Roll Count</th>
                  <th className="px-3 py-2.5 font-semibold">Total Length</th>
                  <th className="px-3 py-2.5 font-semibold">Warehouse</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {finishedRolls.map((fr: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/20">
                    <td className="px-3 py-3 font-mono font-bold text-foreground">{fr.lotNumber}</td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">{fr.batchNumber}</td>
                    <td className="px-3 py-3 font-semibold text-foreground">{fr.product} ({fr.size})</td>
                    <td className="px-3 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {fr.rollCount} Rolls
                    </td>
                    <td className="px-3 py-3 font-mono">{fr.totalLength} m</td>
                    <td className="px-3 py-3 text-muted-foreground">{fr.warehouse}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[11px]">
                        {fr.stockStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">{formatDate(fr.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {selectedBatchForRolling && (
        <RollingEntryModal
          isOpen={Boolean(selectedBatchForRolling)}
          onClose={() => setSelectedBatchForRolling(null)}
          batch={selectedBatchForRolling}
        />
      )}
    </div>
  );
}
