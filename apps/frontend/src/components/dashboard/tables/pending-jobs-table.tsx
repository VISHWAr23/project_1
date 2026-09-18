'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { PendingJobWorkOrder } from '@/types/dashboard/dashboard.types';

interface PendingJobsTableProps {
  items?: PendingJobWorkOrder[];
  isLoading?: boolean;
}

export const PendingJobsTable: React.FC<PendingJobsTableProps> = ({
  items = [],
  isLoading = false,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>Pending Work Orders</span>
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Active shop-floor orders awaiting completion
          </CardDescription>
        </div>
        <Badge variant="outline">{items.length} Active</Badge>
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
            No active or pending work orders (Nil).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-mono">
                  <th className="p-3">Order #</th>
                  <th className="p-3">Target Product</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="p-3 font-mono font-semibold text-blue-400">{item.workOrderNumber}</td>
                    <td className="p-3 font-medium truncate max-w-[160px]">{item.targetProductName}</td>
                    <td className="p-3">
                      <Badge
                        variant={
                          item.status === 'APPROVED'
                            ? 'success'
                            : item.status === 'PENDING_APPROVAL'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono font-semibold">
                      {item.completedQuantity} / {item.plannedQuantity}
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
