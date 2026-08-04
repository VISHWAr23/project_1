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

const defaultData: MonthlyProductionItem[] = [
  { month: 'Jan', planned: 4000, completed: 3800 },
  { month: 'Feb', planned: 4500, completed: 4200 },
  { month: 'Mar', planned: 4200, completed: 4100 },
  { month: 'Apr', planned: 5000, completed: 4850 },
  { month: 'May', planned: 4800, completed: 4700 },
  { month: 'Jun', planned: 5200, completed: 5100 },
  { month: 'Jul', planned: 5500, completed: 5400 },
  { month: 'Aug', planned: 5800, completed: 5650 },
];

export const MonthlyProductionChart: React.FC<MonthlyProductionChartProps> = ({
  data = defaultData,
  height = 250,
}) => {
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
