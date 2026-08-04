export interface DashboardSummary {
  totalEmployees: number;
  totalEmployeesChange: number;
  jobWorkCompanies: number;
  activeJobChallans: number;
  rawMaterialsCount: number;
  totalStockValuation: number;
  finishedProductsCount: number;
  todayProduction: number;
  todayProductionChange: number;
  todayMaterialIssues: number;
  todayMaterialIssuesCount: number;
  productReturns: number;
  rejectionRate: number;
  pendingWorkOrders: number;
  highPriorityPendingOrders: number;
  completedWorkOrders: number;
  completedThisMonth: number;
  lowStockCount: number;
}

export interface MonthlyProductionItem {
  month: string;
  planned: number;
  completed: number;
}

export interface DailyProductionTrendItem {
  date: string;
  units: number;
}

export interface MaterialUsageItem {
  name: string;
  value: number;
  color?: string;
}

export interface EmployeeProductivityItem {
  department: string;
  efficiency: number;
  unitsProduced: number;
  hoursLogged: number;
}

export interface SalaryExpenseItem {
  month: string;
  baseSalary: number;
  deductions: number;
  netSalary: number;
}

export interface InventoryStatusItem {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface MonthlyPurchaseTrendItem {
  month: string;
  purchaseAmount: number;
  ordersCount: number;
}

export interface DashboardChartsData {
  monthlyProduction: MonthlyProductionItem[];
  dailyProductionTrend: DailyProductionTrendItem[];
  materialUsage: MaterialUsageItem[];
  employeeProductivity: EmployeeProductivityItem[];
  salaryExpense: SalaryExpenseItem[];
  inventoryStatus: InventoryStatusItem[];
  monthlyPurchaseTrend: MonthlyPurchaseTrendItem[];
}

export interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStockBalance: number;
  minimumStockLevel: number;
  unit: string;
  unitCost: number;
}

export interface PendingJobWorkOrder {
  id: string;
  workOrderNumber: string;
  targetProductName: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';
  plannedQuantity: number;
  completedQuantity: number;
  createdAt: string;
}

export interface RecentWorkOrder {
  id: string;
  workOrderNumber: string;
  targetProductName: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  plannedQuantity: number;
  completedQuantity: number;
  createdAt: string;
}

export interface DashboardActivity {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  timestamp: string;
  userName: string;
  userRole?: string;
}

export interface LatestEmployee {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: string;
}
