'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface DashboardErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const DashboardErrorCard: React.FC<DashboardErrorCardProps> = ({
  title = 'Failed to Load Executive Dashboard',
  message = 'An unexpected network error occurred while connecting to backend APIs or live ledger tables.',
  onRetry,
}) => {
  return (
    <Card className="border-rose-500/30 bg-rose-500/5 p-6 text-center my-6">
      <CardHeader className="pb-2">
        <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 mb-2">
          <AlertCircle className="h-6 w-6" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
          {message}
        </CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry Connection
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
