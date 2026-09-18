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
import { InventoryStatusItem } from '@/types/dashboard/dashboard.types';

interface InventoryStatusChartProps {
  data?: InventoryStatusItem[];
  height?: number;
}

export const InventoryStatusChart: React.FC<InventoryStatusChartProps> = ({
  data = [],
  height = 250,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-lg"
      >
        <p className="text-xs font-medium text-muted-foreground">No inventory stock records</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">Stock: 0 SKUs</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="category" tick={{ fill: '#888888', fontSize: 11 }} />
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
          <Bar dataKey="inStock" name="In Stock" stackId="a" fill="#3ECF8E" radius={[0, 0, 0, 0]} />
          <Bar dataKey="lowStock" name="Low Stock" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
          <Bar dataKey="outOfStock" name="Out of Stock" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

