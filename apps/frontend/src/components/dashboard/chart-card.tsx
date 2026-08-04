import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChartCardProps {
  title: string;
  description?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  badgeText,
  badgeVariant = 'outline',
  icon,
  action,
  children,
  isLoading = false,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {icon}
            <span>{title}</span>
          </CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
          {action}
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1">
        {isLoading ? (
          <div className="h-[240px] w-full bg-muted/40 animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground">
            Loading Chart Data...
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
