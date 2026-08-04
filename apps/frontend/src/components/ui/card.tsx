'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverElevation?: boolean;
}

export function Card({ children, className = '', hoverElevation = true, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={hoverElevation ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`rounded-md bg-card border border-border shadow-sm text-foreground transition-all duration-200 overflow-hidden ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 sm:p-5 border-b border-border/80 flex items-center justify-between ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-sm font-semibold tracking-tight text-foreground ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs text-muted-foreground mt-0.5 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-3.5 bg-muted/30 border-t border-border/80 flex items-center justify-between text-xs ${className}`}>{children}</div>;
}
