'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, ArrowLeft, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import {
  useRawMaterialCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useRawMaterials';
import { Category } from '@/types/raw-materials.types';

export default function CategoriesPage() {
  const { toast } = useToast();
  const { data: categories, isLoading, refetch } = useRawMaterialCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Edit state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      toast('Category Created', `Added ${name} to category master`, 'success');
      setIsCreateOpen(false);
      setName('');
      setDescription('');
      refetch();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create category', 'error');
    }
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      toast('Category Updated', `Updated category ${editName}`, 'success');
      setEditingCategory(null);
      refetch();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update category', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory.mutateAsync(deletingCategory.id);
      toast('Category Deleted', `Category "${deletingCategory.name}" removed`, 'success');
      setDeletingCategory(null);
      refetch();
    } catch (err: any) {
      toast('Deletion Failed', err.message || 'Could not delete category', 'error');
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
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#3ECF8E]">
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
            title="Edit Category"
            className="hover:text-blue-500"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingCategory(row)}
            title="Delete Category"
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
              <Layers className="h-5 w-5 text-[#3ECF8E]" />
              Material Category Master
            </h1>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>
          Add New Category
        </Button>
      </div>

      <Table
        columns={columns}
        data={categories || []}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
      />

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Material Category">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Raw Metals, Packaging, Electricals" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createCategory.isPending}>
              {createCategory.isPending ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title="Edit Material Category"
        description="Update category name"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Raw Metals, Packaging, Electricals"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateCategory.isPending}>
              {updateCategory.isPending ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        title="Delete Material Category"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs text-red-300">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm Category Deletion
            </div>
            <p>
              Are you sure you want to delete <strong className="text-foreground">{deletingCategory?.name}</strong>?
            </p>
            {(deletingCategory?._count?.rawMaterials || 0) > 0 && (
              <p className="text-amber-300">
                This category currently has <strong className="text-foreground">{deletingCategory?._count?.rawMaterials}</strong> assigned raw material SKU(s). Deleting will unassign the category from these materials without deleting the items.
              </p>
            )}
            <p className="text-muted-foreground">This action cannot be undone.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setDeletingCategory(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete Category'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
