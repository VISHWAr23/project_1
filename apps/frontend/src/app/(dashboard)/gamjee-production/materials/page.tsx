'use client';

import React from 'react';
import Link from 'next/link';
import { useGamjeeReports } from '@/hooks/useGamjeeProduction';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Sparkles, Layers, Download } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function GamjeeMaterialsPage() {
  const { data: consumptionData, isLoading } = useGamjeeReports('consumption');

  const items = consumptionData || [];

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
              Gamjee Raw Materials & Consumption
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Track Bleached Fabric and Cotton Roll allocations, consumption, and balances per production batch.
          </p>
        </div>

        <Link href="/gamjee-production/batches">
          <Button size="sm" variant="outline" className="h-9 text-xs">
            View Production Batches
          </Button>
        </Link>
      </div>

      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Material Issue & Consumption Ledger</h3>
          <span className="text-xs font-mono text-muted-foreground">{items.length} Entries Recorded</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No material consumption records found. Issue materials to a batch to see live data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-y border-border">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Batch Number</th>
                  <th className="px-3 py-2.5 font-semibold">Target Product</th>
                  <th className="px-3 py-2.5 font-semibold">Material Type</th>
                  <th className="px-3 py-2.5 font-semibold">Raw Material Item</th>
                  <th className="px-3 py-2.5 font-semibold">Quantity Issued</th>
                  <th className="px-3 py-2.5 font-semibold">Quantity Consumed</th>
                  <th className="px-3 py-2.5 font-semibold">Remaining</th>
                  <th className="px-3 py-2.5 font-semibold">Issued Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-3 font-mono font-bold text-foreground">
                      {item.batchNumber}
                    </td>
                    <td className="px-3 py-3 font-medium text-foreground">{item.finishedProduct}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.materialType === 'BLEACHED_FABRIC'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {item.materialType === 'BLEACHED_FABRIC' ? 'Bleached Fabric' : 'Cotton Roll'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-foreground">{item.rawMaterial}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-foreground">
                      {item.quantityIssued} {item.uom}
                    </td>
                    <td className="px-3 py-3 font-mono text-emerald-600 dark:text-emerald-400">
                      {item.quantityConsumed} {item.uom}
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">
                      {item.quantityRemaining} {item.uom}
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">{formatDate(item.issuedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
