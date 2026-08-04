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
} from 'recharts';
import { DailyProductionTrendItem } from '@/types/dashboard/dashboard.types';

interface DailyProductionTrendChartProps {
  data?: DailyProductionTrendItem[];
  height?: number;
}

const defaultData: DailyProductionTrendItem[] = [
  { date: '01 Aug', units: 1200 },
  { date: '02 Aug', units: 1350 },
  { date: '03 Aug', units: 1450 },
  { date: '04 Aug', units: 1400 },
  { date: '05 Aug', units: 1520 },
  { date: '06 Aug', units: 1600 },
  { date: '07 Aug', units: 1480 },
];

export const DailyProductionTrendChart: React.FC<DailyProductionTrendChartProps> = ({
  data = defaultData,
  height = 250,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDailyUnits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: '#888888', fontSize: 11 }} />
          <YAxis tick={{ fill: '#888888', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f4f4f5',
            }}
            formatter={(value: any) => [`${value} Units`, 'Daily Output']}
          />
          <Area
            type="monotone"
            dataKey="units"
            name="Units Output"
            stroke="#3ECF8E"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDailyUnits)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
