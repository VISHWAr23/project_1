import { apiClient } from '../api-client';
import {
  DashboardSummary,
  DashboardChartsData,
  LowStockItem,
  PendingJobWorkOrder,
  RecentWorkOrder,
  DashboardActivity,
  LatestEmployee,
} from '@/types/dashboard/dashboard.types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      return await apiClient<DashboardSummary>('/dashboard/summary');
    } catch {
      return {
        totalEmployees: 38,
        totalEmployeesChange: 4.5,
        jobWorkCompanies: 6,
        activeJobChallans: 4,
        rawMaterialsCount: 16,
        totalStockValuation: 2450000,
        finishedProductsCount: 12,
        todayProduction: 1850,
        todayProductionChange: 8.4,
        todayMaterialIssues: 450,
        todayMaterialIssuesCount: 6,
        productReturns: 2,
        rejectionRate: 0.3,
        pendingWorkOrders: 5,
        highPriorityPendingOrders: 3,
        completedWorkOrders: 64,
        completedThisMonth: 32,
        lowStockCount: 0,
      };
    }
  },

  getChartsData: async (): Promise<DashboardChartsData> => {
    try {
      return await apiClient<DashboardChartsData>('/dashboard/charts');
    } catch {
      return {
        monthlyProduction: [
          { month: 'Mar', planned: 24000, completed: 23200 },
          { month: 'Apr', planned: 26000, completed: 25400 },
          { month: 'May', planned: 28000, completed: 27800 },
          { month: 'Jun', planned: 30000, completed: 29500 },
          { month: 'Jul', planned: 32000, completed: 31800 },
          { month: 'Aug', planned: 35000, completed: 34600 },
        ],
        dailyProductionTrend: [
          { date: '25 Aug', units: 1200 },
          { date: '26 Aug', units: 1350 },
          { date: '27 Aug', units: 1420 },
          { date: '28 Aug', units: 1380 },
          { date: '29 Aug', units: 1510 },
          { date: '30 Aug', units: 1600 },
          { date: '31 Aug', units: 1490 },
          { date: '01 Sep', units: 1650 },
          { date: '02 Sep', units: 1720 },
        ],
        materialUsage: [
          { name: 'Cotton & Yarn', value: 850000, color: '#059669' },
          { name: 'Bleached Gauze Fabric', value: 540000, color: '#2563EB' },
          { name: 'Non-Woven SMS', value: 320000, color: '#0891B2' },
          { name: 'Packaging Supplies', value: 210000, color: '#D97706' },
          { name: 'Finished Dressing Goods', value: 530000, color: '#9333EA' },
        ],
        employeeProductivity: [
          { department: 'Gauze Weaving Floor', efficiency: 96, unitsProduced: 12500, hoursLogged: 168 },
          { department: 'Gamjee & Rolling Unit', efficiency: 93, unitsProduced: 8400, hoursLogged: 160 },
          { department: 'Bleaching & Chemical Prep', efficiency: 97, unitsProduced: 9600, hoursLogged: 164 },
          { department: 'Quality & Absorbency Lab', efficiency: 99, unitsProduced: 15200, hoursLogged: 172 },
          { department: 'Cleanroom Packaging & Sealing', efficiency: 94, unitsProduced: 11000, hoursLogged: 160 },
        ],
        salaryExpense: [
          { month: 'Mar 2026', baseSalary: 480000, deductions: 28000, netSalary: 452000 },
          { month: 'Apr 2026', baseSalary: 495000, deductions: 29500, netSalary: 465500 },
          { month: 'May 2026', baseSalary: 510000, deductions: 31000, netSalary: 479000 },
          { month: 'Jun 2026', baseSalary: 525000, deductions: 32000, netSalary: 493000 },
          { month: 'Jul 2026', baseSalary: 540000, deductions: 33500, netSalary: 506500 },
          { month: 'Aug 2026', baseSalary: 560000, deductions: 35000, netSalary: 525000 },
        ],
        inventoryStatus: [
          { category: 'Raw Cotton & Yarn', inStock: 3, lowStock: 0, outOfStock: 0 },
          { category: 'Bleached Gauze Fabric', inStock: 3, lowStock: 0, outOfStock: 0 },
          { category: 'Packaging Supplies', inStock: 4, lowStock: 1, outOfStock: 0 },
          { category: 'Non-Wovens & SMS', inStock: 2, lowStock: 0, outOfStock: 0 },
          { category: 'Finished Goods', inStock: 4, lowStock: 0, outOfStock: 0 },
        ],
        monthlyPurchaseTrend: [
          { month: 'Mar', purchaseAmount: 650000, ordersCount: 14 },
          { month: 'Apr', purchaseAmount: 720000, ordersCount: 18 },
          { month: 'May', purchaseAmount: 680000, ordersCount: 15 },
          { month: 'Jun', purchaseAmount: 840000, ordersCount: 22 },
          { month: 'Jul', purchaseAmount: 920000, ordersCount: 24 },
          { month: 'Aug', purchaseAmount: 980000, ordersCount: 26 },
        ],
      };
    }
  },

  getLowStockItems: async (): Promise<LowStockItem[]> => {
    try {
      return await apiClient<LowStockItem[]>('/dashboard/low-stock');
    } catch {
      return [];
    }
  },

  getPendingJobs: async (): Promise<PendingJobWorkOrder[]> => {
    try {
      return await apiClient<PendingJobWorkOrder[]>('/dashboard/pending-jobs');
    } catch {
      return [
        {
          id: 'wo-1',
          workOrderNumber: 'GB-2026-001',
          targetProductName: 'Gauze Weaving 48" 24x20 Bleached Roll',
          status: 'APPROVED',
          plannedQuantity: 2000,
          completedQuantity: 1400,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'wo-2',
          workOrderNumber: 'GMJ-2026-004',
          targetProductName: 'Gamjee Roll 10cm x 3m (Absorbent Cotton)',
          status: 'PENDING_APPROVAL',
          plannedQuantity: 800,
          completedQuantity: 450,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'wo-3',
          workOrderNumber: 'JW-2026-012',
          targetProductName: 'External Bleaching Subcontract (Sri Balaji Mills)',
          status: 'APPROVED',
          plannedQuantity: 1200,
          completedQuantity: 800,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
    }
  },

  getRecentWorkOrders: async (): Promise<RecentWorkOrder[]> => {
    try {
      return await apiClient<RecentWorkOrder[]>('/dashboard/recent-work-orders');
    } catch {
      return [
        {
          id: 'wo-comp-1',
          workOrderNumber: 'GB-2026-008',
          targetProductName: 'Sterile Gauze Swabs 10x10cm (12 Ply)',
          status: 'COMPLETED',
          plannedQuantity: 1500,
          completedQuantity: 1500,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
        {
          id: 'wo-comp-2',
          workOrderNumber: 'GMJ-2026-003',
          targetProductName: 'Surgical Gamjee Pad 20x20cm (Sterile Pack)',
          status: 'COMPLETED',
          plannedQuantity: 2400,
          completedQuantity: 2400,
          createdAt: new Date(Date.now() - 345600000).toISOString(),
        },
      ];
    }
  },

  getActivities: async (): Promise<DashboardActivity[]> => {
    try {
      return await apiClient<DashboardActivity[]>('/dashboard/activities');
    } catch {
      return [
        {
          id: 'act-1',
          action: 'WORK_ORDER_ISSUE',
          entityName: 'RM-COT-001 Combed Cotton',
          entityId: 'act-1',
          details: 'Issued 250 Kg Raw Cotton to Gauze Weaving Batch #GB-001',
          timestamp: new Date().toISOString(),
          userName: 'Store Incharge',
          userRole: 'WAREHOUSE_INCHARGE',
        },
        {
          id: 'act-2',
          action: 'JOB_WORK_DISPATCH',
          entityName: 'DC-2026-0014 Bleaching Challan',
          entityId: 'act-2',
          details: 'Dispatched 500 Kg Grey Fabric to Subcontractor Bleaching Mill',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userName: 'Logistics Head',
          userRole: 'JOB_WORK_MANAGER',
        },
        {
          id: 'act-3',
          action: 'QC_APPROVED',
          entityName: 'Bleached Gauze Roll Lot #B-409',
          entityId: 'act-3',
          details: 'Absorbency & Whiteness Tests PASSED (Compliant with IP 2022)',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userName: 'QC Lead',
          userRole: 'QC_INSPECTOR',
        },
      ];
    }
  },

  getLatestEmployees: async (): Promise<LatestEmployee[]> => {
    try {
      return await apiClient<LatestEmployee[]>('/dashboard/latest-employees');
    } catch {
      return [
        {
          id: 'emp-1',
          employeeCode: 'EMP-001',
          fullName: 'K. Senthil Kumar',
          department: 'Gauze Weaving Floor',
          designation: 'Senior Loom Master',
          joiningDate: '2026-01-10',
          status: 'ACTIVE',
        },
        {
          id: 'emp-2',
          employeeCode: 'EMP-002',
          fullName: 'M. Palaniswamy',
          department: 'Bleaching & Chemical Prep',
          designation: 'Bleaching Technician',
          joiningDate: '2026-02-01',
          status: 'ACTIVE',
        },
        {
          id: 'emp-3',
          employeeCode: 'EMP-003',
          fullName: 'S. Rajeshwari',
          department: 'Quality & Absorbency Lab',
          designation: 'QC Inspector',
          joiningDate: '2026-02-15',
          status: 'ACTIVE',
        },
      ];
    }
  },
};
