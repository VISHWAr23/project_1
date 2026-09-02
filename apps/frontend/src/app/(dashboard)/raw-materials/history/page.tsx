'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, ArrowLeft, Filter, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useGlobalStockHistory, useRawMaterials } from '@/hooks/useRawMaterials';
import { StockHistoryLedger } from '@/components/raw-materials/StockHistoryLedger';

export default function GlobalStockHistoryPage() {
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: rawMaterials } = useRawMaterials({ limit: 100 });
  const { data, isLoading } = useGlobalStockHistory({
    rawMaterialId: selectedMaterialId || undefined,
    transactionType: selectedTransactionType || undefined,
    page: currentPage,
    limit: 15,
  });

  const transactions = data?.items || [];

  const isFG = (m: any) =>
    m.sku?.startsWith('FP-') ||
    m.sku?.startsWith('FG-') ||
    m.category?.name?.toLowerCase().includes('dressing') ||
    m.category?.name?.toLowerCase().includes('care') ||
    m.category?.name?.toLowerCase().includes('finished');

  const materialFilterOptions = [
    { label: 'All Inventory Items (RM & FG)', value: '' },
    ...(rawMaterials?.items.map((m) => ({
      label: `[${isFG(m) ? 'FG' : 'RM'}] ${m.sku} - ${m.name}`,
      value: m.id,
    })) || []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link href="/raw-materials">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Stock Movement Audit History Ledger
            </h1>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-secondary/20 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#3ECF8E]" /> Filter Audit Ledger
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedMaterialId('');
              setSelectedTransactionType('');
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            options={materialFilterOptions}
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
          />

          <Select
            options={[
              { label: 'All Transaction Types', value: '' },
              { label: 'Purchase Receipt', value: 'PURCHASE_RECEIPT' },
              { label: 'Stock Add', value: 'ADJUSTMENT_ADD' },
              { label: 'Job Work Return', value: 'JOB_WORK_RETURN' },
              { label: 'Work Order Issue', value: 'WORK_ORDER_ISSUE' },
              { label: 'Job Work Dispatch', value: 'JOB_WORK_DISPATCH' },
              { label: 'Stock Subtract', value: 'ADJUSTMENT_SUBTRACT' },
              { label: 'Transfer', value: 'TRANSFER' },
              { label: 'Manual Correction', value: 'MANUAL_CORRECTION' },
            ]}
            value={selectedTransactionType}
            onChange={(e) => setSelectedTransactionType(e.target.value)}
          />

        </div>
      </div>

      {(() => {
        const selectedMat = rawMaterials?.items.find((m) => m.id === selectedMaterialId);
        return (
          <StockHistoryLedger
            items={transactions}
            unitAbbreviation={selectedMat?.unit?.abbreviation || 'Units'}
          />
        );
      })()}

      <Pagination
        currentPage={currentPage}
        totalPages={data?.meta?.totalPages || 1}
        totalRecords={data?.meta?.total || transactions.length}
        pageSize={15}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </motion.div>
  );
}
