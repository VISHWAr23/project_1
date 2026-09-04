'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MasterDropdown } from './master-dropdown';
import { useAddProcessingOperation, useGauzeMasters } from '@/hooks/useGauzeProduction';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import { Layers, Scissors, Sparkles, Calculator } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface AddOperationModalProps {
  batch: GauzeProductionBatch;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultOperationCode?: string;
}

export function AddOperationModal({
  batch,
  isOpen,
  onClose,
  onSuccess,
  defaultOperationCode,
}: AddOperationModalProps) {
  const { toast } = useToast();
  const { data: masters } = useGauzeMasters();
  const addMutation = useAddProcessingOperation();

  const operations = batch.operations || [];
  const nextSeq = operations.length + 1;

  // Find preferred Cutting/Folding operation
  const preferredOp = useMemo(() => {
    const list = masters?.operationTypes || [];
    if (defaultOperationCode) {
      const match = list.find((o) => o.code === defaultOperationCode);
      if (match) return match;
    }
    const cut = list.find(
      (o) => o.code === 'OP-CUT' || o.code === 'OP-FOLD' || o.name.toLowerCase().includes('cut')
    );
    return cut || list[0];
  }, [masters?.operationTypes, defaultOperationCode]);

  const [operationTypeId, setOperationTypeId] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState(nextSeq);
  const [inputQuantity, setInputQuantity] = useState<number>(Number(batch.currentQuantity) || 1000);

  // Gamjee-style Pinning & Cutting inputs
  const [pinningSizeMeters, setPinningSizeMeters] = useState<number | ''>(3);
  const [foldingCutsCount, setFoldingCutsCount] = useState<number | ''>(3);

  const [outputQuantity, setOutputQuantity] = useState<number>(0);
  const [wastageQuantity, setWastageQuantity] = useState<number>(0);
  const [rejectedQuantity, setRejectedQuantity] = useState<number>(0);
  const [uom, setUom] = useState('pieces');
  const [employeeId, setEmployeeId] = useState('');
  const [machineId, setMachineId] = useState('Cutting & Folding Table 1');
  const [operationDate, setOperationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Auto-set initial operation type
  useEffect(() => {
    if (preferredOp && !operationTypeId) {
      setOperationTypeId(preferredOp.id);
    }
  }, [preferredOp, operationTypeId]);

  // Sync batch balance when batch changes
  useEffect(() => {
    if (batch.currentQuantity) {
      setInputQuantity(Number(batch.currentQuantity));
    }
  }, [batch.currentQuantity]);

  // Check if current operation is Cutting or Folding
  const selectedOp = useMemo(() => {
    return masters?.operationTypes?.find((o) => o.id === operationTypeId);
  }, [masters?.operationTypes, operationTypeId]);

  const isCuttingOrFolding = useMemo(() => {
    if (!selectedOp) return true;
    const name = selectedOp.name.toLowerCase();
    const code = selectedOp.code.toLowerCase();
    return (
      code.includes('cut') ||
      code.includes('fold') ||
      name.includes('cut') ||
      name.includes('fold') ||
      code.includes('prep')
    );
  }, [selectedOp]);

  // Unified yield calculation engine (identical formula to Gamjee production)
  const calculation = useMemo(() => {
    const pinningM = Number(pinningSizeMeters) > 0 ? Number(pinningSizeMeters) : 3;
    const cutsCount = Number(foldingCutsCount) > 0 ? Number(foldingCutsCount) : 3;
    const totalFabricM = Number(inputQuantity) > 0 ? Number(inputQuantity) : 0;

    const foldsCount = Math.floor(totalFabricM / pinningM);
    const fabricUsedMeters = foldsCount * pinningM;
    const fabricRemnantMeters = Math.max(0, totalFabricM - fabricUsedMeters);
    const calculatedPieces = foldsCount * cutsCount;

    return {
      pinningM,
      cutsCount,
      totalFabricM,
      foldsCount,
      fabricUsedMeters,
      fabricRemnantMeters: Number(fabricRemnantMeters.toFixed(2)),
      calculatedPieces,
    };
  }, [pinningSizeMeters, foldingCutsCount, inputQuantity]);

  // Synchronize calculated values into output and wastage
  useEffect(() => {
    if (isCuttingOrFolding && calculation.calculatedPieces > 0) {
      setOutputQuantity(calculation.calculatedPieces);
      setWastageQuantity(calculation.fabricRemnantMeters);
      setUom('pieces');
    }
  }, [isCuttingOrFolding, calculation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationTypeId) {
      toast('Required Field', 'Please select an operation type', 'warning');
      return;
    }
    if (inputQuantity <= 0) {
      toast('Invalid Quantity', 'Input quantity must be greater than 0', 'warning');
      return;
    }
    if (outputQuantity < 0) {
      toast('Invalid Quantity', 'Output quantity cannot be negative', 'warning');
      return;
    }
    if (inputQuantity > Number(batch.currentQuantity)) {
      toast(
        'Stock Error',
        `Input quantity (${inputQuantity}) exceeds available batch balance (${batch.currentQuantity})`,
        'error'
      );
      return;
    }

    const pinningSummary = isCuttingOrFolding
      ? `[Pinning: ${calculation.pinningM}m | Cuts: ${calculation.cutsCount} | Folds: ${calculation.foldsCount} | Fabric Used: ${calculation.fabricUsedMeters}m] `
      : '';

    try {
      await addMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          operationTypeId,
          sequenceNumber: Number(sequenceNumber),
          inputQuantity: Number(inputQuantity),
          outputQuantity: Number(outputQuantity),
          wastageQuantity: Number(wastageQuantity || 0),
          rejectedQuantity: Number(rejectedQuantity || 0),
          uom: uom || 'pieces',
          employeeId: employeeId || undefined,
          machineId: machineId || undefined,
          operationDate,
          notes: `${pinningSummary}${notes || ''}`.trim() || undefined,
        },
      });

      toast('Success', 'Internal processing operation recorded successfully!', 'success');
      onSuccess ? onSuccess() : onClose();
    } catch (err: any) {
      toast('Error', err.message || 'Failed to record processing operation', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Internal Production Operation (Cutting & Folding)"
      description={`Batch ${batch.batchNumber} — Current Processable Fabric: ${batch.currentQuantity} ${batch.currentUom}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MasterDropdown
            label="Operation Type"
            value={operationTypeId}
            onChange={(val) => setOperationTypeId(val)}
            type="operationType"
            mastersList={masters?.operationTypes || []}
            options={(masters?.operationTypes || []).map((op) => ({
              value: op.id,
              label: `${op.sequence}. ${op.name} (${op.code})`,
            }))}
            placeholder="-- Select Operation --"
            required
          />

          <Input
            label="Sequence Step Number"
            type="number"
            value={sequenceNumber}
            onChange={(e) => setSequenceNumber(Number(e.target.value))}
            min={1}
            required
          />
        </div>

        {/* Gamjee-style Cutting & Folding Input Engine */}
        {isCuttingOrFolding && (
          <div className="p-4 rounded-xl border border-indigo-500/25 bg-indigo-500/5 dark:bg-indigo-950/20 space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Cutting & Folding Calculation Engine
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                (Fabric ÷ Pinning) × Cuts = Cut Pieces
              </span>
            </div>

            {/* The exact 2 inputs requested: Pinning Size & Folding & Cutting Cuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap truncate">
                  Fabric Input (Meters) <span className="text-rose-500 ml-1">*</span>
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max={Number(batch.currentQuantity)}
                  value={inputQuantity}
                  onChange={(e) => setInputQuantity(Number(e.target.value))}
                  className="h-10 font-mono"
                  required
                />
              </div>

              <div>
                <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap truncate">
                  Pinning Size (Meters) <span className="text-rose-500 ml-1">*</span>
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.5"
                  placeholder="3"
                  value={pinningSizeMeters}
                  onChange={(e) =>
                    setPinningSizeMeters(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-10 font-mono"
                  required
                />
              </div>

              <div>
                <label className="flex items-center h-5 text-xs font-semibold text-foreground mb-1.5 whitespace-nowrap truncate">
                  Folding & Cutting (Cuts) <span className="text-rose-500 ml-1">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="3"
                  value={foldingCutsCount}
                  onChange={(e) =>
                    setFoldingCutsCount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="h-10 font-mono"
                  required
                />
              </div>
            </div>

            {/* Live Production Blueprint & Yield Calculation Banner */}
            <div className="rounded-lg border border-border/80 bg-card p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Live Production Blueprint & Yield Calculation
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Batch: {batch.batchNumber}
                </span>
              </div>

              {/* Step by step cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {/* Step 1: Pinning */}
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/60 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <span className="h-4 w-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px]">
                        1
                      </span>
                      Pinning Folds
                    </span>
                    <span>{calculation.pinningM}m / fold</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {calculation.foldsCount} Folds
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {calculation.totalFabricM}m ÷ {calculation.pinningM}m = {calculation.foldsCount} folds ({calculation.fabricRemnantMeters}m remnant)
                  </p>
                </div>

                {/* Step 2: Cutting */}
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/60 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <span className="h-4 w-4 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-[10px]">
                        2
                      </span>
                      Cutting Output
                    </span>
                    <span>{calculation.cutsCount} cuts / fold</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {calculation.calculatedPieces} Cut Pieces
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {calculation.foldsCount} folds × {calculation.cutsCount} cuts = {calculation.calculatedPieces} pieces
                  </p>
                </div>
              </div>

              {/* Summary Metric Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-border/60">
                <div className="p-2 bg-secondary/40 rounded-md text-center">
                  <span className="text-[10px] text-muted-foreground block">Planned Output</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {calculation.calculatedPieces} Pieces
                  </span>
                </div>
                <div className="p-2 bg-secondary/40 rounded-md text-center">
                  <span className="text-[10px] text-muted-foreground block">Fabric Consumed</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {calculation.fabricUsedMeters} Meters
                  </span>
                </div>
                <div className="p-2 bg-secondary/40 rounded-md text-center">
                  <span className="text-[10px] text-muted-foreground block">Remnant Wastage</span>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {calculation.fabricRemnantMeters} Meters
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quantities Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isCuttingOrFolding && (
            <Input
              label="Input Quantity"
              type="number"
              value={inputQuantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                setInputQuantity(val);
                setOutputQuantity(
                  Math.max(0, val - Number(wastageQuantity || 0) - Number(rejectedQuantity || 0))
                );
              }}
              min={0.01}
              max={Number(batch.currentQuantity)}
              step="any"
              required
              placeholder={`Max Available: ${batch.currentQuantity} ${batch.currentUom}`}
            />
          )}

          <Input
            label="Good Output Quantity"
            type="number"
            value={outputQuantity}
            onChange={(e) => setOutputQuantity(Number(e.target.value))}
            min={0}
            step="any"
            required
            placeholder="Processed yield available for next stage"
            className="font-mono font-bold text-indigo-600 dark:text-indigo-400"
          />

          <Input
            label="Operation Wastage (Edge trimming/scrap)"
            type="number"
            value={wastageQuantity}
            onChange={(e) => setWastageQuantity(Number(e.target.value))}
            min={0}
            step="any"
          />

          <Input
            label="Rejected Defect Quantity"
            type="number"
            value={rejectedQuantity}
            onChange={(e) => setRejectedQuantity(Number(e.target.value))}
            min={0}
            step="any"
          />

          <Input
            label="Unit of Measure (UOM)"
            value={uom}
            onChange={(e) => setUom(e.target.value)}
            required
            placeholder="pieces, rolls, meters"
          />

          <Input
            label="Operation Date"
            type="date"
            value={operationDate}
            onChange={(e) => setOperationDate(e.target.value)}
            required
          />

          <Input
            label="Machine / Cutting Table ID (Optional)"
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            placeholder="e.g. Slitter-01 / Table-B"
          />

          <Input
            label="Operator Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bleached fold alignment checked"
          />
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={addMutation.isPending}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Scissors className="h-4 w-4" />
            Record Processing Operation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
