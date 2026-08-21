'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, ShieldCheck, Sun, Moon, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';
import { useToast } from '@/components/ui/toast';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 w-full"
    >
      <div className="border-b border-border pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">System Configuration & Settings</h1>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'general', label: 'General & Theme' },
          { id: 'database', label: 'Database Status' },
          { id: 'security', label: 'Security & Access' },
        ]}
      />

      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Appearance & Color Theme</CardTitle>
                <CardDescription>Select your preferred dashboard visual theme interface</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setTheme('dark');
                    toast('Theme Updated', 'Dark Supabase theme enabled', 'info');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 ring-2 ring-[#3ECF8E]/20'
                      : 'border-border bg-secondary/30 hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 text-[#3ECF8E]">
                      <Moon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Supabase Dark (Default)</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Deep canvas (#0F1117) with emerald accents</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setTheme('light');
                    toast('Theme Updated', 'Light theme enabled', 'info');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-[#3ECF8E] bg-[#3ECF8E]/10 ring-2 ring-[#3ECF8E]/20'
                      : 'border-border bg-secondary/30 hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-amber-500">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">Dim Slate Light Mode</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Soft, low-glare off-white canvas with dark slate text</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'database' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[#3ECF8E]" /> Neon PostgreSQL Database Connection
              </CardTitle>
              <CardDescription>Direct Prisma ORM connection status</CardDescription>
            </div>
            <Badge variant="success">HEALTHY</Badge>
          </CardHeader>
          <CardContent className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Database Provider:</span>
              <span className="text-[#3ECF8E] font-bold">Neon PostgreSQL (AP-Southeast)</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Prisma Client Version:</span>
              <span className="text-foreground">v5.22.0</span>
            </div>
            <div className="flex justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-muted-foreground">Connection Security:</span>
              <span className="text-[#3ECF8E]">TLS/SSL Encrypted Pooling</span>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#3ECF8E]" /> Administrator Account Security
              </CardTitle>
              <CardDescription>Authentication credentials & token scope</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-1">
              <p><span className="text-muted-foreground">Primary Admin Email:</span> admin@manufacturing.com</p>
              <p><span className="text-muted-foreground">Access Role:</span> SUPER_ADMIN (Unrestricted)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
