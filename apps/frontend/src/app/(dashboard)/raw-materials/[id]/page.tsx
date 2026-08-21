'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  ArrowLeft,
  Edit,
  ArrowUpDown,
  Trash2,
  Building2,
  MapPin,
  FileText,
  Boxes,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  History,
  Tag,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useRawMaterialDetail, useDeleteRawMaterial } from '@/hooks/useRawMaterials';
import { StockStatusBadge } from '@/components/raw-materials/StockStatusBadge';
import { StockAdjustmentDialog } from '@/components/raw-materials/StockAdjustmentDialog';
import { MaterialStockChart } from '@/components/raw-materials/MaterialStockChart';
import { StockHistoryLedger } from '@/components/raw-materials/StockHistoryLedger';

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const { data: material, isLoading, refetch } = useRawMaterialDetail(id);
  const deleteMaterial = useDeleteRawMaterial();

  const [activeTab, setActiveTab] = useState('overview');
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete / deactivate raw material ${material?.sku}?`)) {
      try {
        const res = await deleteMaterial.mutateAsync(id);
        toast('Material Deleted', res.message, 'success');
        router.push('/raw-materials');
      } catch (err: any) {
        toast('Action Failed', err.message || 'Could not delete raw material', 'error');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <RefreshCw className="h-6 w-6 animate-spin text-[#3ECF8E]" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground">Material not found.</p>
        <Link href="/raw-materials">
          <Button variant="outline" size="sm">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const jobWorkOrders = material.issuedJobWorkOrders || [];

  const jwColumns: Column<any>[] = [
    {
      key: 'jobWorkNumber',
      header: 'Job Work Order No.',
      render: (row) => (
        <Link href={`/job-work/${row.id}`} className="font-mono text-xs text-[#3ECF8E] hover:underline font-semibold">
          {row.jobWorkNumber}
        </Link>
      ),
    },
    {
      key: 'jobWorkCompany',
      header: 'Vendor Company',
      render: (row) => <span className="text-xs text-foreground font-medium">{row.jobWorkCompany?.companyName || 'N/A'}</span>,
    },
    {
      key: 'totalIssuedWeight',
      header: 'Issued Weight',
      align: 'right',
      render: (row) => <span className="font-mono text-xs">{row.totalIssuedWeight} Kg</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <Badge variant="neutral">{row.status}</Badge>,
    },
    {
      key: 'createdAt',
      header: 'Issue Date',
      width: '130px',
      render: (row) => <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link href="/raw-materials">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight font-mono">{material.sku}</h1>
              <StockStatusBadge status={material.computedStatus} />
            </div>
            <p className="text-sm font-semibold text-foreground mt-0.5">{material.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdjustmentOpen(true)}
            leftIcon={<ArrowUpDown className="h-3.5 w-3.5" />}
          >
            Record Stock Movement
          </Button>
          <Link href={`/raw-materials/${material.id}/edit`}>
            <Button variant="outline" size="sm" leftIcon={<Edit className="h-3.5 w-3.5" />}>
              Edit Master
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Deactivate / Delete
          </Button>
        </div>
      </div>

      {/* 5-Card Inventory Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-secondary/30 border border-border rounded-xl p-3 text-center">
          <span className="text-[11px] text-muted-foreground block font-medium">Current Stock</span>
          <span className="text-xl font-bold font-mono text-foreground mt-1 block">
            {material.currentStockBalance} <span className="text-xs text-muted-foreground font-sans">{material.unit?.abbreviation}</span>
          </span>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-3 text-center">
          <span className="text-[11px] text-muted-foreground block font-medium">Reserved Stock</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
            {material.reservedStock} <span className="text-xs text-muted-foreground font-sans">{material.unit?.abbreviation}</span>
          </span>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-3 text-center">
          <span className="text-[11px] text-muted-foreground block font-medium">Available Stock</span>
          <span className="text-xl font-bold font-mono text-[#3ECF8E] mt-1 block">
            {material.availableStock} <span className="text-xs text-muted-foreground font-sans">{material.unit?.abbreviation}</span>
          </span>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-3 text-center">
          <span className="text-[11px] text-muted-foreground block font-medium">Minimum Stock</span>
          <span className="text-xl font-bold font-mono text-muted-foreground mt-1 block">
            {material.minimumStockLevel} <span className="text-xs font-sans">{material.unit?.abbreviation}</span>
          </span>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] text-muted-foreground block font-medium">Maximum Limit</span>
          <span className="text-xl font-bold font-mono text-muted-foreground mt-1 block">
            {material.maximumStockLevel || '∞'} <span className="text-xs font-sans">{material.unit?.abbreviation}</span>
          </span>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: '📊 Material Overview & Analytics' },
          { id: 'history', label: `📜 Stock History Ledger (${material.inventoryTransactions?.length || 0})` },
          { id: 'job-work', label: `🚚 Linked Job Work Orders (${jobWorkOrders.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recharts Analytics Chart */}
          <MaterialStockChart material={material} />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Specs */}
            <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#3ECF8E]" /> Material Specifications & Master Info
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground">{material.category?.name || 'Uncategorized'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Unit of Measure:</span>
                  <span className="font-semibold text-foreground">{material.unit?.name} ({material.unit?.abbreviation})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">HSN Code:</span>
                  <span className="font-mono text-foreground">{material.hsnCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">GST Tax Rate:</span>
                  <span className="font-mono text-foreground">{material.gstRate}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Reorder Threshold:</span>
                  <span className="font-mono text-foreground">{material.reorderQuantity} {material.unit?.abbreviation}</span>
                </div>
                <div className="py-1">
                  <span className="text-muted-foreground block mb-1">Description:</span>
                  <p className="text-foreground bg-secondary/50 p-2 rounded border border-border/40">
                    {material.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor & Valuation Details */}
            <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#3ECF8E]" /> Financials, Supplier & Location
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Current Purchase Rate:</span>
                  <span className="font-mono font-bold text-foreground">₹ {Number(material.unitCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Moving Average Cost:</span>
                  <span className="font-mono font-bold text-[#3ECF8E]">₹ {Number(material.avgCost || material.unitCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Last Purchase Rate:</span>
                  <span className="font-mono text-foreground">₹ {Number(material.lastPurchaseRate || material.unitCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Total Stock Valuation:</span>
                  <span className="font-mono font-bold text-[#3ECF8E]">
                    ₹ {(material.currentStockBalance * Number(material.avgCost || material.unitCost)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Primary Supplier:</span>
                  <span className="font-semibold text-foreground">{material.supplier?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Warehouse Storage:</span>
                  <span className="font-semibold text-foreground">{material.storageLocation?.name || 'Main Warehouse'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <StockHistoryLedger items={material.inventoryTransactions || []} />
        </div>
      )}

      {activeTab === 'job-work' && (
        <div className="space-y-4">
          <Table
            columns={jwColumns}
            data={jobWorkOrders}
            isLoading={isLoading}
            emptyMessage="No job work orders associated with this material yet."
            keyExtractor={(row) => row.id}
          />
        </div>
      )}

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        isOpen={isAdjustmentOpen}
        onClose={() => {
          setIsAdjustmentOpen(false);
          refetch();
        }}
        material={material}
      />
    </motion.div>
  );
}
