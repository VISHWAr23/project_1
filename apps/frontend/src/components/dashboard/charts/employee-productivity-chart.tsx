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
import { EmployeeProductivityItem } from '@/types/dashboard/dashboard.types';

interface EmployeeProductivityChartProps {
  data?: EmployeeProductivityItem[];
  height?: number;
}

export const EmployeeProductivityChart: React.FC<EmployeeProductivityChartProps> = ({
  data = [],
  height = 250,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-lg"
      >
        <p className="text-xs font-medium text-muted-foreground">No employee efficiency records</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">Efficiency: Nil</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="department" tick={{ fill: '#888888', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#888888', fontSize: 11 }} unit="%" />
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
          <Bar dataKey="efficiency" name="Efficiency Score %" fill="#A855F7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

