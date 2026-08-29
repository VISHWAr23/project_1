'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { useManageGauzeMasters } from '@/hooks/useGauzeProduction';
import { useToast } from '@/components/ui/toast';

interface MasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'gauzeType' | 'gauzeSize' | 'bleachingType' | 'operationType';
  initialData?: any;
  onSuccess?: (savedItem: any) => void;
}

export function MasterModal({ isOpen, onClose, type, initialData, onSuccess }: MasterModalProps) {
  const { toast } = useToast();
  const {
    createType,
    updateType,
    deleteType,
    createSize,
    updateSize,
    deleteSize,
    createBleaching,
    updateBleaching,
    deleteBleaching,
    createOperation,
    updateOperation,
    deleteOperation,
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
      let result: any = null;
      if (type === 'gauzeType') {
        if (isEdit) result = await updateType.mutateAsync({ id: initialData.id, payload: { name, code, description } });
        else result = await createType.mutateAsync({ name, code, description, active: true });
      } else if (type === 'gauzeSize') {
        if (isEdit)
          result = await updateSize.mutateAsync({
            id: initialData.id,
            payload: { name: name || `${width} ${widthUom} x ${length} ${lengthUom}`, width, widthUom, length, lengthUom, description },
          });
        else
          result = await createSize.mutateAsync({
            name: name || `${width} ${widthUom} x ${length} ${lengthUom}`,
            width,
            widthUom,
            length,
            lengthUom,
            description,
            active: true,
          });
      } else if (type === 'bleachingType') {
        if (isEdit) result = await updateBleaching.mutateAsync({ id: initialData.id, payload: { name, code, description } });
        else result = await createBleaching.mutateAsync({ name, code, description, active: true });
      } else if (type === 'operationType') {
        if (isEdit) result = await updateOperation.mutateAsync({ id: initialData.id, payload: { name, code, sequence, description } });
        else result = await createOperation.mutateAsync({ name, code, sequence, description, active: true });
      }

      toast('Saved', `${getTitle()} saved successfully!`, 'success');
      if (onSuccess) onSuccess(result);
      onClose();
    } catch (err: any) {
      toast('Error', err?.message || 'Failed to save master record', 'error');
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name || initialData?.name || 'this item'}"?`);
    if (!confirmDelete) return;

    try {
      if (type === 'gauzeType') await deleteType.mutateAsync(initialData.id);
      else if (type === 'gauzeSize') await deleteSize.mutateAsync(initialData.id);
      else if (type === 'bleachingType') await deleteBleaching.mutateAsync(initialData.id);
      else if (type === 'operationType') await deleteOperation.mutateAsync(initialData.id);

      toast('Deleted', 'Record removed successfully', 'success');
      if (onSuccess) onSuccess({ id: initialData.id, deleted: true });
      onClose();
    } catch (err: any) {
      toast('Error', err?.message || 'Failed to delete record', 'error');
    }
  };

  const isPending =
    createType.isPending ||
    updateType.isPending ||
    deleteType.isPending ||
    createSize.isPending ||
    updateSize.isPending ||
    deleteSize.isPending ||
    createBleaching.isPending ||
    updateBleaching.isPending ||
    deleteBleaching.isPending ||
    createOperation.isPending ||
    updateOperation.isPending ||
    deleteOperation.isPending;

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

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Record
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button type="button" onClick={() => handleSubmit()} isLoading={isPending} size="sm" className="bg-blue-600 hover:bg-blue-700">
              Save Master Record
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
