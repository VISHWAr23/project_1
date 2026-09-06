'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Factory,
  ArrowLeft,
  Truck,
  Sparkles,
  Layers,
  Box,
  CheckCircle2,
  AlertTriangle,
  FileBarChart,
  Settings,
  Calendar,
  Building2,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  XCircle,
  Download,
  Printer,
  History,
  ArrowRightLeft,
  User,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BatchStatusBadge } from '@/components/gauze-production/batch-status-badge';
import { ProductionTimeline } from '@/components/gauze-production/production-timeline';
import { SendBleachingModal } from '@/components/gauze-production/send-bleaching-modal';
import { ReceiveBleachingModal } from '@/components/gauze-production/receive-bleaching-modal';
import { AddOperationModal } from '@/components/gauze-production/add-operation-modal';
import { PackingModal } from '@/components/gauze-production/packing-modal';
import {
  useGauzeBatchDetail,
  useUpdateGauzeBatchStatus,
} from '@/hooks/useGauzeProduction';
import { formatDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/toast';

export default function GauzeBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { toast } = useToast();

  const { data: batch, isLoading, refetch } = useGauzeBatchDetail(id);
  const updateStatusMutation = useUpdateGauzeBatchStatus();

  // Modals state
  const [isBleachOpen, setIsBleachOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isOperationOpen, setIsOperationOpen] = useState(false);
  const [isPackingOpen, setIsPackingOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bleaching' | 'operations' | 'packing'
  >('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Factory className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Loading Production Batch...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <Card className="p-8 text-center space-y-3 max-w-md mx-auto my-12">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-foreground">Production Batch Not Found</h3>
        <p className="text-xs text-muted-foreground">The requested batch ID does not exist in the database.</p>
        <Link href="/gauze-production/batches">
          <Button variant="outline" size="sm">Back to Batches</Button>
        </Link>
      </Card>
    );
  }

  const handleStatusChange = async (status: string, remarks?: string) => {
    try {
      await updateStatusMutation.mutateAsync({ batchId: batch.id, status, remarks });
      toast('Status Updated', `Batch status updated to ${status}`, 'success');
    } catch (err: any) {
      toast('Update Failed', err.message || 'Failed to update status', 'error');
    }
  };

  // Calculate losses
  const bleachingWastage = batch.bleachingReceipts.reduce((s, r) => s + Number(r.wastageQuantity), 0);
  const bleachingRejection = batch.bleachingReceipts.reduce((s, r) => s + Number(r.rejectedQuantity), 0);
  const processingWastage = batch.operations.reduce((s, o) => s + Number(o.wastageQuantity), 0);
  const processingRejection = batch.operations.reduce((s, o) => s + Number(o.rejectedQuantity), 0);
  const totalWastage = bleachingWastage + processingWastage;
  const totalRejection = bleachingRejection + processingRejection;
  const totalPackedPieces = batch.packingEntries.reduce((s, p) => s + Number(p.totalPieces), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card className="p-5 bg-card border-border space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link href="/gauze-production/batches">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0 shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-mono font-bold text-foreground">
                  {batch.batchNumber}
                </h1>
                <BatchStatusBadge status={batch.status} size="md" />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {batch.product.name} • Specification: <strong>{batch.gauzeType?.name || 'BP17'}</strong> • Dimensions: <strong>{batch.gauzeSize?.name || '120 cm x 20 m'}</strong>
              </p>
            </div>
          </div>

          {/* Workflow Action Buttons — Large, Single-Line, Numbered for Non-IT Factory Users */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Action 1: Send to Bleaching */}
            <Button
              onClick={() => setIsBleachOpen(true)}
              size="sm"
              disabled={
                (batch.status !== 'RAW_MATERIAL_RECEIVED' &&
                  batch.status !== 'READY_FOR_BLEACHING' &&
                  batch.status !== 'DRAFT') ||
                Number(batch.currentQuantity) <= 0
              }
              className="gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs whitespace-nowrap"
            >
              <Truck className="h-3.5 w-3.5 shrink-0" />
              <span>1. Send to Bleaching</span>
            </Button>

            {/* Action 2: Receive from Bleaching */}
            <Button
              onClick={() => setIsReceiveOpen(true)}
              size="sm"
              disabled={batch.status !== 'SENT_TO_BLEACHING' || batch.bleachingJobs.length === 0}
              className="gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>2. Receive from Bleaching</span>
            </Button>

            {/* Action 3: Add Processing Operation */}
            <Button
              onClick={() => setIsOperationOpen(true)}
              size="sm"
              disabled={
                batch.status === 'RAW_MATERIAL_RECEIVED' ||
                batch.status === 'SENT_TO_BLEACHING' ||
                batch.status === 'READY_FOR_BLEACHING' ||
                batch.status === 'DRAFT' ||
                batch.status === 'COMPLETED' ||
                batch.status === 'CANCELLED'
              }
              className="gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs whitespace-nowrap"
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span>3. Cutting & Folding</span>
            </Button>

            {/* Action 4: Pack & Finish */}
            <Button
              onClick={() => setIsPackingOpen(true)}
              size="sm"
              disabled={
                batch.status === 'RAW_MATERIAL_RECEIVED' ||
                batch.status === 'SENT_TO_BLEACHING' ||
                batch.status === 'READY_FOR_BLEACHING' ||
                batch.status === 'DRAFT' ||
                batch.status === 'COMPLETED' ||
                batch.status === 'CANCELLED'
              }
              className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs whitespace-nowrap"
            >
              <Box className="h-3.5 w-3.5 shrink-0" />
              <span>4. Pack into Boxes</span>
            </Button>

            {/* Hold / Resume Toggle */}
            {batch.status === 'ON_HOLD' ? (
              <Button
                onClick={() => handleStatusChange('IN_PROCESSING', 'Resumed production from hold')}
                size="sm"
                variant="outline"
                className="gap-1 text-xs text-emerald-600 border-emerald-500/40"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                Resume
              </Button>
            ) : batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' ? (
              <Button
                onClick={() => handleStatusChange('ON_HOLD', 'Batch put on temporary hold')}
                size="sm"
                variant="outline"
                className="gap-1 text-xs text-muted-foreground border-border"
              >
                <PauseCircle className="h-3.5 w-3.5" />
                Hold
              </Button>
            ) : null}
          </div>
        </div>

        {/* Recommended Next Action Banner (Direct guidance for factory supervisor) */}
        {batch.status !== 'COMPLETED' && batch.status !== 'CANCELLED' && (
          <div className="p-3.5 rounded-lg border border-blue-500/30 bg-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-md bg-blue-600 text-white shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Recommended Next Manufacturing Step
                </span>
                <p className="text-xs text-muted-foreground">
                  {batch.status === 'RAW_MATERIAL_RECEIVED' || batch.status === 'DRAFT' || batch.status === 'READY_FOR_BLEACHING'
                    ? 'Grey cloth is stored in warehouse. Dispatch material to external bleaching mill.'
                    : batch.status === 'SENT_TO_BLEACHING'
                    ? 'Fabric is currently at external bleaching mill. Record returned bleached fabric when delivered.'
                    : batch.status === 'BLEACHING_RECEIVED' || batch.status === 'IN_PROCESSING'
                    ? 'Bleached fabric is on shop floor. Record cutting, slitting, and folding operations.'
                    : 'Converting operations completed. Pack processed gauze into finished boxes to update inventory.'}
                </p>
              </div>
            </div>

            <div>
              {batch.status === 'RAW_MATERIAL_RECEIVED' || batch.status === 'DRAFT' || batch.status === 'READY_FOR_BLEACHING' ? (
                <Button
                  onClick={() => setIsBleachOpen(true)}
                  size="sm"
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-sm"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Send to Bleaching Now
                </Button>
              ) : batch.status === 'SENT_TO_BLEACHING' ? (
                <Button
                  onClick={() => setIsReceiveOpen(true)}
                  size="sm"
                  className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Receive Bleached Fabric
                </Button>
              ) : batch.status === 'BLEACHING_RECEIVED' || batch.status === 'IN_PROCESSING' ? (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsOperationOpen(true)}
                    size="sm"
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-sm"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Record Operation
                  </Button>
                  <Button
                    onClick={() => setIsPackingOpen(true)}
                    size="sm"
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                  >
                    <Box className="h-3.5 w-3.5" />
                    Pack Finished Goods
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsPackingOpen(true)}
                  size="sm"
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                >
                  <Box className="h-3.5 w-3.5" />
                  Pack into Boxes
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quantity Summary Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-border text-xs font-mono">
          <div className="p-2.5 bg-secondary/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground block font-sans">Initial Raw Material</span>
            <strong className="text-foreground text-sm">
              {Number(batch.inputQuantity).toLocaleString()} {batch.inputUom}
            </strong>
          </div>

          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-sans font-bold">Current Available Stock</span>
            <strong className="text-blue-600 dark:text-blue-400 text-sm font-bold">
              {Number(batch.currentQuantity).toLocaleString()} {batch.currentUom}
            </strong>
          </div>

          <div className="p-2.5 bg-secondary/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground block font-sans">Sent to Bleaching</span>
            <strong className="text-foreground text-sm">
              {batch.bleachingJobs.reduce((s, j) => s + Number(j.quantitySent), 0).toLocaleString()} {batch.inputUom}
            </strong>
          </div>

          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            <span className="text-[10px] text-rose-600 dark:text-rose-400 block font-sans">Total Wastage</span>
            <strong className="text-rose-600 dark:text-rose-400 text-sm">
              {totalWastage.toLocaleString()} {batch.inputUom}
            </strong>
          </div>

          <div className="p-2.5 bg-secondary/30 rounded-lg">
            <span className="text-[10px] text-muted-foreground block font-sans">Total Defect Rejections</span>
            <strong className="text-foreground text-sm">
              {totalRejection.toLocaleString()} {batch.inputUom}
            </strong>
          </div>

          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-sans font-bold">Finished Goods Packed</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
              {totalPackedPieces.toLocaleString()} pcs
            </strong>
          </div>
        </div>
      </Card>

      {/* Production Stepper Timeline */}
      <Card className="p-5 bg-card border-border">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Factory className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Production Progress Stepper
        </h2>
        <ProductionTimeline batch={batch} />
      </Card>

      {/* Deep-Dive Tabbed Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2 text-xs font-semibold">
        {[
          { id: 'overview', label: '1. Overview', icon: Factory },
          { id: 'bleaching', label: `2. Bleaching (${batch.bleachingJobs.length})`, icon: Truck },
          { id: 'operations', label: `3. Operations (${batch.operations.length})`, icon: Layers },
          { id: 'packing', label: `4. Packing (${batch.packingEntries.length})`, icon: Box },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Raw Material Info */}
          <Card className="p-5 bg-card border-border space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Raw Material Intake & Supplier
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-semibold text-foreground">{batch.supplier?.name || 'Direct Stock Entry'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Supplier Reference:</span>
                <span className="font-mono text-foreground">{batch.rawMaterials?.[0]?.supplierReference || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Roll / Than Lot Number:</span>
                <span className="font-mono font-bold text-foreground">
                  {batch.rawMaterials?.[0]?.rollOrThansNumber || 'Standard Lot'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Intake Quantity:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {Number(batch.inputQuantity).toLocaleString()} {batch.inputUom}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Receiving Date:</span>
                <span className="font-mono text-foreground">
                  {formatDate(batch.productionStartDate)}
                </span>
              </div>
            </div>
          </Card>

          {/* Schedule & Notes */}
          <Card className="p-5 bg-card border-border space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Schedule & Notes
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Production Start:</span>
                <span className="font-mono text-foreground">
                  {formatDate(batch.productionStartDate)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Expected Completion:</span>
                <span className="font-mono text-foreground">
                  {formatDate(batch.expectedCompletionDate)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">Actual Completion:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {batch.completionDate ? formatDate(batch.completionDate) : 'In Progress'}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-muted-foreground block text-[11px] mb-1">Production Notes:</span>
                <p className="p-2 bg-secondary/30 rounded text-xs text-foreground italic">
                  {batch.notes || 'No specific notes recorded for this batch.'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Bleaching */}
      {activeTab === 'bleaching' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Bleaching Subcontractor Dispatches & Receipts</h3>
            <Button
              onClick={() => setIsBleachOpen(true)}
              size="sm"
              className="gap-1 text-xs"
              disabled={batch.status === 'COMPLETED' || batch.status === 'CANCELLED'}
            >
              <Truck className="h-3.5 w-3.5" />
              Dispatch Material to Bleaching
            </Button>
          </div>

          {batch.bleachingJobs.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-xs">
              No bleaching jobs dispatched yet. Click &quot;Dispatch Material to Bleaching&quot; to send material to a job-work vendor.
            </Card>
          ) : (
            batch.bleachingJobs.map((job) => (
              <Card key={job.id} className="p-5 bg-card border-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-sm">{job.jobNumber}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary">{job.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Vendor: <strong>{job.vendor.companyName}</strong> • Process: <strong>{job.bleachingType.name}</strong>
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-muted-foreground block text-[11px]">Sent: {formatDate(job.sentDate)}</span>
                    <strong className="text-foreground">{Number(job.quantitySent).toLocaleString()} {job.uom}</strong>
                  </div>
                </div>

                {/* Receipts for this job */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block">Return Receipts from Vendor:</span>
                  {job.receipts.length === 0 ? (
                    <div className="p-3 bg-secondary/30 rounded text-xs text-muted-foreground flex items-center justify-between">
                      <span>Material is currently held by {job.vendor.companyName}.</span>
                      <Button
                        onClick={() => setIsReceiveOpen(true)}
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                      >
                        Receive Return
                      </Button>
                    </div>
                  ) : (
                    job.receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="p-3 bg-teal-500/5 rounded-md border border-teal-500/20 text-xs font-mono flex flex-wrap items-center justify-between gap-2"
                      >
                        <div>
                          <strong className="text-foreground block">{receipt.receiptNumber}</strong>
                          <span className="text-[11px] text-muted-foreground font-sans">
                            Date: {formatDate(receipt.receivedDate)} • QC: {receipt.qualityStatus || 'Passed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-sans">Good Received</span>
                            <strong className="text-teal-600 dark:text-teal-400">{Number(receipt.quantityReceived).toLocaleString()} m</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-sans">Wastage</span>
                            <strong className="text-rose-600 dark:text-rose-400">{Number(receipt.wastageQuantity).toLocaleString()} m</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-sans">Rejected</span>
                            <strong className="text-orange-600 dark:text-orange-400">{Number(receipt.rejectedQuantity).toLocaleString()} m</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Processing Operations */}
      {activeTab === 'operations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Internal Converting & Processing Steps</h3>
            <Button
              onClick={() => setIsOperationOpen(true)}
              size="sm"
              className="gap-1 text-xs bg-indigo-600 hover:bg-indigo-700"
              disabled={batch.status === 'COMPLETED' || batch.status === 'CANCELLED'}
            >
              <Layers className="h-3.5 w-3.5" />
              Add Processing Step
            </Button>
          </div>

          {batch.operations.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-xs">
              No internal operations recorded yet. Click &quot;Add Processing Step&quot; to log cutting, folding, or rolling.
            </Card>
          ) : (
            <div className="space-y-3">
              {batch.operations.map((op) => (
                <Card key={op.id} className="p-4 bg-card border-border text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 font-bold flex items-center justify-center text-xs">
                        {op.sequenceNumber}
                      </span>
                      <strong className="text-foreground text-sm">{op.operationType.name}</strong>
                      <span className="font-mono text-muted-foreground">({op.operationNumber})</span>
                    </div>
                    <span className="text-muted-foreground font-mono">
                      {formatDate(op.operationDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Input Quantity</span>
                      <strong>{Number(op.inputQuantity).toLocaleString()} {op.uom}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Output Yield</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {Number(op.outputQuantity).toLocaleString()} {op.uom}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Wastage</span>
                      <strong className="text-rose-600 dark:text-rose-400">{Number(op.wastageQuantity).toLocaleString()} {op.uom}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Operator / Station</span>
                      <span className="font-sans text-foreground">
                        {op.employee ? `${op.employee.firstName} ${op.employee.lastName}` : (op.machineId || 'Floor Station')}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Packing Entries */}
      {activeTab === 'packing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Finished Goods Packaging & Inventory Entries</h3>
            <Button
              onClick={() => setIsPackingOpen(true)}
              size="sm"
              className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
              disabled={batch.status === 'COMPLETED' || batch.status === 'CANCELLED'}
            >
              <Box className="h-3.5 w-3.5" />
              Pack Finished Goods
            </Button>
          </div>

          {batch.packingEntries.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground text-xs">
              No packing entries recorded yet. Click &quot;Pack Finished Goods&quot; to convert processed material into finished units.
            </Card>
          ) : (
            <div className="space-y-3">
              {batch.packingEntries.map((pk) => (
                <Card key={pk.id} className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border/50">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{pk.product.name}</h4>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {pk.packingNumber}
                      </span>
                    </div>
                    <span className="font-mono text-muted-foreground">
                      Packed: {formatDate(pk.packingDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Number of Packs</span>
                      <strong>{pk.numberOfPacks} packs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Pieces per Pack</span>
                      <strong>{pk.piecesPerPack} pcs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Total Inwarded</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                        {pk.totalPieces.toLocaleString()} pieces
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-sans">Storage Warehouse</span>
                      <span className="font-sans text-foreground">
                        {pk.finishedGoodsWarehouse?.name || 'Finished Goods Warehouse'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Modals */}
      <SendBleachingModal
        batch={batch}
        isOpen={isBleachOpen}
        onClose={() => setIsBleachOpen(false)}
        onSuccess={() => {
          setIsBleachOpen(false);
          refetch();
        }}
      />

      <ReceiveBleachingModal
        batch={batch}
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        jobs={batch.bleachingJobs || []}
        onSuccess={() => {
          setIsReceiveOpen(false);
          refetch();
        }}
      />

      <AddOperationModal
        batch={batch}
        isOpen={isOperationOpen}
        onClose={() => setIsOperationOpen(false)}
        onSuccess={() => {
          setIsOperationOpen(false);
          refetch();
        }}
      />

      <PackingModal
        batch={batch}
        isOpen={isPackingOpen}
        onClose={() => setIsPackingOpen(false)}
        onSuccess={() => {
          setIsPackingOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
