'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { SearchInput } from '@/components/ui/search';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Avatar } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Executive Dashboard',
  '/raw-materials': 'Materials & Products Master',
  '/fabric-costing': 'Fabric Production & Bleaching Costing',
  '/customer-orders': 'Customer Orders',
  '/job-work': 'Job Work Pipeline',
  '/job-work/bleaching/new': 'New Bleaching Job Work',
  '/weaving-production': 'Weaving Production',
  '/weaving-production/received': 'Weaving Received Products',
  '/job-work/vendors': 'Job Work Vendors & Processing Mills',
  '/vendors': 'Job Work Vendors & Processing Mills',
  '/employees': 'Employee Directory',
  '/attendance': 'Daily Attendance & Shifts',
  '/salary': 'Salary & Payroll Engine',
  '/salary/job-work': 'Job Work Subcontractor Wages',
  '/reports': 'Reports & Export Center',
  '/notifications': 'Notification Center',
  '/settings': 'System Settings',
};

export interface HeaderProps {
  onMobileMenuOpen?: () => void;
}

export default function Header({ onMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const currentPageLabel = ROUTE_LABELS[pathname] || 'Dashboard';

  return (
    <header className="h-14 bg-card border-b border-border px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 shadow-sm min-w-0">
      {/* Left: Mobile Menu Button & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0 flex items-center justify-center min-h-[38px] min-w-[38px]"
          title="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block shrink-0">
          <Breadcrumb items={[{ label: currentPageLabel }]} />
        </div>

        <div className="w-full max-w-[130px] xs:max-w-[180px] sm:max-w-md min-w-0">
          <SearchInput placeholder="Search..." />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        <div className="h-4 w-px bg-border hidden sm:block"></div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2">
          <Avatar name={user?.email || 'Admin'} size="sm" status="online" />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
              {user?.email || 'admin@manufacturing.com'}
            </p>
            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
