'use client';

import React from 'react';
import { GamjeeProductionBatch } from '@/types/gamjee-production.types';
import {
  PackageCheck,
  Pin,
  Layers,
  Scissors,
  Sparkles,
  Scroll,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface ProductionTimelineProps {
  batch: GamjeeProductionBatch;
}

export function GamjeeProductionTimeline({ batch }: ProductionTimelineProps) {
  const fabricInput = batch.materialInputs?.find((m) => m.materialType === 'BLEACHED_FABRIC');
  const cottonInput = batch.materialInputs?.find((m) => m.materialType === 'COTTON_ROLL');

  const operations = batch.operations || [];
  const prepOp = operations.find((o) =>
    o.operationType?.code === 'OP-FABPREP' ||
    o.operationType?.code === 'OP-CUT' ||
    o.operationType?.code === 'OP-PIN' ||
    o.operationType?.code === 'OP-FOLD' ||
    o.operationType?.name?.toLowerCase().includes('cut') ||
    o.operationType?.name?.toLowerCase().includes('prep')
  );

  const rollingEntry = batch.rollingEntries?.[0];
  const finishedRoll = batch.finishedRolls?.[0];

  const stages = [
    {
      id: 'materials_issued',
      name: '1. Materials Issued',
      icon: PackageCheck,
      isCompleted: Boolean(fabricInput && cottonInput),
      isCurrent: batch.status === 'MATERIALS_SELECTED' && !prepOp,
      date: fabricInput?.issuedDate || batch.productionDate,
      primaryText: fabricInput && cottonInput
        ? `${Number(fabricInput.quantityIssued)} ${fabricInput.uom} + ${Number(cottonInput.quantityIssued)} ${cottonInput.uom}`
        : 'Pending Materials Issue',
      secondaryText: fabricInput && cottonInput
        ? `Fabric: ${fabricInput.product?.name} | Cotton: ${cottonInput.product?.name}`
        : 'Bleached fabric & cotton roll allocated',
      badge: fabricInput && cottonInput ? 'Allocated' : 'Pending',
    },
    {
      id: 'fabric_prep',
      name: '2. Fabric Preparation',
      icon: Scissors,
      isCompleted: Boolean(prepOp),
      isCurrent:
        (batch.status === 'MATERIALS_SELECTED' ||
          batch.status === 'PINNING' ||
          batch.status === 'FOLDING' ||
          batch.status === 'CUTTING') &&
        !prepOp,
      date: prepOp?.operationDate,
      primaryText: prepOp
        ? `Prepared: ${Number(prepOp.outputQuantity)} Pieces`
        : 'Awaiting Fabric Prep',
      secondaryText: prepOp
        ? `Output: ${Number(prepOp.outputQuantity)} pieces (${batch.pinningSizeMeters || 3}m / ${batch.foldingCutsCount || 3} cuts)`
        : `Pins, folds & cuts to ${batch.productionQuantity || 'target'} pieces`,
      badge: prepOp ? 'Prepared' : undefined,
    },
    {
      id: 'rolling',
      name: '3. Rolling',
      icon: Scroll,
      isCompleted: Boolean(rollingEntry),
      isCurrent:
        (batch.status === 'READY_FOR_ROLLING' ||
          batch.status === 'COTTON_PREPARATION' ||
          batch.status === 'ROLLING' ||
          (Boolean(prepOp) && !rollingEntry)) &&
        batch.status !== 'COMPLETED',
      date: rollingEntry?.rollingDate,
      primaryText: rollingEntry
        ? `${rollingEntry.finishedRollQuantity} Rolls Produced`
        : 'Ready for Rolling',
      secondaryText: rollingEntry
        ? `Fabric: ${rollingEntry.fabricInputQuantity}m | Cotton: ${rollingEntry.cottonInputQuantity}kg`
        : 'Combine prepared fabric pieces + cotton roll',
      badge: rollingEntry ? `${rollingEntry.finishedRollQuantity} Rolls` : undefined,
    },
    {
      id: 'completed',
      name: '4. Finished Stock',
      icon: CheckCircle2,
      isCompleted: batch.status === 'COMPLETED' || Boolean(finishedRoll),
      isCurrent: batch.status === 'COMPLETED',
      date: finishedRoll?.createdAt || batch.completionDate,
      primaryText: finishedRoll
        ? `${finishedRoll.rollCount} Rolls in Stock`
        : batch.status === 'COMPLETED'
        ? `${batch.productionQuantity || 0} Rolls in Stock`
        : 'Pending Completion',
      secondaryText: finishedRoll?.warehouse?.name || 'Finished Goods Section',
      badge: batch.status === 'COMPLETED' ? 'In Stock' : undefined,
    },
  ];

  return (
    <div className="w-full bg-card border border-border rounded-xl p-5 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Gamjee Roll Production Pipeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time material transformation from raw bleached fabric and cotton to finished goods
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-medium text-muted-foreground">
            Stage {stages.findIndex((s) => s.isCurrent) + 1 || (batch.status === 'COMPLETED' ? 4 : 1)} of {stages.length}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="hidden lg:grid grid-cols-4 gap-3 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = stage.isCompleted;
            const isCurr = stage.isCurrent;

            return (
              <div
                key={stage.id}
                className={`relative flex flex-col p-3 rounded-lg border transition-all ${
                  isCurr
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20'
                    : isDone
                    ? 'bg-secondary/40 border-border/80'
                    : 'bg-muted/20 border-border/40 opacity-60'
                }`}
              >
                {/* Header with Step & Icon */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurr
                        ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  {stage.badge && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate max-w-[80px]">
                      {stage.badge}
                    </span>
                  )}
                </div>

                <div className="font-semibold text-xs text-foreground truncate mb-1" title={stage.name}>
                  {stage.name}
                </div>

                <div className="text-xs font-bold text-foreground truncate">{stage.primaryText}</div>

                <div className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-tight" title={stage.secondaryText}>
                  {stage.secondaryText}
                </div>

                {stage.date && (
                  <div className="mt-2 pt-2 border-t border-border/60 text-[10px] font-mono text-muted-foreground truncate">
                    {formatDate(stage.date)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet vertical view */}
        <div className="lg:hidden space-y-3">
          {stages.map((stage, idx) => {
            const isDone = stage.isCompleted;
            const isCurr = stage.isCurrent;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  isCurr
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                    : isDone
                    ? 'bg-secondary/40 border-border'
                    : 'bg-muted/20 border-border/40 opacity-70'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurr
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">{stage.name}</h4>
                    {stage.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {stage.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{stage.primaryText}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stage.secondaryText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
