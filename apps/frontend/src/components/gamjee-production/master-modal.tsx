'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCreateGamjeeSize,
  useUpdateGamjeeSize,
  useCreateGamjeeOperation,
  useUpdateGamjeeOperation,
  useCreateGamjeeProductMaster,
  useUpdateGamjeeProductMaster,
} from '@/hooks/useGamjeeProduction';
import { toast } from '@/components/ui/toast';

interface MasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'size' | 'operation' | 'product';
  initialData?: any;
}

export function MasterModal({ isOpen, onClose, type, initialData }: MasterModalProps) {
  const createSize = useCreateGamjeeSize();
  const updateSize = useUpdateGamjeeSize();
  const createOp = useCreateGamjeeOperation();
  const updateOp = useUpdateGamjeeOperation();
  const createProd = useCreateGamjeeProductMaster();
  const updateProd = useUpdateGamjeeProductMaster();

  const isEdit = Boolean(initialData?.id);

  // Size State
  const [sizeName, setSizeName] = useState('');
  const [width, setWidth] = useState<number | ''>(15);
  const [widthUom, setWidthUom] = useState('cm');
  const [length, setLength] = useState<number | ''>(8);
  const [lengthUom, setLengthUom] = useState('m');
  const [sizeDesc, setSizeDesc] = useState('');

  // Operation State
  const [opName, setOpName] = useState('');
  const [opCode, setOpCode] = useState('');
  const [opSeq, setOpSeq] = useState<number | ''>(1);
  const [opDesc, setOpDesc] = useState('');

  // Product Master State
  const [productName, setProductName] = useState('');
  const [gamjeeType, setGamjeeType] = useState('');
  const [cottonReq, setCottonReq] = useState<number | ''>(0.1);
  const [fabricReq, setFabricReq] = useState<number | ''>(8.0);

  useEffect(() => {
    if (initialData) {
      if (type === 'size') {
        setSizeName(initialData.name || '');
        setWidth(initialData.width ?? 15);
        setWidthUom(initialData.widthUom || 'cm');
        setLength(initialData.length ?? 8);
        setLengthUom(initialData.lengthUom || 'm');
        setSizeDesc(initialData.description || '');
      } else if (type === 'operation') {
        setOpName(initialData.name || '');
        setOpCode(initialData.code || '');
        setOpSeq(initialData.sequence ?? 1);
        setOpDesc(initialData.description || '');
      } else if (type === 'product') {
        setProductName(initialData.productName || '');
        setGamjeeType(initialData.gamjeeType || '');
        setCottonReq(initialData.cottonRequirement ?? 0.1);
        setFabricReq(initialData.fabricRequirement ?? 8.0);
      }
    } else {
      if (type === 'size') {
        setSizeName('');
        setWidth(15);
        setWidthUom('cm');
        setLength(8);
        setLengthUom('m');
        setSizeDesc('');
      } else if (type === 'operation') {
        setOpName('');
        setOpCode('');
        setOpSeq(1);
        setOpDesc('');
      } else if (type === 'product') {
        setProductName('');
        setGamjeeType('');
        setCottonReq(0.1);
        setFabricReq(8.0);
      }
    }
  }, [initialData, type, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === 'size') {
        if (!sizeName || !width || !length) {
          toast.error('Please enter name, width, and length');
          return;
        }
        if (isEdit) {
          await updateSize.mutateAsync({
            id: initialData.id,
            payload: {
              name: sizeName,
              width: Number(width),
              widthUom,
              length: Number(length),
              lengthUom,
              description: sizeDesc || undefined,
            },
          });
          toast.success('Gamjee Size updated successfully!');
        } else {
          await createSize.mutateAsync({
            name: sizeName,
            width: Number(width),
            widthUom,
            length: Number(length),
            lengthUom,
            description: sizeDesc || undefined,
            active: true,
          });
          toast.success('Gamjee Size created successfully!');
        }
      } else if (type === 'operation') {
        if (!opName || !opCode) {
          toast.error('Please enter operation name and code');
          return;
        }
        if (isEdit) {
          await updateOp.mutateAsync({
            id: initialData.id,
            payload: {
              name: opName,
              code: opCode,
              sequence: Number(opSeq || 1),
              description: opDesc || undefined,
            },
          });
          toast.success('Gamjee Operation updated successfully!');
        } else {
          await createOp.mutateAsync({
            name: opName,
            code: opCode,
            sequence: Number(opSeq || 1),
            description: opDesc || undefined,
            active: true,
          });
          toast.success('Gamjee Operation created successfully!');
        }
      } else if (type === 'product') {
        if (!productName) {
          toast.error('Please enter product name');
          return;
        }
        if (isEdit) {
          await updateProd.mutateAsync({
            id: initialData.id,
            payload: {
              productName,
              gamjeeType: gamjeeType || undefined,
              width: width ? Number(width) : undefined,
              widthUom,
              rollLength: length ? Number(length) : undefined,
              lengthUom,
              cottonRequirement: cottonReq ? Number(cottonReq) : undefined,
              cottonUom: 'kg',
              fabricRequirement: fabricReq ? Number(fabricReq) : undefined,
              fabricUom: 'm',
            },
          });
          toast.success('Gamjee Product Master updated successfully!');
        } else {
          await createProd.mutateAsync({
            productName,
            gamjeeType: gamjeeType || undefined,
            width: width ? Number(width) : undefined,
            widthUom,
            rollLength: length ? Number(length) : undefined,
            lengthUom,
            cottonRequirement: cottonReq ? Number(cottonReq) : undefined,
            cottonUom: 'kg',
            fabricRequirement: fabricReq ? Number(fabricReq) : undefined,
            fabricUom: 'm',
            active: true,
          });
          toast.success('Gamjee Product Master created successfully!');
        }
      }

      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save master record');
    }
  };

  const titles = {
    size: isEdit ? 'Edit Gamjee Roll Size' : 'Create New Gamjee Roll Size',
    operation: isEdit ? 'Edit Production Operation' : 'Create New Production Operation',
    product: isEdit ? 'Edit Gamjee Product Configuration' : 'Create Gamjee Product Configuration',
  };

  const isSaving =
    createSize.isPending ||
    updateSize.isPending ||
    createOp.isPending ||
    updateOp.isPending ||
    createProd.isPending ||
    updateProd.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titles[type]} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'size' && (
          <>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Size Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. 15 cm x 8 m"
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Width (cm)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Length (m)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={length}
                  onChange={(e) => setLength(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Description</label>
              <Input
                placeholder="e.g. Standard absorbent dressing"
                value={sizeDesc}
                onChange={(e) => setSizeDesc(e.target.value)}
              />
            </div>
          </>
        )}

        {type === 'operation' && (
          <>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Operation Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Ultrasonic Edge Sealing"
                value={opName}
                onChange={(e) => setOpName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. OP-SEAL"
                  value={opCode}
                  onChange={(e) => setOpCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Sequence Number</label>
                <Input
                  type="number"
                  min="1"
                  value={opSeq}
                  onChange={(e) => setOpSeq(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Description</label>
              <Input
                placeholder="e.g. Specialized sealing operation"
                value={opDesc}
                onChange={(e) => setOpDesc(e.target.value)}
              />
            </div>
          </>
        )}

        {type === 'product' && (
          <>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Cotton Gamjee Roll (15cm x 8m)"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Gamjee Type</label>
              <Input
                placeholder="e.g. Heavy Exudate / Orthopaedic"
                value={gamjeeType}
                onChange={(e) => setGamjeeType(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Cotton Req (kg/roll)</label>
                <Input
                  type="number"
                  step="0.001"
                  value={cottonReq}
                  onChange={(e) => setCottonReq(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Fabric Req (m/roll)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={fabricReq}
                  onChange={(e) => setFabricReq(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEdit ? 'Update Master Record' : 'Save Master Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
