import React from 'react';
import { Users, FileText, CheckCircle, DollarSign, ArrowUpRight, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SalaryDashboardSummary } from '@/types/salary.types';

interface SalaryKpiCardsProps {
  summary?: SalaryDashboardSummary;
  isLoading?: boolean;
}

export function SalaryKpiCards({ summary, isLoading }: SalaryKpiCardsProps) {
  const kpis = summary?.kpis || {
    activeEmployees: 0,
    totalRuns: 0,
    pendingApprovals: 0,
    approvedRuns: 0,
    totalGrossSalary: 0,
    totalDeductions: 0,
    totalBonus: 0,
    totalNetPayout: 0,
  };

  const cards = [
    {
      title: 'Active Staff Processed',
      value: isLoading ? '...' : kpis.activeEmployees,
      subtext: `${kpis.totalRuns} Total Payroll Runs`,
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Pending Approvals',
      value: isLoading ? '...' : kpis.pendingApprovals,
      subtext: 'Awaiting Admin Signoff',
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Approved Payroll Payouts',
      value: isLoading ? '...' : kpis.approvedRuns,
      subtext: 'Ready for Disbursement',
      icon: CheckCircle,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      title: 'Total Net Payout (YTD)',
      value: isLoading ? '...' : `₹ ${kpis.totalNetPayout.toLocaleString('en-IN')}`,
      subtext: `Gross: ₹ ${kpis.totalGrossSalary.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-[#2563EB]',
      bg: 'bg-[#2563EB]/10',
    },
    {
      title: 'Total Bonus & Incentives',
      value: isLoading ? '...' : `₹ ${kpis.totalBonus.toLocaleString('en-IN')}`,
      subtext: 'Performance Rewards',
      icon: Award,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Total Statutory Deductions',
      value: isLoading ? '...' : `₹ ${kpis.totalDeductions.toLocaleString('en-IN')}`,
      subtext: 'PF, ESI & Professional Tax',
      icon: TrendingUp,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="p-3 sm:p-4 relative overflow-hidden border border-border/60 hover:border-border transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium truncate">{c.title}</p>
                <h3 className="text-base sm:text-xl font-bold font-mono text-foreground mt-0.5 sm:mt-1 tracking-tight truncate">
                  {c.value}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 font-mono truncate mt-1 hidden xs:block">
                  {c.subtext}
                </p>
              </div>
              <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${c.bg} ${c.color} shrink-0`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
