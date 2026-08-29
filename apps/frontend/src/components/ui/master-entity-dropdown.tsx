'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { MasterEntityModal, MasterEntityType } from './master-entity-modal';
import {
  useDeleteCategory,
  useDeleteSupplier,
  useDeleteStorageLocation,
} from '@/hooks/useRawMaterials';
import {
  useDeleteDepartment,
  useDeleteDesignation,
} from '@/hooks/useEmployees';
import { useDeleteJobWorkCompany } from '@/hooks/useJobWork';
import { useManageGauzeMasters } from '@/hooks/useGauzeProduction';

export interface DropdownOption {
  value: string;
  label: string;
  raw?: any;
}

export interface MasterEntityDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  entityType?: MasterEntityType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  onAddNewCustom?: () => void;
  onEditCustom?: (selectedId: string) => void;
  onDeleteCustom?: (selectedId: string) => void;
  error?: string;
}

export function MasterEntityDropdown({
  label,
  value,
  onChange,
  options = [],
  entityType,
  placeholder = 'Select option...',
  required = false,
  disabled = false,
  className = '',
  allowAdd = true,
  allowEdit = true,
  allowDelete = true,
  onAddNewCustom,
  onEditCustom,
  onDeleteCustom,
  error,
}: MasterEntityDropdownProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);

  // Deletion mutations
  const deleteCategory = useDeleteCategory();
  const deleteSupplier = useDeleteSupplier();
  const deleteLocation = useDeleteStorageLocation();
  const deleteDepartment = useDeleteDepartment();
  const deleteDesignation = useDeleteDesignation();
  const deleteCompany = useDeleteJobWorkCompany();
  const { deleteType, deleteSize, deleteBleaching, deleteOperation } = useManageGauzeMasters();

  // Find the currently selected option to pass its data to Edit Modal
  const selectedOption = options.find((opt) => opt.value === value);

  const handleOpenAdd = () => {
    if (onAddNewCustom) {
      onAddNewCustom();
      return;
    }
    setModalInitialData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!value) return;
    if (onEditCustom) {
      onEditCustom(value);
      return;
    }
    // Prepare initial data from option
    const rawData = selectedOption?.raw || {
      id: value,
      name: selectedOption?.label || '',
      companyName: selectedOption?.label || '',
    };
    setModalInitialData(rawData);
    setIsModalOpen(true);
  };

  const handleDeleteInline = async () => {
    if (!value) return;
    const itemName = selectedOption?.label || label;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${itemName}"?`);
    if (!confirmDelete) return;

    if (onDeleteCustom) {
      onDeleteCustom(value);
      onChange('');
      return;
    }

    if (!entityType) return;

    try {
      switch (entityType) {
        case 'category':
          await deleteCategory.mutateAsync(value);
          break;
        case 'supplier':
          await deleteSupplier.mutateAsync(value);
          break;
        case 'location':
          await deleteLocation.mutateAsync(value);
          break;
        case 'jobWorkCompany':
          await deleteCompany.mutateAsync(value);
          break;
        case 'department':
          await deleteDepartment.mutateAsync(value);
          break;
        case 'designation':
          await deleteDesignation.mutateAsync(value);
          break;
        case 'gauzeType':
          await deleteType.mutateAsync(value);
          break;
        case 'gauzeSize':
          await deleteSize.mutateAsync(value);
          break;
        case 'bleachingType':
          await deleteBleaching.mutateAsync(value);
          break;
        case 'operationType':
          await deleteOperation.mutateAsync(value);
          break;
      }
      onChange('');
      toast('Deleted', `"${itemName}" deleted successfully`, 'success');
    } catch (err: any) {
      toast('Error', err?.message || 'Failed to delete record', 'error');
    }
  };

  const handleModalSuccess = (savedItem: any) => {
    if (savedItem?.deleted) {
      if (value === savedItem.id) {
        onChange('');
      }
    } else if (savedItem?.id) {
      onChange(savedItem.id);
    }
  };

  const isDeleting =
    deleteCategory.isPending ||
    deleteSupplier.isPending ||
    deleteLocation.isPending ||
    deleteDepartment.isPending ||
    deleteDesignation.isPending ||
    deleteCompany.isPending ||
    deleteType.isPending ||
    deleteSize.isPending ||
    deleteBleaching.isPending ||
    deleteOperation.isPending;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Inline Action Controls */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>

        <div className="flex items-center gap-1.5">
          {/* Edit Current Item Button (Only shown when an item is selected) */}
          {allowEdit && value && (entityType || onEditCustom) && (
            <button
              type="button"
              onClick={handleOpenEdit}
              title={`Edit selected ${label}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 transition-colors"
            >
              <Edit2 className="h-3 w-3 stroke-[2.5]" />
              <span>Edit</span>
            </button>
          )}

          {/* Delete Current Item Button (Only shown when an item is selected) */}
          {allowDelete && value && (entityType || onDeleteCustom) && (
            <button
              type="button"
              onClick={handleDeleteInline}
              disabled={isDeleting}
              title={`Delete selected ${label}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-900/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3 stroke-[2.5]" />
              <span>Delete</span>
            </button>
          )}

          {/* Add New Item Button */}
          {allowAdd && (entityType || onAddNewCustom) && (
            <button
              type="button"
              onClick={handleOpenAdd}
              title={`Add new ${label}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 transition-colors"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Element */}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[{ value: '', label: placeholder }, ...options]}
        required={required}
        disabled={disabled}
        error={error}
      />

      {/* Embedded Master Entity Modal */}
      {entityType && (
        <MasterEntityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entityType={entityType}
          initialData={modalInitialData}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
