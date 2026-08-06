'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-xs font-medium text-foreground/80">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full appearance-none bg-secondary/50 text-foreground text-xs rounded-sm border border-border px-3 py-2.5 pr-8 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && <p className="text-[11px] text-rose-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
