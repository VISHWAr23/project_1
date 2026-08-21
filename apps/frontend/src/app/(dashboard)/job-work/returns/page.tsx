'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Search, ArrowLeft, Calendar, User, Scale, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, Column } from '@/components/ui/table';
import { useReturnRegister } from '@/hooks/useJobWork';
import { JobWorkReturnItem } from '@/types/job-work.types';
import Link from 'next/link';

export default function DigitalReturnRegisterPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useReturnRegister({ search: search || undefined });

  const items = data?.items || [];

  const columns: Column<JobWorkReturnItem>[] = [
    {
      key: 'returnedDate',
      header: 'Return Date',
      width: '130px',
      render: (row) => (
        <span className="font-mono text-xs text-foreground font-medium whitespace-nowrap">
          {new Date(row.returnedDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'rollNumber',
      header: 'Roll Number',
      render: (row) => (
        <span className="font-mono font-bold text-primary">{row.rollNumber}</span>
      ),
    },
    {
      key: 'jobWorkOrder',
      header: 'Order & Vendor',
      render: (row) => (
        <div>
          <Link href={`/job-work/${row.jobWorkOrder?.id}`} className="font-mono text-xs font-semibold text-foreground hover:underline block">
            {row.jobWorkOrder?.jobWorkNumber}
          </Link>
          <span className="text-[11px] text-muted-foreground">{row.jobWorkOrder?.jobWorkCompany?.companyName}</span>
        </div>
      ),
    },
    {
      key: 'finishedProduct',
      header: 'Returned Product',
      render: (row) => (
        <div>
          <span className="text-foreground font-medium block text-xs">{row.finishedProduct?.name}</span>
          <span className="text-[11px] text-muted-foreground font-mono">SKU: {row.finishedProduct?.sku}</span>
        </div>
      ),
    },
    {
      key: 'returnedWeight',
      header: 'Net Weight (Kg)',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-emerald-400 font-bold text-xs">
          {Number(row.returnedWeight).toFixed(2)} Kg
        </span>
      ),
    },
    {
      key: 'wastageWeight',
      header: 'Scrap / Waste',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-amber-400 text-xs">
          {Number(row.wastageWeight).toFixed(2)} Kg
        </span>
      ),
    },
    {
      key: 'remarks',
      header: 'Remarks & User',
      render: (row) => (
        <div>
          <span className="text-xs text-foreground block">{row.remarks || '-'}</span>
          <span className="text-[11px] text-muted-foreground font-mono">{row.receivedByUser?.email || 'System'}</span>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Job Work
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-emerald-400" />
              Digital Return Register
            </h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Roll #, Work Order No, or Vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Return Log Table */}
      <Table
        columns={columns}
        data={items}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
