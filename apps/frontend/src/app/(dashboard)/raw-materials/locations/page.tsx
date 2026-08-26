'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import {
  useStorageLocations,
  useCreateStorageLocation,
  useUpdateStorageLocation,
  useDeleteStorageLocation,
} from '@/hooks/useRawMaterials';
import { StorageLocation } from '@/types/raw-materials.types';

export default function StorageLocationsPage() {
  const { toast } = useToast();
  const { data: locations, isLoading, refetch } = useStorageLocations();
  const createLocation = useCreateStorageLocation();
  const updateLocation = useUpdateStorageLocation();
  const deleteLocation = useDeleteStorageLocation();

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    warehouseZone: '',
    description: '',
  });

  // Edit modal state
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [editFormData, setEditFormData] = useState({
    code: '',
    name: '',
    warehouseZone: '',
    description: '',
  });

  // Delete modal state
  const [deletingLocation, setDeletingLocation] = useState<StorageLocation | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLocation.mutateAsync(formData);
      toast('Location Created', `Added ${formData.name}`, 'success');
      setIsCreateOpen(false);
      setFormData({ code: '', name: '', warehouseZone: '', description: '' });
      refetch();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create storage location', 'error');
    }
  };

  const handleOpenEdit = (location: StorageLocation) => {
    setEditingLocation(location);
    setEditFormData({
      code: location.code || '',
      name: location.name || '',
      warehouseZone: location.warehouseZone || '',
      description: location.description || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    try {
      await updateLocation.mutateAsync({
        id: editingLocation.id,
        payload: editFormData,
      });
      toast('Location Updated', `Updated ${editFormData.name}`, 'success');
      setEditingLocation(null);
      refetch();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update storage location', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingLocation) return;
    try {
      await deleteLocation.mutateAsync(deletingLocation.id);
      toast('Location Deleted', `Storage location "${deletingLocation.name}" removed`, 'success');
      setDeletingLocation(null);
      refetch();
    } catch (err: any) {
      toast('Deletion Failed', err.message || 'Could not delete storage location', 'error');
    }
  };

  const columns: Column<StorageLocation>[] = [
    {
      key: 'code',
      header: 'Location Code',
      render: (row) => <span className="font-mono font-semibold text-[#3ECF8E]">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Location Name',
      render: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    },
    {
      key: 'warehouseZone',
      header: 'Warehouse Zone',
      render: (row) => <span className="text-xs text-muted-foreground">{row.warehouseZone || 'Main Zone'}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="text-xs text-muted-foreground">{row.description || '-'}</span>,
    },
    {
      key: '_count',
      header: 'Stored Items',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {row._count?.rawMaterials || 0} SKUs
        </span>
      ),
    },
    {
      key: 'actions' as any,
      header: 'Actions',
      align: 'right',
      width: '110px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit Storage Location"
            className="hover:text-blue-500"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingLocation(row)}
            title="Delete Storage Location"
            className="hover:text-red-500 text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link href="/raw-materials">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#3ECF8E]" />
              Warehouse Storage Location Master
            </h1>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add Storage Location
        </Button>
      </div>

      <Table
        columns={columns}
        data={locations || []}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
      />

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Storage Location">

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location Code" placeholder="WH-A1" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
            <Input label="Location Name" placeholder="Rack A1 - Heavy Metals" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <Input label="Warehouse Zone" placeholder="Zone A (Ground Floor)" value={formData.warehouseZone} onChange={(e) => setFormData({ ...formData, warehouseZone: e.target.value })} />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={2}
              placeholder="Capacity, dimension specs, shelf details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createLocation.isPending}>
              {createLocation.isPending ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingLocation)}
        onClose={() => setEditingLocation(null)}
        title="Edit Storage Location"
        description="Update warehouse location and zone details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Location Code" placeholder="WH-A1" value={editFormData.code} onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })} required />
            <Input label="Location Name" placeholder="Rack A1 - Heavy Metals" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required />
          </div>
          <Input label="Warehouse Zone" placeholder="Zone A (Ground Floor)" value={editFormData.warehouseZone} onChange={(e) => setEditFormData({ ...editFormData, warehouseZone: e.target.value })} />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={2}
              placeholder="Capacity, dimension specs, shelf details..."
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditingLocation(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateLocation.isPending}>
              {updateLocation.isPending ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingLocation)}
        onClose={() => setDeletingLocation(null)}
        title="Delete Storage Location"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs text-red-300">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm Storage Location Deletion
            </div>
            <p>
              Are you sure you want to delete location <strong className="text-foreground">{deletingLocation?.name}</strong> ({deletingLocation?.code})?
            </p>
            {(deletingLocation?._count?.rawMaterials || 0) > 0 && (
              <p className="text-amber-300">
                This location currently holds <strong className="text-foreground">{deletingLocation?._count?.rawMaterials}</strong> raw material SKU(s). Deleting will unassign the location from these materials without deleting the inventory items.
              </p>
            )}
            <p className="text-muted-foreground">This action cannot be undone.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setDeletingLocation(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={handleDelete}
              disabled={deleteLocation.isPending}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              {deleteLocation.isPending ? 'Deleting...' : 'Delete Location'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
