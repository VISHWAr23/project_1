'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface ChartProps {
  data: any[];
  height?: number;
  dataKey: string;
  categoryKey?: string;
  color?: string;
  secondaryColor?: string;
}

const SUPABASE_PALETTE = ['#3ECF8E', '#3B82F6', '#F59E0B', '#A855F7', '#EC4899', '#14B8A6'];

export function SupabaseAreaChart({
  data,
  height = 250,
  dataKey,
  categoryKey = 'name',
  color = '#3ECF8E',
}: ChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 120, 140, 0.15)" vertical={false} />
          <XAxis
            dataKey={categoryKey}
            stroke="#8E96A0"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#8E96A0" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1B1F26',
              borderColor: '#2A2F3A',
              borderRadius: '8px',
              color: '#EDEDED',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SupabaseBarChart({
  data,
  height = 250,
  dataKey,
  categoryKey = 'name',
  color = '#3ECF8E',
}: ChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 120, 140, 0.15)" vertical={false} />
          <XAxis dataKey={categoryKey} stroke="#8E96A0" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#8E96A0" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1B1F26',
              borderColor: '#2A2F3A',
              borderRadius: '8px',
              color: '#EDEDED',
              fontSize: '12px',
              fontFamily: 'monospace',
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SupabaseDonutChart({
  data,
  height = 250,
  dataKey = 'value',
  categoryKey = 'name',
}: Omit<ChartProps, 'dataKey'> & { dataKey?: string }) {
  return (
    <div style={{ width: '100%', height }} className="flex items-center justify-center">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1B1F26',
              borderColor: '#2A2F3A',
              borderRadius: '8px',
              color: '#EDEDED',
              fontSize: '12px',
            }}
          />
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey={dataKey}
            nameKey={categoryKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SUPABASE_PALETTE[index % SUPABASE_PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
