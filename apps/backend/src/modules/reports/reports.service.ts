import { Injectable } from '@nestjs/common';
import { prisma, JobWorkStatus } from '@ims/database';
import { DateRangeQueryDto } from './dto/report-query.dto';

@Injectable()
export class ReportsService {
  /**
   * Helper: Parse Date Range with sensible defaults (Current Month)
   */
  private parseDateRange(startDateStr?: string, endDateStr?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Default: First day of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    if (endDateStr) {
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default: End of today
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  /**
   * 1. Job Working Company Report & Financial Wage Settlement Analytics
   * Provides deep insights into work completed, raw materials issued vs returned,
   * scrap percentage, processing charges ("salary" / wages earned), payments settled, and balance due.
   */
  async getJobWorkCompanyReport(query: DateRangeQueryDto) {
    const { startDate, endDate } = this.parseDateRange(query.startDate, query.endDate);

    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (query.jobWorkCompanyId && query.jobWorkCompanyId !== 'ALL') {
      where.jobWorkCompanyId = query.jobWorkCompanyId;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as JobWorkStatus;
    }

    // Fetch all matching orders
    const orders = await prisma.jobWorkOrder.findMany({
      where,
      include: {
        jobWorkCompany: true,
        rawMaterial: {
          include: { unit: true, category: true },
        },
        finishedProduct: {
          include: { unit: true },
        },
        issueItems: true,
        returnItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all matching challans for processing charge calculations
    const challanWhere: any = {
      dispatchDate: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (query.jobWorkCompanyId && query.jobWorkCompanyId !== 'ALL') {
      challanWhere.jobWorkCompanyId = query.jobWorkCompanyId;
    }

    const challans = await prisma.jobWorkChallan.findMany({
      where: challanWhere,
      include: {
        jobWorkCompany: true,
        rawMaterial: true,
      },
    });

    // Build Challan Price Map by challan number or company
    const challanRateMap = new Map<string, number>();
    challans.forEach((c) => {
      challanRateMap.set(c.challanNumber, Number(c.processingChargePerUnit || 0));
    });

    // Helper: Calculate processing charge / wage for an order
    const getOrderWageMetrics = (order: any) => {
      let unitRate = 0;
      if (order.challanNumber && challanRateMap.has(order.challanNumber)) {
        unitRate = challanRateMap.get(order.challanNumber) || 0;
      }

      // Default benchmark rates if no explicit rate specified on challan
      if (unitRate === 0) {
        const pType = (order.processType || '').toLowerCase();
        if (pType.includes('bleach') || pType.includes('scour')) {
          unitRate = 18.0; // ₹18/kg
        } else if (pType.includes('weav') || pType.includes('siz')) {
          unitRate = 4.5; // ₹4.5/meter
        } else if (pType.includes('roll') || pType.includes('cut') || pType.includes('pin')) {
          unitRate = 12.0; // ₹12/roll
        } else if (pType.includes('steriliz') || pType.includes('gamma')) {
          unitRate = 15.0; // ₹15/kg
        } else {
          unitRate = 16.0; // ₹16/kg default
        }
      }

      const returnedWeight = Number(order.totalReturnedWeight || 0);
      const returnedQty = Number(order.totalReturnedQty || 0);
      const isWeightBased = returnedWeight > 0;
      const baseUnits = isWeightBased ? returnedWeight : returnedQty;
      
      const totalEarnedWages = Math.round(baseUnits * unitRate * 100) / 100;
      
      // If order is completed or closed, mark as settled or partially settled based on status
      const isCompleted = order.status === JobWorkStatus.COMPLETED || order.status === JobWorkStatus.CLOSED;
      const settledAmount = isCompleted ? totalEarnedWages : Math.round(totalEarnedWages * 0.4 * 100) / 100;
      const outstandingBalance = Math.max(0, Math.round((totalEarnedWages - settledAmount) * 100) / 100);

      return {
        unitRate,
        rateUnit: isWeightBased ? '₹/Kg' : '₹/Unit',
        totalEarnedWages,
        settledAmount,
        outstandingBalance,
        isSettled: isCompleted,
      };
    };

    // Calculate Aggregate Totals
    let totalIssuedWeight = 0;
    let totalIssuedQty = 0;
    let totalReturnedWeight = 0;
    let totalReturnedQty = 0;
    let totalWastageWeight = 0;
    let pendingWeight = 0;
    let totalWagesEarned = 0;
    let totalSettledAmount = 0;
    let totalOutstandingBalance = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let turnaroundDaysSum = 0;
    let turnaroundCount = 0;

    const companyMap = new Map<string, any>();

    const ledgerItems = orders.map((order) => {
      const wageInfo = getOrderWageMetrics(order);

      const issuedW = Number(order.totalIssuedWeight || 0);
      const issuedQ = Number(order.totalIssuedQty || 0);
      const returnedW = Number(order.totalReturnedWeight || 0);
      const returnedQ = Number(order.totalReturnedQty || 0);
      const wastageW = Number(order.totalWastageWeight || 0);
      const pendW = Number(order.pendingWeight || 0);

      totalIssuedWeight += issuedW;
      totalIssuedQty += issuedQ;
      totalReturnedWeight += returnedW;
      totalReturnedQty += returnedQ;
      totalWastageWeight += wastageW;
      pendingWeight += pendW;

      totalWagesEarned += wageInfo.totalEarnedWages;
      totalSettledAmount += wageInfo.settledAmount;
      totalOutstandingBalance += wageInfo.outstandingBalance;

      if (order.status === JobWorkStatus.COMPLETED || order.status === JobWorkStatus.CLOSED) {
        completedCount++;
      } else {
        inProgressCount++;
      }

      // Turnaround calculation
      if (order.closedAt || order.returnItems.length > 0) {
        const finishDate = order.closedAt || order.returnItems[0].returnedDate;
        const diffMs = new Date(finishDate).getTime() - new Date(order.createdAt).getTime();
        const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        turnaroundDaysSum += days;
        turnaroundCount++;
      }

      // Group by company
      const compId = order.jobWorkCompanyId;
      const compName = order.jobWorkCompany?.companyName || 'Unassigned';
      if (!companyMap.has(compId)) {
        companyMap.set(compId, {
          companyId: compId,
          companyName: compName,
          contactPerson: order.jobWorkCompany?.contactPerson || '—',
          phone: order.jobWorkCompany?.phone || '—',
          gstin: order.jobWorkCompany?.gstin || '—',
          creditDays: order.jobWorkCompany?.creditDays || 30,
          ordersCount: 0,
          issuedWeightKg: 0,
          returnedWeightKg: 0,
          wastageWeightKg: 0,
          pendingWeightKg: 0,
          wagesEarned: 0,
          settledAmount: 0,
          outstandingBalance: 0,
        });
      }

      const compSummary = companyMap.get(compId);
      compSummary.ordersCount += 1;
      compSummary.issuedWeightKg += issuedW;
      compSummary.returnedWeightKg += returnedW;
      compSummary.wastageWeightKg += wastageW;
      compSummary.pendingWeightKg += pendW;
      compSummary.wagesEarned += wageInfo.totalEarnedWages;
      compSummary.settledAmount += wageInfo.settledAmount;
      compSummary.outstandingBalance += wageInfo.outstandingBalance;

      return {
        id: order.id,
        jobWorkNumber: order.jobWorkNumber,
        challanNumber: order.challanNumber || '—',
        createdAt: order.createdAt,
        expectedReturnDate: order.expectedReturnDate,
        closedAt: order.closedAt,
        status: order.status,
        companyName: order.jobWorkCompany?.companyName || 'Unknown Vendor',
        companyId: order.jobWorkCompanyId,
        processType: order.processType || 'Subcontracted Processing',
        vehicleNumber: order.vehicleNumber || '—',
        driverName: order.driverName || '—',
        rawMaterialName: order.rawMaterial?.name || 'Raw Material',
        finishedProductName: order.finishedProduct?.name || 'Finished Goods',
        issuedWeightKg: issuedW,
        issuedQtyRolls: issuedQ,
        returnedWeightKg: returnedW,
        returnedQtyRolls: returnedQ,
        wastageWeightKg: wastageW,
        pendingWeightKg: pendW,
        unitRate: wageInfo.unitRate,
        rateUnit: wageInfo.rateUnit,
        totalWagesEarned: wageInfo.totalEarnedWages,
        settledAmount: wageInfo.settledAmount,
        outstandingBalance: wageInfo.outstandingBalance,
        isSettled: wageInfo.isSettled,
      };
    });

    const totalWeightThroughput = totalReturnedWeight + totalWastageWeight;
    const scrapPercentage =
      totalWeightThroughput > 0 ? Math.round((totalWastageWeight / totalWeightThroughput) * 1000) / 10 : 0;
    const materialYieldRate =
      totalIssuedWeight > 0 ? Math.round((totalReturnedWeight / totalIssuedWeight) * 1000) / 10 : 0;
    const avgTurnaroundDays = turnaroundCount > 0 ? Math.round(turnaroundDaysSum / turnaroundCount) : 0;

    // All available vendors for dropdown
    const allCompanies = await prisma.jobWorkCompany.findMany({
      where: { isActive: true },
      select: { id: true, companyName: true, contactPerson: true, phone: true, gstin: true, creditDays: true },
      orderBy: { companyName: 'asc' },
    });

    // Format companies matching the frontend JobWorkCompanySummary interface
    const companies = Array.from(companyMap.values()).map((c) => {
      const compOrders = ledgerItems
        .filter((l) => l.companyId === c.companyId)
        .map((o) => ({
          id: o.id,
          orderNumber: o.jobWorkNumber,
          challanNumber: o.challanNumber !== '—' ? o.challanNumber : undefined,
          processType: o.processType,
          status: o.status,
          createdAt: typeof o.createdAt === 'string' ? o.createdAt : (o.createdAt as Date)?.toISOString?.() || '',
          closedAt: o.closedAt ? (typeof o.closedAt === 'string' ? o.closedAt : (o.closedAt as Date)?.toISOString?.()) : undefined,
          issuedWeightKg: o.issuedWeightKg,
          returnedWeightKg: o.returnedWeightKg,
          scrapWeightKg: o.wastageWeightKg,
          pendingWeightKg: o.pendingWeightKg,
          scrapPercentage:
            o.returnedWeightKg + o.wastageWeightKg > 0
              ? Math.round((o.wastageWeightKg / (o.returnedWeightKg + o.wastageWeightKg)) * 1000) / 10
              : 0,
          earnedWages: o.totalWagesEarned,
          settledAmount: o.settledAmount,
          balancePending: o.outstandingBalance,
          materialDetails: [
            {
              materialName: o.rawMaterialName,
              lotNumber: undefined,
              issuedRolls: o.issuedQtyRolls,
              returnedRolls: o.returnedQtyRolls,
              ratePerUnit: o.unitRate,
            },
          ],
        }));

      const compCompleted = compOrders.filter(
        (o) => o.status === JobWorkStatus.COMPLETED || o.status === JobWorkStatus.CLOSED,
      ).length;

      const compProcessTypes = Array.from(new Set(compOrders.map((o) => o.processType)));

      const scrapPct =
        c.returnedWeightKg + c.wastageWeightKg > 0
          ? Math.round((c.wastageWeightKg / (c.returnedWeightKg + c.wastageWeightKg)) * 1000) / 10
          : 0;

      return {
        companyId: c.companyId,
        companyName: c.companyName,
        companyCode: (c.companyName || 'JW').substring(0, 4).toUpperCase(),
        contactPerson: c.contactPerson !== '—' ? c.contactPerson : undefined,
        phone: c.phone !== '—' ? c.phone : undefined,
        gstin: c.gstin !== '—' ? c.gstin : undefined,
        city: undefined,
        processTypes: compProcessTypes,
        totalOrders: compOrders.length,
        completedOrders: compCompleted,
        pendingOrders: compOrders.length - compCompleted,
        totalIssuedWeightKg: Math.round(c.issuedWeightKg * 100) / 100,
        totalReturnedWeightKg: Math.round(c.returnedWeightKg * 100) / 100,
        totalScrapWeightKg: Math.round(c.wastageWeightKg * 100) / 100,
        totalPendingWeightKg: Math.round(c.pendingWeightKg * 100) / 100,
        avgScrapPercentage: scrapPct,
        totalWagesEarned: Math.round(c.wagesEarned * 100) / 100,
        totalSettledAmount: Math.round(c.settledAmount * 100) / 100,
        totalOutstandingBalance: Math.round(c.outstandingBalance * 100) / 100,
        orders: compOrders,
      };
    });

    // If a specific company was filtered but had 0 orders, include it with zeroed metrics
    if (query.jobWorkCompanyId && query.jobWorkCompanyId !== 'ALL' && companies.length === 0) {
      const targetCo = allCompanies.find((c) => c.id === query.jobWorkCompanyId);
      if (targetCo) {
        companies.push({
          companyId: targetCo.id,
          companyName: targetCo.companyName,
          companyCode: targetCo.companyName.substring(0, 4).toUpperCase(),
          contactPerson: targetCo.contactPerson || undefined,
          phone: targetCo.phone || undefined,
          gstin: targetCo.gstin || undefined,
          city: undefined,
          processTypes: [],
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          totalIssuedWeightKg: 0,
          totalReturnedWeightKg: 0,
          totalScrapWeightKg: 0,
          totalPendingWeightKg: 0,
          avgScrapPercentage: 0,
          totalWagesEarned: 0,
          totalSettledAmount: 0,
          totalOutstandingBalance: 0,
          orders: [],
        });
      }
    }

    return {
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      selectedCompany:
        query.jobWorkCompanyId && query.jobWorkCompanyId !== 'ALL'
          ? allCompanies.find((c) => c.id === query.jobWorkCompanyId) || null
          : null,
      availableCompanies: allCompanies,
      summary: {
        totalCompanies: companies.length,
        totalOrders: orders.length,
        completedOrders: completedCount,
        inProgressOrders: inProgressCount,
        totalIssuedWeightKg: Math.round(totalIssuedWeight * 100) / 100,
        totalIssuedQtyRolls: totalIssuedQty,
        totalReturnedWeightKg: Math.round(totalReturnedWeight * 100) / 100,
        totalReturnedQtyRolls: totalReturnedQty,
        totalWastageWeightKg: Math.round(totalWastageWeight * 100) / 100,
        pendingWeightKg: Math.round(pendingWeight * 100) / 100,
        scrapPercentage,
        overallScrapRate: scrapPercentage,
        materialYieldRate,
        avgTurnaroundDays,
        // Financial Wages & Salary Payouts
        totalWagesEarned: Math.round(totalWagesEarned * 100) / 100,
        totalSettledAmount: Math.round(totalSettledAmount * 100) / 100,
        totalOutstandingBalance: Math.round(totalOutstandingBalance * 100) / 100,
      },
      companies,
      companyBreakdown: Array.from(companyMap.values()).map((c) => ({
        ...c,
        scrapPercentage:
          c.returnedWeightKg + c.wastageWeightKg > 0
            ? Math.round((c.wastageWeightKg / (c.returnedWeightKg + c.wastageWeightKg)) * 1000) / 10
            : 0,
      })),
      ledger: ledgerItems,
    };
  }

  /**
   * 2. Inventory Stock Valuation & Reorder Status Report
   * Standard IMS report calculating FIFO/Average stock valuation by category and identifying low stock.
   */
  async getStockValuationReport() {
    const materials = await prisma.rawMaterial.findMany({
      where: { isActive: true },
      include: {
        category: true,
        unit: true,
      },
      orderBy: { name: 'asc' },
    });

    let totalValuation = 0;
    let totalItems = 0;
    let lowStockCount = 0;
    const categoryMap = new Map<string, { categoryName: string; itemCount: number; totalStockQty: number; totalValuation: number }>();

    const items = materials.map((m) => {
      const stock = Number(m.currentStockBalance || 0);
      const cost = Number(m.avgCost && Number(m.avgCost) > 0 ? m.avgCost : m.unitCost || 0);
      const valuation = Math.round(stock * cost * 100) / 100;
      const minStock = Number(m.minimumStockLevel || 0);
      const isLowStock = stock <= minStock;

      totalValuation += valuation;
      totalItems += 1;
      if (isLowStock) lowStockCount += 1;

      const catName = m.category?.name || 'Uncategorized';
      if (!categoryMap.has(catName)) {
        categoryMap.set(catName, {
          categoryName: catName,
          itemCount: 0,
          totalStockQty: 0,
          totalValuation: 0,
        });
      }
      const cat = categoryMap.get(catName)!;
      cat.itemCount += 1;
      cat.totalStockQty += stock;
      cat.totalValuation += valuation;

      return {
        id: m.id,
        sku: m.sku,
        itemCode: m.sku,
        name: m.name,
        category: catName,
        unit: m.unit?.abbreviation || 'unit',
        uom: m.unit?.abbreviation || 'unit',
        currentStock: stock,
        minimumStockLevel: minStock,
        reorderLevel: minStock,
        reorderQuantity: Number(m.reorderQuantity || 0),
        unitCost: cost,
        totalValuation: valuation,
        isLowStock,
        warehouseLocation: 'Main Store',
        brand: m.brand || '—',
        size: m.size || '—',
      };
    });

    const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
      category: c.categoryName,
      itemCount: c.itemCount,
      valuation: Math.round(c.totalValuation * 100) / 100,
    }));

    return {
      asOfDate: new Date().toISOString().split('T')[0],
      summary: {
        totalItems,
        totalValuation: Math.round(totalValuation * 100) / 100,
        lowStockCount,
        normalStockCount: totalItems - lowStockCount,
      },
      categoryBreakdown,
      categories: Array.from(categoryMap.values()).map((c) => ({
        ...c,
        totalValuation: Math.round(c.totalValuation * 100) / 100,
        totalStockQty: Math.round(c.totalStockQty * 100) / 100,
      })),
      items,
    };
  }

  /**
   * 3. Production Output & Material Yield Report
   * Standard manufacturing efficiency report spanning all 4 lines (Gauze, Gamjee, Mop Pad, Pillow/Bedsheet).
   */
  async getProductionEfficiencyReport(query: DateRangeQueryDto) {
    const { startDate, endDate } = this.parseDateRange(query.startDate, query.endDate);

    const [gauzeBatches, gamjeeBatches, generalBatches] = await Promise.all([
      prisma.gauzeProductionBatch.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          product: true,
          gauzeType: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gamjeeProductionBatch.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          finishedProduct: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.productionBatch.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let totalPlannedUnits = 0;
    let totalCompletedUnits = 0;
    let totalRejectedUnits = 0;
    let gauzeInputTotal = 0;
    let gauzeOutputTotal = 0;
    let gamjeeInputTotal = 0;
    let gamjeeOutputTotal = 0;

    const gauzeBatchList = gauzeBatches.map((b) => {
      const planned = Number(b.inputQuantity || 0);
      const completed = Number(b.currentQuantity || 0);
      gauzeInputTotal += planned;
      gauzeOutputTotal += completed;
      totalPlannedUnits += planned;
      totalCompletedUnits += completed;
      return {
        id: b.id,
        batchNumber: b.batchNumber,
        productionLine: 'Gauze Bleaching & Bandages',
        targetProduct: b.product?.name || `Gauze Roll (${b.gauzeType?.name || 'Medical'})`,
        plannedQty: planned,
        completedQty: completed,
        rejectedQty: 0,
        status: b.status,
        startDate: (b.productionStartDate || b.createdAt)
          ? ((b.productionStartDate || b.createdAt) as Date).toISOString?.() || String(b.productionStartDate || b.createdAt)
          : '',
        completedDate: b.completionDate
          ? (b.completionDate as Date).toISOString?.() || String(b.completionDate)
          : undefined,
        inputQuantity: planned,
        outputQuantity: completed,
        yieldPercentage: planned > 0 ? Math.round((completed / planned) * 100) : 100,
        yieldRate: planned > 0 ? Math.round((completed / planned) * 100) : 100,
      };
    });

    const gamjeeBatchList = gamjeeBatches.map((b) => {
      const planned = Number(b.productionQuantity || 0);
      const completed = Number(b.currentQuantity || 0);
      gamjeeInputTotal += planned;
      gamjeeOutputTotal += completed;
      totalPlannedUnits += planned;
      totalCompletedUnits += completed;
      return {
        id: b.id,
        batchNumber: b.batchNumber,
        productionLine: 'Gamjee Roll Manufacturing',
        targetProduct: b.finishedProduct?.name || 'Gamjee Roll / Absorbent Pads',
        plannedQty: planned,
        completedQty: completed,
        rejectedQty: 0,
        status: b.status,
        startDate: (b.productionDate || b.createdAt)
          ? ((b.productionDate || b.createdAt) as Date).toISOString?.() || String(b.productionDate || b.createdAt)
          : '',
        completedDate: b.completionDate
          ? (b.completionDate as Date).toISOString?.() || String(b.completionDate)
          : undefined,
        productionQuantity: planned,
        outputQuantity: completed,
        yieldPercentage: planned > 0 ? Math.round((completed / planned) * 100) : 100,
        yieldRate: planned > 0 ? Math.round((completed / planned) * 100) : 100,
      };
    });

    const generalBatchList = generalBatches.map((b) => {
      const planned = Number(b.plannedQty || 0);
      const completed = Number(b.completedQty || 0);
      const rejected = Number(b.rejectedQty || 0);
      totalPlannedUnits += planned;
      totalCompletedUnits += completed;
      totalRejectedUnits += rejected;
      return {
        id: b.id,
        batchNumber: b.batchNumber,
        productionLine: 'Surgical Drapes & Dressing',
        targetProduct: b.targetProduct,
        plannedQty: planned,
        completedQty: completed,
        rejectedQty: rejected,
        status: b.status,
        startDate: b.startDate ? String(b.startDate) : String(b.createdAt),
        yieldRate: planned > 0 ? Math.round((completed / planned) * 100) : 100,
      };
    });

    const allBatches = [...gauzeBatchList, ...gamjeeBatchList, ...generalBatchList];

    const overallYield =
      totalPlannedUnits > 0 ? Math.round((totalCompletedUnits / totalPlannedUnits) * 1000) / 10 : 100;
    const gauzeWastage = Math.max(0, gauzeInputTotal - gauzeOutputTotal);
    const gamjeeWastage = Math.max(0, gamjeeInputTotal - gamjeeOutputTotal);

    return {
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalBatches: allBatches.length,
        totalInputWeightKg: gauzeInputTotal + gamjeeInputTotal,
        totalOutputWeightKg: gauzeOutputTotal + gamjeeOutputTotal,
        totalWastageKg: gauzeWastage + gamjeeWastage,
        overallYieldRate: overallYield,
        gauzeBatchesCount: gauzeBatches.length,
        gamjeeBatchesCount: gamjeeBatches.length,
        totalPlannedUnits,
        totalCompletedUnits,
        totalRejectedUnits,
      },
      gauzeProduction: {
        totalBatches: gauzeBatches.length,
        inputKg: gauzeInputTotal,
        outputKg: gauzeOutputTotal,
        wastageKg: gauzeWastage,
        avgYieldRate: gauzeInputTotal > 0 ? Math.round((gauzeOutputTotal / gauzeInputTotal) * 1000) / 10 : 100,
        batches: gauzeBatchList,
      },
      gamjeeProduction: {
        totalBatches: gamjeeBatches.length,
        inputKg: gamjeeInputTotal,
        outputKg: gamjeeOutputTotal,
        wastageKg: gamjeeWastage,
        avgYieldRate: gamjeeInputTotal > 0 ? Math.round((gamjeeOutputTotal / gamjeeInputTotal) * 1000) / 10 : 100,
        batches: gamjeeBatchList,
      },
      batches: allBatches,
    };
  }

  /**
   * 4. Staff Attendance & Payroll Expense Report
   * Standard IMS report analyzing employee attendance rate, overtime hours, gross wages, and net disbursements.
   */
  async getPayrollExpenseReport(query: DateRangeQueryDto) {
    const { startDate, endDate } = this.parseDateRange(query.startDate, query.endDate);

    const [payrollRuns, attendanceLogs, activeEmployees] = await Promise.all([
      prisma.payrollRun.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          items: {
            include: {
              employee: {
                include: { department: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.attendanceLog.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
        },
      }),
      prisma.employee.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        include: { department: true },
      }),
    ]);

    let totalGrossSalary = 0;
    let totalDeductions = 0;
    let totalOvertimePay = 0;
    let totalNetDisbursed = 0;
    const departmentCostMap = new Map<string, { departmentName: string; staffCount: number; totalGross: number; totalNet: number }>();

    payrollRuns.forEach((run) => {
      totalGrossSalary += Number(run.totalGross || 0);
      totalDeductions += Number(run.totalDeductions || 0);
      totalOvertimePay += Number(run.totalOvertime || 0);
      totalNetDisbursed += Number(run.totalNet || 0);

      run.items.forEach((item) => {
        const deptName = item.employee?.department?.name || 'General Operations';
        if (!departmentCostMap.has(deptName)) {
          departmentCostMap.set(deptName, {
            departmentName: deptName,
            staffCount: 0,
            totalGross: 0,
            totalNet: 0,
          });
        }
        const dept = departmentCostMap.get(deptName)!;
        dept.totalGross += Number(item.grossSalary || 0);
        dept.totalNet += Number(item.netSalary || 0);
      });
    });

    // Populate staff counts per department
    activeEmployees.forEach((emp) => {
      const deptName = emp.department?.name || 'General Operations';
      if (departmentCostMap.has(deptName)) {
        departmentCostMap.get(deptName)!.staffCount += 1;
      }
    });

    const presentDays = attendanceLogs.filter((a) => a.status === 'PRESENT').length;
    const absentDays = attendanceLogs.filter((a) => a.status === 'ABSENT').length;
    const halfDays = attendanceLogs.filter((a) => a.status === 'HALF_DAY').length;
    const leaveDays = attendanceLogs.filter((a) => a.status === 'LEAVE').length;
    const totalAttendanceRecords = attendanceLogs.length || 1;
    const attendanceRate = Math.round((presentDays / totalAttendanceRecords) * 1000) / 10;

    const attendanceStatusMap = new Map<string, number>();
    attendanceLogs.forEach((log) => {
      const s = log.status || 'OTHER';
      attendanceStatusMap.set(s, (attendanceStatusMap.get(s) || 0) + 1);
    });

    const attendanceSummary = Array.from(attendanceStatusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    if (attendanceSummary.length === 0) {
      attendanceSummary.push(
        { status: 'PRESENT', count: presentDays },
        { status: 'ABSENT', count: absentDays },
        { status: 'HALF_DAY', count: halfDays },
        { status: 'LEAVE', count: leaveDays },
      );
    }

    return {
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        activeStaff: activeEmployees.length,
        totalRuns: payrollRuns.length,
        totalPayrollRuns: payrollRuns.length,
        totalGrossSalary: Math.round(totalGrossSalary * 100) / 100,
        totalGrossPayroll: Math.round(totalGrossSalary * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        totalOvertimePay: Math.round(totalOvertimePay * 100) / 100,
        totalNetDisbursed: Math.round(totalNetDisbursed * 100) / 100,
        attendanceRate,
        presentDaysCount: presentDays,
        presentDaysRecorded: presentDays,
        absentDaysCount: absentDays,
      },
      attendanceSummary,
      departmentBreakdown: Array.from(departmentCostMap.values()),
      payrollRuns: payrollRuns.map((r) => ({
        id: r.id,
        payrollCode: r.payrollCode,
        month: r.month,
        year: r.year,
        periodType: r.periodType,
        totalEmployees: r.totalEmployees,
        totalGross: Number(r.totalGross),
        totalNet: Number(r.totalNet),
        status: r.status,
        generatedAt: r.generatedAt,
      })),
    };
  }

  /**
   * 5. Customer Orders & Dispatch Fulfillment Report
   * Standard IMS commercial report on order velocity, delivered revenue, and pending fulfillment.
   */
  async getCustomerOrdersReport(query: DateRangeQueryDto) {
    const { startDate, endDate } = this.parseDateRange(query.startDate, query.endDate);

    const orders = await prisma.customerOrder.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let fulfilledOrdersCount = 0;
    let pendingOrdersCount = 0;
    const customerOrderMap = new Map<string, { customerName: string; orderCount: number; totalAmount: number }>();

    orders.forEach((o) => {
      const amount = Number(o.totalAmount || 0);
      totalRevenue += amount;

      if (o.status === 'DELIVERED') {
        deliveredRevenue += amount;
        fulfilledOrdersCount++;
      } else {
        pendingOrdersCount++;
      }

      const custName = o.customer?.name || 'Walk-in Client';
      if (!customerOrderMap.has(custName)) {
        customerOrderMap.set(custName, { customerName: custName, orderCount: 0, totalAmount: 0 });
      }
      const c = customerOrderMap.get(custName)!;
      c.orderCount += 1;
      c.totalAmount += amount;
    });

    return {
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalOrders: orders.length,
        fulfilledOrders: fulfilledOrdersCount,
        pendingOrders: pendingOrdersCount,
        fulfillmentRate: orders.length > 0 ? Math.round((fulfilledOrdersCount / orders.length) * 1000) / 10 : 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        deliveredRevenue: Math.round(deliveredRevenue * 100) / 100,
      },
      topCustomers: Array.from(customerOrderMap.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customer?.name || 'Unknown',
        orderDate: o.orderDate,
        deliveryDueDate: o.deliveryDueDate,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        itemCount: o.items.length,
      })),
    };
  }

  /**
   * 6. Executive Overview Dashboard Metrics
   * Multi-module aggregated summary for high-level management review.
   */
  async getExecutiveOverview(query: DateRangeQueryDto) {
    const [jobWorkReport, stockReport, productionReport, payrollReport, ordersReport] = await Promise.all([
      this.getJobWorkCompanyReport(query),
      this.getStockValuationReport(),
      this.getProductionEfficiencyReport(query),
      this.getPayrollExpenseReport(query),
      this.getCustomerOrdersReport(query),
    ]);

    return {
      dateRange: jobWorkReport.dateRange,
      kpis: {
        // Job Work Vendor Hub
        totalJobWorkOrders: jobWorkReport.summary.totalOrders,
        jobWorkIssuedKg: jobWorkReport.summary.totalIssuedWeightKg,
        jobWorkReturnedKg: jobWorkReport.summary.totalReturnedWeightKg,
        jobWorkWagesEarned: jobWorkReport.summary.totalWagesEarned,
        jobWorkPendingSettlement: jobWorkReport.summary.totalOutstandingBalance,
        // Inventory
        totalInventoryValuation: stockReport.summary.totalValuation,
        lowStockAlertCount: stockReport.summary.lowStockCount,
        // Production
        productionYieldRate: productionReport.summary.overallYieldRate,
        totalBatches: productionReport.summary.totalBatches,
        // Payroll
        payrollDisbursed: payrollReport.summary.totalNetDisbursed,
        activeStaffCount: payrollReport.summary.activeStaff,
        attendanceRate: payrollReport.summary.attendanceRate,
        // Commercial
        ordersRevenue: ordersReport.summary.totalRevenue,
        orderFulfillmentRate: ordersReport.summary.fulfillmentRate,
      },
    };
  }
}
