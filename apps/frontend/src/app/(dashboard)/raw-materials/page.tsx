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
  const [currentPage, setCurrentPage] = useState(1);

  const [adjustmentMaterial, setAdjustmentMaterial] = useState<RawMaterial | null>(null);

  const { data, isLoading, refetch } = useRawMaterials({
    search: searchTerm || undefined,
    categoryId: selectedCategory || undefined,
    supplierId: selectedSupplier || undefined,
    storageLocationId: selectedLocation || undefined,
    stockStatus: selectedStatus || undefined,
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
  };

  const columns: Column<RawMaterial>[] = [
    {
      key: 'sku',
      header: 'Material Code',
      sortable: true,
      render: (row) => (
        <Link
          href={`/raw-materials/${row.id}`}
          className="font-mono font-semibold text-[#3ECF8E] hover:underline"
        >
          {row.sku}
        </Link>
      ),
    },
    {
      key: 'name',
      header: 'Material Name & Category',
      sortable: true,
      render: (row) => (
        <div>
          <Link href={`/raw-materials/${row.id}`} className="font-medium text-foreground hover:text-[#3ECF8E] transition-colors">
            {row.name}
          </Link>
          <span className="block text-[11px] text-muted-foreground">
            {row.category?.name || 'Uncategorized'} • HSN: {row.hsnCode || 'N/A'}
          </span>
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
            {row.currentStockBalance} {row.unit?.abbreviation || 'Units'}
          </span>
          {row.reservedStock > 0 && (
            <span className="text-[10px] text-amber-400 block font-mono">
              ({row.reservedStock} Reserved)
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
            <ArrowUpDown className="h-3.5 w-3.5 text-[#3ECF8E]" />
          </Button>
          <Link href={`/raw-materials/${row.id}`}>
            <Button variant="ghost" size="sm" title="View Details">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
          <Link href={`/raw-materials/${row.id}/edit`}>
            <Button variant="ghost" size="sm" title="Edit Material">
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
            <Package className="h-6 w-6 text-[#3ECF8E]" />
            Raw Material Master Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise single source of truth for materials, safety stock limits, movement history & valuation.
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
              Stock History Ledger
            </Button>
          </Link>
          <Link href="/raw-materials/new">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Add Raw Material
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Raw Material SKUs</span>
            <span className="text-2xl font-bold text-foreground font-mono mt-1 block">
              {stats.totalSkus}
            </span>
          </div>
          <div className="p-3 bg-[#3ECF8E]/10 text-[#3ECF8E] rounded-lg">
            <Boxes className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Inventory Valuation</span>
            <span className="text-2xl font-bold text-[#3ECF8E] font-mono mt-1 block">
              ₹ {stats.totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 bg-[#3ECF8E]/10 text-[#3ECF8E] rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Low Stock Alerts</span>
            <span className="text-2xl font-bold text-amber-500 font-mono mt-1 block">
              {stats.lowStockCount}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Out of Stock SKUs</span>
            <span className="text-2xl font-bold text-rose-500 font-mono mt-1 block">
              {stats.outOfStockCount}
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg">
            <TrendingDown className="h-5 w-5" />
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
              { label: '⚠️ Low Stock', value: 'LOW_STOCK' },
              { label: '📈 Overstock', value: 'OVERSTOCK' },
              { label: '🚨 Out of Stock', value: 'OUT_OF_STOCK' },
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <Table columns={columns} data={materials} keyExtractor={(row) => row.id} />

      <Pagination
        currentPage={currentPage}
        totalPages={data?.meta.totalPages || 1}
        totalRecords={data?.meta.total || materials.length}
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
