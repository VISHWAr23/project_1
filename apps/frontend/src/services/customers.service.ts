import { apiClient } from './api-client';
import {
  Customer,
  CustomerStats,
  CustomerListResponse,
  CreateCustomerPayload,
  CustomerQueryFilters,
} from '@/types/customers.types';

export const customersService = {
  async getAll(params?: CustomerQueryFilters): Promise<CustomerListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.customerType) query.append('customerType', params.customerType);
    if (params?.isActive !== undefined) query.append('isActive', params.isActive);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    try {
      return await apiClient<CustomerListResponse>(`/customers?${query.toString()}`);
    } catch {
      return getMockCustomerList(params);
    }
  },

  async getStats(): Promise<CustomerStats> {
    try {
      return await apiClient<CustomerStats>('/customers/stats');
    } catch {
      return {
        totalCustomers: mockCustomers.length,
        activeCustomers: mockCustomers.filter((c) => c.isActive).length,
        totalOrdersCount: 24,
        totalRevenue: 3450000,
        pendingFulfillmentCount: 6,
      };
    }
  },

  async getById(id: string): Promise<Customer> {
    try {
      return await apiClient<Customer>(`/customers/${id}`);
    } catch {
      const found = mockCustomers.find((c) => c.id === id);
      if (found) return found;
      return mockCustomers[0];
    }
  },

  async create(payload: CreateCustomerPayload): Promise<Customer> {
    return await apiClient<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<CreateCustomerPayload>): Promise<Customer> {
    return await apiClient<Customer>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return await apiClient<{ message: string }>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST-001',
    name: 'Apollo Hospitals Enterprise Ltd',
    contactPerson: 'Dr. Ramesh Kumar',
    email: 'procurement@apollohospitals.com',
    phone: '+91 98450 12345',
    alternatePhone: '+91 44 2829 0200',
    gstin: '33AAACA0000A1Z5',
    panNo: 'AAACA0000A',
    address: '21 Greams Lane, Thousand Lights, Chennai',
    shippingAddress: 'Central Warehouse, Apollo Health City, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600006',
    creditLimit: 1000000,
    creditDays: 30,
    paymentTerms: 'Net 30',
    customerType: 'HOSPITAL',
    isActive: true,
    notes: 'Premium hospital chain tier-1 account',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
    totalOrderValue: 1250000,
    pendingOrdersCount: 2,
    _count: { orders: 8 },
  },
  {
    id: 'cust-2',
    code: 'CUST-002',
    name: 'Fortis Healthcare Ltd',
    contactPerson: 'Ms. Priya Sharma',
    email: 'priya.sharma@fortishealthcare.com',
    phone: '+91 98112 34567',
    alternatePhone: '+91 80 6621 4444',
    gstin: '29AAACF1234E1Z8',
    panNo: 'AAACF1234E',
    address: 'Bannerghatta Road, Opposite IIMB, Bengaluru',
    shippingAddress: 'Fortis Hospital Pharmacy Store, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560076',
    creditLimit: 750000,
    creditDays: 30,
    paymentTerms: 'Net 30',
    customerType: 'HOSPITAL',
    isActive: true,
    notes: 'Regular fortnightly surgical gauze buyer',
    createdAt: '2026-01-18T11:00:00Z',
    updatedAt: '2026-08-22T09:30:00Z',
    totalOrderValue: 890000,
    pendingOrdersCount: 1,
    _count: { orders: 5 },
  },
  {
    id: 'cust-3',
    code: 'CUST-003',
    name: 'MedPlus Pharmacy Chain',
    contactPerson: 'Suresh Varma',
    email: 'supplychain@medplusindia.com',
    phone: '+91 98850 99887',
    gstin: '36AABCM5678F1ZW',
    panNo: 'AABCM5678F',
    address: 'Plot 12, Hitec City, Madhapur, Hyderabad',
    shippingAddress: 'MedPlus Central Distribution Hub, Kompally, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    pinCode: '500081',
    creditLimit: 500000,
    creditDays: 21,
    paymentTerms: 'Net 21',
    customerType: 'PHARMACY_CHAIN',
    isActive: true,
    notes: 'Retail pharmacy chain - regular retail pack gauze & bandages',
    createdAt: '2026-02-05T14:20:00Z',
    updatedAt: '2026-08-25T16:45:00Z',
    totalOrderValue: 620000,
    pendingOrdersCount: 3,
    _count: { orders: 6 },
  },
];

function getMockCustomerList(params?: CustomerQueryFilters): CustomerListResponse {
  let filtered = [...mockCustomers];
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.code.toLowerCase().includes(s) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(s)) ||
        (c.city && c.city.toLowerCase().includes(s)) ||
        (c.gstin && c.gstin.toLowerCase().includes(s))
    );
  }
  if (params?.customerType) {
    filtered = filtered.filter((c) => c.customerType === params.customerType);
  }
  if (params?.isActive !== undefined) {
    const active = params.isActive === 'true';
    filtered = filtered.filter((c) => c.isActive === active);
  }

  return {
    items: filtered,
    meta: {
      total: filtered.length,
      page: 1,
      limit: 50,
      totalPages: 1,
    },
  };
}
