'use client';

import React from 'react';
import { GamjeeProductionStatus } from '@/types/gamjee-production.types';
import {
  FileEdit,
  PackageCheck,
  Scissors,
  Layers,
  Sparkles,
  Scroll,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
  Pin,
} from 'lucide-react';

interface BatchStatusBadgeProps {
  status: GamjeeProductionStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function GamjeeBatchStatusBadge({ status, size = 'sm', showIcon = true }: BatchStatusBadgeProps) {
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
      case 'MATERIALS_SELECTED':
        return {
          label: '1. Materials Issued',
          icon: PackageCheck,
          className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-medium',
        };
      case 'PINNING':
        return {
          label: '2. Fabric Pinning',
          icon: Pin,
          className: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 font-semibold',
        };
      case 'FOLDING':
        return {
          label: '3. Fabric Folding',
          icon: Layers,
          className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 font-semibold',
        };
      case 'CUTTING':
        return {
          label: '4. Fabric Cutting',
          icon: Scissors,
          className: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/40 font-semibold',
        };
      case 'COTTON_PREPARATION':
      case 'READY_FOR_ROLLING':
        return {
          label: '5. Ready for Rolling',
          icon: Sparkles,
          className: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40 font-semibold',
        };
      case 'ROLLING':
        return {
          label: '6. Rolling in Progress',
          icon: Scroll,
          className: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40 font-bold animate-pulse',
        };
      case 'COMPLETED':
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
          label: '✕ Cancelled',
          icon: XCircle,
          className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 font-medium',
        };
      default:
        return {
          label: s,
          icon: Clock,
          className: 'bg-secondary text-secondary-foreground border-border',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${
        sizeClasses[size]
      } ${config.className}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span className="truncate">{config.label}</span>
    </span>
  );
}
