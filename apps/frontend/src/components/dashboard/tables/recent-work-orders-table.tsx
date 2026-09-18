'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck } from 'lucide-react';
import { RecentWorkOrder } from '@/types/dashboard/dashboard.types';

interface RecentWorkOrdersTableProps {
  items?: RecentWorkOrder[];
  isLoading?: boolean;
}

export const RecentWorkOrdersTable: React.FC<RecentWorkOrdersTableProps> = ({
  items = [],
  isLoading = false,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileCheck className="h-4 w-4 text-emerald-500" />
            <span>Recent Work Orders Log</span>
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Latest production work order submissions
          </CardDescription>
        </div>
        <Badge variant={items.length > 0 ? 'success' : 'outline'}>
          {items.length > 0 ? 'Live Log' : '0 Orders'}
        </Badge>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No completed work orders logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-mono">
                  <th className="p-3">Order #</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right font-mono">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="p-3 font-mono font-semibold text-purple-400">{item.workOrderNumber}</td>
                    <td className="p-3 font-medium truncate max-w-[160px]">{item.targetProductName}</td>
                    <td className="p-3">
                      <Badge variant={item.status === 'COMPLETED' ? 'success' : 'neutral'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-400">
                      {item.completedQuantity} Pcs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
