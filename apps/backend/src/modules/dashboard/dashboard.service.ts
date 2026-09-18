import { Injectable } from '@nestjs/common';
import { prisma, EmployeeStatus, JobWorkStatus, TransactionType } from '@ims/database';

@Injectable()
export class DashboardService {
  async getSummary() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalEmployees,
      jobWorkCompanies,
      activeJobChallans,
      rawMaterials,
      activeGauzeBatches,
      activeGamjeeBatches,
      pendingCustomerOrders,
      completedGauzeThisMonth,
      completedGamjeeThisMonth,
      materialIssuesToday,
      finishedProductsCount,
      completedGauzeToday,
      completedGamjeeToday,
      completedWorkOrders,
    ] = await Promise.all([
      prisma.employee.count({
        where: { status: EmployeeStatus.ACTIVE, deletedAt: null },
      }).catch(() => 0),

      prisma.jobWorkCompany.count({
        where: { isActive: true },
      }).catch(() => 0),

      prisma.jobWorkOrder.count({
        where: {
          status: { in: [JobWorkStatus.IN_PROGRESS, JobWorkStatus.MATERIALS_ISSUED, JobWorkStatus.PARTIAL_RETURN] },
        },
      }).catch(() => 0),

      prisma.rawMaterial.findMany({
        where: { isActive: true },
        select: {
          currentStockBalance: true,
          minimumStockLevel: true,
          unitCost: true,
        },
      }).catch(() => []),

      prisma.gauzeProductionBatch.count({
        where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      }).catch(() => 0),

      prisma.gamjeeProductionBatch.count({
        where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      }).catch(() => 0),

      prisma.customerOrder.count({
        where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } },
      }).catch(() => 0),

      prisma.gauzeProductionBatch.count({
        where: { status: 'COMPLETED', updatedAt: { gte: startOfMonth } },
      }).catch(() => 0),

      prisma.gamjeeProductionBatch.count({
        where: { status: 'COMPLETED', updatedAt: { gte: startOfMonth } },
      }).catch(() => 0),

      prisma.inventoryTransaction.aggregate({
        _sum: { quantity: true },
        _count: { id: true },
        where: {
          transactionType: TransactionType.WORK_ORDER_ISSUE,
          createdAt: { gte: startOfToday },
        },
      }).catch(() => ({ _sum: { quantity: null }, _count: { id: 0 } })),

      prisma.rawMaterial.count({
        where: {
          category: { name: { contains: 'Finished', mode: 'insensitive' } },
          isActive: true,
        },
      }).catch(() => 0),

      prisma.gauzeProductionBatch.aggregate({
        _sum: { currentQuantity: true },
        where: { status: 'COMPLETED', updatedAt: { gte: startOfToday } },
      }).catch(() => ({ _sum: { currentQuantity: null } })),

      prisma.gamjeeProductionBatch.aggregate({
        _sum: { currentQuantity: true },
        where: { status: 'COMPLETED', updatedAt: { gte: startOfToday } },
      }).catch(() => ({ _sum: { currentQuantity: null } })),

      prisma.jobWorkOrder.count({
        where: { status: JobWorkStatus.COMPLETED },
      }).catch(() => 0),
    ]);

    const totalStockValuation = rawMaterials.reduce((acc, curr) => {
      return acc + Math.max(0, Number(curr.currentStockBalance)) * Number(curr.unitCost);
    }, 0);

    const lowStockCount = rawMaterials.filter(
      (m) => Number(m.currentStockBalance) <= Number(m.minimumStockLevel),
    ).length;

    const pendingProduction = activeGauzeBatches + activeGamjeeBatches;
    const completedThisMonth = completedGauzeThisMonth + completedGamjeeThisMonth;
    const todayProduction =
      Number(completedGauzeToday._sum.currentQuantity || 0) +
      Number(completedGamjeeToday._sum.currentQuantity || 0);

    return {
      totalEmployees: totalEmployees || 0,
      totalEmployeesChange: 0,
      jobWorkCompanies: jobWorkCompanies || 0,
      activeJobChallans: activeJobChallans || 0,
      rawMaterialsCount: rawMaterials.length,
      totalStockValuation: totalStockValuation > 0 ? Math.round(totalStockValuation) : 0,
      finishedProductsCount: finishedProductsCount || 0,
      todayProduction: todayProduction || 0,
      todayProductionChange: 0,
      todayMaterialIssues: Number(materialIssuesToday._sum.quantity) || 0,
      todayMaterialIssuesCount: materialIssuesToday._count.id || 0,
      productReturns: 0,
      rejectionRate: 0,
      pendingWorkOrders: pendingProduction || 0,
      highPriorityPendingOrders: pendingCustomerOrders || 0,
      completedWorkOrders: completedWorkOrders || 0,
      completedThisMonth: completedThisMonth || 0,
      lowStockCount: lowStockCount,
    };
  }

  async getChartsData() {
    // 1. Calculate actual category shares
    const categories = await prisma.category.findMany({
      include: {
        rawMaterials: {
          select: { currentStockBalance: true, unitCost: true },
        },
      },
    }).catch(() => []);

    const materialColors = ['#059669', '#2563EB', '#D97706', '#9333EA', '#0891B2', '#DC2626'];
    const materialUsage = categories.map((cat: any, idx: number) => {
      const val = (cat.rawMaterials || []).reduce(
        (sum: number, rm: any) => sum + Math.max(0, Number(rm.currentStockBalance) * Number(rm.unitCost)),
        0,
      );
      return {
        name: cat.name.replace('Raw ', '').replace(' Category', ''),
        value: Math.round(val),
        color: materialColors[idx % materialColors.length],
      };
    }).filter((c: any) => c.value > 0);

    // 2. Fetch actual payroll runs if any
    const payrollRuns = await prisma.payrollRun.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salaryExpense = payrollRuns.reverse().map((pr) => ({
      month: `${monthNames[(pr.month || 1) - 1]} ${pr.year}`,
      baseSalary: Math.round(Number(pr.totalGross) || 0),
      deductions: Math.round(Number(pr.totalDeductions) || 0),
      netSalary: Math.round(Number(pr.totalNet) || 0),
    }));

    // 3. Category Stock Breakdown
    const inventoryStatus = categories.map((cat: any) => {
      const inStock = (cat.rawMaterials || []).filter((m: any) => Number(m.currentStockBalance) > Number(m.minimumStockLevel)).length;
      const lowStock = (cat.rawMaterials || []).filter((m: any) => Number(m.currentStockBalance) <= Number(m.minimumStockLevel) && Number(m.currentStockBalance) > 0).length;
      const outOfStock = (cat.rawMaterials || []).filter((m: any) => Number(m.currentStockBalance) <= 0).length;
      return {
        category: cat.name.replace(' Category', ''),
        inStock,
        lowStock,
        outOfStock,
      };
    }).filter((cat: any) => cat.inStock > 0 || cat.lowStock > 0 || cat.outOfStock > 0);

    return {
      monthlyProduction: [],
      dailyProductionTrend: [],
      materialUsage,
      employeeProductivity: [],
      salaryExpense,
      inventoryStatus,
      monthlyPurchaseTrend: [],
    };
  }

  async getLowStockItems() {
    try {
      const items = await prisma.rawMaterial.findMany({
        where: { isActive: true },
        orderBy: { currentStockBalance: 'asc' },
        take: 6,
        include: {
          category: true,
          unit: true,
        },
      });

      if (items.length > 0) {
        return items.map((item) => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          category: item.category?.name || 'Raw Materials',
          currentStockBalance: Math.max(0, Number(item.currentStockBalance)),
          minimumStockLevel: Number(item.minimumStockLevel),
          unit: item.unit?.abbreviation || 'Units',
          unitCost: Number(item.unitCost),
        }));
      }
    } catch (e) {
      // safe fallback
    }

    return [];
  }

  async getPendingJobs() {
    try {
      const [gauzeBatches, gamjeeBatches, jobWorks] = await Promise.all([
        prisma.gauzeProductionBatch.findMany({
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          take: 3,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.gamjeeProductionBatch.findMany({
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          take: 3,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.jobWorkOrder.findMany({
          where: { status: { in: [JobWorkStatus.IN_PROGRESS, JobWorkStatus.MATERIALS_ISSUED] } },
          take: 3,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const jobs: any[] = [];

      gauzeBatches.forEach((gb) => {
        jobs.push({
          id: gb.id,
          workOrderNumber: gb.batchNumber,
          targetProductName: 'Medical Gauze Fabric Weaving',
          status: 'IN_PROGRESS',
          plannedQuantity: Number(gb.inputQuantity || 0),
          completedQuantity: Number(gb.currentQuantity || 0),
          createdAt: gb.createdAt.toISOString(),
        });
      });

      gamjeeBatches.forEach((gmb) => {
        jobs.push({
          id: gmb.id,
          workOrderNumber: gmb.batchNumber,
          targetProductName: 'Surgical Gamjee Absorbent Roll',
          status: 'IN_PROGRESS',
          plannedQuantity: Number(gmb.plannedFabricMeters || 0),
          completedQuantity: 0,
          createdAt: gmb.createdAt.toISOString(),
        });
      });

      jobWorks.forEach((jw) => {
        jobs.push({
          id: jw.id,
          workOrderNumber: jw.jobWorkNumber,
          targetProductName: `Job Work Bleaching (${jw.pendingWeight || 0} Kg)`,
          status: 'APPROVED',
          plannedQuantity: Number(jw.pendingWeight || 0),
          completedQuantity: 0,
          createdAt: jw.createdAt.toISOString(),
        });
      });

      return jobs.slice(0, 6);
    } catch (e) {
      // return empty array if query fails
    }

    return [];
  }

  async getRecentWorkOrders() {
    try {
      const [completedGauze, completedGamjee] = await Promise.all([
        prisma.gauzeProductionBatch.findMany({
          where: { status: 'COMPLETED' },
          take: 3,
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.gamjeeProductionBatch.findMany({
          where: { status: 'COMPLETED' },
          take: 3,
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

      const list: any[] = [];
      completedGauze.forEach((gb) => {
        list.push({
          id: gb.id,
          workOrderNumber: gb.batchNumber,
          targetProductName: 'Medical Gauze 48" Roll',
          status: 'COMPLETED',
          plannedQuantity: Number(gb.inputQuantity || 0),
          completedQuantity: Number(gb.inputQuantity || 0),
          createdAt: gb.createdAt.toISOString(),
        });
      });
      completedGamjee.forEach((gmb) => {
        list.push({
          id: gmb.id,
          workOrderNumber: gmb.batchNumber,
          targetProductName: 'Gamjee Roll 15cm x 3m',
          status: 'COMPLETED',
          plannedQuantity: Number(gmb.plannedFabricMeters || 0),
          completedQuantity: Number(gmb.plannedFabricMeters || 0),
          createdAt: gmb.createdAt.toISOString(),
        });
      });

      return list;
    } catch (e) {
      // return empty array if query fails
    }

    return [];
  }

  async getActivities() {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });

      if (logs.length > 0) {
        return logs.map((log) => ({
          id: log.id,
          action: log.action,
          entityName: log.entityName,
          entityId: log.entityId,
          details: `${log.action} performed on ${log.entityName}`,
          timestamp: log.createdAt.toISOString(),
          userName: log.user?.email ? log.user.email.split('@')[0] : 'System Admin',
          userRole: log.user?.role || 'ADMIN',
        }));
      }

      // fallback to recent inventory transactions
      const txs = await prisma.inventoryTransaction.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { rawMaterial: true, createdBy: true },
      });

      if (txs.length > 0) {
        return txs.map((tx) => ({
          id: tx.id,
          action: tx.transactionType,
          entityName: tx.rawMaterial?.sku || 'Material Movement',
          entityId: tx.rawMaterialId,
          details: `${tx.transactionType.replace('_', ' ')} of ${tx.quantity} ${tx.rawMaterial?.name || ''}`,
          timestamp: tx.createdAt.toISOString(),
          userName: tx.createdBy?.email ? tx.createdBy.email.split('@')[0] : 'Inventory Head',
          userRole: tx.createdBy?.role || 'WAREHOUSE_INCHARGE',
        }));
      }
    } catch (e) {
      // fallback
    }

    return [];
  }

  async getLatestEmployees() {
    try {
      const employees = await prisma.employee.findMany({
        take: 5,
        orderBy: { joiningDate: 'desc' },
        include: { department: true, designation: true },
      });

      if (employees.length > 0) {
        return employees.map((emp) => ({
          id: emp.id,
          employeeCode: emp.employeeCode,
          fullName: `${emp.firstName} ${emp.lastName}`,
          department: emp.department?.name || 'Production Floor',
          designation: emp.designation?.name || 'Technician',
          joiningDate: emp.joiningDate.toISOString(),
          status: emp.status,
        }));
      }
    } catch (e) {
      // fallback
    }

    return [];
  }
}
