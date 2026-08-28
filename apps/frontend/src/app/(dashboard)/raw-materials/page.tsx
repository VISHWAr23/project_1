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
  const [currentPage, setCurrentPage] = useState(1);

  const [adjustmentMaterial, setAdjustmentMaterial] = useState<RawMaterial | null>(null);

  const { data, isLoading, refetch } = useRawMaterials({
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    supplierId: selectedSupplier || undefined,
    storageLocationId: selectedLocation || undefined,
    stockStatus: selectedStatus || undefined,
    type: typeTab,
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
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              FINISHED GOOD
            </span>
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
      header: 'Supplier & Location',
      render: (row) => (
        <div className="text-xs text-muted-foreground">
          <span className="block truncate max-w-[120px] text-foreground">{row.supplier?.name || 'No Supplier'}</span>
          <span className="block text-[10px] truncate max-w-[120px]">{row.storageLocation?.name || 'Main Warehouse'}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Materials & Packaging Master Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage Raw Materials, Packaging Supplies (Boxes, Covers, Tapes) & Finished Products
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/raw-materials/categories">
            <Button variant="outline" size="sm" leftIcon={<Layers className="h-3.5 w-3.5" />}>
              Categories
            </Button>
          </Link>
          <Link href="/raw-materials/suppliers">
            <Button variant="outline" size="sm" leftIcon={<Building2 className="h-3.5 w-3.5" />}>
              Suppliers
            </Button>
          </Link>
          <Link href="/raw-materials/locations">
            <Button variant="outline" size="sm" leftIcon={<MapPin className="h-3.5 w-3.5" />}>
              Locations
            </Button>
          </Link>
          <Link href="/raw-materials/history">
            <Button variant="outline" size="sm" leftIcon={<History className="h-3.5 w-3.5" />}>
              Stock Ledger
            </Button>
          </Link>
          <Link href="/raw-materials/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Add New Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Classification Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setTypeTab('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            typeTab === 'PM'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          Packaging Materials (Boxes, Covers, Tape)
        </button>
        <button
          onClick={() => {
            setTypeTab('FG');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            typeTab === 'FG'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          Finished Goods (FG)
        </button>
      </div>

      {/* KPI Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Item SKUs</span>
            <span className="text-2xl font-bold text-foreground font-mono mt-1 block">
              {stats.totalSkus}
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <Boxes className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Inventory Valuation</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
              ₹ {stats.totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Packaging Inventory Value</span>
            <span className="text-2xl font-bold text-amber-500 font-mono mt-1 block">
              ₹ {(stats.packagingValuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <Archive className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Low Stock Alerts</span>
            <span className="text-2xl font-bold text-rose-500 font-mono mt-1 block">
              {stats.lowStockCount}
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-secondary/20 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#3ECF8E]" /> Filter & Search Master Catalog
          </span>
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
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
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
