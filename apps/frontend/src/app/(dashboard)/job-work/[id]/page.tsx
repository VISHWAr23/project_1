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
      className="space-y-6"
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
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                {order.jobWorkNumber}
              </h1>
              <JobWorkStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Issued to {order.jobWorkCompany?.companyName} • Delivery Challan: {order.challanNumber || 'Pending'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {order.status === 'CREATED' && (
            <Link href={`/job-work/${order.id}/issue`}>
              <Button variant="primary" size="sm" leftIcon={<Send className="h-3.5 w-3.5" />}>
                Issue Material
              </Button>
            </Link>
          )}

          {(order.status === 'MATERIALS_ISSUED' || order.status === 'IN_PROGRESS' || order.status === 'PARTIAL_RETURN') && (
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
          <p className="text-xs font-medium text-muted-foreground">Total Issued Weight</p>
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
              <span className="text-muted-foreground block">Raw Material Dispatched:</span>
              <span className="font-semibold text-foreground text-sm">{order.rawMaterial?.name}</span>
              <span className="block font-mono text-[11px] text-muted-foreground">SKU: {order.rawMaterial?.sku}</span>
            </div>
            {order.finishedProduct && (
              <div>
                <span className="text-muted-foreground block">Target Finished Product:</span>
                <span className="font-semibold text-emerald-400 text-sm">{order.finishedProduct?.name}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border space-y-1">
              <p><span className="text-muted-foreground">Expected Return Date:</span> <span className="font-mono font-bold text-foreground">{order.expectedReturnDate ? new Date(order.expectedReturnDate).toLocaleDateString() : '-'}</span></p>
              <p><span className="text-muted-foreground">Vehicle Number:</span> <span className="font-mono text-foreground">{order.vehicleNumber || 'Not specified'}</span></p>
              <p><span className="text-muted-foreground">Driver Name:</span> <span className="text-foreground">{order.driverName || 'Not specified'}</span></p>
            </div>
          </Card>
        </div>

        {/* Right Column: Workflow Timeline & Audit */}
        <div className="lg:col-span-2">
          <JobWorkTimeline order={order} />
        </div>
      </div>

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
