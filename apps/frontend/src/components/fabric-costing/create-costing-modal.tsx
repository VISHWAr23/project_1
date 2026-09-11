'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Calculator,
  Sparkles,
  Layers,
  CircleDollarSign,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateFabricCosting } from '@/hooks/useFabricCosting';
import { computeFabricCosting } from '@ims/validation';

interface CreateCostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCostingModal({ isOpen, onClose, onSuccess }: CreateCostingModalProps) {
  const createMutation = useCreateFabricCosting();

  // Form State
  const [qualityName, setQualityName] = useState('Cotton Gauze 40s x 40s');
  const [notes, setNotes] = useState('');

  // Primary Specifications
  const [ends, setEnds] = useState<number>(780);
  const [reed, setReed] = useState<number>(16);
  const [pick, setPick] = useState<number>(13);
  const [totalLengthMeters, setTotalLengthMeters] = useState<number>(1000);
  const [warpCount, setWarpCount] = useState<number>(41);
  const [weftCount, setWeftCount] = useState<number>(40);

  // Pricing & Wage Rates
  const [warpPricePerKg, setWarpPricePerKg] = useState<number>(315);
  const [weftPricePerKg, setWeftPricePerKg] = useState<number>(300);
  const [sizingRatePerKg, setSizingRatePerKg] = useState<number>(38.6);
  const [weavingRatePerMeter, setWeavingRatePerMeter] = useState<number>(2.015);
  const [bleachingRatePerKg, setBleachingRatePerKg] = useState<number>(57);

  // Circled Constants (Configurable with mill defaults)
  const [yarnConstant, setYarnConstant] = useState<number>(0.54);
  const [conversionDivisor, setConversionDivisor] = useState<number>(1000);
  const [endsDeduction, setEndsDeduction] = useState<number>(24);
  const [meterToYardFactor, setMeterToYardFactor] = useState<number>(1.12);
  const [baseReedPicks, setBaseReedPicks] = useState<number>(16);

  const [showConstants, setShowConstants] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Real-time calculation using shared calculation engine
  const calculation = useMemo(() => {
    try {
      return computeFabricCosting({
        ends: Number(ends) || 0,
        reed: Number(reed) || 1,
        pick: Number(pick) || 0,
        totalLengthMeters: Number(totalLengthMeters) || 0,
        warpCount: Number(warpCount) || 1,
        weftCount: Number(weftCount) || 1,
        warpPricePerKg: Number(warpPricePerKg) || 0,
        weftPricePerKg: Number(weftPricePerKg) || 0,
        sizingRatePerKg: Number(sizingRatePerKg) || 0,
        weavingRatePerMeter: Number(weavingRatePerMeter) || 0,
        bleachingRatePerKg: Number(bleachingRatePerKg) || 0,
        yarnConstant: Number(yarnConstant) || 0.54,
        conversionDivisor: Number(conversionDivisor) || 1000,
        endsDeduction: Number(endsDeduction) ?? 24,
        meterToYardFactor: Number(meterToYardFactor) || 1.12,
        baseReedPicks: Number(baseReedPicks) || 16,
      });
    } catch (e) {
      return null;
    }
  }, [
    ends,
    reed,
    pick,
    totalLengthMeters,
    warpCount,
    weftCount,
    warpPricePerKg,
    weftPricePerKg,
    sizingRatePerKg,
    weavingRatePerMeter,
    bleachingRatePerKg,
    yarnConstant,
    conversionDivisor,
    endsDeduction,
    meterToYardFactor,
    baseReedPicks,
  ]);

  if (!isOpen) return null;

  const handleLoadStandardGauze = () => {
    setQualityName('Standard Hospital Gauze 40s (780 Ends x 16 Reed x 13 Pick)');
    setNotes('Standard Mill Formulation for absorbent gauze rolls');
    setEnds(780);
    setReed(16);
    setPick(13);
    setTotalLengthMeters(1000);
    setWarpCount(41);
    setWeftCount(40);
    setWarpPricePerKg(315);
    setWeftPricePerKg(300);
    setSizingRatePerKg(38.6);
    setWeavingRatePerMeter(2.015);
    setBleachingRatePerKg(57);
    setYarnConstant(0.54);
    setConversionDivisor(1000);
    setEndsDeduction(24);
    setMeterToYardFactor(1.12);
    setBaseReedPicks(16);
    setFormError(null);
  };

  const handleLoadBP17Gauze = () => {
    setQualityName('BP17 Premium Absorbent Gauze 120cm (960 Ends x 20 Reed x 16 Pick)');
    setNotes('British Pharmacopoeia surgical gauze specification for sterile absorbent pads');
    setEnds(960);
    setReed(20);
    setPick(16);
    setTotalLengthMeters(1000);
    setWarpCount(40);
    setWeftCount(40);
    setWarpPricePerKg(320);
    setWeftPricePerKg(310);
    setSizingRatePerKg(40.0);
    setWeavingRatePerMeter(2.25);
    setBleachingRatePerKg(58.0);
    setYarnConstant(0.54);
    setConversionDivisor(1000);
    setEndsDeduction(24);
    setMeterToYardFactor(1.12);
    setBaseReedPicks(16);
    setFormError(null);
  };

  const handleLoadBedSheeting = () => {
    setQualityName('Hospital Heavy Sheeting Bed Linen (1240 Ends x 24 Reed x 20 Pick)');
    setNotes('Commercial bleached sheeting specification for hospital bed linen and surgical covers');
    setEnds(1240);
    setReed(24);
    setPick(20);
    setTotalLengthMeters(1000);
    setWarpCount(30);
    setWeftCount(30);
    setWarpPricePerKg(295);
    setWeftPricePerKg(285);
    setSizingRatePerKg(36.0);
    setWeavingRatePerMeter(2.50);
    setBleachingRatePerKg(55.0);
    setYarnConstant(0.54);
    setConversionDivisor(1000);
    setEndsDeduction(24);
    setMeterToYardFactor(1.12);
    setBaseReedPicks(16);
    setFormError(null);
  };

  const handleResetForm = () => {
    setQualityName('');
    setNotes('');
    setEnds(0);
    setReed(16);
    setPick(0);
    setTotalLengthMeters(1000);
    setWarpCount(40);
    setWeftCount(40);
    setWarpPricePerKg(0);
    setWeftPricePerKg(0);
    setSizingRatePerKg(0);
    setWeavingRatePerMeter(0);
    setBleachingRatePerKg(0);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!qualityName.trim()) {
      setFormError('Quality / Fabric name is required');
      return;
    }
    if (!ends || ends <= 0) {
      setFormError('Ends must be greater than 0');
      return;
    }
    if (!reed || reed <= 0) {
      setFormError('Reed must be greater than 0');
      return;
    }
    if (!pick || pick <= 0) {
      setFormError('Pick must be greater than 0');
      return;
    }
    if (!totalLengthMeters || totalLengthMeters <= 0) {
      setFormError('Total length in meters is required');
      return;
    }
    if (!warpCount || warpCount <= 0 || !weftCount || weftCount <= 0) {
      setFormError('Warp and Weft counts must be greater than 0');
      return;
    }

    try {
      await createMutation.mutateAsync({
        qualityName: qualityName.trim(),
        notes: notes.trim() || null,
        ends: Number(ends),
        reed: Number(reed),
        pick: Number(pick),
        totalLengthMeters: Number(totalLengthMeters),
        warpCount: Number(warpCount),
        weftCount: Number(weftCount),
        warpPricePerKg: Number(warpPricePerKg),
        weftPricePerKg: Number(weftPricePerKg),
        sizingRatePerKg: Number(sizingRatePerKg),
        weavingRatePerMeter: Number(weavingRatePerMeter),
        bleachingRatePerKg: Number(bleachingRatePerKg),
        yarnConstant: Number(yarnConstant),
        conversionDivisor: Number(conversionDivisor),
        endsDeduction: Number(endsDeduction),
        meterToYardFactor: Number(meterToYardFactor),
        baseReedPicks: Number(baseReedPicks),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save fabric costing record');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-card border border-border w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/25">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  New Fabric Production & Bleaching Costing
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Calculator
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                சாம்பல் துணி உற்பத்தி மற்றும் பிளீச்சிங் அடக்கவிலை கணக்கீடு
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadStandardGauze}
              className="text-xs h-7 px-2.5 gap-1 border-primary/30 text-primary hover:bg-primary/10"
              title="Standard Gauze 40s (780 Ends x 16 Reed x 13 Pick)"
            >
              <Sparkles className="w-3 h-3" />
              Standard Gauze
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadBP17Gauze}
              className="text-xs h-7 px-2.5 gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              title="BP17 Absorbent Gauze 120cm (960 Ends x 20 Reed x 16 Pick)"
            >
              <Sparkles className="w-3 h-3" />
              BP17 Gauze
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadBedSheeting}
              className="text-xs h-7 px-2.5 gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
              title="Hospital Heavy Sheeting Bed Linen (1240 Ends x 24 Reed x 20 Pick)"
            >
              <Sparkles className="w-3 h-3" />
              Bed Sheeting
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-column grid (Left: Inputs, Right: Live Mathematical Preview) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* General Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Fabric Quality & Identification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Quality / Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={qualityName}
                      onChange={(e) => setQualityName(e.target.value)}
                      placeholder="e.g. Gauze Fabric 40s x 40s - (780 Ends / 16 Reed)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Notes / Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Export grade, weaving in Mill B"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Weaving Specifications */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-500" />
                  Weaving Construction Parameters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Ends (பாவு நூல்) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={ends || ''}
                      onChange={(e) => setEnds(Number(e.target.value))}
                      placeholder="780"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Reed <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={reed || ''}
                      onChange={(e) => setReed(Number(e.target.value))}
                      placeholder="16"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Pick (Pice) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={pick || ''}
                      onChange={(e) => setPick(Number(e.target.value))}
                      placeholder="13"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Length (Meters) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={totalLengthMeters || ''}
                      onChange={(e) => setTotalLengthMeters(Number(e.target.value))}
                      placeholder="1000"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Warp Count (பாவு) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={warpCount || ''}
                      onChange={(e) => setWarpCount(Number(e.target.value))}
                      placeholder="41"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                      min={0.1}
                      step="any"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Weft Count (ஊடை) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={weftCount || ''}
                      onChange={(e) => setWeftCount(Number(e.target.value))}
                      placeholder="40"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                      min={0.1}
                      step="any"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Wage Rates */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CircleDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Yarn Prices & Processing Wages
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Warp Price (₹/kg)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <input
                        type="number"
                        value={warpPricePerKg || ''}
                        onChange={(e) => setWarpPricePerKg(Number(e.target.value))}
                        placeholder="315"
                        className="w-full pl-6 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        min={0}
                        step="any"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Weft Price (₹/kg)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <input
                        type="number"
                        value={weftPricePerKg || ''}
                        onChange={(e) => setWeftPricePerKg(Number(e.target.value))}
                        placeholder="300"
                        className="w-full pl-6 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        min={0}
                        step="any"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Sizing Wages (₹/kg)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <input
                        type="number"
                        value={sizingRatePerKg || ''}
                        onChange={(e) => setSizingRatePerKg(Number(e.target.value))}
                        placeholder="38.60"
                        className="w-full pl-6 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        min={0}
                        step="any"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Weaving Rate (₹/m base)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <input
                        type="number"
                        value={weavingRatePerMeter || ''}
                        onChange={(e) => setWeavingRatePerMeter(Number(e.target.value))}
                        placeholder="2.015"
                        className="w-full pl-6 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        min={0}
                        step="any"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Bleaching Rate (₹/kg)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
                      <input
                        type="number"
                        value={bleachingRatePerKg || ''}
                        onChange={(e) => setBleachingRatePerKg(Number(e.target.value))}
                        placeholder="57.00"
                        className="w-full pl-6 pr-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        min={0}
                        step="any"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Circled Constants Accordion */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/10">
                <button
                  type="button"
                  onClick={() => setShowConstants(!showConstants)}
                  className="w-full px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-foreground">Circled Constants (வட்டமிட்ட மாறிலிகள்)</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Standard Mill Defaults
                    </span>
                  </div>
                  {showConstants ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showConstants && (
                  <div className="p-4 border-t border-border/60 bg-background/50 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        Yarn Constant
                        <span className="text-amber-500 font-bold" title="Circled in notes: 0.54 (0.453592 / 840)">ⓘ (0.54)</span>
                      </label>
                      <input
                        type="number"
                        value={yarnConstant}
                        onChange={(e) => setYarnConstant(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background font-mono"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        Ends Deduction
                        <span className="text-amber-500 font-bold" title="Circled in notes: (Ends - 24)">ⓘ (24)</span>
                      </label>
                      <input
                        type="number"
                        value={endsDeduction}
                        onChange={(e) => setEndsDeduction(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        M2Y Factor (Yards/m)
                        <span className="text-amber-500 font-bold" title="Boxed in notes: 1 meter = 1.12 yards">ⓘ (1.12)</span>
                      </label>
                      <input
                        type="number"
                        value={meterToYardFactor}
                        onChange={(e) => setMeterToYardFactor(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background font-mono"
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        Conversion Divisor
                        <span className="text-amber-500 font-bold" title="Circled in notes: 1000">ⓘ (1000)</span>
                      </label>
                      <input
                        type="number"
                        value={conversionDivisor}
                        onChange={(e) => setConversionDivisor(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        Base Reed / Picks
                        <span className="text-amber-500 font-bold" title="Used in weaving wage divisor: 16">ⓘ (16)</span>
                      </label>
                      <input
                        type="number"
                        value={baseReedPicks}
                        onChange={(e) => setBaseReedPicks(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Mathematical Breakdown Preview (5 cols) */}
            <div className="lg:col-span-5 bg-muted/20 border border-border rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Live Calculation Breakdown
                    </h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Auto-computed
                  </span>
                </div>

                {calculation ? (
                  <div className="space-y-3.5 pt-3 text-xs">
                    {/* 1. Warp Yarn Calculation */}
                    <div className="p-2.5 rounded-lg bg-card border border-border/70 space-y-1">
                      <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                        <span className="font-semibold text-foreground">1. பாவு நூல் எடை (Warp Weight)</span>
                        <span className="font-mono text-primary font-bold">{calculation.warpWeightKg} kg</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        ({ends} × {yarnConstant} × {calculation.totalLengthYards} yds) ÷ {warpCount} ÷ {conversionDivisor}
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border/40 font-medium">
                        <span>பாவு நூல் விலை ({calculation.warpWeightKg} × ₹{warpPricePerKg}):</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          ₹{calculation.warpTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* 2. Weft Yarn Calculation */}
                    <div className="p-2.5 rounded-lg bg-card border border-border/70 space-y-1">
                      <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                        <span className="font-semibold text-foreground">2. ஊடை நூல் எடை (Weft Weight)</span>
                        <span className="font-mono text-primary font-bold">{calculation.weftWeightKg} kg</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        அகலம்: ({ends} - {endsDeduction}) ÷ {reed} = {calculation.reedSpaceInches}&quot;
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        ({calculation.reedSpaceInches}&quot; × {pick} × {yarnConstant} × {calculation.totalLengthYards}) ÷ {weftCount} ÷ {conversionDivisor}
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border/40 font-medium">
                        <span>ஊடை நூல் விலை ({calculation.weftWeightKg} × ₹{weftPricePerKg}):</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          ₹{calculation.weftTotalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* 3. Total Fabric Weight */}
                    <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-foreground text-[11px]">மொத்த எடை (Total Weight)</div>
                        <div className="text-[10px] text-muted-foreground">
                          {calculation.warpWeightKg} kg + {calculation.weftWeightKg} kg
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {calculation.totalWeightKg} kg
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {calculation.weightPerMeterGram} g/meter
                        </div>
                      </div>
                    </div>

                    {/* 4. Wages & Charges */}
                    <div className="p-2.5 rounded-lg bg-card border border-border/70 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">சைசிங் Wages ({calculation.warpWeightKg} × ₹{sizingRatePerKg}):</span>
                        <span className="font-mono font-semibold text-foreground">
                          ₹{calculation.sizingTotalWages.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">நெசவு Wages ((₹{weavingRatePerMeter}/16) × {pick} × {totalLengthMeters}m):</span>
                        <span className="font-mono font-semibold text-foreground">
                          ₹{calculation.weavingTotalWages.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bleaching Charges (₹{bleachingRatePerKg} × {calculation.totalWeightKg} kg):</span>
                        <span className="font-mono font-semibold text-foreground">
                          ₹{calculation.bleachingTotalCharges.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-xs">
                    Fill in specifications to view live calculation preview
                  </div>
                )}
              </div>

              {/* Bottom Final Total Summary Card */}
              {calculation && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Production Cost (மொத்த அடக்கவிலை)
                    </span>
                    <span className="text-base font-bold font-mono text-primary">
                      ₹{calculation.totalProductionCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                    <span className="text-xs font-bold text-foreground">
                      Final Cost Per Meter (மீட்டர் அடக்கவிலை):
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ₹{calculation.costPerMeter.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">/ meter</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3.5 border-t border-border bg-muted/25 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="text-xs gap-1.5 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                {createMutation.isPending ? 'Saving Record...' : 'Save Costing Record'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
