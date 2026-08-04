'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, ArrowLeft, Plus, Layers3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { useRawMaterialCategories, useCreateCategory } from '@/hooks/useRawMaterials';
import { Category } from '@/types/raw-materials.types';

export default function CategoriesPage() {
  const { toast } = useToast();
  const { data: categories, refetch } = useRawMaterialCategories();
  const createCategory = useCreateCategory();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync({ name, description });
      toast('Category Created', `Added ${name} to category master`, 'success');
      setIsOpen(false);
      setName('');
      setDescription('');
      refetch();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create category', 'error');
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Category Name',
      sortable: true,
      render: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="text-xs text-muted-foreground">{row.description || 'No description'}</span>,
    },
    {
      key: '_count',
      header: 'Assigned Raw Materials',
      align: 'right',
      render: (row) => <span className="font-mono text-xs font-bold text-[#3ECF8E]">{row._count?.rawMaterials || 0} SKUs</span>,
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
              <Layers className="h-5 w-5 text-[#3ECF8E]" />
              Material Category Master
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Classification taxonomy for raw materials & inventory items</p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add New Category
        </Button>
      </div>

      <Table columns={columns} data={categories || []} keyExtractor={(row) => row.id} />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Material Category" description="Add new category master">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Raw Metals, Packaging, Electricals" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#3ECF8E]"
              rows={3}
              placeholder="Category scope and application notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createCategory.isPending}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
