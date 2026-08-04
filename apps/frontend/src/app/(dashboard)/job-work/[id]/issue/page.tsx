'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useJobWorkOrderDetail, useIssueJobWorkMaterials } from '@/hooks/useJobWork';
import { MultiRollIssueTable, RollIssueRow } from '@/components/job-work/multi-roll-issue-table';
import Link from 'next/link';

export default function IssueMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: order, isLoading } = useJobWorkOrderDetail(id);
  const issueMutation = useIssueJobWorkMaterials();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [remarks, setRemarks] = useState('');

  const [rows, setRows] = useState<RollIssueRow[]>([
    {
      id: 'r1',
      rollNumber: 'ROLL-RM-1001',
      issuedWeight: 50,
      issuedQty: 1,
      remarks: '',
    },
  ]);

  if (isLoading || !order) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-sm">
        Loading Job Work Order Details...
      </div>
    );
  }

  const stockBalance = Number(order.rawMaterial?.currentStockBalance) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleNumber) {
      toast('Vehicle Required', 'Transport vehicle number is required for Delivery Challan', 'warning');
      return;
    }

    if (!driverName) {
      toast('Driver Required', 'Driver name is required for Delivery Challan', 'warning');
      return;
    }

    const totalQty = rows.reduce((sum, r) => sum + (Number(r.issuedQty) || 0), 0);
    if (totalQty > stockBalance) {
      toast('Stock Exceeded', `Cannot issue ${totalQty} units. Available stock: ${stockBalance}`, 'error');
      return;
    }

    try {
      const updated = await issueMutation.mutateAsync({
        id: order.id,
        payload: {
          vehicleNumber,
          driverName,
          remarks,
          items: rows.map((r) => ({
            rollNumber: r.rollNumber,
            issuedWeight: Number(r.issuedWeight),
            issuedQty: Number(r.issuedQty),
            remarks: r.remarks,
          })),
        },
      });

      toast('Materials Issued Successfully', `Stock deducted and Delivery Challan ${updated.challanNumber || ''} generated!`, 'success');
      router.push(`/job-work/${order.id}/challan`);
    } catch (err: any) {
      toast('Issue Failed', err.message || 'Unable to issue materials', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/job-work/${order.id}`}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Order
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Issue Materials & Generate Delivery Challan (Step 2)
            </h1>
            <p className="text-xs text-muted-foreground">
              Dispatch raw material rolls to vendor premises and automatically update stock ledger.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details Header Card */}
        <Card className="p-5 bg-card border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block">Job Work Order</span>
            <span className="font-mono font-bold text-primary text-sm">{order.jobWorkNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Job Working Vendor</span>
            <span className="font-semibold text-foreground text-sm">{order.jobWorkCompany?.companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Raw Material Stock</span>
            <span className="font-mono font-semibold text-emerald-400 text-sm">
              {order.rawMaterial?.name} ({stockBalance} {order.rawMaterial?.unit?.abbreviation || 'Units'} available)
            </span>
          </div>
        </Card>

        {/* Transport & Carrier Particulars Card */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <FileText className="h-4 w-4 text-primary" />
            Transport & Delivery Particulars
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Vehicle Registration Number *"
              placeholder="e.g. MH-04-EK-9821"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
            />
            <Input
              label="Driver / Carrier Name *"
              placeholder="e.g. Ramesh Kumar"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Challan Special Instructions / Remarks"
            placeholder="Handling guidelines, E-Way Bill reference..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </Card>

        {/* Dynamic Multi-Roll Issue Table Card */}
        <Card className="p-5 bg-card border-border">
          <MultiRollIssueTable
            rows={rows}
            onChange={setRows}
            maxAvailableStock={stockBalance}
          />
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/job-work/${order.id}`}>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            type="submit"
            isLoading={issueMutation.isPending}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Dispatch & Generate Delivery Challan
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
