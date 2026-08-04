'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowLeft,
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  FileText,
  Calendar,
  Share2,
  Printer,
  History,
  GitCommit,
  GitBranch,
} from 'lucide-react';
import {
  rollTrackingService,
  CottonRoll,
  RollStatusHistoryItem,
} from '@/services/roll-tracking.service';

export default function RollDetailPage({
  params,
}: {
  params: Promise<{ rollNumber: string }>;
}) {
  const resolvedParams = use(params);
  const rollNumber = decodeURIComponent(resolvedParams.rollNumber);

  const [roll, setRoll] = useState<CottonRoll | null>(null);
  const [ancestors, setAncestors] = useState<Partial<CottonRoll>[]>([]);
  const [children, setChildren] = useState<Partial<CottonRoll>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRollDetails() {
      setLoading(true);
      try {
        const genealogyRes = await rollTrackingService.getRollGenealogy(rollNumber);
        setRoll(genealogyRes.roll);
        setAncestors(genealogyRes.ancestors || []);
        setChildren(genealogyRes.children || []);
      } catch (err) {
        console.error('Failed to load roll genealogy:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRollDetails();
  }, [rollNumber]);

  if (loading) {
    return (
      <div className="p-12 text-center text-muted-foreground font-mono">
        <Layers className="h-6 w-6 animate-spin mx-auto mb-2 text-[#3ECF8E]" />
        Loading roll 360° profile and lineage tree...
      </div>
    );
  }

  if (!roll) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold font-mono">Cotton Roll Not Found</h2>
        <p className="text-xs text-muted-foreground font-mono">
          No roll matching identifier '{rollNumber}' exists in the ledger.
        </p>
        <Link
          href="/roll-tracking"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-xs font-mono rounded-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Roll Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/roll-tracking"
            className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#3ECF8E]/10 text-[#3ECF8E] text-[10px] font-mono font-bold rounded-sm border border-[#3ECF8E]/30">
                SERIALIZED ROLL
              </span>
              <h1 className="text-xl font-bold font-mono text-foreground">{roll.rollNumber}</h1>
            </div>
            <p className="text-xs text-muted-foreground font-mono">Barcode: {roll.barcode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-mono rounded-sm border border-border/80"
          >
            <Printer className="h-4 w-4" />
            Print QR Label
          </button>
        </div>
      </div>

      {/* Main Grid: Specifications & Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Core Specifications */}
        <div className="p-5 rounded-sm bg-card border border-border/80 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
            <QrCode className="h-4 w-4 text-[#3ECF8E]" />
            Roll Specifications
          </h3>

          <div className="space-y-2 text-xs font-mono divide-y divide-border/60">
            <div className="pt-2 flex justify-between">
              <span className="text-muted-foreground">Material Name:</span>
              <span className="font-bold text-foreground">{roll.materialName}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-muted-foreground">Batch Number:</span>
              <span className="font-bold text-[#3ECF8E]">{roll.batchNumber}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-muted-foreground">Width (Inches):</span>
              <span className="font-semibold text-foreground">{roll.widthInches}"</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-muted-foreground">Length (Meters):</span>
              <span className="font-semibold text-foreground">{roll.lengthMeters} m</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-muted-foreground">Net Weight (Kg):</span>
              <span className="font-bold text-foreground">{roll.weightKg} kg</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-muted-foreground">GSM Target:</span>
              <span className="font-semibold text-foreground">{roll.gsm || 'N/A'}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-muted-foreground">Processing Stage:</span>
              <span className="font-mono text-cyan-400 font-semibold">{roll.stage}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Current Location & Status */}
        <div className="p-5 rounded-sm bg-card border border-border/80 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-400" />
            Location & Subcontracting
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-secondary/50 rounded-sm border border-border/80 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Current Physical Location</span>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#3ECF8E]" />
                {roll.currentLocation}
              </p>
            </div>

            <div className="p-3 bg-secondary/50 rounded-sm border border-border/80 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Job Worker (Subcontractor)</span>
              <p className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {roll.jobWorkCompany?.companyName || 'In-House Warehouse'}
              </p>
            </div>

            <div className="p-3 bg-secondary/50 rounded-sm border border-border/80 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Current State Ledger Status</span>
              <p className="text-sm font-bold text-[#3ECF8E]">{roll.currentStatus}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Barcode / QR Label Preview */}
        <div className="p-5 rounded-sm bg-card border border-border/80 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-white rounded-sm text-black shadow-inner">
            <QrCode className="h-28 w-28" />
          </div>
          <div className="font-mono">
            <p className="font-bold text-sm text-foreground">{roll.rollNumber}</p>
            <p className="text-[10px] text-muted-foreground">{roll.barcode}</p>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            Created: {new Date(roll.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Genealogy Lineage Visualizer */}
      <div className="p-5 rounded-sm bg-card border border-border/80 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-[#3ECF8E]" />
          Roll Genealogy & Lineage Tree
        </h3>

        <div className="p-4 bg-secondary/30 rounded-sm border border-border/60 space-y-4 font-mono text-xs">
          {/* Parent Master Roll */}
          {ancestors.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase">Parent Master Roll Lineage</span>
              <div className="flex items-center gap-2 flex-wrap">
                {ancestors.map((ancestor, i) => (
                  <React.Fragment key={ancestor.id}>
                    <Link
                      href={`/roll-tracking/${encodeURIComponent(ancestor.rollNumber!)}`}
                      className="px-3 py-1.5 bg-card border border-border hover:border-[#3ECF8E] rounded-sm font-bold text-[#3ECF8E]"
                    >
                      {ancestor.rollNumber} ({ancestor.materialName})
                    </Link>
                    <span className="text-muted-foreground">➔</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-[11px]">
              This is a primary master roll (No parent roll ID).
            </p>
          )}

          {/* Current Roll Node */}
          <div className="p-3 bg-[#3ECF8E]/10 border border-[#3ECF8E]/40 rounded-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#3ECF8E] uppercase">Current Active Roll</span>
              <p className="font-bold text-foreground text-sm">{roll.rollNumber}</p>
              <p className="text-[11px] text-muted-foreground">{roll.materialName} ({roll.weightKg} kg)</p>
            </div>
            <span className="px-2.5 py-1 bg-[#3ECF8E] text-[#0F1117] font-bold rounded-sm text-[10px]">
              {roll.currentStatus}
            </span>
          </div>

          {/* Child Slit Rolls */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <span className="text-[10px] text-muted-foreground uppercase">
              Child Slit Rolls Converted ({children.length})
            </span>

            {children.length === 0 ? (
              <p className="text-muted-foreground italic text-[11px]">
                No child slit rolls generated yet from this master roll.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/roll-tracking/${encodeURIComponent(child.rollNumber!)}`}
                    className="p-2.5 bg-card border border-border hover:border-[#3ECF8E] rounded-sm block space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3ECF8E]">{child.rollNumber}</span>
                      <span className="text-[10px] text-muted-foreground">{child.currentStatus}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {child.widthInches}" × {child.lengthMeters}m ({child.weightKg} kg)
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Immutable Status History Ledger */}
      <div className="p-5 rounded-sm bg-card border border-border/80 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
          <History className="h-4 w-4 text-purple-400" />
          Immutable Roll Status History Ledger
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {roll.statusHistory && roll.statusHistory.length > 0 ? (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/80">
              {roll.statusHistory.map((history) => (
                <div key={history.id} className="relative space-y-1">
                  <div className="absolute -left-[23px] top-0.5 h-3 w-3 rounded-full bg-[#3ECF8E] border-2 border-background" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {history.fromStatus ? `${history.fromStatus} ➔ ` : ''}
                      <span className="text-[#3ECF8E]">{history.toStatus}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(history.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span>Location: <strong className="text-foreground">{history.location}</strong></span>
                    <span>•</span>
                    <span>By: <strong className="text-foreground">{history.performedBy}</strong></span>
                  </p>
                  {history.remarks && (
                    <p className="text-[11px] bg-secondary/50 p-2 rounded-sm text-foreground/80 border border-border/60">
                      {history.remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No status history recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
