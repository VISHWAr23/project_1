'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@manufacturing.com');
  const [password, setPassword] = useState('Admin@12345');
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

  const setDemoRole = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Admin@12345');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 selection:bg-[#3ECF8E]/30 selection:text-[#3ECF8E]">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="max-w-md w-full space-y-5"
      >
        <div className="text-center">
          <div className="inline-flex bg-[#3ECF8E] p-2.5 rounded-sm text-[#0F1117] shadow-sm mb-3">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">IMS Enterprise Portal</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manufacturing Inventory & Operations Platform
          </p>
        </div>

        <div className="bg-card border border-border rounded-md p-5 shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded-sm bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
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
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Input
              label="Account Password"
              isPassword
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Button
              variant="primary"
              fullWidth
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="pt-3 border-t border-border">
            <p className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Quick Admin Credentials
            </p>
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              type="button"
              onClick={() => setDemoRole('admin@manufacturing.com')}
            >
              🔑 Load Demo Credentials (admin@manufacturing.com)
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-[#3ECF8E]" /> Protected by JWT & Prisma ORM
        </p>
      </motion.div>
    </div>
  );
}
