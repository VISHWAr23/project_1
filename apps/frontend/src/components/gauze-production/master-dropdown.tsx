'use client';

import React, { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Edit2 } from 'lucide-react';
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
  onAddNewCustom?: () => void;
  onEditCustom?: () => void;
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
  onAddNewCustom,
  onEditCustom,
  className,
  disabled = false,
}: MasterDropdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const selectedItem = value && mastersList.length > 0 ? mastersList.find((item) => item.id === value) : null;

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

  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      {/* Label and Quick Actions Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>

        {/* Quick inline Add / Edit micro-buttons */}
        <div className="flex items-center gap-1.5">
          {value && (type || onEditCustom) && (
            <button
              type="button"
              onClick={handleOpenEdit}
              title={`Edit selected ${label}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-colors"
            >
              <Edit2 className="h-2.5 w-2.5" />
              <span>Edit</span>
            </button>
          )}

          {(type || onAddNewCustom) && (
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

      {/* Select Box */}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[{ value: '', label: placeholder }, ...options]}
        required={required}
        disabled={disabled}
      />

      {/* Master Modal for inline Add / Edit */}
      {type && (
        <MasterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={type}
          initialData={modalMode === 'edit' ? selectedItem : undefined}
        />
      )}
    </div>
  );
}
