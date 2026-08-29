'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  AlertCircle,
  Sparkles,
  DollarSign,
  Building,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Table, Column } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/toast';
import {
  useCustomerOrders,
  useCustomerOrderStats,
  useCreateCustomerOrder,
  useUpdateOrderStatus,
  useRecordOrderDispatch,
  useRecordOrderPayment,
  useDeleteCustomerOrder,
} from '@/hooks/useCustomerOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import {
  CustomerOrder,
  OrderStatus,
  CreateCustomerOrderItemPayload,
} from '@/types/customer-orders.types';

export default function CustomerOrdersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useCustomerOrders({
    search: searchTerm || undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    priority: selectedPriority || undefined,
    paymentStatus: selectedPaymentStatus || undefined,
    customerId: selectedCustomer || undefined,
    page: currentPage,
    limit: 10,
  });

  const { data: stats } = useCustomerOrderStats();
  const { data: customersData } = useCustomers({ limit: 100 });
  const { data: rawMaterialsData } = useRawMaterials({ type: 'FG', limit: 100 });

  const createOrder = useCreateCustomerOrder();
  const updateStatus = useUpdateOrderStatus();
  const recordDispatch = useRecordOrderDispatch();
  const recordPayment = useRecordOrderPayment();
  const deleteOrder = useDeleteCustomerOrder();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<CustomerOrder | null>(null);
  const [dispatchOrder, setDispatchOrder] = useState<CustomerOrder | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<CustomerOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<CustomerOrder | null>(null);

  // Dispatch Form State for Partial / Full Delivery
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [dispatchTransportName, setDispatchTransportName] = useState('');
  const [dispatchTransportMode, setDispatchTransportMode] = useState('ROAD');
  const [dispatchTrackingNumber, setDispatchTrackingNumber] = useState('');
  const [dispatchItemQuantities, setDispatchItemQuantities] = useState<Record<string, number>>({});
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Create Order Wizard State
  const [orderPaymentTerm, setOrderPaymentTerm] = useState<'PAID' | 'TO_BE_PAID'>('TO_BE_PAID');
  const [orderFormData, setOrderFormData] = useState({
    customerId: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDueDate: '',
    priority: 'NORMAL',
    paymentMethod: 'BANK_TRANSFER',
    shippingCharges: '0',
    discountAmount: '0',
    dlNo: '',
    regdNo: '',
    transportName: '',
    transportMode: 'ROAD',
    trackingNumber: '',
    shippingAddress: '',
    billingAddress: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<CreateCustomerOrderItemPayload[]>([
    {
      itemName: '',
      specification: '',
      quantity: 100,
      uom: 'Boxes',
      unitPrice: 250,
      taxRate: 12,
      discount: 0,
    },
  ]);

  const orders = data?.items || [];
  const customers = customersData?.items || [];
  const materials = rawMaterialsData?.items || [];
  const finishedProducts = materials.filter(
    (m) => !m.sku?.startsWith('RM-') && !m.sku?.startsWith('PM-') && !m.isPackagingMaterial
  );

  // Recalculate totals for create wizard
  const calculatedSubtotal = lineItems.reduce((acc, curr) => {
    const base = (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0) - (Number(curr.discount) || 0);
    return acc + Math.max(0, base);
  }, 0);

  const calculatedTax = lineItems.reduce((acc, curr) => {
    const base = Math.max(0, (Number(curr.quantity) || 0) * (Number(curr.unitPrice) || 0) - (Number(curr.discount) || 0));
    return acc + (base * (Number(curr.taxRate) || 0)) / 100;
  }, 0);

  const calculatedNetTotal = Math.max(
    0,
    calculatedSubtotal +
      calculatedTax +
      (Number(orderFormData.shippingCharges) || 0) -
      (Number(orderFormData.discountAmount) || 0)
  );

  const handleCustomerSelect = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    setOrderFormData((prev) => ({
      ...prev,
      customerId,
      dlNo: cust?.dlNo || cust?.regdNo || '',
      regdNo: cust?.regdNo || cust?.dlNo || '',
      transportName: cust?.transportName || '',
      billingAddress: cust?.address || '',
      shippingAddress: cust?.shippingAddress || cust?.address || '',
    }));
  };

  const handleItemProductSelect = (index: number, productId: string) => {
    const prod = finishedProducts.find((m) => m.id === productId) || materials.find((m) => m.id === productId);
    if (!prod) return;

    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: prod.id,
        itemCode: prod.sku,
        itemName: prod.name,
        specification: prod.description || '',
        unitPrice: Number(prod.unitCost) || 100,
        uom: prod.unit?.name || 'Pcs',
        taxRate: Number(prod.gstRate) || 12,
      };
      return updated;
    });
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        itemName: '',
        specification: '',
        quantity: 50,
        uom: 'Boxes',
        unitPrice: 200,
        taxRate: 12,
        discount: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      toast('Requirement', 'An order must contain at least 1 item', 'warning');
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderFormData.customerId) {
      toast('Validation Error', 'Please select a customer account', 'error');
      return;
    }

    const invalidItem = lineItems.find((i) => !i.itemName.trim() || Number(i.quantity) <= 0);
    if (invalidItem) {
      toast('Validation Error', 'Please fill in all item names and valid quantities', 'error');
      return;
    }

    try {
      await createOrder.mutateAsync({
        customerId: orderFormData.customerId,
        orderDate: orderFormData.orderDate,
        deliveryDueDate: orderFormData.deliveryDueDate || undefined,
        priority: orderFormData.priority,
        paymentStatus: orderPaymentTerm === 'PAID' ? 'PAID' : 'PENDING',
        paymentMethod: orderPaymentTerm === 'PAID' ? orderFormData.paymentMethod : undefined,
        shippingCharges: Number(orderFormData.shippingCharges) || 0,
        discountAmount: Number(orderFormData.discountAmount) || 0,
        dlNo: orderFormData.dlNo || undefined,
        regdNo: orderFormData.regdNo || undefined,
        transportName: orderFormData.transportName || undefined,
        shippingAddress: orderFormData.shippingAddress,
        billingAddress: orderFormData.billingAddress,
        transportMode: orderFormData.transportMode,
        trackingNumber: orderFormData.trackingNumber,
        notes: orderFormData.notes,
        status: 'CONFIRMED',
        items: lineItems.map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          taxRate: Number(i.taxRate) || 0,
          discount: Number(i.discount) || 0,
        })),
      });

      toast('Order Created', `Order registered successfully (${orderPaymentTerm === 'PAID' ? 'Paid Upfront' : 'Pay After Delivery'})`, 'success');
      setIsCreateOpen(false);
      setOrderPaymentTerm('TO_BE_PAID');
      setOrderFormData({
        customerId: '',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDueDate: '',
        priority: 'NORMAL',
        paymentMethod: 'BANK_TRANSFER',
        shippingCharges: '0',
        discountAmount: '0',
        dlNo: '',
        regdNo: '',
        transportName: '',
        transportMode: 'ROAD',
        trackingNumber: '',
        shippingAddress: '',
        billingAddress: '',
        notes: '',
      });
      setLineItems([
        {
          itemName: '',
          specification: '',
          quantity: 100,
          uom: 'Boxes',
          unitPrice: 250,
          taxRate: 12,
          discount: 0,
        },
      ]);
      refetch();
    } catch (err: any) {
      toast('Order Creation Failed', err.message || 'Could not place order', 'error');
    }
  };

  // Open Dispatch Modal with pre-filled remaining quantities
  const handleOpenDispatchModal = (order: CustomerOrder) => {
    setDispatchOrder(order);
    setDispatchDate(new Date().toISOString().split('T')[0]);
    setDispatchTransportName(order.transportName || order.customer?.transportName || '');
    setDispatchTransportMode(order.transportMode || 'ROAD');
    setDispatchTrackingNumber(order.trackingNumber || '');
    setDispatchNotes('');

    const initialQtys: Record<string, number> = {};
    order.items.forEach((item) => {
      const remaining = Math.max(0, Number(item.quantity) - Number(item.deliveredQuantity || 0));
      initialQtys[item.id] = remaining;
    });
    setDispatchItemQuantities(initialQtys);
  };

  // Submit Partial / Full Dispatch
  const handleRecordDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;

    const itemsToDispatch = Object.entries(dispatchItemQuantities)
      .map(([itemId, dispatchQuantity]) => ({
        itemId,
        dispatchQuantity: Number(dispatchQuantity) || 0,
      }))
      .filter((i) => i.dispatchQuantity > 0);

    if (itemsToDispatch.length === 0) {
      toast('Validation Error', 'Please specify quantity to dispatch for at least one line item', 'warning');
      return;
    }

    try {
      const updated = await recordDispatch.mutateAsync({
        id: dispatchOrder.id,
        payload: {
          items: itemsToDispatch,
          dispatchDate,
          transportName: dispatchTransportName || undefined,
          transportMode: dispatchTransportMode,
          trackingNumber: dispatchTrackingNumber || undefined,
          notes: dispatchNotes || undefined,
        },
      });

      toast('Dispatch Recorded', `Order #${dispatchOrder.orderNumber} updated to ${updated.status}`, 'success');
      setDispatchOrder(null);
      if (viewingOrder?.id === dispatchOrder.id) {
        setViewingOrder(updated);
      }
      refetch();
    } catch (err: any) {
      toast('Dispatch Failed', err.message || 'Could not record dispatch', 'error');
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentOrder) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast('Validation Error', 'Please enter a valid payment amount', 'error');
      return;
    }

    try {
      await recordPayment.mutateAsync({
        id: paymentOrder.id,
        payload: {
          amount,
          paymentMethod,
          notes: paymentNotes,
        },
      });
      toast('Payment Recorded', `Received ₹${amount.toLocaleString('en-IN')}`, 'success');
      setPaymentOrder(null);
      setPaymentAmount('');
      setPaymentNotes('');
      refetch();
    } catch (err: any) {
      toast('Payment Error', err.message || 'Could not record payment', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    try {
      await deleteOrder.mutateAsync(deletingOrder.id);
      toast('Order Deleted', `Order #${deletingOrder.orderNumber} deleted`, 'success');
      setDeletingOrder(null);
      refetch();
    } catch (err: any) {
      toast('Deletion Failed', err.message || 'Could not delete order', 'error');
    }
  };

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'DRAFT':
      case 'IN_PRODUCTION':
      case 'READY_FOR_DISPATCH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Confirmed
          </span>
        );
      case 'PARTIALLY_DISPATCHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
            <Truck className="h-3 w-3" /> Partially Dispatched
          </span>
        );
      case 'DISPATCHED':
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Dispatched
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            Cancelled
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary text-muted-foreground">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            PARTIAL
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30" title="To be paid upon delivery">
            PAY AFTER DELIVERY
          </span>
        );
    }
  };

  const columns: Column<CustomerOrder>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      sortable: true,
      width: '130px',
      render: (row) => (
        <button
          onClick={() => setViewingOrder(row)}
          className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline text-left block text-xs"
        >
          {row.orderNumber}
        </button>
      ),
    },
    {
      key: 'customer',
      header: 'Customer / Client',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-foreground block text-xs">{row.customer?.name || 'Unknown Client'}</span>
          <span className="text-[11px] text-muted-foreground block">
            {row.customer?.city || 'Tamil Nadu'} • {row.customer?.phone || ''}
          </span>
        </div>
      ),
    },
    {
      key: 'orderDate',
      header: 'Order Date & Due',
      render: (row) => (
        <div className="text-xs font-mono">
          <span className="text-foreground block">{new Date(row.orderDate).toLocaleDateString('en-IN')}</span>
          <span className="text-[10px] text-muted-foreground block font-sans">
            Due: {row.deliveryDueDate ? new Date(row.deliveryDueDate).toLocaleDateString('en-IN') : 'Standard'}
          </span>
        </div>
      ),
    },
    {
      key: 'items' as any,
      header: 'Delivery Fulfillment',
      render: (row) => {
        const totalOrdered = row.items.reduce((s, i) => s + Number(i.quantity || 0), 0);
        const totalDelivered = row.items.reduce((s, i) => s + Number(i.deliveredQuantity || 0), 0);
        const pending = Math.max(0, totalOrdered - totalDelivered);

        return (
          <div className="text-xs space-y-1 min-w-[150px]">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="font-semibold text-foreground">
                {totalDelivered}/{totalOrdered} Delivered
              </span>
              {pending > 0 ? (
                <span className="text-amber-500 font-bold">({pending} left)</span>
              ) : (
                <span className="text-emerald-500 font-bold">✓ Fulfilled</span>
              )}
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  totalDelivered >= totalOrdered ? 'bg-emerald-500' : totalDelivered > 0 ? 'bg-amber-500' : 'bg-muted'
                }`}
                style={{ width: `${totalOrdered > 0 ? Math.min(100, (totalDelivered / totalOrdered) * 100) : 0}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      header: 'Value & Terms',
      align: 'right',
      render: (row) => (
        <div className="text-right text-xs font-mono">
          <span className="font-bold text-foreground block">
            ₹ {Number(row.totalAmount || 0).toLocaleString('en-IN')}
          </span>
          <div className="mt-0.5">{getPaymentBadge(row.paymentStatus)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Dispatch Status',
      align: 'center',
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: 'actions' as any,
      header: 'Actions',
      align: 'right',
      width: '160px',
      render: (row) => {
        const canDispatch = row.status !== 'DISPATCHED' && row.status !== 'DELIVERED' && row.status !== 'CANCELLED';

        return (
          <div className="flex items-center justify-end gap-1">
            {canDispatch && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1"
                onClick={() => handleOpenDispatchModal(row)}
                title="Dispatch Partial / Full Order"
              >
                <Truck className="h-3 w-3" />
                <span>Dispatch</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewingOrder(row)}
              title="View Invoice & Details"
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-blue-500" />
            </Button>

            {row.paymentStatus !== 'PAID' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setPaymentOrder(row);
                  setPaymentAmount(String(row.totalAmount - row.paidAmount));
                }}
                title="Record Payment"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-500 hover:text-emerald-400" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:text-red-500 text-muted-foreground"
              onClick={() => setDeletingOrder(row)}
              title="Delete Order"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12 w-full"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Customer Orders & Sales Fulfillment
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer orders, partial & full delivery dispatches, and payment settlement terms
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/raw-materials/customers">
            <Button variant="outline" size="sm" leftIcon={<Building className="h-3.5 w-3.5" />}>
              Customers Master
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create New Order
          </Button>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Total Orders Value</span>
            <span className="text-2xl font-bold text-emerald-500 font-mono mt-1 block">
              ₹ {(stats?.totalOrdersValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Confirmed Orders</span>
            <span className="text-2xl font-bold text-blue-500 font-mono mt-1 block">
              {stats?.confirmedCount || 0}
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Partially Dispatched</span>
            <span className="text-2xl font-bold text-amber-500 font-mono mt-1 block">
              {stats?.partiallyDispatchedCount || 0}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <RotateCcw className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Dispatched & Fulfilled</span>
            <span className="text-2xl font-bold text-emerald-500 font-mono mt-1 block">
              {stats?.dispatchedCount || 0}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <PackageCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Simplified Status Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'CONFIRMED', label: 'Confirmed (Pending Dispatch)' },
          { id: 'PARTIALLY_DISPATCHED', label: 'Partially Dispatched' },
          { id: 'DISPATCHED', label: 'Dispatched' },
          { id: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedStatus(tab.id);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedStatus === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-secondary/20 border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-blue-500" /> Search & Filter Sales Orders
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('ALL');
              setSelectedPriority('');
              setSelectedPaymentStatus('');
              setSelectedCustomer('');
              refetch();
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, Product, Tracking #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary/60 text-foreground text-xs pl-9 pr-3 py-2 rounded-md border border-border focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <Select
            options={[
              { label: 'All Customers', value: '' },
              ...customers.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id })),
            ]}
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          />

          <Select
            options={[
              { label: 'All Payment Terms', value: '' },
              { label: 'Paid in Full', value: 'PAID' },
              { label: 'Pay After Delivery', value: 'PENDING' },
              { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
            ]}
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Data Table */}
      <Table
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyMessage="No customer orders found matching your selected criteria."
        keyExtractor={(row) => row.id}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={data?.meta?.totalPages || 1}
        totalRecords={data?.meta?.total || 0}
        pageSize={10}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* CREATE NEW ORDER WIZARD MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Customer Sales Order"
        description="Draft and place an order with finished product lines and payment terms"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateOrderSubmit} className="space-y-5">
          {/* STEP 1: PAYMENT SETTLEMENT TERM SELECTION */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-primary/20 pb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-blue-500" /> Payment Terms / Settlement Type *
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">Settlement agreement with client</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Paid */}
              <div
                onClick={() => setOrderPaymentTerm('PAID')}
                className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                  orderPaymentTerm === 'PAID'
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                    : 'border-border bg-card/60 hover:border-border/80'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                    orderPaymentTerm === 'PAID' ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground'
                  }`}
                >
                  {orderPaymentTerm === 'PAID' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Paid (Paid in Full)</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Payment received upfront / advance before shipment
                  </p>
                </div>
              </div>

              {/* Option B: To Be Paid / Pay After Delivery */}
              <div
                onClick={() => setOrderPaymentTerm('TO_BE_PAID')}
                className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 ${
                  orderPaymentTerm === 'TO_BE_PAID'
                    ? 'border-blue-500 bg-blue-500/10 shadow-xs'
                    : 'border-border bg-card/60 hover:border-border/80'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                    orderPaymentTerm === 'TO_BE_PAID' ? 'border-blue-500 bg-blue-500' : 'border-muted-foreground'
                  }`}
                >
                  {orderPaymentTerm === 'TO_BE_PAID' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">To Be Paid (Pay After Delivery)</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Credit payment / invoice settlement upon goods delivery
                  </p>
                </div>
              </div>
            </div>

            {orderPaymentTerm === 'PAID' && (
              <div className="pt-2 border-t border-primary/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Payment Method</label>
                  <Select
                    options={[
                      { label: 'Bank Transfer (NEFT/RTGS)', value: 'BANK_TRANSFER' },
                      { label: 'UPI / QR Payment', value: 'UPI' },
                      { label: 'Cash Payment', value: 'CASH' },
                      { label: 'Cheque / Demand Draft', value: 'CHEQUE' },
                    ]}
                    value={orderFormData.paymentMethod}
                    onChange={(e) => setOrderFormData({ ...orderFormData, paymentMethod: e.target.value })}
                  />
                </div>
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Settlement Amount:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">₹ {calculatedNetTotal.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Customer & Dates */}
          <div className="bg-secondary/20 p-4 rounded-xl border border-border space-y-3">
            <h3 className="text-xs font-bold text-foreground border-b border-border pb-1">
              2. Customer, Regulatory & Transport Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Select Customer Account *
                </label>
                <Select
                  options={[
                    { label: 'Select Client...', value: '' },
                    ...customers.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id })),
                  ]}
                  value={orderFormData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                />
              </div>

              <Input
                label="Order Date"
                type="date"
                value={orderFormData.orderDate}
                onChange={(e) => setOrderFormData({ ...orderFormData, orderDate: e.target.value })}
                required
              />

              <Input
                label="Target Delivery Due Date"
                type="date"
                value={orderFormData.deliveryDueDate}
                onChange={(e) => setOrderFormData({ ...orderFormData, deliveryDueDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="D.L. No. / Regd. No."
                placeholder="e.g. DL-20B/21B-4492"
                value={orderFormData.dlNo}
                onChange={(e) => setOrderFormData({ ...orderFormData, dlNo: e.target.value })}
              />

              <Input
                label="Transport Carrier Name"
                placeholder="e.g. VRL Logistics / SRS Travels / ABT"
                value={orderFormData.transportName}
                onChange={(e) => setOrderFormData({ ...orderFormData, transportName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Priority</label>
                <Select
                  options={[
                    { label: 'Normal Priority', value: 'NORMAL' },
                    { label: 'High Priority', value: 'HIGH' },
                    { label: 'Urgent Dispatch', value: 'URGENT' },
                  ]}
                  value={orderFormData.priority}
                  onChange={(e) => setOrderFormData({ ...orderFormData, priority: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Transport Mode</label>
                <Select
                  options={[
                    { label: 'Road Transport', value: 'ROAD' },
                    { label: 'Express Courier', value: 'COURIER' },
                    { label: 'Local Factory Dispatch', value: 'LOCAL_DELIVERY' },
                  ]}
                  value={orderFormData.transportMode}
                  onChange={(e) => setOrderFormData({ ...orderFormData, transportMode: e.target.value })}
                />
              </div>

              <Input
                label="Vehicle / Tracking #"
                placeholder="TN-38-BZ-4589"
                value={orderFormData.trackingNumber}
                onChange={(e) => setOrderFormData({ ...orderFormData, trackingNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="bg-secondary/20 p-4 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1">
              <h3 className="text-xs font-bold text-foreground">
                3. Finished Goods Order Items ({lineItems.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLineItem}
                className="h-7 text-xs"
                leftIcon={<Plus className="h-3 w-3" />}
              >
                Add Item Line
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-card/60 rounded-lg border border-border/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-500">
                      Line Item #{idx + 1}
                    </span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-rose-400 hover:text-rose-300 text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-muted-foreground mb-1">
                        Select Finished Product
                      </label>
                      <Select
                        options={[
                          { label: 'Choose Finished Product...', value: '' },
                          ...finishedProducts.map((m) => ({ label: `${m.name} (${m.sku})`, value: m.id })),
                        ]}
                        value={item.productId || ''}
                        onChange={(e) => handleItemProductSelect(idx, e.target.value)}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Product Display Name"
                        placeholder="e.g. Sterile Gauze Swab 10x10cm"
                        value={item.itemName}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].itemName = e.target.value;
                          setLineItems(updated);
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].quantity = Number(e.target.value);
                        setLineItems(updated);
                      }}
                      required
                    />

                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">UOM</label>
                      <Select
                        options={[
                          { label: 'Boxes', value: 'Boxes' },
                          { label: 'Rolls', value: 'Rolls' },
                          { label: 'Pcs', value: 'Pcs' },
                          { label: 'Packs', value: 'Packs' },
                          { label: 'Bags', value: 'Bags' },
                          { label: 'Meters', value: 'Meters' },
                        ]}
                        value={item.uom}
                        onChange={(e) => {
                          const updated = [...lineItems];
                          updated[idx].uom = e.target.value;
                          setLineItems(updated);
                        }}
                      />
                    </div>

                    <Input
                      label="Unit Rate (₹)"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].unitPrice = Number(e.target.value);
                        setLineItems(updated);
                      }}
                      required
                    />

                    <Input
                      label="GST Tax (%)"
                      type="number"
                      value={item.taxRate}
                      onChange={(e) => {
                        const updated = [...lineItems];
                        updated[idx].taxRate = Number(e.target.value);
                        setLineItems(updated);
                      }}
                    />

                    <div className="text-right">
                      <span className="block text-[10px] text-muted-foreground mb-1 font-sans">
                        Line Total
                      </span>
                      <span className="block text-xs font-mono font-bold text-emerald-500 mt-2">
                        ₹{' '}
                        {(
                          (item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100)) -
                          (item.discount || 0)
                        ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Calculation Summary */}
          <div className="bg-secondary/30 p-4 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <Input
                label="Shipping / Delivery Charges (₹)"
                type="number"
                value={orderFormData.shippingCharges}
                onChange={(e) => setOrderFormData({ ...orderFormData, shippingCharges: e.target.value })}
              />
              <Input
                label="Order Discount (₹)"
                type="number"
                value={orderFormData.discountAmount}
                onChange={(e) => setOrderFormData({ ...orderFormData, discountAmount: e.target.value })}
              />
            </div>

            <div className="text-right font-mono space-y-1 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="text-xs text-muted-foreground flex justify-between sm:justify-end gap-6">
                <span>Taxable Subtotal:</span>
                <span>₹ {calculatedSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between sm:justify-end gap-6">
                <span>GST Tax:</span>
                <span>₹ {calculatedTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="text-sm font-bold text-foreground flex justify-between sm:justify-end gap-6 pt-1 border-t border-border">
                <span>Net Payable ({orderPaymentTerm === 'PAID' ? 'Paid Upfront' : 'Pay After Delivery'}):</span>
                <span className="text-emerald-500 font-bold">
                  ₹ {calculatedNetTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? 'Placing Order...' : 'Confirm & Place Order'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DISPATCH / PARTIAL DELIVERY MODAL */}
      <Modal
        isOpen={Boolean(dispatchOrder)}
        onClose={() => setDispatchOrder(null)}
        title={`Record Dispatch / Delivery (Order #${dispatchOrder?.orderNumber})`}
        maxWidth="2xl"
      >
        {dispatchOrder && (
          <form onSubmit={handleRecordDispatchSubmit} className="space-y-5">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Client: {dispatchOrder.customer?.name}</span>
                <span className="text-muted-foreground">Order Date: {new Date(dispatchOrder.orderDate).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block">Current Status</span>
                {getStatusBadge(dispatchOrder.status)}
              </div>
            </div>

            {/* Line Items Partial Dispatch Table */}
            <div className="border border-border rounded-xl p-4 bg-card/60 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-amber-500" /> Specify Quantities to Dispatch
                </h4>
                <span className="text-[11px] text-muted-foreground">Enter quantity to ship in this delivery batch</span>
              </div>

              <div className="space-y-3">
                {dispatchOrder.items.map((item) => {
                  const ordered = Number(item.quantity);
                  const alreadyDelivered = Number(item.deliveredQuantity || 0);
                  const remaining = Math.max(0, ordered - alreadyDelivered);
                  const currentDispatch = dispatchItemQuantities[item.id] !== undefined ? dispatchItemQuantities[item.id] : remaining;

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-secondary/30 rounded-lg border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-foreground block">{item.itemName}</span>
                        <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-muted-foreground">
                          <span>Ordered: <strong>{ordered} {item.uom}</strong></span>
                          <span>Already Shipped: <strong>{alreadyDelivered} {item.uom}</strong></span>
                          <span className={remaining > 0 ? 'text-amber-500 font-semibold' : 'text-emerald-500'}>
                            Pending: <strong>{remaining} {item.uom}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-48">
                        <label className="block text-[10px] text-muted-foreground mb-1 font-semibold">
                          Dispatch Now ({item.uom})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={remaining}
                          step="1"
                          value={currentDispatch}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDispatchItemQuantities((prev) => ({
                              ...prev,
                              [item.id]: val,
                            }));
                          }}
                          disabled={remaining <= 0}
                          className="h-8 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transport & Carrier Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Dispatch Date"
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                required
              />

              <Input
                label="Transport Carrier Name"
                placeholder="e.g. VRL Logistics / ABT"
                value={dispatchTransportName}
                onChange={(e) => setDispatchTransportName(e.target.value)}
              />

              <Input
                label="Vehicle / Tracking #"
                placeholder="TN-38-BZ-4589"
                value={dispatchTrackingNumber}
                onChange={(e) => setDispatchTrackingNumber(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="ghost" type="button" onClick={() => setDispatchOrder(null)} disabled={recordDispatch.isPending}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={recordDispatch.isPending} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                {recordDispatch.isPending ? 'Recording Dispatch...' : 'Confirm & Dispatch Goods'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* VIEW ORDER INVOICE & DETAILS MODAL */}
      <Modal
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        title={`Sales Order #${viewingOrder?.orderNumber}`}
        maxWidth="3xl"
      >
        {viewingOrder && (
          <div className="space-y-6" id="printable-invoice">
            {/* Printable Invoice Header */}
            <div className="p-5 bg-card rounded-xl border border-border space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">SHRI LATHIKKA SURGICALS</h2>
                  <p className="text-xs text-muted-foreground">
                    Manufacturers & Exporters of Medical Gauze & Surgical Dressing
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    GSTIN: 33AAACL1234F1Z9 • CIN: U24230TZ2020PTC033990
                  </p>
                </div>
                <div className="text-left sm:text-right font-mono">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                    {viewingOrder.orderNumber}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Date: {new Date(viewingOrder.orderDate).toLocaleDateString('en-IN')}
                  </span>
                  <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                </div>
              </div>

              {/* Status & Delivery Progress */}
              <div className="bg-secondary/40 p-3 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-blue-500" /> Dispatch & Delivery Status: {viewingOrder.status}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Payment Terms: <strong>{viewingOrder.paymentStatus === 'PAID' ? 'Paid in Full' : 'Pay After Delivery'}</strong>
                  </p>
                </div>

                {viewingOrder.status !== 'DISPATCHED' && viewingOrder.status !== 'DELIVERED' && viewingOrder.status !== 'CANCELLED' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const o = viewingOrder;
                      setViewingOrder(null);
                      handleOpenDispatchModal(o);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 gap-1"
                  >
                    <Truck className="h-3 w-3" /> Record Dispatch / Delivery
                  </Button>
                )}
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3 bg-secondary/20 rounded-lg border border-border space-y-1">
                  <span className="font-bold text-foreground block">Customer & Billing Details</span>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{viewingOrder.customer?.name}</p>
                  <p className="text-muted-foreground">{viewingOrder.billingAddress || viewingOrder.customer?.address || '—'}</p>
                  <p className="font-mono text-muted-foreground">GSTIN: {viewingOrder.customer?.gstin || '—'}</p>
                  <p className="font-mono text-muted-foreground">
                    D.L. No. / Regd. No.: {viewingOrder.dlNo || viewingOrder.regdNo || viewingOrder.customer?.dlNo || viewingOrder.customer?.regdNo || '—'}
                  </p>
                </div>

                <div className="p-3 bg-secondary/20 rounded-lg border border-border space-y-1">
                  <span className="font-bold text-foreground block">Shipping & Transport Details</span>
                  <p className="text-foreground">Transport Carrier: {viewingOrder.transportName || viewingOrder.customer?.transportName || '—'}</p>
                  <p className="text-muted-foreground">Transport Mode: {viewingOrder.transportMode || 'Road Transport'}</p>
                  <p className="font-mono text-muted-foreground">Vehicle / Tracking #: {viewingOrder.trackingNumber || '—'}</p>
                </div>
              </div>

              {/* Line Items Table with Delivery Tracking */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/60 text-muted-foreground font-mono uppercase text-[10px] border-b border-border">
                    <tr>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-right">Ordered</th>
                      <th className="py-2 px-3 text-right">Dispatched</th>
                      <th className="py-2 px-3 text-right">Pending</th>
                      <th className="py-2 px-3 text-right">Rate (₹)</th>
                      <th className="py-2 px-3 text-right">GST</th>
                      <th className="py-2 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {viewingOrder.items.map((i, idx) => {
                      const ordered = Number(i.quantity);
                      const dispatched = Number(i.deliveredQuantity || 0);
                      const pending = Math.max(0, ordered - dispatched);

                      return (
                        <tr key={i.id || idx}>
                          <td className="py-2.5 px-3 font-sans">
                            <span className="font-bold text-foreground block">{i.itemName}</span>
                            {i.specification && (
                              <span className="text-[10px] text-muted-foreground block">{i.specification}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right text-foreground font-bold">
                            {ordered} {i.uom}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-500 font-bold">
                            {dispatched} {i.uom}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-bold ${pending > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {pending} {i.uom}
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">
                            {Number(i.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">
                            {Number(i.taxRate)}%
                          </td>
                          <td className="py-2.5 px-3 text-right text-foreground font-bold">
                            {Number(i.totalPrice).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Grand Total Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-border font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Payment Status:</span>
                    {getPaymentBadge(viewingOrder.paymentStatus)}
                  </div>
                  <p className="text-muted-foreground">
                    Settled Amount: ₹ {Number(viewingOrder.paidAmount).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="space-y-1 text-right w-full sm:w-auto">
                  <div className="flex justify-between sm:justify-end gap-6 text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>₹ {Number(viewingOrder.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-6 text-muted-foreground">
                    <span>Tax:</span>
                    <span>₹ {Number(viewingOrder.taxAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-6 text-sm font-bold text-foreground pt-1 border-t border-border">
                    <span>Grand Total:</span>
                    <span className="text-emerald-500 font-bold">
                      ₹ {Number(viewingOrder.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="h-3.5 w-3.5" />}
              >
                Print Invoice / Packing Slip
              </Button>

              <div className="flex items-center gap-2">
                {viewingOrder.paymentStatus !== 'PAID' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      const o = viewingOrder;
                      setViewingOrder(null);
                      setPaymentOrder(o);
                      setPaymentAmount(String(o.totalAmount - o.paidAmount));
                    }}
                    leftIcon={<CreditCard className="h-3.5 w-3.5" />}
                  >
                    Record Payment
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setViewingOrder(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={Boolean(paymentOrder)}
        onClose={() => setPaymentOrder(null)}
        title={`Record Payment for Order #${paymentOrder?.orderNumber}`}
        maxWidth="md"
      >
        {paymentOrder && (
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 text-xs flex justify-between items-center font-mono">
              <span className="text-muted-foreground">Total: ₹ {paymentOrder.totalAmount.toLocaleString('en-IN')}</span>
              <span className="text-emerald-600 dark:text-emerald-400">Paid: ₹ {paymentOrder.paidAmount.toLocaleString('en-IN')}</span>
              <span className="text-rose-500 font-bold">
                Due: ₹ {(paymentOrder.totalAmount - paymentOrder.paidAmount).toLocaleString('en-IN')}
              </span>
            </div>

            <Input
              label="Payment Amount (₹)"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Payment Method</label>
              <Select
                options={[
                  { label: 'Bank Transfer (NEFT/RTGS)', value: 'BANK_TRANSFER' },
                  { label: 'UPI / Direct', value: 'UPI' },
                  { label: 'Cash Payment', value: 'CASH' },
                  { label: 'Cheque Deposit', value: 'CHEQUE' },
                ]}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" type="button" onClick={() => setPaymentOrder(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? 'Recording...' : 'Record Payment Receipt'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE ORDER MODAL */}
      <Modal
        isOpen={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        title="Delete Customer Order"
        maxWidth="sm"
      >
        {deletingOrder && (
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground">
              Are you sure you want to delete order <strong className="text-foreground">#{deletingOrder.orderNumber}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setDeletingOrder(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleteOrder.isPending}>
                {deleteOrder.isPending ? 'Deleting...' : 'Delete Order'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
