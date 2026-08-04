'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useSuppliers, useCreateSupplier } from '@/hooks/useRawMaterials';
import { Supplier } from '@/types/raw-materials.types';

export default function SuppliersPage() {
  const { toast } = useToast();
  const { data: suppliers, refetch } = useSuppliers();
  const createSupplier = useCreateSupplier();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier.mutateAsync(formData);
      toast('Supplier Created', `Registered ${formData.name}`, 'success');
      setIsOpen(false);
      setFormData({ code: '', name: '', contactPerson: '', email: '', phone: '', gstin: '', address: '' });
      refetch();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create supplier', 'error');
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
      render: (row) => <span className="font-mono text-xs font-bold text-foreground">{row._count?.rawMaterials || 0} Materials</span>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 max-w-6xl mx-auto"
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
            <p className="text-xs text-muted-foreground mt-0.5">Approved vendors & suppliers for raw material procurement</p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add New Supplier
        </Button>
      </div>

      <Table columns={columns} data={suppliers || []} keyExtractor={(row) => row.id} />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Supplier Master" description="Register a new material vendor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Supplier Code" placeholder="SUP-001" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
            <Input label="Company Name" placeholder="Apex Metal Extrusions" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" placeholder="Rajesh Kumar" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
            <Input label="Phone Number" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email Address" type="email" placeholder="vendor@apex.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="GSTIN Number" placeholder="27AAACA12341Z5" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
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
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createSupplier.isPending}>
              Save Supplier
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
