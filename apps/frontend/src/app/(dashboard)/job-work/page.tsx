'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  RefreshCw,
  Scale,
  Search,
  Filter,
  LayoutGrid,
  List,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Column } from '@/components/ui/table';
import { JobWorkStatusBadge } from '@/components/job-work/job-work-status-badge';
import { JobWorkSDLCCard, SDLC_STAGES, getStageIndex } from '@/components/job-work/job-work-sdlc-card';
import { JobWorkWorkflowModal } from '@/components/job-work/job-work-workflow-modal';
import { useJobWorkOrders } from '@/hooks/useJobWork';
import { JobWorkOrder, JobWorkStatus } from '@/types/job-work.types';
import Link from 'next/link';

export default function JobWorkMainPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [selectedOrder, setSelectedOrder] = useState<JobWorkOrder | null>(null);

  const { data, isLoading, refetch } = useJobWorkOrders({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const orders = data?.items || [];
  const stats = data?.stats;

  // Table Columns fallback definition
  const columns: Column<JobWorkOrder>[] = [
    {
      key: 'jobWorkNumber',
      header: 'Job Work Order No',
      sortable: true,
      render: (row) => (
        <div>
          <button
            onClick={() => setSelectedOrder(row)}
            className="font-mono font-bold text-[#3ECF8E] hover:underline block text-left"
          >
            {row.jobWorkNumber}
          </button>
          {row.challanNumber && (
            <span className="text-[11px] font-mono text-muted-foreground">DC: {row.challanNumber}</span>
          )}
        </div>
      ),
    },
    {
      key: 'jobWorkCompany',
      header: 'Job Working Vendor',
      render: (row) => (
        <div>
          <span className="font-medium text-foreground block">{row.jobWorkCompany?.companyName}</span>
          <span className="text-[11px] text-muted-foreground">{row.jobWorkCompany?.contactPerson || 'Subcontractor'}</span>
        </div>
      ),
    },
    {
      key: 'rawMaterial',
      header: 'Material Issued',
      render: (row) => (
        <div>
          <span className="text-foreground font-medium block">{row.rawMaterial?.name}</span>
          <span className="text-[11px] text-muted-foreground font-mono">SKU: {row.rawMaterial?.sku}</span>
        </div>
      ),
    },
    {
      key: 'totalIssuedWeight',
      header: 'Issued Weight',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-foreground font-semibold">
          {Number(row.totalIssuedWeight).toFixed(2)} Kg
        </span>
      ),
    },
    {
      key: 'totalReturnedWeight',
      header: 'Returned Weight',
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className="font-mono text-emerald-400 block font-semibold">
            {Number(row.totalReturnedWeight).toFixed(2)} Kg
          </span>
          {Number(row.totalWastageWeight) > 0 && (
            <span className="text-[11px] font-mono text-amber-400">Waste: {Number(row.totalWastageWeight).toFixed(2)} Kg</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'SDLC Pipeline Stage',
      align: 'center',
      render: (row) => <JobWorkStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '1-Tap Action',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedOrder(row)}
            className="px-2.5 py-1 bg-[#3ECF8E]/10 text-[#3ECF8E] hover:bg-[#3ECF8E]/20 text-xs font-mono font-semibold rounded-md transition-colors"
          >
            View Workflow
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="bg-[#3ECF8E]/10 p-2 rounded-xl text-[#3ECF8E]">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                Job Work & Material Issue Pipeline
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                SDLC-style Subcontracting Workflow, Material Issue & Digital Return Reconciliation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link href="/job-work/returns">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Digital Return Register
            </Button>
          </Link>
          <Link href="/job-work/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Create Job Work Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Guided SDLC Workflow Overview Step Header */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
            End-to-End Subcontracting SDLC Pipeline
          </span>
          <span className="text-[#3ECF8E] font-bold">5 Guided Factory Stages</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {SDLC_STAGES.map((stage) => (
            <button
              key={stage.key}
              onClick={() => setStatusFilter(stage.key)}
              className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                statusFilter === stage.key
                  ? 'bg-[#3ECF8E]/15 border-[#3ECF8E] text-[#3ECF8E] shadow-sm'
                  : 'bg-secondary/40 border-border/60 hover:bg-secondary text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] opacity-70 font-bold">STAGE 0{stage.stepNumber}</span>
                {statusFilter === stage.key && <CheckCircle2 className="h-3 w-3 text-[#3ECF8E]" />}
              </div>
              <p className="font-bold text-xs text-foreground truncate mt-1">{stage.shortLabel}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card hoverElevation className="p-4 bg-card border-border/80">
          <p className="text-xs font-medium text-muted-foreground font-mono">Total Subcontractors</p>
          <h3 className="text-2xl font-bold text-foreground font-mono mt-1">
            {stats?.activeVendorsCount || 3} Active
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">Authorized Bleaching Units</p>
        </Card>

        <Card hoverElevation className="p-4 bg-card border-border/80">
          <p className="text-xs font-medium text-muted-foreground font-mono">Stage 2: Issued (Outward)</p>
          <h3 className="text-2xl font-bold text-[#3ECF8E] font-mono mt-1 flex items-center gap-1">
            <Scale className="h-5 w-5" />
            {stats?.materialsIssued || 1} Active
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">Materials at vendor site</p>
        </Card>

        <Card hoverElevation className="p-4 bg-card border-border/80">
          <p className="text-xs font-medium text-muted-foreground font-mono">Stage 4: Return Pending</p>
          <h3 className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {stats?.partialReturn || 1} Orders
          </h3>
          <p className="text-[11px] text-amber-400/80 mt-1 font-mono">Partial rolls awaiting return</p>
        </Card>

        <Card hoverElevation className="p-4 bg-card border-border/80">
          <p className="text-xs font-medium text-muted-foreground font-mono">Stage 5: Fully Reconciled</p>
          <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {stats?.closed || 1} Closed
          </h3>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">Reconciled work orders</p>
        </Card>
      </div>

      {/* Controls Bar: Search, SDLC Filter & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Order No, Vendor, Material, Challan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Pipeline Stages', value: 'ALL' },
              { label: 'Stage 1: Draft / Created', value: 'CREATED' },
              { label: 'Stage 2: Material Issued', value: 'MATERIALS_ISSUED' },
              { label: 'Stage 3: Vendor Processing', value: 'IN_PROGRESS' },
              { label: 'Stage 4: Partial Return Recv', value: 'PARTIAL_RETURN' },
              { label: 'Stage 5: Reconciled & Closed', value: 'COMPLETED' },
            ]}
          />

          {/* Board vs Table Switcher */}
          <div className="flex items-center bg-secondary p-1 rounded-xl border border-border/80 shrink-0">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'board'
                  ? 'bg-card text-[#3ECF8E] shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="SDLC Card View"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">SDLC Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-card text-[#3ECF8E] shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table Register View"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'board' ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground font-mono bg-card border border-border/80 rounded-2xl">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#3ECF8E]" />
              Loading SDLC Job Work Board...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-mono bg-card border border-border/80 rounded-2xl">
              No Job Work orders match the selected SDLC pipeline stage.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <JobWorkSDLCCard
                  key={order.id}
                  order={order}
                  onSelect={(ord) => setSelectedOrder(ord)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Table
          columns={columns}
          data={orders}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
        />
      )}

      {/* SDLC Interactive Workflow Stepper Modal */}
      <JobWorkWorkflowModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </motion.div>
  );
}
