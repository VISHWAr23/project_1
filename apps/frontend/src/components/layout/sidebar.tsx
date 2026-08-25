'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
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
import { AppLogo } from '@/components/ui/app-logo';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Materials & Products', href: '/raw-materials', icon: Package },
  { title: 'Job Work', href: '/job-work', icon: Truck, badge: 'Workflow' },
  { title: 'Employees', href: '/employees', icon: Users },
  { title: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { title: 'Salary & Payroll', href: '/salary', icon: CircleDollarSign },
  { title: 'Reports & Analytics', href: '/reports', icon: FileBarChart },
  { title: 'System Settings', href: '/settings', icon: Settings },
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
        <div
          className={`h-14 flex items-center border-b border-sidebar-border transition-all ${
            collapsed && !isMobile ? 'justify-center px-2' : 'justify-between px-3.5'
          }`}
        >
          <Link
            href="/dashboard"
            onClick={(e) => {
              if (isMobile) {
                if (onMobileClose) onMobileClose();
              } else if (collapsed) {
                e.preventDefault();
                setCollapsed(false);
              }
            }}
            className={`flex items-center min-w-0 shrink-0 hover:opacity-90 transition-opacity ${
              collapsed && !isMobile ? 'justify-center w-full' : 'gap-2.5'
            }`}
            title={collapsed && !isMobile ? 'Expand Sidebar' : 'Shri Lathikka Surgicals - Dashboard'}
          >
            <AppLogo size="sm" className="w-8 h-8 rounded-lg shrink-0 shadow-sm" />
            {(!collapsed || isMobile) && (
              <div className="whitespace-nowrap min-w-0">
                <h2 className="font-bold text-foreground text-sm leading-none tracking-tight truncate">
                  IMS Enterprise
                </h2>
                <span className="text-[10px] text-muted-foreground font-mono truncate block mt-0.5">
                  Shri Lathikka Surgicals
                </span>
              </div>
            )}
          </Link>
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
              title="Close Navigation"
            >
              <X className="h-5 w-5" />
            </button>
          ) : !collapsed ? (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
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
                className={`relative flex items-center ${
                  collapsed && !isMobile
                    ? 'justify-center px-0 w-full h-10'
                    : 'gap-3 px-2.5 py-2.5'
                } rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {(!collapsed || isMobile) && <span className="truncate flex-1">{item.title}</span>}
                {(!collapsed || isMobile) && item.badge && (
                  <span className="text-[9px] bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-sm font-mono font-bold">
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
                  <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {user?.role || 'ADMIN'}
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
        animate={{ width: collapsed ? 72 : 256 }}
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
