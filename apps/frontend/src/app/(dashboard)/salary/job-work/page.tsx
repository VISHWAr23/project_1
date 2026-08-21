'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Coins,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  FileText,
  Building2,
  Package,
  Layers,
  ArrowRight,
  Printer,
  X,
  CreditCard,
  Send,
  Users,
  CalendarCheck,
  History,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { SalaryNavTabs } from '@/components/salary/salary-nav-tabs';
import { useJobWorkOrders } from '@/hooks/useJobWork';
import { JobWorkOrder } from '@/types/job-work.types';

interface WageRecordState {
  ratePerPiece: number;
  fixedWage: number;
  isSettled: boolean;
  settledAt?: string;
  paymentMode?: string;
  referenceNo?: string;
  settledAmount?: number;
  notes?: string;
}

export default function JobWorkWagesPage() {
  const { toast } = useToast();
  const { data: jobWorkData, isLoading } = useJobWorkOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'SETTLED'>('ALL');

  // Interactive Wage State per order
  const [wageStates, setWageStates] = useState<Record<string, WageRecordState>>({
    'jwo-103': {
      ratePerPiece: 10,
      fixedWage: 2500,
      isSettled: true,
      settledAt: '2026-07-27',
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: 'UTR-982347102',
      settledAmount: 2500,
      notes: 'Final settlement for surface coating.',
    },
    'jwo-104': {
      ratePerPiece: 3.5,
      fixedWage: 1750,
      isSettled: false,
      settledAmount: 1750,
    },
    'jwo-105': {
      ratePerPiece: 12.0,
      fixedWage: 3000,
      isSettled: false,
      settledAmount: 3000,
    },
    'jwo-106': {
      ratePerPiece: 5.0,
      fixedWage: 2400,
      isSettled: true,
      settledAt: '2026-08-12',
      paymentMode: 'Bank Transfer (UPI)',
      referenceNo: 'UPI-20260812-9988',
      settledAmount: 2400,
      notes: 'Bleaching processing charge cleared.',
    },
  });

  // Modal States
  const [settlementOrder, setSettlementOrder] = useState<JobWorkOrder | null>(null);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer (NEFT)');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [voucherOrder, setVoucherOrder] = useState<JobWorkOrder | null>(null);

  // Filter only closed / completed job works
  const closedOrders = useMemo(() => {
    const orders = jobWorkData?.items || [];
    return orders.filter(
      (order) =>
        order.status === 'CLOSED' ||
        order.status === 'COMPLETED' ||
        (order.totalReturnedWeight > 0 && order.pendingWeight === 0),
    );
  }, [jobWorkData]);

  // Helper to determine if product is discrete piece unit
  const isDiscreteUnit = (order: JobWorkOrder) => {
    const uom =
      order.finishedProduct?.unit?.abbreviation ||
      order.finishedProduct?.unit?.name ||
      order.rawMaterial?.unit?.abbreviation ||
      'Kg';
    const normalized = uom.toLowerCase();
    return (
      ['pc', 'pcs', 'nos', 'no', 'unit', 'units', 'box', 'pkt', 'dzn'].includes(normalized) ||
      order.finishedProduct?.name?.toLowerCase().includes('cover') ||
      order.finishedProduct?.name?.toLowerCase().includes('sheet') ||
      order.finishedProduct?.name?.toLowerCase().includes('swab')
    );
  };

  // Get or initialize wage state for an order
  const getWageState = (order: JobWorkOrder): WageRecordState => {
    if (wageStates[order.id]) {
      return wageStates[order.id];
    }
    const isPiece = isDiscreteUnit(order);
    const qty = Number(order.totalReturnedQty) || (isPiece ? 100 : 1);
    const defaultRate = isPiece ? 3.5 : 0;
    const defaultFixed = isPiece ? qty * defaultRate : 2000;
    return {
      ratePerPiece: defaultRate,
      fixedWage: defaultFixed,
      isSettled: false,
      settledAmount: defaultFixed,
    };
  };

  const updateRatePerPiece = (orderId: string, order: JobWorkOrder, newRate: number) => {
    const qty = Number(order.totalReturnedQty) || 1;
    const computedTotal = Number((qty * newRate).toFixed(2));
    setWageStates((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || getWageState(order)),
        ratePerPiece: newRate,
        fixedWage: computedTotal,
        settledAmount: computedTotal,
      },
    }));
  };

  const updateFixedWage = (orderId: string, order: JobWorkOrder, newWage: number) => {
    setWageStates((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || getWageState(order)),
        fixedWage: newWage,
        settledAmount: newWage,
      },
    }));
  };

  const handleOpenSettlement = (order: JobWorkOrder) => {
    const currentWage = getWageState(order);
    setSettlementOrder(order);
    setPaymentRef(`PAY-JW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentNotes(`Wages settlement for ${order.jobWorkNumber} - ${order.finishedProduct?.name || 'Finished Goods'}`);
  };

  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementOrder) return;

    const wageState = getWageState(settlementOrder);
    const totalAmount = wageState.fixedWage;

    setWageStates((prev) => ({
      ...prev,
      [settlementOrder.id]: {
        ...wageState,
        isSettled: true,
        settledAt: paymentDate,
        paymentMode: paymentMode,
        referenceNo: paymentRef,
        settledAmount: totalAmount,
        notes: paymentNotes,
      },
    }));

    toast(
      'Wages Settled Successfully',
      `Paid ₹ ${totalAmount.toLocaleString('en-IN')} to ${settlementOrder.jobWorkCompany?.companyName}`,
      'success',
    );
    setSettlementOrder(null);
  };

  // Filtered list
  const filteredOrders = closedOrders.filter((order) => {
    const state = getWageState(order);
    const matchesSearch =
      order.jobWorkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.jobWorkCompany?.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.finishedProduct?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVendor = selectedVendor ? order.jobWorkCompanyId === selectedVendor : true;

    const matchesTab =
      filterTab === 'ALL'
        ? true
        : filterTab === 'SETTLED'
        ? state.isSettled
        : !state.isSettled;

    return matchesSearch && matchesVendor && matchesTab;
  });

  // Calculate high-level KPIs
  const totalClosedCount = closedOrders.length;
  const totalPiecesProduced = closedOrders.reduce((sum, o) => {
    return sum + (isDiscreteUnit(o) ? Number(o.totalReturnedQty) || 0 : 0);
  }, 0);

  const totalCalculatedWages = closedOrders.reduce((sum, o) => {
    const st = getWageState(o);
    return sum + (Number(st.fixedWage) || 0);
  }, 0);

  const totalSettledWages = closedOrders.reduce((sum, o) => {
    const st = getWageState(o);
    return sum + (st.isSettled ? Number(st.settledAmount || st.fixedWage) || 0 : 0);
  }, 0);

  const pendingSettlementWages = Math.max(0, totalCalculatedWages - totalSettledWages);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Calculator className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Job Work Subcontractor Wages & Piece-Rate Settlements
            </h1>
          </div>
        </div>
      </div>

      {/* Unified Module Navigation Tabs */}
      <SalaryNavTabs />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Closed Job Works</span>
            <span className="text-2xl font-bold text-foreground font-mono mt-1 block">
              {totalClosedCount} Orders
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Finished Goods Produced</span>
            <span className="text-2xl font-bold text-foreground font-mono mt-1 block">
              {totalPiecesProduced.toLocaleString('en-IN')} Pcs
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Wages Payable</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
              ₹ {totalCalculatedWages.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Disbursed / Settled</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono mt-1 block">
              ₹ {totalSettledWages.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-400 block font-mono mt-0.5">
              (₹ {pendingSettlementWages.toLocaleString('en-IN')} Pending)
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Coins className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-secondary/20 border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterTab === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'text-muted-foreground hover:text-foreground bg-muted/40'
              }`}
            >
              All Closed ({closedOrders.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterTab === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'text-muted-foreground hover:text-foreground bg-muted/40'
              }`}
            >
              Pending Settlement (
              {closedOrders.filter((o) => !getWageState(o).isSettled).length}
              )
            </button>
            <button
              onClick={() => setFilterTab('SETTLED')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filterTab === 'SETTLED'
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground bg-muted/40'
              }`}
            >
              Settled & Paid (
              {closedOrders.filter((o) => getWageState(o).isSettled).length}
              )
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-md justify-end">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order #, subcontractor, product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-secondary/60 text-foreground text-xs pl-9 pr-3 py-2 rounded-md border border-border focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Closed Job Work Wages Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              Closed Job Works Wage Settlement Register
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase">
              <tr>
                <th className="p-3.5 w-10 text-center">#</th>
                <th className="p-3.5 min-w-[140px]">Order # & Date</th>
                <th className="p-3.5 min-w-[200px]">Job Worker / Contractor</th>
                <th className="p-3.5 min-w-[200px]">Finished Product</th>
                <th className="p-3.5 w-28 text-right">Output Quantity</th>
                <th className="p-3.5 min-w-[220px]">Rate / Wage Calculation</th>
                <th className="p-3.5 w-32 text-right">Total Wage (₹)</th>
                <th className="p-3.5 w-28 text-center">Status</th>
                <th className="p-3.5 w-36 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const state = getWageState(order);
                  const isPiece = isDiscreteUnit(order);
                  const returnedQty = Number(order.totalReturnedQty) || (isPiece ? 100 : 1);
                  const returnedWeight = Number(order.totalReturnedWeight) || 0;
                  const uom =
                    order.finishedProduct?.unit?.abbreviation ||
                    order.finishedProduct?.unit?.name ||
                    (isPiece ? 'Pcs' : 'Kg');

                  const calculatedTotal = isPiece
                    ? Number((returnedQty * (state.ratePerPiece || 0)).toFixed(2))
                    : state.fixedWage || 0;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        state.isSettled ? 'bg-emerald-500/[0.02]' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center font-mono text-muted-foreground">{index + 1}</td>
                      <td className="p-3.5">
                        <Link
                          href={`/job-work/${order.id}`}
                          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline block"
                        >
                          {order.jobWorkNumber}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">
                          Closed: {order.closedAt ? new Date(order.closedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground block">
                              {order.jobWorkCompany?.companyName || 'Subcontractor'}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {order.jobWorkCompany?.contactPerson || 'Contact'} • {order.jobWorkCompany?.phone || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-foreground block">
                          {order.finishedProduct?.name || 'Tailored Finished Good'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant="outline"
                            className={
                              isPiece
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-mono'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-mono'
                            }
                          >
                            {uom}
                          </Badge>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {order.finishedProduct?.sku || 'FG-AUTO'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        <span className="font-bold text-foreground block text-sm">
                          {isPiece ? `${returnedQty} Pcs` : `${returnedWeight.toFixed(1)} Kg`}
                        </span>
                        {returnedWeight > 0 && isPiece && (
                          <span className="text-[10px] text-muted-foreground block">({returnedWeight} Kg Fabric)</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {isPiece ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-muted-foreground">₹ Rate / Pc:</span>
                              <div className="w-24">
                                <Input
                                  type="number"
                                  step="0.10"
                                  min="0"
                                  value={state.ratePerPiece}
                                  onChange={(e) =>
                                    updateRatePerPiece(order.id, order, parseFloat(e.target.value) || 0)
                                  }
                                  disabled={state.isSettled}
                                  className="h-7 text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground block">
                              Formula: {returnedQty} Pcs × ₹{(state.ratePerPiece || 0).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-muted-foreground">Wage Amount:</span>
                              <div className="w-28">
                                <Input
                                  type="number"
                                  step="50"
                                  min="0"
                                  value={state.fixedWage}
                                  onChange={(e) => updateFixedWage(order.id, order, parseFloat(e.target.value) || 0)}
                                  disabled={state.isSettled}
                                  placeholder="Enter ₹"
                                  className="h-7 text-xs font-mono font-bold"
                                />
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground block">
                              Custom fee ({returnedWeight} Kg processed)
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        <span className="text-sm font-bold text-emerald-400 block">
                          ₹ {calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {state.isSettled && (
                          <span className="text-[10px] text-muted-foreground block">
                            Paid via {state.paymentMode?.split(' ')[0] || 'Bank'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {state.isSettled ? (
                          <Badge variant="success" className="text-[10px] flex items-center justify-center gap-1">
                            <Check className="h-3 w-3" /> SETTLED
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3" /> UNPAID
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {state.isSettled ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVoucherOrder(order)}
                            leftIcon={<FileText className="h-3.5 w-3.5 text-emerald-400" />}
                            className="text-xs text-emerald-400 hover:bg-emerald-500/10 h-7"
                          >
                            Voucher
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenSettlement(order)}
                            leftIcon={<CreditCard className="h-3.5 w-3.5" />}
                            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-500"
                          >
                            Settle Wages
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-xs font-medium">No closed job work orders found matching your filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredOrders.length > 0 && (
              <tfoot className="bg-muted/40 border-t border-border font-semibold text-foreground">
                <tr>
                  <td colSpan={4} className="p-3.5 text-right font-medium">
                    Total Wage Payable ({filteredOrders.length} orders):
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-foreground">
                    {totalPiecesProduced} Pcs
                  </td>
                  <td className="p-3.5"></td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                    ₹{' '}
                    {filteredOrders
                      .reduce((sum, o) => sum + (Number(getWageState(o).fixedWage) || 0), 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="p-3.5 text-right text-xs text-muted-foreground font-mono">
                    Settled: ₹{' '}
                    {filteredOrders
                      .reduce((sum, o) => sum + (getWageState(o).isSettled ? Number(getWageState(o).fixedWage) || 0 : 0), 0)
                      .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Settle Wages Payment Modal */}
      {settlementOrder && (
        <Modal
          isOpen={Boolean(settlementOrder)}
          onClose={() => setSettlementOrder(null)}
          title="Settle Job Work Contractor Wages"
          description={`Record wage payout for Order #${settlementOrder.jobWorkNumber}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmSettlement} className="space-y-4 pt-2">
            <div className="bg-secondary/30 p-3 rounded-lg border border-border space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subcontractor:</span>
                <span className="font-semibold text-foreground">
                  {settlementOrder.jobWorkCompany?.companyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finished Product Output:</span>
                <span className="font-mono text-foreground font-medium">
                  {settlementOrder.finishedProduct?.name} ({settlementOrder.totalReturnedQty} {isDiscreteUnit(settlementOrder) ? 'Pcs' : 'Kg'})
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5">
                <span className="font-semibold text-foreground">Calculated Wage Amount:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ₹ {getWageState(settlementOrder).fixedWage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Method</label>
              <Select
                options={[
                  { label: 'Bank Transfer (NEFT / RTGS / IMPS)', value: 'Bank Transfer (NEFT)' },
                  { label: 'UPI / Digital Transfer', value: 'Bank Transfer (UPI)' },
                  { label: 'Cash Payment', value: 'Cash' },
                  { label: 'Cheque Payment', value: 'Cheque' },
                ]}
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Date</label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">UTR / Reference No.</label>
                <Input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UTR-98721245"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Voucher Notes / Narration</label>
              <Input
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Remarks on settlement"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={() => setSettlementOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500"
                leftIcon={<Check className="h-4 w-4" />}
              >
                Confirm Payout & Settle
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Payment Voucher Dialog */}
      {voucherOrder && (
        <Modal
          isOpen={Boolean(voucherOrder)}
          onClose={() => setVoucherOrder(null)}
          title="Job Work Wage Settlement Voucher"
          description={`Payment Advice #${getWageState(voucherOrder).referenceNo || 'VOUCHER-01'}`}
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="border border-border p-4 rounded-xl bg-card space-y-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">
                    Shri Lathikka Surgicals
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    SF No 142/2A, Pallipalayam Main Road, Komarapalayam, Tamil Nadu - 638183
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">GSTIN: 33AABCS1429M1ZQ</p>
                </div>
                <div className="text-right">
                  <Badge variant="success" className="font-mono text-xs">
                    PAID & SETTLED
                  </Badge>
                  <span className="block text-[11px] font-mono text-muted-foreground mt-1">
                    Date: {getWageState(voucherOrder).settledAt || '2026-08-16'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Paid To (Job Worker):</span>
                  <span className="font-bold text-foreground text-sm block">
                    {voucherOrder.jobWorkCompany?.companyName}
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    Contact: {voucherOrder.jobWorkCompany?.contactPerson} ({voucherOrder.jobWorkCompany?.phone})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[11px]">Job Work Reference:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                    {voucherOrder.jobWorkNumber}
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    Challan: {voucherOrder.challanNumber || 'DC-2026-0008'}
                  </span>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 font-semibold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-2">Description / Finished Output</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2">
                        <span className="font-medium text-foreground">
                          {voucherOrder.finishedProduct?.name}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          Tailoring / Processing piece wages
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono">
                        {isDiscreteUnit(voucherOrder)
                          ? `${voucherOrder.totalReturnedQty} Pcs`
                          : `${voucherOrder.totalReturnedWeight} Kg`}
                      </td>
                      <td className="p-2 text-right font-mono">
                        {isDiscreteUnit(voucherOrder)
                          ? `₹ ${(getWageState(voucherOrder).ratePerPiece || 3.5).toFixed(2)}`
                          : 'Custom Fee'}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-foreground">
                        ₹{' '}
                        {getWageState(voucherOrder).fixedWage.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t border-border bg-muted/20 font-bold">
                    <tr>
                      <td colSpan={3} className="p-2 text-right">
                        Net Amount Disbursed:
                      </td>
                      <td className="p-2 text-right font-mono text-emerald-400 text-sm">
                        ₹{' '}
                        {getWageState(voucherOrder).fixedWage.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-between items-center text-[11px] text-muted-foreground border-t border-border pt-2">
                <span>
                  Payment Mode: <strong className="text-foreground">{getWageState(voucherOrder).paymentMode}</strong>
                </span>
                <span>
                  Reference / UTR: <strong className="font-mono text-foreground">{getWageState(voucherOrder).referenceNo}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-3.5 w-3.5" />}
              >
                Print Voucher
              </Button>
              <Button variant="primary" size="sm" onClick={() => setVoucherOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
