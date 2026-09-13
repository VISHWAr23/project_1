'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  SlidersHorizontal,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  TrendingUp,
  Scale,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ColumnCustomizer,
  ALL_AVAILABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMN_IDS,
} from '@/components/fabric-costing/column-customizer';
import { CreateCostingModal } from '@/components/fabric-costing/create-costing-modal';
import { CostingDetailsModal } from '@/components/fabric-costing/costing-details-modal';
import {
  useFabricCostingList,
  useFabricCostingStats,
  useDeleteFabricCosting,
} from '@/hooks/useFabricCosting';
import { GreyFabricCosting } from '@/types/fabric-costing.types';
import { formatDate } from '@/lib/date-utils';

const STORAGE_KEY = 'ims_fabric_costing_columns';

export default function FabricCostingPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedCosting, setSelectedCosting] = useState<GreyFabricCosting | null>(null);

  // Column preferences state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMN_IDS);

  // Load column preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If costPerMeterBeforeBleaching is not in user's saved list, insert it before costPerMeter
          if (!parsed.includes('costPerMeterBeforeBleaching')) {
            const costIdx = parsed.indexOf('costPerMeter');
            if (costIdx !== -1) {
              parsed.splice(costIdx, 0, 'costPerMeterBeforeBleaching');
            } else {
              parsed.push('costPerMeterBeforeBleaching');
            }
          }
          setVisibleColumns(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load column settings', e);
    }
  }, []);

  const handleUpdateColumns = (newCols: string[]) => {
    setVisibleColumns(newCols);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCols));
    } catch (e) {
      console.error('Failed to persist column settings', e);
    }
  };

  // Queries
  const { data: listData, isLoading, refetch } = useFabricCostingList({
    search,
    page,
    limit,
    sortBy,
    sortOrder,
  });
  const { data: stats, isLoading: statsLoading } = useFabricCostingStats();
  const deleteMutation = useDeleteFabricCosting();

  const items = listData?.items || [];
  const meta = listData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleSort = (colId: string) => {
    if (sortBy === colId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(colId);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (costing: GreyFabricCosting, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete formulation "${costing.qualityName}"?`)) {
      try {
        await deleteMutation.mutateAsync(costing.id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete record');
      }
    }
  };

  const handleExportCsv = () => {
    if (items.length === 0) return;
    const activeCols = ALL_AVAILABLE_COLUMNS.filter((c) => visibleColumns.includes(c.id));
    const header = activeCols.map((c) => `"${c.label}"`).join(',');
    const rows = items.map((row: any) => {
      const costBefore =
        row.costBeforeBleaching ??
        Number(
          (row.warpTotalPrice + row.weftTotalPrice + row.sizingTotalWages + row.weavingTotalWages).toFixed(2)
        );
      const costPerMBefore =
        row.costPerMeterBeforeBleaching ??
        Number((costBefore / (row.totalLengthMeters || 1)).toFixed(2));
      const rowData = {
        ...row,
        costBeforeBleaching: costBefore,
        costPerMeterBeforeBleaching: costPerMBefore,
      };
      return activeCols
        .map((c) => {
          const val = rowData[c.id];
          return `"${val !== null && val !== undefined ? val : ''}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fabric_costing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cell renderer helper
  const renderCellContent = (colId: string, row: GreyFabricCosting) => {
    switch (colId) {
      case 'qualityName':
        return (
          <div>
            <div className="font-semibold text-foreground">{row.qualityName}</div>
            {row.notes && <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{row.notes}</div>}
          </div>
        );
      case 'totalLengthMeters':
        return (
          <span className="font-mono">
            {Number(row.totalLengthMeters).toLocaleString('en-IN', { maximumFractionDigits: 2 })} m
          </span>
        );
      case 'totalLengthYards':
        return (
          <span className="font-mono">
            {Number(row.totalLengthYards).toLocaleString('en-IN', { maximumFractionDigits: 2 })} yds
          </span>
        );
      case 'warpWeightKg':
        return <span className="font-mono text-primary font-medium">{row.warpWeightKg.toFixed(3)} kg</span>;
      case 'weftWeightKg':
        return <span className="font-mono text-primary font-medium">{row.weftWeightKg.toFixed(3)} kg</span>;
      case 'totalWeightKg':
        return <span className="font-mono font-bold text-foreground">{row.totalWeightKg.toFixed(3)} kg</span>;
      case 'weightPerMeterGram':
        return <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">{row.weightPerMeterGram.toFixed(2)} g/m</span>;
      case 'reedSpaceInches':
        return <span className="font-mono">{row.reedSpaceInches}&quot;</span>;
      case 'warpPricePerKg':
      case 'weftPricePerKg':
      case 'sizingRatePerKg':
      case 'bleachingRatePerKg':
        return <span className="font-mono">₹{Number(row[colId as keyof GreyFabricCosting] || 0).toFixed(2)}</span>;
      case 'weavingRatePerMeter':
        return <span className="font-mono">₹{row.weavingRatePerMeter.toFixed(3)}/m</span>;
      case 'warpTotalPrice':
      case 'weftTotalPrice':
      case 'sizingTotalWages':
      case 'weavingTotalWages':
      case 'bleachingTotalCharges':
        return <span className="font-mono">₹{Number(row[colId as keyof GreyFabricCosting] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>;
      case 'costBeforeBleaching': {
        const costBefore =
          row.costBeforeBleaching ??
          Number(
            (row.warpTotalPrice + row.weftTotalPrice + row.sizingTotalWages + row.weavingTotalWages).toFixed(2)
          );
        return (
          <span className="font-mono font-medium text-foreground">
            ₹{costBefore.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        );
      }
      case 'costPerMeterBeforeBleaching': {
        const costBefore =
          row.costBeforeBleaching ??
          Number(
            (row.warpTotalPrice + row.weftTotalPrice + row.sizingTotalWages + row.weavingTotalWages).toFixed(2)
          );
        const costPerM =
          row.costPerMeterBeforeBleaching ??
          Number((costBefore / (row.totalLengthMeters || 1)).toFixed(2));
        return (
          <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
            ₹{costPerM.toFixed(2)}/m
          </div>
        );
      }
      case 'totalProductionCost':
        return (
          <span className="font-mono font-bold text-primary">
            ₹{row.totalProductionCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        );
      case 'costPerMeter':
        return (
          <div className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ₹{row.costPerMeter.toFixed(2)}/m
          </div>
        );
      case 'createdAt':
        return <span className="text-muted-foreground font-mono text-[11px]">{formatDate(row.createdAt)}</span>;
      default:
        const val = row[colId as keyof GreyFabricCosting];
        return <span className="font-mono">{val !== null && val !== undefined ? String(val) : '-'}</span>;
    }
  };

  const activeColumnDefs = ALL_AVAILABLE_COLUMNS.filter((c) => visibleColumns.includes(c.id));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/80 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shadow-xs shrink-0">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-foreground">
                Gray Roll Production & Bleaching Cost
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                சாம்பல் துணி உற்பத்தி மற்றும் பிளீச்சிங் அடக்கவிலை கணக்கீட்டு தொகுதி
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="text-xs h-9 gap-1.5 flex-1 sm:flex-initial justify-center"
            title="Export current table data to CSV"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizerOpen(true)}
            className="text-xs h-9 gap-1.5 border-border hover:bg-muted/50 flex-1 sm:flex-initial justify-center"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            Columns ({visibleColumns.length})
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs h-9 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs flex-1 sm:flex-initial justify-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Calculation
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-card/60 backdrop-blur-xs border-border/70 flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary shrink-0">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Saved Formulations</div>
            <div className="text-base sm:text-xl font-bold font-mono text-foreground mt-0.5">
              {statsLoading ? '...' : stats?.totalFormulations || 0}
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card/60 backdrop-blur-xs border-border/70 flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Avg Cost / Meter</div>
            <div className="text-base sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
              {statsLoading ? '...' : `₹${stats?.averageCostPerMeter?.toFixed(2) || '0.00'}`}
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card/60 backdrop-blur-xs border-border/70 flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Avg Fabric Weight</div>
            <div className="text-base sm:text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 truncate">
              {statsLoading ? '...' : `${stats?.averageWeightPerMeterGram?.toFixed(2) || '0.00'} g/m`}
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card/60 backdrop-blur-xs border-border/70 flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">Total Fabric Meters</div>
            <div className="text-base sm:text-xl font-bold font-mono text-foreground mt-0.5 truncate">
              {statsLoading ? '...' : `${stats?.totalMetersCalculated?.toLocaleString() || '0'} m`}
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-muted/20 border border-border/70">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search quality or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-8 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Dynamic Calculation Table */}
      <div className="w-full overflow-x-auto touch-scroll rounded-xl border border-border bg-card shadow-xs relative">
        <table className="w-full text-xs text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono">
              {activeColumnDefs.map((col) => {
                const alignClass =
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                return (
                  <th
                    key={col.id}
                    style={{ width: col.width, minWidth: col.width }}
                    onClick={() => handleSort(col.id)}
                    className={`p-3 font-medium tracking-wide uppercase text-[10px] select-none cursor-pointer hover:text-foreground ${alignClass}`}
                  >
                    <div className={`inline-flex items-center gap-1 ${alignClass}`}>
                      <span>{col.label}</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                );
              })}
              <th className="p-3 text-right font-medium tracking-wide uppercase text-[10px] w-24 sticky right-0 bg-muted/40 backdrop-blur-xs">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-foreground">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`} className="animate-pulse">
                  {activeColumnDefs.map((col, idx) => (
                    <td key={`sk-td-${idx}`} className="p-3">
                      <div className="h-3.5 bg-muted/70 rounded-md w-3/4" />
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <div className="h-3.5 bg-muted/70 rounded-md w-12 ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={activeColumnDefs.length + 1} className="p-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Calculator className="w-10 h-10 text-muted-foreground/40 stroke-1" />
                    <p className="font-medium text-foreground text-sm">No Costing Formulations Found</p>
                    <p className="text-xs text-muted-foreground">
                      Create your first grey fabric roll costing record with real-time math calculations.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-2 text-xs gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Formulation
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedCosting(row)}
                  className="hover:bg-muted/30 cursor-pointer transition-colors group"
                >
                  {activeColumnDefs.map((col) => {
                    const alignClass =
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left';
                    return (
                      <td key={`${row.id}-${col.id}`} className={`p-3 ${alignClass}`}>
                        {renderCellContent(col.id, row)}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right sticky right-0 bg-card group-hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedCosting(row)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="View Complete Formula Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(row, e)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div>
            Showing <span className="font-medium text-foreground">{items.length}</span> of{' '}
            <span className="font-medium text-foreground">{meta.total}</span> records
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 px-2.5"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 font-mono">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 px-2.5"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateCostingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Column Customizer Modal */}
      <ColumnCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        visibleColumns={visibleColumns}
        onChangeColumns={handleUpdateColumns}
      />

      {/* Details / Formula Breakdown Sheet Modal */}
      <CostingDetailsModal
        costing={selectedCosting}
        isOpen={Boolean(selectedCosting)}
        onClose={() => setSelectedCosting(null)}
      />
    </div>
  );
}
