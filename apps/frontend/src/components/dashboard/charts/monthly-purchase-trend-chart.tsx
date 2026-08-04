'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthlyPurchaseTrendItem } from '@/types/dashboard/dashboard.types';

interface MonthlyPurchaseTrendChartProps {
  data?: MonthlyPurchaseTrendItem[];
  height?: number;
}

const defaultData: MonthlyPurchaseTrendItem[] = [
  { month: 'Mar', purchaseAmount: 1850000, ordersCount: 24 },
  { month: 'Apr', purchaseAmount: 2100000, ordersCount: 28 },
  { month: 'May', purchaseAmount: 1950000, ordersCount: 22 },
  { month: 'Jun', purchaseAmount: 2400000, ordersCount: 31 },
  { month: 'Jul', purchaseAmount: 2650000, ordersCount: 35 },
  { month: 'Aug', purchaseAmount: 2800000, ordersCount: 38 },
];

export const MonthlyPurchaseTrendChart: React.FC<MonthlyPurchaseTrendChartProps> = ({
  data = defaultData,
  height = 250,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fill: '#888888', fontSize: 11 }} />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#888888', fontSize: 11 }}
            tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
          />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#888888', fontSize: 11 }} />
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
          <Bar
            yAxisId="left"
            dataKey="purchaseAmount"
            name="Procurement Spend (₹)"
            fill="#6366F1"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ordersCount"
            name="PO Count"
            stroke="#F59E0B"
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
