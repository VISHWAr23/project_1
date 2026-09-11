'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  UserCheck,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  Building,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShoppingBag,
  MapPin,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/toast';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/hooks/useCustomers';
import { Customer } from '@/types/customers.types';

export default function RawMaterialsCustomersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useCustomers({
    search: searchTerm || undefined,
    customerType: selectedType || undefined,
    isActive: selectedStatus || undefined,
    page: currentPage,
    limit: 10,
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    customerType: 'HOSPITAL',
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    gstin: '',
    panNo: '',
    dlNo: '',
    regdNo: '',
    transportName: '',
    address: '',
    shippingAddress: '',
    city: '',
    state: 'Tamil Nadu',
    pinCode: '',
    isActive: true,
    notes: '',
  });

  const [editFormData, setEditFormData] = useState({ ...formData });

  const customers = data?.items || [];

  const handleGenerateCode = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, code: `CUST-${rand}` }));
    toast('Code Generated', `Assigned code CUST-${rand}`, 'info');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer.mutateAsync({
        ...formData,
      });
      toast('Customer Created', `Registered ${formData.name}`, 'success');
      setIsCreateOpen(false);
      setFormData({
        code: '',
        name: '',
        customerType: 'HOSPITAL',
        contactPerson: '',
        email: '',
        phone: '',
        alternatePhone: '',
        gstin: '',
        panNo: '',
        dlNo: '',
        regdNo: '',
        transportName: '',
        address: '',
        shippingAddress: '',
        city: '',
        state: 'Tamil Nadu',
        pinCode: '',
        isActive: true,
        notes: '',
      });
      refetch();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not create customer', 'error');
    }
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      code: customer.code || '',
      name: customer.name || '',
      customerType: customer.customerType || 'HOSPITAL',
      contactPerson: customer.contactPerson || '',
      email: customer.email || '',
      phone: customer.phone || '',
      alternatePhone: customer.alternatePhone || '',
      gstin: customer.gstin || '',
      panNo: customer.panNo || '',
      dlNo: customer.dlNo || '',
      regdNo: customer.regdNo || '',
      transportName: customer.transportName || '',
      address: customer.address || '',
      shippingAddress: customer.shippingAddress || '',
      city: customer.city || '',
      state: customer.state || '',
      pinCode: customer.pinCode || '',
      isActive: customer.isActive ?? true,
      notes: customer.notes || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await updateCustomer.mutateAsync({
        id: editingCustomer.id,
        payload: {
          ...editFormData,
        },
      });
      toast('Customer Updated', `Updated ${editFormData.name}`, 'success');
      setEditingCustomer(null);
      refetch();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update customer', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await deleteCustomer.mutateAsync(deletingCustomer.id);
      toast('Customer Deleted', `Customer "${deletingCustomer.name}" removed`, 'success');
      setDeletingCustomer(null);
      refetch();
    } catch (err: any) {
      toast('Deletion Failed', err.message || 'Could not delete customer', 'error');
    }
  };

  const getCustomerTypeBadge = (type?: string | null) => {
    switch (type) {
      case 'HOSPITAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            HOSPITAL
          </span>
        );
      case 'PHARMACY_CHAIN':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            PHARMACY
          </span>
        );
      case 'DISTRIBUTOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
            DISTRIBUTOR
          </span>
        );
      case 'WHOLESALER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            WHOLESALER
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-muted-foreground border border-border">
            {type || 'CLIENT'}
          </span>
        );
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'code',
      header: 'Customer Code',
      sortable: true,
      width: '130px',
      render: (row) => (
        <span className="font-mono font-semibold text-[#3ECF8E]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Company / Hospital Name',
      sortable: true,
      render: (row) => (
        <div>
          <button
            onClick={() => setViewingCustomer(row)}
            className="font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            {row.name}
          </button>
          <div className="flex items-center gap-1.5 mt-1">
            {getCustomerTypeBadge(row.customerType)}
            {row.city && (
              <span className="text-[11px] text-muted-foreground">
                • {row.city}
              </span>
            )}
          </div>
        </div>
      ),
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
      key: 'orders' as any,
      header: 'Assigned Orders',
      align: 'right',
      render: (row) => (
        <div className="text-right text-xs font-mono">
          <span className="font-bold text-foreground block">
            {row._count?.orders || row.orders?.length || 0} Orders
          </span>
          <span className="text-[11px] text-emerald-400 block">
            ₹ {(row.totalOrderValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </div>
      ),
    },
    {
      key: 'actions' as any,
      header: 'Actions',
      align: 'right',
      width: '120px',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingCustomer(row)}
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit Customer"
            className="hover:text-blue-500"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeletingCustomer(row)}
            title="Delete Customer"
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
      {/* Top Header - Identical to Suppliers module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/raw-materials">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#3ECF8E]" />
              Customer Master Directory
            </h1>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="w-full sm:w-auto justify-center"
        >
          Add New Customer
        </Button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-secondary/20 border border-border rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#3ECF8E]" /> Search & Filter
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedStatus('');
              refetch();
            }}
            className="text-xs h-7"
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Company, Code, GSTIN, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/60 text-foreground text-sm sm:text-xs pl-9 pr-3 py-2 rounded-md border border-border focus:outline-none focus:border-[#3ECF8E]"
            />
          </div>

          <Select
            options={[
              { label: 'All Customer Categories', value: '' },
              { label: 'Hospital / Medical Center', value: 'HOSPITAL' },
              { label: 'Pharmacy Chain', value: 'PHARMACY_CHAIN' },
              { label: 'Distributor / Stockist', value: 'DISTRIBUTOR' },
              { label: 'Wholesaler / Trader', value: 'WHOLESALER' },
              { label: 'Clinic / Nursing Home', value: 'CLINIC' },
              { label: 'Export Buyer', value: 'EXPORTER' },
              { label: 'Other', value: 'OTHER' },
            ]}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />

          <Select
            options={[
              { label: 'All Account Statuses', value: '' },
              { label: 'Active Clients', value: 'true' },
              { label: 'Inactive Clients', value: 'false' },
            ]}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        data={customers}
        isLoading={isLoading}
        emptyMessage="No customer accounts match the specified filters."
        keyExtractor={(row) => row.id}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={data?.meta?.totalPages || 1}
        totalRecords={data?.meta?.total || 0}
        pageSize={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Customer Master"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-muted-foreground">Customer Code</label>
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="text-[11px] text-[#3ECF8E] hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="h-3 w-3" /> Auto
                </button>
              </div>
              <Input
                placeholder="CUST-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>

            <Input
              label="Company / Hospital Name"
              placeholder="Apollo Hospitals Enterprise Ltd"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Client Type</label>
              <Select
                options={[
                  { label: 'Hospital / Medical Center', value: 'HOSPITAL' },
                  { label: 'Pharmacy Chain', value: 'PHARMACY_CHAIN' },
                  { label: 'Distributor / Stockist', value: 'DISTRIBUTOR' },
                  { label: 'Wholesaler / Trader', value: 'WHOLESALER' },
                  { label: 'Clinic / Nursing Home', value: 'CLINIC' },
                  { label: 'Export Buyer', value: 'EXPORTER' },
                  { label: 'Other', value: 'OTHER' },
                ]}
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
              />
            </div>
            <Input
              label="Contact Person"
              placeholder="Dr. Ramesh Kumar"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+91 98450 12345"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="procurement@apollohospitals.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="D.L. No. / Regd. No."
              placeholder="e.g. DL-20B/21B-4492"
              value={formData.dlNo}
              onChange={(e) => setFormData({ ...formData, dlNo: e.target.value })}
            />
            <Input
              label="Preferred Transport Name"
              placeholder="e.g. VRL Logistics / SRS Travels"
              value={formData.transportName}
              onChange={(e) => setFormData({ ...formData, transportName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GSTIN Number"
              placeholder="33AAACA0000A1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            />
            <Input
              label="City"
              placeholder="Chennai / Madurai"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Billing / Clinic Address</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#77B33E]"
              rows={2}
              placeholder="Full hospital or clinic billing address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={Boolean(editingCustomer)}
        onClose={() => setEditingCustomer(null)}
        title="Edit Customer Master"
        maxWidth="xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Customer Code"
              placeholder="CUST-001"
              value={editFormData.code}
              onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
              required
            />
            <Input
              label="Company Name"
              placeholder="Apollo Hospitals"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={editFormData.contactPerson}
              onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="D.L. No. / Regd. No."
              placeholder="e.g. DL-20B/21B-4492"
              value={editFormData.dlNo}
              onChange={(e) => setEditFormData({ ...editFormData, dlNo: e.target.value })}
            />
            <Input
              label="Preferred Transport Name"
              placeholder="e.g. VRL Logistics / SRS Travels"
              value={editFormData.transportName}
              onChange={(e) => setEditFormData({ ...editFormData, transportName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />
            <Input
              label="GSTIN Number"
              value={editFormData.gstin}
              onChange={(e) => setEditFormData({ ...editFormData, gstin: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="PAN Number"
              value={editFormData.panNo}
              onChange={(e) => setEditFormData({ ...editFormData, panNo: e.target.value })}
            />
            <Input
              label="City"
              value={editFormData.city}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Billing Address</label>
            <textarea
              className="w-full bg-secondary/50 border border-border rounded-md text-xs p-2 text-foreground focus:outline-none focus:border-[#77B33E]"
              rows={2}
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditingCustomer(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={Boolean(viewingCustomer)}
        onClose={() => setViewingCustomer(null)}
        title="Customer Profile Details"
        maxWidth="lg"
      >
        {viewingCustomer && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-secondary/30 rounded-lg border border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                    {viewingCustomer.code}
                  </span>
                  {getCustomerTypeBadge(viewingCustomer.customerType)}
                </div>
                <h3 className="text-sm font-bold text-foreground mt-1.5">{viewingCustomer.name}</h3>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-muted-foreground block">Lifetime Value</span>
                <span className="text-sm font-bold text-emerald-400">
                  ₹ {(viewingCustomer.totalOrderValue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-secondary/20 rounded border border-border">
                <span className="text-muted-foreground text-[10px] block">Contact Person</span>
                <span className="font-semibold text-foreground">{viewingCustomer.contactPerson || '—'}</span>
              </div>
              <div className="p-2.5 bg-secondary/20 rounded border border-border">
                <span className="text-muted-foreground text-[10px] block">Phone</span>
                <span className="font-semibold font-mono text-foreground">{viewingCustomer.phone || '—'}</span>
              </div>
              <div className="p-2.5 bg-secondary/20 rounded border border-border">
                <span className="text-muted-foreground text-[10px] block">D.L. No. / Regd. No.</span>
                <span className="font-mono font-semibold text-foreground">{viewingCustomer.dlNo || viewingCustomer.regdNo || '—'}</span>
              </div>
              <div className="p-2.5 bg-secondary/20 rounded border border-border">
                <span className="text-muted-foreground text-[10px] block">Transport Carrier</span>
                <span className="font-semibold text-foreground">{viewingCustomer.transportName || '—'}</span>
              </div>
              <div className="p-2.5 bg-secondary/20 rounded border border-border">
                <span className="text-muted-foreground text-[10px] block">Email</span>
                <span className="text-foreground">{viewingCustomer.email || '—'}</span>
              </div>
              <div className="p-2.5 bg-secondary/20 rounded border border-border">
                <span className="text-muted-foreground text-[10px] block">GSTIN</span>
                <span className="font-mono font-semibold text-foreground">{viewingCustomer.gstin || '—'}</span>
              </div>
            </div>

            {viewingCustomer.address && (
              <div className="p-2.5 bg-secondary/20 rounded border border-border">
                <span className="text-muted-foreground text-[10px] block mb-0.5">Address</span>
                <span className="text-foreground">{viewingCustomer.address}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Link href={`/customer-orders?customerId=${viewingCustomer.id}`}>
                <Button variant="outline" size="sm" leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}>
                  View Orders
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setViewingCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        title="Delete Customer Master"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2 text-xs text-red-300">
            <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              Confirm Customer Deletion
            </div>
            <p>
              Are you sure you want to delete customer{' '}
              <strong className="text-foreground">{deletingCustomer?.name}</strong> ({deletingCustomer?.code})?
            </p>
            <p className="text-muted-foreground">This action cannot be undone.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setDeletingCustomer(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              {deleteCustomer.isPending ? 'Deleting...' : 'Delete Customer'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
