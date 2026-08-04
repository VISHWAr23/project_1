import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp } from 'lucide-react';
import { StockStatus } from '@/types/raw-materials.types';

interface StockStatusBadgeProps {
  status: StockStatus;
}

export function StockStatusBadge({ status }: StockStatusBadgeProps) {
  switch (status) {
    case 'LOW_STOCK':
      return (
        <Badge variant="warning" icon={<AlertTriangle className="h-3 w-3" />}>
          Low Stock
        </Badge>
      );
    case 'OUT_OF_STOCK':
      return (
        <Badge variant="error" icon={<AlertOctagon className="h-3 w-3" />}>
          Out of Stock
        </Badge>
      );
    case 'OVERSTOCK':
      return (
        <Badge variant="info" icon={<TrendingUp className="h-3 w-3" />}>
          Overstock
        </Badge>
      );
    case 'OPTIMAL':
    default:
      return (
        <Badge variant="success" icon={<CheckCircle2 className="h-3 w-3" />}>
          Optimal
        </Badge>
      );
  }
}
