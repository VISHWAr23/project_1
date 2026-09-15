'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Scale,
  Building2,
  Calendar,
  ExternalLink,
  PackageCheck,
  Plus,
  Layers,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWeavingReturnRegister, useJobWorkOrders } from '@/hooks/useJobWork';
import { WeavingReceivedItem } from '@/types/job-work.types';
import { formatDate } from '@/lib/date-utils';

export default function WeavingReceivedProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMill, setSelectedMill] = useState<string>('ALL');
  const [selectedForm, setSelectedForm] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'weight_desc'>('date_desc');

  // Primary: dedicated API query
  const { data: apiData, isLoading: loadingApi } = useWeavingReturnRegister({ limit: 100 });

  // Fallback: job work orders query
  const { data: jobWorkData, isLoading: loadingOrders } = useJobWorkOrders({ limit: 100 });

  const isLoading = loadingApi && loadingOrders;

  // Consolidate data: either from API response or extracted from loaded orders
  const allItems: Array<WeavingReceivedItem & { jobWorkOrder?: any }> = useMemo(() => {
    if (apiData?.items && apiData.items.length > 0) {
      return apiData.items;
    }

    const list: Array<WeavingReceivedItem & { jobWorkOrder?: any }> = [];
    const orders = jobWorkData?.items || [];
    orders.forEach((order: any) => {
      if (order.jobWorkType === 'WEAVING' && Array.isArray(order.weavingReceivedItems)) {
        order.weavingReceivedItems.forEach((item: any) => {
          list.push({
            ...item,
            jobWorkOrder: order,
          });
        });
      }
    });
    return list;
  }, [apiData?.items, jobWorkData?.items]);

  // Unique mills for filter dropdown
  const uniqueMills = useMemo(() => {
    const millsMap = new Map<string, string>();
    allItems.forEach((item) => {
      const company = item.jobWorkOrder?.jobWorkCompany;
      if (company?.id && company?.companyName) {
        millsMap.set(company.id, company.companyName);
      }
    });
    return Array.from(millsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [allItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...allItems];

    // Filter by mill
    if (selectedMill !== 'ALL') {
      result = result.filter(
        (item) => item.jobWorkOrder?.jobWorkCompany?.id === selectedMill
      );
    }

    // Filter by packaging form (Roll or Than)
    if (selectedForm !== 'ALL') {
      result = result.filter(
        (item) => (item.rollOrThan || 'Roll').toLowerCase() === selectedForm.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.inPassNumber?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.rollOrThan?.toLowerCase().includes(q) ||
          item.jobWorkOrder?.jobWorkNumber?.toLowerCase().includes(q) ||
          item.jobWorkOrder?.jobWorkCompany?.companyName?.toLowerCase().includes(q) ||
          item.wastageDescription?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'weight_desc') {
        return Number(b.weightKg || 0) - Number(a.weightKg || 0);
      }
      // Default: date_desc
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [allItems, selectedMill, selectedForm, searchTerm, sortBy]);

  // KPI Summary calculations
  const totalWeight = filteredItems.reduce(
    (sum, item) => sum + Number(item.weightKg || 0),
    0
  );
  const totalWastage = filteredItems.reduce(
    (sum, item) => sum + Number(item.wastageWeightKg || 0),
    0
  );
  const totalLengthMeters = filteredItems.reduce(
    (sum, item) => sum + Number(item.lengthMeters || 0),
    0
  );
  const totalConsignments = filteredItems.length;
  const totalActiveMills = new Set(
    filteredItems.map((item) => item.jobWorkOrder?.jobWorkCompany?.id).filter(Boolean)
  ).size;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/weaving-production">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Weaving Hub
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <PackageCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <span>Weaving Received Products</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                In-Pass Ledger
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive register of all woven fabric deliveries and gate pass receipts from subcontract mills
            </p>
          </div>
        </div>

        {/* Top Header Buttons: Back to Orders | Weaving Mills | New Order */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link href="/weaving-production" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" fullWidth className="h-9 gap-1.5 text-xs">
              <Layers className="h-4 w-4 text-lime-600 dark:text-lime-400" />
              <span>Weaving Orders</span>
            </Button>
          </Link>

          <Link href="/job-work/vendors" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" fullWidth className="h-9 gap-1.5 text-xs">
              <Building2 className="h-4 w-4 text-lime-600 dark:text-lime-400" />
              <span>Weaving Mills</span>
            </Button>
          </Link>

          <Link href="/job-work/weaving/new" className="flex-1 sm:flex-initial">
            <Button size="sm" fullWidth className="h-9 gap-1.5 text-xs bg-lime-600 hover:bg-lime-700 text-white font-bold shadow-xs">
              <Plus className="h-4 w-4" />
              <span>New Weaving Order</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 bg-card border-border border-l-4 border-l-emerald-500 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Received Fabric</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {totalWeight.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Kg</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-card border-border border-l-4 border-l-amber-500 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Reported Wastage</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {totalWastage.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Kg</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-card border-border border-l-4 border-l-blue-500 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">In-Pass Deliveries</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PackageCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {totalConsignments}
            </span>
            <span className="text-xs text-muted-foreground font-sans">lots</span>
          </div>
        </Card>

        <Card className="p-3.5 bg-card border-border border-l-4 border-l-lime-500 hover:border-lime-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Delivering Mills</span>
            <div className="w-7 h-7 rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400 flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {totalActiveMills}
            </span>
            <span className="text-xs text-muted-foreground font-sans">mills</span>
          </div>
        </Card>
      </div>

      {/* Main Received Products Card */}
      <Card className="p-4 sm:p-5 border-border space-y-4">
        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-secondary/30 p-3 rounded-lg border border-border">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by In-Pass #, Order #, Mill, or Fabric..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filters: Mill Dropdown, Packaging Form, & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            {uniqueMills.length > 0 && (
              <select
                value={selectedMill}
                onChange={(e) => setSelectedMill(e.target.value)}
                className="h-9 px-3 py-1 text-xs rounded-md bg-background border border-border text-foreground font-sans focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Weaving Mills ({uniqueMills.length})</option>
                {uniqueMills.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="h-9 px-3 py-1 text-xs rounded-md bg-background border border-border text-foreground font-sans focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Forms (Roll / Than)</option>
              <option value="Roll">Rolls (ரோல்)</option>
              <option value="Than">Thans (தான்)</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 px-3 py-1 text-xs rounded-md bg-background border border-border text-foreground font-sans focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="date_desc">Newest Delivery First</option>
              <option value="date_asc">Oldest Delivery First</option>
              <option value="weight_desc">Heaviest Delivery First</option>
            </select>
          </div>
        </div>

        {/* Data Table with Clean, Fixed Alignments */}
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[950px]">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3 w-32 text-left">Receipt Date</th>
                <th className="p-3 w-36 text-left">In-Pass Number</th>
                <th className="p-3 w-36 text-left">Order Number</th>
                <th className="p-3 min-w-[170px] text-left">Weaving Mill</th>
                <th className="p-3 min-w-[200px] text-left">Fabric Description & Specs</th>
                <th className="p-3 w-28 text-center">Form & Length</th>
                <th className="p-3 w-32 text-right">Net Weight</th>
                <th className="p-3 w-32 text-right">Wastage</th>
                <th className="p-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item: any, idx: number) => {
                const order = item.jobWorkOrder;
                const detail = order?.weavingDetail;

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* # */}
                    <td className="p-3 w-12 text-center align-middle text-muted-foreground font-mono">
                      {idx + 1}
                    </td>

                    {/* Receipt Date */}
                    <td className="p-3 w-32 text-left align-middle font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                        <span className="text-foreground">{formatDate(item.date)}</span>
                      </div>
                    </td>

                    {/* In-Pass Number */}
                    <td className="p-3 w-36 text-left align-middle whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {item.inPassNumber}
                      </span>
                    </td>

                    {/* Order Number */}
                    <td className="p-3 w-36 text-left align-middle font-mono whitespace-nowrap">
                      {order ? (
                        <Link
                          href={`/job-work/${order.id}`}
                          className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                          title="View order details"
                        >
                          <span>{order.jobWorkNumber}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Weaving Mill */}
                    <td className="p-3 min-w-[170px] text-left align-middle font-sans">
                      <strong className="text-foreground block font-medium">
                        {order?.jobWorkCompany?.companyName || 'Subcontractor'}
                      </strong>
                      {order?.jobWorkCompany?.phone && (
                        <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                          {order.jobWorkCompany.phone}
                        </span>
                      )}
                    </td>

                    {/* Fabric Description & Specs */}
                    <td className="p-3 min-w-[200px] text-left align-middle font-sans">
                      <span className="text-foreground block font-medium">
                        {item.description}
                      </span>
                      {detail && (
                        <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                          {detail.ends}E × {detail.reed}R, {detail.pick}P • {Number(detail.weftCount).toFixed(0)}s count
                        </span>
                      )}
                    </td>

                    {/* Form & Length */}
                    <td className="p-3 w-28 text-center align-middle font-sans">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.rollOrThan === 'Than'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {item.rollOrThan || 'Roll'}
                        </span>
                        {item.lengthMeters ? (
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {Number(item.lengthMeters).toFixed(1)} m
                          </span>
                        ) : null}
                        {item.bleachingJobWorkOrderId || item.isBleached ? (
                          <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>Bleached</span>
                          </span>
                        ) : (
                          <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Ready
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Net Weight */}
                    <td className="p-3 w-32 text-right align-middle font-mono">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                        {Number(item.weightKg).toFixed(2)} Kg
                      </span>
                    </td>

                    {/* Wastage */}
                    <td className="p-3 w-32 text-right align-middle font-mono">
                      <span className="font-bold text-amber-600 dark:text-amber-400 block">
                        {Number(item.wastageWeightKg).toFixed(2)} Kg
                      </span>
                      {item.wastageDescription && (
                        <span
                          className="text-[10px] text-muted-foreground font-sans block mt-0.5 truncate max-w-[140px] ml-auto text-right"
                          title={item.wastageDescription}
                        >
                          {item.wastageDescription}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 w-28 text-center align-middle font-sans">
                      <div className="flex items-center justify-center gap-1">
                        {order && (
                          <Link href={`/job-work/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 text-primary">
                              <span>Order</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </Button>
                          </Link>
                        )}
                        {item.bleachingJobWorkOrderId ? (
                          <Link href={`/job-work/${item.bleachingJobWorkOrderId}`}>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 gap-0.5">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>Bleach</span>
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/job-work/bleaching/new">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 gap-0.5">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>Bleach</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-muted-foreground font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Inbox className="h-8 w-8 text-muted-foreground/40 stroke-1" />
                      <p className="text-sm font-medium">
                        {isLoading
                          ? 'Loading received products...'
                          : searchTerm || selectedMill !== 'ALL' || selectedForm !== 'ALL'
                          ? 'No received items match your search or filter.'
                          : 'No in-pass delivery records registered yet.'}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Received woven fabrics logged via the In-Pass intake will appear in this ledger.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer with Exact Alignments */}
            {filteredItems.length > 0 && (
              <tfoot className="bg-muted/40 font-mono font-bold border-t border-border text-xs">
                <tr>
                  <td colSpan={6} className="p-3 text-right text-muted-foreground font-sans pr-4">
                    Cumulative Total ({filteredItems.length} in-pass deliveries):
                  </td>
                  <td className="p-3 text-center text-sky-600 dark:text-sky-400 text-xs font-mono font-bold">
                    {totalLengthMeters > 0 ? `${totalLengthMeters.toFixed(1)} m` : '-'}
                  </td>
                  <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                    {totalWeight.toFixed(2)} Kg
                  </td>
                  <td className="p-3 text-right text-amber-600 dark:text-amber-400 text-sm font-mono">
                    {totalWastage.toFixed(2)} Kg
                  </td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground font-sans">
          <span>
            Showing <strong className="font-mono text-foreground">{filteredItems.length}</strong> of{' '}
            <strong className="font-mono text-foreground">{allItems.length}</strong> total deliveries
          </span>
          <Link href="/weaving-production">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Orders</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
