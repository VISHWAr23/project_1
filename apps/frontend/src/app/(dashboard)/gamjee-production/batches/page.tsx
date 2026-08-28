'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGamjeeBatches, useGamjeeMasters } from '@/hooks/useGamjeeProduction';
import { GamjeeBatchStatusBadge } from '@/components/gamjee-production/batch-status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export default function GamjeeBatchesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data: masters } = useGamjeeMasters();
  const { data: batchesData, isLoading } = useGamjeeBatches({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    gamjeeSizeId: sizeFilter !== 'ALL' ? sizeFilter : undefined,
    page,
    limit: 15,
  });

  const batches = batchesData?.items || [];
  const meta = batchesData?.meta;
  const sizes = masters?.sizes || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/gamjee-production">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Gamjee Production Batches
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Search, filter, and track all Gamjee Roll production jobs across factory floor stages.
          </p>
        </div>

        <Link href="/gamjee-production/batches/new">
          <Button size="sm" className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Create New Batch</span>
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batch #, product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="MATERIALS_SELECTED">Materials Issued</option>
              <option value="PINNING">Pinning</option>
              <option value="FOLDING">Folding</option>
              <option value="CUTTING">Cutting</option>
              <option value="READY_FOR_ROLLING">Ready for Rolling</option>
              <option value="ROLLING">Rolling</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div>
            <select
              value={sizeFilter}
              onChange={(e) => {
                setSizeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Gamjee Sizes</option>
              {sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Batches Table */}
      <Card className="p-5 bg-card border-border">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : batches.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-semibold text-foreground">No Batches Match Your Criteria</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search query or status filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setSizeFilter('ALL');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-y border-border">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Batch Number</th>
                  <th className="px-3 py-2.5 font-semibold">Finished Product</th>
                  <th className="px-3 py-2.5 font-semibold">Size</th>
                  <th className="px-3 py-2.5 font-semibold">Current Stage</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-3 py-2.5 font-semibold">WIP / Finished Qty</th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-3 font-mono font-bold">
                      <Link
                        href={`/gamjee-production/batches/${b.id}`}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {b.batchNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3 font-semibold text-foreground">{b.finishedProduct?.name}</td>
                    <td className="px-3 py-3 text-muted-foreground font-mono">
                      {b.gamjeeSize?.name || 'Standard'}
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded bg-secondary text-[11px] font-medium">
                        {b.currentStage}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <GamjeeBatchStatusBadge status={b.status} />
                    </td>
                    <td className="px-3 py-3 font-mono">
                      {b.status === 'COMPLETED' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {b.productionQuantity || 0} Rolls
                        </span>
                      ) : (
                        <span>
                          {Number(b.currentQuantity)} {b.currentUom || 'm'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-muted-foreground">
                      {formatDate(b.productionDate)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link href={`/gamjee-production/batches/${b.id}`}>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs">
                          Open Hub
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4 text-xs">
            <span className="text-muted-foreground">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} total batches)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
