'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Scissors,
  Search,
  Filter,
  ArrowRight,
  Plus,
  Factory,
  User,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Column } from '@/components/ui/table';
import { useGauzeBatches, useGauzeMasters } from '@/hooks/useGauzeProduction';
import { GauzeOperationItem } from '@/types/gauze-production.types';
import { formatDate } from '@/lib/date-utils';

export default function GauzeProcessingPage() {
  const [search, setSearch] = useState('');
  const [opTypeFilter, setOpTypeFilter] = useState('ALL');

  const { data: masters } = useGauzeMasters();
  const { data: batchesData, isLoading } = useGauzeBatches({ limit: 50 });
  const batches = batchesData?.items || [];

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
        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-bold text-xs">
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Internal Processing Register
          </h1>
        </div>

      </div>

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

      {/* Table */}
      <Card className="p-4 bg-card border-border">
        <Table<any>
          data={filteredOperations}
          columns={columns}
          keyExtractor={(op) => op.id}
          isLoading={isLoading}
          emptyMessage="No internal processing operations found."
        />
      </Card>
    </div>
  );
}
