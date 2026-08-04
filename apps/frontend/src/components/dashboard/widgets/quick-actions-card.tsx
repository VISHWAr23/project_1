'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Package, Truck, FileText, ArrowUpRight, Plus, Layers } from 'lucide-react';

interface QuickActionsCardProps {
  onOpenMaterialIssueModal?: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onOpenMaterialIssueModal,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-purple-500" />
          <span>Quick Operational Workflows</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Direct triggers for frequent ERP operations
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1 space-y-2.5">
        {/* <button
          onClick={onOpenMaterialIssueModal}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary border border-border/80 text-xs text-foreground transition-all group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#3ECF8E]/10 text-[#3ECF8E]">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">New Material Issue</p>
              <p className="text-[10px] text-muted-foreground">Disburse raw materials to shop-floor</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-[#3ECF8E] transition-colors" />
        </button> */}

        {/* <a
          href="/raw-materials"
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary border border-border/80 text-xs text-foreground transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Raw Material Master</p>
              <p className="text-[10px] text-muted-foreground">Manage SKUs & Safety Thresholds</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
        </a> */}

        {/* <a
          href="/job-work"
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary border border-border/80 text-xs text-foreground transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-500">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Issue Delivery Challan</p>
              <p className="text-[10px] text-muted-foreground">Outsource to Job Work Vendor</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
        </a> */}

        <a
          href="/salary"
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 hover:bg-secondary border border-border/80 text-xs text-foreground transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">Run Monthly Payroll</p>
              <p className="text-[10px] text-muted-foreground">Generate Slips & Staff Payouts</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
        </a>
      </CardContent>
    </Card>
  );
};
