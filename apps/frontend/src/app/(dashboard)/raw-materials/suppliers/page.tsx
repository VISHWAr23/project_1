'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/hooks/useRawMaterials';
import { Supplier } from '@/types/raw-materials.types';

export default function SuppliersPage() {
  const { toast } = useToast();
  const { data: suppliers, isLoading, refetch } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  // Create modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
  });

  // Edit modal state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editFormData, setEditFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
  });

  // Delete modal state
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier.mutateAsync(formData);
      toast('Supplier Created', `Registered ${formData.name}`, 'success');
      setIsCreateOpen(false);
      setFormData({ code: '', name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' });
      refetch();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create supplier', 'error');
    }
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditFormData({
      code: supplier.code || '',
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      gstin: supplier.gstin || '',
      address: supplier.address || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    try {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        payload: editFormData,
      });
      toast('Supplier Updated', `Updated ${editFormData.name}`, 'success');
      setEditingSupplier(null);
      refetch();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update supplier', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await deleteSupplier.mutateAsync(deletingSupplier.id);
      toast('Supplier Deleted', `Supplier "${deletingSupplier.name}" removed`, 'success');
      setDeletingSupplier(null);
      refetch();
    } catch (err: any) {
      toast('Deletion Failed', err.message || 'Could not delete supplier', 'error');
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'code',
      header: 'Supplier Code',
      render: (row) => <span className="font-mono font-semibold text-[#3ECF8E]">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Company Name',
      render: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    },
    {
      key: 'contactPerson',
      header: 'Contact Person & Phone',
      render: (row) => (
        <div className="text-xs">
          <span className="text-foreground block font-medium">{row.contactPerson || 'N/A'}</span>
          <span className="text-muted-foreground block">{row.phone || ''}</span>
        </div>
      ),
    },
    {
      key: 'gstin',
      header: 'GSTIN / Email',
      render: (row) => (
        <div className="text-xs font-mono">
          <span className="text-foreground block">{row.gstin || 'N/A'}</span>
          <span className="text-muted-foreground block font-sans">{row.email || ''}</span>
        </div>
      ),
    },
    {
      key: '_count',
      header: 'Assigned Items',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {row._count?.rawMaterials || 0} Materials
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
            title="Edit Supplier"
            className="hover:text-blue-500"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingSupplier(row)}
            title="Delete Supplier"
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
              <Building2 className="h-5 w-5 text-[#3ECF8E]" />
              Supplier Master Directory
            </h1>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add New Supplier
        </Button>
      </div>

      <Table
        columns={columns}
        data={suppliers || []}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
      />

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Supplier Master">

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Supplier Code" placeholder="SUP-001" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
            <Input label="Company Name" placeholder="Lakshmi Cotton Spinning Mills" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" placeholder="Rajesh Kumar" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
            <Input label="Phone Number" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email Address" type="email" placeholder="vendor@lakshmicotton.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="GSTIN Number" placeholder="33AAACL12341Z5" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Factory Address</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={2}
              placeholder="Full factory or billing address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createSupplier.isPending}>
              {createSupplier.isPending ? 'Saving...' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingSupplier)}
        onClose={() => setEditingSupplier(null)}
        title="Edit Supplier Master"
        description="Update supplier vendor details"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Supplier Code" placeholder="SUP-001" value={editFormData.code} onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })} required />
            <Input label="Company Name" placeholder="Lakshmi Cotton Spinning Mills" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" placeholder="Rajesh Kumar" value={editFormData.contactPerson} onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })} />
            <Input label="Phone Number" placeholder="+91 98765 43210" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email Address" type="email" placeholder="vendor@lakshmicotton.com" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
            <Input label="GSTIN Number" placeholder="33AAACL12341Z5" value={editFormData.gstin} onChange={(e) => setEditFormData({ ...editFormData, gstin: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Factory Address</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={2}
              placeholder="Full factory or billing address..."
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditingSupplier(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateSupplier.isPending}>
              {updateSupplier.isPending ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingSupplier)}
        onClose={() => setDeletingSupplier(null)}
        title="Delete Supplier Master"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs text-red-300">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm Supplier Deletion
            </div>
            <p>
              Are you sure you want to delete supplier <strong className="text-foreground">{deletingSupplier?.name}</strong> ({deletingSupplier?.code})?
            </p>
            {(deletingSupplier?._count?.rawMaterials || 0) > 0 && (
              <p className="text-amber-300">
                This supplier is linked to <strong className="text-foreground">{deletingSupplier?._count?.rawMaterials}</strong> raw material(s). Deleting will unassign the supplier reference without deleting the material items.
              </p>
            )}
            <p className="text-muted-foreground">This action cannot be undone.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setDeletingSupplier(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={handleDelete}
              disabled={deleteSupplier.isPending}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              {deleteSupplier.isPending ? 'Deleting...' : 'Delete Supplier'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
