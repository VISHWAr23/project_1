'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { LowStockItem } from '@/types/dashboard/dashboard.types';
import { useToast } from '@/components/ui/toast';

interface LowStockTableProps {
  items?: LowStockItem[];
  isLoading?: boolean;
}

export const LowStockTable: React.FC<LowStockTableProps> = ({
  items = [],
  isLoading = false,
}) => {
  const { toast } = useToast();

  const handleReorder = (sku: string) => {
    toast('Reorder Initiated', `Purchase requisition draft logged for ${sku}`, 'success');
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className={`h-4 w-4 ${items.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span>Low Stock Inventory Alerts</span>
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Raw materials below designated safety threshold
          </CardDescription>
        </div>
        <Badge variant={items.length > 0 ? 'warning' : 'outline'}>
          {items.length > 0 ? 'Action Required' : '0 Alerts'}
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
            All inventory balances are within safe threshold levels (0 alerts).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-mono">
                  <th className="p-3">SKU Code</th>
                  <th className="p-3">Material Name</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Safety Min</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="p-3 font-mono font-semibold text-[#2563EB]">{item.sku}</td>
                    <td className="p-3 font-medium truncate max-w-[180px]">{item.name}</td>
                    <td className="p-3 font-mono text-amber-500 font-bold">
                      {item.currentStockBalance} {item.unit}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">
                      {item.minimumStockLevel} {item.unit}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(item.sku)}
                        leftIcon={<ShoppingCart className="h-3 w-3" />}
                      >
                        Reorder
                      </Button>
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
