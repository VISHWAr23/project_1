'use client';

import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = <PackageOpen className="h-10 w-10 text-muted-foreground/60" />,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card/40 my-4">
      <div className="p-3 rounded-full bg-secondary mb-4">{icon}</div>
      <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
