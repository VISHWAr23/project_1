import { Customer } from './customers.types';
import { RawMaterial } from './raw-materials.types';

export type OrderStatus =
  | 'CONFIRMED'
  | 'PARTIALLY_DISPATCHED'
  | 'DISPATCHED'
  | 'CANCELLED'
  | 'DRAFT'
  | 'IN_PRODUCTION'
  | 'READY_FOR_DISPATCH'
  | 'DELIVERED';

export type OrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type OrderPaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface CustomerOrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  product?: Partial<RawMaterial> | null;
  itemCode?: string | null;
  itemName: string;
  specification?: string | null;
  quantity: number;
  uom: string;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalPrice: number;
  deliveredQuantity: number;
  notes?: string | null;
  createdAt?: string;
}

export interface CustomerOrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: string | null;
  toStatus: string;
  notes?: string | null;
  changedById?: string | null;
  changedByUser?: {
    id: string;
    email: string;
  } | null;
  changedAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  orderDate: string;
  deliveryDueDate?: string | null;
  dispatchDate?: string | null;
  status: OrderStatus;
  priority: OrderPriority;
  paymentStatus: OrderPaymentStatus;
  paymentMethod?: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCharges: number;
  totalAmount: number;
  paidAmount: number;
  dlNo?: string | null;
  regdNo?: string | null;
  transportName?: string | null;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  transportMode?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdBy?: {
    id: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
  statusHistory?: CustomerOrderStatusHistory[];
  _count?: {
    items: number;
  };
}

export interface CustomerOrderStats {
  totalOrdersCount: number;
  totalOrdersValue: number;
  totalPaidAmount: number;
  pendingPaymentAmount: number;
  confirmedCount: number;
  partiallyDispatchedCount: number;
  dispatchedCount: number;
  cancelledCount: number;
}

export interface DispatchItemPayload {
  itemId: string;
  dispatchQuantity: number;
}

export interface RecordOrderDispatchPayload {
  items: DispatchItemPayload[];
  dispatchDate?: string;
  transportName?: string;
  transportMode?: string;
  trackingNumber?: string;
  notes?: string;
}

export interface CustomerOrderListResponse {
  items: CustomerOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomerOrderItemPayload {
  productId?: string;
  itemCode?: string;
  itemName: string;
  specification?: string;
  quantity: number;
  uom?: string;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
  notes?: string;
}

export interface CreateCustomerOrderPayload {
  orderNumber?: string;
  customerId: string;
  orderDate?: string;
  deliveryDueDate?: string;
  status?: string;
  priority?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  shippingCharges?: number;
  discountAmount?: number;
  dlNo?: string;
  regdNo?: string;
  transportName?: string;
  shippingAddress?: string;
  billingAddress?: string;
  transportMode?: string;
  trackingNumber?: string;
  notes?: string;
  items: CreateCustomerOrderItemPayload[];
}

export interface CustomerOrderQueryFilters {
  search?: string;
  customerId?: string;
  status?: string;
  priority?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
