'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calculator,
  Coins,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
  FileText,
  Building2,
  Package,
  Layers,
  Printer,
  CreditCard,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { SalaryNavTabs } from '@/components/salary/salary-nav-tabs';
import { useJobWorkOrders, useJobWorkCompanies } from '@/hooks/useJobWork';
import { useGauzeBleachingJobs } from '@/hooks/useGauzeProduction';
import { JobWorkOrder } from '@/types/job-work.types';
import { GauzeBleachingJobItem } from '@/types/gauze-production.types';
import { formatDate } from '@/lib/date-utils';

export type JobWorkCategory = 'WEAVING' | 'BLEACHING' | 'STANDARD' | 'GAUZE_BLEACHING';

export interface JobWorkWageItem {
  id: string;
  orderNumber: string;
  category: JobWorkCategory;
  categoryLabel: string;
  status: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  productOrProcess: string;
  outputQuantity: number;
  outputWeight?: number;
  uom: string;
  hasCalculatedSalary: boolean;
  calculatedSalary: number | null;
  salaryFormulaDetails: string;
  closedDate?: string;
  manageUrl: string;
  rawOrder?: JobWorkOrder;
  rawGauzeJob?: GauzeBleachingJobItem;
}

interface WageRecordState {
  customSalary?: number;
  isSettled: boolean;
  settledAt?: string;
  paymentMode?: string;
  referenceNo?: string;
  settledAmount?: number;
  notes?: string;
}

const STORAGE_KEY = 'ims_job_work_wage_records_v1';

export default function JobWorkWagesPage() {
  const { toast } = useToast();

  // Queries
  const { data: jobWorkData, isLoading: isLoadingJobWork } = useJobWorkOrders({ limit: 500 });
  const { data: gauzeBleachingData = [], isLoading: isLoadingGauze } = useGauzeBleachingJobs();
  const { data: companies = [] } = useJobWorkCompanies();

  const isLoading = isLoadingJobWork || isLoadingGauze;

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | JobWorkCategory>('ALL');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');

  // Interactive Wage State per item
  const [wageStates, setWageStates] = useState<Record<string, WageRecordState>>({});
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  // Load wage settlement state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWageStates(JSON.parse(stored));
      }
    } catch {
      // Ignore parse error
    } finally {
      setIsStorageLoaded(true);
    }
  }, []);

  // Persist wage settlement state to localStorage
  useEffect(() => {
    if (!isStorageLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wageStates));
    } catch {
      // Ignore quota error
    }
  }, [wageStates, isStorageLoaded]);

  // Modal States
  const [settlementItem, setSettlementItem] = useState<JobWorkWageItem | null>(null);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer (NEFT)');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [voucherItem, setVoucherItem] = useState<JobWorkWageItem | null>(null);

  // Unify and extract all completed job works
  const completedJobWorkItems = useMemo<JobWorkWageItem[]>(() => {
    const list: JobWorkWageItem[] = [];

    // 1. Process JobWorkOrder items (Weaving, Bleaching, Standard)
    const rawOrders: JobWorkOrder[] = jobWorkData?.items || [];
    rawOrders.forEach((order) => {
      const isCompleted =
        order.status === 'COMPLETED' ||
        order.status === 'CLOSED' ||
        (Number(order.totalReturnedWeight) > 0 && Number(order.pendingWeight) <= 0) ||
        (Number(order.totalReturnedQty) > 0 && Number(order.pendingQty) <= 0);

      if (!isCompleted) return;

      const jobType = (order.jobWorkType || 'STANDARD').toUpperCase();

      if (jobType === 'WEAVING' || order.weavingDetail) {
        // Weaving Job Work
        const detail = order.weavingDetail;
        const totalSalary = detail?.totalSalary ? Number(detail.totalSalary) : null;
        const pieces = detail?.totalPieces || Number(order.totalReturnedQty) || 0;
        const salaryPerPiece = detail?.salaryPerPiece ? Number(detail.salaryPerPiece).toFixed(2) : '0';
        const formula = detail
          ? `${pieces} Pcs × ₹${salaryPerPiece}/pc (${detail.ends} Ends × ${detail.reed}R × ${detail.pick}P)`
          : 'Formula calculation';

        list.push({
          id: order.id,
          orderNumber: order.jobWorkNumber,
          category: 'WEAVING',
          categoryLabel: 'Weaving',
          status: order.status,
          companyName: order.jobWorkCompany?.companyName || 'Weaving Subcontractor',
          contactPerson: order.jobWorkCompany?.contactPerson || undefined,
          phone: order.jobWorkCompany?.phone || undefined,
          productOrProcess: detail
            ? `Woven Fabric (${detail.ends} Ends × ${detail.reed} Reed, ${detail.pick} Pick)`
            : (order.finishedProduct?.name || 'Woven Greige Fabric'),
          outputQuantity: pieces,
          outputWeight: Number(detail?.totalReceivableWeightKg || order.totalReturnedWeight || 0),
          uom: 'Pcs',
          hasCalculatedSalary: totalSalary !== null && totalSalary > 0,
          calculatedSalary: totalSalary,
          salaryFormulaDetails: formula,
          closedDate: order.closedAt || order.updatedAt,
          manageUrl: `/job-work/${order.id}`,
          rawOrder: order,
        });
      } else if (jobType === 'BLEACHING' || order.bleachingDetail) {
        // Bleaching Job Work
        const detail = order.bleachingDetail;
        const totalCost = detail?.totalCost ? Number(detail.totalCost) : null;
        const bleachingTypeLabel =
          detail?.bleachingType === 'PEROXIDE_BLEACHING' ? 'Peroxide Bleaching' : 'Beam Dyeing & Bleaching';
        const uom = detail?.rateType === 'PER_METER' ? 'Meters' : 'Kg';
        const qty =
          detail?.rateType === 'PER_METER'
            ? Number(detail?.totalInputLengthMeters || order.totalReturnedQty || 0)
            : Number(detail?.totalInputWeightKg || order.totalReturnedWeight || 0);

        const formula = detail
          ? `₹${Number(detail.rate).toFixed(2)}/${uom} (${detail.totalPiecesOrRolls || 1} rolls, ${bleachingTypeLabel})`
          : 'Bleaching processing charges';

        list.push({
          id: order.id,
          orderNumber: order.jobWorkNumber,
          category: 'BLEACHING',
          categoryLabel: 'Bleaching',
          status: order.status,
          companyName: order.jobWorkCompany?.companyName || 'Bleaching Mill',
          contactPerson: order.jobWorkCompany?.contactPerson || undefined,
          phone: order.jobWorkCompany?.phone || undefined,
          productOrProcess: `Bleached Fabric (${bleachingTypeLabel})`,
          outputQuantity: qty,
          outputWeight: Number(order.totalReturnedWeight || detail?.totalInputWeightKg || 0),
          uom: uom,
          hasCalculatedSalary: totalCost !== null && totalCost > 0,
          calculatedSalary: totalCost,
          salaryFormulaDetails: formula,
          closedDate: order.closedAt || order.updatedAt,
          manageUrl: `/job-work/${order.id}`,
          rawOrder: order,
        });
      } else {
        // Standard Job Work (General Cut/Sew, Packing, Stitching, etc.)
        const returnedQty = Number(order.totalReturnedQty) || 0;
        const returnedWeight = Number(order.totalReturnedWeight) || 0;
        const uom = order.finishedProduct?.unit?.abbreviation || (returnedQty > 0 ? 'Pcs' : 'Kg');
        const displayQty = returnedQty > 0 ? returnedQty : returnedWeight;

        list.push({
          id: order.id,
          orderNumber: order.jobWorkNumber,
          category: 'STANDARD',
          categoryLabel: 'Standard Job Work',
          status: order.status,
          companyName: order.jobWorkCompany?.companyName || 'Subcontractor',
          contactPerson: order.jobWorkCompany?.contactPerson || undefined,
          phone: order.jobWorkCompany?.phone || undefined,
          productOrProcess: order.finishedProduct?.name || order.rawMaterial?.name || 'Job Work Output Goods',
          outputQuantity: displayQty,
          outputWeight: returnedWeight,
          uom: uom,
          hasCalculatedSalary: false, // Standard job works require manual wage input
          calculatedSalary: null,
          salaryFormulaDetails: 'Manual wage entry required',
          closedDate: order.closedAt || order.updatedAt,
          manageUrl: `/job-work/${order.id}`,
          rawOrder: order,
        });
      }
    });

    // 2. Process Gauze Bleaching Subcontractor Jobs
    gauzeBleachingData.forEach((job) => {
      const isCompleted =
        job.status === 'COMPLETED' || job.status === 'RECEIVED' || job.status === 'CLOSED';

      if (!isCompleted) return;

      const calcCost = Number(
        job.actualCost ||
          job.estimatedCost ||
          (job.rate != null && Number(job.quantitySent) > 0 ? Number(job.rate) * Number(job.quantitySent) : 0),
      );

      const hasCalc = calcCost > 0;
      const formula = job.rate
        ? `₹${Number(job.rate).toFixed(2)}/${job.uom || 'm'} × ${job.quantitySent} ${job.uom || 'm'}`
        : 'Mill bleaching contract cost';

      list.push({
        id: job.id,
        orderNumber: job.jobNumber,
        category: 'GAUZE_BLEACHING',
        categoryLabel: 'Gauze Bleaching',
        status: job.status,
        companyName: job.vendor?.companyName || 'Subcontractor Mill',
        contactPerson: job.vendor?.contactPerson || undefined,
        phone: job.vendor?.phone || undefined,
        productOrProcess: `Gauze Mill Bleaching (${job.bleachingType?.name || 'Standard'})`,
        outputQuantity: Number(job.quantitySent) || 0,
        uom: job.uom || 'Meters',
        hasCalculatedSalary: hasCalc,
        calculatedSalary: hasCalc ? calcCost : null,
        salaryFormulaDetails: formula,
        closedDate: job.updatedAt || job.createdAt,
        manageUrl: '/gauze-production/bleaching',
        rawGauzeJob: job,
      });
    });

    // Sort by order number descending or most recent
    return list.sort((a, b) => b.orderNumber.localeCompare(a.orderNumber));
  }, [jobWorkData, gauzeBleachingData]);

  // Compute effective wage for an item (using custom salary if provided, else calculated, else 0)
  const getEffectiveWage = (item: JobWorkWageItem): number => {
    const state = wageStates[item.id];
    if (state?.customSalary != null && !isNaN(state.customSalary) && state.customSalary >= 0) {
      return state.customSalary;
    }
    if (item.hasCalculatedSalary && item.calculatedSalary != null) {
      return item.calculatedSalary;
    }
    return 0;
  };

  // Update manual custom wage
  const updateCustomSalary = (id: string, newSalary: number) => {
    setWageStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { isSettled: false }),
        customSalary: newSalary,
      },
    }));
  };

  // Handle opening payment settlement modal
  const handleOpenSettlement = (item: JobWorkWageItem) => {
    setSettlementItem(item);
    setPaymentRef(`PAY-JW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentNotes(`Wages settlement for ${item.orderNumber} - ${item.productOrProcess}`);
  };

  // Confirm settlement payout
  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementItem) return;

    const totalAmount = getEffectiveWage(settlementItem);

    setWageStates((prev) => ({
      ...prev,
      [settlementItem.id]: {
        ...(prev[settlementItem.id] || {}),
        isSettled: true,
        settledAt: paymentDate,
        paymentMode: paymentMode,
        referenceNo: paymentRef,
        settledAmount: totalAmount,
        notes: paymentNotes,
      },
    }));

    toast(
      'Wages Settled Successfully',
      `Paid ₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to ${settlementItem.companyName}`,
      'success',
    );
    setSettlementItem(null);
  };

  // Filtered orders list
  const filteredItems = useMemo(() => {
    return completedJobWorkItems.filter((item) => {
      const state = wageStates[item.id];
      const isSettled = Boolean(state?.isSettled);

      // Search match
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        item.orderNumber.toLowerCase().includes(searchLower) ||
        item.companyName.toLowerCase().includes(searchLower) ||
        item.productOrProcess.toLowerCase().includes(searchLower) ||
        item.categoryLabel.toLowerCase().includes(searchLower);

      // Vendor match
      const matchesVendor = selectedVendor ? item.companyName === selectedVendor : true;

      // Category match
      const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      // Tab match
      const matchesTab =
        filterTab === 'ALL' ? true : filterTab === 'SETTLED' ? isSettled : !isSettled;

      return matchesSearch && matchesVendor && matchesCategory && matchesTab;
    });
  }, [completedJobWorkItems, wageStates, searchTerm, selectedVendor, categoryFilter, filterTab]);

  // Overall KPIs
  const totalCompletedCount = completedJobWorkItems.length;
  const totalVolumeProduced = completedJobWorkItems.reduce((sum, item) => sum + item.outputQuantity, 0);

  const totalCalculatedWages = completedJobWorkItems.reduce((sum, item) => {
    return sum + getEffectiveWage(item);
  }, 0);

  const totalSettledWages = completedJobWorkItems.reduce((sum, item) => {
    const state = wageStates[item.id];
    return sum + (state?.isSettled ? Number(state.settledAmount ?? getEffectiveWage(item)) || 0 : 0);
  }, 0);

  const pendingSettlementWages = Math.max(0, totalCalculatedWages - totalSettledWages);

  // Badge styler for category
  const renderCategoryBadge = (category: JobWorkCategory) => {
    switch (category) {
      case 'WEAVING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime-500/10 text-lime-700 dark:text-lime-300 border border-lime-500/20 inline-flex items-center gap-1 font-mono">
            <Layers className="h-3 w-3" />
            WEAVING
          </span>
        );
      case 'BLEACHING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 inline-flex items-center gap-1 font-mono">
            <Sparkles className="h-3 w-3" />
            BLEACHING
          </span>
        );
      case 'GAUZE_BLEACHING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1 font-mono">
            <Coins className="h-3 w-3" />
            GAUZE BLEACH
          </span>
        );
      case 'STANDARD':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 inline-flex items-center gap-1 font-mono">
            <Package className="h-3 w-3" />
            STANDARD
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calculator className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Job Work Subcontractor Wages & Settlements
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Settlement register for all completed Weaving, Bleaching, Gauze Bleaching, and Standard Job Works
          </p>
        </div>
      </div>

      {/* Unified Module Navigation Tabs */}
      <SalaryNavTabs />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Completed Job Works</span>
            <span className="text-2xl font-bold text-foreground font-mono mt-1 block">
              {totalCompletedCount} Orders
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Output Volume Produced</span>
            <span className="text-2xl font-bold text-foreground font-mono mt-1 block">
              {totalVolumeProduced.toLocaleString('en-IN')} Units
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Wages Payable</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
              ₹ {totalCalculatedWages.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Disbursed / Settled</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">
              ₹ {totalSettledWages.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-400 block font-mono mt-0.5">
              (₹ {pendingSettlementWages.toLocaleString('en-IN', { minimumFractionDigits: 0 })} Pending)
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Coins className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-secondary/20 border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tab Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                filterTab === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'text-muted-foreground hover:text-foreground bg-muted/40'
              }`}
            >
              All Completed ({completedJobWorkItems.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                filterTab === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'text-muted-foreground hover:text-foreground bg-muted/40'
              }`}
            >
              Pending Settlement (
              {completedJobWorkItems.filter((i) => !wageStates[i.id]?.isSettled).length}
              )
            </button>
            <button
              onClick={() => setFilterTab('SETTLED')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                filterTab === 'SETTLED'
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground bg-muted/40'
              }`}
            >
              Settled & Paid (
              {completedJobWorkItems.filter((i) => wageStates[i.id]?.isSettled).length}
              )
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search order #, contractor, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/60 text-foreground text-xs pl-9 pr-3 py-2 rounded-md border border-border focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground font-medium text-[11px] mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Type:
            </span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                categoryFilter === 'ALL'
                  ? 'bg-foreground text-background font-bold'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCategoryFilter('WEAVING')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                categoryFilter === 'WEAVING'
                  ? 'bg-lime-600 text-white font-bold'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Weaving
            </button>
            <button
              onClick={() => setCategoryFilter('BLEACHING')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                categoryFilter === 'BLEACHING'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Bleaching
            </button>
            <button
              onClick={() => setCategoryFilter('GAUZE_BLEACHING')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                categoryFilter === 'GAUZE_BLEACHING'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Gauze Bleaching
            </button>
            <button
              onClick={() => setCategoryFilter('STANDARD')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                categoryFilter === 'STANDARD'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              Standard
            </button>
          </div>

          {/* Contractor Filter */}
          {companies.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[11px]">Contractor:</span>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="bg-secondary/70 text-foreground text-xs px-2 py-1 rounded border border-border focus:outline-none"
              >
                <option value="">All Contractors</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.companyName}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Completed Job Work Wages Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              Completed Job Works Wage Settlement Register
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Pre-calculated internal wages are displayed automatically; manual salary input is available for uncomputed jobworks.
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
              <tr>
                <th className="p-3.5 w-10 text-center">#</th>
                <th className="p-3.5 min-w-[150px]">Order # & Type</th>
                <th className="p-3.5 min-w-[200px]">Job Worker / Contractor</th>
                <th className="p-3.5 min-w-[200px]">Product / Process</th>
                <th className="p-3.5 w-28 text-right">Output Qty</th>
                <th className="p-3.5 min-w-[240px]">Rate / Wage Calculation</th>
                <th className="p-3.5 w-32 text-right">Total Wage (₹)</th>
                <th className="p-3.5 w-28 text-center">Status</th>
                <th className="p-3.5 w-36 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <Clock className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-xs">Loading completed job works register...</p>
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const state = wageStates[item.id];
                  const isSettled = Boolean(state?.isSettled);
                  const effectiveWage = getEffectiveWage(item);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isSettled ? 'bg-emerald-500/[0.02]' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center font-mono text-muted-foreground">{index + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {renderCategoryBadge(item.category)}
                        </div>
                        <Link
                          href={item.manageUrl}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>{item.orderNumber}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {item.closedDate ? formatDate(item.closedDate) : 'Completed'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground block">
                              {item.companyName}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {item.contactPerson || 'Vendor'} {item.phone ? `• ${item.phone}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-foreground block">
                          {item.productOrProcess}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                          Unit: {item.uom}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        <span className="font-bold text-foreground block text-sm">
                          {item.outputQuantity.toLocaleString('en-IN')} {item.uom}
                        </span>
                        {item.outputWeight && item.outputWeight > 0 && item.uom !== 'Kg' && (
                          <span className="text-[10px] text-muted-foreground block">
                            ({item.outputWeight.toFixed(1)} Kg)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {item.hasCalculatedSalary ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1 font-mono">
                                <CheckCircle2 className="h-3 w-3" />
                                Pre-Calculated in {item.categoryLabel}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-foreground block">
                              ₹ {Number(item.calculatedSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-muted-foreground block font-mono">
                              {item.salaryFormulaDetails}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                Wage (₹):
                              </span>
                              <div className="w-32">
                                <Input
                                  type="number"
                                  step="10"
                                  min="0"
                                  value={state?.customSalary ?? ''}
                                  onChange={(e) => updateCustomSalary(item.id, parseFloat(e.target.value) || 0)}
                                  disabled={isSettled}
                                  placeholder="Enter salary ₹"
                                  className="h-7 text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] text-amber-500/90 block">
                              No internal formula • Enter wage
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        <span className="text-sm font-bold text-emerald-400 block">
                          ₹ {effectiveWage.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {isSettled && (
                          <span className="text-[10px] text-muted-foreground block">
                            Paid via {state?.paymentMode?.split(' ')[0] || 'Bank'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {isSettled ? (
                          <Badge variant="success" className="text-[10px] flex items-center justify-center gap-1">
                            <Check className="h-3 w-3" /> SETTLED
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" /> UNPAID
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {isSettled ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVoucherItem(item)}
                            leftIcon={<FileText className="h-3.5 w-3.5 text-emerald-400" />}
                            className="text-xs text-emerald-400 hover:bg-emerald-500/10 h-7"
                          >
                            Voucher
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenSettlement(item)}
                            leftIcon={<CreditCard className="h-3.5 w-3.5" />}
                            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-500"
                          >
                            Settle Wages
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-xs font-medium">No completed job work orders found matching your filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot className="bg-muted/40 border-t border-border font-semibold text-foreground">
                <tr>
                  <td colSpan={4} className="p-3.5 text-right font-medium">
                    Total Wage Payable ({filteredItems.length} orders displayed):
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-foreground">
                    {filteredItems.reduce((sum, o) => sum + o.outputQuantity, 0).toLocaleString('en-IN')} Units
                  </td>
                  <td className="p-3.5"></td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                    ₹{' '}
                    {filteredItems
                      .reduce((sum, item) => sum + getEffectiveWage(item), 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="p-3.5 text-right text-xs text-muted-foreground font-mono">
                    Settled: ₹{' '}
                    {filteredItems
                      .reduce((sum, item) => {
                        const st = wageStates[item.id];
                        return sum + (st?.isSettled ? Number(st.settledAmount ?? getEffectiveWage(item)) || 0 : 0);
                      }, 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Settle Wages Payment Modal */}
      {settlementItem && (
        <Modal
          isOpen={Boolean(settlementItem)}
          onClose={() => setSettlementItem(null)}
          title="Settle Job Work Contractor Wages"
          description={`Record wage payout for Order #${settlementItem.orderNumber} (${settlementItem.categoryLabel})`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmSettlement} className="space-y-4 pt-2">
            <div className="bg-secondary/30 p-3 rounded-lg border border-border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subcontractor / Mill:</span>
                <span className="font-semibold text-foreground">{settlementItem.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Process / Output:</span>
                <span className="font-mono text-foreground font-medium">
                  {settlementItem.productOrProcess} ({settlementItem.outputQuantity} {settlementItem.uom})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate Breakdown:</span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  {settlementItem.salaryFormulaDetails}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5">
                <span className="font-semibold text-foreground">Payable Wage Amount:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹ {getEffectiveWage(settlementItem).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Method</label>
              <Select
                options={[
                  { label: 'Bank Transfer (NEFT / RTGS / IMPS)', value: 'Bank Transfer (NEFT)' },
                  { label: 'UPI / Digital Transfer', value: 'Bank Transfer (UPI)' },
                  { label: 'Cash Payment', value: 'Cash' },
                  { label: 'Cheque Payment', value: 'Cheque' },
                ]}
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Date</label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">UTR / Reference No.</label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UTR-98721245"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Voucher Notes / Narration</label>
              <Input
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Remarks on settlement"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={() => setSettlementItem(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500"
                leftIcon={<Check className="h-4 w-4" />}
              >
                Confirm Payout & Settle
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payment Voucher Dialog */}
      {voucherItem && (
        <Modal
          isOpen={Boolean(voucherItem)}
          onClose={() => setVoucherItem(null)}
          title="Job Work Wage Settlement Voucher"
          description={`Payment Advice #${wageStates[voucherItem.id]?.referenceNo || 'VOUCHER-01'}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="border border-border p-4 rounded-xl bg-card space-y-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">
                    Shri Lathikka Surgicals
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    SF No 142/2A, Pallipalayam Main Road, Komarapalayam, Tamil Nadu - 638183
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">GSTIN: 33AABCS1429M1ZQ</p>
                </div>
                <div className="text-right">
                  <Badge variant="success" className="font-mono text-xs">
                    PAID & SETTLED
                  </Badge>
                  <span className="block text-[11px] font-mono text-muted-foreground mt-1">
                    Date: {wageStates[voucherItem.id]?.settledAt || new Date().toISOString().split('T')[0]}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Paid To (Contractor):</span>
                  <span className="font-bold text-foreground text-sm block">
                    {voucherItem.companyName}
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    Contact: {voucherItem.contactPerson || 'Subcontractor'} {voucherItem.phone ? `(${voucherItem.phone})` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[11px]">Job Work Reference:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                    {voucherItem.orderNumber}
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    Category: {voucherItem.categoryLabel}
                  </span>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-2">Description / Output Process</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Rate / Basis</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">
                        <span className="font-medium text-foreground">
                          {voucherItem.productOrProcess}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {voucherItem.categoryLabel} Subcontracting
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono">
                        {voucherItem.outputQuantity.toLocaleString('en-IN')} {voucherItem.uom}
                      </td>
                      <td className="p-2 text-right font-mono text-[11px]">
                        {voucherItem.salaryFormulaDetails}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-foreground">
                        ₹{' '}
                        {getEffectiveWage(voucherItem).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t border-border bg-muted/20 font-bold">
                    <tr>
                      <td colSpan={3} className="p-2 text-right">
                        Net Amount Disbursed:
                      </td>
                      <td className="p-2 text-right font-mono text-emerald-400 text-sm">
                        ₹{' '}
                        {getEffectiveWage(voucherItem).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-between items-center text-[11px] text-muted-foreground border-t border-border pt-2">
                <span>
                  Payment Mode: <strong className="text-foreground">{wageStates[voucherItem.id]?.paymentMode || 'NEFT'}</strong>
                </span>
                <span>
                  Reference / UTR: <strong className="font-mono text-foreground">{wageStates[voucherItem.id]?.referenceNo || 'N/A'}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-3.5 w-3.5" />}
              >
                Print Voucher
              </Button>
              <Button variant="primary" size="sm" onClick={() => setVoucherItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
