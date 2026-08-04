'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus } from 'lucide-react';
import { LatestEmployee } from '@/types/dashboard/dashboard.types';

interface LatestEmployeesProps {
  items?: LatestEmployee[];
  isLoading?: boolean;
}

const defaultItems: LatestEmployee[] = [
  {
    id: 'emp-1',
    employeeCode: 'EMP-112',
    fullName: 'Rajesh Verma',
    department: 'Quality Assurance',
    designation: 'Senior QA Inspector',
    joiningDate: '2026-08-01',
    status: 'ACTIVE',
  },
  {
    id: 'emp-2',
    employeeCode: 'EMP-111',
    fullName: 'Priya Sundaram',
    department: 'CNC Machining',
    designation: 'VMC Programmer',
    joiningDate: '2026-07-28',
    status: 'ACTIVE',
  },
  {
    id: 'emp-3',
    employeeCode: 'EMP-110',
    fullName: 'Amitabh Choudhury',
    department: 'Inventory & Logistics',
    designation: 'Store Keeper',
    joiningDate: '2026-07-20',
    status: 'ACTIVE',
  },
];

export const LatestEmployees: React.FC<LatestEmployeesProps> = ({
  items = defaultItems,
  isLoading = false,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-blue-500" />
          <span>Latest Onboarded Employees</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Newly registered staff and technicians
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/60 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold font-mono text-xs border border-blue-500/20 shrink-0">
                    {emp.fullName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{emp.fullName}</p>
                    <p className="text-[10px] text-muted-foreground">{emp.designation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {emp.department}
                  </Badge>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">{emp.joiningDate}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
