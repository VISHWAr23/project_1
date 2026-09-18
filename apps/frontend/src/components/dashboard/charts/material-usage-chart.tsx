'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MaterialUsageItem } from '@/types/dashboard/dashboard.types';

interface MaterialUsageChartProps {
  data?: MaterialUsageItem[];
  height?: number;
}

export const MaterialUsageChart: React.FC<MaterialUsageChartProps> = ({
  data = [],
  height = 220,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/60 rounded-lg"
      >
        <p className="text-xs font-medium text-muted-foreground">No material usage breakdown</p>
        <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">Share: Nil</p>
      </div>
    );
  }

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

