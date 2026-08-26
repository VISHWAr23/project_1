'use client';

import React from 'react';
import { GauzeProductionStatus } from '@/types/gauze-production.types';
import {
  FileEdit,
  PackageCheck,
  Truck,
  Sparkles,
  Layers,
  Box,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface BatchStatusBadgeProps {
  status: GauzeProductionStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function BatchStatusBadge({ status, size = 'sm', showIcon = true }: BatchStatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4.5 w-4.5',
  };

  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'DRAFT':
        return {
          label: 'Draft',
          icon: FileEdit,
          className: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
        };
      case 'RAW_MATERIAL_RECEIVED':
        return {
          label: '1. Raw Material Inwarded',
          icon: PackageCheck,
          className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40 font-medium',
        };
      case 'READY_FOR_BLEACHING':
        return {
          label: 'Ready for Bleaching',
          icon: Clock,
          className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40 font-medium',
        };
      case 'SENT_TO_BLEACHING':
        return {
          label: '2. At Bleaching Mill',
          icon: Truck,
          className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 font-semibold',
        };
      case 'BLEACHING_RECEIVED':
        return {
          label: '3. Bleached & Ready',
          icon: Sparkles,
          className: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40 font-semibold',
        };
      case 'IN_PROCESSING':
        return {
          label: '4. Cutting & Folding',
          icon: Layers,
          className: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-semibold',
        };
      case 'READY_FOR_PACKING':
      case 'PROCESSING_COMPLETED':
        return {
          label: '5. Ready for Packing',
          icon: Box,
          className: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 font-semibold',
        };
      case 'PACKED':
        return {
          label: '6. Packed in Boxes',
          icon: Box,
          className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-semibold',
        };
      case 'COMPLETED':
      case 'FINISHED_GOODS_STOCK':
        return {
          label: '✔ Completed in Stock',
          icon: CheckCircle2,
          className: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold',
        };
      case 'ON_HOLD':
        return {
          label: '⏸ Paused / On Hold',
          icon: PauseCircle,
          className: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40 font-medium',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40',
        };
      default:
        return {
          label: s,
          icon: Clock,
          className: 'bg-secondary text-muted-foreground border-border',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${sizeClasses[size]} ${config.className}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
}
