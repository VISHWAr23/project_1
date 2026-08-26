'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useReceiveBleaching } from '@/hooks/useGauzeProduction';
import { GauzeProductionBatch, GauzeBleachingJobItem } from '@/types/gauze-production.types';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ReceiveBleachingModalProps {
  batch: GauzeProductionBatch;
  isOpen: boolean;
  onClose: () => void;
  defaultJobId?: string;
  jobs?: GauzeBleachingJobItem[];
  onSuccess?: () => void;
}

export function ReceiveBleachingModal({
  batch,
  isOpen,
  onClose,
  defaultJobId,
  jobs: passedJobs,
  onSuccess,
}: ReceiveBleachingModalProps) {
  const { toast } = useToast();
  const receiveMutation = useReceiveBleaching();

  // Find active or selected job
  const jobs = passedJobs || batch.bleachingJobs || [];
  const [selectedJobId, setSelectedJobId] = useState(defaultJobId || jobs[jobs.length - 1]?.id || '');

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[jobs.length - 1];

  const [quantityReceived, setQuantityReceived] = useState<number>(0);
  const [wastageQuantity, setWastageQuantity] = useState<number>(0);
  const [rejectedQuantity, setRejectedQuantity] = useState<number>(0);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [qualityStatus, setQualityStatus] = useState('PASSED');
  const [notes, setNotes] = useState('');

  // Set default received quantity to sent quantity
  useEffect(() => {
    if (activeJob) {
      const sent = Number(activeJob.quantitySent);
      setQuantityReceived(sent);
      setWastageQuantity(0);
      setRejectedQuantity(0);
      setSelectedJobId(activeJob.id);
    }
  }, [activeJob?.id]);

  const sentQty = activeJob ? Number(activeJob.quantitySent) : 0;
  const totalAccounted = Number(quantityReceived || 0) + Number(wastageQuantity || 0) + Number(rejectedQuantity || 0);
  const discrepancy = sentQty - totalAccounted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      toast('Required Field', 'No active bleaching job selected', 'warning');
      return;
    }
    if (quantityReceived < 0 || wastageQuantity < 0 || rejectedQuantity < 0) {
      toast('Invalid Quantity', 'Quantities cannot be negative', 'warning');
      return;
    }
    if (quantityReceived === 0 && wastageQuantity === 0 && rejectedQuantity === 0) {
      toast('Required Field', 'Please enter at least received quantity or wastage', 'warning');
      return;
    }

    try {
      await receiveMutation.mutateAsync({
        batchId: batch.id,
        payload: {
          bleachingJobId: selectedJobId,
          quantityReceived: Number(quantityReceived),
          wastageQuantity: Number(wastageQuantity || 0),
          rejectedQuantity: Number(rejectedQuantity || 0),
          receivedDate,
          qualityStatus: qualityStatus as any,
          notes: notes || undefined,
        },
      });

      toast('Success', 'Bleaching return and inspection registered successfully', 'success');
      onSuccess ? onSuccess() : onClose();
    } catch (err: any) {
      toast('Error', err.message || 'Failed to record bleaching receipt', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Bleached Material Back from Vendor"
      description={`Batch ${batch.batchNumber} — Bleaching Return Registration`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Job Selection if multiple */}
        {jobs.length > 1 && (
          <Select
            label="Select Bleaching Dispatch Job"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            options={jobs.map((j) => ({
              value: j.id,
              label: `${j.jobNumber} — ${j.vendor.companyName} (${j.quantitySent} ${j.uom})`,
            }))}
          />
        )}

        {/* Dispatch Metrics Card */}
        {activeJob && (
          <div className="p-3 bg-secondary/40 rounded-lg border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Bleaching Subcontractor:</span>
              <strong className="text-foreground text-sm">{activeJob.vendor.companyName}</strong>
              <p className="text-[11px] text-muted-foreground font-mono">Job Ref: {activeJob.jobNumber}</p>
            </div>
            <div className="text-right font-mono">
              <span className="text-muted-foreground block">Original Material Sent:</span>
              <strong className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                {sentQty} {activeJob.uom}
              </strong>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Good Quantity Received"
            type="number"
            value={quantityReceived}
            onChange={(e) => setQuantityReceived(Number(e.target.value))}
            min={0}
            step="any"
            required
            placeholder="Accepted bleached fabric"
          />

          <Input
            label="Process Wastage (Loss)"
            type="number"
            value={wastageQuantity}
            onChange={(e) => setWastageQuantity(Number(e.target.value))}
            min={0}
            step="any"
            placeholder="Kier loss / shrinkage"
          />

          <Input
            label="Rejected Defect Quantity"
            type="number"
            value={rejectedQuantity}
            onChange={(e) => setRejectedQuantity(Number(e.target.value))}
            min={0}
            step="any"
            placeholder="Stains / yellowing / tear"
          />
        </div>

        {/* Live Reconciliation Bar */}
        <div className="p-3 rounded-lg border text-xs font-mono flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <span>Total Accounted:</span>
            <strong className="text-foreground text-sm">{totalAccounted} {activeJob?.uom}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span>Balance Difference:</span>
            <strong className={`text-sm ${discrepancy === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {discrepancy === 0 ? 'Exact Match (0 m)' : `${discrepancy > 0 ? `+${discrepancy}` : discrepancy} ${activeJob?.uom}`}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Received Date"
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            required
          />

          <Select
            label="Quality Inspection (QC) Status"
            value={qualityStatus}
            onChange={(e) => setQualityStatus(e.target.value)}
            options={[
              { value: 'PASSED', label: 'PASSED — Whiteness & Absorbency Optimal' },
              { value: 'ACCEPTED_WITH_DEVIATION', label: 'ACCEPTED WITH DEVIATION' },
              { value: 'REJECTED', label: 'REJECTED — Failed Pharmacopoeia Standard' },
            ]}
          />
        </div>

        <Input
          label="Quality Inspection Notes / Gate Entry Reference"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Delivery Challan #DC-9921, Whiteness 88%, Absorbency 2.4s"
        />

        <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={receiveMutation.isPending} className="gap-1.5 bg-teal-600 hover:bg-teal-700">
            <Sparkles className="h-4 w-4" />
            Accept & Record Bleaching Return
          </Button>
        </div>
      </form>
    </Modal>
  );
}
