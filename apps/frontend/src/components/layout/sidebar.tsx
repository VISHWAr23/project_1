'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  Users,
  CalendarCheck,
  CircleDollarSign,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  // { title: 'Roll Engine', href: '/roll-tracking', icon: Layers, badge: 'ERP' },
  // { title: 'Job Work & Material Issue', href: '/job-work', icon: Truck, badge: 'Workflow' },
  // { title: 'Raw Materials', href: '/raw-materials', icon: Package },
  { title: 'Employees', href: '/employees', icon: Users },
  { title: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { title: 'Salary & Payroll', href: '/salary', icon: CircleDollarSign },
  // { title: 'Reports & Analytics', href: '/reports', icon: FileBarChart },
  // { title: 'System Settings', href: '/settings', icon: Settings },
];

export interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full select-none">
      <div>
        {/* Header / Brand */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-sidebar-border">
          <Link
            href="/dashboard"
            onClick={isMobile ? onMobileClose : undefined}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="bg-[#3ECF8E] text-[#0F1117] p-1.5 rounded-sm font-bold shadow-sm shrink-0">
              <Package className="h-5 w-5" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="whitespace-nowrap">
                <h2 className="font-bold text-foreground text-sm leading-none tracking-tight">
                  IMS Enterprise
                </h2>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Supabase Mobile Ready
                </span>
              </div>
            )}
          </Link>
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-130px)]">
          {(!collapsed || isMobile) && (
            <div className="px-2.5 py-1.5 text-[10px] font-mono font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Platform Navigation
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onMobileClose : undefined}
                title={collapsed && !isMobile ? item.title : undefined}
                className={`relative flex items-center gap-3 px-2.5 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3ECF8E]/10 text-[#3ECF8E] font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-[#3ECF8E] rounded-r-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#3ECF8E]' : ''}`} />
                {(!collapsed || isMobile) && <span className="truncate flex-1">{item.title}</span>}
                {(!collapsed || isMobile) && item.badge && (
                  <span className="text-[9px] bg-[#3ECF8E]/20 text-[#3ECF8E] px-1.5 py-0.5 rounded-sm font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile */}
      <div className="p-2.5 border-t border-sidebar-border">
        {!collapsed || isMobile ? (
          <div className="space-y-2">
            <div className="p-2 rounded-sm bg-secondary/40 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar name={user?.email || 'Admin'} size="sm" status="online" />
                <div className="truncate">
                  <p className="text-xs font-medium text-foreground truncate">
                    {user?.email || 'admin@manufacturing.com'}
                  </p>
                  <p className="text-[10px] font-mono text-[#3ECF8E] font-semibold">
                    {user?.role || 'SUPER_ADMIN'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isMobile && onMobileClose) onMobileClose();
                  logout();
                }}
                title="Sign Out"
                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-secondary rounded-sm transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-secondary rounded-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile < md) */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex bg-sidebar border-r border-sidebar-border flex-col justify-between h-screen sticky top-0 shrink-0 z-40 overflow-hidden"
      >
        {navContent(false)}
      </motion.aside>

      {/* Mobile Drawer (visible when mobileOpen is true on < md screens) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[80vw] bg-sidebar border-r border-sidebar-border h-full z-10 overflow-hidden shadow-2xl"
            >
              {navContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
