'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Scissors,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Column } from '@/components/ui/table';
import { useGauzeBatches, useGauzeMasters } from '@/hooks/useGauzeProduction';
import { AddOperationModal } from '@/components/gauze-production/add-operation-modal';
import { BatchStatusBadge } from '@/components/gauze-production/batch-status-badge';
import { formatDate } from '@/lib/date-utils';

export default function GauzeProcessingPage() {
  const [search, setSearch] = useState('');
  const [opTypeFilter, setOpTypeFilter] = useState('ALL');
  const [selectedBatchForOp, setSelectedBatchForOp] = useState<any | null>(null);

  const { data: masters } = useGauzeMasters();
  const { data: batchesData, isLoading, refetch } = useGauzeBatches({ limit: 50 });
  const batches = batchesData?.items || [];

  // Active batches awaiting or in cutting and folding processing
  const processingBatches = batches.filter(
    (b) => b.status === 'BLEACHING_RECEIVED' || b.status === 'IN_PROCESSING'
  );

  // Flatten all operations across batches
  const allOperations = batches.flatMap((b) =>
    (b.operations || []).map((op) => ({
      ...op,
      batchNumber: b.batchNumber,
      productName: b.product.name,
    }))
  );

  const filteredOperations = allOperations.filter((op) => {
    const matchesSearch =
      !search ||
      op.operationNumber.toLowerCase().includes(search.toLowerCase()) ||
      op.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      op.operationType.name.toLowerCase().includes(search.toLowerCase());

    const matchesType = opTypeFilter === 'ALL' || op.operationTypeId === opTypeFilter;

    return matchesSearch && matchesType;
  });

  const columns: Column<any>[] = [
    {
      key: 'operationNumber',
      header: 'Operation Number',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-foreground block">{row.operationNumber}</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {formatDate(row.operationDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'batchNumber',
      header: 'Production Batch',
      render: (row) => (
        <div>
          <Link
            href={`/gauze-production/batches/${row.productionBatchId}`}
            className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {row.batchNumber}
          </Link>
          <span className="text-[11px] text-muted-foreground block truncate">{row.productName}</span>
        </div>
      ),
    },
    {
      key: 'operationType',
      header: 'Operation',
      render: (row) => (
        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
          {row.operationType.name}
        </span>
      ),
    },
    {
      key: 'inputQuantity',
      header: 'Input Quantity',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-foreground">
          {Number(row.inputQuantity).toLocaleString()} {row.uom}
        </span>
      ),
    },
    {
      key: 'outputQuantity',
      header: 'Output Yield',
      align: 'right',
      render: (row) => (
        <strong className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
          {Number(row.outputQuantity).toLocaleString()} {row.uom}
        </strong>
      ),
    },
    {
      key: 'wastageQuantity',
      header: 'Wastage / Scrap',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-rose-600">
          {Number(row.wastageQuantity).toLocaleString()} {row.uom}
        </span>
      ),
    },
    {
      key: 'employee',
      header: 'Operator / Station',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : (row.machineId || 'Floor')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (row) => (
        <Link href={`/gauze-production/batches/${row.productionBatchId}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            Open Batch
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
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
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Cutting & Folding Internal Processing Station
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Convert bleached gauze fabric through precision pinning, folding, and cutting operations.
            </p>
          </div>
        </div>
      </div>

      {/* Active Batches Waiting for Cutting & Folding (Gamjee-style queue) */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Scissors className="h-4 w-4 text-indigo-500" />
              Batches Awaiting Cutting & Folding
            </h3>
            <p className="text-xs text-muted-foreground">
              Select a bleached fabric batch to record pinning, folding, and cutting operations with live yield calculations.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
            {processingBatches.length} Active Batches
          </span>
        </div>

        {processingBatches.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
            No bleached batches currently waiting for cutting and folding.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processingBatches.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-border bg-secondary/20 hover:border-indigo-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-foreground">{b.batchNumber}</span>
                  <BatchStatusBadge status={b.status} size="sm" />
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-foreground truncate">{b.product?.name}</h4>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Available: {Number(b.currentQuantity).toLocaleString()} {b.currentUom}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                  <Link
                    href={`/gauze-production/batches/${b.id}`}
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Details
                  </Link>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
                    onClick={() => setSelectedBatchForOp(b)}
                  >
                    <Scissors className="h-3 w-3" />
                    <span>Record Cutting & Folding</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Filters Toolbar */}
      <Card className="p-4 bg-card border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search operation #, batch #, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <Select
            value={opTypeFilter}
            onChange={(e) => setOpTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Operation Types' },
              ...(masters?.operationTypes || []).map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        </div>
      </Card>

      {/* Operations Table */}
      <Card className="p-4 bg-card border-border">
        <Table<any>
          data={filteredOperations}
          columns={columns}
          keyExtractor={(op) => op.id}
          isLoading={isLoading}
          emptyMessage="No internal processing operations found."
        />
      </Card>

      {/* Cutting & Folding Modal */}
      {selectedBatchForOp && (
        <AddOperationModal
          batch={selectedBatchForOp}
          isOpen={true}
          onClose={() => setSelectedBatchForOp(null)}
          onSuccess={() => {
            setSelectedBatchForOp(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
