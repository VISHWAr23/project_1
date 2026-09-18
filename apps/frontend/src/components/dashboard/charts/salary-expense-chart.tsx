'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SalaryExpenseItem } from '@/types/dashboard/dashboard.types';

interface SalaryExpenseChartProps {
  data?: SalaryExpenseItem[];
  height?: number;
}

export const SalaryExpenseChart: React.FC<SalaryExpenseChartProps> = ({
  data = [],
  height = 250,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-lg"
      >
        <p className="text-xs font-medium text-muted-foreground">No payroll runs processed</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">Expense: ₹ 0.00</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNetSalary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fill: '#888888', fontSize: 11 }} />
          <YAxis
            tick={{ fill: '#888888', fontSize: 11 }}
            tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f4f4f5',
            }}
            formatter={(value: any) => [`₹ ${Number(value).toLocaleString()}`, 'Net Salary']}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Area
            type="monotone"
            dataKey="netSalary"
            name="Net Salary Expense"
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNetSalary)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

