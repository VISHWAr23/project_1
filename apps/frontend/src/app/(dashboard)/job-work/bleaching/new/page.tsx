'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Scale,
  Calculator,
  Info,
  CheckCircle2,
  Check,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Truck,
  Coins,
  ShieldCheck,
  Flame,
  Droplets,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { useToast } from '@/components/ui/toast';
import {
  useJobWorkCompanies,
  useAvailableWeavingGoods,
  useCreateBleachingJobWorkOrder,
} from '@/hooks/useJobWork';
import { BleachingType, WeavingReceivedItem } from '@/types/job-work.types';
import { computeBleachingJobWork } from '@ims/validation';
import { formatDate } from '@/lib/date-utils';

function CreateBleachingOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const companyIdParam = searchParams.get('companyId') || '';
  const companyNameParam = searchParams.get('companyName') || '';
  const workerNamesParam = searchParams.get('workerNames') || '';

  const { data: companies = [], isLoading: isLoadingCompanies } = useJobWorkCompanies();
  const { data: availableWeavingGoods = [], isLoading: isLoadingWeavingGoods, refetch: refetchWeavingGoods } = useAvailableWeavingGoods();
  const bleachingCreateMutation = useCreateBleachingJobWorkOrder();

  // Basic Details
  const [jobWorkCompanyId, setJobWorkCompanyId] = useState(companyIdParam);
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    return future.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState(
    workerNamesParam ? `Assigned Workforce: ${workerNamesParam}` : ''
  );

  // Sync company from param or fallback to first available company if none provided
  useEffect(() => {
    if (companyIdParam) {
      setJobWorkCompanyId(companyIdParam);
    } else if (!jobWorkCompanyId && companies.length > 0) {
      setJobWorkCompanyId(companies[0].id);
    }
  }, [companyIdParam, companies, jobWorkCompanyId]);

  const assignedCompany = useMemo(() => {
    return companies.find((c: any) => c.id === (jobWorkCompanyId || companyIdParam)) || companies[0];
  }, [companies, jobWorkCompanyId, companyIdParam]);

  const displayCompanyName = companyNameParam || assignedCompany?.companyName || 'Bleaching Subcontractor Mill';
  const effectiveCompanyId = jobWorkCompanyId || companyIdParam || assignedCompany?.id || '';

  // Bleaching Process Specs
  const [bleachingType, setBleachingType] = useState<BleachingType>('PEROXIDE_BLEACHING');
  const [rateType, setRateType] = useState<'PER_KG' | 'PER_METER'>('PER_KG');
  const [rate, setRate] = useState<number | ''>(20.00);
  const [processLossPercentage, setProcessLossPercentage] = useState<number | ''>(3.0);
  const [beamNumber, setBeamNumber] = useState('');
  const [manualLengthMeters, setManualLengthMeters] = useState<number | ''>('');

  // Weaving Materials Selection
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState<'ALL' | 'Roll' | 'Than'>('ALL');

  // Automatically update default rate when bleaching type or rate type changes
  const handleBleachingTypeChange = (type: BleachingType) => {
    setBleachingType(type);
    if (type === 'BEAM_DYEING') {
      setRate(rateType === 'PER_METER' ? 4.50 : 57.00);
    } else {
      setRate(rateType === 'PER_METER' ? 1.60 : 20.00);
    }
  };

  const handleRateTypeChange = (newRateType: 'PER_KG' | 'PER_METER') => {
    setRateType(newRateType);
    if (bleachingType === 'BEAM_DYEING') {
      setRate(newRateType === 'PER_METER' ? 4.50 : 57.00);
    } else {
      setRate(newRateType === 'PER_METER' ? 1.60 : 20.00);
    }
  };

  // Filter available weaving items
  const filteredWeavingItems = useMemo(() => {
    return availableWeavingGoods.filter((item: WeavingReceivedItem) => {
      if (selectedForm !== 'ALL' && (item.rollOrThan || 'Roll') !== selectedForm) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inPass = item.inPassNumber?.toLowerCase() || '';
        const desc = item.description?.toLowerCase() || '';
        const mill = item.jobWorkOrder?.jobWorkCompany?.companyName?.toLowerCase() || '';
        const orderNo = item.jobWorkOrder?.jobWorkNumber?.toLowerCase() || '';
        return inPass.includes(q) || desc.includes(q) || mill.includes(q) || orderNo.includes(q);
      }
      return true;
    });
  }, [availableWeavingGoods, selectedForm, searchTerm]);

  // Selected items objects
  const selectedWeavingItems = useMemo(() => {
    return availableWeavingGoods.filter((item: WeavingReceivedItem) =>
      selectedItemIds.includes(item.id)
    );
  }, [availableWeavingGoods, selectedItemIds]);

  // Aggregate input weight and length
  const totalInputWeightKg = useMemo(() => {
    return selectedWeavingItems.reduce((sum: number, item: WeavingReceivedItem) => sum + Number(item.weightKg || 0), 0);
  }, [selectedWeavingItems]);

  const derivedLengthMeters = useMemo(() => {
    return selectedWeavingItems.reduce((sum: number, item: WeavingReceivedItem) => sum + Number(item.lengthMeters || 0), 0);
  }, [selectedWeavingItems]);

  const totalInputLengthMeters = useMemo(() => {
    if (manualLengthMeters !== '' && !isNaN(Number(manualLengthMeters))) {
      return Number(manualLengthMeters);
    }
    return derivedLengthMeters;
  }, [manualLengthMeters, derivedLengthMeters]);

  const totalPiecesOrRolls = selectedWeavingItems.length;

  // Real-time calculation engine from @ims/validation
  const calculations = useMemo(() => {
    return computeBleachingJobWork({
      bleachingType,
      rateType,
      rate: Number(rate) || 0,
      processLossPercentage: Number(processLossPercentage) || 0,
      totalInputWeightKg,
      totalInputLengthMeters,
      totalPiecesOrRolls,
    });
  }, [bleachingType, rateType, rate, processLossPercentage, totalInputWeightKg, totalInputLengthMeters, totalPiecesOrRolls]);

  // Toggle single item selection
  const handleToggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle select all currently filtered items
  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredWeavingItems.map((i: WeavingReceivedItem) => i.id);
    setSelectedItemIds((prev) => {
      const set = new Set([...prev, ...idsToAdd]);
      return Array.from(set);
    });
  };

  const handleClearSelection = () => {
    setSelectedItemIds([]);
  };

  // Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveCompanyId) {
      toast('Company Required', 'Please assign a Job Work Company before creating an order', 'error');
      return;
    }

    if (selectedItemIds.length === 0) {
      toast('No Materials Selected', 'Please select at least one received weaving item to bleach', 'error');
      return;
    }

    if (!rate || Number(rate) <= 0) {
      toast('Invalid Rate', 'Please enter a valid bleaching cost rate', 'error');
      return;
    }

    if (rateType === 'PER_METER' && (!calculations.totalInputLengthMeters || calculations.totalInputLengthMeters <= 0)) {
      toast('Length Required', 'Please enter total input length in meters when rate basis is ₹/Meter', 'error');
      return;
    }

    if (!calculations.totalCost || calculations.totalCost <= 0) {
      toast('Invalid Total Cost', 'Calculated bleaching cost must be greater than ₹0. Please verify the rate and quantity/meters.', 'error');
      return;
    }

    try {
      const payload = {
        jobWorkCompanyId: effectiveCompanyId,
        expectedReturnDate,
        remarks: remarks.trim() || undefined,
        bleachingType,
        rateType,
        rate: calculations.rate,
        processLossPercentage: calculations.processLossPercentage,
        beamNumber: beamNumber.trim() || undefined,
        selectedWeavingItemIds: selectedItemIds,
        totalInputWeightKg: calculations.totalInputWeightKg,
        totalInputLengthMeters: calculations.totalInputLengthMeters > 0 ? calculations.totalInputLengthMeters : undefined,
        totalPiecesOrRolls: calculations.totalPiecesOrRolls,
        expectedOutputWeightKg: calculations.expectedOutputWeightKg,
        totalCost: calculations.totalCost,
      };

      const result = await bleachingCreateMutation.mutateAsync(payload);
      toast('Order Created', `Bleaching Order ${result.jobWorkNumber} successfully created & dispatched`, 'success');
      router.push(`/job-work/${result.id}`);
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Unable to create bleaching order', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-6xl mx-auto pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                New Bleaching Job Work Order
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Bleaching Process
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Source woven grey fabric from weaving returns and dispatch for Beam Dyeing or Peroxide Bleaching.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            form="bleaching-order-form"
            variant="primary"
            isLoading={bleachingCreateMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            Create Bleaching Order
          </Button>
        </div>
      </div>

      <form id="bleaching-order-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Processing Mill & Delivery Schedule */}
        <Card className="p-5 border-border bg-card/60 backdrop-blur">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border text-foreground font-semibold text-sm">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <span>1. Bleaching Schedule & Subcontractor Mill</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MasterEntityDropdown
              label="Job Working Company / Bleaching Mill *"
              entityType="jobWorkCompany"
              placeholder="Select bleaching subcontractor mill..."
              options={companies.map((c: any) => ({ label: c.companyName, value: c.id, raw: c }))}
              value={jobWorkCompanyId}
              onChange={(val) => setJobWorkCompanyId(val)}
              disabled={isLoadingCompanies}
              required
            />

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Expected Return Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Remarks / Dispatch Instructions
              </label>
              <Input
                placeholder="e.g. 48-inch scouring and optical whitening grade..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Step 2: Bleaching Process Type & Cost Engineering */}
        <Card className="p-5 border-border bg-card/60 backdrop-blur">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Calculator className="h-4 w-4 text-indigo-500" />
              <span>2. Bleaching Process Type & Costing Matrix</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Cost varies by method
            </span>
          </div>

          {/* Bleaching Type Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Peroxide Bleaching */}
            <div
              onClick={() => handleBleachingTypeChange('PEROXIDE_BLEACHING')}
              className={`cursor-pointer relative p-4 rounded-xl border transition-all ${
                bleachingType === 'PEROXIDE_BLEACHING'
                  ? 'border-cyan-500 bg-cyan-500/10 shadow-sm shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'border-border bg-background/50 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      bleachingType === 'PEROXIDE_BLEACHING'
                        ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Peroxide Bleaching</h3>
                    <p className="text-[11px] text-muted-foreground">Hydrogen Peroxide (H₂O₂) Medical Bleaching</p>
                  </div>
                </div>
                {bleachingType === 'PEROXIDE_BLEACHING' && (
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                Standard continuous kier or jigger bleaching for medical absorbent gauze and pure white absorbent cottons.
              </p>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Standard Mill Rate:</span>
                <span className="font-bold text-cyan-600 dark:text-cyan-400">₹20.00 / kg</span>
              </div>
            </div>

            {/* Beam Dyeing */}
            <div
              onClick={() => handleBleachingTypeChange('BEAM_DYEING')}
              className={`cursor-pointer relative p-4 rounded-xl border transition-all ${
                bleachingType === 'BEAM_DYEING'
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'border-border bg-background/50 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      bleachingType === 'BEAM_DYEING'
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Beam Dyeing</h3>
                    <p className="text-[11px] text-muted-foreground">High-Pressure Perforated Beam Dyeing & Scouring</p>
                  </div>
                </div>
                {bleachingType === 'BEAM_DYEING' && (
                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                Specialized pressurized beam scouring and uniform color/bleach penetrative dyeing with premium even finish.
              </p>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Standard Mill Rate:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">₹57.00 / kg</span>
              </div>
            </div>
          </div>

          {/* Rate and Parameters Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-background/50 border border-border">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Rate Basis
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => handleRateTypeChange('PER_KG')}
                  className={`py-1 text-xs font-medium rounded-md transition-all ${
                    rateType === 'PER_KG'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ₹ / Kg
                </button>
                <button
                  type="button"
                  onClick={() => handleRateTypeChange('PER_METER')}
                  className={`py-1 text-xs font-medium rounded-md transition-all ${
                    rateType === 'PER_METER'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ₹ / Meter
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Bleaching Rate ({rateType === 'PER_METER' ? '₹/Meter' : '₹/Kg'}) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Process Shrinkage/Loss (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={processLossPercentage}
                onChange={(e) => setProcessLossPercentage(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Beam # / Lot Reference
              </label>
              <Input
                placeholder="e.g. BEAM-402..."
                value={beamNumber}
                onChange={(e) => setBeamNumber(e.target.value)}
              />
            </div>

            {rateType === 'PER_METER' && (
              <div className="md:col-span-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block">
                    Total Input Length (Meters) *
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Derived from selected goods or enter manually if goods have no length recorded.
                  </p>
                </div>
                <div className="w-full sm:w-48">
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    placeholder={derivedLengthMeters > 0 ? String(derivedLengthMeters) : "e.g. 1000"}
                    value={manualLengthMeters !== '' ? manualLengthMeters : (derivedLengthMeters > 0 ? derivedLengthMeters : '')}
                    onChange={(e) => setManualLengthMeters(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Step 3: Material Sourcing from Weaving Received Goods */}
        <Card className="p-5 border-border bg-card/60 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Layers className="h-4 w-4 text-indigo-500" />
                <span>3. Sourced Materials from Weaving Job Work</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select in-pass fabric rolls/thans received from weaving job work to issue into this bleaching run.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchWeavingGoods()}
                leftIcon={<RefreshCw className="h-3 w-3" />}
              >
                Refresh Goods
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllFiltered}
              >
                Select Filtered ({filteredWeavingItems.length})
              </Button>
              {selectedItemIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-rose-500 hover:text-rose-600"
                >
                  Clear ({selectedItemIds.length})
                </Button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by In-Pass #, Fabric Description, Weaving Mill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Form:</span>
              <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg text-xs font-medium">
                {(['ALL', 'Roll', 'Than'] as const).map((form) => (
                  <button
                    key={form}
                    type="button"
                    onClick={() => setSelectedForm(form)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      selectedForm === form
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {form}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Table */}
          {isLoadingWeavingGoods ? (
            <div className="p-8 text-center text-muted-foreground font-mono text-xs">
              Loading available weaving goods...
            </div>
          ) : filteredWeavingItems.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-background/50">
              <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm font-medium text-foreground">No available weaving goods found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                {searchTerm || selectedForm !== 'ALL'
                  ? 'Try clearing search filters to see other received weaving goods.'
                  : 'All received weaving products have already been assigned to bleaching or none have been received yet.'}
              </p>
              <div className="mt-4">
                <Link href="/weaving-production/received">
                  <Button variant="outline" size="sm" leftIcon={<ExternalLink className="h-3 w-3" />}>
                    Open Weaving Received Goods Register
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Select</th>
                    <th className="py-2.5 px-3">In-Pass #</th>
                    <th className="py-2.5 px-3">Fabric Description</th>
                    <th className="py-2.5 px-3">Weaving Mill</th>
                    <th className="py-2.5 px-3">Received Date</th>
                    <th className="py-2.5 px-3">Form</th>
                    <th className="py-2.5 px-3 text-right">Net Weight</th>
                    <th className="py-2.5 px-3 text-right">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWeavingItems.map((item: WeavingReceivedItem) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/15'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleItem(item.id)}
                            className="rounded border-border text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          {item.inPassNumber}
                        </td>
                        <td className="py-2.5 px-3 text-foreground font-medium">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {item.jobWorkOrder?.jobWorkCompany?.companyName || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-muted border border-border">
                            {item.rollOrThan || 'Roll'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          {Number(item.weightKg).toFixed(2)} kg
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                          {item.lengthMeters ? `${Number(item.lengthMeters).toFixed(1)} m` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Step 4: Real-time Live Calculation Summary */}
        <Card className="p-5 border-border bg-gradient-to-br from-card to-indigo-950/10 border-indigo-500/20">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Coins className="h-4 w-4 text-emerald-500" />
              <span>4. Bleaching Costing & Expected Output Summary</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-500">
              {calculations.bleachingType === 'BEAM_DYEING' ? 'Beam Dyeing' : 'Peroxide Bleaching'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3 rounded-lg bg-background/60 border border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Selected Rolls</span>
              <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
                {calculations.totalPiecesOrRolls}
              </span>
              <span className="text-[10px] text-muted-foreground">Weaving rolls/thans</span>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Input Weight</span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {calculations.totalInputWeightKg.toFixed(2)} kg
              </span>
              <span className="text-[10px] text-muted-foreground">
                {calculations.totalInputLengthMeters ? `${calculations.totalInputLengthMeters.toFixed(0)} meters` : 'Grey fabric'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Bleaching Rate</span>
              <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
                ₹{calculations.rate.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Per {calculations.rateType === 'PER_METER' ? 'Meter' : 'Kg'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Process Loss</span>
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
                {calculations.processLossPercentage}%
              </span>
              <span className="text-[10px] text-muted-foreground">Expected shrinkage</span>
            </div>

            <div className="p-3 rounded-lg bg-background/60 border border-border">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Expected Yield</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {calculations.expectedOutputWeightKg.toFixed(2)} kg
              </span>
              <span className="text-[10px] text-muted-foreground">Bleached goods</span>
            </div>

            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <span className="text-[10px] uppercase font-mono text-indigo-700 dark:text-indigo-300 block font-bold">
                Total Cost
              </span>
              <span className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-0.5 block">
                ₹{calculations.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">
                ₹{calculations.costPerKg.toFixed(2)} / kg
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {selectedItemIds.length > 0 ? (
                <span>
                  Ready to dispatch <strong>{selectedItemIds.length}</strong> items weighing{' '}
                  <strong>{calculations.totalInputWeightKg.toFixed(2)} kg</strong> for{' '}
                  <strong>{calculations.bleachingType === 'BEAM_DYEING' ? 'Beam Dyeing' : 'Peroxide Bleaching'}</strong>.
                </span>
              ) : (
                <span className="text-amber-500 font-medium">
                  Please select at least one received weaving item above to calculate costs and proceed.
                </span>
              )}
            </p>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={selectedItemIds.length === 0 || bleachingCreateMutation.isPending}
              isLoading={bleachingCreateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Confirm & Create Bleaching Order
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  );
}

export default function NewBleachingJobWorkPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground font-mono text-sm">
          Loading Bleaching Order Setup...
        </div>
      }
    >
      <CreateBleachingOrderContent />
    </Suspense>
  );
}
