'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIssueGamjeeMaterials } from '@/hooks/useGamjeeProduction';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { GamjeeProductionBatch } from '@/types/gamjee-production.types';
import { toast } from '@/components/ui/toast';
import { Package, AlertCircle, Sparkles, Layers } from 'lucide-react';

interface IssueMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: GamjeeProductionBatch;
}

export function IssueMaterialsModal({ isOpen, onClose, batch }: IssueMaterialsModalProps) {
  const { data: materialsData, isLoading: loadingMaterials } = useRawMaterials({ limit: 100 });
  const issueMutation = useIssueGamjeeMaterials();

  const materials = materialsData?.items || [];

  // Filter raw materials
  const fabricMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes('fabric') ||
      m.name.toLowerCase().includes('gauze') ||
      m.sku.toLowerCase().includes('gauze') ||
      m.category?.name?.toLowerCase().includes('fabric') ||
      m.category?.name?.toLowerCase().includes('raw')
  );

  const cottonMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes('cotton') ||
      m.sku.toLowerCase().includes('cot') ||
      m.category?.name?.toLowerCase().includes('cotton') ||
      m.category?.name?.toLowerCase().includes('raw')
  );

  const [fabricProductId, setFabricProductId] = useState('');
  const [fabricQty, setFabricQty] = useState<number | ''>(1000);
  const [fabricRollNo, setFabricRollNo] = useState('');
  const [fabricUom, setFabricUom] = useState('meter');

  const [cottonProductId, setCottonProductId] = useState('');
  const [cottonQty, setCottonQty] = useState<number | ''>(12);
  const [cottonRollNo, setCottonRollNo] = useState('');
  const [cottonUom, setCottonUom] = useState('kg');

  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Auto-select first matching products
  useEffect(() => {
    if (fabricMaterials.length > 0 && !fabricProductId) {
      setFabricProductId(fabricMaterials[0].id);
    }
    if (cottonMaterials.length > 0 && !cottonProductId) {
      setCottonProductId(cottonMaterials[0].id);
    }
  }, [fabricMaterials, cottonMaterials, fabricProductId, cottonProductId]);

  const selectedFabric = materials.find((m) => m.id === fabricProductId);
  const selectedCotton = materials.find((m) => m.id === cottonProductId);

  const fabricStock = Number(selectedFabric?.currentStockBalance || 0);
  const cottonStock = Number(selectedCotton?.currentStockBalance || 0);

  const isFabricOverstock = Number(fabricQty) > fabricStock && fabricStock > 0;
  const isCottonOverstock = Number(cottonQty) > cottonStock && cottonStock > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fabricProductId || !cottonProductId) {
      toast.error('Please select both Bleached Fabric and Cotton Roll products');
      return;
    }
    if (!fabricQty || Number(fabricQty) <= 0 || !cottonQty || Number(cottonQty) <= 0) {
      toast.error('Please enter valid quantities greater than zero');
      return;
    }

    try {
      await issueMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          fabricProductId,
          fabricRollOrBatchNumber: fabricRollNo || undefined,
          fabricQuantityIssued: Number(fabricQty),
          fabricUom,
          cottonProductId,
          cottonRollOrBatchNumber: cottonRollNo || undefined,
          cottonQuantityIssued: Number(cottonQty),
          cottonUom,
          issuedDate,
          notes: notes || undefined,
        },
      });

      toast.success('Raw materials issued to production batch successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to issue materials');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Raw Materials to Production Batch" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-primary flex items-center justify-between">
          <div>
            <span className="font-semibold">Production Batch:</span> {batch.batchNumber}
          </div>
          <div>
            <span className="font-semibold">Target Product:</span> {batch.finishedProduct?.name || 'Gamjee Roll'}
          </div>
          {batch.gamjeeSize && (
            <div>
              <span className="font-semibold">Size:</span> {batch.gamjeeSize.name}
            </div>
          )}
        </div>

        {/* Section 1: Bleached Fabric */}
        <div className="border border-border/80 rounded-xl p-4 bg-card/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Layers className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              1. Bleached Fabric Allocation
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Select Bleached Fabric <span className="text-rose-500">*</span>
              </label>
              <select
                value={fabricProductId}
                onChange={(e) => setFabricProductId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                required
              >
                <option value="">Select Bleached Fabric Product</option>
                {(fabricMaterials.length > 0 ? fabricMaterials : materials).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.sku}) - Stock: {m.currentStockBalance} {m.unit?.abbreviation || 'm'}
                  </option>
                ))}
              </select>
              {selectedFabric && (
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                  Available in Warehouse: <strong className="text-foreground">{selectedFabric.currentStockBalance}</strong> {selectedFabric.unit?.abbreviation || 'm'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Fabric Lot / Roll Number (Optional)
              </label>
              <Input
                placeholder="e.g. BF-LOT-2026-08"
                value={fabricRollNo}
                onChange={(e) => setFabricRollNo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Quantity to Issue <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="1000"
                value={fabricQty}
                onChange={(e) => setFabricQty(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
              {isFabricOverstock && (
                <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>Exceeds available warehouse stock ({fabricStock})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Fabric UOM</label>
              <Input value={fabricUom} onChange={(e) => setFabricUom(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2: Cotton Roll */}
        <div className="border border-border/80 rounded-xl p-4 bg-card/60 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              2. Cotton Roll Allocation
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Select Cotton Roll <span className="text-rose-500">*</span>
              </label>
              <select
                value={cottonProductId}
                onChange={(e) => setCottonProductId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                required
              >
                <option value="">Select Cotton Product</option>
                {(cottonMaterials.length > 0 ? cottonMaterials : materials).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.sku}) - Stock: {m.currentStockBalance} {m.unit?.abbreviation || 'kg'}
                  </option>
                ))}
              </select>
              {selectedCotton && (
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                  Available in Warehouse: <strong className="text-foreground">{selectedCotton.currentStockBalance}</strong> {selectedCotton.unit?.abbreviation || 'kg'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Cotton Lot / Batch Number (Optional)
              </label>
              <Input
                placeholder="e.g. COT-LOT-400G"
                value={cottonRollNo}
                onChange={(e) => setCottonRollNo(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Cotton Quantity to Issue <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="12"
                value={cottonQty}
                onChange={(e) => setCottonQty(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
              {isCottonOverstock && (
                <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-500 font-medium">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>Exceeds available warehouse stock ({cottonStock})</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Cotton UOM</label>
              <Input value={cottonUom} onChange={(e) => setCottonUom(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 3: Date & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Issue Date</label>
            <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Notes / Instructions</label>
            <Input
              placeholder="e.g. High absorbency roll production batch"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={issueMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={issueMutation.isPending || loadingMaterials}>
            {issueMutation.isPending ? 'Issuing Materials...' : 'Issue Materials & Start Production'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
