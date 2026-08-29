'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Layers,
  Sparkles,
  Scissors,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, Column } from '@/components/ui/table';
import { MasterModal } from '@/components/gauze-production/master-modal';
import { useGauzeMasters, useManageGauzeMasters } from '@/hooks/useGauzeProduction';
import { useToast } from '@/components/ui/toast';

export default function GauzeMastersPage() {
  const { data: masters, isLoading } = useGauzeMasters();
  const { deleteType, deleteSize, deleteBleaching, deleteOperation } = useManageGauzeMasters();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'types' | 'sizes' | 'bleaching' | 'operations'>('types');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'gauzeType' | 'gauzeSize' | 'bleachingType' | 'operationType'>('gauzeType');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleDelete = async (type: 'gauzeType' | 'gauzeSize' | 'bleachingType' | 'operationType', item: any) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${item.name || 'this item'}"?`);
    if (!confirmDelete) return;

    try {
      if (type === 'gauzeType') await deleteType.mutateAsync(item.id);
      else if (type === 'gauzeSize') await deleteSize.mutateAsync(item.id);
      else if (type === 'bleachingType') await deleteBleaching.mutateAsync(item.id);
      else if (type === 'operationType') await deleteOperation.mutateAsync(item.id);
      toast('Deleted', 'Master record deleted successfully', 'success');
    } catch (err: any) {
      toast('Error', err?.message || 'Failed to delete record', 'error');
    }
  };

  const openAddModal = (type: 'gauzeType' | 'gauzeSize' | 'bleachingType' | 'operationType') => {
    setModalType(type);
    setSelectedItem(null);
    setModalOpen(true);
  };

  const openEditModal = (type: 'gauzeType' | 'gauzeSize' | 'bleachingType' | 'operationType', item: any) => {
    setModalType(type);
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/gauze-production">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Gauze Production Master Catalogues
            </h1>
          </div>

        </div>

        <div>
          {activeTab === 'types' && (
            <Button size="sm" onClick={() => openAddModal('gauzeType')} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add Gauze Type
            </Button>
          )}
          {activeTab === 'sizes' && (
            <Button size="sm" onClick={() => openAddModal('gauzeSize')} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add Gauze Size
            </Button>
          )}
          {activeTab === 'bleaching' && (
            <Button size="sm" onClick={() => openAddModal('bleachingType')} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add Bleaching Type
            </Button>
          )}
          {activeTab === 'operations' && (
            <Button size="sm" onClick={() => openAddModal('operationType')} className="gap-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add Operation Type
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold">
        {[
          { id: 'types', label: `1. Gauze Types (${masters?.gauzeTypes?.length || 0})` },
          { id: 'sizes', label: `2. Gauze Sizes (${masters?.gauzeSizes?.length || 0})` },
          { id: 'bleaching', label: `3. Bleaching Processes (${masters?.bleachingTypes?.length || 0})` },
          { id: 'operations', label: `4. Internal Operations (${masters?.operationTypes?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Gauze Types */}
      {activeTab === 'types' && (
        <Card className="p-5 bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Gauze Type Name</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Description / Specification</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {(masters?.gauzeTypes || []).map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/20">
                    <td className="py-2.5 px-3 font-sans font-bold text-foreground">{t.name}</td>
                    <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-bold">{t.code}</td>
                    <td className="py-2.5 px-3 font-sans text-muted-foreground">{t.description || '—'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal('gauzeType', t)}
                          className="h-7 text-xs gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('gauzeType', t)}
                          className="h-7 text-xs gap-1 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Gauze Sizes */}
      {activeTab === 'sizes' && (
        <Card className="p-5 bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Size Display Name</th>
                  <th className="py-2.5 px-3 text-right">Width</th>
                  <th className="py-2.5 px-3 text-right">Length</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {(masters?.gauzeSizes || []).map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/20">
                    <td className="py-2.5 px-3 font-sans font-bold text-foreground">{s.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      {Number(s.width)} {s.widthUom}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      {Number(s.length)} {s.lengthUom}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-muted-foreground">{s.description || '—'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal('gauzeSize', s)}
                          className="h-7 text-xs gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('gauzeSize', s)}
                          className="h-7 text-xs gap-1 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Bleaching Types */}
      {activeTab === 'bleaching' && (
        <Card className="p-5 bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Process Name</th>
                  <th className="py-2.5 px-3">Process Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {(masters?.bleachingTypes || []).map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/20">
                    <td className="py-2.5 px-3 font-sans font-bold text-foreground">{b.name}</td>
                    <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-bold">{b.code}</td>
                    <td className="py-2.5 px-3 font-sans text-muted-foreground">{b.description || '—'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal('bleachingType', b)}
                          className="h-7 text-xs gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('bleachingType', b)}
                          className="h-7 text-xs gap-1 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Operation Types */}
      {activeTab === 'operations' && (
        <Card className="p-5 bg-card border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-mono uppercase bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Sequence</th>
                  <th className="py-2.5 px-3">Operation Name</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {(masters?.operationTypes || []).map((op) => (
                  <tr key={op.id} className="hover:bg-secondary/20">
                    <td className="py-2.5 px-3 font-bold text-indigo-600">{op.sequence}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-foreground">{op.name}</td>
                    <td className="py-2.5 px-3 font-bold text-muted-foreground">{op.code}</td>
                    <td className="py-2.5 px-3 font-sans text-muted-foreground">{op.description || '—'}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal('operationType', op)}
                          className="h-7 text-xs gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('operationType', op)}
                          className="h-7 text-xs gap-1 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Master Modal */}
      {modalOpen && (
        <MasterModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          initialData={selectedItem}
        />
      )}
    </div>
  );
}
