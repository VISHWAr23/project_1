'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Save, Sparkles, AlertCircle, Scale, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
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

  const [itemType, setItemType] = useState<'RM' | 'PM' | 'FG'>('RM');
  const [hasDualUnit, setHasDualUnit] = useState(false);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    unitId: '',
    secondaryUnitId: '',
    conversionFactor: '',
    secondaryUnitName: '',
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
    brand: '',
    variantType: '',
    size: '',
    dimensionInches: '',
    dimensionCm: '',
    innerPackQty: '10',
    packUnit: 'Pcs',
    masterCartonQty: '12',
    features: '',
  });

  const selectedPrimaryUnit = units?.find((u) => u.id === formData.unitId);
  const selectedSecondaryUnit = units?.find((u) => u.id === formData.secondaryUnitId);

  const generateAutoCode = (type: 'RM' | 'PM' | 'FG' = itemType) => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${type}-${year}-${rand}` }));
    toast('Code Generated', `Auto-generated ${type} code assigned`, 'info');
  };

  const handleTypeChange = (type: 'RM' | 'PM' | 'FG') => {
    setItemType(type);
    generateAutoCode(type);
  };

  // Compute automatic packaging labels
  const innerQtyNum = Number(formData.innerPackQty) || 0;
  const masterQtyNum = Number(formData.masterCartonQty) || 0;
  const unitLabel = formData.packUnit || 'Pcs';

  const computedPackSizeLabel = innerQtyNum > 0 ? `${innerQtyNum} ${unitLabel.toUpperCase()}/PACK` : '';
  const computedBoxSizeLabel =
    masterQtyNum > 0
      ? `${masterQtyNum} PACKS/BOX${innerQtyNum > 0 ? ` (${innerQtyNum * masterQtyNum} ${unitLabel.toUpperCase()})` : ''}`
      : '';

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
        secondaryUnitId: hasDualUnit && formData.secondaryUnitId ? formData.secondaryUnitId : undefined,
        conversionFactor: hasDualUnit && formData.conversionFactor ? Number(formData.conversionFactor) : undefined,
        secondaryUnitName: hasDualUnit && formData.secondaryUnitName ? formData.secondaryUnitName : undefined,
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
        brand: formData.brand || undefined,
        variantType: formData.variantType || undefined,
        size: formData.size || undefined,
        dimensionInches: formData.dimensionInches || undefined,
        dimensionCm: formData.dimensionCm || undefined,
        packSize: computedPackSizeLabel || undefined,
        innerPackQty: innerQtyNum > 0 ? innerQtyNum : undefined,
        packUnit: formData.packUnit || undefined,
        boxSize: computedBoxSizeLabel || undefined,
        masterCartonQty: masterQtyNum > 0 ? masterQtyNum : undefined,
        features: formData.features || undefined,
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
      className="space-y-6 pb-12 w-full"
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
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Register New Item Master
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classification Selector */}
        <div className="bg-secondary/20 border border-border rounded-xl p-4 space-y-2">
          <label className="block text-xs font-semibold text-foreground">
            Select Item Classification
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('RM')}
              className={`p-3 rounded-lg border text-left transition-all ${
                itemType === 'RM'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500 ring-1 ring-blue-500'
                  : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary'
              }`}
            >
              <span className="block font-bold text-xs">Raw Material (RM)</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Cotton bales, grey yarn, chemicals, bleaching agents
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('PM')}
              className={`p-3 rounded-lg border text-left transition-all ${
                itemType === 'PM'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500 ring-1 ring-amber-500'
                  : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary'
              }`}
            >
              <span className="block font-bold text-xs">Packaging Material (PM)</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Corrugated boxes, poly covers, tapes, pouches, wrappers
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('FG')}
              className={`p-3 rounded-lg border text-left transition-all ${
                itemType === 'FG'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500'
                  : 'border-border bg-secondary/40 text-muted-foreground hover:bg-secondary'
              }`}
            >
              <span className="block font-bold text-xs">Finished Good (FG)</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Sterile Gauze swabs, roller bandages, gamjee pads
              </span>
            </button>
          </div>
        </div>

        {/* Section 1: Basic Material Specs */}
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            1. Primary Item Identification ({itemType === 'PM' ? 'Packaging Material' : itemType === 'FG' ? 'Finished Product' : 'Raw Material'})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-muted-foreground">Item Code (SKU)</label>
                <button
                  type="button"
                  onClick={() => generateAutoCode(itemType)}
                  className="text-[11px] text-[#3ECF8E] hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="h-3 w-3" /> Auto Generate ({itemType})
                </button>
              </div>
              <Input
                placeholder={`${itemType}-2026-0001`}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>

            <Input
              label={itemType === 'PM' ? 'Packaging Item Name' : itemType === 'FG' ? 'Finished Product Name' : 'Material Name'}
              placeholder={
                itemType === 'PM'
                  ? 'e.g. 5-Ply Corrugated Outer Carton 50x35x25cm'
                  : itemType === 'FG'
                  ? 'e.g. Sterile Gauze Swab 10x10cm (12 Ply)'
                  : 'e.g. 100% Combed Cotton Yarn 40s Count'
              }
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MasterEntityDropdown
              label="Category"
              entityType="category"
              placeholder="Select Category..."
              options={categories?.map((c) => ({ label: c.name, value: c.id, raw: c })) || []}
              value={formData.categoryId}
              onChange={(val) => setFormData({ ...formData, categoryId: val })}
            />

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Primary Unit of Measure (Base UOM)
              </label>
              <Select
                options={[
                  { label: 'Select Primary Unit...', value: '' },
                  ...(units?.map((u) => ({ label: `${u.name} (${u.abbreviation})`, value: u.id })) || []),
                ]}
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Dual Unit / Multi-Unit Measurement Option */}
          <div className="p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-blue-500" />
                  Secondary / Alternate Unit Measurement (Dual UOM)
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Enable when the same item is measured in multiple units (e.g. Bales & Kg, Rolls & Meters, Cones & Kg).
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDualUnit}
                  onChange={(e) => setHasDualUnit(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {hasDualUnit && (
              <div className="pt-2 border-t border-blue-500/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">
                    Secondary / Alternate Unit
                  </label>
                  <Select
                    options={[
                      { label: 'Select Secondary Unit...', value: '' },
                      ...(units?.map((u) => ({ label: `${u.name} (${u.abbreviation})`, value: u.id })) || []),
                    ]}
                    value={formData.secondaryUnitId}
                    onChange={(e) => {
                      const selected = units?.find((u) => u.id === e.target.value);
                      setFormData({
                        ...formData,
                        secondaryUnitId: e.target.value,
                        secondaryUnitName: selected?.name || '',
                      });
                    }}
                  />
                </div>

                <div>
                  <Input
                    label={`Conversion Ratio (1 ${formData.secondaryUnitName || 'Secondary Unit'} = X ${selectedPrimaryUnit?.abbreviation || 'Primary Units'})`}
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 170 (for 1 Bale = 170 Kg) or 500 (for 1 Roll = 500 m)"
                    value={formData.conversionFactor}
                    onChange={(e) => setFormData({ ...formData, conversionFactor: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 1.5: Finished Good Variant, Size & Packaging Specifications */}
        {itemType === 'FG' && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <h2 className="text-sm font-bold text-emerald-400 tracking-tight flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Finished Product Variant, Size & Packaging Configuration
              </h2>
              <span className="text-[11px] text-muted-foreground font-mono">
                Auto-Formatted Packaging Labels
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Brand / Label"
                placeholder="e.g. Dr. C Premium"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />

              <Input
                label="Product Type / Family"
                placeholder="e.g. Adult Pullups - Premium"
                value={formData.variantType}
                onChange={(e) => setFormData({ ...formData, variantType: e.target.value })}
              />

              <Input
                label="Size (e.g. M / L / XL / 10x10cm)"
                placeholder="e.g. MEDIUM (M)"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Waist / Dimension (Inches)"
                placeholder='e.g. 28"-44" (or 4"x4")'
                value={formData.dimensionInches}
                onChange={(e) => setFormData({ ...formData, dimensionInches: e.target.value })}
              />

              <Input
                label="Dimension (CM / Metric)"
                placeholder="e.g. 70-110 CM (or 10x10 cm)"
                value={formData.dimensionCm}
                onChange={(e) => setFormData({ ...formData, dimensionCm: e.target.value })}
              />
            </div>

            {/* Packaging Quantities with Auto-Generated Labels */}
            <div className="p-3 bg-secondary/30 border border-border rounded-xl space-y-3">
              <span className="text-xs font-semibold text-foreground block">
                Packaging Configuration (Quantities Only — Labels Auto-Generated)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Pieces per Inner Pack (Qty)"
                  type="number"
                  placeholder="e.g. 10"
                  value={formData.innerPackQty}
                  onChange={(e) => setFormData({ ...formData, innerPackQty: e.target.value })}
                />

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Pack Item Unit</label>
                  <Select
                    options={[
                      { label: 'Pcs (Pieces)', value: 'Pcs' },
                      { label: 'Wipes', value: 'Wipes' },
                      { label: 'Pads', value: 'Pads' },
                      { label: 'Rolls', value: 'Rolls' },
                      { label: 'Swabs', value: 'Swabs' },
                      { label: 'Gowns', value: 'Gowns' },
                    ]}
                    value={formData.packUnit}
                    onChange={(e) => setFormData({ ...formData, packUnit: e.target.value })}
                  />
                </div>

                <Input
                  label="Packs per Master Box / Carton (Qty)"
                  type="number"
                  placeholder="e.g. 12"
                  value={formData.masterCartonQty}
                  onChange={(e) => setFormData({ ...formData, masterCartonQty: e.target.value })}
                />
              </div>

              {/* Dynamic Auto-Label Preview */}
              {(computedPackSizeLabel || computedBoxSizeLabel) && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-[10px] uppercase">Auto Labels:</span>
                    {computedPackSizeLabel && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold font-mono rounded">
                        {computedPackSizeLabel}
                      </span>
                    )}
                    {computedBoxSizeLabel && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 font-bold font-mono rounded">
                        {computedBoxSizeLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Total Items per Master Box: <strong>{innerQtyNum * masterQtyNum} {unitLabel}</strong>
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Key Features & Functional Specs
              </label>
              <Input
                placeholder="e.g. Soft Waist Panel, Anti Bacterial, Super Absorbent, Super Leak guard, Wetness indicator"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>
          </div>
        )}

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
            <MasterEntityDropdown
              label="Primary Supplier"
              entityType="supplier"
              placeholder="Select Preferred Vendor..."
              options={suppliers?.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id, raw: s })) || []}
              value={formData.supplierId}
              onChange={(val) => setFormData({ ...formData, supplierId: val })}
            />

            <MasterEntityDropdown
              label="Warehouse Storage Location"
              entityType="location"
              placeholder="Select Warehouse Location..."
              options={locations?.map((l) => ({ label: `${l.name} (${l.code})`, value: l.id, raw: l })) || []}
              value={formData.storageLocationId}
              onChange={(val) => setFormData({ ...formData, storageLocationId: val })}
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
