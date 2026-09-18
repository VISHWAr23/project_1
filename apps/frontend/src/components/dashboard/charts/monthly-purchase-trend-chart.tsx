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

export const MonthlyPurchaseTrendChart: React.FC<MonthlyPurchaseTrendChartProps> = ({
  data = [],
  height = 250,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-lg"
      >
        <p className="text-xs font-medium text-muted-foreground">No procurement purchase orders recorded</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">Spend: ₹ 0.00 • Orders: 0</p>
      </div>
    );
  }

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

