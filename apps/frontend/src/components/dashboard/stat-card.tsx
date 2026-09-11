import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  colorTheme?: 'blue' | 'purple' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'orange' | 'green' | 'indigo' | 'red';
  isLoading?: boolean;
}

const themeStyles = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  green: 'bg-green-500/10 text-green-500 border-green-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  colorTheme = 'emerald',
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-5 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-muted rounded"></div>
            <div className="h-6 w-32 bg-muted rounded"></div>
          </div>
          <div className="h-10 w-10 bg-muted rounded-lg"></div>
        </div>
        <div className="h-3 w-28 bg-muted rounded mt-4"></div>
      </Card>
    );
  }

  return (
    <Card hoverElevation className="p-3 sm:p-5 flex flex-col justify-between transition-all duration-200">
      <div className="flex justify-between items-start gap-1.5 sm:gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wide uppercase font-mono truncate">{title}</p>
          <h3 className="text-base sm:text-2xl font-bold text-foreground mt-0.5 sm:mt-1 font-mono tracking-tight truncate">{value}</h3>
        </div>
        <div className={clsx('p-2 sm:p-2.5 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0', themeStyles[colorTheme])}>
          {icon}
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-2.5 sm:mt-4 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 font-semibold font-mono shrink-0',
                trend.isPositive ? 'text-emerald-500' : 'text-rose-500',
              )}
            >
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            </span>
          )}
          {description && <span className="truncate">{description}</span>}
        </div>
      )}
    </Card>
  );
};
