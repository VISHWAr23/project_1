'use client';

import React, { useState } from 'react';
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface DateRangeState {
  startDate: string;
  endDate: string;
}

interface ReportDateRangeFilterProps {
  value: DateRangeState;
  onChange: (range: DateRangeState) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

type PresetKey = 'today' | 'last7' | 'thisMonth' | 'lastMonth' | 'last90' | 'fy' | 'custom';

export function ReportDateRangeFilter({
  value,
  onChange,
  onRefresh,
  isLoading = false,
}: ReportDateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>('thisMonth');
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const getPresetRange = (preset: PresetKey): DateRangeState => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        return { startDate: todayStr, endDate: todayStr };
      case 'last7': {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
      }
      case 'thisMonth': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: firstDay.toISOString().split('T')[0], endDate: todayStr };
      }
      case 'lastMonth': {
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: firstDayLastMonth.toISOString().split('T')[0],
          endDate: lastDayLastMonth.toISOString().split('T')[0],
        };
      }
      case 'last90': {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
      }
      case 'fy': {
        const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        const fyStart = new Date(currentYear, 3, 1); // April 1st
        return { startDate: fyStart.toISOString().split('T')[0], endDate: todayStr };
      }
      case 'custom':
      default:
        return value;
    }
  };

  const handlePresetSelect = (preset: PresetKey) => {
    setActivePreset(preset);
    if (preset === 'custom') {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
      const range = getPresetRange(preset);
      onChange(range);
    }
  };

  const presets: { id: PresetKey; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'last7', label: '7 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'last90', label: '90 Days' },
    { id: 'fy', label: 'Current FY' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Preset pill buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none touch-scroll no-scrollbar">
          <div className="flex items-center text-xs font-semibold text-muted-foreground mr-1 shrink-0">
            <Calendar className="h-3.5 w-3.5 mr-1 text-emerald-500" />
            <span>Range:</span>
          </div>
          {presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePresetSelect(p.id)}
                type="button"
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all shrink-0 min-h-[30px] border ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold shadow-xs'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-transparent'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Refresh button & status */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5 px-3"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Date Pickers (Shown if Custom is selected or toggled) */}
      {(showCustomInputs || activePreset === 'custom') && (
        <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground font-medium">From:</label>
            <input
              type="date"
              value={value.startDate}
              onChange={(e) => {
                setActivePreset('custom');
                onChange({ ...value, startDate: e.target.value });
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground font-medium">To:</label>
            <input
              type="date"
              value={value.endDate}
              onChange={(e) => {
                setActivePreset('custom');
                onChange({ ...value, endDate: e.target.value });
              }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>
          <span className="text-[11px] text-muted-foreground italic">
            Showing filtered ledger between {value.startDate} and {value.endDate}
          </span>
        </div>
      )}
    </div>
  );
}
