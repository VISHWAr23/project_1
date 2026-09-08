'use client';

import React, { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useManageGauzeMasters } from '@/hooks/useGauzeProduction';
import { MasterModal } from './master-modal';

interface MasterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  type?: 'gauzeType' | 'gauzeSize' | 'bleachingType' | 'operationType';
  mastersList?: any[];
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  onAddNewCustom?: () => void;
  onEditCustom?: () => void;
  onDeleteCustom?: (selectedId: string) => void;
  className?: string;
  disabled?: boolean;
}

export function MasterDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = '-- Select --',
  required = false,
  type,
  mastersList = [],
  allowAdd = true,
  allowEdit = true,
  allowDelete = true,
  onAddNewCustom,
  onEditCustom,
  onDeleteCustom,
  className,
  disabled = false,
}: MasterDropdownProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const { deleteType, deleteSize, deleteBleaching, deleteOperation } = useManageGauzeMasters();

  const selectedItem = value && mastersList.length > 0 ? mastersList.find((item) => item.id === value) : null;
  const selectedOption = options.find((opt) => opt.value === value);

  const handleOpenAdd = () => {
    if (onAddNewCustom) {
      onAddNewCustom();
      return;
    }
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (onEditCustom) {
      onEditCustom();
      return;
    }
    if (!selectedItem) return;
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteInline = async () => {
    if (!value) return;
    const itemName = selectedOption?.label || selectedItem?.name || label;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${itemName}"?`);
    if (!confirmDelete) return;

    if (onDeleteCustom) {
      onDeleteCustom(value);
      onChange('');
      return;
    }

    if (!type) return;

    try {
      if (type === 'gauzeType') await deleteType.mutateAsync(value);
      else if (type === 'gauzeSize') await deleteSize.mutateAsync(value);
      else if (type === 'bleachingType') await deleteBleaching.mutateAsync(value);
      else if (type === 'operationType') await deleteOperation.mutateAsync(value);

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
    deleteType.isPending ||
    deleteSize.isPending ||
    deleteBleaching.isPending ||
    deleteOperation.isPending;

  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      {/* Label */}
      <label className="text-xs font-semibold text-foreground flex items-center gap-1 block">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>

      {/* Select Box */}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[{ value: '', label: placeholder }, ...options]}
        required={required}
        disabled={disabled}
      />

      {/* Quick inline Add / Edit / Delete micro-buttons under the Select box */}
      {(allowAdd || allowEdit || allowDelete) && (
        <div className="flex items-center justify-end gap-1.5 pt-0.5 min-h-[22px]">
          {allowEdit && value && (type || onEditCustom) && (
            <button
              type="button"
              onClick={handleOpenEdit}
              title={`Edit selected ${label}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10 dark:hover:bg-amber-900/30 transition-colors"
            >
              <Edit2 className="h-3 w-3 stroke-[2.5]" />
              <span>Edit</span>
            </button>
          )}

          {allowDelete && value && (type || onDeleteCustom) && (
            <button
              type="button"
              onClick={handleDeleteInline}
              disabled={isDeleting}
              title={`Delete selected ${label}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-500/10 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3 stroke-[2.5]" />
              <span>Delete</span>
            </button>
          )}

          {allowAdd && (type || onAddNewCustom) && (
            <button
              type="button"
              onClick={handleOpenAdd}
              title={`Add new ${label}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Add New</span>
            </button>
          )}
        </div>
      )}

      {/* Master Modal for inline Add / Edit */}
      {type && (
        <MasterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={type}
          initialData={modalMode === 'edit' ? selectedItem : undefined}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
