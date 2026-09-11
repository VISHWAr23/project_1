export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface ReportQueryFilter {
  startDate?: string;
  endDate?: string;
  jobWorkCompanyId?: string;
  departmentId?: string;
  status?: string;
  search?: string;
}

// 1. Job Working Company Report
export interface JobWorkOrderBreakdown {
  id: string;
  orderNumber: string;
  challanNumber?: string;
  processType: string;
  status: string;
  createdAt: string;
  closedAt?: string;
  issuedWeightKg: number;
  returnedWeightKg: number;
  scrapWeightKg: number;
  pendingWeightKg: number;
  scrapPercentage: number;
  earnedWages: number;
  settledAmount: number;
  balancePending: number;
  materialDetails: {
    materialName: string;
    lotNumber?: string;
    issuedRolls: number;
    returnedRolls: number;
    ratePerUnit: number;
  }[];
}

export interface JobWorkCompanySummary {
  companyId: string;
  companyName: string;
  companyCode: string;
  contactPerson?: string;
  phone?: string;
  gstin?: string;
  city?: string;
  processTypes: string[];
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalIssuedWeightKg: number;
  totalReturnedWeightKg: number;
  totalScrapWeightKg: number;
  totalPendingWeightKg: number;
  avgScrapPercentage: number;
  totalWagesEarned: number;
  totalSettledAmount: number;
  totalOutstandingBalance: number;
  orders: JobWorkOrderBreakdown[];
}

export interface JobWorkCompanyReportResponse {
  dateRange: ReportDateRange;
  filterCompanyId?: string;
  summary: {
    totalCompanies: number;
    totalOrders: number;
    totalIssuedWeightKg: number;
    totalReturnedWeightKg: number;
    totalScrapWeightKg: number;
    totalPendingWeightKg: number;
    totalWagesEarned: number;
    totalSettledAmount: number;
    totalOutstandingBalance: number;
    overallScrapRate: number;
  };
  companies: JobWorkCompanySummary[];
}

// 2. Stock Valuation
export interface StockValuationItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  currentStock: number;
  uom: string;
  reorderLevel: number;
  unitCost: number;
  totalValuation: number;
  isLowStock: boolean;
  warehouseLocation?: string;
}

export interface StockValuationReportResponse {
  asOfDate: string;
  summary: {
    totalItems: number;
    totalValuation: number;
    lowStockCount: number;
  };
  categoryBreakdown: {
    category: string;
    itemCount: number;
    valuation: number;
  }[];
  items: StockValuationItem[];
}

// 3. Production Efficiency
export interface ProductionEfficiencyReportResponse {
  dateRange: ReportDateRange;
  summary: {
    totalBatches: number;
    totalInputWeightKg: number;
    totalOutputWeightKg: number;
    totalWastageKg: number;
    overallYieldRate: number;
    gauzeBatchesCount: number;
    gamjeeBatchesCount: number;
  };
  gauzeProduction: {
    totalBatches: number;
    inputKg: number;
    outputKg: number;
    wastageKg: number;
    avgYieldRate: number;
    batches: {
      id: string;
      batchNumber: string;
      status: string;
      inputQuantity: number;
      outputQuantity: number;
      yieldPercentage: number;
      startDate: string;
      completedDate?: string;
    }[];
  };
  gamjeeProduction: {
    totalBatches: number;
    inputKg: number;
    outputKg: number;
    wastageKg: number;
    avgYieldRate: number;
    batches: {
      id: string;
      batchNumber: string;
      status: string;
      productionQuantity: number;
      outputQuantity: number;
      yieldPercentage: number;
      startDate: string;
      completedDate?: string;
    }[];
  };
}

// 4. Payroll & Expense
export interface PayrollExpenseReportResponse {
  dateRange: ReportDateRange;
  summary: {
    activeStaff: number;
    attendanceRate: number;
    presentDaysRecorded: number;
    totalGrossPayroll: number;
    totalNetDisbursed: number;
    totalPayrollRuns: number;
  };
  attendanceSummary: {
    status: string;
    count: number;
  }[];
  payrollRuns: {
    id: string;
    payrollCode: string;
    month: number;
    year: number;
    periodType: string;
    totalEmployees: number;
    totalGross: number;
    totalNet: number;
    status: string;
    generatedAt: string;
  }[];
}

// 5. Customer Orders
export interface CustomerOrdersReportResponse {
  dateRange: ReportDateRange;
  summary: {
    totalOrders: number;
    fulfilledOrders: number;
    pendingOrders: number;
    fulfillmentRate: number;
    totalRevenue: number;
    deliveredRevenue: number;
  };
  topCustomers: {
    customerName: string;
    orderCount: number;
    totalAmount: number;
  }[];
  orders: {
    id: string;
    orderNumber: string;
    customerName: string;
    orderDate: string;
    deliveryDueDate?: string;
    totalAmount: number;
    status: string;
    itemCount: number;
  }[];
}

// 6. Executive Overview
export interface ExecutiveOverviewResponse {
  dateRange: ReportDateRange;
  kpis: {
    totalJobWorkOrders: number;
    jobWorkIssuedKg: number;
    jobWorkReturnedKg: number;
    jobWorkWagesEarned: number;
    jobWorkPendingSettlement: number;
    totalInventoryValuation: number;
    lowStockAlertCount: number;
    productionYieldRate: number;
    totalBatches: number;
    payrollDisbursed: number;
    activeStaffCount: number;
    attendanceRate: number;
    ordersRevenue: number;
    orderFulfillmentRate: number;
  };
}
