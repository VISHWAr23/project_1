'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Factory,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Truck,
  Layers,
  Box,
  CheckCircle2,
  List,
  LayoutGrid,
  Calendar,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { BatchStatusBadge } from '@/components/gauze-production/batch-status-badge';
import { useGauzeBatches, useGauzeMasters, useDeleteGauzeBatch } from '@/hooks/useGauzeProduction';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';

export default function GauzeBatchesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [batchToDelete, setBatchToDelete] = useState<GauzeProductionBatch | null>(null);

  const { toast } = useToast();
  const deleteBatchMutation = useDeleteGauzeBatch();

  const { data: masters } = useGauzeMasters();
  const { data: batchesData, isLoading } = useGauzeBatches({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    gauzeTypeId: typeFilter !== 'ALL' ? typeFilter : undefined,
    gauzeSizeId: sizeFilter !== 'ALL' ? sizeFilter : undefined,
    page,
    limit: 20,
  });

  const batches = batchesData?.items || [];
  const meta = batchesData?.meta;

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;
    try {
      await deleteBatchMutation.mutateAsync(batchToDelete.id);
      toast('Batch Deleted', `Gauze Batch ${batchToDelete.batchNumber} has been removed.`, 'success');
      setBatchToDelete(null);
    } catch (e: any) {
      toast('Delete Failed', e?.message || 'Could not delete batch', 'error');
    }
  };

  const columns: Column<GauzeProductionBatch>[] = [
    {
      key: 'batchNumber',
      header: 'Batch Number',
      render: (row) => (
        <div>
          <Link
            href={`/gauze-production/batches/${row.id}`}
            className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline block"
          >
            {row.batchNumber}
          </Link>
          <span className="text-[11px] text-muted-foreground font-mono">
            {formatDate(row.createdAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Product / Specification',
      render: (row) => (
        <div>
          <span className="font-semibold text-foreground block text-xs">{row.product.name}</span>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground font-mono">
            <span className="bg-secondary px-1.5 py-0.5 rounded">{row.gauzeType?.name || 'BP17'}</span>
            {row.gauzeSize && <span className="bg-secondary px-1.5 py-0.5 rounded">{row.gauzeSize.name}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier / Origin Lot',
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-foreground block">{row.supplier?.name || 'Direct Stock'}</span>
          {row.rawMaterials?.[0]?.rollOrThansNumber && (
            <span className="text-[11px] font-mono text-muted-foreground">
              Lot: {row.rawMaterials[0].rollOrThansNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'inputQuantity',
      header: 'Input / Current Qty',
      align: 'right',
      render: (row) => (
        <div className="font-mono text-xs">
          <span className="text-muted-foreground block text-[11px]">
            Input: {Number(row.inputQuantity).toLocaleString()} {row.inputUom}
          </span>
          <strong className="text-blue-600 dark:text-blue-400">
            {Number(row.currentQuantity).toLocaleString()} {row.currentUom}
          </strong>
        </div>
      ),
    },
    {
      key: 'currentStage',
      header: 'Stage',
      render: (row) => (
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-secondary text-foreground uppercase">
          {row.currentStage}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BatchStatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/gauze-production/batches/${row.id}`}>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              Open Details
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBatchToDelete(row)}
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-red-500/20 rounded-md shrink-0 flex items-center justify-center"
            title="Delete Batch"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/gauze-production">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Back to Gauze Production">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Factory className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Production Batches Register
            </h1>
            <p className="text-xs text-muted-foreground">
              Search, filter, and inspect the complete lifecycle for every gauze production batch.
            </p>
          </div>
        </div>

        <Link href="/gauze-production/batches/new">
          <Button size="sm" className="gap-2 text-xs font-bold h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Plus className="h-4 w-4 stroke-[3]" />
            Start New Batch
          </Button>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 bg-card border-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batch #, product SKU, notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Production Statuses' },
              { value: 'RAW_MATERIAL_RECEIVED', label: 'Raw Material Received' },
              { value: 'SENT_TO_BLEACHING', label: 'Sent to Bleaching' },
              { value: 'BLEACHING_RECEIVED', label: 'Bleaching Received' },
              { value: 'IN_PROCESSING', label: 'In Processing' },
              { value: 'READY_FOR_PACKING', label: 'Ready for Packing' },
              { value: 'PACKED', label: 'Packed' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ON_HOLD', label: 'On Hold' },
            ]}
          />

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Gauze Types' },
              ...(masters?.gauzeTypes || []).map((t) => ({ value: t.id, label: t.name })),
            ]}
          />

          <Select
            value={sizeFilter}
            onChange={(e) => {
              setSizeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'ALL', label: 'All Gauze Sizes' },
              ...(masters?.gauzeSizes || []).map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground font-mono">
            Showing {batches.length} of {meta?.total || 0} batches
          </span>
          <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-md">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded ${viewMode === 'cards' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground'}`}
              title="Cards View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      {viewMode === 'table' ? (
        <Card className="p-4 bg-card border-border">
          <Table<GauzeProductionBatch>
            data={batches}
            columns={columns}
            keyExtractor={(b) => b.id}
            isLoading={isLoading}
            emptyMessage="No gauze production batches match your search criteria."
          />
        </Card>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <Card
              key={batch.id}
              className="p-4 bg-card border-border hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <Link
                      href={`/gauze-production/batches/${batch.id}`}
                      className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {batch.batchNumber}
                    </Link>
                    <span className="text-[11px] text-muted-foreground block font-mono">
                      {formatDate(batch.createdAt)}
                    </span>
                  </div>
                  <BatchStatusBadge status={batch.status} size="sm" />
                </div>

                <h3 className="font-semibold text-xs text-foreground line-clamp-1">{batch.product.name}</h3>

                <div className="flex flex-wrap items-center gap-1.5 my-2 text-[11px] font-mono text-muted-foreground">
                  <span className="bg-secondary px-2 py-0.5 rounded">{batch.gauzeType?.name || 'BP17'}</span>
                  {batch.gauzeSize && <span className="bg-secondary px-2 py-0.5 rounded">{batch.gauzeSize.name}</span>}
                </div>

                <div className="p-2.5 bg-secondary/30 rounded-md border border-border/60 space-y-1 text-xs font-mono my-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Current Quantity:</span>
                    <strong className="text-blue-600 dark:text-blue-400">
                      {Number(batch.currentQuantity).toLocaleString()} {batch.currentUom}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Initial Input:</span>
                    <span>
                      {Number(batch.inputQuantity).toLocaleString()} {batch.inputUom}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Current Stage:</span>
                    <strong className="text-foreground">{batch.currentStage}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                  {batch.supplier?.name || 'Direct Stock'}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBatchToDelete(batch)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-red-500/20 rounded-md shrink-0 flex items-center justify-center"
                    title="Delete Batch"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Link href={`/gauze-production/batches/${batch.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Batch Confirmation Modal */}
      {batchToDelete && (
        <Modal
          isOpen={Boolean(batchToDelete)}
          onClose={() => setBatchToDelete(null)}
          title="Delete Gauze Production Batch"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs text-red-300">
              <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                Confirm Batch Deletion
              </div>
              <p>
                Are you sure you want to permanently delete Gauze Batch <strong className="text-foreground font-mono">{batchToDelete.batchNumber}</strong>?
              </p>
              <p>
                Fabric: <strong className="text-foreground">{batchToDelete.product.name}</strong> ({Number(batchToDelete.currentQuantity)} {batchToDelete.currentUom} remaining).
              </p>
              <p className="text-muted-foreground">
                This action will delete the batch record and all associated movements, operations, and logs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setBatchToDelete(null)}
                disabled={deleteBatchMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={handleDeleteBatch}
                isLoading={deleteBatchMutation.isPending}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Delete Batch
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
