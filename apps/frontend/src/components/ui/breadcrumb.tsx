'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-semibold tracking-tight">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
