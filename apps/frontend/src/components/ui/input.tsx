'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, isPassword = false, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium text-foreground/80 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative rounded-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`w-full bg-secondary/50 text-foreground text-xs rounded-sm border border-border py-2.5 ${
              leftIcon ? 'pl-9' : 'pl-3'
            } ${
              isPassword ? 'pr-9' : 'pr-3'
            } placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#3ECF8E] focus:ring-1 focus:ring-[#3ECF8E] transition-colors ${
              error ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500' : ''
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
