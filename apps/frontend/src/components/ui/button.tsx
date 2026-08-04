'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3ECF8E]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'px-2.5 py-1.5 text-xs gap-1.5',
      md: 'px-3.5 py-2 text-xs gap-2',
      lg: 'px-4 py-2.5 text-sm gap-2',
    };

    const variantStyles = {
      primary:
        'bg-[#3ECF8E] hover:bg-[#34B27B] text-[#0F1117] font-semibold shadow-sm border border-[#3ECF8E]',
      secondary:
        'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-slate-700/60 dark:border-slate-700',
      ghost:
        'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-100 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
      outline:
        'bg-transparent hover:bg-slate-800/40 text-slate-300 border border-slate-700/80 hover:border-slate-600 dark:border-[#2A2F3A] dark:hover:border-slate-600',
      danger:
        'bg-rose-600/90 hover:bg-rose-500 text-white shadow-sm border border-rose-500/50',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
