'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateGamjeeBatch, useGamjeeMasters } from '@/hooks/useGamjeeProduction';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { toast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Scissors,
  Scroll,
  Calculator,
  Boxes,
  Users,
  Building2,
} from 'lucide-react';

function CreateGamjeeBatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const executorType = searchParams.get('executorType');
  const workerNames = searchParams.get('workerNames');
  const companyName = searchParams.get('companyName');
  const createBatchMutation = useCreateGamjeeBatch();
  const { data: masters } = useGamjeeMasters();
  const { data: materialsData } = useRawMaterials({ limit: 100 });

  const sizes = masters?.sizes || [];
  const cottonSpecs = masters?.cottonSpecs || [];
  const materials = materialsData?.items || [];

  // Filter finished gamjee products or finished goods
  const gamjeeProducts = materials.filter(
    (m) =>
      m.name.toLowerCase().includes('gamjee') ||
      m.sku.toLowerCase().includes('gamjee') ||
      m.name.toLowerCase().includes('roll') ||
      m.category?.name?.toLowerCase().includes('finished')
  );

  // Form State
  const [finishedProductId, setFinishedProductId] = useState('');
  const [gamjeeSizeId, setGamjeeSizeId] = useState('');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-populate notes if dispatched from Job Work
  useEffect(() => {
    if (workerNames && !notes) {
      setNotes(`Assigned In-House Workforce: ${workerNames}`);
    } else if (companyName && !notes) {
      setNotes(`Assigned Jobworking Vendor: ${companyName}`);
    }
  }, [workerNames, companyName, notes]);

  // Interactive Material Planning & Calculation Engine State
  const [calculationMode, setCalculationMode] = useState<'FROM_FABRIC' | 'FROM_PIECES'>('FROM_FABRIC');
  const [fabricRollLength, setFabricRollLength] = useState<number | ''>(100);
  const [targetPieces, setTargetPieces] = useState<number | ''>(150);
  const [pinningSizeMeters, setPinningSizeMeters] = useState<number | ''>(3);
  const [foldingCutsCount, setFoldingCutsCount] = useState<number | ''>(3);
  const [selectedCottonSpecId, setSelectedCottonSpecId] = useState('');

  // Auto-select initial values
  useEffect(() => {
    if (gamjeeProducts.length > 0 && !finishedProductId) {
      const match = gamjeeProducts.find((p) => p.name.toLowerCase().includes('gamjee')) || gamjeeProducts[0];
      setFinishedProductId(match.id);
    }
    if (sizes.length > 0 && !gamjeeSizeId) {
      setGamjeeSizeId(sizes[0].id);
    }
    if (cottonSpecs.length > 0 && !selectedCottonSpecId) {
      setSelectedCottonSpecId(cottonSpecs[0].id);
    }
  }, [gamjeeProducts, sizes, cottonSpecs, finishedProductId, gamjeeSizeId, selectedCottonSpecId]);

  // When Gamjee size changes, auto-match suitable Cotton Spec by width
  useEffect(() => {
    if (!gamjeeSizeId || cottonSpecs.length === 0) return;
    const currentSize = sizes.find((s) => s.id === gamjeeSizeId);
    if (currentSize?.width) {
      const matchingSpec = cottonSpecs.find(
        (c) => Number(c.gamjeeWidthCm) === Number(currentSize.width)
      );
      if (matchingSpec) {
        setSelectedCottonSpecId(matchingSpec.id);
      }
    }
  }, [gamjeeSizeId, sizes, cottonSpecs]);

  const selectedCottonSpec = cottonSpecs.find((c) => c.id === selectedCottonSpecId);

  // Dynamic Real-time Calculations
  const calculations = useMemo(() => {
    const pinningM = Number(pinningSizeMeters) > 0 ? Number(pinningSizeMeters) : 3;
    const cutsCount = Number(foldingCutsCount) > 0 ? Number(foldingCutsCount) : 3;
    const specWeightKg = selectedCottonSpec?.weightKg ? Number(selectedCottonSpec.weightKg) : 1.0;
    const specPiecesPerRoll = selectedCottonSpec?.piecesPerRoll ? Number(selectedCottonSpec.piecesPerRoll) : 12;

    if (calculationMode === 'FROM_FABRIC') {
      const totalFabricM = Number(fabricRollLength) > 0 ? Number(fabricRollLength) : 0;
      const foldsCount = Math.floor(totalFabricM / pinningM);
      const fabricUsedMeters = foldsCount * pinningM;
      const fabricRemnantMeters = Math.max(0, totalFabricM - fabricUsedMeters);
      const calculatedPieces = foldsCount * cutsCount;
      const cottonRollsNeeded = specPiecesPerRoll > 0 ? calculatedPieces / specPiecesPerRoll : 0;
      const cottonWeightKg = cottonRollsNeeded * specWeightKg;

      return {
        mode: 'FROM_FABRIC',
        inputFabricMeters: totalFabricM,
        pinningSizeMeters: pinningM,
        foldsCount,
        fabricUsedMeters,
        fabricRemnantMeters,
        foldingCutsCount: cutsCount,
        totalPieces: calculatedPieces,
        cottonRollsNeeded: Number(cottonRollsNeeded.toFixed(2)),
        cottonWeightKg: Number(cottonWeightKg.toFixed(2)),
        specPiecesPerRoll,
        specWeightKg,
        specName: selectedCottonSpec?.cottonType || '1 KG 900 Web',
      };
    } else {
      const targetPcs = Number(targetPieces) > 0 ? Number(targetPieces) : 0;
      const requiredFolds = Math.ceil(targetPcs / cutsCount);
      const calculatedPieces = requiredFolds * cutsCount;
      const fabricLengthNeeded = requiredFolds * pinningM;
      const cottonRollsNeeded = specPiecesPerRoll > 0 ? calculatedPieces / specPiecesPerRoll : 0;
      const cottonWeightKg = cottonRollsNeeded * specWeightKg;

      return {
        mode: 'FROM_PIECES',
        targetPieces: targetPcs,
        pinningSizeMeters: pinningM,
        foldsCount: requiredFolds,
        fabricUsedMeters: fabricLengthNeeded,
        fabricRemnantMeters: 0,
        foldingCutsCount: cutsCount,
        totalPieces: calculatedPieces,
        cottonRollsNeeded: Number(cottonRollsNeeded.toFixed(2)),
        cottonWeightKg: Number(cottonWeightKg.toFixed(2)),
        specPiecesPerRoll,
        specWeightKg,
        specName: selectedCottonSpec?.cottonType || '1 KG 900 Web',
      };
    }
  }, [
    calculationMode,
    fabricRollLength,
    targetPieces,
    pinningSizeMeters,
    foldingCutsCount,
    selectedCottonSpec,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishedProductId) {
      toast.error('Please select the finished Gamjee product');
      return;
    }
    if (calculations.totalPieces <= 0) {
      toast.error('Calculated production quantity must be greater than 0');
      return;
    }

    try {
      const created = await createBatchMutation.mutateAsync({
        finishedProductId,
        gamjeeSizeId: gamjeeSizeId || undefined,
        productionQuantity: calculations.totalPieces,
        productionUom: 'Rolls',
        productionDate,
        expectedCompletionDate: expectedDate || undefined,
        calculationMode,
        pinningSizeMeters: Number(pinningSizeMeters) || undefined,
        foldingCutsCount: Number(foldingCutsCount) || undefined,
        cottonSpecId: selectedCottonSpec?.id || undefined,
        cottonTypeName: selectedCottonSpec
          ? `${selectedCottonSpec.cottonType} (${selectedCottonSpec.gamjeeWidthCm}cm)`
          : undefined,
        plannedFabricMeters: calculations.fabricUsedMeters,
        plannedCottonKg: calculations.cottonWeightKg,
        notes: notes || undefined,
      });

      toast.success(`Production Batch ${created.batchNumber} created successfully!`);
      router.push(`/gamjee-production/batches/${created.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create production batch');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/gamjee-production/batches">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Create Gamjee Roll Production Batch
          </h1>
        </div>
      </div>

      {/* Job Work Hub Assignment Banner */}
      {executorType && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            executorType === 'WORKERS'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                executorType === 'WORKERS'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              }`}
            >
              {executorType === 'WORKERS' ? (
                <Users className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                {executorType === 'WORKERS'
                  ? 'Assigned In-House Workforce (Job Work Hub)'
                  : 'Assigned Jobworking Company (Job Work Hub)'}
              </span>
              <span className="text-sm font-bold text-foreground">
                {executorType === 'WORKERS' ? workerNames : companyName}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-background/90 border border-border shadow-2xs">
            Pre-assigned
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Target Product & Size */}
        <Card className="p-5 bg-card border-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Boxes className="h-4 w-4 text-emerald-500" />
            1. Target Finished Product & Dimensions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap">
                Finished Gamjee Product <span className="text-rose-500 ml-1">*</span>
              </label>
              <select
                value={finishedProductId}
                onChange={(e) => setFinishedProductId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                required
              >
                <option value="">Select Finished Product</option>
                {(gamjeeProducts.length > 0 ? gamjeeProducts : materials).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.sku}) - Stock: {m.currentStockBalance} {m.unit?.abbreviation || 'Rolls'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap">
                Gamjee Roll Size Specification
              </label>
              <select
                value={gamjeeSizeId}
                onChange={(e) => setGamjeeSizeId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                <option value="">Select Roll Size</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.width}cm x {s.length}m)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Card 2: Interactive Material Planning & Calculation Engine */}
        <Card className="p-5 bg-card border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-500" />
              2. Production & Material Planning Engine
            </h3>

            {/* Mode Switcher Tabs */}
            <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-0.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCalculationMode('FROM_FABRIC')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  calculationMode === 'FROM_FABRIC'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Scroll className="h-3.5 w-3.5" />
                <span>From Fabric Roll Length</span>
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode('FROM_PIECES')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  calculationMode === 'FROM_PIECES'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Boxes className="h-3.5 w-3.5" />
                <span>From Target Pieces</span>
              </button>
            </div>
          </div>

          {/* Planning Input Fields - Strict baseline & height alignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {/* Column 1: Fabric Roll Length OR Target Pieces */}
            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap truncate">
                {calculationMode === 'FROM_FABRIC' ? 'Fabric Roll (Meters)' : 'Target Output (Pieces)'}
                <span className="text-rose-500 ml-1">*</span>
              </label>
              {calculationMode === 'FROM_FABRIC' ? (
                <Input
                  type="number"
                  step="0.5"
                  min="1"
                  placeholder="100"
                  value={fabricRollLength}
                  onChange={(e) =>
                    setFabricRollLength(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-10 font-mono"
                  required
                />
              ) : (
                <Input
                  type="number"
                  min="1"
                  placeholder="150"
                  value={targetPieces}
                  onChange={(e) =>
                    setTargetPieces(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-10 font-mono"
                  required
                />
              )}
            </div>

            {/* Column 2: Pinning Size in Meters */}
            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap truncate">
                Pinning Size (Meters) <span className="text-rose-500 ml-1">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                placeholder="3"
                value={pinningSizeMeters}
                onChange={(e) =>
                  setPinningSizeMeters(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="h-10 font-mono"
                required
              />
            </div>

            {/* Column 3: Folding & Cutting Multiplier */}
            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap truncate">
                Folding & Cutting (Cuts) <span className="text-rose-500 ml-1">*</span>
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="3"
                value={foldingCutsCount}
                onChange={(e) =>
                  setFoldingCutsCount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="h-10 font-mono"
                required
              />
            </div>

            {/* Column 4: Cotton Specification */}
            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap truncate">
                Cotton Specification <span className="text-rose-500 ml-1">*</span>
              </label>
              <select
                value={selectedCottonSpecId}
                onChange={(e) => setSelectedCottonSpecId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                required
              >
                <option value="">Select Cotton Spec</option>
                {cottonSpecs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cottonType} ({c.gamjeeWidthCm}cm) - {c.piecesPerRoll} pcs/{c.weightKg}kg
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* LIVE PRODUCTION YIELD BREAKDOWN BANNER */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Live Production Blueprint & Yield Calculation
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                (Fabric ÷ Pinning) × Cuts = Gamjee Pieces
              </span>
            </div>

            {/* Step by Step Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              {/* Step 1: Pinning */}
              <div className="p-3 bg-card rounded-lg border border-border/80 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Pinning Folds
                  </span>
                  <span>{calculations.pinningSizeMeters}m / fold</span>
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {calculations.foldsCount} Folds
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {calculationMode === 'FROM_FABRIC'
                    ? `${calculations.inputFabricMeters}m ÷ ${calculations.pinningSizeMeters}m = ${calculations.foldsCount} folds (${calculations.fabricRemnantMeters}m remnant)`
                    : `${calculations.foldsCount} folds × ${calculations.pinningSizeMeters}m = ${calculations.fabricUsedMeters}m fabric`}
                </p>
              </div>

              {/* Step 2: Cutting */}
              <div className="p-3 bg-card rounded-lg border border-border/80 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Cutting Output
                  </span>
                  <span>{calculations.foldingCutsCount} cuts / fold</span>
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {calculations.totalPieces} Gamjee Rolls
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {calculations.foldsCount} folds × {calculations.foldingCutsCount} cuts ={' '}
                  {calculations.totalPieces} pieces
                </p>
              </div>

              {/* Step 3: Cotton Requirement */}
              <div className="p-3 bg-card rounded-lg border border-border/80 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    Cotton Requirement
                  </span>
                  <span>{calculations.specPiecesPerRoll} pcs / {calculations.specWeightKg} kg</span>
                </div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {calculations.cottonWeightKg} KG Cotton
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {calculations.totalPieces} pcs ÷ {calculations.specPiecesPerRoll} pcs/kg ={' '}
                  <strong className="text-foreground">{calculations.cottonWeightKg} KG</strong>
                </p>
              </div>
            </div>

            {/* 3 Summary Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-border/60">
              <div className="p-2 bg-secondary/40 rounded-md text-center">
                <span className="text-[10px] text-muted-foreground block">Planned Output</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {calculations.totalPieces} Rolls
                </span>
              </div>
              <div className="p-2 bg-secondary/40 rounded-md text-center">
                <span className="text-[10px] text-muted-foreground block">Fabric Required</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {calculations.fabricUsedMeters} Meters
                </span>
              </div>
              <div className="p-2 bg-secondary/40 rounded-md text-center">
                <span className="text-[10px] text-muted-foreground block">Cotton Required</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {calculations.cottonWeightKg} KG
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Schedule Dates & Job Notes */}
        <Card className="p-5 bg-card border-border shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            3. Production Schedule & Order Reference
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap">
                Production Start Date <span className="text-rose-500 ml-1">*</span>
              </label>
              <Input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="h-10"
                required
              />
            </div>

            <div>
              <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap">
                Expected Completion Date (Optional)
              </label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2">
          <Link href="/gamjee-production/batches" className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="w-full sm:w-auto justify-center">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={createBatchMutation.isPending || calculations.totalPieces <= 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm font-semibold px-6 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {createBatchMutation.isPending
                ? 'Creating Batch...'
                : `Create Batch (${calculations.totalPieces} Rolls)`}
            </span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateGamjeeBatchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Gamjee production batch setup...</div>}>
      <CreateGamjeeBatchContent />
    </Suspense>
  );
}

