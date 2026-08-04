'use client';

import React from 'react';
import { Search as SearchIcon, Command } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  shortcutKey?: string;
}

export function SearchInput({
  placeholder = 'Search SKUs, Employees, Orders...',
  shortcutKey = 'K',
  className = '',
  onChange,
  ...props
}: SearchInputProps) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className="w-full bg-secondary/60 text-foreground text-xs rounded-sm pl-9 pr-12 py-2 border border-border focus:outline-none focus:border-[#3ECF8E] focus:ring-1 focus:ring-[#3ECF8E] transition-colors placeholder:text-muted-foreground/60"
        {...props}
      />
      {shortcutKey && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm border border-border bg-muted/60 text-[10px] text-muted-foreground font-mono pointer-events-none">
          <Command className="h-2.5 w-2.5" />
          <span>{shortcutKey}</span>
        </div>
      )}
    </div>
  );
}
