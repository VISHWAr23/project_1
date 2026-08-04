'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useStorageLocations, useCreateStorageLocation } from '@/hooks/useRawMaterials';
import { StorageLocation } from '@/types/raw-materials.types';

export default function StorageLocationsPage() {
  const { toast } = useToast();
  const { data: locations, refetch } = useStorageLocations();
  const createLocation = useCreateStorageLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    warehouseZone: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLocation.mutateAsync(formData);
      toast('Location Created', `Added ${formData.name}`, 'success');
      setIsOpen(false);
      setFormData({ code: '', name: '', warehouseZone: '', description: '' });
      refetch();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create storage location', 'error');
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
      render: (row) => <span className="font-mono text-xs font-bold text-foreground">{row._count?.rawMaterials || 0} SKUs</span>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 max-w-5xl mx-auto"
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
            <p className="text-xs text-muted-foreground mt-0.5">Racks, bins, zones, and warehouse locations</p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add Storage Location
        </Button>
      </div>

      <Table columns={columns} data={locations || []} keyExtractor={(row) => row.id} />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Storage Location" description="Add warehouse rack, bin or zone">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createLocation.isPending}>
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
