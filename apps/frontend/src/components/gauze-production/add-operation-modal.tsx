'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MasterDropdown } from './master-dropdown';
import { useAddProcessingOperation, useGauzeMasters } from '@/hooks/useGauzeProduction';
import { GauzeProductionBatch } from '@/types/gauze-production.types';
import { Layers, Scissors } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface AddOperationModalProps {
  batch: GauzeProductionBatch;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddOperationModal({ batch, isOpen, onClose, onSuccess }: AddOperationModalProps) {
  const { toast } = useToast();
  const { data: masters } = useGauzeMasters();
  const addMutation = useAddProcessingOperation();

  const operations = batch.operations || [];
  const nextSeq = operations.length + 1;

  const [operationTypeId, setOperationTypeId] = useState(masters?.operationTypes?.[0]?.id || '');
  const [sequenceNumber, setSequenceNumber] = useState(nextSeq);
  const [inputQuantity, setInputQuantity] = useState<number>(Number(batch.currentQuantity) || 1000);
  const [outputQuantity, setOutputQuantity] = useState<number>(Number(batch.currentQuantity) || 1000);
  const [wastageQuantity, setWastageQuantity] = useState<number>(0);
  const [rejectedQuantity, setRejectedQuantity] = useState<number>(0);
  const [uom, setUom] = useState(batch.currentUom || 'meter');
  const [employeeId, setEmployeeId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [operationDate, setOperationDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (batch.currentQuantity) {
      setInputQuantity(Number(batch.currentQuantity));
      setOutputQuantity(Number(batch.currentQuantity));
    }
  }, [batch.currentQuantity]);

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
      toast('Stock Error', `Input quantity (${inputQuantity}) exceeds available batch balance (${batch.currentQuantity})`, 'error');
      return;
    }

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
          uom,
          employeeId: employeeId || undefined,
          machineId: machineId || undefined,
          operationDate,
          notes: notes || undefined,
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
      title="Record Internal Production Operation"
      description={`Batch ${batch.batchNumber} — Current Processable Stock: ${batch.currentQuantity} ${batch.currentUom}`}
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

          <Input
            label="Input Quantity"
            type="number"
            value={inputQuantity}
            onChange={(e) => {
              const val = Number(e.target.value);
              setInputQuantity(val);
              setOutputQuantity(Math.max(0, val - Number(wastageQuantity || 0) - Number(rejectedQuantity || 0)));
            }}
            min={0.01}
            max={Number(batch.currentQuantity)}
            step="any"
            required
            placeholder={`Max Available: ${batch.currentQuantity} ${batch.currentUom}`}
          />

          <Input
            label="Good Output Quantity"
            type="number"
            value={outputQuantity}
            onChange={(e) => setOutputQuantity(Number(e.target.value))}
            min={0}
            step="any"
            required
            placeholder="Processed yield available for next stage"
          />

          <Input
            label="Operation Wastage (Edge trimming/scrap)"
            type="number"
            value={wastageQuantity}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWastageQuantity(val);
              setOutputQuantity(Math.max(0, Number(inputQuantity || 0) - val - Number(rejectedQuantity || 0)));
            }}
            min={0}
            step="any"
          />

          <Input
            label="Rejected Defect Quantity"
            type="number"
            value={rejectedQuantity}
            onChange={(e) => {
              const val = Number(e.target.value);
              setRejectedQuantity(val);
              setOutputQuantity(Math.max(0, Number(inputQuantity || 0) - Number(wastageQuantity || 0) - val));
            }}
            min={0}
            step="any"
          />

          <Input
            label="Unit of Measure"
            value={uom}
            onChange={(e) => setUom(e.target.value)}
            required
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
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={addMutation.isPending} className="gap-1.5 bg-indigo-600 hover:bg-indigo-700">
            <Scissors className="h-4 w-4" />
            Record Processing Operation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
