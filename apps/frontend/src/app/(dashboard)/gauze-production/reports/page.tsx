'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileBarChart,
  Printer,
  Download,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Truck,
  Sparkles,
  Layers,
  Box,
  CheckCircle2,
  TrendingDown,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, Column } from '@/components/ui/table';
import { useGauzeReports } from '@/hooks/useGauzeProduction';
import { formatDate } from '@/lib/date-utils';

export default function GauzeReportsPage() {
  const [reportType, setReportType] = useState<
    'batches' | 'bleaching' | 'vendor-pending' | 'wastage' | 'finished-goods'
  >('batches');
  const [search, setSearch] = useState('');

  const { data: reportData = [], isLoading } = useGauzeReports(reportType);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).filter((k) => typeof reportData[0][k] !== 'object');
    const csvRows = [
      headers.join(','),
      ...reportData.map((row: any) =>
        headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gauze_production_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
              <FileBarChart className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Gauze Production Intelligence & Audit Reports
            </h1>
          </div>
        </div>


        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'batches', label: '1. Production Batches', icon: FileBarChart },
          { id: 'bleaching', label: '2. Bleaching Jobs', icon: Truck },
          { id: 'vendor-pending', label: '3. Vendor Balances', icon: Building2 },
          { id: 'wastage', label: '4. Wastage & Yield %', icon: TrendingDown },
          { id: 'finished-goods', label: '5. Finished Goods', icon: Box },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Icon className="h-4 w-4 mb-2" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <Card className="p-5 bg-card border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground capitalize">
            {reportType.replace('-', ' ')} Summary
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {reportData.length} records generated
          </span>
        </div>

        {/* 1. Batches Report */}
        {reportType === 'batches' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Batch Number</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3 text-right">Input Qty</th>
                  <th className="py-2.5 px-3 text-right">Current Qty</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {reportData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">
                      <Link href={`/gauze-production/batches/${row.id}`} className="hover:underline">
                        {row.batchNumber}
                      </Link>
                    </td>
                    <td className="py-2 px-3 font-sans text-foreground">{row.product?.name}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.gauzeType?.name || 'BP17'}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.gauzeSize?.name || '120 cm x 20 m'}</td>
                    <td className="py-2 px-3 text-right">{Number(row.inputQuantity).toLocaleString()} {row.inputUom}</td>
                    <td className="py-2 px-3 text-right font-bold text-foreground">{Number(row.currentQuantity).toLocaleString()} {row.currentUom}</td>
                    <td className="py-2 px-3 font-sans font-semibold">{row.currentStage}</td>
                    <td className="py-2 px-3">{row.status}</td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {formatDate(row.productionStartDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Bleaching Report */}
        {reportType === 'bleaching' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Job Number</th>
                  <th className="py-2.5 px-3">Batch Number</th>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Bleaching Type</th>
                  <th className="py-2.5 px-3 text-right">Sent Qty</th>
                  <th className="py-2.5 px-3 text-right">Received Qty</th>
                  <th className="py-2.5 px-3 text-right">Wastage</th>
                  <th className="py-2.5 px-3 text-right">Rejected</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Sent Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {reportData.map((row: any) => {
                  const received = (row.receipts || []).reduce((s: number, r: any) => s + Number(r.quantityReceived), 0);
                  const wastage = (row.receipts || []).reduce((s: number, r: any) => s + Number(r.wastageQuantity), 0);
                  const rejected = (row.receipts || []).reduce((s: number, r: any) => s + Number(r.rejectedQuantity), 0);
                  return (
                    <tr key={row.id} className="hover:bg-secondary/20">
                      <td className="py-2 px-3 font-bold text-foreground">{row.jobNumber}</td>
                      <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">
                        {row.productionBatch?.batchNumber}
                      </td>
                      <td className="py-2 px-3 font-sans">{row.vendor?.companyName}</td>
                      <td className="py-2 px-3 text-muted-foreground">{row.bleachingType?.name}</td>
                      <td className="py-2 px-3 text-right">{Number(row.quantitySent).toLocaleString()} {row.uom}</td>
                      <td className="py-2 px-3 text-right text-teal-600 dark:text-teal-400 font-bold">{received.toLocaleString()} {row.uom}</td>
                      <td className="py-2 px-3 text-right text-rose-600">{wastage.toLocaleString()} {row.uom}</td>
                      <td className="py-2 px-3 text-right text-orange-600">{rejected.toLocaleString()} {row.uom}</td>
                      <td className="py-2 px-3 font-sans font-semibold">{row.status}</td>
                      <td className="py-2 px-3 text-muted-foreground">{formatDate(row.sentDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Vendor Pending Stock Report */}
        {reportType === 'vendor-pending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Vendor / Mill Name</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3 text-right">Total Sent</th>
                  <th className="py-2.5 px-3 text-right">Total Returned</th>
                  <th className="py-2.5 px-3 text-right">Total Wastage</th>
                  <th className="py-2.5 px-3 text-right">Total Rejected</th>
                  <th className="py-2.5 px-3 text-right">Current Stock Held</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {reportData.map((row: any) => (
                  <tr key={row.vendorId} className="hover:bg-secondary/20">
                    <td className="py-2.5 px-3 font-sans font-bold text-foreground">{row.vendorName}</td>
                    <td className="py-2.5 px-3 font-sans text-muted-foreground">{row.contactPerson || '—'}</td>
                    <td className="py-2.5 px-3 text-right">{row.totalSent.toLocaleString()} m</td>
                    <td className="py-2.5 px-3 text-right text-teal-600 dark:text-teal-400 font-bold">{row.totalReceived.toLocaleString()} m</td>
                    <td className="py-2.5 px-3 text-right text-rose-600">{row.totalWastage.toLocaleString()} m</td>
                    <td className="py-2.5 px-3 text-right text-orange-600">{row.totalRejected.toLocaleString()} m</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {row.pendingQuantity.toLocaleString()} m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Wastage & Yield Report */}
        {reportType === 'wastage' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Batch Number</th>
                  <th className="py-2.5 px-3">Stage / Process</th>
                  <th className="py-2.5 px-3 text-right">Input Qty</th>
                  <th className="py-2.5 px-3 text-right">Output Qty</th>
                  <th className="py-2.5 px-3 text-right">Wastage</th>
                  <th className="py-2.5 px-3 text-right">Rejected</th>
                  <th className="py-2.5 px-3 text-right">Wastage %</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {reportData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">{row.batchNumber}</td>
                    <td className="py-2 px-3 font-sans text-foreground">{row.stage}</td>
                    <td className="py-2 px-3 text-right">{row.input.toLocaleString()} m</td>
                    <td className="py-2 px-3 text-right text-teal-600 dark:text-teal-400 font-bold">{row.output.toLocaleString()} m</td>
                    <td className="py-2 px-3 text-right text-rose-600">{row.wastage.toLocaleString()} m</td>
                    <td className="py-2 px-3 text-right text-orange-600">{row.rejected.toLocaleString()} m</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-600">
                      {Number(row.wastagePercent).toFixed(2)}%
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{formatDate(row.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Finished Goods Report */}
        {reportType === 'finished-goods' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Packing Number</th>
                  <th className="py-2.5 px-3">Source Batch</th>
                  <th className="py-2.5 px-3">Finished Product</th>
                  <th className="py-2.5 px-3">Dimensions / Ply</th>
                  <th className="py-2.5 px-3 text-right">Packs Produced</th>
                  <th className="py-2.5 px-3 text-right">Units / Pack</th>
                  <th className="py-2.5 px-3 text-right">Total Stock Units</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {reportData.map((row: any) => (
                  <tr key={row.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">{row.packingNumber}</td>
                    <td className="py-2 px-3 font-bold text-blue-600 dark:text-blue-400">{row.productionBatch?.batchNumber}</td>
                    <td className="py-2 px-3 font-sans text-foreground">{row.product?.name}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.sizeDescription || 'Standard'} {row.ply ? `(${row.ply}-Ply)` : ''}</td>
                    <td className="py-2 px-3 text-right font-bold">{row.numberOfPacks} packs</td>
                    <td className="py-2 px-3 text-right text-muted-foreground">{row.piecesPerPack} pcs</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {Number(row.totalPieces).toLocaleString()} pcs
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{formatDate(row.packingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
