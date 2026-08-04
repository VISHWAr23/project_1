'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function SalarySettingsPage() {
  const { toast } = useToast();
  const [workingDays, setWorkingDays] = useState(26);
  const [ptMinSalary, setPtMinSalary] = useState(15000);
  const [ptTaxAmount, setPtTaxAmount] = useState(200);
  const [pfEmployeeRate, setPfEmployeeRate] = useState(12);
  const [esiEmployeeRate, setEsiEmployeeRate] = useState(0.75);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Settings Saved', 'Salary & Tax calculation rules updated successfully', 'success');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <Link href="/salary">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} className="px-2" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Payroll & Tax Rule Configuration</h1>
          <p className="text-xs text-muted-foreground">Standard working days, Professional Tax, PF and ESI parameters</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Settings className="h-4 w-4 text-[#3ECF8E]" />
            Industrial Working Days Rules
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Standard Working Days / Month
              </label>
              <Input
                type="number"
                value={workingDays}
                onChange={(e) => setWorkingDays(Number(e.target.value))}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Used to compute daily wage rate = Base Wage ÷ Working Days</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            Statutory Deductions (PT, PF & ESI)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Professional Tax Threshold (Gross ₹)
              </label>
              <Input
                type="number"
                value={ptMinSalary}
                onChange={(e) => setPtMinSalary(Number(e.target.value))}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">PT applies if Gross Salary &gt; Threshold</p>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Professional Tax Deduction (₹)
              </label>
              <Input
                type="number"
                value={ptTaxAmount}
                onChange={(e) => setPtTaxAmount(Number(e.target.value))}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Fixed monthly tax amount</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">PF Employee Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={pfEmployeeRate}
                onChange={(e) => setPfEmployeeRate(Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">ESI Employee Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={esiEmployeeRate}
                onChange={(e) => setEsiEmployeeRate(Number(e.target.value))}
                className="text-xs"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Link href="/salary">
            <Button type="button" variant="ghost" size="sm">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="h-4 w-4" />}>
            Save Rule Settings
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
