'use client';

import React, { useState, use } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Truck,
  FileText,
  Send,
  RefreshCw,
  Lock,
  Scale,
  Calendar,
  Building2,
  Package,
  CheckCircle2,
  Printer,
  Edit3,
  Trash2,
  Coins,
  Layers,
  Calculator,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { JobWorkStatusBadge } from '@/components/job-work/job-work-status-badge';
import { JobWorkTimeline } from '@/components/job-work/job-work-timeline';
import { ReconciliationDialog } from '@/components/job-work/reconciliation-dialog';
import { JobWorkEditModal } from '@/components/job-work/job-work-edit-modal';
import { JobWorkDeleteModal } from '@/components/job-work/job-work-delete-modal';
import { useJobWorkOrderDetail, useCloseJobWorkOrder } from '@/hooks/useJobWork';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function JobWorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: order, isLoading, refetch } = useJobWorkOrderDetail(id);
  const closeMutation = useCloseJobWorkOrder();

  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading || !order) {
    return (
      <div className="p-8 text-center text-muted-foreground font-mono text-sm">
        Loading Job Work Order Details...
      </div>
    );
  }

  const issuedWeight = Number(order.totalIssuedWeight) || 0;
  const returnedWeight = Number(order.totalReturnedWeight) || 0;
  const wastageWeight = Number(order.totalWastageWeight) || 0;
  const pendingWeight = Number(order.pendingWeight) || 0;
  const isWeaving = order.jobWorkType === 'WEAVING';

  const handleCloseOrder = async (remarks: string) => {
    try {
      await closeMutation.mutateAsync({
        id: order.id,
        payload: { remarks, confirmed: true },
      });
      toast('Order Closed', `Job Work Order ${order.jobWorkNumber} closed & reconciled`, 'success');
      refetch();
    } catch (err: any) {
      toast('Closure Failed', err.message || 'Unable to close order', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-6xl mx-auto pb-12"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link href="/job-work">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                {order.jobWorkNumber}
              </h1>
              {isWeaving && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Weaving (நெசவு)
                </span>
              )}
              <JobWorkStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Issued to {order.jobWorkCompany?.companyName} • Delivery Challan: {order.challanNumber || 'Pending'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Weaving order: Can receive In-Pass goods directly */}
          {isWeaving && order.status !== 'CLOSED' && order.status !== 'COMPLETED' && (
            <Link href={`/job-work/${order.id}/return`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Receive In-Pass Goods
              </Button>
            </Link>
          )}

          {/* Standard order: Issue then Return flow */}
          {!isWeaving && order.status === 'CREATED' && (
            <Link href={`/job-work/${order.id}/issue`}>
              <Button variant="primary" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>
                Issue Material
              </Button>
            </Link>
          )}

          {!isWeaving && (order.status === 'MATERIALS_ISSUED' || order.status === 'IN_PROGRESS' || order.status === 'PARTIAL_RETURN') && (
            <Link href={`/job-work/${order.id}/return`}>
              <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Receive Return
              </Button>
            </Link>
          )}

          {order.challanNumber && (
            <Link href={`/job-work/${order.id}/challan`}>
              <Button variant="outline" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />}>
                Delivery Challan PDF
              </Button>
            </Link>
          )}

          {order.status !== 'CLOSED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit3 className="h-3.5 w-3.5" />}
            >
              Edit Order
            </Button>
          )}

          {order.status !== 'CLOSED' && (Number(order.totalReturnedWeight) === 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => setIsDeleteOpen(true)}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              {order.status === 'CREATED' ? 'Delete Order' : 'Cancel & Reverse'}
            </Button>
          )}

          {order.status !== 'CLOSED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReconcileOpen(true)}
              className="text-amber-400 hover:text-amber-300"
              leftIcon={<Lock className="h-3.5 w-3.5" />}
            >
              Reconcile & Close
            </Button>
          )}
        </div>
      </div>

      {/* KPI Quantitative Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card hoverElevation className="p-4 bg-card border-border">
          <p className="text-xs font-medium text-muted-foreground">
            {isWeaving ? 'Expected Total Receivable' : 'Total Issued Weight'}
          </p>
          <h3 className="text-xl font-bold text-foreground font-mono mt-1 flex items-center gap-1">
            <Scale className="h-4 w-4 text-primary" />
            {issuedWeight.toFixed(2)} Kg
          </h3>
        </Card>

        <Card hoverElevation className="p-4 bg-card border-border">
          <p className="text-xs font-medium text-muted-foreground">Total Returned Goods</p>
          <h3 className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {returnedWeight.toFixed(2)} Kg
          </h3>
        </Card>

        <Card hoverElevation className="p-4 bg-card border-border">
          <p className="text-xs font-medium text-muted-foreground">Reported Scrap / Wastage</p>
          <h3 className="text-xl font-bold text-amber-400 font-mono mt-1">
            {wastageWeight.toFixed(2)} Kg
          </h3>
        </Card>

        <Card hoverElevation className="p-4 bg-card border-border">
          <p className="text-xs font-medium text-muted-foreground">Pending Balance Weight</p>
          <h3 className="text-xl font-bold text-primary font-mono mt-1">
            {pendingWeight.toFixed(2)} Kg
          </h3>
        </Card>
      </div>

      {/* Weaving Technical Specifications & Salary Sheet (Displayed if Weaving Order) */}
      {isWeaving && order.weavingDetail && (
        <Card className="p-6 bg-card border-border space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                <span>Weaving Engineering Specs & Salary Sheet (நெசவு விவரங்கள்)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Technical parameters, mark breakdown, and wages calculated for this weaving consignment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {order.weavingDetail.totalPaavu} பாவு
              </span>
              <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {order.weavingDetail.totalPieces} Pieces
              </span>
            </div>
          </div>

          {/* Specs Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 bg-secondary/40 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">Ends (இழைகள்)</span>
              <span className="text-base font-bold font-mono text-foreground">{order.weavingDetail.ends}</span>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">Reed (ரீட்)</span>
              <span className="text-base font-bold font-mono text-foreground">{order.weavingDetail.reed}</span>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">Pick (பிக்)</span>
              <span className="text-base font-bold font-mono text-foreground">{order.weavingDetail.pick}</span>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">Weft Count</span>
              <span className="text-base font-bold font-mono text-foreground">{Number(order.weavingDetail.weftCount)}s</span>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">Piece Length</span>
              <span className="text-base font-bold font-mono text-foreground">{Number(order.weavingDetail.pieceLengthYards)} yds / {Number(order.weavingDetail.pieceLengthMeters)}m</span>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-medium">Yarn Constant</span>
              <span className="text-base font-bold font-mono text-foreground">{Number(order.weavingDetail.yarnConstant)}</span>
            </div>
          </div>

          {/* Mark Breakdown & Calculations Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-1">
            {/* Mark Breakdown mini table */}
            <div className="border border-border rounded-lg p-3.5 space-y-2 bg-secondary/20">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Calculator className="h-3.5 w-3.5 text-primary" />
                <span>Mark Breakdown (மார்க் பட்டியல்)</span>
              </h4>
              <div className="space-y-1.5 text-xs font-mono">
                {Array.isArray(order.weavingDetail.markBreakdown) &&
                  (order.weavingDetail.markBreakdown as any[]).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded bg-background border border-border/60">
                      <span>{item.mark} மார்க் × {item.paavu} பாவு</span>
                      <strong className="text-primary">{item.pieces || (item.mark * item.paavu)} ps</strong>
                    </div>
                  ))}
              </div>
            </div>

            {/* Weft Yarn Weight Card */}
            <div className="border border-blue-500/20 bg-blue-500/5 rounded-lg p-4 space-y-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-4 w-4" />
                <span>ஊடை நூல் எடை (Weft Weight)</span>
              </span>
              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>1 துண்டு எடை (Per Piece):</span>
                  <strong className="font-mono text-foreground">{Number(order.weavingDetail.weftWeightPerPieceKg).toFixed(3)} Kg</strong>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>மொத்த துண்டுகள்:</span>
                  <strong className="font-mono text-foreground">{order.weavingDetail.totalPieces} Pieces</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-blue-500/20 flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">மொத்த ஊடை எடை:</span>
                <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {Number(order.weavingDetail.totalWeftWeightKg).toFixed(3)} Kg
                </span>
              </div>
            </div>

            {/* Weaving Salary Card */}
            <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="h-4 w-4" />
                  <span>நெசவு சம்பளம் (Weaving Wages)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {order.weavingDetail.salaryType} (₹{Number(order.weavingDetail.ratePerMeter)}/m)
                </span>
              </div>
              <div className="text-xs space-y-1 pt-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>1 துண்டு கூலி (Per Piece):</span>
                  <strong className="font-mono text-foreground">₹ {Number(order.weavingDetail.salaryPerPiece).toFixed(3)}</strong>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>மொத்த துண்டுகள்:</span>
                  <strong className="font-mono text-foreground">{order.weavingDetail.totalPieces} ps</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">மொத்த சம்பளம்:</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹ {Number(order.weavingDetail.totalSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Grid Layout for Vendor info & ERP Status Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Vendor & Material Details */}
        <div className="space-y-6">
          <Card className="p-5 bg-card border-border space-y-3 text-xs">
            <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Building2 className="h-4 w-4 text-primary" />
              Job Working Company Particulars
            </h3>
            <p className="font-bold text-sm text-foreground">{order.jobWorkCompany?.companyName}</p>
            <p className="text-muted-foreground">{order.jobWorkCompany?.address || 'Industrial Premises'}</p>
            <div className="pt-2 space-y-1">
              <p><span className="text-muted-foreground">GSTIN:</span> <span className="font-mono text-foreground">{order.jobWorkCompany?.gstin || 'N/A'}</span></p>
              <p><span className="text-muted-foreground">Contact:</span> <span className="text-foreground">{order.jobWorkCompany?.contactPerson || '-'}</span></p>
              <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{order.jobWorkCompany?.phone || '-'}</span></p>
            </div>
          </Card>

          <Card className="p-5 bg-card border-border space-y-3 text-xs">
            <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <Package className="h-4 w-4 text-primary" />
              Material Contract Details
            </h3>
            <div>
              <span className="text-muted-foreground block">Contract Type:</span>
              <span className="font-semibold text-foreground text-sm">
                {isWeaving ? 'Weaving Subcontract (நெசவு பணி ஒப்பந்தம்)' : 'Processing / Finishing Job Work'}
              </span>
            </div>
            {order.rawMaterial ? (
              <div>
                <span className="text-muted-foreground block">Raw Material Dispatched:</span>
                <span className="font-semibold text-foreground text-sm">{order.rawMaterial.name}</span>
                <span className="block font-mono text-[11px] text-muted-foreground">SKU: {order.rawMaterial.sku}</span>
              </div>
            ) : isWeaving ? (
              <div>
                <span className="text-muted-foreground block">Inventory Status:</span>
                <span className="font-medium text-blue-500 text-xs">Direct Weaving (No raw materials issued from store)</span>
              </div>
            ) : null}
            {order.finishedProduct && (
              <div>
                <span className="text-muted-foreground block">Target Finished Product:</span>
                <span className="font-semibold text-emerald-400 text-sm">{order.finishedProduct.name}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border space-y-1">
              <p><span className="text-muted-foreground">Expected Return Date:</span> <span className="font-mono font-bold text-foreground">{order.expectedReturnDate ? new Date(order.expectedReturnDate).toLocaleDateString() : '-'}</span></p>
              <p><span className="text-muted-foreground">Vehicle Number:</span> <span className="font-mono text-foreground">{order.vehicleNumber || 'Not specified'}</span></p>
              <p><span className="text-muted-foreground">Driver Name:</span> <span className="text-foreground">{order.driverName || 'Not specified'}</span></p>
            </div>
          </Card>

          {/* Remarks & Wastage Records if present */}
          {order.remarks && (
            <Card className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5 text-xs">
              <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <FileText className="h-3.5 w-3.5 text-amber-500" />
                <span>Remarks & Consignment Notes</span>
              </h4>
              <p className="text-foreground whitespace-pre-line leading-relaxed font-sans bg-background/50 p-2.5 rounded-lg border border-border/60">
                {order.remarks}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Workflow Timeline & Audit */}
        <div className="lg:col-span-2">
          <JobWorkTimeline order={order} />
        </div>
      </div>

      {/* WEAVING DEDICATED IN-PASS RECEIVED GOODS REGISTER */}
      {isWeaving ? (
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                <span>Weaving In-Pass Received Goods Register ({order.weavingReceivedItems?.length || 0})</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Received woven fabric logged directly with In-Pass numbers and weights (Raw materials inventory bypassed)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Direct In-Pass Table
              </span>
              {order.status !== 'CLOSED' && order.status !== 'COMPLETED' && (
                <Link href={`/job-work/${order.id}/return`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-400">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Receive In-Pass</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Receipt Date</th>
                  <th className="p-3">In-Pass Number</th>
                  <th className="p-3">Fabric Description</th>
                  <th className="p-3 text-right">Net Weight (Kg)</th>
                  <th className="p-3">Wastage Description</th>
                  <th className="p-3 text-right">Wastage (Kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {order.weavingReceivedItems && order.weavingReceivedItems.length > 0 ? (
                  order.weavingReceivedItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-3 text-center text-muted-foreground">{idx + 1}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-bold text-emerald-400 font-mono">
                        {item.inPassNumber}
                      </td>
                      <td className="p-3 font-sans text-foreground font-medium">
                        {item.description}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400 text-sm">
                        {Number(item.weightKg).toFixed(2)} Kg
                      </td>
                      <td className="p-3 text-muted-foreground font-sans">
                        {item.wastageDescription || '-'}
                      </td>
                      <td className="p-3 text-right text-amber-400 font-bold">
                        {Number(item.wastageWeightKg).toFixed(2)} Kg
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground font-sans">
                      <p className="text-xs">No in-pass delivery records registered yet.</p>
                      <Link href={`/job-work/${order.id}/return`} className="mt-2 inline-block">
                        <Button variant="outline" size="sm" className="text-xs mt-2 border-emerald-500/30 text-emerald-400">
                          Receive First In-Pass Delivery
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
              {order.weavingReceivedItems && order.weavingReceivedItems.length > 0 && (
                <tfoot className="bg-muted/30 font-mono font-bold border-t border-border text-xs">
                  <tr>
                    <td colSpan={4} className="p-3 text-right text-muted-foreground font-sans">
                      Cumulative Total:
                    </td>
                    <td className="p-3 text-right text-emerald-400 text-sm">
                      {returnedWeight.toFixed(2)} Kg
                    </td>
                    <td></td>
                    <td className="p-3 text-right text-amber-400 text-sm">
                      {wastageWeight.toFixed(2)} Kg
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      ) : (
        /* STANDARD ROLLS AND RETURNS TABLES */
        <>
          {/* Issued Rolls Table */}
          <Card className="p-5 bg-card border-border space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Dispatched Raw Material Rolls ({order.issueItems?.length || 0})
            </h3>
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3 text-right">Issued Weight (Kg)</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {order.issueItems && order.issueItems.length > 0 ? (
                    order.issueItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="p-3 text-center text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 font-bold text-primary">{item.rollNumber}</td>
                        <td className="p-3 text-right text-foreground">{Number(item.issuedWeight).toFixed(2)} Kg</td>
                        <td className="p-3 text-right text-foreground">{item.issuedQty} Pcs</td>
                        <td className="p-3 text-muted-foreground font-sans">{item.remarks || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground italic font-sans">
                        No rolls issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Returned Rolls Table */}
          <Card className="p-5 bg-card border-border space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-400" />
              Received Returned Rolls Register ({order.returnItems?.length || 0})
            </h3>
            <div className="border border-border rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Return Date</th>
                    <th className="p-3">Returned Roll Number</th>
                    <th className="p-3">Finished Product</th>
                    <th className="p-3 text-right">Net Weight (Kg)</th>
                    <th className="p-3 text-right">Scrap (Kg)</th>
                    <th className="p-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {order.returnItems && order.returnItems.length > 0 ? (
                    order.returnItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="p-3 text-center text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 text-muted-foreground">{new Date(item.returnedDate).toLocaleDateString()}</td>
                        <td className="p-3 font-bold text-emerald-400">{item.rollNumber}</td>
                        <td className="p-3 font-sans text-foreground font-medium">{item.finishedProduct?.name || 'Finished Roll'}</td>
                        <td className="p-3 text-right text-emerald-400 font-bold">{Number(item.returnedWeight).toFixed(2)} Kg</td>
                        <td className="p-3 text-right text-amber-400">{Number(item.wastageWeight).toFixed(2)} Kg</td>
                        <td className="p-3 text-muted-foreground font-sans">{item.remarks || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-muted-foreground italic font-sans">
                        No returns received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Printable Delivery Challan PDF Link View */}
      {order.challanNumber && (
        <Card className="p-5 bg-card border-border flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground text-sm">Delivery Challan PDF ({order.challanNumber})</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Printable delivery challan with Barcode, QR Code verification and carrier sign-off blocks.
            </p>
          </div>
          <Link href={`/job-work/${order.id}/challan`}>
            <Button variant="primary" size="sm" leftIcon={<Printer className="h-4 w-4" />}>
              Open Printable Challan
            </Button>
          </Link>
        </Card>
      )}

      {/* Reconciliation Dialog Modal */}
      <ReconciliationDialog
        isOpen={isReconcileOpen}
        onClose={() => setIsReconcileOpen(false)}
        order={order}
        onConfirmClose={handleCloseOrder}
        isLoading={closeMutation.isPending}
      />

      {/* Edit Job Work Order Modal */}
      <JobWorkEditModal
        order={order}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Delete / Cancel Job Work Order Modal */}
      <JobWorkDeleteModal
        order={order}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => {
          router.push('/job-work');
        }}
      />
    </motion.div>
  );
}
