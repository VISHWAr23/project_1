'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MaterialUsageItem } from '@/types/dashboard/dashboard.types';

interface MaterialUsageChartProps {
  data?: MaterialUsageItem[];
  height?: number;
}

const defaultData: MaterialUsageItem[] = [
  { name: 'Raw Metals', value: 45, color: '#3ECF8E' },
  { name: 'Polymers', value: 25, color: '#3B82F6' },
  { name: 'Electrical', value: 15, color: '#F59E0B' },
  { name: 'Fasteners', value: 15, color: '#A855F7' },
];

export const MaterialUsageChart: React.FC<MaterialUsageChartProps> = ({
  data = defaultData,
  height = 220,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || ['#3ECF8E', '#3B82F6', '#F59E0B', '#A855F7'][index % 4]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f4f4f5',
            }}
            formatter={(value: any) => [`${value}%`, 'Share']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: item.color || ['#3ECF8E', '#3B82F6', '#F59E0B', '#A855F7'][idx % 4] }}
            />
            <span className="text-muted-foreground truncate">{item.name}:</span>
            <span className="font-mono font-bold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
