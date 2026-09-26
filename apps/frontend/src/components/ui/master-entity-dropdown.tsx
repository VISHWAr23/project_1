'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { MasterEntityModal, MasterEntityType } from './master-entity-modal';
import {
  useDeleteCategory,
  useDeleteSupplier,
  useDeleteStorageLocation,
  useDeleteUnit,
} from '@/hooks/useRawMaterials';
import {
  useDeleteDepartment,
  useDeleteDesignation,
} from '@/hooks/useEmployees';
import { useDeleteJobWorkCompany } from '@/hooks/useJobWork';
import { useManageGauzeMasters } from '@/hooks/useGauzeProduction';
import { useDeleteCustomer } from '@/hooks/useCustomers';
import { useDeleteGamjeeSize } from '@/hooks/useGamjeeProduction';

export interface DropdownOption {
  value: string;
  label: string;
  raw?: any;
}

export interface MasterEntityDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: (DropdownOption | string)[];
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
  storageKey?: string;
  onOptionsChange?: (options: DropdownOption[]) => void;
  hint?: string;
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
  storageKey,
  onOptionsChange,
  hint,
  error,
}: MasterEntityDropdownProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);

  // Generic custom options modal states
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [genericModalMode, setGenericModalMode] = useState<'add' | 'edit'>('add');
  const [genericInputValue, setGenericInputValue] = useState('');

  // Normalize incoming options prop
  const normalizedPassedOptions = useMemo<DropdownOption[]>(() => {
    return (options || []).map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );
  }, [options]);

  // Internal options list for generic/custom dropdowns
  const [internalList, setInternalList] = useState<DropdownOption[]>(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        // ignore localStorage error
      }
    }
    return normalizedPassedOptions;
  });

  // Sync internalList with incoming options or localStorage updates
  useEffect(() => {
    if (entityType) return;

    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed: DropdownOption[] = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const merged = [...parsed];
            for (const opt of normalizedPassedOptions) {
              if (opt.value && !merged.some((m) => m.value === opt.value)) {
                merged.push(opt);
              }
            }
            setInternalList(merged);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    if (normalizedPassedOptions.length > 0) {
      setInternalList((prev) => {
        const combined = [...normalizedPassedOptions];
        for (const p of prev) {
          if (p.value && !combined.some((c) => c.value === p.value)) {
            combined.push(p);
          }
        }
        return combined;
      });
    }
  }, [entityType, storageKey, JSON.stringify(normalizedPassedOptions.map((o) => o.value))]);

  const saveGenericOptions = (newList: DropdownOption[]) => {
    setInternalList(newList);
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newList));
      } catch (e) {
        // ignore
      }
    }
    onOptionsChange?.(newList);
  };

  // Deletion mutations for backend entity types
  const deleteCategory = useDeleteCategory();
  const deleteUnit = useDeleteUnit();
  const deleteSupplier = useDeleteSupplier();
  const deleteLocation = useDeleteStorageLocation();
  const deleteCustomer = useDeleteCustomer();
  const deleteDepartment = useDeleteDepartment();
  const deleteDesignation = useDeleteDesignation();
  const deleteCompany = useDeleteJobWorkCompany();
  const { deleteType, deleteSize, deleteBleaching, deleteOperation } = useManageGauzeMasters();
  const deleteGamjeeSize = useDeleteGamjeeSize();

  // Effective list of options
  const currentOptions: DropdownOption[] = entityType
    ? normalizedPassedOptions
    : internalList.length > 0
    ? internalList
    : normalizedPassedOptions;

  // Find the currently selected option
  const selectedOption = currentOptions.find((opt) => opt.value === value);

  const handleOpenAdd = () => {
    if (onAddNewCustom) {
      onAddNewCustom();
      return;
    }
    if (entityType) {
      setModalInitialData(null);
      setIsModalOpen(true);
      return;
    }
    // Generic Add
    setGenericModalMode('add');
    setGenericInputValue('');
    setIsGenericModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!value) return;
    if (onEditCustom) {
      onEditCustom(value);
      return;
    }
    if (entityType) {
      const rawData = selectedOption?.raw || {
        id: value,
        name: selectedOption?.label || '',
        companyName: selectedOption?.label || '',
      };
      setModalInitialData(rawData);
      setIsModalOpen(true);
      return;
    }
    // Generic Edit
    setGenericModalMode('edit');
    setGenericInputValue(selectedOption?.label || value);
    setIsGenericModalOpen(true);
  };

  const handleDeleteInline = async () => {
    if (!value) return;
    const itemName = selectedOption?.label || value || label;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${itemName}"?`);
    if (!confirmDelete) return;

    if (onDeleteCustom) {
      onDeleteCustom(value);
      onChange('');
      return;
    }

    if (entityType) {
      try {
        switch (entityType) {
          case 'category':
            await deleteCategory.mutateAsync(value);
            break;
          case 'unit':
            await deleteUnit.mutateAsync(value);
            break;
          case 'supplier':
            await deleteSupplier.mutateAsync(value);
            break;
          case 'location':
            await deleteLocation.mutateAsync(value);
            break;
          case 'customer':
            await deleteCustomer.mutateAsync(value);
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
          case 'gamjeeSize':
            await deleteGamjeeSize.mutateAsync(value);
            break;
        }
        onChange('');
        toast('Deleted', `"${itemName}" deleted successfully`, 'success');
      } catch (err: any) {
        toast('Error', err?.message || 'Failed to delete record', 'error');
      }
      return;
    }

    // Generic Delete
    const updated = currentOptions.filter((o) => o.value !== value);
    saveGenericOptions(updated);
    onChange('');
    toast('Deleted', `"${itemName}" deleted successfully`, 'success');
  };

  const handleSaveGeneric = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = genericInputValue.trim();
    if (!trimmed) {
      toast('Required', 'Please enter a valid title/name', 'warning');
      return;
    }

    if (genericModalMode === 'add') {
      const newOption: DropdownOption = { value: trimmed, label: trimmed };
      const updated = [...currentOptions.filter((o) => o.value !== trimmed), newOption];
      saveGenericOptions(updated);
      onChange(trimmed);
      toast('Success', `"${trimmed}" added successfully`, 'success');
    } else {
      const oldVal = value;
      const updated = currentOptions.map((o) =>
        o.value === oldVal ? { ...o, value: trimmed, label: trimmed } : o
      );
      if (!updated.some((o) => o.value === trimmed)) {
        updated.push({ value: trimmed, label: trimmed });
      }
      saveGenericOptions(updated);
      onChange(trimmed);
      toast('Success', `"${trimmed}" updated successfully`, 'success');
    }
    setIsGenericModalOpen(false);
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
    deleteUnit.isPending ||
    deleteSupplier.isPending ||
    deleteLocation.isPending ||
    deleteCustomer.isPending ||
    deleteDepartment.isPending ||
    deleteDesignation.isPending ||
    deleteCompany.isPending ||
    deleteType.isPending ||
    deleteSize.isPending ||
    deleteBleaching.isPending ||
    deleteOperation.isPending ||
    deleteGamjeeSize.isPending;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      <label className="text-xs font-semibold text-foreground flex items-center gap-1 block">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>

      {/* Select Element */}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[{ value: '', label: placeholder }, ...currentOptions]}
        required={required}
        disabled={disabled}
        error={error}
      />

      {/* Action Controls & Hint Under the Input Box */}
      {(allowAdd || allowEdit || allowDelete || hint) && (
        <div className="flex items-center justify-between gap-1.5 pt-0.5 min-h-[22px]">
          {hint ? (
            <span className="text-[10px] text-muted-foreground truncate" title={hint}>
              {hint}
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Edit Current Item Button */}
            {allowEdit && (
              <button
                type="button"
                onClick={handleOpenEdit}
                disabled={!value}
                title={value ? `Edit selected ${label}` : `Select an option to edit`}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  value
                    ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 dark:hover:bg-amber-900/30 cursor-pointer'
                    : 'text-muted-foreground/35 cursor-not-allowed pointer-events-none'
                }`}
              >
                <Edit2 className="h-3 w-3 stroke-[2.5]" />
                <span>Edit</span>
              </button>
            )}

            {/* Delete Current Item Button */}
            {allowDelete && (
              <button
                type="button"
                onClick={handleDeleteInline}
                disabled={!value || isDeleting}
                title={value ? `Delete selected ${label}` : `Select an option to delete`}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  value
                    ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 dark:hover:bg-rose-900/30 cursor-pointer'
                    : 'text-muted-foreground/35 cursor-not-allowed pointer-events-none'
                }`}
              >
                <Trash2 className="h-3 w-3 stroke-[2.5]" />
                <span>Delete</span>
              </button>
            )}

            {/* Add New Item Button */}
            {allowAdd && (
              <button
                type="button"
                onClick={handleOpenAdd}
                title={`Add new ${label}`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3 stroke-[2.5]" />
                <span>Add New</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Master Entity Modal for backend entity types */}
      {entityType && (
        <MasterEntityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entityType={entityType}
          initialData={modalInitialData}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Generic Modal for custom dropdown options */}
      {!entityType && (
        <Modal
          isOpen={isGenericModalOpen}
          onClose={() => setIsGenericModalOpen(false)}
          title={genericModalMode === 'add' ? `Add New ${label}` : `Edit ${label}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveGeneric} className="space-y-4 text-xs font-mono">
            <Input
              label={`${label} Name / Specification *`}
              value={genericInputValue}
              onChange={(e) => setGenericInputValue(e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}...`}
              required
              autoFocus
            />

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsGenericModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {genericModalMode === 'add' ? 'Add Option' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
