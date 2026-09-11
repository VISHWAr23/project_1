'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, CheckCircle2, History, Coins } from 'lucide-react';

export function SalaryNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      title: 'Employee Monthly Payroll',
      href: '/salary',
      icon: Users,
      isActive: pathname === '/salary',
    },
    {
      title: 'Job Work Subcontractor Wages',
      href: '/salary/job-work',
      icon: Coins,
      isActive: pathname === '/salary/job-work',
    },
    {
      title: 'Approvals',
      href: '/salary/approval',
      icon: CheckCircle2,
      isActive: pathname === '/salary/approval',
    },
    {
      title: 'Payment History',
      href: '/salary/history',
      icon: History,
      isActive: pathname === '/salary/history',
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto touch-scroll no-scrollbar select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        if (tab.isActive) {
          return (
            <button
              key={tab.href}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.title}
            </button>
          );
        }
        return (
          <Link key={tab.href} href={tab.href}>
            <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex items-center gap-1.5 shrink-0">
              <Icon className="h-3.5 w-3.5" />
              {tab.title}
            </button>
          </Link>
        );
      })}
    </div>
  );
}
