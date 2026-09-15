'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Save, RefreshCw, Scale, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { useToast } from '@/components/ui/toast';
import {
  useRawMaterialDetail,
  useUpdateRawMaterial,
  useRawMaterialCategories,
  useRawMaterialUnits,
  useSuppliers,
  useStorageLocations,
} from '@/hooks/useRawMaterials';

export default function EditRawMaterialPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { toast } = useToast();

  const { data: material, isLoading } = useRawMaterialDetail(id);
  const updateMaterial = useUpdateRawMaterial();

  const { data: categories } = useRawMaterialCategories();
  const { data: units } = useRawMaterialUnits();
  const { data: suppliers } = useSuppliers();
  const { data: locations } = useStorageLocations();

  const [hasDualUnit, setHasDualUnit] = useState(false);
  const [itemSource, setItemSource] = useState<'MANUFACTURED' | 'TRADED'>('MANUFACTURED');

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

  useEffect(() => {
    if (material) {
      setHasDualUnit(Boolean(material.secondaryUnitId || material.conversionFactor));
      setFormData({
        sku: material.sku || '',
        name: material.name || '',
        description: material.description || '',
        categoryId: material.categoryId || '',
        unitId: material.unitId || '',
        secondaryUnitId: material.secondaryUnitId || '',
        conversionFactor: material.conversionFactor ? String(material.conversionFactor) : '',
        secondaryUnitName: material.secondaryUnitName || material.secondaryUnit?.name || '',
        supplierId: material.supplierId || '',
        storageLocationId: material.storageLocationId || '',
        hsnCode: material.hsnCode || '',
        gstRate: String(material.gstRate ?? 18),
        minimumStockLevel: String(material.minimumStockLevel ?? 100),
        maximumStockLevel: String(material.maximumStockLevel ?? 1000),
        reorderQuantity: String(material.reorderQuantity ?? 200),
        unitCost: String(material.unitCost ?? 0),
        remarks: material.remarks || '',
        brand: material.brand || '',
        variantType: material.variantType || '',
        size: material.size || '',
        dimensionInches: material.dimensionInches || '',
        dimensionCm: material.dimensionCm || '',
        innerPackQty: material.innerPackQty ? String(material.innerPackQty) : '10',
        packUnit: material.packUnit || 'Pcs',
        masterCartonQty: material.masterCartonQty ? String(material.masterCartonQty) : '12',
        features: material.features || '',
      });
      setItemSource((material.itemSource as any) || 'MANUFACTURED');
    }
  }, [material]);

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
      await updateMaterial.mutateAsync({
        id,
        payload: {
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
          unitCost: Number(formData.unitCost) || 0,
          remarks: formData.remarks || undefined,
          itemSource,
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
        },
      });

      toast('Material Updated', `Successfully updated ${formData.name}`, 'success');
      router.push(`/raw-materials/${id}`);
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update material record', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="h-6 w-6 animate-spin text-[#3ECF8E]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 w-full"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/raw-materials/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Package className="h-5 w-5 text-[#3ECF8E]" />
              Edit Raw Material Master - {material?.sku}
            </h1>
          </div>

        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            1. Material Identification & Cataloging
          </h2>

          {/* Sourcing & Procurement Classification */}
          <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
            <label className="block text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Procurement & Sourcing Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setItemSource('MANUFACTURED')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  itemSource === 'MANUFACTURED'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                <span className="font-bold text-xs flex items-center gap-1.5">
                  🏭 In-House Plant Manufactured
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Produced in plant across Bleaching, Gauze, Gamjee, Stitching or Job Work
                </span>
              </button>

              <button
                type="button"
                onClick={() => setItemSource('TRADED')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  itemSource === 'TRADED'
                    ? 'border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                <span className="font-bold text-xs flex items-center gap-1.5">
                  🛒 Direct Buy & Sell (Traded Product)
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Procured complete from vendors and directly resold to customers/hospitals
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Material Code (SKU)"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              required
            />
            <Input
              label="Material Name"
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

        {/* Section 1.5: Product Variant, Size & Packaging Specifications */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <h2 className="text-sm font-bold text-emerald-400 tracking-tight">
              Product Variant, Size & Packaging Configuration
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
                <MasterEntityDropdown
                  label="Pack Item Unit"
                  value={formData.packUnit}
                  onChange={(val) => setFormData({ ...formData, packUnit: val })}
                  storageKey="material_pack_item_units"
                  options={[
                    { label: 'Pcs (Pieces)', value: 'Pcs' },
                    { label: 'Wipes', value: 'Wipes' },
                    { label: 'Pads', value: 'Pads' },
                    { label: 'Rolls', value: 'Rolls' },
                    { label: 'Swabs', value: 'Swabs' },
                    { label: 'Gowns', value: 'Gowns' },
                    { label: 'Packs', value: 'Packs' },
                    { label: 'Boxes', value: 'Boxes' },
                    { label: 'Bottles', value: 'Bottles' },
                    { label: 'Pairs', value: 'Pairs' },
                  ]}
                  placeholder="Select Pack Unit..."
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

        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            2. Safety Thresholds & Financials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Minimum Stock Level"
              type="number"
              value={formData.minimumStockLevel}
              onChange={(e) => setFormData({ ...formData, minimumStockLevel: e.target.value })}
              required
            />
            <Input
              label="Maximum Stock Limit"
              type="number"
              value={formData.maximumStockLevel}
              onChange={(e) => setFormData({ ...formData, maximumStockLevel: e.target.value })}
            />
            <Input
              label="Reorder Level"
              type="number"
              value={formData.reorderQuantity}
              onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Purchase Rate (₹)"
              type="number"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
            />
            <Input
              label="HSN Code"
              value={formData.hsnCode}
              onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
            />
            <Input
              label="GST Rate (%)"
              type="number"
              value={formData.gstRate}
              onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
            />
          </div>
        </div>

        {/* Section 3: Primary Vendor */}
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            3. Primary Vendor Assignment
          </h2>

          <div>
            <MasterEntityDropdown
              label="Primary Supplier"
              entityType="supplier"
              placeholder="Select Preferred Vendor..."
              options={suppliers?.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id, raw: s })) || []}
              value={formData.supplierId}
              onChange={(val) => setFormData({ ...formData, supplierId: val })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <Link href={`/raw-materials/${id}`}>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" disabled={updateMaterial.isPending} leftIcon={<Save className="h-4 w-4" />}>
            Update Material Master
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
