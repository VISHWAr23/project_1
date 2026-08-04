'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="p-3 sm:p-5 md:p-6 flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>
    </div>
  );
}
