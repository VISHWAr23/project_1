'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateGamjeeRolling } from '@/hooks/useGamjeeProduction';
import { useEmployees } from '@/hooks/useEmployees';
import { GamjeeProductionBatch } from '@/types/gamjee-production.types';
import { toast } from '@/components/ui/toast';
import { Scroll, Sparkles, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface RollingEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: GamjeeProductionBatch;
}

export function RollingEntryModal({ isOpen, onClose, batch }: RollingEntryModalProps) {
  const { data: employeesData } = useEmployees({ limit: 100 });
  const createRollingMutation = useCreateGamjeeRolling();

  const employees = employeesData?.items || [];

  const fabricInput = batch.materialInputs?.find((m) => m.materialType === 'BLEACHED_FABRIC');
  const cottonInput = batch.materialInputs?.find((m) => m.materialType === 'COTTON_ROLL');

  const operations = batch.operations || [];
  const cuttingOp = operations.find((o) => o.operationType?.code === 'OP-CUT' || o.operationType?.name?.toLowerCase().includes('cut'));
  const lastOp = operations.length > 0 ? operations[operations.length - 1] : null;

  // Prepared fabric available
  const availableFabric = cuttingOp
    ? Number(cuttingOp.outputQuantity)
    : lastOp
    ? Number(lastOp.outputQuantity)
    : Number(batch.currentQuantity || fabricInput?.quantityIssued || 960);

  // Available cotton
  const availableCotton = cottonInput ? Number(cottonInput.quantityRemaining || cottonInput.quantityIssued) : 12;

  // Default dimensions from Gamjee Size
  const defaultRollLen = batch.gamjeeSize ? Number(batch.gamjeeSize.length) : 8;
  const defaultRollWidth = batch.gamjeeSize ? Number(batch.gamjeeSize.width) : 15;

  const [fabricUsed, setFabricUsed] = useState<number | ''>(availableFabric);
  const [cottonUsed, setCottonUsed] = useState<number | ''>(availableCotton);
  const [finishedRollCount, setFinishedRollCount] = useState<number | ''>(
    batch.productionQuantity ? Number(batch.productionQuantity) : defaultRollLen > 0 ? Math.floor(availableFabric / defaultRollLen) : 120
  );
  const [rollLength, setRollLength] = useState<number | ''>(defaultRollLen);
  const [rollWidth, setRollWidth] = useState<number | ''>(defaultRollWidth);
  const [wastageQty, setWastageQty] = useState<number | ''>(0);
  const [rejectedRolls, setRejectedRolls] = useState<number | ''>(0);
  const [employeeId, setEmployeeId] = useState('');
  const [machineId, setMachineId] = useState('Rolling Machine 1');
  const [rollingDate, setRollingDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [markCompleted, setMarkCompleted] = useState(true);

  useEffect(() => {
    setFabricUsed(availableFabric);
    setCottonUsed(availableCotton);
    if (defaultRollLen > 0) {
      setFinishedRollCount(Math.floor(availableFabric / defaultRollLen) || 120);
    }
  }, [availableFabric, availableCotton, defaultRollLen, isOpen]);

  // Total manufactured meters
  const totalLength = Number(finishedRollCount || 0) * Number(rollLength || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fabricUsed || Number(fabricUsed) <= 0 || !cottonUsed || Number(cottonUsed) <= 0) {
      toast.error('Please enter valid fabric and cotton consumed quantities');
      return;
    }
    if (!finishedRollCount || Number(finishedRollCount) <= 0) {
      toast.error('Please enter a valid finished roll count');
      return;
    }

    try {
      await createRollingMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          fabricInputQuantity: Number(fabricUsed),
          fabricInputUom: 'meter',
          cottonInputQuantity: Number(cottonUsed),
          cottonInputUom: 'kg',
          finishedRollQuantity: Number(finishedRollCount),
          finishedRollUom: 'Rolls',
          finishedRollLength: rollLength !== '' ? Number(rollLength) : undefined,
          finishedRollLengthUom: 'm',
          finishedRollWidth: rollWidth !== '' ? Number(rollWidth) : undefined,
          finishedRollWidthUom: 'cm',
          wastageQuantity: Number(wastageQty || 0),
          rejectedRollQuantity: Number(rejectedRolls || 0),
          employeeId: employeeId || undefined,
          machineId: machineId || undefined,
          rollingDate,
          notes: notes || undefined,
          markBatchCompleted: markCompleted,
        },
      });

      toast.success(
        `Rolling completed! ${finishedRollCount} Finished Gamjee Rolls added to inventory stock.`
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete rolling');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Combine & Roll - Gamjee Finished Goods Production"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs flex items-center justify-between">
          <div>
            <span className="font-semibold">Batch:</span> {batch.batchNumber}
          </div>
          <div>
            <span className="font-semibold">Product:</span> {batch.finishedProduct?.name || 'Gamjee Roll'}
          </div>
          <div>
            <span className="font-semibold">Size:</span> {batch.gamjeeSize?.name || `${rollWidth}cm x ${rollLength}m`}
          </div>
        </div>

        {/* Material Inputs Consumption */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border/80 rounded-xl p-3.5 bg-blue-500/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
              <span>Prepared Fabric Consumption</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Fabric Consumed (Meters) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                value={fabricUsed}
                onChange={(e) => setFabricUsed(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                Available Prepared Fabric: <strong className="text-foreground">{availableFabric}</strong> m
              </p>
            </div>
          </div>

          <div className="border border-border/80 rounded-xl p-3.5 bg-amber-500/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Cotton Roll Consumption</span>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-foreground mb-1">
                Cotton Consumed (Kg) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                value={cottonUsed}
                onChange={(e) => setCottonUsed(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                Available Cotton: <strong className="text-foreground">{availableCotton}</strong> kg
              </p>
            </div>
          </div>
        </div>

        {/* Finished Goods Output */}
        <div className="border border-border rounded-xl p-4 bg-card space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
              <Scroll className="h-4 w-4 text-purple-500" />
              <span>Finished Gamjee Rolls Output</span>
            </div>
            {totalLength > 0 && (
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Total Length: {totalLength.toLocaleString()} Meters
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Finished Rolls Count <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="120"
                value={finishedRollCount}
                onChange={(e) => setFinishedRollCount(e.target.value === '' ? '' : Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Single Roll Length (m)</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={rollLength}
                onChange={(e) => setRollLength(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Single Roll Width (cm)</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={rollWidth}
                onChange={(e) => setRollWidth(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Rejected Rolls Count</label>
              <Input
                type="number"
                min="0"
                value={rejectedRolls}
                onChange={(e) => setRejectedRolls(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Machine, Operator, Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Operator</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="">Select Operator</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Machine / Rolling Line</label>
            <Input value={machineId} onChange={(e) => setMachineId(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Rolling Date</label>
            <Input type="date" value={rollingDate} onChange={(e) => setRollingDate(e.target.value)} required />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="markCompleted"
            checked={markCompleted}
            onChange={(e) => setMarkCompleted(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
          />
          <label htmlFor="markCompleted" className="text-xs text-foreground cursor-pointer select-none">
            Mark Gamjee Production Batch as <strong>COMPLETED</strong> and move finished rolls into stock warehouse
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={createRollingMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createRollingMutation.isPending}>
            {createRollingMutation.isPending ? 'Completing Rolling...' : 'Confirm & Complete Gamjee Rolls'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
