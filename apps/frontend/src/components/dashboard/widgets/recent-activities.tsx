'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, Box, Send, FileText } from 'lucide-react';
import { DashboardActivity } from '@/types/dashboard/dashboard.types';

interface RecentActivitiesProps {
  items?: DashboardActivity[];
  isLoading?: boolean;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  items = [],
  isLoading = false,
}) => {
  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'DISBURSED':
        return <Box className="h-3.5 w-3.5 text-amber-500" />;
      case 'APPROVED':
        return <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />;
      case 'DISPATCHED':
        return <Send className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-[#2563EB]" />
          <span>Real-time Audit Activities</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Live stream of operational system actions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No recent ledger activities recorded (Nil).
          </p>
        ) : (
          <div className="relative border-l border-border/80 ml-3 space-y-4 py-1">
            {items.map((item) => (
              <div key={item.id} className="relative pl-5 group">
                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center">
                  {getActionIcon(item.action)}
                </div>
                <div className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{item.entityName}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.details}</p>
                  <span className="text-[10px] font-mono text-emerald-400/80 font-medium">
                    By {item.userName} ({item.userRole})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
