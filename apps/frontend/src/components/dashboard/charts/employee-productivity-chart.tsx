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
import { EmployeeProductivityItem } from '@/types/dashboard/dashboard.types';

interface EmployeeProductivityChartProps {
  data?: EmployeeProductivityItem[];
  height?: number;
}

const defaultData: EmployeeProductivityItem[] = [
  { department: 'Machining', efficiency: 94, unitsProduced: 4200, hoursLogged: 160 },
  { department: 'Assembly', efficiency: 88, unitsProduced: 3800, hoursLogged: 152 },
  { department: 'Quality', efficiency: 98, unitsProduced: 5100, hoursLogged: 168 },
  { department: 'Packaging', efficiency: 91, unitsProduced: 4600, hoursLogged: 160 },
];

export const EmployeeProductivityChart: React.FC<EmployeeProductivityChartProps> = ({
  data = defaultData,
  height = 250,
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="department" tick={{ fill: '#888888', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#888888', fontSize: 11 }} unit="%" />
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
          <Bar dataKey="efficiency" name="Efficiency Score %" fill="#A855F7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
