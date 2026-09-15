'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useGamjeeDashboard,
  useGamjeeBatches,
} from '@/hooks/useGamjeeProduction';
import { GamjeeBatchStatusBadge } from '@/components/gamjee-production/batch-status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Package,
  Layers,
  Scissors,
  Scroll,
  CheckCircle2,
  AlertCircle,
  FileBarChart,
  ArrowRight,
  Sparkles,
  Settings2,
  TrendingUp,
  Boxes,
  ArrowLeft,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function GamjeeProductionDashboardPage() {
  const { data: dashboardData, isLoading: loadingStats } = useGamjeeDashboard();
  const { data: batchesData, isLoading: loadingBatches } = useGamjeeBatches({ limit: 10 });

  const kpis = dashboardData?.kpis;
  const batches = batchesData?.items || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Back to Operations Hub">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Gamjee Roll Production
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Active Module
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/job-work">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              Operations Hub
            </Button>
          </Link>
          <Link href="/gamjee-production/masters">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Settings2 className="h-4 w-4" />
              <span>Masters</span>
            </Button>
          </Link>
          <Link href="/gamjee-production/reports">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <FileBarChart className="h-4 w-4" />
              <span>Reports</span>
            </Button>
          </Link>
          <Link href="/gamjee-production/batches/new">
            <Button size="sm" className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <Plus className="h-4 w-4" />
              <span>New Batch</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loadingStats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader className="h-24 w-full" />
          <SkeletonLoader className="h-24 w-full" />
          <SkeletonLoader className="h-24 w-full" />
          <SkeletonLoader className="h-24 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active Production */}
          <Card className="p-4 bg-card border-border hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active WIP Batches</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {kpis?.activeBatches || 0}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / {kpis?.totalBatches || 0} Total
              </span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>{kpis?.fabricProcessing || 0} in Fabric Processing</span>
            </div>
          </Card>

          {/* Card 2: Rolling In Progress */}
          <Card className="p-4 bg-card border-border hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Rolling Station</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Scroll className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {kpis?.rollingBatches || 0}
              </span>
              <span className="text-xs text-muted-foreground">Rolling Now</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              <span>{kpis?.readyForRolling || 0} Ready for Rolling</span>
            </div>
          </Card>

          {/* Card 3: Finished Output */}
          <Card className="p-4 bg-card border-border hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Finished Rolls in Stock</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {kpis?.totalFinishedRolls?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-muted-foreground">Rolls</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-mono">
              Total: {kpis?.totalFinishedMeters?.toLocaleString() || 0} Meters
            </div>
          </Card>

          {/* Card 4: Material Consumption */}
          <Card className="p-4 bg-card border-border hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Material Consumption</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabric:</span>
                <span className="font-bold text-foreground">{kpis?.totalFabricUsed?.toLocaleString() || 0} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cotton:</span>
                <span className="font-bold text-foreground">{kpis?.totalCottonUsed?.toLocaleString() || 0} kg</span>
              </div>
            </div>
            <div className="mt-1 text-[11px] text-rose-500 font-mono flex justify-between">
              <span>Wastage:</span>
              <span>{kpis?.totalWastage?.toLocaleString() || 0} m</span>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Flow Bar */}
      <div className="p-4 bg-secondary/30 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
          <span className="text-muted-foreground font-semibold">Workflow Stations:</span>
          <Link href="/gamjee-production/materials" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Package className="h-3.5 w-3.5 text-blue-500" />
            <span>1. Material Issue</span>
          </Link>
          <span className="text-muted-foreground">→</span>
          <Link href="/gamjee-production/processing" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Scissors className="h-3.5 w-3.5 text-indigo-500" />
            <span>2. Pinning & Folding & Cutting</span>
          </Link>
          <span className="text-muted-foreground">→</span>
          <Link href="/gamjee-production/rolling" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Scroll className="h-3.5 w-3.5 text-purple-500" />
            <span>3. Combine & Rolling</span>
          </Link>
          <span className="text-muted-foreground">→</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>4. Finished Stock</span>
          </span>
        </div>

        <Link href="/gamjee-production/batches">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
            <span>View All Batches</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Active Production Batches Table */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Active Production Batches</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live factory floor batches currently in progress
            </p>
          </div>
          <Link href="/gamjee-production/batches">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              Batch Directory
            </Button>
          </Link>
        </div>

        {loadingBatches ? (
          <div className="space-y-3">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : batches.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-semibold text-foreground">No Gamjee Production Batches Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Get started by creating your first Gamjee Roll production batch from bleached fabric and cotton roll.
            </p>
            <Link href="/gamjee-production/batches/new">
              <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                <Plus className="h-4 w-4" />
                <span>Create First Batch</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-y border-border">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Batch Number</th>
                  <th className="px-3 py-2.5 font-semibold">Product & Size</th>
                  <th className="px-3 py-2.5 font-semibold">Stage</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">Current WIP Quantity</th>
                  <th className="px-3 py-2.5 font-semibold">Production Date</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-3 font-mono font-bold text-foreground">
                      <Link
                        href={`/gamjee-production/batches/${b.id}`}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {b.batchNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-foreground">{b.finishedProduct?.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {b.gamjeeSize?.name || 'Standard Size'}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-foreground">
                      <span className="px-2 py-0.5 rounded bg-secondary text-[11px]">
                        {b.currentStage}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <GamjeeBatchStatusBadge status={b.status} />
                    </td>
                    <td className="px-3 py-3 font-mono">
                      {b.status === 'COMPLETED' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {b.productionQuantity || 0} Rolls
                        </span>
                      ) : (
                        <span>
                          {Number(b.currentQuantity)} {b.currentUom || 'm'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground font-mono">
                      {formatDate(b.productionDate)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link href={`/gamjee-production/batches/${b.id}`}>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                          Open Details
                        </Button>
                      </Link>
                    </td>
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
