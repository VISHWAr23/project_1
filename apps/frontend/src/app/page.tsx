'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Users, Truck, Factory, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 selection:bg-[#3ECF8E]/30 selection:text-[#3ECF8E]">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto pb-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="bg-[#3ECF8E] text-[#0F1117] p-2.5 rounded-xl shadow-lg shadow-[#3ECF8E]/20">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-foreground">IMS Enterprise</h1>
            <p className="text-xs text-muted-foreground">Supabase Design Architecture</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" icon={<Activity className="h-3 w-3 animate-pulse" />}>
            System Online v1.0
          </Badge>
          <Link href="/login">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Access Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto my-auto py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Badge variant="info">Enterprise Manufacturing SaaS</Badge>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4 leading-tight text-foreground">
            Next-Gen Inventory & Manufacturing Control
          </h2>
          <p className="text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed">
            Digital operational platform for raw material cataloging, job work outsourcing tracking, shift attendance, dynamic payroll engine, and material disbursement work orders.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <Card hoverElevation className="p-4">
              <Package className="h-5 w-5 text-[#3ECF8E] mb-2" />
              <h3 className="font-semibold text-xs text-foreground">Raw Material Master</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Batch tracking & safety stock alerts</p>
            </Card>
            <Card hoverElevation className="p-4">
              <Truck className="h-5 w-5 text-purple-500 mb-2" />
              <h3 className="font-semibold text-xs text-foreground">Job Work Outsourcing</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Delivery challans & reconciliation</p>
            </Card>
            <Card hoverElevation className="p-4">
              <Users className="h-5 w-5 text-blue-500 mb-2" />
              <h3 className="font-semibold text-xs text-foreground">HR & Payroll Engine</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Daily shift attendance & pay slips</p>
            </Card>
            <Card hoverElevation className="p-4">
              <Factory className="h-5 w-5 text-amber-500 mb-2" />
              <h3 className="font-semibold text-xs text-foreground">Shop-Floor Work Orders</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Internal stock disbursement flow</p>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Card className="p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#3ECF8E]" /> System Platform Architecture
              </h3>
              <span className="text-xs text-[#3ECF8E] font-mono font-bold">READY</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground">@ims/database (Prisma ORM)</span>
                <span className="text-[#3ECF8E]">13 Schema Models Active</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground">@ims/validation (Zod)</span>
                <span className="text-[#3ECF8E]">Compiled Validation Rules</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground">apps/backend (NestJS REST API)</span>
                <span className="text-[#3ECF8E]">Port 4000 Prepared</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground">apps/frontend (Next.js 15)</span>
                <span className="text-[#3ECF8E]">Supabase Design Applied</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2">
        <p>© 2026 Enterprise Inventory Management System. All rights reserved.</p>
        <p className="font-mono">Built with Next.js 15, Prisma ORM, Framer Motion & Supabase UI Design</p>
      </footer>
    </div>
  );
}
