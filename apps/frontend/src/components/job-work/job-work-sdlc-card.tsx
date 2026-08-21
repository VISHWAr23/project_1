'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Building2,
  Package,
  Scale,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  Layers,
  Edit3,
  Trash2,
} from 'lucide-react';
import { JobWorkOrder, JobWorkStatus } from '@/types/job-work.types';
import { JobWorkStatusBadge } from './job-work-status-badge';

interface JobWorkSDLCCardProps {
  order: JobWorkOrder;
  onSelect: (order: JobWorkOrder) => void;
  onEdit?: (order: JobWorkOrder) => void;
  onDelete?: (order: JobWorkOrder) => void;
}

// SDLC Pipeline stages mapping
export const SDLC_STAGES: {
  key: JobWorkStatus;
  stepNumber: number;
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    key: 'CREATED',
    stepNumber: 1,
    label: 'Job Work Created',
    shortLabel: 'Created',
    description: 'Work order created & raw material identified',
  },
  {
    key: 'MATERIALS_ISSUED',
    stepNumber: 2,
    label: 'Material Issued',
    shortLabel: 'Issued',
    description: 'Grey fabric rolls dispatched to subcontractor',
  },
  {
    key: 'IN_PROGRESS',
    stepNumber: 3,
    label: 'Vendor Processing',
    shortLabel: 'Processing',
    description: 'Bleaching & scouring active at vendor unit',
  },
  {
    key: 'PARTIAL_RETURN',
    stepNumber: 4,
    label: 'Partial / Return Received',
    shortLabel: 'Return Recv',
    description: 'Bleached fabric rolls received back',
  },
  {
    key: 'COMPLETED',
    stepNumber: 5,
    label: 'Reconciled & Closed',
    shortLabel: 'Closed',
    description: 'All rolls & wastage fully accounted',
  },
];

export function getStageIndex(status: JobWorkStatus): number {
  switch (status) {
    case 'CREATED':
      return 0;
    case 'MATERIALS_ISSUED':
      return 1;
    case 'IN_PROGRESS':
      return 2;
    case 'PARTIAL_RETURN':
      return 3;
    case 'COMPLETED':
    case 'CLOSED':
      return 4;
    default:
      return 0;
  }
}

export function JobWorkSDLCCard({ order, onSelect, onEdit, onDelete }: JobWorkSDLCCardProps) {
  const currentStageIndex = getStageIndex(order.status);
  const currentStage = SDLC_STAGES[currentStageIndex];

  // Calculate weight progress percentage
  const totalIssued = Number(order.totalIssuedWeight) || 0;
  const totalReturned = Number(order.totalReturnedWeight) || 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-card hover:bg-card/90 border border-border/80 hover:border-[#2563EB]/50 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4 cursor-pointer relative group overflow-hidden"
      onClick={() => onSelect(order)}
    >
      {/* Top Accent Line for Current Stage */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          order.status === 'COMPLETED' || order.status === 'CLOSED'
            ? 'bg-emerald-500'
            : order.status === 'MATERIALS_ISSUED' || order.status === 'IN_PROGRESS'
            ? 'bg-[#2563EB]'
            : order.status === 'PARTIAL_RETURN'
            ? 'bg-amber-400'
            : 'bg-blue-500'
        }`}
      />

      {/* Header: Order Number & Challan */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-foreground group-hover:text-[#3ECF8E] transition-colors">
              {order.jobWorkNumber}
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
              Step {currentStageIndex + 1} of 5
            </span>
          </div>
          {order.challanNumber && (
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Challan: <span className="text-foreground">{order.challanNumber}</span>
            </p>
          )}
        </div>
        <JobWorkStatusBadge status={order.status} />
      </div>

      {/* Subcontractor Company & Material Details */}
      <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-secondary/40 rounded-lg p-2.5 border border-border/40">
        <div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
            Subcontractor Vendor
          </span>
          <p className="font-semibold text-foreground truncate flex items-center gap-1 mt-0.5">
            <Building2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{order.jobWorkCompany?.companyName || 'Vendor Unit'}</span>
          </p>
        </div>
        <div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
            Material Issued
          </span>
          <p className="font-semibold text-foreground truncate flex items-center gap-1 mt-0.5">
            <Package className="h-3.5 w-3.5 text-[#3ECF8E] shrink-0" />
            <span className="truncate">{order.rawMaterial?.name || 'Grey Fabric'}</span>
          </p>
        </div>
      </div>

      {/* SDLC Stage Stepper Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-medium">Pipeline Stage:</span>
          <span className="font-bold text-[#3ECF8E]">{currentStage.label}</span>
        </div>

        {/* 5-Segment Progress Line */}
        <div className="grid grid-cols-5 gap-1">
          {SDLC_STAGES.map((stage, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div
                key={stage.key}
                title={`Stage ${idx + 1}: ${stage.label}`}
                className={`h-2 rounded-full transition-all ${
                  isPassed
                    ? 'bg-[#3ECF8E]'
                    : isCurrent
                    ? 'bg-[#3ECF8E] animate-pulse ring-2 ring-[#3ECF8E]/40'
                    : 'bg-secondary'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Weight Summary Metrics */}
      <div className="flex items-center justify-between pt-1 text-xs font-mono border-t border-border/50">
        <div>
          <span className="text-[10px] text-muted-foreground block">Issued Weight</span>
          <span className="font-bold text-foreground">{totalIssued.toFixed(1)} Kg</span>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-muted-foreground block">Returned</span>
          <span className="font-bold text-emerald-400">{totalReturned.toFixed(1)} Kg</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block">Balance Pending</span>
          <span
            className={`font-bold ${
              Number(order.pendingWeight) > 0 ? 'text-amber-400' : 'text-muted-foreground'
            }`}
          >
            {Number(order.pendingWeight).toFixed(1)} Kg
          </span>
        </div>
      </div>

      {/* 1-Tap Footer Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-border/80">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" />
          {new Date(order.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1.5">
          {onEdit && order.status !== 'CLOSED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(order);
              }}
              title="Edit Order"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}

          {onDelete && order.status !== 'CLOSED' && Number(order.totalReturnedWeight) === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order);
              }}
              title="Delete or Cancel Order"
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(order);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold transition-colors"
          >
            <span>View Details</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
