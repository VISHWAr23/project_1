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

const defaultData: InventoryStatusItem[] = [
  { category: 'Raw Metals', inStock: 180, lowStock: 3, outOfStock: 0 },
  { category: 'Polymers', inStock: 95, lowStock: 2, outOfStock: 1 },
  { category: 'Electrical', inStock: 60, lowStock: 1, outOfStock: 0 },
  { category: 'Fasteners', inStock: 120, lowStock: 1, outOfStock: 0 },
];

export const InventoryStatusChart: React.FC<InventoryStatusChartProps> = ({
  data = defaultData,
  height = 250,
}) => {
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
