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

  // Determine latest output quantity as next input quantity
  const lastOp = pastOps.length > 0 ? pastOps[pastOps.length - 1] : null;
  const autoInputQty = lastOp ? Number(lastOp.outputQuantity) : Number(fabricInput?.quantityIssued || batch.currentQuantity || 1000);

  const [operationTypeId, setOperationTypeId] = useState('');
  const [inputQty, setInputQty] = useState<number | ''>(autoInputQty);
  const [outputQty, setOutputQty] = useState<number | ''>(autoInputQty);
  const [wastageQty, setWastageQty] = useState<number | ''>(0);
  const [rejectedQty, setRejectedQty] = useState<number | ''>(0);
  const [employeeId, setEmployeeId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [operationDate, setOperationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Auto-detect next operation
  useEffect(() => {
    if (operations.length === 0) return;

    if (defaultOperationCode) {
      const match = operations.find((o) => o.code === defaultOperationCode);
      if (match) {
        setOperationTypeId(match.id);
        return;
      }
    }

    const hasPinning = pastOps.some((o) => o.operationType?.code === 'OP-PIN' || o.operationType?.name?.toLowerCase().includes('pin'));
    const hasFolding = pastOps.some((o) => o.operationType?.code === 'OP-FOLD' || o.operationType?.name?.toLowerCase().includes('fold'));
    const hasCutting = pastOps.some((o) => o.operationType?.code === 'OP-CUT' || o.operationType?.name?.toLowerCase().includes('cut'));

    if (!hasPinning) {
      const pinOp = operations.find((o) => o.code === 'OP-PIN' || o.name.toLowerCase().includes('pin'));
      if (pinOp) setOperationTypeId(pinOp.id);
    } else if (!hasFolding) {
      const foldOp = operations.find((o) => o.code === 'OP-FOLD' || o.name.toLowerCase().includes('fold'));
      if (foldOp) setOperationTypeId(foldOp.id);
    } else if (!hasCutting) {
      const cutOp = operations.find((o) => o.code === 'OP-CUT' || o.name.toLowerCase().includes('cut'));
      if (cutOp) setOperationTypeId(cutOp.id);
    } else {
      setOperationTypeId(operations[0].id);
    }
  }, [operations, pastOps, defaultOperationCode]);

  useEffect(() => {
    setInputQty(autoInputQty);
    setOutputQty(autoInputQty);
    setWastageQty(0);
    setRejectedQty(0);
  }, [autoInputQty, isOpen]);

  // Live wastage calculation: when output changes, auto calculate wastage
  const handleOutputChange = (val: number | '') => {
    setOutputQty(val);
    if (val !== '' && inputQty !== '') {
      const remaining = Number(inputQty) - Number(val) - Number(rejectedQty || 0);
      setWastageQty(remaining >= 0 ? remaining : 0);
    }
  };

  const handleWastageChange = (val: number | '') => {
    setWastageQty(val);
    if (val !== '' && inputQty !== '') {
      const remaining = Number(inputQty) - Number(val) - Number(rejectedQty || 0);
      setOutputQty(remaining >= 0 ? remaining : 0);
    }
  };

  const selectedOp = operations.find((o) => o.id === operationTypeId);

  const getOpIcon = (code?: string) => {
    if (code === 'OP-PIN') return Pin;
    if (code === 'OP-FOLD') return Layers;
    return Scissors;
  };

  const OpIcon = getOpIcon(selectedOp?.code);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationTypeId) {
      toast.error('Please select an operation type');
      return;
    }
    if (inputQty === '' || Number(inputQty) < 0 || outputQty === '' || Number(outputQty) < 0) {
      toast.error('Please enter valid input and output quantities');
      return;
    }

    try {
      await addOpMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          operationTypeId,
          sequenceNumber: pastOps.length + 1,
          inputQuantity: Number(inputQty),
          inputUom: 'meter',
          outputQuantity: Number(outputQty),
          outputUom: 'meter',
          wastageQuantity: Number(wastageQty || 0),
          rejectedQuantity: Number(rejectedQty || 0),
          employeeId: employeeId || undefined,
          machineId: machineId || undefined,
          operationDate,
          notes: notes || undefined,
        },
      });

      toast.success(`${selectedOp?.name || 'Operation'} recorded successfully!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record operation');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Fabric Processing Operation (${selectedOp?.name || 'Processing'})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs flex items-center justify-between">
          <div>
            <span className="font-semibold">Batch:</span> {batch.batchNumber}
          </div>
          <div>
            <span className="font-semibold">Current Stage:</span> {batch.currentStage}
          </div>
          <div>
            <span className="font-semibold">Available Fabric:</span> {autoInputQty} m
          </div>
        </div>

        {/* Operation Selection */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Processing Operation <span className="text-rose-500">*</span>
          </label>
          <select
            value={operationTypeId}
            onChange={(e) => setOperationTypeId(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
            required
          >
            {operations.map((op) => (
              <option key={op.id} value={op.id}>
                Step {op.sequence}: {op.name} ({op.code})
              </option>
            ))}
          </select>
          {selectedOp?.description && (
            <p className="text-[11px] text-muted-foreground mt-1">{selectedOp.description}</p>
          )}
        </div>

        {/* Quantities Panel with Automated Calculation */}
        <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/60 rounded-xl p-3.5">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Input Quantity (Meters) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={inputQty}
              onChange={(e) => setInputQty(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">From previous stage</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Output Quantity (Meters) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={outputQty}
              onChange={(e) => handleOutputChange(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Good processed fabric</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Wastage Quantity (Meters)
            </label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={wastageQty}
              onChange={(e) => handleWastageChange(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Auto-calculated loss</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Rejected Quantity (Meters)
            </label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={rejectedQty}
              onChange={(e) => setRejectedQty(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Defects removed</p>
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
            <label className="block text-xs font-medium text-foreground mb-1">Machine / Station</label>
            <Input
              placeholder="e.g. Pinning Table 1"
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
            />
          </div>
        </div>

        {/* Date & Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Operation Date</label>
            <Input type="date" value={operationDate} onChange={(e) => setOperationDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Notes</label>
            <Input
              placeholder="e.g. Clean cut, 0 defect edges"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={addOpMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={addOpMutation.isPending}>
            {addOpMutation.isPending ? 'Recording...' : `Record ${selectedOp?.name || 'Operation'} & Proceed`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
