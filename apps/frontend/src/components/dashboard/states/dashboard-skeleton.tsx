import React from 'react';
import { Card } from '@/components/ui/card';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 10 Summary Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="p-4 flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-muted/60 rounded"></div>
              <div className="h-6 w-28 bg-muted/80 rounded"></div>
              <div className="h-2.5 w-24 bg-muted/40 rounded mt-3"></div>
            </div>
            <div className="h-9 w-9 bg-muted/80 rounded-lg"></div>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Row 1 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="h-5 w-48 bg-muted/70 rounded"></div>
          <div className="h-[250px] w-full bg-muted/30 rounded-lg"></div>
        </Card>
        <Card className="p-5 space-y-4">
          <div className="h-5 w-36 bg-muted/70 rounded"></div>
          <div className="h-[220px] w-full bg-muted/30 rounded-full mx-auto max-w-[200px]"></div>
        </Card>
      </div>

      {/* Analytics Charts Row 2 Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-4">
            <div className="h-5 w-40 bg-muted/70 rounded"></div>
            <div className="h-[240px] w-full bg-muted/30 rounded-lg"></div>
          </Card>
        ))}
      </div>

      {/* Tables & Widgets Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="h-5 w-52 bg-muted/70 rounded"></div>
          <div className="h-44 w-full bg-muted/30 rounded-lg"></div>
        </Card>
        <Card className="p-5 space-y-4">
          <div className="h-5 w-36 bg-muted/70 rounded"></div>
          <div className="h-44 w-full bg-muted/30 rounded-lg"></div>
        </Card>
      </div>
    </div>
  );
};
