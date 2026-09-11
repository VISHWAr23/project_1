'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Factory,
  Scroll,
  ArrowRight,
  Users,
  Building2,
  Clock,
  Layers,
  Sparkles,
  Scissors,
  Box,
  Truck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Calendar,
  ExternalLink,
  Sun,
  Coins,
  Bed,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import {
  ProductionAssignmentModal,
  ProductionType,
} from '@/components/job-work/production-assignment-modal';
import { useGauzeDashboard, useGauzeBatches } from '@/hooks/useGauzeProduction';
import { useGamjeeDashboard, useGamjeeBatches } from '@/hooks/useGamjeeProduction';
import { useMopingPadBatches } from '@/hooks/useMopingPadProduction';
import { useGauzePadPinningBatches } from '@/hooks/useGauzePadPinning';
import { useDryingBatches } from '@/hooks/useDrying';
import { usePillowBedsheetBatches } from '@/hooks/usePillowBedsheetProduction';
import { useJobWorkCompanies } from '@/hooks/useJobWork';
import { useEmployees } from '@/hooks/useEmployees';
import { formatDate } from '@/lib/date-utils';

export default function JobWorkProductionHubPage() {
  const [selectedProduction, setSelectedProduction] = useState<ProductionType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'all' | 'gauze' | 'gamjee' | 'moping-pad' | 'gauze-pad-pinning' | 'drying' | 'pillow-bedsheet'
  >('all');

  // Queries
  const { data: gauzeStats, isLoading: loadingGauzeStats } = useGauzeDashboard();
  const { data: gauzeBatchesData, isLoading: loadingGauzeBatches } = useGauzeBatches({ limit: 50 });
  const { data: gamjeeStats, isLoading: loadingGamjeeStats } = useGamjeeDashboard();
  const { data: gamjeeBatchesData, isLoading: loadingGamjeeBatches } = useGamjeeBatches({ limit: 50 });
  const { data: mopingBatchesData } = useMopingPadBatches();
  const { data: gauzePadBatchesData } = useGauzePadPinningBatches();
  const { data: dryingBatchesData } = useDryingBatches();
  const { data: pillowBatchesData } = usePillowBedsheetBatches();
  const { data: companies = [] } = useJobWorkCompanies();
  const { data: employeesData } = useEmployees({ status: 'ACTIVE', limit: 100 });

  const activeEmployeesCount = employeesData?.items?.length || 0;
  const activeGauzeBatches = gauzeBatchesData?.items?.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') || [];
  const activeGamjeeBatches = gamjeeBatchesData?.items?.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') || [];
  const activeMopingBatches = mopingBatchesData?.items?.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT') || [];
  const activeGauzePadBatches = gauzePadBatchesData?.items?.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT') || [];
  const activeDryingBatches = dryingBatchesData?.items?.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT') || [];
  const activePillowBatches = pillowBatchesData?.items?.filter((b) => b.status === 'IN_PROGRESS' || b.status === 'DRAFT') || [];

  const totalActiveRuns =
    activeGauzeBatches.length +
    activeGamjeeBatches.length +
    activeMopingBatches.length +
    activeGauzePadBatches.length +
    activeDryingBatches.length +
    activePillowBatches.length;

  const handleOpenAssignment = (type: ProductionType) => {
    setSelectedProduction(type);
    setIsModalOpen(true);
  };

  // Normalize and sort all active production batches in newest-first order
  const allUnifiedBatches = useMemo(() => {
    const list: Array<{
      id: string;
      batchNumber: string;
      categoryKey: string;
      typeLabel: string;
      badgeClasses: string;
      textAccentClass: string;
      borderHoverClass: string;
      productName: string;
      dateStr: string;
      timestamp: number;
      metricPrimary: React.ReactNode;
      metricSecondary?: React.ReactNode;
      manageUrl: string;
    }> = [];

    const resolveTimestamp = (b: any) => {
      const candidates = [
        b.createdAt,
        b.updatedAt,
        b.productionStartDate,
        b.productionDate,
        b.startDate,
      ];
      for (const c of candidates) {
        if (c) {
          const t = new Date(c).getTime();
          if (!Number.isNaN(t) && t > 0) return t;
        }
      }
      return 0;
    };

    const resolveDisplayDate = (b: any) => {
      return (
        b.startDate ||
        b.productionStartDate ||
        b.productionDate ||
        b.createdAt ||
        ''
      );
    };

    // 1. Gauze
    activeGauzeBatches.forEach((batch: any) => {
      list.push({
        id: `gauze-${batch.id}`,
        batchNumber: batch.batchNumber,
        categoryKey: 'gauze',
        typeLabel: 'Gauze',
        badgeClasses: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
        textAccentClass: 'text-blue-600 dark:text-blue-400',
        borderHoverClass: 'hover:border-blue-500/50',
        productName: batch.product?.name || 'Bleached Gauze',
        dateStr: resolveDisplayDate(batch),
        timestamp: resolveTimestamp(batch),
        metricPrimary: (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Input: <strong className="text-foreground font-mono">{Number(batch.inputQuantity).toFixed(0)} {batch.inputUom}</strong></span>
            <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-mono">{batch.status}</span>
          </div>
        ),
        manageUrl: `/gauze-production/batches/${batch.id}`,
      });
    });

    // 2. Gamjee
    activeGamjeeBatches.forEach((batch: any) => {
      list.push({
        id: `gamjee-${batch.id}`,
        batchNumber: batch.batchNumber,
        categoryKey: 'gamjee',
        typeLabel: 'Gamjee',
        badgeClasses: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
        textAccentClass: 'text-emerald-600 dark:text-emerald-400',
        borderHoverClass: 'hover:border-emerald-500/50',
        productName: batch.finishedProduct?.name || 'Gamjee Roll',
        dateStr: resolveDisplayDate(batch),
        timestamp: resolveTimestamp(batch),
        metricPrimary: (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Target: <strong className="text-foreground font-mono">{Number(batch.productionQuantity || 0).toFixed(0)} Rolls</strong></span>
            <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-mono">{batch.status}</span>
          </div>
        ),
        manageUrl: `/gamjee-production/batches/${batch.id}`,
      });
    });

    // 3. Moping Pad
    activeMopingBatches.forEach((batch: any) => {
      list.push({
        id: `moping-${batch.id}`,
        batchNumber: batch.batchNumber,
        categoryKey: 'moping-pad',
        typeLabel: 'Moping Pad',
        badgeClasses: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
        textAccentClass: 'text-amber-600 dark:text-amber-400',
        borderHoverClass: 'hover:border-amber-500/50',
        productName: batch.productName,
        dateStr: resolveDisplayDate(batch),
        timestamp: resolveTimestamp(batch),
        metricPrimary: (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress: <strong className="text-foreground font-mono">{batch.completedQuantity || 0} / {batch.outputQuantity} pads</strong></span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{batch.completionPercentage || 0}%</span>
          </div>
        ),
        metricSecondary: (
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground bg-secondary/40 px-2 py-1 rounded">
            <span>{batch.materialType === 'ROLL' ? 'Roll' : 'Pieces'}: {batch.totalLength}m</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
              {batch.pendingQuantity ?? Math.max(0, batch.outputQuantity - (batch.completedQuantity || 0))} pending
            </span>
          </div>
        ),
        manageUrl: '/moping-pad-production',
      });
    });

    // 4. Gauze Pad Pinning
    activeGauzePadBatches.forEach((batch: any) => {
      list.push({
        id: `pinning-${batch.id}`,
        batchNumber: batch.batchNumber,
        categoryKey: 'gauze-pad-pinning',
        typeLabel: 'Pad Pinning',
        badgeClasses: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
        textAccentClass: 'text-cyan-600 dark:text-cyan-400',
        borderHoverClass: 'hover:border-cyan-500/50',
        productName: batch.productName,
        dateStr: resolveDisplayDate(batch),
        timestamp: resolveTimestamp(batch),
        metricPrimary: (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{batch.materialType === 'ROLL' ? 'Roll' : 'Pieces'}: <strong className="text-foreground font-mono">{batch.totalLength}m</strong></span>
            <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{batch.outputQuantity} Pads</span>
          </div>
        ),
        metricSecondary: (
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground bg-secondary/40 px-2 py-1 rounded">
            <span>Rate: ₹{batch.salaryRatePerPiece.toFixed(2)}/pad</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">₹{batch.totalSalary.toFixed(0)} Salary</span>
          </div>
        ),
        manageUrl: '/gauze-pad-pinning',
      });
    });

    // 5. Drying
    activeDryingBatches.forEach((batch: any) => {
      list.push({
        id: `drying-${batch.id}`,
        batchNumber: batch.batchNumber,
        categoryKey: 'drying',
        typeLabel: 'Drying',
        badgeClasses: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
        textAccentClass: 'text-orange-600 dark:text-orange-400',
        borderHoverClass: 'hover:border-orange-500/50',
        productName: batch.productName,
        dateStr: resolveDisplayDate(batch),
        timestamp: resolveTimestamp(batch),
        metricPrimary: (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress: <strong className="text-foreground font-mono">{batch.completedPieces} / {batch.totalPieces} pcs</strong></span>
            <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{batch.completionPercentage}%</span>
          </div>
        ),
        metricSecondary: (
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground bg-secondary/40 px-2 py-1 rounded">
            <span>{batch.completedLength.toFixed(0)}m / {batch.totalLength}m</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">₹{batch.totalSalary.toFixed(0)} Salary</span>
          </div>
        ),
        manageUrl: '/drying',
      });
    });

    // 6. Pillow & Bed Sheet
    activePillowBatches.forEach((batch: any) => {
      list.push({
        id: `pillow-${batch.id}`,
        batchNumber: batch.batchNumber,
        categoryKey: 'pillow-bedsheet',
        typeLabel: batch.productType === 'BED_SHEET' ? 'Bed Sheet' : 'Pillow Cover',
        badgeClasses: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
        textAccentClass: 'text-purple-600 dark:text-purple-400',
        borderHoverClass: 'hover:border-purple-500/50',
        productName: batch.productName,
        dateStr: resolveDisplayDate(batch),
        timestamp: resolveTimestamp(batch),
        metricPrimary: (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Target: <strong className="text-foreground font-mono">{batch.outputQuantity} pcs</strong></span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{batch.completionPercentage}%</span>
          </div>
        ),
        metricSecondary: (
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground bg-secondary/40 px-2 py-1 rounded">
            <span>{batch.totalLength.toFixed(1)}m</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">₹{batch.totalSalary.toFixed(0)} Salary</span>
          </div>
        ),
        manageUrl: `/pillow-bedsheet-production/batches/${batch.id}`,
      });
    });

    // Sort descending by timestamp (newest first), with alphanumeric tie-breaker
    return list.sort((a, b) => {
      if (b.timestamp !== a.timestamp) {
        return b.timestamp - a.timestamp;
      }
      return (b.batchNumber || b.id).localeCompare(a.batchNumber || a.id, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [
    activeGauzeBatches,
    activeGamjeeBatches,
    activeMopingBatches,
    activeGauzePadBatches,
    activeDryingBatches,
    activePillowBatches,
  ]);

  const displayedBatches = useMemo(() => {
    if (activeTab === 'all') return allUnifiedBatches;
    return allUnifiedBatches.filter((b) => b.categoryKey === activeTab);
  }, [allUnifiedBatches, activeTab]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
              Job Work & Production Operations
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Operations Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/employees" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" fullWidth className="h-9 gap-1.5 text-xs min-h-[36px]">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>Staff ({activeEmployeesCount})</span>
            </Button>
          </Link>
          <Link href="/job-work/vendors" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" fullWidth className="h-9 gap-1.5 text-xs border-blue-500/30 hover:bg-blue-500/10 text-foreground min-h-[36px]">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Vendors ({companies.length})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <Card className="p-3 sm:p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Active Runs</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {totalActiveRuns}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">WIP Batches</span>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="p-3 sm:p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Gauze WIP</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Factory className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {activeGauzeBatches.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Batches</span>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="p-3 sm:p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Gamjee WIP</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scroll className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {activeGamjeeBatches.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Batches</span>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="p-3 sm:p-4 bg-card border-border hover:border-border/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Moping Pad WIP</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {activeMopingBatches.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Batches</span>
          </div>
        </Card>

        {/* KPI 5 */}
        <Card className="p-3 sm:p-4 bg-card border-border hover:border-border/80 transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pinning & Drying</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Scissors className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {activeGauzePadBatches.length + activeDryingBatches.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Runs</span>
          </div>
        </Card>
      </div>

      {/* Primary Section: 5 Production Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Production Work Assignment
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline-block">
            6 Active Lines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Gauze Production */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenAssignment('GAUZE')}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden p-4 sm:p-5 h-full flex flex-col justify-between border border-border hover:border-blue-500/60 hover:shadow-md transition-all bg-gradient-to-br from-card via-card to-blue-500/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                      <Factory className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Gauze Production
                      </h3>
                      <span className="text-[11px] text-muted-foreground block">
                        Bleaching mill subcontract, cutting & sterile pack
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shrink-0">
                    Surgical Gauze
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    {activeGauzeBatches.length} WIP Batches
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Mill Bleaching
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Cutting & Folding
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
                <Link
                  href="/gauze-production"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 border-border hover:border-blue-500/50 hover:bg-blue-500/5 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span>Go to Production</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs group-hover:shadow-xs transition-all"
                >
                  <span>Assign & Start</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Card 2: Gamjee Production */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenAssignment('GAMJEE')}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden p-4 sm:p-5 h-full flex flex-col justify-between border border-border hover:border-emerald-500/60 hover:shadow-md transition-all bg-gradient-to-br from-card via-card to-emerald-500/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                      <Scroll className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Gamjee Production
                      </h3>
                      <span className="text-[11px] text-muted-foreground block">
                        Cotton roll + gauze layering & machine rolling
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                    Gamjee Rolls
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    {activeGamjeeBatches.length} WIP Batches
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Fabric + Cotton Spec
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Rolling Machine
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
                <Link
                  href="/gamjee-production"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <span>Go to Production</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs group-hover:shadow-xs transition-all"
                >
                  <span>Assign & Start</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Card 3: Moping Pad Production */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenAssignment('MOPING_PAD')}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden p-4 sm:p-5 h-full flex flex-col justify-between border border-border hover:border-amber-500/60 hover:shadow-md transition-all bg-gradient-to-br from-card via-card to-amber-500/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                      <Layers className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Moping Pad Production
                      </h3>
                      <span className="text-[11px] text-muted-foreground block">
                        Roll or pieces raw fabric intake, pinning & pad sizing
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                    Moping Pads
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    {activeMopingBatches.length} WIP Batches
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Roll / Pieces Intake
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Pinning Sizing
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
                <Link
                  href="/moping-pad-production"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 border-border hover:border-amber-500/50 hover:bg-amber-500/5 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <span>Go to Production</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs group-hover:shadow-xs transition-all"
                >
                  <span>Assign & Start</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Card 4: Gauze Pad Pinning */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenAssignment('GAUZE_PAD_PINNING')}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden p-4 sm:p-5 h-full flex flex-col justify-between border border-border hover:border-cyan-500/60 hover:shadow-md transition-all bg-gradient-to-br from-card via-card to-cyan-500/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                      <Scissors className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        Gauze Pad Pinning
                      </h3>
                      <span className="text-[11px] text-muted-foreground block">
                        Dual division sizing (Pinning ÷ Cutting) & worker salary
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 shrink-0">
                    Dual Division
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    {activeGauzePadBatches.length} WIP Batches
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Roll / Pieces Intake
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Equal Salary Split
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
                <Link
                  href="/gauze-pad-pinning"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 text-muted-foreground hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                  >
                    <span>Go to Production</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white shadow-2xs group-hover:shadow-xs transition-all"
                >
                  <span>Assign & Start</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Card 5: Drying Process */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenAssignment('DRYING')}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden p-4 sm:p-5 h-full flex flex-col justify-between border border-border hover:border-orange-500/60 hover:shadow-md transition-all bg-gradient-to-br from-card via-card to-orange-500/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600" />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                      <Sun className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        Drying Process
                      </h3>
                      <span className="text-[11px] text-muted-foreground block">
                        Pieces progress logging & linear meter salary engine
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 shrink-0">
                    Piece Progress
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    {activeDryingBatches.length} WIP Batches
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Pieces Only Intake
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    ₹/m Meter Salary
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
                <Link
                  href="/drying"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 border-border hover:border-orange-500/50 hover:bg-orange-500/5 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    <span>Go to Production</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white shadow-2xs group-hover:shadow-xs transition-all"
                >
                  <span>Assign & Start</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Card 6: Pillow Cover & Bed Sheet Production */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => handleOpenAssignment('PILLOW_BEDSHEET')}
            className="group cursor-pointer"
          >
            <Card className="relative overflow-hidden p-4 sm:p-5 h-full flex flex-col justify-between border border-border hover:border-purple-500/60 hover:shadow-md transition-all bg-gradient-to-br from-card via-card to-purple-500/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />

              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs shrink-0">
                      <Bed className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Pillow Cover & Bed Sheet
                      </h3>
                      <span className="text-[11px] text-muted-foreground block">
                        Dual product cutting, sizing & piece wages
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
                    Bed & Pillow
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    {activePillowBatches.length} WIP Batches
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Roll Intake
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Piece Salary Engine
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between">
                <Link
                  href="/pillow-bedsheet-production"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1.5 border-border hover:border-purple-500/50 hover:bg-purple-500/5 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    <span>Go to Production</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-2xs group-hover:shadow-xs transition-all"
                >
                  <span>Assign & Start</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Live Active Production Register Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Current Active Production Batches
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border/60 text-xs overflow-x-auto touch-scroll no-scrollbar w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                activeTab === 'all'
                  ? 'bg-background font-semibold text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({totalActiveRuns})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gauze')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                activeTab === 'gauze'
                  ? 'bg-background font-semibold text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Gauze ({activeGauzeBatches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gamjee')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                activeTab === 'gamjee'
                  ? 'bg-background font-semibold text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Gamjee ({activeGamjeeBatches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('moping-pad')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                activeTab === 'moping-pad'
                  ? 'bg-background font-semibold text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Moping Pad ({activeMopingBatches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gauze-pad-pinning')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                activeTab === 'gauze-pad-pinning'
                  ? 'bg-background font-semibold text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pinning ({activeGauzePadBatches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drying')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                activeTab === 'drying'
                  ? 'bg-background font-semibold text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Drying ({activeDryingBatches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pillow-bedsheet')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[32px] ${
                activeTab === 'pillow-bedsheet'
                  ? 'bg-background font-semibold text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pillow & Bed Sheet ({activePillowBatches.length})
            </button>
          </div>
        </div>

        {/* Batches Grid / Table in Newest-First Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedBatches.map((batch) => (
            <Card
              key={batch.id}
              className={`p-4 border border-border/80 ${batch.borderHoverClass} transition-colors flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${batch.textAccentClass}`}>
                    {batch.batchNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${batch.badgeClasses}`}>
                    {batch.typeLabel}
                  </span>
                </div>

                <p className="text-xs font-medium text-foreground mt-2 truncate" title={batch.productName}>
                  {batch.productName}
                </p>

                <div className="mt-3">
                  {batch.metricPrimary}
                </div>

                {batch.metricSecondary}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(batch.dateStr)}
                </span>
                <Link
                  href={batch.manageUrl}
                  className={`${batch.textAccentClass} hover:underline flex items-center gap-1 font-medium text-xs`}
                >
                  <span>Manage</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          ))}

          {displayedBatches.length === 0 && (
            <div className="col-span-full p-8 text-center border border-dashed border-border rounded-xl bg-card">
              <p className="text-xs text-muted-foreground">
                No active batches running currently. Select a Production Line above to assign and launch a new manufacturing run.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal Trigger */}
      <ProductionAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productionType={selectedProduction}
      />
    </div>
  );
}
