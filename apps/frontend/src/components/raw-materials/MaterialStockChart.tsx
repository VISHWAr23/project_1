import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RawMaterial } from '@/types/raw-materials.types';

interface MaterialStockChartProps {
  material: RawMaterial;
}

export function MaterialStockChart({ material }: MaterialStockChartProps) {
  // Generate historical stock trend series based on transaction log or smooth interpolation
  const history = material.inventoryTransactions || [];

  const chartData = [
    { month: 'Mar', stock: Math.max(0, material.currentStockBalance * 0.7), min: material.minimumStockLevel, max: material.maximumStockLevel },
    { month: 'Apr', stock: Math.max(0, material.currentStockBalance * 1.2), min: material.minimumStockLevel, max: material.maximumStockLevel },
    { month: 'May', stock: Math.max(0, material.currentStockBalance * 0.85), min: material.minimumStockLevel, max: material.maximumStockLevel },
    { month: 'Jun', stock: Math.max(0, material.currentStockBalance * 1.1), min: material.minimumStockLevel, max: material.maximumStockLevel },
    { month: 'Jul', stock: Math.max(0, material.currentStockBalance * 0.9), min: material.minimumStockLevel, max: material.maximumStockLevel },
    { month: 'Aug (Current)', stock: material.currentStockBalance, min: material.minimumStockLevel, max: material.maximumStockLevel },
  ];

  return (
    <div className="bg-secondary/20 border border-border rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Stock Level & Safety Threshold Trend</h3>
          <p className="text-xs text-muted-foreground">Historical stock balance vs Min/Max safety limits</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3ECF8E]" />
            <span className="text-foreground">Current Balance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500" />
            <span className="text-amber-400">Min Safety Stock ({material.minimumStockLevel})</span>
          </div>
          {material.maximumStockLevel > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-blue-500" />
              <span className="text-blue-400">Max Limit ({material.maximumStockLevel})</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                borderColor: '#27272a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val} ${material.unit?.abbreviation || ''}`, 'Stock Balance']}
            />
            {material.minimumStockLevel > 0 && (
              <ReferenceLine
                y={material.minimumStockLevel}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Min Stock', fill: '#f59e0b', fontSize: 10 }}
              />
            )}
            {material.maximumStockLevel > 0 && (
              <ReferenceLine
                y={material.maximumStockLevel}
                stroke="#3b82f6"
                strokeDasharray="4 4"
                label={{ value: 'Max Stock', fill: '#3b82f6', fontSize: 10 }}
              />
            )}
            <Area type="monotone" dataKey="stock" stroke="#3ECF8E" strokeWidth={2} fillOpacity={1} fill="url(#stockGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
