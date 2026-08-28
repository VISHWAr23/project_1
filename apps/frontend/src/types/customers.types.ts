export interface Customer {
  id: string;
  code: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  gstin?: string | null;
  panNo?: string | null;
  address?: string | null;
  shippingAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  creditLimit: number;
  creditDays?: number | null;
  paymentTerms?: string | null;
  customerType?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  totalOrderValue?: number;
  pendingOrdersCount?: number;
  orders?: any[];
  _count?: {
    orders: number;
  };
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalOrdersCount: number;
  totalRevenue: number;
  pendingFulfillmentCount: number;
}

export interface CustomerListResponse {
  items: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomerPayload {
  code?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gstin?: string;
  panNo?: string;
  address?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  creditLimit?: number;
  creditDays?: number;
  paymentTerms?: string;
  customerType?: string;
  isActive?: boolean;
  notes?: string;
}

export interface CustomerQueryFilters {
  search?: string;
  customerType?: string;
  isActive?: string;
  page?: number;
  limit?: number;
}
