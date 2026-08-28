'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Factory,
  ArrowLeft,
  CheckCircle2,
  Package,
  Calendar,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MasterDropdown } from '@/components/gauze-production/master-dropdown';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { useCreateGauzeBatch, useGauzeMasters } from '@/hooks/useGauzeProduction';
import { useRawMaterials, useSuppliers, useStorageLocations } from '@/hooks/useRawMaterials';
import { useToast } from '@/components/ui/toast';

export default function CreateGauzeBatchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createBatchMutation = useCreateGauzeBatch();

  const { data: materialsData } = useRawMaterials({ limit: 100 });
  const rawMaterials = materialsData?.items || [];

  const { data: suppliers = [] } = useSuppliers();
  const { data: locations = [] } = useStorageLocations();
  const { data: masters } = useGauzeMasters();

  const [productId, setProductId] = useState('');
  const [gauzeTypeId, setGauzeTypeId] = useState(masters?.gauzeTypes?.[0]?.id || '');
  const [gauzeSizeId, setGauzeSizeId] = useState(masters?.gauzeSizes?.[0]?.id || '');
  const [supplierId, setSupplierId] = useState('');
  const [supplierReference, setSupplierReference] = useState('');
  const [rollOrThansNumber, setRollOrThansNumber] = useState('');
  const [inputQuantity, setInputQuantity] = useState<number>(1000);
  const [inputUom, setInputUom] = useState('meter');
  const [productionStartDate, setProductionStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');

  // When product is selected, auto-populate supplier if present
  const handleProductChange = (id: string) => {
    setProductId(id);
    const selected = rawMaterials.find((m: any) => m.id === id);
    if (selected) {
      if (selected.supplierId) setSupplierId(selected.supplierId);
      if (selected.storageLocationId) setWarehouseId(selected.storageLocationId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast('Required Field', 'Please select the raw gauze product', 'warning');
      return;
    }
    if (inputQuantity <= 0) {
      toast('Invalid Quantity', 'Input quantity must be greater than 0', 'warning');
      return;
    }

    try {
      const created = await createBatchMutation.mutateAsync({
        productId,
        gauzeTypeId: gauzeTypeId || undefined,
        gauzeSizeId: gauzeSizeId || undefined,
        supplierId: supplierId || undefined,
        supplierReference: supplierReference || undefined,
        rollOrThansNumber: rollOrThansNumber || undefined,
        inputQuantity: Number(inputQuantity),
        inputUom,
        productionStartDate: productionStartDate || undefined,
        expectedCompletionDate: expectedCompletionDate || undefined,
        warehouseId: warehouseId || undefined,
        notes: notes || undefined,
      });

      toast('Batch Created', `Production batch ${created.batchNumber} created successfully!`, 'success');
      router.push(`/gauze-production/batches/${created.id}`);
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Failed to create production batch', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Link & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/gauze-production/batches">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Create New Gauze Production Batch
            </h1>
          </div>

        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Raw Material & Specification */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border text-sm font-bold text-foreground">
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            1. Raw Gauze Material & Specification
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Select
                label="Raw Gauze Fabric / Product"
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                options={[
                  { value: '', label: '-- Select Raw Gauze Material from Catalogue --' },
                  ...rawMaterials.map((rm: any) => ({
                    value: rm.id,
                    label: `${rm.name} (${rm.sku})`,
                  })),
                ]}
                required
              />
            </div>

            <MasterDropdown
              label="Gauze Specification / Type"
              value={gauzeTypeId}
              onChange={(val) => setGauzeTypeId(val)}
              type="gauzeType"
              mastersList={masters?.gauzeTypes || []}
              options={(masters?.gauzeTypes || []).map((t) => ({ value: t.id, label: t.name }))}
              placeholder="-- Select Gauze Type --"
            />

            <MasterDropdown
              label="Gauze Dimensions / Size"
              value={gauzeSizeId}
              onChange={(val) => setGauzeSizeId(val)}
              type="gauzeSize"
              mastersList={masters?.gauzeSizes || []}
              options={(masters?.gauzeSizes || []).map((s) => ({ value: s.id, label: s.name }))}
              placeholder="-- Select Gauze Size --"
            />
          </div>
        </Card>

        {/* Step 2: Intake Quantity & Supplier */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border text-sm font-bold text-foreground">
            <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            2. Material Intake & Supplier Lot
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MasterEntityDropdown
              label="Supplier / Fabric Mill"
              entityType="supplier"
              placeholder="-- Select Supplier --"
              options={suppliers.map((s: any) => ({ label: `${s.name} (${s.code})`, value: s.id, raw: s }))}
              value={supplierId}
              onChange={(val) => setSupplierId(val)}
            />

            <Input
              label="Supplier Invoice / DC Reference"
              value={supplierReference}
              onChange={(e) => setSupplierReference(e.target.value)}
              placeholder="e.g. INV-2026-8890 or DC-4412"
            />

            <Input
              label="Roll / Thans Lot Number"
              value={rollOrThansNumber}
              onChange={(e) => setRollOrThansNumber(e.target.value)}
              placeholder="e.g. ROLL-01 to 05 / Lot-92A"
            />

            <MasterEntityDropdown
              label="Raw Material Receiving Warehouse"
              entityType="location"
              placeholder="-- Select Warehouse Location --"
              options={locations.map((loc: any) => ({ label: `${loc.name} (${loc.code})`, value: loc.id, raw: loc }))}
              value={warehouseId}
              onChange={(val) => setWarehouseId(val)}
            />

            <Input
              label="Input Material Quantity"
              type="number"
              value={inputQuantity}
              onChange={(e) => setInputQuantity(Number(e.target.value))}
              min={0.01}
              step="any"
              required
            />

            <Select
              label="Unit of Measure (UOM)"
              value={inputUom}
              onChange={(e) => setInputUom(e.target.value)}
              options={[
                { value: 'meter', label: 'meter (m)' },
                { value: 'kg', label: 'Kilogram (Kg)' },
                { value: 'than', label: 'than' },
                { value: 'roll', label: 'roll' },
                { value: 'piece', label: 'piece (pcs)' },
              ]}
              required
            />
          </div>
        </Card>

        {/* Step 3: Production Schedule & Notes */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border text-sm font-bold text-foreground">
            <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            3. Production Schedule & Notes
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Production Start Date"
              type="date"
              value={productionStartDate}
              onChange={(e) => setProductionStartDate(e.target.value)}
            />

            <Input
              label="Expected Completion Date"
              type="date"
              value={expectedCompletionDate}
              onChange={(e) => setExpectedCompletionDate(e.target.value)}
            />

            <div className="sm:col-span-2">
              <Input
                label="Production Notes / Quality Instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Urgent order for sterile absorbent swabs, target 10cm x 10cm 8-ply"
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/gauze-production/batches">
            <Button type="button" variant="outline" className="h-10 px-5">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={createBatchMutation.isPending}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6 shadow-md text-sm"
          >
            <Factory className="h-4 w-4" />
            Start Production Batch
          </Button>
        </div>
      </form>
    </div>
  );
}
