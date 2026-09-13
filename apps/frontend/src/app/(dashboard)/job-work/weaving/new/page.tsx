'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  FilePlus,
  Building2,
  Package,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Coins,
  Scale,
  Calculator,
  Info,
  CheckCircle2,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { useToast } from '@/components/ui/toast';
import {
  useJobWorkCompanies,
  useCreateWeavingJobWorkOrder,
} from '@/hooks/useJobWork';
import { MarkBreakdownItem } from '@/types/job-work.types';
import { computeWeavingJobWork } from '@ims/validation';
import Link from 'next/link';

function CreateWeavingOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const companyIdParam = searchParams.get('companyId') || '';
  const companyNameParam = searchParams.get('companyName') || '';
  const workerNamesParam = searchParams.get('workerNames') || '';

  const { data: companies = [], isLoading: isLoadingCompanies } = useJobWorkCompanies();
  const weavingCreateMutation = useCreateWeavingJobWorkOrder();

  // Company and Basic Fields
  const [jobWorkCompanyId, setJobWorkCompanyId] = useState(companyIdParam);
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const future = new Date();
    future.setDate(future.getDate() + 14);
    return future.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState(
    workerNamesParam ? `Assigned Workforce: ${workerNamesParam}` : ''
  );

  // Sync if query param arrives after load
  useEffect(() => {
    if (companyIdParam && !jobWorkCompanyId) {
      setJobWorkCompanyId(companyIdParam);
    }
  }, [companyIdParam, jobWorkCompanyId]);

  // Weaving Specific Engineering Parameters (defaults from notebook formulation)
  const [ends, setEnds] = useState<number | ''>(1260);
  const [reed, setReed] = useState<number | ''>(23);
  const [pick, setPick] = useState<number | ''>(17);
  const [weftCount, setWeftCount] = useState<number | ''>(40);
  const [pieceLengthYards, setPieceLengthYards] = useState<number | ''>(112);
  const [pieceLengthMeters, setPieceLengthMeters] = useState<number | ''>(100);
  const [yarnConstant, setYarnConstant] = useState<number | ''>(0.54);
  const [salaryType, setSalaryType] = useState<'Roll' | 'Than' | 'Custom'>('Roll');
  const [ratePerMeter, setRatePerMeter] = useState<number | ''>(2.015);
  const [warpWeightKg, setWarpWeightKg] = useState<number | ''>('');

  // Mark Breakdown dynamic rows (starts empty with no default pre-fills)
  const [markRows, setMarkRows] = useState<Array<{ id: string; mark: number | ''; paavu: number | '' }>>([
    { id: '1', mark: '', paavu: '' },
  ]);

  // Sync rate when salaryType changes
  const handleSalaryTypeChange = (type: 'Roll' | 'Than' | 'Custom') => {
    setSalaryType(type);
    if (type === 'Roll') {
      setRatePerMeter(2.015);
    } else if (type === 'Than') {
      setRatePerMeter(2.095);
    }
  };

  // Pure Weaving Calculation Engine
  const weavingCalculations = useMemo(() => {
    const rawBreakdown = markRows.map((r) => ({
      mark: Number(r.mark) || 0,
      paavu: Number(r.paavu) || 0,
    }));

    try {
      return computeWeavingJobWork({
        ends: Number(ends) || 0,
        reed: Number(reed) || 1,
        pick: Number(pick) || 0,
        weftCount: Number(weftCount) || 1,
        pieceLengthYards: Number(pieceLengthYards) || 0,
        pieceLengthMeters: Number(pieceLengthMeters) || 0,
        yarnConstant: Number(yarnConstant) || 0,
        markBreakdown: rawBreakdown,
        warpWeightKg: Number(warpWeightKg) || 0,
        salaryType,
        ratePerMeter: Number(ratePerMeter) || 0,
        baseReedPicks: 16,
      });
    } catch {
      return {
        ends: Number(ends) || 0,
        reed: Number(reed) || 1,
        pick: Number(pick) || 0,
        totalPaavu: 0,
        totalPieces: 0,
        breakdown: [],
        pieceLengthYards: Number(pieceLengthYards) || 0,
        pieceLengthMeters: Number(pieceLengthMeters) || 0,
        yarnConstant: Number(yarnConstant) || 0,
        weftCount: Number(weftCount) || 1,
        reedSpaceInches: 0,
        weftWeightPerPieceKg: 0,
        totalWeftWeightKg: 0,
        salaryType,
        ratePerMeter: Number(ratePerMeter) || 0,
        baseReedPicks: 16,
        salaryPerPiece: 0,
        totalSalary: 0,
        warpWeightKg: Number(warpWeightKg) || 0,
        totalReceivableWeightKg: 0,
      };
    }
  }, [
    ends,
    reed,
    pick,
    weftCount,
    pieceLengthYards,
    pieceLengthMeters,
    yarnConstant,
    salaryType,
    ratePerMeter,
    warpWeightKg,
    markRows,
  ]);

  const addMarkRow = () => {
    setMarkRows((prev) => [
      ...prev,
      { id: String(Date.now()), mark: '', paavu: '' },
    ]);
  };

  const removeMarkRow = (id: string) => {
    if (markRows.length <= 1) {
      setMarkRows([{ id: String(Date.now()), mark: '', paavu: '' }]);
      return;
    }
    setMarkRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateMarkRow = (id: string, field: 'mark' | 'paavu', val: string) => {
    setMarkRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: val === '' ? '' : Math.max(0, Number(val)) }
          : r
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobWorkCompanyId) {
      toast('Company Required', 'Please select a Weaving Job Working Mill / Subcontractor', 'warning');
      return;
    }

    const formattedBreakdown: MarkBreakdownItem[] = markRows
      .filter((r) => (Number(r.mark) || 0) > 0 && (Number(r.paavu) || 0) > 0)
      .map((r) => ({
        mark: Number(r.mark) || 0,
        paavu: Number(r.paavu) || 0,
        pieces: (Number(r.mark) || 0) * (Number(r.paavu) || 0),
      }));

    if (weavingCalculations.totalPieces <= 0 || formattedBreakdown.length === 0) {
      toast('Invalid Pieces', 'Please enter Mark and Paavu values to calculate pieces', 'warning');
      return;
    }

    try {
      const order = await weavingCreateMutation.mutateAsync({
        jobWorkCompanyId,
        expectedReturnDate,
        remarks,
        ends: Number(ends),
        reed: Number(reed),
        pick: Number(pick),
        totalPaavu: weavingCalculations.totalPaavu,
        pieceLengthYards: Number(pieceLengthYards),
        pieceLengthMeters: Number(pieceLengthMeters),
        weftCount: Number(weftCount),
        yarnConstant: Number(yarnConstant),
        markBreakdown: formattedBreakdown,
        totalPieces: weavingCalculations.totalPieces,
        weftWeightPerPieceKg: weavingCalculations.weftWeightPerPieceKg,
        totalWeftWeightKg: weavingCalculations.totalWeftWeightKg,
        warpWeightKg: Number(warpWeightKg) || 0,
        totalReceivableWeightKg: weavingCalculations.totalReceivableWeightKg,
        salaryType,
        ratePerMeter: Number(ratePerMeter),
        baseReedPicks: 16,
        salaryPerPiece: weavingCalculations.salaryPerPiece,
        totalSalary: weavingCalculations.totalSalary,
      });

      toast(
        'Weaving Job Work Created',
        `Order ${order.jobWorkNumber} created with ${weavingCalculations.totalPieces} pieces (${weavingCalculations.totalPaavu} Paavu)`,
        'success'
      );
      router.push(`/job-work/${order.id}`);
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Unable to create weaving job work order', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto pb-16"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Job Work
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-6 w-6 text-lime-600 dark:text-lime-400" />
              <span>Weaving Job Work Order (நெசவு பணி)</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Issue grey fabric weaving order to external subcontractor mills with exact yarn formulas & In-Pass delivery
            </p>
          </div>
        </div>

        {workerNamesParam && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground border border-border">
            <Users className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
            <span>Assigned: <strong>{workerNamesParam}</strong></span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Preview Badge */}
        <div className="p-4 bg-lime-500/10 border border-lime-500/20 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">
              Job Work Order Number (Auto Generated)
            </span>
            <span className="font-mono font-bold text-lime-600 dark:text-lime-400 text-lg">JWO-2026-XXXX</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Order Classification</span>
            <span className="text-xs font-bold text-lime-700 dark:text-lime-300 uppercase tracking-wider bg-lime-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Layers className="h-3 w-3" />
              Weaving / நெசவு Subcontract
            </span>
          </div>
        </div>

        {/* Section 1: Subcontract Mill & Timeline */}
        <Card className="p-5 border-border space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border text-sm font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-lime-600 dark:text-lime-400" />
            <span>1. Subcontractor Mill & Schedule</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MasterEntityDropdown
              label="Job Working Company / Weaving Mill *"
              entityType="jobWorkCompany"
              placeholder="Search or select weaving subcontractor mill..."
              options={companies.map((c: any) => ({ label: c.companyName, value: c.id, raw: c }))}
              value={jobWorkCompanyId}
              onChange={(val) => setJobWorkCompanyId(val)}
              disabled={isLoadingCompanies}
              required
            />

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Expected Return / Delivery Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  required
                />
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Target date for woven fabric in-pass return delivery
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              General Remarks / Special Instructions
            </label>
            <Input
              placeholder="e.g. Export grade 40s yarn, double-beam inspection required, delivery in rolls"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </Card>

        {/* Section 2: Technical Weaving Specifications */}
        <Card className="p-5 border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calculator className="h-4 w-4 text-lime-600 dark:text-lime-400" />
              <span>2. Technical Specifications (Ends, Reed, Pick & Length)</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              Standard Formulation: {ends} Ends × {reed} Reed × {pick} Pick
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Ends (பாவு நூல் எண்ணிக்கை):
              </label>
              <Input
                type="number"
                value={ends}
                onChange={(e) => setEnds(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Reed (பன்னாடை):
              </label>
              <Input
                type="number"
                value={reed}
                onChange={(e) => setReed(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Pick (பேசி):
              </label>
              <Input
                type="number"
                value={pick}
                onChange={(e) => setPick(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Weft Count (நூல் நெம்பர்):
              </label>
              <Input
                type="number"
                value={weftCount}
                onChange={(e) => setWeftCount(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Piece Length (Yards):
              </label>
              <Input
                type="number"
                value={pieceLengthYards}
                onChange={(e) => setPieceLengthYards(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Piece Length (Meters):
              </label>
              <Input
                type="number"
                value={pieceLengthMeters}
                onChange={(e) => setPieceLengthMeters(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Constant (நூல் மாறிலி):
              </label>
              <Input
                type="number"
                step="0.01"
                value={yarnConstant}
                onChange={(e) => setYarnConstant(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Warp Weight / பாவு எடை (Kg):
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="Optional"
                value={warpWeightKg}
                onChange={(e) => setWarpWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                className="font-mono font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Mark Breakdown Dynamic Table */}
        <Card className="p-5 border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Scale className="h-4 w-4 text-lime-600 dark:text-lime-400" />
              <span>3. Mark Breakdown & Total Paavu (மார்க் விபரம்)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMarkRow}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              className="h-8 text-xs"
            >
              Add Mark Row
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3">Mark (மார்க்)</th>
                  <th className="py-2 px-3">Paavu (பாவு எண்ணிக்கை)</th>
                  <th className="py-2 px-3">Pieces (மொத்த துண்டுகள்)</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {markRows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-28 h-8 text-xs font-bold"
                          placeholder="0"
                          value={row.mark}
                          onChange={(e) => updateMarkRow(row.id, 'mark', e.target.value)}
                        />
                        <span className="text-muted-foreground">mark</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-24 h-8 text-xs font-bold"
                          placeholder="0"
                          value={row.paavu}
                          onChange={(e) => updateMarkRow(row.id, 'paavu', e.target.value)}
                        />
                        <span className="text-muted-foreground">paavu</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-bold text-foreground text-sm">
                        {(Number(row.mark) || 0) * (Number(row.paavu) || 0)}
                      </span>
                      <span className="text-muted-foreground ml-1">pieces</span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMarkRow(row.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold text-foreground text-xs bg-muted/20">
                  <td className="py-2.5 px-3">Total / மொத்தம்:</td>
                  <td className="py-2.5 px-3 text-lime-600 dark:text-lime-400">
                    {weavingCalculations.totalPaavu} Paavu
                  </td>
                  <td className="py-2.5 px-3 text-lime-600 dark:text-lime-400" colSpan={2}>
                    {weavingCalculations.totalPieces} Pieces
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Section 4: Three Calculation Display Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Weft Yarn Weight */}
          <Card className="p-5 bg-gradient-to-br from-card to-blue-500/5 border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-4 w-4" />
                <span>ஊடை நூல் எடை (Weft Weight)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Formula Engine
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">1 துண்டு எடை (Weight/ps):</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {weavingCalculations.weftWeightPerPieceKg.toFixed(3)}
                </span>
                <span className="font-mono text-sm text-foreground font-semibold">Kg / ps</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block font-mono">
                Calc: (({ends || 0} ÷ {reed || 1}) × {pick || 0} × {pieceLengthYards || 0} × {yarnConstant || 0}) ÷ (({weftCount || 1}) × 1000)
              </span>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-[11px] text-muted-foreground block font-medium">
                மொத்த ஊடை நூல் எடை ({weavingCalculations.totalPieces} ps):
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {weavingCalculations.totalWeftWeightKg.toFixed(3)} Kg
              </div>
            </div>
          </Card>

          {/* Card 2: Weaving Salary */}
          <Card className="p-5 bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="h-4 w-4" />
                <span>நெசவு சம்பளம் (Weaving Wages)</span>
              </span>
              <div className="flex items-center gap-1">
                {(['Roll', 'Than', 'Custom'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleSalaryTypeChange(st)}
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-all ${
                      salaryType === st
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground font-medium">Rate per meter:</span>
              <div className="flex items-center gap-1 font-mono font-bold">
                <span>₹</span>
                <input
                  type="number"
                  step="0.001"
                  className="w-20 h-7 px-1.5 text-right rounded border border-border bg-background text-xs font-mono font-bold text-foreground"
                  value={ratePerMeter}
                  onChange={(e) => setRatePerMeter(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <span>/m</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">1 துண்டு கூலி (Salary/ps):</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹ {weavingCalculations.salaryPerPiece.toFixed(3)}
                </span>
                <span className="font-mono text-sm text-foreground font-semibold">/ ps</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block font-mono">
                Formula: ({ratePerMeter || 0} ÷ 16) × {pick || 0} × {pieceLengthMeters || 0}m
              </span>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-[11px] text-muted-foreground block">
                மொத்த சம்பளம் ({weavingCalculations.totalPieces} ps):
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹ {weavingCalculations.totalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </Card>

          {/* Card 3: Total Receivable Weight */}
          <Card className="p-5 bg-gradient-to-br from-card to-purple-500/5 border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                <span>மொத்த பெறவேண்டிய எடை</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Receivable Weight
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Weft Weight (ஊடை):</span>
                <span className="font-mono text-foreground font-semibold">{weavingCalculations.totalWeftWeightKg.toFixed(3)} Kg</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Warp Weight (பாவு):</span>
                <span className="font-mono text-foreground font-semibold">{(Number(warpWeightKg) || 0).toFixed(3)} Kg</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Pieces Count:</span>
                <span className="font-mono text-foreground font-semibold">{weavingCalculations.totalPieces} Pieces</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/80">
              <span className="text-[11px] text-muted-foreground block">
                Expected Inward Finished Weight:
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                {weavingCalculations.totalReceivableWeightKg.toFixed(3)} Kg
              </div>
            </div>
          </Card>
        </div>


        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/job-work">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            isLoading={weavingCreateMutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
            className="bg-lime-600 hover:bg-lime-700 text-white font-bold shadow-sm"
          >
            Generate Weaving Job Work Order
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default function CreateWeavingOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground font-mono text-sm">
          Loading Weaving Order Setup...
        </div>
      }
    >
      <CreateWeavingOrderContent />
    </Suspense>
  );
}
