'use client';

import React, { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { MasterEntityModal, MasterEntityType } from './master-entity-modal';

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
  onAddNewCustom?: () => void;
  onEditCustom?: (selectedId: string) => void;
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
  onAddNewCustom,
  onEditCustom,
  error,
}: MasterEntityDropdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);

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

  const handleModalSuccess = (savedItem: any) => {
    if (savedItem?.id) {
      onChange(savedItem.id);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Inline Action Controls */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>

        <div className="flex items-center gap-2">
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
