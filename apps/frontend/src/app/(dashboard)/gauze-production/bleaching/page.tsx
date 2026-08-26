'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Sparkles,
  Building2,
  Search,
  Filter,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Column } from '@/components/ui/table';
import { useGauzeBleachingJobs, useVendorHeldStock } from '@/hooks/useGauzeProduction';
import { useJobWorkCompanies } from '@/hooks/useJobWork';
import { GauzeBleachingJobItem } from '@/types/gauze-production.types';
import { formatDate } from '@/lib/date-utils';

export default function GauzeBleachingJobsPage() {
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'jobs' | 'vendors'>('jobs');

  const { data: companies = [] } = useJobWorkCompanies();
  const { data: jobs = [], isLoading: jobsLoading } = useGauzeBleachingJobs({
    search: search || undefined,
    vendorId: vendorFilter !== 'ALL' ? vendorFilter : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });
  const { data: vendorStock = [], isLoading: vendorLoading } = useVendorHeldStock();

  const jobColumns: Column<GauzeBleachingJobItem>[] = [
    {
      key: 'jobNumber',
      header: 'Job Order No',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-foreground block">{row.jobNumber}</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            Sent: {formatDate(row.sentDate)}
          </span>
        </div>
      ),
    },
    {
      key: 'productionBatch',
      header: 'Production Batch',
      render: (row) => (
        <div>
          {row.productionBatch ? (
            <Link
              href={`/gauze-production/batches/${row.productionBatchId}`}
              className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {row.productionBatch.batchNumber}
            </Link>
          ) : (
            <span className="font-mono">{row.productionBatchId}</span>
          )}
          <span className="text-[11px] text-muted-foreground block truncate">
            {row.productionBatch?.product?.name}
          </span>
        </div>
      ),
    },
    {
      key: 'vendor',
      header: 'Subcontractor / Process',
      render: (row) => (
        <div>
          <strong className="text-foreground text-xs block">{row.vendor.companyName}</strong>
          <span className="text-[11px] text-muted-foreground font-mono">{row.bleachingType.name}</span>
        </div>
      ),
    },
    {
      key: 'quantitySent',
      header: 'Quantity Sent',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {Number(row.quantitySent).toLocaleString()} {row.uom}
        </span>
      ),
    },
    {
      key: 'receipts',
      header: 'Received Return',
      align: 'right',
      render: (row) => {
        const receivedSum = row.receipts.reduce((s, r) => s + Number(r.quantityReceived), 0);
        const isComplete = receivedSum >= Number(row.quantitySent);
        return (
          <div className="font-mono text-xs">
            <strong className={isComplete ? 'text-emerald-600' : 'text-amber-600'}>
              {receivedSum.toLocaleString()} {row.uom}
            </strong>
            {row.receipts.length > 0 && (
              <span className="text-[10px] text-muted-foreground block">
                {row.receipts.length} delivery receipt(s)
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
          row.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
        }`}>
          {row.status}
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
            <Truck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Bleaching Subcontractor Register
          </h1>
        </div>


        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'jobs' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Dispatched Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'vendors' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Vendor Stock Tracker ({vendorStock.length})
          </button>
        </div>
      </div>

      {activeTab === 'jobs' ? (
        <>
          {/* Filters Toolbar */}
          <Card className="p-4 bg-card border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job #, vendor, batch #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <Select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Bleaching Vendors' },
                  ...companies.map((c: any) => ({ value: c.id, label: c.companyName })),
                ]}
              />

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'SENT', label: 'SENT — In Transit / Processing' },
                  { value: 'COMPLETED', label: 'COMPLETED — Returned to Warehouse' },
                ]}
              />
            </div>
          </Card>

          {/* Jobs Table */}
          <Card className="p-4 bg-card border-border">
            <Table<GauzeBleachingJobItem>
              data={jobs}
              columns={jobColumns}
              keyExtractor={(j) => j.id}
              isLoading={jobsLoading}
              emptyMessage="No bleaching job work orders match the criteria."
            />
          </Card>
        </>
      ) : (
        /* Vendor Stock Tracker View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorStock.map((vs) => (
              <Card key={vs.vendorId} className="p-5 bg-card border-border space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{vs.vendorName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {vs.contactPerson || 'Vendor'} • {vs.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock Numbers */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-sans">Total Dispatched</span>
                    <strong className="text-foreground text-sm">{vs.totalSent.toLocaleString()} m</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-sans">Returned Good</span>
                    <strong className="text-teal-600 dark:text-teal-400 text-sm">{vs.totalReceived.toLocaleString()} m</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-sans">Wastage / Scrap</span>
                    <strong className="text-rose-600 dark:text-rose-400">{(vs.totalWastage + vs.totalRejected).toLocaleString()} m</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 block font-sans font-bold">Currently Pending</span>
                    <strong className="text-amber-600 dark:text-amber-400 text-base font-bold">
                      {vs.pendingQuantity.toLocaleString()} m
                    </strong>
                  </div>
                </div>

                {/* Jobs summary */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold text-muted-foreground block uppercase font-mono">
                    Active Job Dispatches ({vs.jobs.length})
                  </span>
                  {vs.jobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="p-2 bg-secondary/20 rounded border border-border/50 flex items-center justify-between text-[11px] font-mono"
                    >
                      <div>
                        <strong className="text-foreground block">{job.jobNumber}</strong>
                        <span className="text-[10px] text-muted-foreground">Batch: {job.batchNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-600">{job.pendingQuantity} m pending</span>
                        <span className="text-[10px] text-muted-foreground block">
                          Sent: {formatDate(job.sentDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
