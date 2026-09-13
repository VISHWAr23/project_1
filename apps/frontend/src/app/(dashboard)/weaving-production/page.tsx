'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Package,
  RefreshCw,
  Scale,
  Search,
  Coins,
  Sparkles,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJobWorkOrders } from '@/hooks/useJobWork';
import { JobWorkStatusBadge } from '@/components/job-work/job-work-status-badge';
import { formatDate } from '@/lib/date-utils';

export default function WeavingProductionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const { data: jobWorkData, isLoading } = useJobWorkOrders({ limit: 100 });

  // Filter only Weaving orders
  const allWeavingOrders = useMemo(() => {
    return (
      jobWorkData?.items?.filter((o: any) => o.jobWorkType === 'WEAVING') || []
    );
  }, [jobWorkData?.items]);

  // Apply search and status filter
  const filteredOrders = useMemo(() => {
    let list = allWeavingOrders;

    if (statusFilter === 'ACTIVE') {
      list = list.filter(
        (o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'CLOSED'
      );
    } else if (statusFilter === 'COMPLETED') {
      list = list.filter(
        (o: any) => o.status === 'COMPLETED' || o.status === 'CLOSED'
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (o: any) =>
          o.jobWorkNumber?.toLowerCase().includes(q) ||
          o.jobWorkCompany?.companyName?.toLowerCase().includes(q) ||
          o.remarks?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allWeavingOrders, statusFilter, searchTerm]);

  // Derived KPI calculations
  const totalOrders = allWeavingOrders.length;
  const activeOrders = allWeavingOrders.filter(
    (o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'CLOSED'
  );
  const totalActivePieces = activeOrders.reduce(
    (acc: number, o: any) => acc + (o.weavingDetail?.totalPieces || 0),
    0
  );
  const totalActivePaavu = activeOrders.reduce(
    (acc: number, o: any) => acc + (o.weavingDetail?.totalPaavu || 0),
    0
  );
  const totalExpectedWeight = activeOrders.reduce(
    (acc: number, o: any) => acc + Number(o.weavingDetail?.totalReceivableWeightKg || 0),
    0
  );
  const totalWages = allWeavingOrders.reduce(
    (acc: number, o: any) => acc + Number(o.weavingDetail?.totalSalary || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Hub
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                <span>Weaving Production (நெசவு பணி)</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
                Yarn to Fabric
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subcontract weaving mill operations, yarn formulation parameters, and In-Pass finished fabric intake
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-card border-border hover:border-lime-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Orders</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-lime-500/10 text-lime-600 dark:text-lime-400 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {activeOrders.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">
              of {totalOrders} total
            </span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card border-border hover:border-lime-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Paavu</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {totalActivePaavu}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">பாவு</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card border-border hover:border-lime-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pieces WIP</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {totalActivePieces.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Pieces</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card border-border hover:border-lime-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Expected Fabric</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {totalExpectedWeight.toFixed(1)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Kg</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card border-border hover:border-lime-500/40 transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Weaving Wages</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{totalWages.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </Card>
      </div>

      {/* Orders Filter & Register Section */}
      <Card className="p-4 sm:p-5 border-border space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order #, mill, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-background font-semibold text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({allWeavingOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-background font-semibold text-lime-600 dark:text-lime-400 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'COMPLETED'
                  ? 'bg-background font-semibold text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed ({allWeavingOrders.length - activeOrders.length})
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Subcontractor Mill</th>
                <th className="p-3">Specifications</th>
                <th className="p-3 text-center">Paavu & Pieces</th>
                <th className="p-3 text-right">Weft & Inward Wt</th>
                <th className="p-3 text-right">Weaving Salary</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {filteredOrders.map((order: any) => {
                const detail = order.weavingDetail;
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">
                      <Link
                        href={`/job-work/${order.id}`}
                        className="text-lime-600 dark:text-lime-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        {order.jobWorkNumber}
                      </Link>
                      <span className="text-[10px] text-muted-foreground block font-sans">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <strong className="text-foreground block">{order.jobWorkCompany?.companyName || 'Subcontractor'}</strong>
                      {order.jobWorkCompany?.phone && (
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          {order.jobWorkCompany.phone}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {detail ? (
                        <div>
                          <span className="font-bold text-foreground block">
                            {detail.ends}E × {detail.reed}R × {detail.pick}P
                          </span>
                          <span className="text-[10px] text-muted-foreground block font-sans">
                            {Number(detail.weftCount).toFixed(0)}s count • {detail.pieceLengthMeters}m ({detail.pieceLengthYards} yds)
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Standard</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-foreground block text-sm">
                        {detail?.totalPieces || 0} ps
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-sans">
                        {detail?.totalPaavu || 0} Paavu
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-foreground block">
                        {Number(detail?.totalReceivableWeightKg || 0).toFixed(2)} Kg
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-sans">
                        Weft: {Number(detail?.totalWeftWeightKg || 0).toFixed(2)} Kg
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">
                        ₹{Number(detail?.totalSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-sans">
                        {detail?.salaryType} @ ₹{detail?.ratePerMeter}/m
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <JobWorkStatusBadge status={order.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        {order.status !== 'COMPLETED' && order.status !== 'CLOSED' && (
                          <Link href={`/job-work/${order.id}/return`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>In-Pass</span>
                            </Button>
                          </Link>
                        )}
                        <Link href={`/job-work/${order.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[11px] gap-1"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground font-sans">
                    {isLoading ? 'Loading weaving orders...' : 'No weaving orders found matching your filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
