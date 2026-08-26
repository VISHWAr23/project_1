'use client';

import React, { useState } from 'react';
import { GauzeTraceabilityData } from '@/types/gauze-production.types';
import { Card } from '@/components/ui/card';
import {
  ArrowRight,
  ArrowDown,
  Building2,
  Package,
  Layers,
  Sparkles,
  Scissors,
  Box,
  CheckCircle2,
  Clock,
  RotateCcw,
  ArrowRightLeft,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface TraceabilityViewProps {
  data: GauzeTraceabilityData;
}

export function TraceabilityView({ data }: TraceabilityViewProps) {
  const [direction, setDirection] = useState<'forward' | 'reverse'>('forward');
  const { forwardTraceability, reverseTraceability } = data;

  return (
    <div className="space-y-4">
      {/* Direction Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-secondary/30 rounded-lg border border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Complete Batch Genealogy & Traceability
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit-grade forward and reverse traceability chain across all subcontracted and in-house transformations.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-background border border-border p-0.5 rounded-lg">
          <button
            onClick={() => setDirection('forward')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              direction === 'forward'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Forward Traceability (Raw → Finished)
          </button>
          <button
            onClick={() => setDirection('reverse')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              direction === 'reverse'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Reverse Traceability (Finished → Raw)
          </button>
        </div>
      </div>

      {direction === 'forward' ? (
        /* FORWARD TRACEABILITY TREE */
        <div className="space-y-4">
          {/* Node 1: Origin Supplier */}
          <Card className="p-4 border-l-4 border-l-blue-500 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                    Step 1: Raw Material Supplier
                  </span>
                  <h4 className="text-sm font-bold text-foreground">
                    {forwardTraceability.supplier?.name || 'In-House Material Warehouse'}
                  </h4>
                  {forwardTraceability.supplier?.code && (
                    <span className="text-xs font-mono text-muted-foreground">
                      Code: {forwardTraceability.supplier.code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Node 2: Raw Gauze Material & Rolls */}
          <Card className="p-4 border-l-4 border-l-indigo-500 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                  Step 2: Raw Gauze Intake & Batch Creation
                </span>
                <h4 className="text-sm font-bold text-foreground">{forwardTraceability.rawMaterial.name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                  <span className="font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                    SKU: {forwardTraceability.rawMaterial.sku}
                  </span>
                  <span className="font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded">
                    Batch: {forwardTraceability.batchNumber}
                  </span>
                  <span className="font-mono text-foreground font-semibold">
                    Input: {forwardTraceability.rawMaterial.inputQuantity} {forwardTraceability.rawMaterial.inputUom}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Node 3: External Bleaching Jobs & Returns */}
          <Card className="p-4 border-l-4 border-l-amber-500 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-amber-600 dark:text-amber-400">
                  Step 3: External Bleaching / Job Work
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {forwardTraceability.bleachingJobs.length > 0
                    ? `${forwardTraceability.bleachingJobs.length} Bleaching Subcontractor Job(s)`
                    : 'No Bleaching Dispatched'}
                </h4>
              </div>
            </div>

            {forwardTraceability.bleachingJobs.length > 0 && (
              <div className="space-y-2 pl-12 border-l border-amber-500/20 ml-4">
                {forwardTraceability.bleachingJobs.map((bj, i) => (
                  <div key={i} className="p-2.5 bg-secondary/30 rounded-md border border-border text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{bj.vendor}</span>
                      <span className="font-mono text-muted-foreground">{bj.jobNumber}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      Process: {bj.bleachingType} | Sent: {bj.quantitySent} m (
                      {formatDate(bj.sentDate)})
                    </p>
                    {bj.receipts.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50 text-[11px] space-y-1">
                        {bj.receipts.map((br, rIdx) => (
                          <div key={rIdx} className="flex flex-wrap items-center justify-between gap-1 text-teal-600 dark:text-teal-400">
                            <span>Received: {br.quantityReceived} m ({br.receiptNumber})</span>

                            <span className="text-muted-foreground">
                              Wastage: {br.wastage} m | Rejected: {br.rejected} m | QC: {br.quality || 'Passed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Node 4: Internal Processing Operations */}
          <Card className="p-4 border-l-4 border-l-teal-500 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-teal-600 dark:text-teal-400">
                  Step 4: Internal Converting Operations
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {forwardTraceability.processingOperations.length > 0
                    ? `${forwardTraceability.processingOperations.length} Operation Step(s)`
                    : 'Awaiting Internal Processing'}
                </h4>
              </div>
            </div>

            {forwardTraceability.processingOperations.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-12">
                {forwardTraceability.processingOperations.map((op, i) => (
                  <div key={i} className="p-2.5 bg-secondary/30 rounded-md border border-border text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{op.operationType}</span>
                      <span className="font-mono text-muted-foreground text-[11px]">{op.operationNumber}</span>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      Input: {op.input} → Output: <strong className="text-foreground">{op.output}</strong> | Wastage: {op.wastage}
                    </p>
                    {op.employee && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Operator: {op.employee}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-center -my-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Node 5: Finished Goods Packing */}
          <Card className="p-4 border-l-4 border-l-emerald-500 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                  Step 5: Finished Goods Packing & Warehouse
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {forwardTraceability.packingEntries.length > 0
                    ? `${forwardTraceability.packingEntries.length} Packing Lot(s) Stored`
                    : 'Awaiting Final Packing'}
                </h4>
              </div>
            </div>

            {forwardTraceability.packingEntries.length > 0 && (
              <div className="space-y-2 pl-12">
                {forwardTraceability.packingEntries.map((pk, i) => (
                  <div key={i} className="p-3 bg-emerald-500/5 rounded-md border border-emerald-500/20 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{pk.product}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {pk.packingNumber}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-muted-foreground">
                      <span>Total: <strong className="text-foreground">{pk.totalPieces.toLocaleString()} pieces</strong></span>
                      <span>Packs: {pk.packs} ({pk.piecesPerPack} pcs/pack)</span>
                      {pk.size && <span>Size: {pk.size}</span>}
                      {pk.ply && <span>Ply: {pk.ply}</span>}
                      <span>Date: {formatDate(pk.packingDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* REVERSE TRACEABILITY TREE */
        <div className="space-y-4">
          {reverseTraceability.finishedProducts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              No finished packing records have been generated yet for this batch. Complete packing to view full reverse traceability.
            </Card>
          ) : (
            reverseTraceability.finishedProducts.map((fg, idx) => (
              <Card key={idx} className="p-5 bg-card border border-border space-y-4">
                {/* 1. Finished Product Header */}
                <div className="flex items-start justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Box className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
                        Target Finished Goods Unit
                      </span>
                      <h4 className="text-base font-bold text-foreground">{fg.product}</h4>
                      <p className="text-xs font-mono text-muted-foreground">
                        Packing Ref: {fg.packingNumber} | Output: {fg.totalPieces.toLocaleString()} pieces ({fg.packs} packs)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-secondary px-2.5 py-1 rounded text-muted-foreground">
                    {formatDate(fg.packingDate)}
                  </span>
                </div>

                {/* 2. Reverse Flow Breakdown */}
                <div className="space-y-3 pl-4 border-l-2 border-dashed border-border ml-2 text-xs">
                  {/* Step A: Processing */}
                  <div className="relative pl-4">
                    <span className="font-bold text-foreground block">Derived From Processing Operations:</span>
                    <p className="text-muted-foreground mt-0.5">
                      {fg.derivedFromOperations.length > 0 ? fg.derivedFromOperations.join(', ') : 'Standard cutting and folding'}
                    </p>
                  </div>

                  {/* Step B: Bleaching */}
                  <div className="relative pl-4">
                    <span className="font-bold text-foreground block">Derived From External Bleaching Job:</span>
                    <p className="text-muted-foreground mt-0.5">
                      {fg.derivedFromBleaching.length > 0 ? fg.derivedFromBleaching.join(', ') : 'Direct warehouse stock'}
                    </p>
                  </div>

                  {/* Step C: Production Batch */}
                  <div className="relative pl-4">
                    <span className="font-bold text-foreground block">Derived From Production Batch:</span>
                    <p className="text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5">{fg.originRawMaterial}</p>
                  </div>

                  {/* Step D: Origin Supplier */}
                  <div className="relative pl-4">
                    <span className="font-bold text-foreground block">Origin Supplier / Mill:</span>
                    <p className="text-foreground font-semibold mt-0.5">{fg.originSupplier}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
