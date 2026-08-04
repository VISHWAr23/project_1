'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Badge({ variant = 'neutral', children, icon, className = '', ...props }: BadgeProps) {
  const variantStyles = {
    success: 'bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20 dark:bg-[#3ECF8E]/15 dark:text-[#3ECF8E] dark:border-[#3ECF8E]/30',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    error: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
    neutral: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-400/10 dark:text-slate-300 dark:border-slate-700',
    outline: 'bg-transparent text-muted-foreground border-border',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium border leading-none tracking-wide ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
