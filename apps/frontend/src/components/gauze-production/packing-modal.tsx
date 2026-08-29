'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useCreatePackingEntry } from '@/hooks/useGauzeProduction';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import { Box, CheckCircle2, Calculator } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface PackingModalProps {
  batch: GauzeProductionBatch;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PackingModal({ batch, isOpen, onClose, onSuccess }: PackingModalProps) {
  const { toast } = useToast();
  const { data: materialsData } = useRawMaterials({ limit: 100 });
  const rawMaterials = materialsData?.items || [];
  const packingMutation = useCreatePackingEntry();

  const [productId, setProductId] = useState('');
  const [sizeDescription, setSizeDescription] = useState('10cm x 4m');
  const [ply, setPly] = useState<number | undefined>(undefined);
  const [piecesPerPack, setPiecesPerPack] = useState<number>(100);
  const [numberOfPacks, setNumberOfPacks] = useState<number>(50);
  const [packingDate, setPackingDate] = useState(new Date().toISOString().split('T')[0]);
  const [finishedGoodsWarehouseId, setFinishedGoodsWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [markBatchCompleted, setMarkBatchCompleted] = useState(true);

  const totalPieces = (piecesPerPack || 0) * (numberOfPacks || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast('Required Field', 'Please select a finished product from the catalogue', 'warning');
      return;
    }
    if (piecesPerPack <= 0 || numberOfPacks <= 0) {
      toast('Invalid Values', 'Pieces per pack and number of packs must be greater than 0', 'warning');
      return;
    }

    try {
      await packingMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          productId,
          sizeDescription: sizeDescription || undefined,
          ply: ply ? Number(ply) : undefined,
          piecesPerPack: Number(piecesPerPack),
          numberOfPacks: Number(numberOfPacks),
          packingDate,
          finishedGoodsWarehouseId: finishedGoodsWarehouseId || undefined,
          notes: notes || undefined,
          markBatchCompleted,
        },
      });

      toast('Success', `Packed ${numberOfPacks} packs (${totalPieces.toLocaleString()} pcs) & updated finished goods inventory!`, 'success');
      onSuccess ? onSuccess() : onClose();
    } catch (err: any) {
      toast('Error', err.message || 'Failed to create packing entry', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert to Finished Goods (Packing)"
      description={`Batch ${batch.batchNumber} — Final Packaging & Inventory Inwarding`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Batch Info */}
        <div className="p-3 bg-secondary/40 rounded-lg border border-border flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-muted-foreground block font-sans">Processed Batch Yield:</span>
            <strong className="text-foreground text-sm">{batch.currentQuantity} {batch.currentUom}</strong>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground block font-sans">Batch Specification:</span>
            <strong className="text-blue-600 dark:text-blue-400">{batch.gauzeType?.name || 'Standard Gauze'}</strong>
          </div>
        </div>

        <Select
          label="Target Finished Product (Catalogue)"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          options={[
            { value: '', label: '-- Select Finished Product --' },
            ...rawMaterials.map((rm: any) => ({
              value: rm.id,
              label: `${rm.name} (${rm.sku})`,
            })),
          ]}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Finished Dimensions / Size"
            value={sizeDescription}
            onChange={(e) => setSizeDescription(e.target.value)}
            placeholder="e.g. 10cm x 4m or 10cm x 10cm"
          />

          <Input
            label="Ply (Layering) (Optional)"
            type="number"
            value={ply || ''}
            onChange={(e) => setPly(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 4, 8, 12, 16"
            min={1}
          />

          <Input
            label="Pieces per Pack"
            type="number"
            value={piecesPerPack}
            onChange={(e) => setPiecesPerPack(Number(e.target.value))}
            min={1}
            required
            placeholder="e.g. 100 swabs / pack"
          />

          <Input
            label="Total Number of Packs"
            type="number"
            value={numberOfPacks}
            onChange={(e) => setNumberOfPacks(Number(e.target.value))}
            min={1}
            required
            placeholder="e.g. 50 packs"
          />
        </div>

        {/* Live Automatic Calculation Banner */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-foreground font-sans font-medium">Automatic Total Production:</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground mr-2 font-sans">
              {numberOfPacks} packs × {piecesPerPack} pcs =
            </span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-base font-bold">
              {totalPieces.toLocaleString()} Finished Pieces
            </strong>
          </div>
        </div>

        <div>
          <Input
            label="Packing Date"
            type="date"
            value={packingDate}
            onChange={(e) => setPackingDate(e.target.value)}
            required
          />
        </div>

        {/* Checkbox: Complete Batch */}
        <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-colors select-none">
          <input
            type="checkbox"
            checked={markBatchCompleted}
            onChange={(e) => setMarkBatchCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-foreground block">Mark Gauze Batch as COMPLETED</span>
            <span className="text-muted-foreground">
              Finalize this production journey and update the batch completion date.
            </span>
          </div>
        </label>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={packingMutation.isPending} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <Box className="h-4 w-4" />
            Inward Finished Goods to Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
}
