'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Boxes,
  DollarSign,
  TrendingDown,
  History,
  Layers,
  Building2,
  MapPin,
  Eye,
  Edit,
  ArrowUpDown,
  RefreshCw,
  UserCheck,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Column } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/toast';
import {
  useRawMaterials,
  useRawMaterialCategories,
  useSuppliers,
  useStorageLocations,
} from '@/hooks/useRawMaterials';
import { RawMaterial } from '@/types/raw-materials.types';
import { StockStatusBadge } from '@/components/raw-materials/StockStatusBadge';
import { StockAdjustmentDialog } from '@/components/raw-materials/StockAdjustmentDialog';

export default function RawMaterialsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [typeTab, setTypeTab] = useState<'ALL' | 'RM' | 'PM' | 'FG'>('ALL');
  const [itemSourceFilter, setItemSourceFilter] = useState<'ALL' | 'MANUFACTURED' | 'TRADED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [adjustmentMaterial, setAdjustmentMaterial] = useState<RawMaterial | null>(null);

  const { data, isLoading, refetch } = useRawMaterials({
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    supplierId: selectedSupplier || undefined,
    storageLocationId: selectedLocation || undefined,
    stockStatus: selectedStatus || undefined,
    type: typeTab,
    itemSource: typeTab === 'FG' && itemSourceFilter !== 'ALL' ? itemSourceFilter : undefined,
    page: currentPage,
    limit: 10,
  });

  const { data: categories } = useRawMaterialCategories();
  const { data: suppliers } = useSuppliers();
  const { data: locations } = useStorageLocations();

  const materials = data?.items || [];
  const stats = data?.stats || {
    totalSkus: 0,
    totalValuation: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    packagingSkusCount: 0,
    packagingValuation: 0,
  };

  const isItemPM = (row: RawMaterial) => {
    if (row.isPackagingMaterial !== undefined) return row.isPackagingMaterial;
    const sku = row.sku || '';
    if (
      sku.startsWith('PM-') ||
      sku.startsWith('PKG-') ||
      sku.startsWith('BX-') ||
      sku.startsWith('TP-') ||
      sku.startsWith('CV-')
    ) {
      return true;
    }
    const catName = row.category?.name?.toLowerCase() || '';
    const name = row.name?.toLowerCase() || '';
    return (
      catName.includes('packaging') ||
      catName.includes('box') ||
      catName.includes('cover') ||
      catName.includes('tape') ||
      catName.includes('carton') ||
      catName.includes('pouch') ||
      catName.includes('bag') ||
      catName.includes('wrapper') ||
      name.includes('box') ||
      name.includes('tape') ||
      name.includes('cover') ||
      name.includes('carton') ||
      name.includes('pouch') ||
      name.includes('polybag') ||
      name.includes('poly bag') ||
      name.includes('roll tape')
    );
  };

  const isItemFG = (row: RawMaterial) => {
    if (row.isFinishedGood !== undefined) return row.isFinishedGood;
    if (isItemPM(row)) return false;
    if (row.sku?.startsWith('FP-') || row.sku?.startsWith('FG-') || row.sku?.startsWith('PROD-')) return true;
    if (row.sku?.startsWith('RM-')) return false;
    const catName = row.category?.name?.toLowerCase() || '';
    if (
      catName.includes('raw') ||
      catName.includes('yarn') ||
      catName.includes('cotton') ||
      catName.includes('liquid') ||
      catName.includes('chemical') ||
      catName.includes('botanical') ||
      catName.includes('component') ||
      catName.includes('metals')
    ) {
      return false;
    }
    return true;
  };

  const columns: Column<RawMaterial>[] = [
    {
      key: 'sku',
      header: 'Item Code',
      sortable: true,
      width: '140px',
      render: (row) => (
        <Link
          href={`/raw-materials/${row.id}`}
          className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {row.sku}
        </Link>
      ),
    },
    {
      key: 'type' as any,
      header: 'Classification',
      width: '140px',
      render: (row) => {
        const isPM = isItemPM(row);
        const isFG = !isPM && isItemFG(row);
        if (isPM) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              PACKAGING
            </span>
          );
        }
        if (isFG) {
          const isTraded = row.itemSource === 'TRADED';
          return (
            <div className="flex flex-col gap-1 items-start">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                FINISHED GOOD
              </span>
              {isTraded ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  🛒 TRADED (BUY & SELL)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-600/30">
                  🏭 IN-HOUSE PRODUCED
                </span>
              )}
            </div>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            RAW MATERIAL
          </span>
        );
      },
    },
    {
      key: 'name',
      header: 'Item Name & Category',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <Link href={`/raw-materials/${row.id}`} className="font-medium text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {row.name}
          </Link>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{row.category?.name || 'General Inventory'} • HSN: {row.hsnCode || 'N/A'}</span>
            {row.size && (
              <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded font-semibold text-[10px]">
                {row.size} {row.dimensionInches ? `(${row.dimensionInches})` : ''}
              </span>
            )}
            {row.packSize && (
              <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded font-mono text-[10px]">
                {row.packSize}
              </span>
            )}
            {row.boxSize && (
              <span className="px-1.5 py-0.2 bg-secondary text-foreground border border-border rounded font-mono text-[10px]">
                {row.boxSize}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'currentStockBalance',
      header: 'Current Stock',
      sortable: true,
      align: 'right',
      render: (row) => (
        <div className="text-right">
          <span className="font-mono font-bold text-xs text-foreground block">
            {Number(row.currentStockBalance).toFixed(2)} {row.unit?.abbreviation || 'Units'}
          </span>
          {Boolean(row.conversionFactor && (row.secondaryUnit || row.secondaryUnitName)) && (
            <span className="text-[10px] text-blue-500 block font-mono">
              ~{(Number(row.currentStockBalance) / (Number(row.conversionFactor) || 1)).toFixed(1)}{' '}
              {row.secondaryUnit?.abbreviation || row.secondaryUnitName}
            </span>
          )}
          {Number(row.reservedStock) > 0 && (
            <span className="text-[10px] text-amber-400 block font-mono">
              ({Number(row.reservedStock).toFixed(2)} Reserved)
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'minimumStockLevel',
      header: 'Min / Max Safety',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs text-muted-foreground block text-right">
          Min: {row.minimumStockLevel} | Max: {row.maximumStockLevel || '∞'}
        </span>
      ),
    },
    {
      key: 'unitCost',
      header: 'Unit Rate / Avg Cost',
      align: 'right',
      render: (row) => (
        <div className="text-right font-mono text-xs">
          <span className="text-foreground block">₹ {Number(row.unitCost).toFixed(2)}</span>
          <span className="text-[10px] text-muted-foreground block">Avg: ₹ {Number(row.avgCost || row.unitCost).toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (row) => (
        <div className="text-xs text-muted-foreground">
          <span className="block truncate max-w-[140px] text-foreground font-medium">{row.supplier?.name || 'In-House / Direct'}</span>
          {row.supplier?.phone && <span className="block text-[10px] truncate max-w-[140px] font-mono">{row.supplier.phone}</span>}
        </div>
      ),
    },
    {
      key: 'computedStatus',
      header: 'Stock Status',
      align: 'center',
      render: (row) => <StockStatusBadge status={row.computedStatus} />,
    },
    {
      key: 'actions' as any,
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAdjustmentMaterial(row)}
            title="Record Stock Movement"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </Button>
          <Link href={`/raw-materials/${row.id}`}>
            <Button variant="ghost" size="sm" title="View Details">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
          <Link href={`/raw-materials/${row.id}/edit`}>
            <Button variant="ghost" size="sm" title="Edit Item">
              <Edit className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Materials & Packaging Master Catalog</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage Raw Materials, Packaging Supplies & Finished Products
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/raw-materials/history" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" fullWidth leftIcon={<History className="h-3.5 w-3.5" />} className="min-h-[36px]">
              Stock Ledger
            </Button>
          </Link>
          <Link href="/raw-materials/new" className="flex-1 sm:flex-initial">
            <Button variant="primary" size="sm" fullWidth leftIcon={<Plus className="h-3.5 w-3.5" />} className="min-h-[36px]">
              Add New Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Classification Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto touch-scroll no-scrollbar py-0.5">
        <button
          onClick={() => {
            setTypeTab('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
            typeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          All Inventory
        </button>
        <button
          onClick={() => {
            setTypeTab('RM');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
            typeTab === 'RM'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          Raw Materials (RM)
        </button>
        <button
          onClick={() => {
            setTypeTab('PM');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[36px] ${
            typeTab === 'PM'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          Packaging Materials
        </button>
        <button
          onClick={() => {
            setTypeTab('FG');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 min-h-[36px] ${
            typeTab === 'FG'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          Finished Goods (FG)
        </button>
      </div>

      {/* Finished Goods Sourcing Sub-Tabs (In-House Manufactured vs Direct Buy & Sell) */}
      {typeTab === 'FG' && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-background to-indigo-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Sourcing & Procurement Type:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setItemSourceFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  itemSourceFilter === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                All FG Products
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemSourceFilter('MANUFACTURED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  itemSourceFilter === 'MANUFACTURED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🏭 In-House Produced ({stats.manufacturedFgCount ?? 0})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemSourceFilter('TRADED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  itemSourceFilter === 'TRADED'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🛒 Direct Buy & Sell / Traded ({stats.tradedFgCount ?? 0})</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground hidden lg:block">
            Distinguish products manufactured in plant vs procured directly from vendors for resale
          </div>
        </div>
      )}

      {/* KPI Metrics Panel - 2 Columns on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {typeTab === 'FG' ? (
          <>
            <div className="bg-secondary/30 border border-border rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium truncate">Total Finished Goods</span>
                <span className="text-lg sm:text-2xl font-bold text-foreground font-mono mt-0.5 sm:mt-1 block truncate">
                  {stats.totalSkus} <span className="text-xs font-normal text-muted-foreground">SKUs</span>
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                <Boxes className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="bg-secondary/30 border border-border rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium truncate">Total FG Valuation</span>
                <span className="text-lg sm:text-2xl font-bold text-emerald-500 font-mono mt-0.5 sm:mt-1 block truncate">
                  ₹ {stats.totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="bg-secondary/30 border border-emerald-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between bg-emerald-500/5">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 block font-bold truncate">🏭 In-House Produced</span>
                <span className="text-base sm:text-xl font-bold text-foreground font-mono mt-0.5 sm:mt-1 block truncate">
                  ₹ {(stats.manufacturedFgValuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  {stats.manufacturedFgCount || 0} Products Manufactured
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="bg-secondary/30 border border-indigo-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between bg-indigo-500/5">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 block font-bold truncate">🛒 Direct Buy & Sell</span>
                <span className="text-base sm:text-xl font-bold text-foreground font-mono mt-0.5 sm:mt-1 block truncate">
                  ₹ {(stats.tradedFgValuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  {stats.tradedFgCount || 0} Products Traded
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-secondary/30 border border-border rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium truncate">Total Item SKUs</span>
                <span className="text-lg sm:text-2xl font-bold text-foreground font-mono mt-0.5 sm:mt-1 block truncate">
                  {stats.totalSkus}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                <Boxes className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="bg-secondary/30 border border-border rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium truncate">Total Valuation</span>
                <span className="text-lg sm:text-2xl font-bold text-emerald-500 font-mono mt-0.5 sm:mt-1 block truncate">
                  ₹ {stats.totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="bg-secondary/30 border border-border rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium truncate">Packaging Value</span>
                <span className="text-lg sm:text-2xl font-bold text-amber-500 font-mono mt-0.5 sm:mt-1 block truncate">
                  ₹ {(stats.packagingValuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                <Archive className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>

            <div className="bg-secondary/30 border border-border rounded-xl p-3 sm:p-4 flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium truncate">Low Stock Alerts</span>
                <span className="text-lg sm:text-2xl font-bold text-rose-500 font-mono mt-0.5 sm:mt-1 block truncate">
                  {stats.lowStockCount}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-rose-500/10 text-rose-500 rounded-lg shrink-0">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-secondary/20 border border-border rounded-xl p-3.5 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-[#3ECF8E]" /> Filter & Search
            </span>
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="sm:hidden text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground hover:text-foreground"
            >
              {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedSupplier('');
              setSelectedLocation('');
              setSelectedStatus('');
              refetch();
            }}
          >
            Clear
          </Button>
        </div>

        <div className={`${isMobileFilterOpen ? 'grid' : 'hidden sm:grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Material Code, Name, HSN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/60 text-foreground text-xs pl-9 pr-3 py-2 rounded-md border border-border focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>

          <Select
            options={[
              { label: 'All Categories', value: '' },
              ...(categories?.map((c) => ({ label: c.name, value: c.id })) || []),
            ]}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />

          <Select
            options={[
              { label: 'All Suppliers', value: '' },
              ...(suppliers?.map((s) => ({ label: s.name, value: s.id })) || []),
            ]}
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
          />

          <Select
            options={[
              { label: 'All Locations', value: '' },
              ...(locations?.map((l) => ({ label: l.name, value: l.id })) || []),
            ]}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          />

          <Select
            options={[
              { label: 'All Stock Statuses', value: '' },
              { label: 'Optimal Stock', value: 'OPTIMAL' },
              { label: 'Low Stock', value: 'LOW_STOCK' },
              { label: 'Overstock', value: 'OVERSTOCK' },
              { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />

        </div>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        data={materials}
        isLoading={isLoading}
        emptyMessage={
          typeTab === 'FG'
            ? 'No finished goods match the selected filters.'
            : typeTab === 'RM'
            ? 'No raw materials match the selected filters.'
            : 'No inventory items match the selected filters.'
        }
        keyExtractor={(row) => row.id}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={data?.meta?.totalPages || 1}
        totalRecords={data?.meta?.total || 0}
        pageSize={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Stock Adjustment Dialog */}
      {adjustmentMaterial && (
        <StockAdjustmentDialog
          isOpen={Boolean(adjustmentMaterial)}
          onClose={() => setAdjustmentMaterial(null)}
          material={adjustmentMaterial}
        />
      )}
    </motion.div>
  );
}
