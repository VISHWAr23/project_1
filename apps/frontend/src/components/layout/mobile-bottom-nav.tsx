'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Truck,
  CalendarCheck,
  ShoppingCart,
  Menu,
} from 'lucide-react';

export interface MobileBottomNavProps {
  onOpenMoreMenu?: () => void;
}

const PRIMARY_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Materials', href: '/raw-materials', icon: Package },
  { label: 'Job Work', href: '/job-work', icon: Truck },
  { label: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { label: 'Orders', href: '/customer-orders', icon: ShoppingCart },
];

export function MobileBottomNav({ onOpenMoreMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-lg select-none pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5"
    >
      <div className="grid grid-cols-6 items-center px-1">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-0.5 text-center transition-colors relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-transform active:scale-95 ${
                  isActive ? 'bg-emerald-500/15' : ''
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-1 truncate max-w-[54px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </Link>
          );
        })}

        {/* More Menu Button */}
        <button
          type="button"
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center justify-center py-1 px-0.5 text-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          title="Open Full Navigation Menu"
        >
          <div className="p-1 rounded-full">
            <Menu className="h-4.5 w-4.5 shrink-0" />
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-1">Menu</span>
        </button>
      </div>
    </nav>
  );
}
