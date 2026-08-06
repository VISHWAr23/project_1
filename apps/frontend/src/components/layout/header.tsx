'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { SearchInput } from '@/components/ui/search';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Avatar } from '@/components/ui/avatar';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Executive Dashboard',
  '/raw-materials': 'Raw Materials Catalog',
  '/material-issue': 'Internal Material Issues',
  '/job-work': 'Job Work Outsourcing',
  '/employees': 'Employee Directory',
  '/attendance': 'Daily Attendance & Shifts',
  '/salary': 'Salary & Payroll Engine',
  '/reports': 'Reports & Export Center',
  '/settings': 'System Settings',
};

export interface HeaderProps {
  onMobileMenuOpen?: () => void;
}

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const currentPageLabel = ROUTE_LABELS[pathname] || 'Dashboard';

  return (
    <header className="h-14 bg-card border-b border-border px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 shadow-sm min-w-0">
      {/* Left: Mobile Menu Button & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block shrink-0">
          <Breadcrumb items={[{ label: currentPageLabel }]} />
        </div>

        <div className="w-full max-w-xs sm:max-w-md">
          <SearchInput placeholder="Search SKUs, Vendors..." />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-popover border border-border rounded-md shadow-2xl p-3.5 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-semibold text-foreground">Notifications</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">2 Unread</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-sm bg-secondary/50 border border-border/60">
                  <p className="font-medium text-foreground">Low Stock Alert: RM-ALU-001</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Aluminum Sheet stock below 120 Kg</p>
                </div>
                <div className="p-2 rounded-sm bg-secondary/50 border border-border/60">
                  <p className="font-medium text-foreground">Delivery Challan Reconciliation</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">DC-2026-0012 dispatched to Apex</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border hidden sm:block"></div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2">
          <Avatar name={user?.email || 'Admin'} size="sm" status="online" />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
              {user?.email || 'admin@manufacturing.com'}
            </p>
            <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {user?.role || 'SUPER_ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
