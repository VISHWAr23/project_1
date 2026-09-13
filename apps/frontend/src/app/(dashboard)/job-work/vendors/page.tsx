'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  ArrowLeft,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Factory,
  Copy,
  Check,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton-loader';
import {
  useJobWorkCompanies,
  useCreateJobWorkCompany,
  useUpdateJobWorkCompany,
  useDeleteJobWorkCompany,
} from '@/hooks/useJobWork';
import { JobWorkCompany } from '@/types/job-work.types';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';

interface VendorFormData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  creditDays: number;
  isActive: boolean;
}

const INITIAL_FORM: VendorFormData = {
  companyName: '',
  contactPerson: '',
  phone: '',
  email: '',
  gstin: '',
  address: '',
  creditDays: 30,
  isActive: true,
};

export default function JobWorkVendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedGstin, setCopiedGstin] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<JobWorkCompany | null>(null);
  const [formData, setFormData] = useState<VendorFormData>(INITIAL_FORM);

  const [deletingVendor, setDeletingVendor] = useState<JobWorkCompany | null>(null);

  // Queries & Mutations
  const { data: vendors = [], isLoading } = useJobWorkCompanies({ includeInactive: true });
  const createMutation = useCreateJobWorkCompany();
  const updateMutation = useUpdateJobWorkCompany();
  const deleteMutation = useDeleteJobWorkCompany();
  const { toast } = useToast();

  // Metrics calculation
  const totalVendors = vendors.length;
  const activeVendorsCount = vendors.filter((v) => v.isActive).length;
  const inactiveVendorsCount = totalVendors - activeVendorsCount;
  const vendorsWithOrders = vendors.filter(
    (v) => (v._count?.jobWorkOrders || 0) > 0 || (v._count?.jobWorkChallans || 0) > 0
  ).length;
  const avgCreditDays =
    totalVendors > 0
      ? Math.round(vendors.reduce((acc, v) => acc + (v.creditDays || 30), 0) / totalVendors)
      : 30;

  // Filter & Search
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? vendor.isActive
          : !vendor.isActive;

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        vendor.companyName?.toLowerCase().includes(q) ||
        vendor.contactPerson?.toLowerCase().includes(q) ||
        vendor.phone?.toLowerCase().includes(q) ||
        vendor.email?.toLowerCase().includes(q) ||
        vendor.gstin?.toLowerCase().includes(q) ||
        vendor.address?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [vendors, statusFilter, searchTerm]);

  // Handle open Create modal
  const handleOpenCreate = () => {
    setEditingVendor(null);
    setFormData(INITIAL_FORM);
    setIsFormModalOpen(true);
  };

  // Handle open Edit modal
  const handleOpenEdit = (vendor: JobWorkCompany) => {
    setEditingVendor(vendor);
    setFormData({
      companyName: vendor.companyName || '',
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      gstin: vendor.gstin || '',
      address: vendor.address || '',
      creditDays: vendor.creditDays ?? 30,
      isActive: vendor.isActive ?? true,
    });
    setIsFormModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast('Required Field', 'Please enter a valid Company / Mill Name', 'warning');
      return;
    }

    try {
      if (editingVendor) {
        await updateMutation.mutateAsync({
          id: editingVendor.id,
          payload: {
            ...formData,
            creditDays: Number(formData.creditDays) || 30,
          },
        });
        toast('Vendor Updated', `${formData.companyName} has been updated successfully`, 'success');
      } else {
        await createMutation.mutateAsync({
          ...formData,
          creditDays: Number(formData.creditDays) || 30,
        });
        toast('Vendor Created', `${formData.companyName} has been registered successfully`, 'success');
      }
      setIsFormModalOpen(false);
      setEditingVendor(null);
      setFormData(INITIAL_FORM);
    } catch (err: any) {
      toast('Operation Failed', err?.message || 'Failed to save vendor details', 'error');
    }
  };

  // Handle Quick Status Toggle
  const handleToggleStatus = async (vendor: JobWorkCompany) => {
    try {
      await updateMutation.mutateAsync({
        id: vendor.id,
        payload: { isActive: !vendor.isActive },
      });
      toast(
        'Status Changed',
        `${vendor.companyName} is now ${!vendor.isActive ? 'Active' : 'Inactive'}`,
        'success'
      );
    } catch (err: any) {
      toast('Failed', err?.message || 'Could not update status', 'error');
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingVendor) return;
    try {
      await deleteMutation.mutateAsync(deletingVendor.id);
      toast('Vendor Removed', `${deletingVendor.companyName} has been removed`, 'success');
      setDeletingVendor(null);
    } catch (err: any) {
      toast('Delete Failed', err?.message || 'Failed to delete vendor', 'error');
    }
  };

  // Copy GSTIN helper
  const handleCopyGstin = (gstin: string) => {
    navigator.clipboard.writeText(gstin);
    setCopiedGstin(gstin);
    toast('Copied', `GSTIN ${gstin} copied to clipboard`, 'success');
    setTimeout(() => setCopiedGstin(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Back to Job Work Hub"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Job Work Vendors & Processing Mills
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Partner Directory
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Register, edit, track credit terms, and manage subcontracting bleach houses, ginning mills, and partner vendors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/job-work" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 w-full justify-center">
              <span>Operations Hub</span>
            </Button>
          </Link>
          <Link href="/job-work/new" className="flex-1 sm:flex-initial">
            <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm w-full justify-center whitespace-nowrap font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>New Job Work Order</span>
            </Button>
          </Link>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm flex-1 sm:flex-initial justify-center whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Vendor</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">Total Registered</span>
            <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{totalVendors}</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">Vendors</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Active Partners</span>
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {activeVendorsCount}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">Operational</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Active Engagements</span>
            <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">{vendorsWithOrders}</span>
            <span className="text-[11px] text-muted-foreground font-mono">With Orders</span>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Avg Credit Terms</span>
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-foreground">{avgCreditDays}</span>
            <span className="text-[11px] text-muted-foreground font-mono">Days Average</span>
          </div>
        </Card>
      </div>

      {/* Toolbar: Search, Status Filter & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor name, person, phone, GSTIN, city..."
            className="pl-9 h-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-secondary/50 rounded-md p-0.5 border border-border">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({totalVendors})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-background text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active ({activeVendorsCount})
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                statusFilter === 'INACTIVE'
                  ? 'bg-background text-muted-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inactive ({inactiveVendorsCount})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-secondary/50 rounded-md p-0.5 border border-border">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'cards'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Vendor Listing */}
      {isLoading ? (
        <Card className="p-6 border-border space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="48px" className="w-full" />
          ))}
        </Card>
      ) : filteredVendors.length === 0 ? (
        <Card className="p-12 text-center border-border bg-card">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Vendors Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No registered vendors match your current search or filter criteria. Try clearing filters or searching for another term.'
              : 'You have not registered any Job Work partner companies or processing mills yet.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {(searchTerm || statusFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="text-xs h-8"
              >
                Clear Filters
              </Button>
            )}
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Vendor</span>
            </Button>
          </div>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 border-b border-border/70 text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 font-semibold">Vendor / Mill Name</th>
                  <th className="py-3 px-4 font-semibold">Contact Details</th>
                  <th className="py-3 px-4 font-semibold">GSTIN</th>
                  <th className="py-3 px-4 font-semibold">Location / Address</th>
                  <th className="py-3 px-4 font-semibold">Credit Terms</th>
                  <th className="py-3 px-4 font-semibold text-center">Orders Linked</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-secondary/20 transition-colors">
                    {/* Vendor Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {vendor.companyName?.charAt(0)?.toUpperCase() || 'V'}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block hover:underline cursor-pointer" onClick={() => handleOpenEdit(vendor)}>
                            {vendor.companyName}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ID: {vendor.id.slice(0, 8)} • Added {formatDate(vendor.createdAt)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-foreground block">
                          {vendor.contactPerson || '—'}
                        </span>
                        {vendor.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                            <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                            <a href={`tel:${vendor.phone}`} className="hover:underline">
                              {vendor.phone}
                            </a>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3 text-blue-500 shrink-0" />
                            <a href={`mailto:${vendor.email}`} className="hover:underline truncate max-w-[140px]">
                              {vendor.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* GSTIN */}
                    <td className="py-3 px-4">
                      {vendor.gstin ? (
                        <div className="flex items-center gap-1.5">
                          <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-secondary/80 text-foreground border border-border">
                            {vendor.gstin}
                          </code>
                          <button
                            onClick={() => handleCopyGstin(vendor.gstin!)}
                            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                            title="Copy GSTIN"
                          >
                            {copiedGstin === vendor.gstin ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Unregistered</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4 max-w-[200px]">
                      {vendor.address ? (
                        <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="truncate block" title={vendor.address}>
                            {vendor.address}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>

                    {/* Credit Terms */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        <Clock className="h-3 w-3" />
                        {vendor.creditDays} Days
                      </span>
                    </td>

                    {/* Activity / Orders */}
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/job-work?vendor=${vendor.id}`}
                        className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        title="View Orders for this Vendor"
                      >
                        <span>{vendor._count?.jobWorkOrders || 0} Orders</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(vendor)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          vendor.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        {vendor.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(vendor)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Vendor"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingVendor(vendor)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                          title="Delete / Deactivate Vendor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="p-4 bg-card border-border hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {vendor.companyName?.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                        {vendor.companyName}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Added {formatDate(vendor.createdAt)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(vendor)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      vendor.isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
                    }`}
                  >
                    {vendor.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs">
                  {vendor.contactPerson && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground">Contact:</span>
                      <span>{vendor.contactPerson}</span>
                    </div>
                  )}

                  {vendor.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                      <a href={`tel:${vendor.phone}`} className="hover:underline font-mono text-[11px]">
                        {vendor.phone}
                      </a>
                    </div>
                  )}

                  {vendor.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3 text-blue-500 shrink-0" />
                      <a href={`mailto:${vendor.email}`} className="hover:underline truncate max-w-[220px]">
                        {vendor.email}
                      </a>
                    </div>
                  )}

                  {vendor.address && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-[11px] line-clamp-2">{vendor.address}</span>
                    </div>
                  )}

                  {vendor.gstin && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-muted-foreground">GSTIN:</span>
                      <code className="text-[10px] font-mono px-1 py-0.5 rounded bg-secondary text-foreground">
                        {vendor.gstin}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                  <CreditCard className="h-3 w-3" />
                  {vendor.creditDays}d Credit
                </span>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/job-work?vendor=${vendor.id}`}
                    className="text-[11px] font-medium text-blue-600 hover:underline mr-1"
                  >
                    {vendor._count?.jobWorkOrders || 0} Orders
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(vendor)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingVendor(vendor)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE / EDIT VENDOR MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingVendor ? 'Edit Job Work Vendor Details' : 'Register New Job Work Vendor'}
        description={
          editingVendor
            ? `Update mill specifications and terms for ${editingVendor.companyName}`
            : 'Add an external bleaching mill, scouring facility, or subcontract processing company'
        }
        size="lg"
      >
        <form onSubmit={handleSaveVendor} className="space-y-4 pt-1">
          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Company / Mill Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Sri Lakshmi Bleaching & Scouring Works"
              className="h-9 text-xs"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Contact Person */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Contact Person / Manager</label>
              <Input
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Mr. Ramesh Kumar"
                className="h-9 text-xs"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. accounts@srilakshmi.com"
                className="h-9 text-xs"
              />
            </div>

            {/* GSTIN */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">GSTIN Number</label>
              <Input
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 33AABCS1429B1Z8"
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Credit Days */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Payment Credit Terms (Days)</label>
              <Input
                type="number"
                min="0"
                max="365"
                value={formData.creditDays}
                onChange={(e) => setFormData({ ...formData, creditDays: Number(e.target.value) })}
                placeholder="30"
                className="h-9 text-xs font-mono"
              />
              <span className="text-[10px] text-muted-foreground">Standard vendor payment credit window.</span>
            </div>

            {/* Status Toggle */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Operational Status</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-input text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="font-medium text-foreground">Active Vendor (Available for Jobs)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Facility / Mill Address</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. SF 142/2, Erode Ring Road, Perundurai SIPCOT, Erode - 638052"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <Check className="h-4 w-4" />
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingVendor
                ? 'Update Vendor'
                : 'Save & Register Vendor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE / DEACTIVATE CONFIRMATION MODAL */}
      {deletingVendor && (
        <Modal
          isOpen={!!deletingVendor}
          onClose={() => setDeletingVendor(null)}
          title="Confirm Vendor Removal"
          description="Are you sure you want to remove this vendor company?"
          size="md"
        >
          <div className="space-y-4 pt-1">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Removing {deletingVendor.companyName}</span>
              </div>
              <p className="text-muted-foreground">
                If this vendor has historical job orders, delivery challans, or cotton rolls linked, it will be safely de-activated instead of deleted to protect audit trail integrity.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingVendor(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {deleteMutation.isPending ? 'Processing...' : 'Confirm Remove'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
