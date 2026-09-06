'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAddProcessingOperation, useGauzeMasters } from '@/hooks/useGauzeProduction';
import { useEmployees } from '@/hooks/useEmployees';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import {
  Scissors,
  Calculator,
  Sparkles,
  Layers,
  User,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
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
  const { data: employeesData } = useEmployees({ status: 'ACTIVE', limit: 100 });
  const addMutation = useAddProcessingOperation();

  const employees = employeesData?.items || [];
  const operations = batch.operations || [];
  const nextSeq = operations.length + 1;

  // Auto-find preferred Cutting/Folding operation
  const preferredOp = useMemo(() => {
    const list = masters?.operationTypes || [];
    if (defaultOperationCode) {
      const match = list.find((o) => o.code === defaultOperationCode);
      if (match) return match;
    }
    const cut = list.find(
      (o) =>
        o.code === 'OP-CUT' ||
        o.code === 'OP-FOLD' ||
        o.name.toLowerCase().includes('cut') ||
        o.name.toLowerCase().includes('fold') ||
        o.name.toLowerCase().includes('pin')
    );
    return cut || list[0];
  }, [masters?.operationTypes, defaultOperationCode]);

  // Form State - Operation is fixed to "Pinning & Cutting & Folding"
  const [operationTypeId, setOperationTypeId] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState(nextSeq);
  const [inputQuantity, setInputQuantity] = useState<number>(Number(batch.currentQuantity) || 1000);

  // Pinning & Cutting inputs
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

  // Auto-assign cutting/folding operation type ID
  useEffect(() => {
    if (preferredOp && !operationTypeId) {
      setOperationTypeId(preferredOp.id);
    } else if (!operationTypeId && masters?.operationTypes?.length) {
      const match =
        masters.operationTypes.find(
          (o) =>
            o.code.toLowerCase().includes('cut') ||
            o.code.toLowerCase().includes('fold') ||
            o.name.toLowerCase().includes('cut') ||
            o.name.toLowerCase().includes('fold')
        ) || masters.operationTypes[0];
      setOperationTypeId(match.id);
    }
  }, [preferredOp, masters?.operationTypes, operationTypeId]);

  // Sync batch balance when batch changes
  useEffect(() => {
    if (batch.currentQuantity) {
      setInputQuantity(Number(batch.currentQuantity));
    }
  }, [batch.currentQuantity]);

  // Yield calculation engine with DIVISION as requested:
  // (Fabric ÷ Pinning) ÷ Folding & Cutting = Output Pieces
  const calculation = useMemo(() => {
    const pinningM = Number(pinningSizeMeters) > 0 ? Number(pinningSizeMeters) : 3;
    const cutsCount = Number(foldingCutsCount) > 0 ? Number(foldingCutsCount) : 3;
    const totalFabricM = Number(inputQuantity) > 0 ? Number(inputQuantity) : 0;

    // Step 1: Pinning Folds = Fabric Input / Pinning Size
    const foldsCount = Math.floor(totalFabricM / pinningM);

    // Step 2: User requested DIVISION by the folding & cutting value:
    // Output Pieces = Folds / Folding & Cutting Value
    const calculatedPieces = cutsCount > 0 ? Math.floor(foldsCount / cutsCount) : 0;

    // Associated fabric consumption and remnant calculation
    const foldsConsumed = calculatedPieces * cutsCount;
    const fabricUsedMeters = Number((foldsConsumed * pinningM).toFixed(2));
    const fabricRemnantMeters = Number(Math.max(0, totalFabricM - fabricUsedMeters).toFixed(2));
    const unusedFolds = Math.max(0, foldsCount - foldsConsumed);

    return {
      pinningM,
      cutsCount,
      totalFabricM,
      foldsCount,
      unusedFolds,
      fabricUsedMeters,
      fabricRemnantMeters,
      calculatedPieces,
    };
  }, [pinningSizeMeters, foldingCutsCount, inputQuantity]);

  // Synchronize calculated values into output and wastage
  useEffect(() => {
    if (calculation.calculatedPieces >= 0) {
      setOutputQuantity(calculation.calculatedPieces);
      setWastageQuantity(calculation.fabricRemnantMeters);
      setUom('pieces');
    }
  }, [calculation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetOpId = operationTypeId || preferredOp?.id || masters?.operationTypes?.[0]?.id;
    if (!targetOpId) {
      toast('Required Configuration', 'No operation type master found in system', 'warning');
      return;
    }
    if (inputQuantity <= 0) {
      toast('Invalid Quantity', 'Fabric input quantity must be greater than 0', 'warning');
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

    const pinningSummary = `[Operation: Pinning & Cutting & Folding | Pinning: ${calculation.pinningM}m | Folds: ${calculation.foldsCount} | Divisor: ${calculation.cutsCount} | Yield: ${calculation.calculatedPieces} pcs | Fabric Used: ${calculation.fabricUsedMeters}m] `;

    try {
      await addMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          operationTypeId: targetOpId,
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

      toast('Success', 'Pinning & Cutting & Folding operation recorded successfully!', 'success');
      onSuccess ? onSuccess() : onClose();
    } catch (err: any) {
      toast('Error', err.message || 'Failed to record processing operation', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pinning & Cutting & Folding Operation"
      description={`Batch ${batch.batchNumber} • Processable Fabric Balance: ${batch.currentQuantity} ${batch.currentUom}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Fixed Operation Header Banner (Replacing dropdown) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-indigo-500/5 border border-indigo-500/25 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  Pinning & Cutting & Folding
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  Standard Operation
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Fabric layering, folding, and division into finished cut pieces.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Sequence Step
            </span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Step #{sequenceNumber}
            </span>
          </div>
        </div>

        {/* Calculation Engine Card */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              Pinning & Cutting Calculation Engine
            </span>
            <span className="text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              (Fabric ÷ Pinning) ÷ Folding & Cutting = Output Pieces
            </span>
          </div>

          {/* Three Clean Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Fabric Input (Meters) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max={Number(batch.currentQuantity)}
                value={inputQuantity}
                onChange={(e) => setInputQuantity(Number(e.target.value))}
                className="h-9 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Max: {batch.currentQuantity}m
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Pinning Size (Meters) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="3"
                value={pinningSizeMeters}
                onChange={(e) =>
                  setPinningSizeMeters(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="h-9 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Meters per fold
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Folding & Cutting <span className="text-rose-500">*</span>
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
                className="h-9 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Divisor value
              </span>
            </div>
          </div>

          {/* Live Step-by-Step Blueprint */}
          <div className="rounded-lg border border-border/80 bg-secondary/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Live Production Yield Calculation
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Batch: {batch.batchNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              {/* Step 1: Pinning Folds */}
              <div className="p-2.5 bg-background rounded-md border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Pinning Folds
                  </span>
                  <span className="text-[11px]">{calculation.pinningM}m / fold</span>
                </div>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                  {calculation.foldsCount} Folds
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {calculation.totalFabricM}m ÷ {calculation.pinningM}m = {calculation.foldsCount} folds
                </p>
              </div>

              {/* Step 2: Cutting & Folding Division Output */}
              <div className="p-2.5 bg-background rounded-md border border-border/60 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Cut Output (Divided)
                  </span>
                  <span className="text-[11px]">÷ {calculation.cutsCount}</span>
                </div>
                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {calculation.calculatedPieces} Pieces
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {calculation.foldsCount} folds ÷ {calculation.cutsCount} = {calculation.calculatedPieces} pieces
                </p>
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/60">
              <div className="p-2 bg-background rounded-md text-center border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Planned Output</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {calculation.calculatedPieces} Pieces
                </span>
              </div>
              <div className="p-2 bg-background rounded-md text-center border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Fabric Consumed</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {calculation.fabricUsedMeters} Meters
                </span>
              </div>
              <div className="p-2 bg-background rounded-md text-center border border-border/50">
                <span className="text-[10px] text-muted-foreground block">Remnant Scrap</span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {calculation.fabricRemnantMeters} Meters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Output & Production Details Section */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Good Output Quantity <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={outputQuantity}
                onChange={(e) => setOutputQuantity(Number(e.target.value))}
                min={0}
                step="any"
                required
                className="h-9 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Operation Wastage
              </label>
              <Input
                type="number"
                value={wastageQuantity}
                onChange={(e) => setWastageQuantity(Number(e.target.value))}
                min={0}
                step="any"
                className="h-9 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Rejected / Defect Qty
              </label>
              <Input
                type="number"
                value={rejectedQuantity}
                onChange={(e) => setRejectedQuantity(Number(e.target.value))}
                min={0}
                step="any"
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Operator / Employee
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="">-- Select Operator (Optional) --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Operation Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={operationDate}
                onChange={(e) => setOperationDate(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Machine / Table ID
              </label>
              <Input
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                placeholder="e.g. Cutting Table 1"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Operator Notes (Optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pinning and fold alignment verified"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} size="sm" className="h-9">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={addMutation.isPending}
            size="sm"
            className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Scissors className="h-4 w-4" />
            <span>Record Pinning & Cutting & Folding</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
