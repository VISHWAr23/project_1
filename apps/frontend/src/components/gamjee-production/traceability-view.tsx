'use client';

import React, { useState } from 'react';
import { GamjeeTraceabilityData } from '@/types/gamjee-production.types';
import { Card } from '@/components/ui/card';
import {
  ArrowDown,
  Building2,
  Package,
  Layers,
  Sparkles,
  Scissors,
  Scroll,
  CheckCircle2,
  ArrowRightLeft,
  Pin,
  Warehouse,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface TraceabilityViewProps {
  data: GamjeeTraceabilityData;
}

export function GamjeeTraceabilityView({ data }: TraceabilityViewProps) {
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const { batchSummary, forwardTraceability } = data;
  const { rawMaterials, operations, rolling, finishedGoods } = forwardTraceability;

  return (
    <div className="space-y-4">
      {/* Direction Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-secondary/30 rounded-lg border border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Complete Gamjee Roll Genealogy & Traceability
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit-grade forward and reverse traceability chain linking Bleached Fabric and Cotton Roll to Finished Goods.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded-lg">
          <button
            onClick={() => setDirection('forward')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              direction === 'forward'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Forward (Raw → Finished)
          </button>
          <button
            onClick={() => setDirection('reverse')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              direction === 'reverse'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Reverse (Finished → Raw)
          </button>
        </div>
      </div>

      {direction === 'forward' ? (
        /* FORWARD TRACEABILITY TREE */
        <div className="space-y-4">
          {/* Step 1: Raw Materials Issued (Dual Inputs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500 bg-card">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                    Step 1A: Bleached Fabric Input
                  </span>
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {rawMaterials.bleachedFabric?.product || 'Bleached Fabric'}
                  </h4>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5 font-mono">
                    <p>SKU: {rawMaterials.bleachedFabric?.sku || 'N/A'}</p>
                    <p>Lot/Roll: {rawMaterials.bleachedFabric?.lotNumber || 'N/A'}</p>
                    <p className="font-semibold text-foreground">
                      Quantity Issued: {rawMaterials.bleachedFabric?.quantityIssued} {rawMaterials.bleachedFabric?.uom}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500 bg-card">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-600 dark:text-amber-400">
                    Step 1B: Cotton Roll Input
                  </span>
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {rawMaterials.cottonRoll?.product || 'Cotton Roll'}
                  </h4>
                  <div className="text-xs text-muted-foreground mt-1 space-y-0.5 font-mono">
                    <p>SKU: {rawMaterials.cottonRoll?.sku || 'N/A'}</p>
                    <p>Lot/Batch: {rawMaterials.cottonRoll?.lotNumber || 'N/A'}</p>
                    <p className="font-semibold text-foreground">
                      Quantity Issued: {rawMaterials.cottonRoll?.quantityIssued} {rawMaterials.cottonRoll?.uom}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Step 2: Fabric Processing (Pinning -> Folding -> Cutting) */}
          <Card className="p-4 border-l-4 border-l-indigo-500 bg-card">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                <Scissors className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                  Step 2: Fabric Processing Pipeline
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  Pinning → Folding → Cutting (Prepared Fabric)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {operations.map((op, idx) => (
                    <div key={idx} className="bg-secondary/40 border border-border p-2.5 rounded-lg text-xs">
                      <div className="font-bold text-foreground flex items-center justify-between">
                        <span>{op.operation}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">Step {op.sequence}</span>
                      </div>
                      <div className="mt-1 space-y-0.5 font-mono text-[11px] text-muted-foreground">
                        <p>Input: {op.input} m</p>
                        <p>Output: {op.output} m</p>
                        <p>Wastage: {op.wastage} m</p>
                        <p>Operator: {op.operator}</p>
                      </div>
                    </div>
                  ))}
                  {operations.length === 0 && (
                    <p className="text-xs text-muted-foreground col-span-3">No operations recorded yet</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Step 3: Rolling Operation */}
          <Card className="p-4 border-l-4 border-l-purple-500 bg-card">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                <Scroll className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-purple-600 dark:text-purple-400">
                  Step 3: Combine & Rolling Together
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  Fabric + Cotton Encasement into Finished Gamjee Rolls
                </h4>
                {rolling.map((rl, idx) => (
                  <div key={idx} className="mt-2 text-xs font-mono bg-secondary/30 p-2.5 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-2">
                    <p>Roll Entry: {rl.rollingNumber}</p>
                    <p>Fabric Consumed: {rl.fabricUsed} m</p>
                    <p>Cotton Consumed: {rl.cottonUsed} kg</p>
                    <p className="font-bold text-foreground">Rolls Made: {rl.rollsProduced} ({rl.rollLength}m each)</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Step 4: Finished Goods Stock */}
          <Card className="p-4 border-l-4 border-l-emerald-500 bg-card">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                  Step 4: Finished Goods Stock
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {batchSummary.productName} ({batchSummary.size})
                </h4>
                {finishedGoods.map((fg, idx) => (
                  <div key={idx} className="mt-2 text-xs font-mono bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2">
                    <p>Finished Batch: <strong>{fg.rollBatchNumber}</strong></p>
                    <p>Rolls in Stock: <strong>{fg.rollCount} Rolls</strong></p>
                    <p>Total Length: <strong>{fg.totalLength} m</strong></p>
                    <p>Storage: <strong>{fg.warehouse}</strong></p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* REVERSE TRACEABILITY TREE */
        <div className="space-y-4">
          <Card className="p-4 border-l-4 border-l-emerald-500 bg-card">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-600">
                  1. Finished Product Lot
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {batchSummary.productName} - Batch {batchSummary.batchNumber}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Size: {batchSummary.size} | Total Finished Rolls: {batchSummary.totalRolls}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          <Card className="p-4 border-l-4 border-l-purple-500 bg-card">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <Scroll className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-purple-600">
                  2. Converted From Rolling Operation
                </span>
                {rolling.map((rl, idx) => (
                  <p key={idx} className="text-xs font-mono text-foreground mt-1">
                    Entry {rl.rollingNumber} on {formatDate(rl.date)} by {rl.operator}
                  </p>
                ))}
              </div>
            </div>
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500 bg-card">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-600">
                3A. Source Bleached Fabric
              </span>
              <h4 className="text-xs font-bold text-foreground mt-1">
                {rawMaterials.bleachedFabric?.product || 'Bleached Fabric'}
              </h4>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Lot: {rawMaterials.bleachedFabric?.lotNumber || 'N/A'} ({rawMaterials.bleachedFabric?.quantityIssued} m)
              </p>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500 bg-card">
              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-600">
                3B. Source Cotton Roll
              </span>
              <h4 className="text-xs font-bold text-foreground mt-1">
                {rawMaterials.cottonRoll?.product || 'Cotton Roll'}
              </h4>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Lot: {rawMaterials.cottonRoll?.lotNumber || 'N/A'} ({rawMaterials.cottonRoll?.quantityIssued} kg)
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
