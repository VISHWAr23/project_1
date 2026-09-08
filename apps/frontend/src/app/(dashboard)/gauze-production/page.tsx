'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Factory,
  Plus,
  Truck,
  Sparkles,
  Layers,
  Box,
  CheckCircle2,
  AlertTriangle,
  FileBarChart,
  Settings,
  ArrowRight,
  RefreshCw,
  Building2,
  TrendingDown,
  Clock,
  ArrowDownRight,
  Inbox,
  Scissors,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, Column } from '@/components/ui/table';
import { BatchStatusBadge } from '@/components/gauze-production/batch-status-badge';
import { SendBleachingModal } from '@/components/gauze-production/send-bleaching-modal';
import { ReceiveBleachingModal } from '@/components/gauze-production/receive-bleaching-modal';
import { AddOperationModal } from '@/components/gauze-production/add-operation-modal';
import { PackingModal } from '@/components/gauze-production/packing-modal';
import { useGauzeDashboard, useGauzeBatches, useVendorHeldStock } from '@/hooks/useGauzeProduction';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import { formatDate } from '@/lib/date-utils';

export default function GauzeProductionDashboardPage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGauzeDashboard();
  const { data: batchesData, isLoading: batchesLoading, refetch: refetchBatches } = useGauzeBatches({ limit: 10 });
  const { data: vendorStock = [], refetch: refetchVendorStock } = useVendorHeldStock();

  // Active batch for modal triggers
  const [selectedBatch, setSelectedBatch] = useState<GauzeProductionBatch | null>(null);
  const [modalType, setModalType] = useState<'send-bleach' | 'receive-bleach' | 'operation' | 'packing' | null>(null);

  const batches = batchesData?.items || [];
  const activeBatches = batches.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');

  const handleRefreshAll = () => {
    refetchStats();
    refetchBatches();
    refetchVendorStock();
  };

  const handleOpenActionModal = (batch: GauzeProductionBatch, type: 'send-bleach' | 'receive-bleach' | 'operation' | 'packing') => {
    setSelectedBatch(batch);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedBatch(null);
    setModalType(null);
    handleRefreshAll();
  };

  // Helper to determine the single recommended next action for a non-IT factory manager
  const getNextActionConfig = (batch: GauzeProductionBatch) => {
    switch (batch.status) {
      case 'RAW_MATERIAL_RECEIVED':
      case 'READY_FOR_BLEACHING':
      case 'DRAFT':
        return {
          label: 'Send to Bleaching Mill',
          icon: Truck,
          variant: 'amber',
          action: () => handleOpenActionModal(batch, 'send-bleach'),
        };
      case 'SENT_TO_BLEACHING':
        return {
          label: 'Receive from Mill',
          icon: Sparkles,
          variant: 'teal',
          action: () => handleOpenActionModal(batch, 'receive-bleach'),
        };
      case 'BLEACHING_RECEIVED':
      case 'IN_PROCESSING':
        return {
          label: 'Record Cutting / Folding',
          icon: Scissors,
          variant: 'indigo',
          action: () => handleOpenActionModal(batch, 'operation'),
        };
      case 'READY_FOR_PACKING':
      case 'PACKED':
        return {
          label: 'Pack into Finished Boxes',
          icon: Box,
          variant: 'emerald',
          action: () => handleOpenActionModal(batch, 'packing'),
        };
      default:
        return null;
    }
  };

  const batchColumns: Column<GauzeProductionBatch>[] = [
    {
      key: 'batchNumber',
      header: 'Batch No.',
      render: (row) => (
        <div>
          <Link
            href={`/gauze-production/batches/${row.id}`}
            className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline block text-sm"
          >
            {row.batchNumber}
          </Link>
          <span className="text-[11px] text-muted-foreground">
            Started: {formatDate(row.productionStartDate || row.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Fabric Specification',
      render: (row) => (
        <div>
          <span className="font-semibold text-foreground block text-xs">{row.product.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {row.gauzeType?.name || 'BP17'} • Size: {row.gauzeSize?.name || 'Standard'}
          </span>
        </div>
      ),
    },
    {
      key: 'supplier',
      header: 'Mill / Supplier',
      render: (row) => (
        <span className="text-xs text-foreground font-medium">
          {row.supplier?.name || 'Direct Stock'}
        </span>
      ),
    },
    {
      key: 'currentQuantity',
      header: 'Current Available',
      align: 'right',
      render: (row) => (
        <div className="font-mono text-right">
          <strong className="text-blue-600 dark:text-blue-400 block text-xs font-bold">
            {Number(row.currentQuantity).toLocaleString()} {row.currentUom}
          </strong>
          <span className="text-[10px] text-muted-foreground">
            Initial: {Number(row.inputQuantity).toLocaleString()} {row.inputUom}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Current Production Stage',
      render: (row) => <BatchStatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Next Manufacturing Action',
      align: 'right',
      render: (row) => {
        const nextAction = getNextActionConfig(row);

        return (
          <div className="flex items-center justify-end gap-2">
            {nextAction && (
              <button
                type="button"
                onClick={nextAction.action}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-xs ${
                  nextAction.variant === 'amber'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : nextAction.variant === 'teal'
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : nextAction.variant === 'indigo'
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <nextAction.icon className="h-3.5 w-3.5" />
                <span>{nextAction.label}</span>
              </button>
            )}

            <Link href={`/gauze-production/batches/${row.id}`}>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-border/80">
                <span>Details</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with Big Friendly Action Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
            <Factory className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Gauze Production Tracking
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Link href="/gauze-production/reports">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
              <FileBarChart className="h-3.5 w-3.5" />
              Production Reports
            </Button>
          </Link>

          <Link href="/gauze-production/masters">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
              <Settings className="h-3.5 w-3.5" />
              Masters & Settings
            </Button>
          </Link>

          <Link href="/gauze-production/batches/new">
            <Button size="sm" className="gap-2 text-xs font-bold h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
              <Plus className="h-4 w-4 stroke-[3]" />
              Start New Batch
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Visual 4-Step Factory Production Pipeline (The core guided workflow for non-IT staff) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Factory className="h-3.5 w-3.5" />
            4-Step Production Pipeline (Click any stage to manage)
          </h2>
          <Link href="/gauze-production/batches" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            View All Batches Register ({stats?.totalBatches ?? 0}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1: Raw Intake */}
          <Link href="/gauze-production/batches/new" className="group">
            <Card className="p-4 bg-card border-border hover:border-blue-500/60 hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-300">
                    Step 1
                  </span>
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Factory className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                  Raw Grey Cloth Intake
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive woven thans & rolls from cotton yarn suppliers.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>+ Create New Batch</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Step 2: Bleaching Job Work */}
          <Link href="/gauze-production/bleaching" className="group">
            <Card className="p-4 bg-card border-border hover:border-amber-500/60 hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    Step 2
                  </span>
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Truck className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-amber-600 transition-colors">
                  Subcontractor Bleaching
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Dispatch grey cloth to mills & record returned bleached fabric.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>
                  {stats?.sentToBleaching ?? 0} Batches at Mills ({Number(stats?.vendorHeldQuantity || 0).toLocaleString()}m)
                </span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Step 3: Factory Operations */}
          <Link href="/gauze-production/processing" className="group">
            <Card className="p-4 bg-card border-border hover:border-indigo-500/60 hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                    Step 3
                  </span>
                  <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Scissors className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                  Cutting & Folding
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Slit into ribbons, fold multi-ply swabs, and inspect quality.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>{stats?.inProcessing ?? 0} Batches in Processing</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>

          {/* Step 4: Finished Goods Packing */}
          <Link href="/gauze-production/packing" className="group">
            <Card className="p-4 bg-card border-border hover:border-emerald-500/60 hover:shadow-md transition-all h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    Step 4
                  </span>
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Box className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                  Packing & Finished Stock
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Pack into cartons and auto-update finished goods inventory.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{stats?.completedBatches ?? 0} Batches in Stock</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* 3. Simplified 4 Key Factory Numbers (Clear & High Contrast) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <Card className="p-4 bg-card border-border flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
            <Factory className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">Active Batches in Factory</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-foreground">
                {stats?.activeBatches ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">in shop floor</span>
            </div>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-4 bg-card border-border flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">Fabric at Bleaching Mills</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {Number(stats?.vendorHeldQuantity || 0).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">meters</span>
            </div>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-4 bg-card border-border flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">Completed in Stock</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {stats?.completedBatches ?? 0}
              </span>
              <span className="text-xs text-muted-foreground">finished batches</span>
            </div>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-4 bg-card border-border flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">Total Scrap / Shrinkage</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                {Number(stats?.totalWastage || 0).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">meters</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Active Batches Register with 1-Click Action Buttons */}
      <Card className="p-5 bg-card border-border space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Active Production Batches (Action Required)
            </h2>
            <p className="text-xs text-muted-foreground">
              Click the highlighted button in any row to record the next manufacturing step immediately.
            </p>
          </div>

          <Link href="/gauze-production/batches">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <span>View All Batches</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <Table<GauzeProductionBatch>
          data={activeBatches.length > 0 ? activeBatches : batches.slice(0, 5)}
          columns={batchColumns}
          keyExtractor={(b) => b.id}
          isLoading={batchesLoading}
          emptyMessage="No active gauze batches right now. Click 'Start New Batch' at the top to begin!"
        />
      </Card>

      {/* 5. Subcontractor Held Stock Overview */}
      {vendorStock.length > 0 && (
        <Card className="p-5 bg-card border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-foreground">
                Company Fabric Currently at Bleaching Subcontractors
              </h3>
            </div>
            <Link
              href="/gauze-production/bleaching"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Open Bleaching Register →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vendorStock.map((v) => (
              <div
                key={v.vendorId}
                className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-foreground block">{v.vendorName}</span>
                  <span className="text-[11px] text-muted-foreground">
                    Sent: {v.totalSent.toLocaleString()}m • Received: {v.totalReceived.toLocaleString()}m
                  </span>
                </div>
                <div className="text-right">
                  <strong className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 block">
                    {v.pendingQuantity.toLocaleString()} m
                  </strong>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Held at Mill</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal 1: Send to Bleaching */}
      {selectedBatch && modalType === 'send-bleach' && (
        <SendBleachingModal
          isOpen={true}
          onClose={handleCloseModal}
          batch={selectedBatch}
          onSuccess={handleCloseModal}
        />
      )}

      {/* Modal 2: Receive from Bleaching */}
      {selectedBatch && modalType === 'receive-bleach' && (
        <ReceiveBleachingModal
          isOpen={true}
          onClose={handleCloseModal}
          batch={selectedBatch}
          jobs={selectedBatch.bleachingJobs || []}
          onSuccess={handleCloseModal}
        />
      )}

      {/* Modal 3: Record Operation */}
      {selectedBatch && modalType === 'operation' && (
        <AddOperationModal
          isOpen={true}
          onClose={handleCloseModal}
          batch={selectedBatch}
          onSuccess={handleCloseModal}
        />
      )}

      {/* Modal 4: Convert to Finished Goods */}
      {selectedBatch && modalType === 'packing' && (
        <PackingModal
          isOpen={true}
          onClose={handleCloseModal}
          batch={selectedBatch}
          onSuccess={handleCloseModal}
        />
      )}
    </div>
  );
}
