'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateGamjeeBatch, useGamjeeMasters } from '@/hooks/useGamjeeProduction';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { toast } from '@/components/ui/toast';
import { ArrowLeft, Plus, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

export default function CreateGamjeeBatchPage() {
  const router = useRouter();
  const createBatchMutation = useCreateGamjeeBatch();
  const { data: masters } = useGamjeeMasters();
  const { data: materialsData } = useRawMaterials({ limit: 100 });

  const sizes = masters?.sizes || [];
  const materials = materialsData?.items || [];

  // Filter finished gamjee products or finished goods
  const gamjeeProducts = materials.filter(
    (m) =>
      m.name.toLowerCase().includes('gamjee') ||
      m.sku.toLowerCase().includes('gamjee') ||
      m.name.toLowerCase().includes('roll') ||
      m.category?.name?.toLowerCase().includes('finished')
  );

  const [finishedProductId, setFinishedProductId] = useState('');
  const [gamjeeSizeId, setGamjeeSizeId] = useState('');
  const [plannedQty, setPlannedQty] = useState<number | ''>(100);
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-select first matching product and size
  useEffect(() => {
    if (gamjeeProducts.length > 0 && !finishedProductId) {
      const match = gamjeeProducts.find((p) => p.name.toLowerCase().includes('gamjee')) || gamjeeProducts[0];
      setFinishedProductId(match.id);
    }
    if (sizes.length > 0 && !gamjeeSizeId) {
      setGamjeeSizeId(sizes[0].id);
    }
  }, [gamjeeProducts, sizes, finishedProductId, gamjeeSizeId]);

  const selectedProduct = materials.find((m) => m.id === finishedProductId);
  const selectedSize = sizes.find((s) => s.id === gamjeeSizeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishedProductId) {
      toast.error('Please select the finished Gamjee product');
      return;
    }

    try {
      const created = await createBatchMutation.mutateAsync({
        finishedProductId,
        gamjeeSizeId: gamjeeSizeId || undefined,
        productionQuantity: plannedQty ? Number(plannedQty) : undefined,
        productionUom: 'Rolls',
        productionDate,
        expectedCompletionDate: expectedDate || undefined,
        notes: notes || undefined,
      });

      toast.success(`Production Batch ${created.batchNumber} created successfully!`);
      router.push(`/gamjee-production/batches/${created.id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create production batch');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/gamjee-production/batches">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Create Gamjee Roll Production Batch
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Initialize a new production run. You will issue Bleached Fabric and Cotton Roll in the next step.
          </p>
        </div>
      </div>

      <Card className="p-6 bg-card border-border shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Product */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Finished Gamjee Product <span className="text-rose-500">*</span>
            </label>
            <select
              value={finishedProductId}
              onChange={(e) => setFinishedProductId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">Select Finished Product</option>
              {(gamjeeProducts.length > 0 ? gamjeeProducts : materials).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sku}) - In Stock: {m.currentStockBalance} {m.unit?.abbreviation || 'Rolls'}
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                SKU: <strong className="text-foreground">{selectedProduct.sku}</strong> | Current Stock Balance:{' '}
                <strong className="text-foreground">{selectedProduct.currentStockBalance} Rolls</strong>
              </p>
            )}
          </div>

          {/* Gamjee Size & Planned Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Gamjee Roll Size Specification
              </label>
              <select
                value={gamjeeSizeId}
                onChange={(e) => setGamjeeSizeId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                <option value="">Select Roll Size</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.width}cm x {s.length}m)
                  </option>
                ))}
              </select>
              {selectedSize && (
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                  Width: {selectedSize.width}cm | Length: {selectedSize.length}m
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Planned Output Quantity (Rolls)
              </label>
              <Input
                type="number"
                min="1"
                placeholder="100"
                value={plannedQty}
                onChange={(e) => setPlannedQty(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Target quantity of finished rolls for this job
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Production Start Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="h-10"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Expected Completion Date (Optional)
              </label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Production Job Notes / Client Order Reference
            </label>
            <Input
              placeholder="e.g. Priority order for City Hospital, 15cm x 8m Gamjee Roll"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link href="/gamjee-production/batches">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createBatchMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{createBatchMutation.isPending ? 'Creating...' : 'Create Batch & Proceed'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
