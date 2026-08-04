'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function ReportsPage() {
  const { toast } = useToast();

  const handleDownload = (reportName: string) => {
    toast('Generating Download', `Preparing ${reportName} (.xlsx)`, 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="border-b border-border pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Reports & Export Center</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Generate multi-sheet Excel reports and PDF financial/inventory audit ledgers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverElevation className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#3ECF8E]/10 text-[#3ECF8E] p-3 rounded-xl border border-[#3ECF8E]/20">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Stock Valuation Audit Report</h3>
              <p className="text-xs text-muted-foreground">
                FIFO valuation of raw materials and active batch ledger balance
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => handleDownload('Stock Valuation Audit')}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download Excel (.xlsx)
          </Button>
        </Card>

        <Card hoverElevation className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-xl border border-purple-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Job Work Loss Reconciliation</h3>
              <p className="text-xs text-muted-foreground">
                Vendor material balances, return records, and scrap loss summary
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => handleDownload('Job Work Loss Reconciliation')}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download Excel (.xlsx)
          </Button>
        </Card>
      </div>
    </motion.div>
  );
}
