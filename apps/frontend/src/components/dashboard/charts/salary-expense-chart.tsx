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
const defaultData: SalaryExpenseItem[] = [
  { month: 'Mar', baseSalary: 950000, deductions: 45000, netSalary: 990000 },
  { month: 'Apr', baseSalary: 980000, deductions: 48000, netSalary: 1024000 },
  { month: 'May', baseSalary: 1020000, deductions: 51000, netSalary: 1074000 },
  { month: 'Jun', baseSalary: 1050000, deductions: 53000, netSalary: 1107000 },
  { month: 'Jul', baseSalary: 1100000, deductions: 56000, netSalary: 1169000 },
  { month: 'Aug', baseSalary: 1150000, deductions: 58000, netSalary: 1222000 },
];

export const SalaryExpenseChart: React.FC<SalaryExpenseChartProps> = ({
  data = defaultData,
  height = 250,
}) => {
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
