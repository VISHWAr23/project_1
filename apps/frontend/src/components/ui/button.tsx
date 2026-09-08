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
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap shrink-0';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
      md: 'px-4 py-2 text-xs gap-2 h-9',
      lg: 'px-5 py-2.5 text-sm gap-2 h-10',
    };

    const variantStyles = {
      primary:
        'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold shadow-sm border border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary border border-border shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700',
      ghost:
        'bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted active:bg-muted/80 dark:bg-transparent dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800/60',
      outline:
        'bg-card text-foreground border border-border hover:bg-muted hover:text-foreground shadow-2xs dark:bg-transparent dark:text-slate-200 dark:border-slate-700/80 dark:hover:bg-slate-800/60 dark:hover:text-white dark:hover:border-slate-600',
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold shadow-sm border border-rose-600',
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
          <Loader2 className="h-3.5 w-3.5 animate-spin text-current shrink-0" />
        ) : (
          leftIcon
        )}
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap leading-none text-inherit">{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
