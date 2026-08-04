import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Truck, RefreshCw, CheckCircle2, Lock, FilePlus, User } from 'lucide-react';
import { JobWorkOrder, JobWorkStatus } from '@/types/job-work.types';

interface JobWorkTimelineProps {
  order: JobWorkOrder;
}

const STEPS: { status: JobWorkStatus; label: string; desc: string; icon: React.ComponentType<any> }[] = [
  { status: 'CREATED', label: 'Order Created', desc: 'Job order raised', icon: FilePlus },
  { status: 'MATERIALS_ISSUED', label: 'Material Issued', desc: 'Rolls dispatched', icon: Truck },
  { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Processing at vendor', icon: Clock },
  { status: 'PARTIAL_RETURN', label: 'Partial Return', desc: 'Rolls returning', icon: RefreshCw },
  { status: 'COMPLETED', label: 'Completed', desc: 'All rolls received', icon: CheckCircle2 },
  { status: 'CLOSED', label: 'Order Closed', desc: 'Reconciled & locked', icon: Lock },
];

export function JobWorkTimeline({ order }: JobWorkTimelineProps) {
  const getStepIndex = (s: JobWorkStatus): number => {
    switch (s) {
      case 'CREATED': return 0;
      case 'MATERIALS_ISSUED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'PARTIAL_RETURN': return 3;
      case 'COMPLETED': return 4;
      case 'CLOSED': return 5;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(order.status);

  return (
    <div className="space-y-6">
      {/* Visual Step Progression */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Workflow Progression</h3>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {STEPS.map((step, idx) => {
            const isDone = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex-1 flex md:flex-col items-center gap-3 relative z-10 w-full md:w-auto">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110 shadow-lg'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {isDone && !isCurrent ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="text-left md:text-center">
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-primary font-bold' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit History Timeline Feed */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Status History & Audit Logs</h3>
        {order.statusHistory && order.statusHistory.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {order.statusHistory.map((history) => (
              <motion.div
                key={history.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative group"
              >
                <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background ring-4 ring-primary/10" />
                <div className="bg-background/50 border border-border/60 p-3.5 rounded-lg space-y-1 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Status changed to <span className="text-primary font-mono">{history.toStatus}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(history.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {history.notes && <p className="text-xs text-muted-foreground">{history.notes}</p>}
                  {history.performedByUser && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-1">
                      <User className="h-3 w-3" />
                      <span>{history.performedByUser.email}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No history records logged yet.</p>
        )}
      </div>
    </div>
  );
}
