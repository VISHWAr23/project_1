'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { MasterEntityDropdown } from '@/components/ui/master-entity-dropdown';
import { useJobWorkOrderDetail, useIssueJobWorkMaterials } from '@/hooks/useJobWork';
import { MultiRollIssueTable, RollIssueRow } from '@/components/job-work/multi-roll-issue-table';
import Link from 'next/link';

const STANDARD_ITEM_TYPES = ['22x16', '23x17', '28x27', '22x14'];

const STANDARD_OUTPUT_WIDTHS = [
  '30cm x 30cm - 6 ply',
  '30cm x 30cm - 8 ply',
  '30cm x 30cm - 12 ply',
  '25cm x 25cm - 8 ply',
  '25cm x 25cm - 12 ply',
];

export default function IssueMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: order, isLoading } = useJobWorkOrderDetail(id);
  const issueMutation = useIssueJobWorkMaterials();

  // Transport & Delivery
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [remarks, setRemarks] = useState('');

  // Notebook Parameters (Top 4 Red Circle Data)
  const [dcNo, setDcNo] = useState('05');
  const [dcDate, setDcDate] = useState(new Date().toISOString().split('T')[0]);
  const [ends, setEnds] = useState('1140');
  const [itemType, setItemType] = useState('22x14');
  const [outputProductWidth, setOutputProductWidth] = useState('30cm x 30cm - 8 ply');

  const [rows, setRows] = useState<RollIssueRow[]>([
    {
      id: 'r1',
      rollNumber: 'ROLL-RM-1001',
      unitWeight: 50,
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
      toast('Delivery Person Required', 'Delivery Person name is required for Delivery Challan', 'warning');
      return;
    }

    const totalQty = rows.reduce((sum, r) => sum + (Number(r.issuedQty) || 0), 0);
    if (totalQty > stockBalance) {
      toast('Stock Exceeded', `Cannot issue ${totalQty} units. Available stock: ${stockBalance}`, 'error');
      return;
    }

    const finalItemType = itemType;
    const finalWidth = outputProductWidth;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `ims_job_work_meta_${order.id}`,
          JSON.stringify({
            dcNo,
            dcDate,
            ends,
            itemType: finalItemType,
            outputProductWidth: finalWidth,
            deliveryPerson: driverName,
            vehicleNumber,
          })
        );
      }

      const updated = await issueMutation.mutateAsync({
        id: order.id,
        payload: {
          vehicleNumber,
          driverName,
          deliveryPerson: driverName,
          dcNo,
          dcDate,
          ends,
          itemType: finalItemType,
          outputProductWidth: finalWidth,
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
      className="space-y-6 w-full"
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
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Issue Materials & Generate Delivery Challan
            </h1>
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

        {/* Notebook Parameters Card (Top 4 Red Circle Data) */}
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Jobwork Notebook Parameters (DC, Ends, Item Type & Output Width)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Notebook Specs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. DC Number */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                D.C. No. <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. 05"
                value={dcNo}
                onChange={(e) => setDcNo(e.target.value)}
                required
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Challan reference (e.g. D.C. No. 05)
              </span>
            </div>

            {/* DC Date */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                D.C. Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={dcDate}
                onChange={(e) => setDcDate(e.target.value)}
                required
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                Challan dispatch / issue date
              </span>
            </div>

            {/* 2. Ends */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Ends <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. 1140"
                value={ends}
                onChange={(e) => setEnds(e.target.value)}
                required
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                e.g. 1140 or 1140 E
              </span>
            </div>

            {/* 3. Item Type */}
            <div>
              <MasterEntityDropdown
                label="Item Type (Mesh / Construction)"
                value={itemType}
                onChange={setItemType}
                storageKey="jobwork_item_types"
                options={STANDARD_ITEM_TYPES.map((t) => ({ value: t, label: t }))}
                placeholder="Select Construction / Mesh..."
                hint="Weave construction (e.g. 22x14, 22x16)"
                required
              />
            </div>
          </div>

          {/* 4. Width of output product (Only for Moping Pad) */}
          <div className="pt-3 border-t border-border/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <MasterEntityDropdown
                  label="Width of Output Product (Only for Moping Pad)"
                  value={outputProductWidth}
                  onChange={setOutputProductWidth}
                  storageKey="moping_pad_output_widths"
                  options={STANDARD_OUTPUT_WIDTHS.map((w) => ({ value: w, label: w }))}
                  placeholder="Select Output Size & Ply..."
                  hint="Notebook specification for moping pad conversion"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Transport & Carrier Particulars Card */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Truck className="h-4 w-4 text-primary" />
            Transport & Delivery Particulars (Job Working Carrier)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Delivery Person / Driver Name *"
              placeholder="e.g. Ramesh Kumar"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              required
            />
            <Input
              label="Vehicle Registration Number *"
              placeholder="e.g. TN-38-BZ-4412"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
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
