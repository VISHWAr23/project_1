'use client';

import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Check,
  RotateCcw,
  Eye,
  CheckSquare,
  Square,
  Search,
  X,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColumnDefinition } from '@/types/fabric-costing.types';

export const ALL_AVAILABLE_COLUMNS: ColumnDefinition[] = [
  // Primary
  { id: 'qualityName', label: 'Quality / Item', category: 'primary', defaultVisible: true, align: 'left', width: '220px' },
  { id: 'totalLengthMeters', label: 'Length (Meters)', category: 'primary', defaultVisible: true, align: 'right', width: '120px' },
  { id: 'totalLengthYards', label: 'Length (Yards)', category: 'primary', defaultVisible: false, align: 'right', width: '120px' },
  { id: 'ends', label: 'Ends', category: 'primary', defaultVisible: false, align: 'right', width: '90px' },
  { id: 'reed', label: 'Reed', category: 'primary', defaultVisible: false, align: 'right', width: '90px' },
  { id: 'pick', label: 'Pick', category: 'primary', defaultVisible: false, align: 'right', width: '90px' },
  { id: 'warpCount', label: 'Warp Count', category: 'primary', defaultVisible: false, align: 'right', width: '100px' },
  { id: 'weftCount', label: 'Weft Count', category: 'primary', defaultVisible: false, align: 'right', width: '100px' },

  // Physical Attributes
  { id: 'reedSpaceInches', label: 'Width / Reed Space (in)', tamilLabel: 'துணி அகலம்', category: 'physical', defaultVisible: false, align: 'right', width: '130px' },
  { id: 'warpWeightKg', label: 'Warp Weight (kg)', tamilLabel: 'பாவு நூல் எடை', category: 'physical', defaultVisible: false, align: 'right', width: '130px' },
  { id: 'weftWeightKg', label: 'Weft Weight (kg)', tamilLabel: 'ஊடை நூல் எடை', category: 'physical', defaultVisible: false, align: 'right', width: '130px' },
  { id: 'totalWeightKg', label: 'Total Weight (kg)', tamilLabel: 'மொத்த எடை', category: 'physical', defaultVisible: true, align: 'right', width: '130px' },
  { id: 'weightPerMeterGram', label: 'Weight / Meter (g/m)', tamilLabel: 'மீட்டர் எடை', category: 'physical', defaultVisible: true, align: 'right', width: '140px' },

  // Wages & Component Costs
  { id: 'warpPricePerKg', label: 'Warp Rate (₹/kg)', category: 'wages', defaultVisible: false, align: 'right', width: '120px' },
  { id: 'warpTotalPrice', label: 'Warp Cost (₹)', tamilLabel: 'பாவு நூல் விலை', category: 'wages', defaultVisible: true, align: 'right', width: '130px' },
  { id: 'weftPricePerKg', label: 'Weft Rate (₹/kg)', category: 'wages', defaultVisible: false, align: 'right', width: '120px' },
  { id: 'weftTotalPrice', label: 'Weft Cost (₹)', tamilLabel: 'ஊடை நூல் விலை', category: 'wages', defaultVisible: true, align: 'right', width: '130px' },
  { id: 'sizingRatePerKg', label: 'Sizing Rate (₹/kg)', category: 'wages', defaultVisible: false, align: 'right', width: '125px' },
  { id: 'sizingTotalWages', label: 'Sizing Wages (₹)', tamilLabel: 'சைசிங் Wages', category: 'wages', defaultVisible: true, align: 'right', width: '130px' },
  { id: 'weavingRatePerMeter', label: 'Weaving Base Rate (₹/m)', category: 'wages', defaultVisible: false, align: 'right', width: '140px' },
  { id: 'weavingTotalWages', label: 'Weaving Wages (₹)', tamilLabel: 'நெசவு Wages', category: 'wages', defaultVisible: true, align: 'right', width: '135px' },
  { id: 'bleachingRatePerKg', label: 'Bleaching Rate (₹/kg)', category: 'wages', defaultVisible: false, align: 'right', width: '135px' },
  { id: 'bleachingTotalCharges', label: 'Bleaching Charges (₹)', tamilLabel: 'பிளீச்சிங் கட்டணம்', category: 'wages', defaultVisible: true, align: 'right', width: '145px' },

  // Final Results
  { id: 'totalProductionCost', label: 'Total Cost (₹)', tamilLabel: 'மொத்த அடக்கவிலை', category: 'primary', defaultVisible: true, align: 'right', width: '140px' },
  { id: 'costPerMeter', label: 'Cost / Meter (₹/m)', tamilLabel: 'மீட்டர் அடக்கவிலை', category: 'primary', defaultVisible: true, align: 'right', width: '140px' },

  // Circled Constants
  { id: 'yarnConstant', label: 'Yarn Const (0.54)', category: 'constants', defaultVisible: false, align: 'right', width: '120px' },
  { id: 'conversionDivisor', label: 'Divisor (1000)', category: 'constants', defaultVisible: false, align: 'right', width: '110px' },
  { id: 'endsDeduction', label: 'Ends Ded (24)', category: 'constants', defaultVisible: false, align: 'right', width: '110px' },
  { id: 'meterToYardFactor', label: 'M2Y Ratio (1.12)', category: 'constants', defaultVisible: false, align: 'right', width: '120px' },
  { id: 'baseReedPicks', label: 'Base Reed (16)', category: 'constants', defaultVisible: false, align: 'right', width: '110px' },

  // Metadata
  { id: 'createdAt', label: 'Date', category: 'meta', defaultVisible: true, align: 'left', width: '120px' },
];

export const DEFAULT_VISIBLE_COLUMN_IDS = ALL_AVAILABLE_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id);

interface ColumnCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: string[];
  onChangeColumns: (newVisibleCols: string[]) => void;
}

export function ColumnCustomizer({
  isOpen,
  onClose,
  visibleColumns,
  onChangeColumns,
}: ColumnCustomizerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const toggleColumn = (id: string) => {
    if (id === 'qualityName') return; // Always keep quality name
    if (visibleColumns.includes(id)) {
      onChangeColumns(visibleColumns.filter((c) => c !== id));
    } else {
      onChangeColumns([...visibleColumns, id]);
    }
  };

  const handleSelectAll = () => {
    onChangeColumns(ALL_AVAILABLE_COLUMNS.map((c) => c.id));
  };

  const handleResetDefaults = () => {
    onChangeColumns(DEFAULT_VISIBLE_COLUMN_IDS);
  };

  const filteredColumns = ALL_AVAILABLE_COLUMNS.filter((c) =>
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.tamilLabel && c.tamilLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = [
    { key: 'primary', label: 'Fabric Specifications & Totals', icon: Sparkles, color: 'text-primary' },
    { key: 'physical', label: 'Physical & Yarn Breakdown (பாவு / ஊடை எடை)', icon: Layers, color: 'text-blue-500' },
    { key: 'wages', label: 'Wages & Processing Costs (சைசிங் / நெசவு / Bleach)', icon: SlidersHorizontal, color: 'text-emerald-500' },
    { key: 'constants', label: 'Circled Calculation Constants (0.54, 24, 1.12, 1000)', icon: Info, color: 'text-amber-500' },
    { key: 'meta', label: 'Record Metadata', icon: Eye, color: 'text-muted-foreground' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Customize Table Columns
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose any calculation parameter or intermediate value to display in your table
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search and Bulk actions */}
        <div className="p-3 sm:px-5 border-b border-border/60 bg-muted/10 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search parameters or Tamil labels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs h-8 gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-xs h-8 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </Button>
          </div>
        </div>

        {/* Column List grouped by category */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1">
          {categories.map((cat) => {
            const cols = filteredColumns.filter((c) => c.category === cat.key);
            if (cols.length === 0) return null;

            return (
              <div key={cat.key} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/90 pb-1 border-b border-border/40">
                  <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span>{cat.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                    {cols.filter((c) => visibleColumns.includes(c.id)).length}/{cols.length} visible
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cols.map((col) => {
                    const isChecked = visibleColumns.includes(col.id);
                    const isFixed = col.id === 'qualityName';

                    return (
                      <div
                        key={col.id}
                        onClick={() => !isFixed && toggleColumn(col.id)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'border-primary/40 bg-primary/5 text-foreground shadow-xs'
                            : 'border-border/60 bg-card hover:bg-muted/40 text-muted-foreground'
                        } ${isFixed ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <div className="pt-0.5">
                          {isChecked ? (
                            <div className="w-4 h-4 rounded bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded border border-border/80 bg-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {col.label}
                            {isFixed && <span className="ml-1.5 text-[10px] text-primary/80 font-mono">(Required)</span>}
                          </div>
                          {col.tamilLabel && (
                            <div className="text-[11px] text-primary/70 font-medium">
                              {col.tamilLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 border-t border-border bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{visibleColumns.length}</span> columns currently active
          </div>
          <Button onClick={onClose} size="sm" className="px-5">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
