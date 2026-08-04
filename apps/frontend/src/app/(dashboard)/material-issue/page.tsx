'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Clock, CheckCircle2, Truck, ArrowRight, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, Column } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

interface MaterialIssue {
  id: string;
  ref: string;
  targetProduct: string;
  material: string;
  qty: string;
  jobWorker: string;
  status: 'Pending Approval' | 'Approved & Issued' | 'Disbursed';
  date: string;
}

const mockIssues: MaterialIssue[] = [
  {
    id: '1',
    ref: 'JW-2026-0042',
    targetProduct: 'Bleached Gauze Roll (Subcontracting)',
    material: 'Grey Fabric Roll (48" x 500m)',
    qty: '450.0 Kg (10 Rolls)',
    jobWorker: 'Sri Lakshmi Bleaching Works',
    status: 'Approved & Issued',
    date: '2026-08-04',
  },
  {
    id: '2',
    ref: 'JW-2026-0043',
    targetProduct: 'Bleached Bandage Gauze',
    material: 'Raw Cotton Bale Grade A',
    qty: '1,200.0 Kg (25 Bales)',
    jobWorker: 'Kannan Weaving Mill',
    status: 'Pending Approval',
    date: '2026-08-04',
  },
];

export default function MaterialIssuePage() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<MaterialIssue>[] = [
    {
      key: 'ref',
      header: 'Job Work / WO Ref',
      sortable: true,
      render: (row) => (
        <Link href="/job-work" className="font-mono font-bold text-[#3ECF8E] hover:underline block">
          {row.ref}
        </Link>
      ),
    },
    {
      key: 'targetProduct',
      header: 'Target Product',
      render: (row) => (
        <div>
          <span className="font-medium text-foreground block">{row.targetProduct}</span>
          <span className="text-[11px] text-muted-foreground font-mono">Vendor: {row.jobWorker}</span>
        </div>
      ),
    },
    {
      key: 'material',
      header: 'Cotton Material Requested',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-[#3ECF8E]" />
          <span className="text-foreground font-medium">{row.material}</span>
        </div>
      ),
    },
    {
      key: 'qty',
      header: 'Quantity Issued',
      render: (row) => <span className="font-mono text-foreground font-bold">{row.qty}</span>,
    },
    {
      key: 'status',
      header: 'Workflow Stage',
      render: (row) =>
        row.status === 'Pending Approval' ? (
          <Badge variant="warning" icon={<Clock className="h-3 w-3" />}>
            Step 1: Requisition Pending
          </Badge>
        ) : (
          <Badge variant="success" icon={<CheckCircle2 className="h-3 w-3" />}>
            Step 2: Material Issued
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: '1-Tap Action',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === 'Pending Approval' ? (
            <Button
              variant="primary"
              size="sm"
              className="text-xs"
              onClick={() => toast('Stock Approved', `Approved issue for ${row.ref}`, 'success')}
            >
              Approve Material Issue
            </Button>
          ) : (
            <Link href="/job-work">
              <Button variant="outline" size="sm" className="text-xs text-[#3ECF8E] border-[#3ECF8E]/40">
                View SDLC Card →
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Integrated Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-[#3ECF8E]" />
            Material Issue & Requisitions
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Raw cotton & fabric roll allocation for Job Work Subcontracting and Floor Production.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="outline" size="sm" leftIcon={<Truck className="h-3.5 w-3.5" />}>
              Open Job Work Board
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            New Requisition
          </Button>
        </div>
      </div>

      {/* Integration Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#3ECF8E] text-[#0F1117] shrink-0">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Unified Job Work & Material Issue Workflow</h4>
            <p className="text-muted-foreground mt-0.5">
              Material Issue is directly integrated into Job Work Orders (Stage 2 of 5). Issuing rolls automatically updates Job Work Challans.
            </p>
          </div>
        </div>
        <Link href="/job-work">
          <Button variant="primary" size="sm" className="shrink-0 text-xs" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Go to SDLC Board
          </Button>
        </Link>
      </div>

      {/* Requisitions Table */}
      <div className="rounded-2xl bg-card border border-border/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between font-mono">
          <h3 className="text-sm font-bold text-foreground">Active Material Issue Requisitions</h3>
          <span className="text-xs text-muted-foreground font-semibold">2 Active Requisitions</span>
        </div>
        <Table columns={columns} data={mockIssues} keyExtractor={(row) => row.id} />
      </div>

      {/* Modal: Create Requisition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Request Material Disbursement"
        description="Submit a cotton roll requisition for job work subcontracting"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsModalOpen(false);
            toast('Requisition Submitted', 'Material issue submitted for review', 'info');
          }}
          className="space-y-4 font-mono text-xs"
        >
          <Input label="Job Work / Work Order Reference" placeholder="JW-2026-0044" required />
          <Select
            label="Subcontractor Vendor Unit"
            options={[
              { label: 'Sri Lakshmi Bleaching Works', value: 'VENDOR-01' },
              { label: 'Kannan Weaving Mill', value: 'VENDOR-02' },
            ]}
          />
          <Select
            label="Material Required"
            options={[
              { label: 'Grey Fabric Roll (48" x 500m)', value: 'RM-GREY-01' },
              { label: 'Raw Cotton Bale Grade A', value: 'RM-[#3ECF8E]-02' },
            ]}
          />
          <Input label="Quantity / Weight Required (Kg)" placeholder="500 Kg" required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Requisition
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
