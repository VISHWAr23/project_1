'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import {
  useCreateRawMaterial,
  useRawMaterialCategories,
  useRawMaterialUnits,
  useSuppliers,
  useStorageLocations,
} from '@/hooks/useRawMaterials';

export default function NewRawMaterialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMaterial = useCreateRawMaterial();

  const { data: categories } = useRawMaterialCategories();
  const { data: units } = useRawMaterialUnits();
  const { data: suppliers } = useSuppliers();
  const { data: locations } = useStorageLocations();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    unitId: '',
    supplierId: '',
    storageLocationId: '',
    hsnCode: '',
    gstRate: '18',
    minimumStockLevel: '100',
    maximumStockLevel: '1000',
    reorderQuantity: '200',
    initialStock: '0',
    unitCost: '0',
    remarks: '',
  });

  const generateAutoCode = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `RM-${year}-${rand}` }));
    toast('Code Generated', 'Auto-generated Material Code assigned', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const minStock = Number(formData.minimumStockLevel) || 0;
    const maxStock = Number(formData.maximumStockLevel) || 0;

    if (maxStock > 0 && minStock > maxStock) {
      toast('Validation Error', 'Minimum stock level cannot exceed Maximum stock level!', 'error');
      return;
    }

    try {
      await createMaterial.mutateAsync({
        sku: formData.sku,
        name: formData.name,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        unitId: formData.unitId || undefined,
        supplierId: formData.supplierId || undefined,
        storageLocationId: formData.storageLocationId || undefined,
        hsnCode: formData.hsnCode || undefined,
        gstRate: Number(formData.gstRate) || 0,
        minimumStockLevel: minStock,
        maximumStockLevel: maxStock,
        reorderQuantity: Number(formData.reorderQuantity) || 0,
        initialStock: Number(formData.initialStock) || 0,
        unitCost: Number(formData.unitCost) || 0,
        remarks: formData.remarks || undefined,
        isActive: true,
      });

      toast('Material Created', `Successfully created ${formData.name}`, 'success');
      router.push('/raw-materials');
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create raw material master record', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/raw-materials">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Package className="h-5 w-5 text-[#3ECF8E]" />
              Register New Raw Material Master
            </h1>
            <p className="text-xs text-muted-foreground">
              Define master item attributes, stock safety thresholds & accounting details.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Material Specs */}
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            1. Primary Material Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-muted-foreground">Material Code (SKU)</label>
                <button
                  type="button"
                  onClick={generateAutoCode}
                  className="text-[11px] text-[#3ECF8E] hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="h-3 w-3" /> Auto Generate
                </button>
              </div>
              <Input
                placeholder="RM-2026-0001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <Input
              label="Material Name"
              placeholder="e.g. Aluminum Sheet Grade 6061 2.5mm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <Select
                options={[
                  { label: 'Select Category...', value: '' },
                  ...(categories?.map((c) => ({ label: c.name, value: c.id })) || []),
                ]}
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Unit of Measure</label>
              <Select
                options={[
                  { label: 'Select Unit...', value: '' },
                  ...(units?.map((u) => ({ label: `${u.name} (${u.abbreviation})`, value: u.id })) || []),
                ]}
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Material Description</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={2}
              placeholder="Technical specifications, grade details, dimensions, alloy composition..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Safety Stock & Inventory Control */}
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            2. Safety Stock Thresholds & Initial Balance
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Minimum Stock Level"
              type="number"
              step="0.001"
              value={formData.minimumStockLevel}
              onChange={(e) => setFormData({ ...formData, minimumStockLevel: e.target.value })}
              required
            />
            <Input
              label="Maximum Stock Limit"
              type="number"
              step="0.001"
              value={formData.maximumStockLevel}
              onChange={(e) => setFormData({ ...formData, maximumStockLevel: e.target.value })}
            />
            <Input
              label="Reorder Level"
              type="number"
              step="0.001"
              value={formData.reorderQuantity}
              onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
            />
            <Input
              label="Initial Opening Stock"
              type="number"
              step="0.001"
              value={formData.initialStock}
              onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Financials & Tax */}
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            3. Purchase Cost & Tax Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Purchase Rate / Unit Cost (₹)"
              type="number"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
              required
            />
            <Input
              label="HSN Code"
              placeholder="e.g. 76061290"
              value={formData.hsnCode}
              onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
            />
            <Input
              label="GST Rate (%)"
              type="number"
              step="0.1"
              value={formData.gstRate}
              onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
            />
          </div>
        </div>

        {/* Section 4: Supplier & Storage Location */}
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            4. Primary Vendor & Storage Location Assignment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Primary Supplier</label>
              <Select
                options={[
                  { label: 'Select Preferred Vendor...', value: '' },
                  ...(suppliers?.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id })) || []),
                ]}
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Warehouse Storage Location</label>
              <Select
                options={[
                  { label: 'Select Warehouse Location...', value: '' },
                  ...(locations?.map((l) => ({ label: `${l.name} (${l.code})`, value: l.id })) || []),
                ]}
                value={formData.storageLocationId}
                onChange={(e) => setFormData({ ...formData, storageLocationId: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Remarks / Quality Notes</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={2}
              placeholder="Storage temperature constraints, handling safety instructions..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Link href="/raw-materials">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" disabled={createMaterial.isPending} leftIcon={<Save className="h-4 w-4" />}>
            Save & Register Material Master
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
