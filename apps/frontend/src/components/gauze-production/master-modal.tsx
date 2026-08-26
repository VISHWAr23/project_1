'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useManageGauzeMasters } from '@/hooks/useGauzeProduction';
import { useToast } from '@/components/ui/toast';

interface MasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'gauzeType' | 'gauzeSize' | 'bleachingType' | 'operationType';
  initialData?: any;
}

export function MasterModal({ isOpen, onClose, type, initialData }: MasterModalProps) {
  const { toast } = useToast();
  const {
    createType,
    updateType,
    createSize,
    updateSize,
    createBleaching,
    updateBleaching,
    createOperation,
    updateOperation,
  } = useManageGauzeMasters();

  const isEdit = Boolean(initialData?.id);

  // Common state
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Size specific
  const [width, setWidth] = useState<number>(initialData?.width ? Number(initialData.width) : 120);
  const [widthUom, setWidthUom] = useState(initialData?.widthUom || 'cm');
  const [length, setLength] = useState<number>(initialData?.length ? Number(initialData.length) : 20);
  const [lengthUom, setLengthUom] = useState(initialData?.lengthUom || 'm');

  // Operation specific
  const [sequence, setSequence] = useState<number>(initialData?.sequence || 1);

  const getTitle = () => {
    const action = isEdit ? 'Edit' : 'Add New';
    switch (type) {
      case 'gauzeType':
        return `${action} Gauze Type Specification`;
      case 'gauzeSize':
        return `${action} Gauze Size Dimensions`;
      case 'bleachingType':
        return `${action} Bleaching Process Type`;
      case 'operationType':
        return `${action} Internal Operation Type`;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (type !== 'gauzeSize' && !name) {
      toast('Required', 'Please enter a name', 'warning');
      return;
    }
    if (type !== 'gauzeSize' && !code) {
      toast('Required', 'Please enter a code', 'warning');
      return;
    }
    try {
      if (type === 'gauzeType') {
        if (isEdit) await updateType.mutateAsync({ id: initialData.id, payload: { name, code, description } });
        else await createType.mutateAsync({ name, code, description, active: true });
      } else if (type === 'gauzeSize') {
        if (isEdit)
          await updateSize.mutateAsync({
            id: initialData.id,
            payload: { name: name || `${width} ${widthUom} x ${length} ${lengthUom}`, width, widthUom, length, lengthUom, description },
          });
        else
          await createSize.mutateAsync({
            name: name || `${width} ${widthUom} x ${length} ${lengthUom}`,
            width,
            widthUom,
            length,
            lengthUom,
            description,
            active: true,
          });
      } else if (type === 'bleachingType') {
        if (isEdit) await updateBleaching.mutateAsync({ id: initialData.id, payload: { name, code, description } });
        else await createBleaching.mutateAsync({ name, code, description, active: true });
      } else if (type === 'operationType') {
        if (isEdit) await updateOperation.mutateAsync({ id: initialData.id, payload: { name, code, sequence, description } });
        else await createOperation.mutateAsync({ name, code, sequence, description, active: true });
      }

      toast('Saved', `${getTitle()} saved successfully!`, 'success');
      onClose();
    } catch (err: any) {
      toast('Error', err.message || 'Failed to save master record', 'error');
    }
  };

  const isPending =
    createType.isPending ||
    updateType.isPending ||
    createSize.isPending ||
    updateSize.isPending ||
    createBleaching.isPending ||
    updateBleaching.isPending ||
    createOperation.isPending ||
    updateOperation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <div className="space-y-4">
        {type !== 'gauzeSize' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BP17 or Hydrogen Peroxide"
              required
            />
            <Input
              label="Unique Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. GZ-BP17 or BLEACH-H2O2"
              required
            />
          </div>
        )}

        {type === 'gauzeSize' && (
          <>
            <Input
              label="Size Name (Optional label)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 120 cm x 20 m (Standard Than Roll)"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Width Dimension"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={0.1}
                step="any"
                required
              />
              <Input
                label="Width Unit"
                value={widthUom}
                onChange={(e) => setWidthUom(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Length Dimension"
                type="number"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                min={0.1}
                step="any"
                required
              />
              <Input
                label="Length Unit"
                value={lengthUom}
                onChange={(e) => setLengthUom(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {type === 'operationType' && (
          <Input
            label="Sequence Step Order"
            type="number"
            value={sequence}
            onChange={(e) => setSequence(Number(e.target.value))}
            min={1}
            required
            placeholder="Order in which this operation is performed"
          />
        )}

        <Input
          label="Description / Specifications"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description, standards or chemical ratios"
        />

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => handleSubmit()} isLoading={isPending}>
            Save Master Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}
