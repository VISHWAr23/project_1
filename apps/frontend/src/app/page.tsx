'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
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
import { AppLogo } from '@/components/ui/app-logo';
import { useTheme } from '@/providers/theme-provider';

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen min-h-dvh w-full overflow-y-auto bg-[#0B0F17] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-emerald-500/20 selection:text-emerald-400 font-sans">
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-3 border-b border-slate-800/60">
        <div className="flex items-center space-x-3.5">
          <AppLogo size="md" className="w-10 h-10 rounded-xl shadow-md shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Shri Lathikka Surgicals
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#132d1d] text-[#4ade80] border border-[#1f5c35] font-bold tracking-wider">
                RAJAPALAYAM
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#628471] font-mono flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3 w-3 text-[#4ade80] shrink-0" />
              <span>Samsigapuram, Virudhunagar Dist, Tamil Nadu</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3 pt-1 sm:pt-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0e1d33] border border-[#1c3c66] text-[#38bdf8] text-xs font-semibold font-mono shadow-sm">
            <Activity className="h-3.5 w-3.5 text-[#38bdf8] animate-pulse" />
            <span>System Online</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#141b28] hover:bg-[#1b2436] text-slate-200 transition-colors border border-slate-800 h-9 w-9 flex items-center justify-center shadow-sm"
            title="Toggle Light / Dark Theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-[#4ade80]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area - Split Hero Layout */}
      <main className="max-w-7xl w-full mx-auto my-auto py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0e2719] border border-[#1b5532] text-[#4ade80] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-[#4ade80]" />
            <span>Enterprise Operations System</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Shri Lathikka Surgicals
            </h2>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#4ade80] leading-tight">
              Operations Platform
            </h2>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            Established in 2006 in Rajapalayam, Tamil Nadu, Shri Lathikka Surgicals is a premier manufacturer and supplier of hospital-grade Medi Bath wipes, 400g absorbent cotton rolls, sterile gauze bandages, Gamjee rolls, and surgical clothing.
          </p>

          {/* 3 Core Operations Feature Badges in single horizontal row */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-[#111723] px-3.5 py-2.5 rounded-lg border border-slate-800 whitespace-nowrap shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0" />
              <span>Raw Materials Master</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-[#111723] px-3.5 py-2.5 rounded-lg border border-slate-800 whitespace-nowrap shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0" />
              <span>Job Work Outsourcing</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-[#111723] px-3.5 py-2.5 rounded-lg border border-slate-800 whitespace-nowrap shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-[#4ade80] shrink-0" />
              <span>HR & Shift Payroll</span>
            </div>
          </div>

          {/* Compact glowing Sign In Button */}
          <div className="pt-2">
            <Link href="/login" className="inline-block">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#53a426] hover:bg-[#5db82b] active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-[0_4px_24px_rgba(83,164,38,0.45)] hover:shadow-[0_4px_32px_rgba(83,164,38,0.6)] transition-all duration-200 cursor-pointer"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Right Column: Facility System Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="p-5 sm:p-6 rounded-xl border border-slate-800/80 bg-[#0e141f] shadow-2xl space-y-4 max-w-lg ml-auto w-full">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-[#4ade80]" />
                <h3 className="font-bold text-sm text-white tracking-tight">Facility System Status</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#4ade80] bg-[#0e2719] px-2 py-0.5 rounded border border-[#1b5532] tracking-wider uppercase">
                ACTIVE
              </span>
            </div>

            {/* Status Rows */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#121927]/60 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-2.5">
                  <Layers className="h-3.5 w-3.5 text-[#4ade80]" />
                  <span>Inventory Engine</span>
                </span>
                <span className="text-[#4ade80] font-semibold">Active Sync</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#121927]/60 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-2.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span>Manufacturing Quality</span>
                </span>
                <span className="text-[#38bdf8] font-semibold">ISO 13485</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#121927]/60 border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-2.5">
                  <Building2 className="h-3.5 w-3.5 text-[#c084fc]" />
                  <span>Rajapalayam Unit</span>
                </span>
                <span className="text-[#c084fc] font-semibold">Ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-4 pb-2 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-mono gap-2 text-center sm:text-left">
        <p>© 2026 Shri Lathikka Surgicals, Rajapalayam, Tamil Nadu. All rights reserved.</p>
        <p className="text-[11px]">Internal Enterprise Inventory & Operations System</p>
      </footer>
    </div>
  );
}
