'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthlyProductionItem } from '@/types/dashboard/dashboard.types';

interface MonthlyProductionChartProps {
  data?: MonthlyProductionItem[];
  height?: number;
}

export const MonthlyProductionChart: React.FC<MonthlyProductionChartProps> = ({
  data = [],
  height = 250,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-lg"
      >
        <p className="text-xs font-medium text-muted-foreground">No monthly production output recorded</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">Planned: 0 • Actual: 0 Units</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fill: '#888888', fontSize: 11 }} />
          <YAxis tick={{ fill: '#888888', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f4f4f5',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar dataKey="planned" name="Planned Output" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" name="Actual Production" fill="#3ECF8E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

