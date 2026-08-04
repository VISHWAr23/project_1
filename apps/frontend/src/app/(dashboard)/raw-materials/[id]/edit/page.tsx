'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
    unitCost: '0',
    remarks: '',
  });

  useEffect(() => {
    if (material) {
      setFormData({
        sku: material.sku || '',
        name: material.name || '',
        description: material.description || '',
        categoryId: material.categoryId || '',
        unitId: material.unitId || '',
        supplierId: material.supplierId || '',
        storageLocationId: material.storageLocationId || '',
        hsnCode: material.hsnCode || '',
        gstRate: String(material.gstRate ?? 18),
        minimumStockLevel: String(material.minimumStockLevel ?? 100),
        maximumStockLevel: String(material.maximumStockLevel ?? 1000),
        reorderQuantity: String(material.reorderQuantity ?? 200),
        unitCost: String(material.unitCost ?? 0),
        remarks: material.remarks || '',
      });
    }
  }, [material]);

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
          supplierId: formData.supplierId || undefined,
          storageLocationId: formData.storageLocationId || undefined,
          hsnCode: formData.hsnCode || undefined,
          gstRate: Number(formData.gstRate) || 0,
          minimumStockLevel: minStock,
          maximumStockLevel: maxStock,
          reorderQuantity: Number(formData.reorderQuantity) || 0,
          unitCost: Number(formData.unitCost) || 0,
          remarks: formData.remarks || undefined,
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
      className="max-w-4xl mx-auto space-y-6 pb-12"
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
            <p className="text-xs text-muted-foreground">Modify item master details, threshold limits & pricing</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground tracking-tight border-b border-border pb-2">
            1. Material Identification & Cataloging
          </h2>

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
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
