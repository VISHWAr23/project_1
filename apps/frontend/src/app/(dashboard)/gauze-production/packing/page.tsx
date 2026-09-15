'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, Column } from '@/components/ui/table';
import { useGauzeBatches } from '@/hooks/useGauzeProduction';
import { GauzePackingItem } from '@/types/gauze-production.types';
import { formatDate } from '@/lib/date-utils';

export default function GauzePackingRegisterPage() {
  const [search, setSearch] = useState('');
  const { data: batchesData, isLoading } = useGauzeBatches({ limit: 50 });
  const batches = batchesData?.items || [];

  // Flatten packing entries
  const allPacking = batches.flatMap((b) =>
    (b.packingEntries || []).map((pk) => ({
      ...pk,
      batchNumber: b.batchNumber,
    }))
  );

  const filteredPacking = allPacking.filter((pk) => {
    return (
      !search ||
      pk.packingNumber.toLowerCase().includes(search.toLowerCase()) ||
      pk.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      pk.product.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const columns: Column<any>[] = [
    {
      key: 'packingNumber',
      header: 'Packing Number',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
            {row.packingNumber}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {formatDate(row.packingDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'batchNumber',
      header: 'Production Batch',
      render: (row) => (
        <Link
          href={`/gauze-production/batches/${row.productionBatchId}`}
          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {row.batchNumber}
        </Link>
      ),
    },
    {
      key: 'product',
      header: 'Finished Product',
      render: (row) => (
        <div>
          <strong className="text-foreground text-xs block">{row.product.name}</strong>
          <span className="text-[11px] text-muted-foreground font-mono">
            {row.sizeDescription || 'Standard'} {row.ply ? `(${row.ply}-Ply)` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'packs',
      header: 'Packs Produced',
      align: 'right',
      render: (row) => (
        <div className="font-mono text-xs">
          <strong>{row.numberOfPacks} packs</strong>
          <span className="text-[10px] text-muted-foreground block font-sans">
            @{row.piecesPerPack} pcs/pack
          </span>
        </div>
      ),
    },
    {
      key: 'totalPieces',
      header: 'Total Units (Stock Added)',
      align: 'right',
      render: (row) => (
        <strong className="font-mono text-xs text-emerald-600 dark:text-emerald-400 text-sm">
          {Number(row.totalPieces).toLocaleString()} pcs
        </strong>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse Destination',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.finishedGoodsWarehouse?.name || 'Finished Goods Warehouse'}
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
        <div className="flex items-center gap-3">
          <Link href="/gauze-production">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Back to Gauze Production">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Box className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Finished Goods Packing Register
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track boxed, poly-bagged, and dispatched finished goods ready for warehouse delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <Card className="p-4 bg-card border-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packing #, product name, batch #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4 bg-card border-border">
        <Table<any>
          data={filteredPacking}
          columns={columns}
          keyExtractor={(pk) => pk.id}
          isLoading={isLoading}
          emptyMessage="No packing entries found."
        />
      </Card>
    </div>
  );
}
