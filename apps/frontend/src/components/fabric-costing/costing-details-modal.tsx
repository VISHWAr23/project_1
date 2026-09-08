'use client';

import React from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  Layers,
  Scale,
  CircleDollarSign,
  Calendar,
  User,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GreyFabricCosting } from '@/types/fabric-costing.types';
import { formatDate } from '@/lib/date-utils';

interface CostingDetailsModalProps {
  costing: GreyFabricCosting | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CostingDetailsModal({ costing, isOpen, onClose }: CostingDetailsModalProps) {
  if (!isOpen || !costing) return null;

  const handlePrint = () => {
    window.print();
  };

  // Cost percentage distribution
  const total = costing.totalProductionCost || 1;
  const warpPct = ((costing.warpTotalPrice / total) * 100).toFixed(1);
  const weftPct = ((costing.weftTotalPrice / total) * 100).toFixed(1);
  const sizingPct = ((costing.sizingTotalWages / total) * 100).toFixed(1);
  const weavingPct = ((costing.weavingTotalWages / total) * 100).toFixed(1);
  const bleachingPct = ((costing.bleachingTotalCharges / total) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto print:max-h-none print:shadow-none print:border-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/25 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  Fabric Costing Formulation Sheet
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {costing.qualityName}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                சாம்பல் துணி மற்றும் பிளீச்சிங் அடக்கவிலை விரிவான கணக்கீடு
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-8 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Sheet
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Header Summary for Print / View */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-foreground">{costing.qualityName}</h1>
              {costing.notes && <p className="text-xs text-muted-foreground mt-0.5">{costing.notes}</p>}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(costing.createdAt)}
                </span>
                {costing.createdBy && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {costing.createdBy.email}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase font-semibold">
                Cost per Meter (மீட்டர் அடக்கவிலை)
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                ₹{costing.costPerMeter.toFixed(2)}
                <span className="text-xs font-normal text-muted-foreground ml-1">/ meter</span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Total ₹{costing.totalProductionCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })} for {costing.totalLengthMeters}m
              </div>
            </div>
          </div>

          {/* Cost Composition Distribution Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span>Cost Composition Breakdown</span>
              <span>100% of ₹{costing.totalProductionCost.toFixed(2)}</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden flex bg-muted/60 text-[10px] text-white font-mono font-bold">
              <div
                style={{ width: `${warpPct}%` }}
                className="bg-indigo-600 flex items-center justify-center"
                title={`Warp Yarn: ${warpPct}% (₹${costing.warpTotalPrice})`}
              >
                {Number(warpPct) > 8 ? `${warpPct}%` : ''}
              </div>
              <div
                style={{ width: `${weftPct}%` }}
                className="bg-sky-500 flex items-center justify-center"
                title={`Weft Yarn: ${weftPct}% (₹${costing.weftTotalPrice})`}
              >
                {Number(weftPct) > 8 ? `${weftPct}%` : ''}
              </div>
              <div
                style={{ width: `${weavingPct}%` }}
                className="bg-emerald-500 flex items-center justify-center"
                title={`Weaving: ${weavingPct}% (₹${costing.weavingTotalWages})`}
              >
                {Number(weavingPct) > 8 ? `${weavingPct}%` : ''}
              </div>
              <div
                style={{ width: `${bleachingPct}%` }}
                className="bg-amber-500 flex items-center justify-center"
                title={`Bleaching: ${bleachingPct}% (₹${costing.bleachingTotalCharges})`}
              >
                {Number(bleachingPct) > 8 ? `${bleachingPct}%` : ''}
              </div>
              <div
                style={{ width: `${sizingPct}%` }}
                className="bg-rose-500 flex items-center justify-center"
                title={`Sizing: ${sizingPct}% (₹${costing.sizingTotalWages})`}
              >
                {Number(sizingPct) > 5 ? `${sizingPct}%` : ''}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
                <span className="text-muted-foreground">Warp Yarn: <b>{warpPct}%</b> (₹{costing.warpTotalPrice.toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-sky-500" />
                <span className="text-muted-foreground">Weft Yarn: <b>{weftPct}%</b> (₹{costing.weftTotalPrice.toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                <span className="text-muted-foreground">Weaving: <b>{weavingPct}%</b> (₹{costing.weavingTotalWages.toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                <span className="text-muted-foreground">Bleaching: <b>{bleachingPct}%</b> (₹{costing.bleachingTotalCharges.toFixed(2)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                <span className="text-muted-foreground">Sizing: <b>{sizingPct}%</b> (₹{costing.sizingTotalWages.toFixed(2)})</span>
              </div>
            </div>
          </div>

          {/* Mathematical Step-by-Step Equations (Matching Notebook Formulas) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Textile Mathematical Derivation (கணக்கீட்டு வழிமுறைகள்)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formula 1: Warp Yarn Weight */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    1. பாவு நூல் எடை (Warp Yarn Weight)
                  </span>
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {costing.warpWeightKg} kg
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  = ((Ends × 0.54 × Yards) ÷ Warp Count) ÷ 1000
                  <br />
                  = (({costing.ends} × {costing.yarnConstant} × {costing.totalLengthYards}) ÷ {costing.warpCount}) ÷ {costing.conversionDivisor}
                  <br />
                  = <span className="text-foreground font-semibold">{costing.warpWeightKg} kg</span>
                </div>
                <div className="text-xs flex justify-between items-center pt-1 text-muted-foreground">
                  <span>பாவு நூல் Price ({costing.warpWeightKg} × ₹{costing.warpPricePerKg}/kg):</span>
                  <span className="font-mono font-bold text-foreground">
                    ₹{costing.warpTotalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Formula 2: Weft Yarn Weight */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    2. ஊடை நூல் எடை (Weft Yarn Weight)
                  </span>
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {costing.weftWeightKg} kg
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  அகலம் = ({costing.ends} - {costing.endsDeduction}) ÷ {costing.reed} = {costing.reedSpaceInches}&quot;
                  <br />
                  = (({costing.reedSpaceInches}&quot; × {costing.pick} × {costing.yarnConstant} × {costing.totalLengthYards}) ÷ {costing.weftCount}) ÷ {costing.conversionDivisor}
                  <br />
                  = <span className="text-foreground font-semibold">{costing.weftWeightKg} kg</span>
                </div>
                <div className="text-xs flex justify-between items-center pt-1 text-muted-foreground">
                  <span>ஊடை நூல் Price ({costing.weftWeightKg} × ₹{costing.weftPricePerKg}/kg):</span>
                  <span className="font-mono font-bold text-foreground">
                    ₹{costing.weftTotalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Formula 3: Sizing Wages */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    3. சைசிங் Wages (Sizing Wages)
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    ₹{costing.sizingTotalWages.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  = பாவு எடை × Amt per kg
                  <br />
                  = {costing.warpWeightKg} kg × ₹{costing.sizingRatePerKg}
                  <br />
                  = <span className="text-foreground font-semibold">₹{costing.sizingTotalWages.toFixed(2)}</span>
                </div>
              </div>

              {/* Formula 4: Weaving Wages */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    4. நெசவு Wages (Weaving Wages)
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    ₹{costing.weavingTotalWages.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  = (Amt per meter ÷ 16) × Pick × Total length
                  <br />
                  = (₹{costing.weavingRatePerMeter} ÷ {costing.baseReedPicks}) × {costing.pick} × {costing.totalLengthMeters}m
                  <br />
                  = <span className="text-foreground font-semibold">₹{costing.weavingTotalWages.toFixed(2)}</span>
                </div>
              </div>

              {/* Formula 5: Bleaching Charges */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    5. Bleaching Charges (பிளீச்சிங் கட்டணம்)
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    ₹{costing.bleachingTotalCharges.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  = Amt per kg × Total weight
                  <br />
                  = ₹{costing.bleachingRatePerKg} × {costing.totalWeightKg} kg
                  <br />
                  = <span className="text-foreground font-semibold">₹{costing.bleachingTotalCharges.toFixed(2)}</span>
                </div>
              </div>

              {/* Formula 6: Fabric Weight & Density */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    6. Total Weight & Density (எடை அடர்த்தி)
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {costing.weightPerMeterGram} g/m
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  = {costing.warpWeightKg} kg + {costing.weftWeightKg} kg = <span className="font-semibold text-foreground">{costing.totalWeightKg} kg</span>
                  <br />
                  1 meter = {costing.weightPerMeterKg} kg (or {costing.weightPerMeterGram} grams)
                </div>
              </div>
            </div>
          </div>

          {/* Cost Sheet Summary Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/40 px-4 py-2.5 text-xs font-bold text-foreground border-b border-border">
              Summary Cost Ledger (மொத்த அடக்கவிலை தொகுப்பு)
            </div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-2.5 text-muted-foreground">பாவு எடை Price (Warp Yarn Cost)</td>
                  <td className="p-2.5 text-right font-mono font-medium text-foreground">₹{costing.warpTotalPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-muted-foreground">ஊடை எடை Price (Weft Yarn Cost)</td>
                  <td className="p-2.5 text-right font-mono font-medium text-foreground">₹{costing.weftTotalPrice.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-muted-foreground">சைசிங் Wages (Sizing Wages)</td>
                  <td className="p-2.5 text-right font-mono font-medium text-foreground">₹{costing.sizingTotalWages.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-muted-foreground">நெசவு Wages (Weaving Wages)</td>
                  <td className="p-2.5 text-right font-mono font-medium text-foreground">₹{costing.weavingTotalWages.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-muted-foreground">Bleaching Charges (பிளீச்சிங் கட்டணம்)</td>
                  <td className="p-2.5 text-right font-mono font-medium text-foreground">₹{costing.bleachingTotalCharges.toFixed(2)}</td>
                </tr>
                <tr className="bg-primary/5 font-bold">
                  <td className="p-3 text-foreground text-sm">
                    Total Production Cost for {costing.totalLengthMeters} meters
                  </td>
                  <td className="p-3 text-right font-mono text-base text-primary">
                    ₹{costing.totalProductionCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-emerald-500/10 font-bold">
                  <td className="p-3 text-emerald-700 dark:text-emerald-300 text-sm">
                    1 Meter Finished Cost (மீட்டர் அடக்கவிலை)
                  </td>
                  <td className="p-3 text-right font-mono text-lg text-emerald-600 dark:text-emerald-400">
                    ₹{costing.costPerMeter.toFixed(2)} / meter
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border bg-muted/25 flex items-center justify-between print:hidden">
          <div className="text-xs text-muted-foreground">
            Circled Constants: 0.54 yarn const • 24 selvedge ded • 1.12 yard factor • 1000 divisor • 16 reed base
          </div>
          <Button onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
