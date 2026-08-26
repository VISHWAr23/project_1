'use client';

import React from 'react';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import {
  PackageCheck,
  Truck,
  Sparkles,
  Layers,
  Box,
  CheckCircle2,
} from 'lucide-react';
import { formatDate, formatShortDate } from '@/lib/date-utils';

interface ProductionTimelineProps {
  batch: GauzeProductionBatch;
}

export function ProductionTimeline({ batch }: ProductionTimelineProps) {
  const rawMaterial = batch.rawMaterials?.[0];
  const bleachingJob = batch.bleachingJobs?.[0];
  const bleachingReceipt = batch.bleachingReceipts?.[0];
  const operations = batch.operations || [];
  const packingEntry = batch.packingEntries?.[0];

  const stages = [
    {
      id: 'raw_material',
      name: '1. Raw Material Receipt',
      icon: PackageCheck,
      isCompleted: Boolean(rawMaterial || batch.inputQuantity > 0),
      isCurrent: batch.status === 'RAW_MATERIAL_RECEIVED' || batch.status === 'READY_FOR_BLEACHING',
      date: rawMaterial?.receivedDate || batch.productionStartDate,
      refNumber: rawMaterial?.rollOrThansNumber ? `Lot: ${rawMaterial.rollOrThansNumber}` : batch.batchNumber,
      primaryText: `${Number(batch.inputQuantity).toLocaleString()} ${batch.inputUom}`,
      secondaryText: batch.supplier ? `Supplier: ${batch.supplier.name}` : 'Direct Stock Entry',
      badge: batch.gauzeType?.name || 'Raw Gauze',
      details: rawMaterial?.supplierReference ? `Invoice/Ref: ${rawMaterial.supplierReference}` : undefined,
    },
    {
      id: 'bleaching_job',
      name: '2. Sent to Bleaching',
      icon: Truck,
      isCompleted: Boolean(bleachingJob),
      isCurrent: batch.status === 'SENT_TO_BLEACHING',
      date: bleachingJob?.sentDate,
      refNumber: bleachingJob?.jobNumber,
      primaryText: bleachingJob ? `${Number(bleachingJob.quantitySent).toLocaleString()} ${bleachingJob.uom}` : 'Not Dispatched',
      secondaryText: bleachingJob ? `Vendor: ${bleachingJob.vendor.companyName}` : 'Pending external job work',
      badge: bleachingJob?.bleachingType.name,
      details: bleachingJob?.expectedReturnDate
        ? `Exp. Return: ${formatDate(bleachingJob.expectedReturnDate)}`
        : undefined,
    },
    {
      id: 'bleaching_receipt',
      name: '3. Bleaching Receipt',
      icon: Sparkles,
      isCompleted: Boolean(bleachingReceipt),
      isCurrent: batch.status === 'BLEACHING_RECEIVED',
      date: bleachingReceipt?.receivedDate,
      refNumber: bleachingReceipt?.receiptNumber,
      primaryText: bleachingReceipt ? `${Number(bleachingReceipt.quantityReceived).toLocaleString()} ${bleachingReceipt.uom}` : 'Pending Return',
      secondaryText: bleachingReceipt
        ? `Wastage: ${Number(bleachingReceipt.wastageQuantity)} ${bleachingReceipt.uom} | Rejection: ${Number(bleachingReceipt.rejectedQuantity)} ${bleachingReceipt.uom}`
        : 'Awaiting vendor delivery',
      badge: bleachingReceipt?.qualityStatus || undefined,
      hasLoss: Boolean(bleachingReceipt && (Number(bleachingReceipt.wastageQuantity) > 0 || Number(bleachingReceipt.rejectedQuantity) > 0)),
    },
    {
      id: 'processing',
      name: '4. Internal Processing',
      icon: Layers,
      isCompleted: operations.length > 0,
      isCurrent: batch.status === 'IN_PROCESSING' || batch.status === 'READY_FOR_PACKING',
      date: operations.length > 0 ? operations[operations.length - 1]?.operationDate : undefined,
      refNumber: operations.length > 0 ? `${operations.length} Operation(s)` : undefined,
      primaryText:
        operations.length > 0
          ? `${Number(operations[operations.length - 1]?.outputQuantity).toLocaleString()} ${operations[0]?.uom}`
          : 'Pending Processing',
      secondaryText:
        operations.length > 0
          ? operations.map((o) => o.operationType.name).join(' → ')
          : 'Cutting, folding, inspection',
      badge: operations.length > 0 ? 'Processed WIP' : undefined,
    },
    {
      id: 'packing',
      name: '5. Packing',
      icon: Box,
      isCompleted: Boolean(packingEntry),
      isCurrent: batch.status === 'PACKED',
      date: packingEntry?.packingDate,
      refNumber: packingEntry?.packingNumber,
      primaryText: packingEntry
        ? `${packingEntry.numberOfPacks} Packs (${packingEntry.piecesPerPack} pcs/pack)`
        : 'Pending Packing',
      secondaryText: packingEntry ? `Total: ${Number(packingEntry.totalPieces).toLocaleString()} Pieces` : 'Awaiting packaging',
      badge: packingEntry?.sizeDescription || (packingEntry?.ply ? `${packingEntry.ply}-Ply` : undefined),
    },
    {
      id: 'finished_goods',
      name: '6. Finished Goods Stock',
      icon: CheckCircle2,
      isCompleted: batch.status === 'COMPLETED' || Boolean(packingEntry),
      isCurrent: batch.status === 'COMPLETED',
      date: batch.completionDate || packingEntry?.packingDate,
      refNumber: packingEntry?.product.sku,
      primaryText: packingEntry ? `${Number(packingEntry.totalPieces).toLocaleString()} Pcs in Stock` : 'Pending Completion',
      secondaryText: packingEntry?.product.name || batch.product.name,
      badge: batch.status === 'COMPLETED' ? 'Stock Added' : 'Pending',
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop Stepper Bar */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-3 mb-6">
        {stages.map((stage) => {
          const Icon = stage.icon;
          let stateStyle = 'bg-card border-border text-muted-foreground';
          let iconStyle = 'bg-secondary text-muted-foreground';

          if (stage.isCompleted) {
            stateStyle = 'bg-blue-500/5 border-blue-500/30 text-foreground shadow-xs';
            iconStyle = 'bg-blue-500 text-white';
          } else if (stage.isCurrent) {
            stateStyle = 'bg-amber-500/10 border-amber-500/40 text-foreground ring-2 ring-amber-500/20';
            iconStyle = 'bg-amber-500 text-white animate-pulse';
          }

          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${stateStyle}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-md ${iconStyle}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {stage.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/80 text-foreground font-semibold truncate max-w-[90px]">
                    {stage.badge}
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold leading-tight line-clamp-1">{stage.name}</p>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-1 truncate">
                  {stage.primaryText}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{stage.secondaryText}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span className="truncate">{stage.refNumber || '—'}</span>
                <span>{stage.date ? formatShortDate(stage.date) : '—'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile/Vertical Timeline View */}
      <div className="lg:hidden space-y-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isLast = idx === stages.length - 1;

          let iconBg = 'bg-secondary text-muted-foreground';
          if (stage.isCompleted) iconBg = 'bg-blue-500 text-white';
          else if (stage.isCurrent) iconBg = 'bg-amber-500 text-white animate-pulse';

          return (
            <div key={stage.id} className="relative flex gap-3 pb-3">
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border -ml-px" />
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-card border border-border p-3 rounded-lg min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">{stage.name}</span>
                  {stage.date && (
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {formatDate(stage.date)}
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {stage.primaryText}
                </p>
                <p className="text-[11px] text-muted-foreground">{stage.secondaryText}</p>
                {stage.refNumber && (
                  <span className="inline-block mt-1 text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                    {stage.refNumber}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
