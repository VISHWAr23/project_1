'use client';

import React from 'react';
import { Search as SearchIcon, Command } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  onOpenModal?: () => void;
  shortcutKey?: string;
}

export function SearchInput({
  placeholder = 'Search SKUs, Employees, Orders...',
  shortcutKey = 'K',
  className = '',
  onOpenModal,
  onChange,
  onClick,
  ...props
}: SearchInputProps) {
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (onOpenModal) {
      e.preventDefault();
      onOpenModal();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      onClick={onOpenModal}
      className={`relative w-full max-w-md cursor-pointer group ${className}`}
    >
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        onClick={handleClick}
        readOnly={Boolean(onOpenModal)}
        className="w-full bg-secondary/60 text-foreground text-xs rounded-lg pl-9 pr-12 py-2 border border-border group-hover:border-blue-500/50 group-hover:bg-secondary/90 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-muted-foreground/60 cursor-pointer"
        {...props}
      />
      {shortcutKey && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-card/80 text-[10px] text-muted-foreground font-mono pointer-events-none group-hover:border-blue-500/40">
          <Command className="h-2.5 w-2.5" />
          <span>{shortcutKey}</span>
        </div>
      )}
    </div>
  );
}
