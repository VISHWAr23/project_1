'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAddGamjeeOperation, useGamjeeMasters } from '@/hooks/useGamjeeProduction';
import { useEmployees } from '@/hooks/useEmployees';
import { GamjeeProductionBatch } from '@/types/gamjee-production.types';
import { toast } from '@/components/ui/toast';
import { Scissors, Layers, Pin, AlertCircle, Sparkles } from 'lucide-react';

interface FabricOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: GamjeeProductionBatch;
  defaultOperationCode?: string;
}

export function FabricOperationModal({
  isOpen,
  onClose,
  batch,
  defaultOperationCode,
}: FabricOperationModalProps) {
  const { data: masters } = useGamjeeMasters();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const addOpMutation = useAddGamjeeOperation();

  const operations = masters?.operations || [];
  const employees = employeesData?.items || [];

  const fabricInput = batch.materialInputs?.find((m) => m.materialType === 'BLEACHED_FABRIC');
  const pastOps = batch.operations || [];

  const fabricInputQty = Number(fabricInput?.quantityIssued || batch.plannedFabricMeters || batch.currentQuantity || 100);
  const plannedOutputPieces = Number(batch.productionQuantity || 150);

  // Find or default to preparation/cutting operation
  const prepOp =
    operations.find((o) => o.code === 'OP-FABPREP' || o.code === 'OP-CUT' || o.name.toLowerCase().includes('cut') || o.name.toLowerCase().includes('prep')) ||
    operations[0];

  const [operationTypeId, setOperationTypeId] = useState(prepOp?.id || '');
  const [outputPieces, setOutputPieces] = useState<number | ''>(plannedOutputPieces);
  const [wastageQty, setWastageQty] = useState<number | ''>(0);
  const [employeeId, setEmployeeId] = useState('');
  const [machineId, setMachineId] = useState('Pinning & Cutting Table 1');
  const [operationDate, setOperationDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (prepOp && !operationTypeId) {
      setOperationTypeId(prepOp.id);
    }
  }, [prepOp, operationTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const opId = operationTypeId || prepOp?.id;
    if (!opId) {
      toast.error('No valid processing operation type found');
      return;
    }

    try {
      await addOpMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          operationTypeId: opId,
          sequenceNumber: 1,
          inputQuantity: fabricInputQty,
          inputUom: 'meter',
          outputQuantity: Number(outputPieces || plannedOutputPieces),
          outputUom: 'pieces',
          wastageQuantity: Number(wastageQty || 0),
          rejectedQuantity: 0,
          employeeId: employeeId || undefined,
          machineId: machineId || undefined,
          operationDate,
        },
      });

      toast.success('Fabric preparation completed! Ready for Rolling.');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record fabric preparation');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Fabric Preparation (Pinning, Folding & Cutting)"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Live Calculation Blueprint Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" /> Unified Fabric Preparation Blueprint
            </span>
            <span className="font-mono text-muted-foreground">Batch: {batch.batchNumber}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-500/20 text-center font-mono text-xs">
            <div className="p-1.5 bg-card/60 rounded">
              <span className="text-[10px] text-muted-foreground block font-sans">Input Fabric</span>
              <strong className="text-foreground">{fabricInputQty} m</strong>
            </div>
            <div className="p-1.5 bg-card/60 rounded">
              <span className="text-[10px] text-muted-foreground block font-sans">Pinning / Folds</span>
              <strong className="text-foreground">{batch.pinningSizeMeters || 3}m ({batch.foldingCutsCount || 3} cuts)</strong>
            </div>
            <div className="p-1.5 bg-card/60 rounded">
              <span className="text-[10px] text-muted-foreground block font-sans">Expected Output</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{plannedOutputPieces} Pieces</strong>
            </div>
          </div>
        </div>

        {/* Quantities Panel with Automated Calculation */}
        <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/60 rounded-xl p-3.5">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Fabric Quantity Processed
            </label>
            <div className="h-9 px-3 flex items-center rounded-md border border-input bg-secondary/40 font-mono text-xs font-bold text-foreground">
              {fabricInputQty} Meters
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Fixed from Issued Fabric</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Output Pieces Prepared <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              value={outputPieces}
              onChange={(e) => setOutputPieces(e.target.value === '' ? '' : Number(e.target.value))}
              required
              className="font-mono font-bold text-emerald-600 dark:text-emerald-400"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">Pieces ready for rolling</p>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-foreground mb-1">
              Fabric Trimming Loss / Wastage (Meters)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={wastageQty}
              onChange={(e) => setWastageQty(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="font-mono"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">Defective edge trims discarded (if any)</p>
          </div>
        </div>

        {/* Operator & Machine */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Assigned Operator</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="">Select Employee / Operator</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Station / Pinning Table</label>
            <Input
              placeholder="e.g. Pinning & Cutting Table 1"
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Operation Date</label>
          <Input type="date" value={operationDate} onChange={(e) => setOperationDate(e.target.value)} required />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={addOpMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={addOpMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            {addOpMutation.isPending ? 'Completing Preparation...' : 'Confirm & Complete Fabric Preparation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
