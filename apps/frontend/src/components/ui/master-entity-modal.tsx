'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  useCreateStorageLocation,
  useUpdateStorageLocation,
  useDeleteStorageLocation,
} from '@/hooks/useRawMaterials';
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useCreateDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
} from '@/hooks/useEmployees';
import {
  useCreateJobWorkCompany,
  useUpdateJobWorkCompany,
  useDeleteJobWorkCompany,
} from '@/hooks/useJobWork';
import { useManageGauzeMasters } from '@/hooks/useGauzeProduction';
import { Trash2 } from 'lucide-react';

export type MasterEntityType =
  | 'category'
  | 'supplier'
  | 'location'
  | 'jobWorkCompany'
  | 'department'
  | 'designation'
  | 'gauzeType'
  | 'gauzeSize'
  | 'bleachingType'
  | 'operationType';

export interface MasterEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: MasterEntityType;
  initialData?: any;
  onSuccess?: (createdOrUpdatedItem: any) => void;
}

export function MasterEntityModal({
  isOpen,
  onClose,
  entityType,
  initialData,
  onSuccess,
}: MasterEntityModalProps) {
  const { toast } = useToast();
  const isEdit = Boolean(initialData?.id);

  // Common Form States
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  // Supplier & Company Specific States
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditDays, setCreditDays] = useState(30);

  // Location Specific State
  const [locationType, setLocationType] = useState('WAREHOUSE');

  // Gauze Size Specific States
  const [width, setWidth] = useState<number>(100);
  const [widthUom, setWidthUom] = useState('cm');
  const [length, setLength] = useState<number>(100);
  const [lengthUom, setLengthUom] = useState('m');

  // Operation Type Specific State
  const [sequence, setSequence] = useState<number>(1);

  // Raw Material Category / Supplier / Location Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const createLocation = useCreateStorageLocation();
  const updateLocation = useUpdateStorageLocation();
  const deleteLocation = useDeleteStorageLocation();

  // Employee Department & Designation Mutations
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const createDesignation = useCreateDesignation();
  const updateDesignation = useUpdateDesignation();
  const deleteDesignation = useDeleteDesignation();

  // Job Work Company Mutations
  const createCompany = useCreateJobWorkCompany();
  const updateCompany = useUpdateJobWorkCompany();
  const deleteCompany = useDeleteJobWorkCompany();

  // Gauze Masters Mutations
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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || initialData.companyName || '');
      setCode(initialData.code || '');
      setDescription(initialData.description || '');
      setContactPerson(initialData.contactPerson || '');
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setGstin(initialData.gstin || '');
      setCreditDays(initialData.creditDays || 30);
      setLocationType(initialData.type || 'WAREHOUSE');
      setWidth(initialData.width || 100);
      setWidthUom(initialData.widthUom || 'cm');
      setLength(initialData.length || 100);
      setLengthUom(initialData.lengthUom || 'm');
      setSequence(initialData.sequence || 1);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setGstin('');
      setCreditDays(30);
      setLocationType('WAREHOUSE');
      setWidth(100);
      setWidthUom('cm');
      setLength(100);
      setLengthUom('m');
      setSequence(1);
    }
  }, [initialData, isOpen]);

  const getEntityTitle = () => {
    const titles: Record<MasterEntityType, string> = {
      category: 'Raw Material Category',
      supplier: 'Raw Material Supplier',
      location: 'Storage Location',
      jobWorkCompany: 'Job Work Vendor / Mill',
      department: 'Department',
      designation: 'Designation',
      gauzeType: 'Gauze Weave Specification',
      gauzeSize: 'Gauze Dimensions / Size',
      bleachingType: 'Bleaching Process Type',
      operationType: 'Production Operation Step',
    };
    const prefix = isEdit ? 'Edit' : 'Add New';
    return `${prefix} ${titles[entityType] || 'Master Record'}`;
  };

  const handleSave = async () => {
    if (entityType !== 'gauzeSize' && !name.trim()) {
      toast('Required', 'Please enter a valid name/title', 'warning');
      return;
    }

    try {
      let result: any = null;

      switch (entityType) {
        case 'category':
          if (isEdit) {
            result = await updateCategory.mutateAsync({ id: initialData.id, name, description });
          } else {
            result = await createCategory.mutateAsync({ name, description });
          }
          break;

        case 'supplier':
          const supplierPayload = {
            name,
            code: code || name.substring(0, 6).toUpperCase().replace(/\s+/g, ''),
            contactPerson,
            phone,
            email,
            address,
            gstin,
          };
          if (isEdit) {
            result = await updateSupplier.mutateAsync({ id: initialData.id, payload: supplierPayload });
          } else {
            result = await createSupplier.mutateAsync(supplierPayload);
          }
          break;

        case 'location':
          const locationPayload = {
            name,
            code: code || name.substring(0, 6).toUpperCase().replace(/\s+/g, ''),
            type: locationType,
            description,
          };
          if (isEdit) {
            result = await updateLocation.mutateAsync({ id: initialData.id, payload: locationPayload });
          } else {
            result = await createLocation.mutateAsync(locationPayload);
          }
          break;

        case 'jobWorkCompany':
          const companyPayload = {
            companyName: name,
            contactPerson,
            phone,
            email,
            address,
            gstin,
            creditDays: Number(creditDays) || 30,
          };
          if (isEdit) {
            result = await updateCompany.mutateAsync({ id: initialData.id, payload: companyPayload });
          } else {
            result = await createCompany.mutateAsync(companyPayload);
          }
          break;

        case 'department':
          if (isEdit) {
            result = await updateDepartment.mutateAsync({
              id: initialData.id,
              payload: { name, code: code || undefined, description },
            });
          } else {
            result = await createDepartment.mutateAsync({
              name,
              code: code || name.substring(0, 6).toUpperCase().replace(/\s+/g, ''),
              description,
            });
          }
          break;

        case 'designation':
          if (isEdit) {
            result = await updateDesignation.mutateAsync({
              id: initialData.id,
              payload: { name, code: code || undefined, description },
            });
          } else {
            result = await createDesignation.mutateAsync({
              name,
              code: code || name.substring(0, 6).toUpperCase().replace(/\s+/g, ''),
              description,
            });
          }
          break;

        case 'gauzeType':
          if (isEdit) {
            result = await updateType.mutateAsync({ id: initialData.id, payload: { name, code, description } });
          } else {
            result = await createType.mutateAsync({ name, code, description, active: true });
          }
          break;

        case 'gauzeSize':
          const sizeName = name || `${width} ${widthUom} x ${length} ${lengthUom}`;
          if (isEdit) {
            result = await updateSize.mutateAsync({
              id: initialData.id,
              payload: { name: sizeName, width, widthUom, length, lengthUom, description },
            });
          } else {
            result = await createSize.mutateAsync({
              name: sizeName,
              width,
              widthUom,
              length,
              lengthUom,
              description,
              active: true,
            });
          }
          break;

        case 'bleachingType':
          if (isEdit) {
            result = await updateBleaching.mutateAsync({ id: initialData.id, payload: { name, code, description } });
          } else {
            result = await createBleaching.mutateAsync({ name, code, description, active: true });
          }
          break;

        case 'operationType':
          if (isEdit) {
            result = await updateOperation.mutateAsync({
              id: initialData.id,
              payload: { name, code, sequence, description },
            });
          } else {
            result = await createOperation.mutateAsync({ name, code, sequence, description, active: true });
          }
          break;
      }

      toast('Success', `${getEntityTitle()} saved successfully!`, 'success');
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
      switch (entityType) {
        case 'category':
          await deleteCategory.mutateAsync(initialData.id);
          break;
        case 'supplier':
          await deleteSupplier.mutateAsync(initialData.id);
          break;
        case 'location':
          await deleteLocation.mutateAsync(initialData.id);
          break;
        case 'jobWorkCompany':
          await deleteCompany.mutateAsync(initialData.id);
          break;
        case 'department':
          await deleteDepartment.mutateAsync(initialData.id);
          break;
        case 'designation':
          await deleteDesignation.mutateAsync(initialData.id);
          break;
        case 'gauzeType':
          await deleteType.mutateAsync(initialData.id);
          break;
        case 'gauzeSize':
          await deleteSize.mutateAsync(initialData.id);
          break;
        case 'bleachingType':
          await deleteBleaching.mutateAsync(initialData.id);
          break;
        case 'operationType':
          await deleteOperation.mutateAsync(initialData.id);
          break;
      }
      toast('Deleted', 'Record removed successfully', 'success');
      if (onSuccess) onSuccess({ id: initialData.id, deleted: true });
      onClose();
    } catch (err: any) {
      toast('Error', err?.message || 'Failed to delete record', 'error');
    }
  };

  const isPending =
    createCategory.isPending ||
    updateCategory.isPending ||
    deleteCategory.isPending ||
    createSupplier.isPending ||
    updateSupplier.isPending ||
    deleteSupplier.isPending ||
    createLocation.isPending ||
    updateLocation.isPending ||
    deleteLocation.isPending ||
    createDepartment.isPending ||
    updateDepartment.isPending ||
    deleteDepartment.isPending ||
    createDesignation.isPending ||
    updateDesignation.isPending ||
    deleteDesignation.isPending ||
    createCompany.isPending ||
    updateCompany.isPending ||
    deleteCompany.isPending ||
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
    <Modal isOpen={isOpen} onClose={onClose} title={getEntityTitle()} maxWidth={entityType === 'supplier' || entityType === 'jobWorkCompany' ? 'lg' : 'md'}>
      <div className="space-y-4 text-xs font-mono">
        {/* Name & Code Row */}
        {entityType !== 'gauzeSize' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={entityType === 'jobWorkCompany' || entityType === 'supplier' ? 'Company Name *' : 'Name / Title *'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lakshmi Cotton Spinning Mills"
              required
            />
            <Input
              label="Identifier Code (Optional)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SUP-001 or PROD"
            />
          </div>
        )}

        {/* Contact & GST Fields for Supplier / Job Work Company */}
        {(entityType === 'supplier' || entityType === 'jobWorkCompany') && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. orders@mill.com"
              />
              <Input
                label="GSTIN"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="e.g. 33AAAAA0000A1Z5"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Factory / Office Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Industrial Estate, Mill Road..."
              />
              {entityType === 'jobWorkCompany' && (
                <Input
                  label="Credit Terms (Days)"
                  type="number"
                  value={creditDays}
                  onChange={(e) => setCreditDays(Number(e.target.value))}
                  min={0}
                />
              )}
            </div>
          </>
        )}

        {/* Location Specific Type */}
        {entityType === 'location' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Location Type"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              placeholder="e.g. WAREHOUSE, FLOOR, RACK"
            />
          </div>
        )}

        {/* Gauze Dimensions Form */}
        {entityType === 'gauzeSize' && (
          <>
            <Input
              label="Size Name (Optional label)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard 120cm x 20m Roll"
            />
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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

        {/* Operation Sequence */}
        {entityType === 'operationType' && (
          <Input
            label="Sequence Step Order"
            type="number"
            value={sequence}
            onChange={(e) => setSequence(Number(e.target.value))}
            min={1}
            required
            placeholder="Order in which this operation is performed (1, 2, 3...)"
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
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} isLoading={isPending} className="text-xs bg-blue-600 hover:bg-blue-700">
              {isEdit ? 'Save Changes' : 'Create Record'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
