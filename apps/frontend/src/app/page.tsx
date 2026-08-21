'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  ShieldCheck,
  ArrowRight,
  Building2,
  Activity,
  Layers,
  Sun,
  Moon,
  MapPin,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/ui/app-logo';
import { useTheme } from '@/providers/theme-provider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col justify-between p-4 sm:p-8 selection:bg-blue-500/20 selection:text-blue-600 font-sans">
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto flex justify-between items-center pb-4 border-b border-border/60">
        <div className="flex items-center space-x-3">
          <AppLogo size="md" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-600/25 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight text-foreground">
                Shri Lathikka Surgicals
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                Rajapalayam
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
              <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" /> Samsigapuram, Virudhunagar Dist, Tamil Nadu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="info" icon={<Activity className="h-3 w-3 animate-pulse" />}>
            System Online
          </Badge>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
            title="Toggle Light / Dark Theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area - Split Hero Layout */}
      <main className="max-w-7xl w-full mx-auto my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Intro Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" /> Enterprise Operations System
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              Shri Lathikka Surgicals{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400">
                Operations Platform
              </span>
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
              Established in 2006 in Rajapalayam, Tamil Nadu, Shri Lathikka Surgicals is a premier manufacturer and supplier of hospital-grade Medi Bath wipes, 400g absorbent cotton rolls, sterile gauze bandages, Gamjee rolls, and surgical clothing.
            </p>
          </div>

          {/* Quick Core Operations Feature Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-secondary/50 p-2.5 rounded-lg border border-border">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" /> Raw Materials Master
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-secondary/50 p-2.5 rounded-lg border border-border">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" /> Job Work Outsourcing
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-secondary/50 p-2.5 rounded-lg border border-border">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" /> HR & Shift Payroll
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4">
            <Link href="/login">
              <Button
                variant="primary"
                size="lg"
                className="shadow-xl shadow-blue-600/20 font-bold"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <Card className="p-6 shadow-2xl border-border bg-card/90 backdrop-blur-md relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-foreground">Facility System Status</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Inventory Engine
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">Active Sync</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Manufacturing Quality
                </span>
                <span className="text-indigo-500 font-semibold">ISO 13485</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-purple-500" /> Rajapalayam Unit
                </span>
                <span className="text-purple-500 font-semibold">Ready</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-4 border-t border-border/60 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground font-mono gap-2">
        <p>© 2026 Shri Lathikka Surgicals, Rajapalayam, Tamil Nadu. All rights reserved.</p>
        <p className="text-[11px]">Internal Enterprise Inventory & Operations System</p>
      </footer>
    </div>
  );
}
