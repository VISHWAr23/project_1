'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { authService } from '@/services/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppLogo } from '@/components/ui/app-logo';
import { useTheme } from '@/providers/theme-provider';

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('admin@manufacturing.com');
  const [password, setPassword] = useState('Admin@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.login({ email, password });
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-500/20 selection:text-blue-600 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex justify-between items-center py-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Return to Landing Page
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
          title="Toggle Theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>
      </header>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full mx-auto my-auto space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center">
            <AppLogo size="lg" className="w-14 h-14 rounded-2xl shadow-xl shadow-blue-600/25" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Shri Lathikka Surgicals</h1>
            <p className="text-xs text-muted-foreground">
              Internal Enterprise Inventory Portal
            </p>
          </div>
        </div>

        {/* Clean Login Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@manufacturing.com"
              leftIcon={<Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
            />

            <div className="space-y-1.5 relative">
              <Input
                label="Account Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="font-bold shadow-lg shadow-blue-600/20"
            >
              Sign In to System
            </Button>
          </form>
        </div>

        <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Protected Session • JWT Security Encrypted
        </p>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-muted-foreground font-mono py-2">
        © 2026 Shri Lathikka Surgicals, Rajapalayam, Tamil Nadu.
      </footer>
    </div>
  );
}
