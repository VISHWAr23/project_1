import { apiClient } from './api-client';
import {
  CustomerOrder,
  CustomerOrderStats,
  CustomerOrderListResponse,
  CreateCustomerOrderPayload,
  RecordOrderDispatchPayload,
  CustomerOrderQueryFilters,
} from '@/types/customer-orders.types';

export const customerOrdersService = {
  async getAll(params?: CustomerOrderQueryFilters): Promise<CustomerOrderListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    try {
      return await apiClient<CustomerOrderListResponse>(`/customer-orders?${query.toString()}`);
    } catch {
      return getMockCustomerOrderList(params);
    }
  },

  async getStats(): Promise<CustomerOrderStats> {
    try {
      return await apiClient<CustomerOrderStats>('/customer-orders/stats');
    } catch {
      return {
        totalOrdersCount: mockOrders.length,
        totalOrdersValue: mockOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        totalPaidAmount: mockOrders.reduce((sum, o) => sum + o.paidAmount, 0),
        pendingPaymentAmount: mockOrders.reduce((sum, o) => sum + (o.totalAmount - o.paidAmount), 0),
        confirmedCount: mockOrders.filter((o) => o.status === 'CONFIRMED').length,
        partiallyDispatchedCount: mockOrders.filter((o) => o.status === 'PARTIALLY_DISPATCHED').length,
        dispatchedCount: mockOrders.filter((o) => o.status === 'DISPATCHED' || o.status === 'DELIVERED').length,
        cancelledCount: mockOrders.filter((o) => o.status === 'CANCELLED').length,
      };
    }
  },

  async getById(id: string): Promise<CustomerOrder> {
    try {
      return await apiClient<CustomerOrder>(`/customer-orders/${id}`);
    } catch {
      const found = mockOrders.find((o) => o.id === id || o.orderNumber === id);
      if (found) return found;
      return mockOrders[0];
    }
  },

  async create(payload: CreateCustomerOrderPayload): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>('/customer-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<CreateCustomerOrderPayload>): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateStatus(id: string, payload: { status: string; notes?: string }): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async recordDispatch(id: string, payload: RecordOrderDispatchPayload): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}/dispatch`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async recordPayment(
    id: string,
    payload: { amount: number; paymentMethod?: string; paymentStatus?: string; notes?: string }
  ): Promise<CustomerOrder> {
    return await apiClient<CustomerOrder>(`/customer-orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return await apiClient<{ message: string }>(`/customer-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

const mockOrders: CustomerOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-0001',
    customerId: 'cust-1',
    customer: {
      id: 'cust-1',
      code: 'CUST-001',
      name: 'Apollo Hospitals Enterprise Ltd',
      contactPerson: 'Dr. Ramesh Kumar',
      phone: '+91 98450 12345',
      email: 'procurement@apollohospitals.com',
      city: 'Chennai',
      state: 'Tamil Nadu',
      gstin: '33AAACA0000A1Z5',
      creditLimit: 1000000,
      isActive: true,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
    },
    orderDate: '2026-08-20',
    deliveryDueDate: '2026-09-02',
    status: 'IN_PRODUCTION',
    priority: 'HIGH',
    paymentStatus: 'PARTIALLY_PAID',
    paymentMethod: 'BANK_TRANSFER',
    subtotal: 185000,
    taxAmount: 22200,
    discountAmount: 0,
    shippingCharges: 2500,
    totalAmount: 209700,
    paidAmount: 100000,
    dlNo: 'DL-20B/21B-4492',
    transportName: 'VRL Logistics Express',
    shippingAddress: 'Central Pharmacy Warehouse, Apollo Health City, Chennai',
    billingAddress: '21 Greams Lane, Thousand Lights, Chennai',
    transportMode: 'ROAD',
    trackingNumber: 'TN-EXP-4492',
    notes: 'Urgent consignment for surgical trauma ward',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-22T14:30:00Z',
    items: [
      {
        id: 'item-1',
        orderId: 'ord-1',
        itemName: 'Sterile Gauze Swab 10cm x 10cm (12 Ply)',
        specification: '100 pcs per sterile inner box • 100% Bleached Cotton',
        quantity: 300,
        uom: 'Boxes',
        unitPrice: 420,
        taxRate: 12,
        taxAmount: 15120,
        discount: 0,
        totalPrice: 141120,
        deliveredQuantity: 0,
      },
      {
        id: 'item-2',
        orderId: 'ord-1',
        itemName: 'Roller Gauze Bandage 15cm x 4m',
        specification: 'Individually wrapped rolls • Woven edge',
        quantity: 500,
        uom: 'Rolls',
        unitPrice: 118,
        taxRate: 12,
        taxAmount: 7080,
        discount: 0,
        totalPrice: 66080,
        deliveredQuantity: 0,
      },
    ],
    statusHistory: [
      {
        id: 'sh-1',
        orderId: 'ord-1',
        toStatus: 'CONFIRMED',
        notes: 'Order placed by Apollo procurement',
        changedAt: '2026-08-20T10:00:00Z',
      },
      {
        id: 'sh-2',
        orderId: 'ord-1',
        fromStatus: 'CONFIRMED',
        toStatus: 'IN_PRODUCTION',
        notes: 'Batch production #GZ-2026-088 allocated for order cutting & packing',
        changedAt: '2026-08-21T09:00:00Z',
      },
    ],
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-0002',
    customerId: 'cust-2',
    customer: {
      id: 'cust-2',
      code: 'CUST-002',
      name: 'Fortis Healthcare Ltd',
      contactPerson: 'Ms. Priya Sharma',
      phone: '+91 98112 34567',
      email: 'priya.sharma@fortishealthcare.com',
      city: 'Bengaluru',
      state: 'Karnataka',
      gstin: '29AAACF1234E1Z8',
      creditLimit: 750000,
      isActive: true,
      createdAt: '2026-01-18T11:00:00Z',
      updatedAt: '2026-08-22T09:30:00Z',
    },
    orderDate: '2026-08-24',
    deliveryDueDate: '2026-09-08',
    status: 'CONFIRMED',
    priority: 'NORMAL',
    paymentStatus: 'PENDING',
    paymentMethod: 'BANK_TRANSFER',
    subtotal: 94000,
    taxAmount: 11280,
    discountAmount: 0,
    shippingCharges: 1500,
    totalAmount: 106780,
    paidAmount: 0,
    shippingAddress: 'Fortis Hospital Pharmacy Store, Bannerghatta Road, Bengaluru',
    billingAddress: 'Fortis Healthcare Corporate Office, Bengaluru',
    transportMode: 'ROAD',
    notes: 'Routine monthly medical gauze stock replenishment',
    createdAt: '2026-08-24T11:00:00Z',
    updatedAt: '2026-08-24T11:00:00Z',
    items: [
      {
        id: 'item-3',
        orderId: 'ord-2',
        itemName: 'Gamjee Gauze Roll 10cm x 3m',
        specification: 'Highly absorbent cotton padded roll with gauze envelope',
        quantity: 400,
        uom: 'Rolls',
        unitPrice: 235,
        taxRate: 12,
        taxAmount: 11280,
        discount: 0,
        totalPrice: 105280,
        deliveredQuantity: 0,
      },
    ],
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-0003',
    customerId: 'cust-3',
    customer: {
      id: 'cust-3',
      code: 'CUST-003',
      name: 'MedPlus Pharmacy Chain',
      contactPerson: 'Suresh Varma',
      phone: '+91 98850 99887',
      email: 'supplychain@medplusindia.com',
      city: 'Hyderabad',
      state: 'Telangana',
      gstin: '36AABCM5678F1ZW',
      creditLimit: 500000,
      isActive: true,
      createdAt: '2026-02-05T14:20:00Z',
      updatedAt: '2026-08-25T16:45:00Z',
    },
    orderDate: '2026-08-15',
    deliveryDueDate: '2026-08-25',
    dispatchDate: '2026-08-24',
    status: 'DELIVERED',
    priority: 'NORMAL',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    subtotal: 145000,
    taxAmount: 17400,
    discountAmount: 2000,
    shippingCharges: 0,
    totalAmount: 160400,
    paidAmount: 160400,
    shippingAddress: 'MedPlus Central Distribution Hub, Kompally, Hyderabad',
    transportMode: 'ROAD',
    trackingNumber: 'VRL-HYD-9921',
    notes: 'Full consignment safely delivered and acknowledged',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-25T15:00:00Z',
    items: [
      {
        id: 'item-4',
        orderId: 'ord-3',
        itemName: 'Non-Sterile Gauze Swabs 7.5cm x 7.5cm (8 Ply)',
        specification: 'Bulk pack 1000 pcs per polybag',
        quantity: 100,
        uom: 'Packs',
        unitPrice: 1450,
        taxRate: 12,
        taxAmount: 17400,
        discount: 2000,
        totalPrice: 160400,
        deliveredQuantity: 100,
      },
    ],
  },
];

function getMockCustomerOrderList(params?: CustomerOrderQueryFilters): CustomerOrderListResponse {
  let filtered = [...mockOrders];
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(s) ||
        (o.customer && o.customer.name.toLowerCase().includes(s)) ||
        o.items.some((i) => i.itemName.toLowerCase().includes(s))
    );
  }
  if (params?.status && params.status !== 'ALL') {
    filtered = filtered.filter((o) => o.status === params.status);
  }
  if (params?.customerId) {
    filtered = filtered.filter((o) => o.customerId === params.customerId);
  }
  if (params?.paymentStatus) {
    filtered = filtered.filter((o) => o.paymentStatus === params.paymentStatus);
  }

  return {
    items: filtered,
    meta: {
      total: filtered.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
  };
}
