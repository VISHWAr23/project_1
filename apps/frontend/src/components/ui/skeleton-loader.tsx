'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  circle?: boolean;
}

export function Skeleton({ className = '', width, height, circle = false }: SkeletonProps) {
  return (
    <div
      style={{ width, height }}
      className={`relative overflow-hidden bg-muted/60 ${
        circle ? 'rounded-full' : 'rounded-md'
      } ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/30 to-transparent animate-shimmer" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-5 rounded-xl border border-border bg-card space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton width="40%" height="16px" />
        <Skeleton circle width="32px" height="32px" />
      </div>
      <Skeleton width="60%" height="28px" />
      <Skeleton width="50%" height="14px" />
    </div>
  );
}

export const SkeletonLoader = Skeleton;

