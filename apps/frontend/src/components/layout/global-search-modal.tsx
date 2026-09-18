'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  LayoutDashboard,
  Package,
  Calculator,
  ShoppingBag,
  Briefcase,
  Layers,
  Sparkles,
  Scissors,
  FileSpreadsheet,
  Users,
  CalendarCheck,
  DollarSign,
  CreditCard,
  FileText,
  Settings,
  SunMedium,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { employeeService } from '@/services/employee.service';
import { jobWorkService } from '@/services/job-work.service';
import { rawMaterialsService } from '@/services/raw-materials.service';
import { customerOrdersService } from '@/services/customer-orders.service';

interface NavPage {
  id: string;
  type: 'page';
  title: string;
  url: string;
  description: string;
  category: 'Navigation' | 'Production' | 'HR & Payroll' | 'Sales & Materials';
  icon: React.ComponentType<{ className?: string }>;
}

const STATIC_PAGES: NavPage[] = [
  {
    id: 'page-dashboard',
    type: 'page',
    title: 'Executive Dashboard',
    url: '/dashboard',
    description: 'Real-time plant KPIs, production health & alerts',
    category: 'Navigation',
    icon: LayoutDashboard,
  },
  {
    id: 'page-job-work',
    type: 'page',
    title: 'Job Work Pipeline',
    url: '/job-work',
    description: 'Weaving & Bleaching outsource batches and returns',
    category: 'Production',
    icon: Briefcase,
  },
  {
    id: 'page-bleaching-prod',
    type: 'page',
    title: 'Bleaching Production',
    url: '/gauze-production/bleaching',
    description: 'Beam dyeing, peroxide bleaching & batch tracking',
    category: 'Production',
    icon: Sparkles,
  },
  {
    id: 'page-weaving-prod',
    type: 'page',
    title: 'Weaving Production',
    url: '/weaving-production',
    description: 'Loom monitoring, ends/reed/pick and output register',
    category: 'Production',
    icon: Layers,
  },
  {
    id: 'page-pad-pinning',
    type: 'page',
    title: 'Gauze Pad Pinning',
    url: '/gauze-production/pad-pinning',
    description: 'Folding, pinning & sterile packing lines',
    category: 'Production',
    icon: Scissors,
  },
  {
    id: 'page-gamjee',
    type: 'page',
    title: 'Gamjee Roll Production',
    url: '/gauze-production/gamjee',
    description: 'Cotton fleece layering & winding registry',
    category: 'Production',
    icon: FileSpreadsheet,
  },
  {
    id: 'page-moping-pad',
    type: 'page',
    title: 'Moping Pad Production',
    url: '/gauze-production/moping-pad',
    description: 'Surgical mop pad stitching, loop & wash lines',
    category: 'Production',
    icon: Layers,
  },
  {
    id: 'page-drying',
    type: 'page',
    title: 'Drying Operations',
    url: '/gauze-production/drying',
    description: 'Hydro-extraction, stenter chambers & moisture audits',
    category: 'Production',
    icon: SunMedium,
  },
  {
    id: 'page-materials',
    type: 'page',
    title: 'Materials & Products Master',
    url: '/raw-materials',
    description: 'Yarn, grey cloth, chemicals and stock balances',
    category: 'Sales & Materials',
    icon: Package,
  },
  {
    id: 'page-costing',
    type: 'page',
    title: 'Fabric & Bleaching Costing',
    url: '/fabric-costing',
    description: 'BOM calculations, warp/weft costs and chemical tariffs',
    category: 'Sales & Materials',
    icon: Calculator,
  },
  {
    id: 'page-orders',
    type: 'page',
    title: 'Customer Orders',
    url: '/customer-orders',
    description: 'Sales bookings, dispatch tracking & billing',
    category: 'Sales & Materials',
    icon: ShoppingBag,
  },
  {
    id: 'page-attendance',
    type: 'page',
    title: 'Daily Attendance & Shifts',
    url: '/attendance',
    description: 'Punch IN/OUT, OT hours, shortage tracking & IST clock',
    category: 'HR & Payroll',
    icon: CalendarCheck,
  },
  {
    id: 'page-salary',
    type: 'page',
    title: 'Salary & Payroll Engine',
    url: '/salary',
    description: 'Monthly & weekly payroll runs, shortage cuts & pay slips',
    category: 'HR & Payroll',
    icon: DollarSign,
  },
  {
    id: 'page-job-work-wages',
    type: 'page',
    title: 'Job Work Subcontractor Wages',
    url: '/salary/job-work',
    description: 'Subcontractor settlement & piece-rate reconciliations',
    category: 'HR & Payroll',
    icon: CreditCard,
  },
  {
    id: 'page-employees',
    type: 'page',
    title: 'Employee Directory',
    url: '/employees',
    description: 'Staff profiles, KYC documents & shift allocations',
    category: 'HR & Payroll',
    icon: Users,
  },
  {
    id: 'page-reports',
    type: 'page',
    title: 'Reports & Export Center',
    url: '/reports',
    description: 'Production yield, attendance, salary and ledger CSV/PDF exports',
    category: 'Navigation',
    icon: FileText,
  },
  {
    id: 'page-settings',
    type: 'page',
    title: 'System Settings',
    url: '/settings',
    description: 'Company profiles, user access roles & shift schedules',
    category: 'Navigation',
    icon: Settings,
  },
];

export interface SearchResultItem {
  id: string;
  type: 'page' | 'employee' | 'jobwork' | 'material' | 'order';
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);

  const [employees, setEmployees] = useState<SearchResultItem[]>([]);
  const [jobWorks, setJobWorks] = useState<SearchResultItem[]>([]);
  const [materials, setMaterials] = useState<SearchResultItem[]>([]);
  const [orders, setOrders] = useState<SearchResultItem[]>([]);

  // Filter Static Pages based on query
  const matchingPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATIC_PAGES.slice(0, 8);
    return STATIC_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q)
    );
  }, [query]);

  // Debounced API search for database entities
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setEmployees([]);
      setJobWorks([]);
      setMaterials([]);
      setOrders([]);
      setIsLoadingEntities(false);
      return;
    }

    setIsLoadingEntities(true);
    const timer = setTimeout(async () => {
      try {
        const [empRes, jwRes, matRes, ordRes] = await Promise.allSettled([
          employeeService.getAll({ search: q, limit: 4 }),
          jobWorkService.getAll({ search: q, limit: 4 }),
          rawMaterialsService.getAll({ search: q, limit: 4 }),
          customerOrdersService.getAll({ search: q, limit: 4 }),
        ]);

        if (empRes.status === 'fulfilled' && empRes.value?.items) {
          setEmployees(
            empRes.value.items.map((emp) => ({
              id: `emp-${emp.id}`,
              type: 'employee' as const,
              title: `${emp.firstName} ${emp.lastName}`,
              subtitle: `${emp.employeeCode} • ${emp.department?.name || 'Staff'} • ${emp.status}`,
              url: `/employees/${emp.id}`,
              badge: 'Employee',
              icon: Users,
            }))
          );
        } else {
          setEmployees([]);
        }

        if (jwRes.status === 'fulfilled' && jwRes.value?.items) {
          setJobWorks(
            jwRes.value.items.map((jw) => ({
              id: `jw-${jw.id}`,
              type: 'jobwork' as const,
              title: `Job Order #${jw.jobWorkNumber}`,
              subtitle: `${jw.jobWorkCompany?.companyName || 'Vendor'} • Process: ${jw.itemType || 'Job Work'} • ${jw.status}`,
              url: '/job-work',
              badge: 'Job Work',
              icon: Briefcase,
            }))
          );
        } else {
          setJobWorks([]);
        }

        if (matRes.status === 'fulfilled' && matRes.value?.items) {
          setMaterials(
            matRes.value.items.map((mat) => ({
              id: `mat-${mat.id}`,
              type: 'material' as const,
              title: mat.name,
              subtitle: `SKU: ${mat.sku} • Stock: ${mat.currentStockBalance} ${mat.unit?.abbreviation || 'units'} • ${mat.category?.name || 'Material'}`,
              url: '/raw-materials',
              badge: 'Material',
              icon: Package,
            }))
          );
        } else {
          setMaterials([]);
        }

        if (ordRes.status === 'fulfilled' && ordRes.value?.items) {
          setOrders(
            ordRes.value.items.map((ord) => ({
              id: `ord-${ord.id}`,
              type: 'order' as const,
              title: `Order #${ord.orderNumber}`,
              subtitle: `${ord.customer?.name || 'Client'} • Status: ${ord.status} • Total: ₹${Number(ord.totalAmount || 0).toLocaleString('en-IN')}`,
              url: '/customer-orders',
              badge: 'Sales Order',
              icon: ShoppingBag,
            }))
          );
        } else {
          setOrders([]);
        }
      } catch {
        // Suppress search failure gracefully
      } finally {
        setIsLoadingEntities(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Combined flat list for keyboard navigation
  const allResults: SearchResultItem[] = useMemo(() => {
    const pageResults: SearchResultItem[] = matchingPages.map((p) => ({
      id: p.id,
      type: 'page',
      title: p.title,
      subtitle: p.description,
      url: p.url,
      badge: p.category,
      icon: p.icon,
    }));

    return [
      ...pageResults,
      ...employees,
      ...jobWorks,
      ...materials,
      ...orders,
    ];
  }, [matchingPages, employees, jobWorks, materials, orders]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, allResults.length]);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      onClose();
      router.push(item.url);
    },
    [onClose, router]
  );

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % (allResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3 bg-secondary/30">
          <Search className="h-5 w-5 text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, employees, job work orders, raw materials, SKUs..."
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 font-sans"
          />
          {isLoadingEntities && (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-mono border border-border rounded bg-muted/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="overflow-y-auto p-2 sm:p-3 space-y-4 max-h-[60vh] divide-y divide-border/30"
        >
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm space-y-1">
              <p className="font-semibold text-foreground">No matches found for &quot;{query}&quot;</p>
              <p className="text-xs">Try searching for an employee name, job order number, material code or module.</p>
            </div>
          ) : (
            <>
              {/* Pages Section */}
              {matchingPages.length > 0 && (
                <div className="space-y-1 pb-2">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Navigation & Modules</span>
                    <span className="font-mono text-[10px]">{matchingPages.length}</span>
                  </div>
                  {matchingPages.map((page, idx) => {
                    const isSelected = selectedIndex === idx;
                    const Icon = page.icon;
                    return (
                      <div
                        key={page.id}
                        data-index={idx}
                        onClick={() =>
                          handleSelect({
                            id: page.id,
                            type: 'page',
                            title: page.title,
                            subtitle: page.description,
                            url: page.url,
                            badge: page.category,
                            icon: page.icon,
                          })
                        }
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-secondary/70 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-secondary text-blue-500'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate flex items-center gap-2">
                              <span>{page.title}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected
                                    ? 'border-white/30 text-white/90 bg-white/10'
                                    : 'border-border text-muted-foreground bg-secondary/50'
                                }`}
                              >
                                {page.category}
                              </span>
                            </div>
                            <p
                              className={`text-xs truncate ${
                                isSelected ? 'text-white/80' : 'text-muted-foreground'
                              }`}
                            >
                              {page.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'text-white translate-x-0.5' : 'text-muted-foreground opacity-40'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Employees Section */}
              {employees.length > 0 && (
                <div className="space-y-1 pt-2 pb-2">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Employees</span>
                    <span className="font-mono text-[10px]">{employees.length}</span>
                  </div>
                  {employees.map((emp, empIdx) => {
                    const globalIdx = matchingPages.length + empIdx;
                    const isSelected = selectedIndex === globalIdx;
                    const Icon = emp.icon || Users;
                    return (
                      <div
                        key={emp.id}
                        data-index={globalIdx}
                        onClick={() => handleSelect(emp)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-secondary/70 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-secondary text-emerald-500'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate flex items-center gap-2">
                              <span>{emp.title}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected
                                    ? 'border-white/30 text-white/90 bg-white/10'
                                    : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10'
                                }`}
                              >
                                {emp.badge}
                              </span>
                            </div>
                            <p
                              className={`text-xs truncate ${
                                isSelected ? 'text-white/80' : 'text-muted-foreground'
                              }`}
                            >
                              {emp.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'text-white translate-x-0.5' : 'text-muted-foreground opacity-40'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Job Works Section */}
              {jobWorks.length > 0 && (
                <div className="space-y-1 pt-2 pb-2">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Job Work Orders</span>
                    <span className="font-mono text-[10px]">{jobWorks.length}</span>
                  </div>
                  {jobWorks.map((jw, jwIdx) => {
                    const globalIdx = matchingPages.length + employees.length + jwIdx;
                    const isSelected = selectedIndex === globalIdx;
                    const Icon = jw.icon || Briefcase;
                    return (
                      <div
                        key={jw.id}
                        data-index={globalIdx}
                        onClick={() => handleSelect(jw)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-secondary/70 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-secondary text-indigo-500'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate flex items-center gap-2">
                              <span>{jw.title}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected
                                    ? 'border-white/30 text-white/90 bg-white/10'
                                    : 'border-indigo-500/20 text-indigo-500 bg-indigo-500/10'
                                }`}
                              >
                                {jw.badge}
                              </span>
                            </div>
                            <p
                              className={`text-xs truncate ${
                                isSelected ? 'text-white/80' : 'text-muted-foreground'
                              }`}
                            >
                              {jw.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'text-white translate-x-0.5' : 'text-muted-foreground opacity-40'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Raw Materials Section */}
              {materials.length > 0 && (
                <div className="space-y-1 pt-2 pb-2">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Raw Materials & Products</span>
                    <span className="font-mono text-[10px]">{materials.length}</span>
                  </div>
                  {materials.map((mat, matIdx) => {
                    const globalIdx =
                      matchingPages.length + employees.length + jobWorks.length + matIdx;
                    const isSelected = selectedIndex === globalIdx;
                    const Icon = mat.icon || Package;
                    return (
                      <div
                        key={mat.id}
                        data-index={globalIdx}
                        onClick={() => handleSelect(mat)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-secondary/70 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-secondary text-amber-500'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate flex items-center gap-2">
                              <span>{mat.title}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected
                                    ? 'border-white/30 text-white/90 bg-white/10'
                                    : 'border-amber-500/20 text-amber-500 bg-amber-500/10'
                                }`}
                              >
                                {mat.badge}
                              </span>
                            </div>
                            <p
                              className={`text-xs truncate ${
                                isSelected ? 'text-white/80' : 'text-muted-foreground'
                              }`}
                            >
                              {mat.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'text-white translate-x-0.5' : 'text-muted-foreground opacity-40'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Customer Orders Section */}
              {orders.length > 0 && (
                <div className="space-y-1 pt-2">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Customer Orders</span>
                    <span className="font-mono text-[10px]">{orders.length}</span>
                  </div>
                  {orders.map((ord, ordIdx) => {
                    const globalIdx =
                      matchingPages.length +
                      employees.length +
                      jobWorks.length +
                      materials.length +
                      ordIdx;
                    const isSelected = selectedIndex === globalIdx;
                    const Icon = ord.icon || ShoppingBag;
                    return (
                      <div
                        key={ord.id}
                        data-index={globalIdx}
                        onClick={() => handleSelect(ord)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-secondary/70 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-secondary text-rose-500'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate flex items-center gap-2">
                              <span>{ord.title}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSelected
                                    ? 'border-white/30 text-white/90 bg-white/10'
                                    : 'border-rose-500/20 text-rose-500 bg-rose-500/10'
                                }`}
                              >
                                {ord.badge}
                              </span>
                            </div>
                            <p
                              className={`text-xs truncate ${
                                isSelected ? 'text-white/80' : 'text-muted-foreground'
                              }`}
                            >
                              {ord.subtitle}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? 'text-white translate-x-0.5' : 'text-muted-foreground opacity-40'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-2.5 bg-secondary/50 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px]">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
