'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Truck,
  CheckCircle2,
  Clock,
  Building2,
  Package,
  FileText,
  ArrowRight,
  Scale,
  AlertTriangle,
  QrCode,
  Layers,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { JobWorkOrder } from '@/types/job-work.types';
import { SDLC_STAGES, getStageIndex } from './job-work-sdlc-card';
import { JobWorkStatusBadge } from './job-work-status-badge';
import Link from 'next/link';

interface JobWorkWorkflowModalProps {
  order: JobWorkOrder | null;
  onClose: () => void;
}

export function JobWorkWorkflowModal({ order, onClose }: JobWorkWorkflowModalProps) {
  if (!order) return null;

  const currentStageIndex = getStageIndex(order.status);
  const currentStage = SDLC_STAGES[currentStageIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border/80 rounded-2xl max-w-3xl w-full p-4 sm:p-6 space-y-6 shadow-2xl my-auto text-foreground overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="bg-[#2563EB]/10 p-2 rounded-lg text-[#2563EB]">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-mono text-foreground flex items-center gap-2">
                    {order.jobWorkNumber}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono">
                    Subcontractor SDLC Lifecycle & Reconciliation Register
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <JobWorkStatusBadge status={order.status} />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* SDLC Interactive Pipeline Stepper */}
          <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border/60">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Work Flow SDLC Status Pipeline:</span>
              <span className="font-bold text-[#2563EB] flex items-center gap-1">
                Stage {currentStageIndex + 1} of 5: {currentStage.label}
              </span>
            </div>

            {/* Stepper Graphic */}
            <div className="relative pt-2 pb-2">
              <div className="grid grid-cols-5 gap-2 relative z-10">
                {SDLC_STAGES.map((stage, idx) => {
                  const isPassed = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.key} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                          isPassed
                            ? 'bg-[#2563EB] text-[#0F1117]'
                            : isCurrent
                            ? 'bg-[#2563EB] text-[#0F1117] ring-4 ring-[#2563EB]/30 animate-pulse'
                            : 'bg-secondary text-muted-foreground border border-border/80'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="h-4 w-4" /> : stage.stepNumber}
                      </div>

                      <div className="space-y-0.5">
                        <p
                          className={`text-[11px] font-mono font-bold leading-tight ${
                            isCurrent
                              ? 'text-[#2563EB]'
                              : isPassed
                              ? 'text-foreground'
                              : 'text-muted-foreground/70'
                          }`}
                        >
                          {stage.shortLabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current State Description Box */}
            <div className="p-3 bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-lg flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Current Workflow Action Needed:
                </span>
                <p className="font-bold text-foreground">{currentStage.description}</p>
              </div>

              {/* 1-Tap Action Button */}
              {order.status === 'CREATED' && (
                <Link
                  href={`/job-work/${order.id}/issue`}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <span>Issue Materials</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}

              {(order.status === 'MATERIALS_ISSUED' ||
                order.status === 'IN_PROGRESS' ||
                order.status === 'PARTIAL_RETURN') && (
                <Link
                  href={`/job-work/${order.id}/return`}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <span>Receive Bleached Return</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}

              {(order.status === 'COMPLETED' || order.status === 'CLOSED') && (
                <Link
                  href={`/job-work/${order.id}/challan`}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Printer className="h-4 w-4 text-[#2563EB]" />
                  <span>Print Final Report</span>
                </Link>
              )}
            </div>
          </div>

          {/* Key Job Work Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-secondary/30 rounded-xl border border-border/60">
              <span className="text-[10px] text-muted-foreground block">Subcontractor Vendor</span>
              <p className="font-bold text-foreground flex items-center gap-1.5 mt-1">
                <Building2 className="h-4 w-4 text-amber-400" />
                <span>{order.jobWorkCompany?.companyName || 'N/A'}</span>
              </p>
            </div>

            <div className="p-3 bg-secondary/30 rounded-xl border border-border/60">
              <span className="text-[10px] text-muted-foreground block">Delivery Challan No</span>
              <p className="font-bold text-foreground flex items-center gap-1.5 mt-1">
                <FileText className="h-4 w-4 text-[#2563EB]" />
                <span>{order.challanNumber || 'Pending Issue'}</span>
              </p>
            </div>

            <div className="p-3 bg-secondary/30 rounded-xl border border-border/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-muted-foreground block">Expected Return Date</span>
              <p className="font-bold text-foreground flex items-center gap-1.5 mt-1">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>{new Date(order.expectedReturnDate).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {/* Weight & Reconciliation Ledger */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Weight & Material Balance Summary
            </h4>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
              <div className="p-2.5 bg-secondary/40 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Total Issued</span>
                <span className="font-bold text-foreground text-sm">
                  {Number(order.totalIssuedWeight).toFixed(1)} Kg
                </span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                <span className="text-[10px] opacity-80 block">Returned</span>
                <span className="font-bold text-sm">
                  {Number(order.totalReturnedWeight).toFixed(1)} Kg
                </span>
              </div>
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                <span className="text-[10px] opacity-80 block">Wastage / Scrap</span>
                <span className="font-bold text-sm">
                  {Number(order.totalWastageWeight).toFixed(1)} Kg
                </span>
              </div>
              <div className="p-2.5 bg-secondary/40 rounded-lg border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Pending Balance</span>
                <span
                  className={`font-bold text-sm ${
                    Number(order.pendingWeight) > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {Number(order.pendingWeight).toFixed(1)} Kg
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/80">
            <Link
              href={`/job-work/${order.id}`}
              className="text-xs font-mono text-muted-foreground hover:text-[#2563EB] underline transition-colors"
            >
              View Full Itemized Audit History →
            </Link>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground font-mono text-xs rounded-lg transition-colors"
            >
              Close Window
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
