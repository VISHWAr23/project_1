import {
  PrismaClient,
  UserRole,
  TransactionType,
  JobWorkStatus,
  ProductionWorkOrderStatus,
  QCResultStatus,
  EmployeeStatus,
  AttendanceStatus,
  PaymentMethod,
  PayrollStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting selective database cleanup and re-seeding...');

  // =========================================================================
  // 1. VERIFY EMPLOYEES & VENDORS ARE INTACT (DO NOT DELETE THEM)
  // =========================================================================
  const employees = await prisma.employee.findMany();
  const vendors = await prisma.jobWorkCompany.findMany();
  const adminUser = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } }) || await prisma.user.findFirst();

  if (employees.length === 0 || vendors.length === 0) {
    throw new Error('Employees or Vendors missing! Aborting to prevent data corruption.');
  }

  console.log(`✅ Preserved ${employees.length} Employees and ${vendors.length} Vendors.`);

  // =========================================================================
  // 2. WIPE ALL OLD JOB WORK, ROLLS, PRODUCTION BATCHES & MATERIALS
  // =========================================================================
  console.log('🧹 Clearing old jobwork data, rolls, batches and materials in strict FK order...');

  // Gauze module
  await prisma.gauzeMaterialMovement.deleteMany({});
  await prisma.gauzeBatchStatusHistory.deleteMany({});
  await prisma.gauzePackingEntry.deleteMany({});
  await prisma.gauzeProductionOperation.deleteMany({});
  await prisma.gauzeBleachingReceipt.deleteMany({});
  await prisma.gauzeBleachingJob.deleteMany({});
  await prisma.gauzeRawMaterial.deleteMany({});
  await prisma.gauzeProductionBatch.deleteMany({});

  // Gamjee module
  await prisma.gamjeeBatchStatusHistory.deleteMany({});
  await prisma.gamjeeMaterialMovement.deleteMany({});
  await prisma.gamjeeFinishedRoll.deleteMany({});
  await prisma.gamjeeRollingEntry.deleteMany({});
  await prisma.gamjeeProductionOperation.deleteMany({});
  await prisma.gamjeeMaterialInput.deleteMany({});
  await prisma.gamjeeProductionBatch.deleteMany({});

  // Audit & rolls
  await prisma.auditLog.deleteMany({});
  await prisma.packingBundleItem.deleteMany({});
  await prisma.packingBundle.deleteMany({});
  await prisma.qCInspection.deleteMany({});
  await prisma.rollStatusHistory.deleteMany({});
  await prisma.cottonRoll.deleteMany({});
  await prisma.bOMItem.deleteMany({});
  await prisma.billOfMaterial.deleteMany({});
  await prisma.productMaster.deleteMany({});
  await prisma.productionBatch.deleteMany({});

  // Subcontracting Job Work
  await prisma.jobWorkStatusHistory.deleteMany({});
  await prisma.jobWorkReturnItem.deleteMany({});
  await prisma.jobWorkIssueItem.deleteMany({});
  await prisma.jobWorkOrder.deleteMany({});
  await prisma.jobWorkChallan.deleteMany({});

  // Inventory & Materials
  await prisma.materialIssue.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventoryBatch.deleteMany({});
  await prisma.rawMaterial.deleteMany({});

  // Attendance & Payroll
  await prisma.advanceRepayment.deleteMany({});
  await prisma.employeeAdvance.deleteMany({});
  await prisma.salarySlip.deleteMany({});
  await prisma.salaryPayment.deleteMany({});
  await prisma.salaryAdjustment.deleteMany({});
  await prisma.payrollItem.deleteMany({});
  await prisma.payrollDetail.deleteMany({});
  await prisma.payrollRun.deleteMany({});
  await prisma.salaryHistory.deleteMany({});
  await prisma.attendanceLog.deleteMany({});

  console.log('✅ Previous job work, inventory, and attendance records removed.');

  // =========================================================================
  // 3. FETCH OR ENSURE CATEGORIES, UOMs, LOCATIONS & SUPPLIERS
  // =========================================================================
  const uomMap = new Map((await prisma.unitOfMeasure.findMany()).map((u) => [u.abbreviation, u.id]));
  const catMap = new Map((await prisma.category.findMany()).map((c) => [c.name, c.id]));
  const locMap = new Map((await prisma.storageLocation.findMany()).map((l) => [l.code, l.id]));
  const supMap = new Map((await prisma.supplier.findMany()).map((s) => [s.code, s.id]));

  // Fallback defaults if missing
  const defaultUom = Array.from(uomMap.values())[0];
  const defaultCat = Array.from(catMap.values())[0];
  const defaultLoc = Array.from(locMap.values())[0];
  const defaultSup = Array.from(supMap.values())[0];

  // =========================================================================
  // 4. SEED CLEAN MATERIALS (1 OR 2 PER JOB WORK TYPE)
  // =========================================================================
  console.log('🌱 Seeding clean 1-2 raw materials and finished goods per job work type...');

  const materialsToCreate = [
    // External Bleaching Job Work
    {
      sku: 'RM-GAU-001',
      name: 'Grey Woven Gauze Fabric Roll 48"',
      description: 'Unbleached high-grade grey gauze fabric roll ready for bleaching',
      cat: 'Raw Cotton & Textile Yarn',
      uom: 'm',
      stock: 2000,
      unitCost: 140,
      loc: 'LOC-RM-01',
      sup: 'SUP-001',
    },
    {
      sku: 'FG-BLG-001',
      name: 'Bleached Medical Gauze Fabric Roll 48"',
      description: 'Peroxide bleached medical absorbent gauze roll',
      cat: 'Bleached Medical Gauze & Fabrics',
      uom: 'm',
      stock: 1500,
      unitCost: 185,
      loc: 'LOC-PR-02',
      sup: 'SUP-001',
    },
    // Gauze Swab Production
    {
      sku: 'FG-GZ-SWAB-01',
      name: 'Sterile Absorbent Gauze Swab 10x10cm (8-Ply)',
      description: 'Pharmacopoeia approved 8-ply sterile gauze swabs',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 5000,
      unitCost: 1.85,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
    },
    // Gamjee Production
    {
      sku: 'RM-COT-001',
      name: 'Combed Raw Cotton Bales Grade-A',
      description: '100% natural absorbent medical combed raw cotton bales',
      cat: 'Raw Cotton & Textile Yarn',
      uom: 'Kg',
      stock: 1200,
      unitCost: 135,
      loc: 'LOC-RM-01',
      sup: 'SUP-001',
    },
    {
      sku: 'FG-GMJ-ROLL-01',
      name: 'Absorbent Cotton Gamjee Roll (15cm x 3m)',
      description: 'High-density absorbent surgical gamjee roll with enclosed cotton wool',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 600,
      unitCost: 48,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
    },
    // Moping Pad Production
    {
      sku: 'RM-MOP-FAB-01',
      name: 'Surgical Terry Mop Fabric 40cm',
      description: '100% absorbent cotton woven fabric for medical moping pads',
      cat: 'Raw Cotton & Textile Yarn',
      uom: 'm',
      stock: 800,
      unitCost: 65,
      loc: 'LOC-RM-01',
      sup: 'SUP-001',
    },
    {
      sku: 'FG-MOP-PAD-01',
      name: 'Sterile Absorbent Moping Pad 40cm x 15cm',
      description: 'Finished multi-ply stitched surgical moping pad',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 350,
      unitCost: 22,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
    },
    // Gauze Pad Pinning
    {
      sku: 'RM-PIN-GAU-01',
      name: 'Continuous Gauze Slit Ribbon 20cm',
      description: 'Slit bleached gauze ribbon prepared for automatic pinning',
      cat: 'Bleached Medical Gauze & Fabrics',
      uom: 'm',
      stock: 600,
      unitCost: 18,
      loc: 'LOC-PR-02',
      sup: 'SUP-001',
    },
    {
      sku: 'FG-PIN-PAD-01',
      name: 'Pinned Surgical Gauze Pad 20cm x 20cm',
      description: 'Precision pinned and layered surgical gauze pad',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 400,
      unitCost: 3.5,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
    },
    // Drying
    {
      sku: 'RM-DRY-WET-01',
      name: 'Wet Scoured & Bleached Gauze Fabric 48"',
      description: 'Hydrated bleached gauze rolls ready for hot chamber drying',
      cat: 'Bleached Medical Gauze & Fabrics',
      uom: 'm',
      stock: 500,
      unitCost: 110,
      loc: 'LOC-PR-02',
      sup: 'SUP-001',
    },
    {
      sku: 'FG-DRY-CAL-01',
      name: 'Dried & Calendered Surgical Gauze 48"',
      description: 'Evenly dried and smoothed surgical gauze fabric roll',
      cat: 'Bleached Medical Gauze & Fabrics',
      uom: 'm',
      stock: 450,
      unitCost: 125,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
    },
    // Pillow & Bed Sheet
    {
      sku: 'RM-SHT-FAB-01',
      name: 'Hospital Sheeting Bleached Fabric 160cm',
      description: 'Wide-width combed cotton sheeting fabric for medical beds',
      cat: 'Raw Cotton & Textile Yarn',
      uom: 'm',
      stock: 750,
      unitCost: 95,
      loc: 'LOC-RM-01',
      sup: 'SUP-001',
    },
    {
      sku: 'FG-HOS-SHT-01',
      name: 'Hospital Grade Cotton Bed Sheet 240cm',
      description: 'Fitted and hemmed hospital bedsheet for clinical wards',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 120,
      unitCost: 195,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
      itemSource: 'MANUFACTURED',
    },
    // Direct Buy & Sell / Traded Finished Goods (Procured directly for resale)
    {
      sku: 'FG-TRD-PULLUP-01',
      name: 'Dr. C Adult Pullups - Premium (Medium)',
      description: 'Super absorbent adult pullup diapers with wetness indicator (Direct Buy & Sell)',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 350,
      unitCost: 320,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
      itemSource: 'TRADED',
      brand: 'Dr. C',
      variantType: 'ADULT PULLUPS - PREMIUM',
      size: 'MEDIUM',
      packSize: '10 PCS/PACK',
      boxSize: '12 PACKS/BOX',
    },
    {
      sku: 'FG-TRD-WIPES-01',
      name: 'Medi Bath Chlorhexidine Antiseptic Wipes (10s)',
      description: 'Antiseptic pre-saturated patient bathing wipes for OT & ICU (Direct Buy & Sell)',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 500,
      unitCost: 115,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
      itemSource: 'TRADED',
      brand: 'Medi Bath',
      packSize: '10 WIPES/PACK',
    },
    {
      sku: 'FG-TRD-GOWN-01',
      name: 'Disposable Reinforced Surgical Gown SMS 45 GSM',
      description: 'AAMI Level 3 fluid-resistant surgical isolation gown (Direct Buy & Sell)',
      cat: 'Finished Surgical Products',
      uom: 'Pcs',
      stock: 250,
      unitCost: 145,
      loc: 'LOC-FG-05',
      sup: 'SUP-001',
      itemSource: 'TRADED',
      brand: 'MediShield',
      size: 'LARGE',
    },
  ];

  const createdMaterials: Record<string, any> = {};
  for (const m of materialsToCreate) {
    const item = await prisma.rawMaterial.create({
      data: {
        sku: m.sku,
        name: m.name,
        description: m.description,
        hsnCode: '300590',
        minimumStockLevel: Math.floor(m.stock * 0.2),
        maximumStockLevel: m.stock * 3,
        reorderQuantity: Math.floor(m.stock * 0.5),
        currentStockBalance: m.stock,
        unitCost: m.unitCost,
        lastPurchaseRate: m.unitCost,
        avgCost: m.unitCost,
        gstRate: 5.0,
        itemSource: (m as any).itemSource || 'MANUFACTURED',
        brand: (m as any).brand || null,
        size: (m as any).size || null,
        packSize: (m as any).packSize || null,
        boxSize: (m as any).boxSize || null,
        variantType: (m as any).variantType || null,
        categoryId: catMap.get(m.cat) || defaultCat,
        unitId: uomMap.get(m.uom) || defaultUom,
        supplierId: supMap.get(m.sup) || defaultSup,
        storageLocationId: locMap.get(m.loc) || defaultLoc,
      },
    });
    createdMaterials[m.sku] = item;

    // Initial Inventory Batch
    const batch = await prisma.inventoryBatch.create({
      data: {
        rawMaterialId: item.id,
        batchNumber: `BAT-${m.sku.replace('RM-', '').replace('FG-', '')}-01`,
        quantityReceived: m.stock,
        quantityRemaining: m.stock,
        receivedDate: new Date('2026-08-01'),
        supplierInvoiceRef: `INV-2026-${m.sku}`,
      },
    });

    // Initial Inventory Receipt Transaction
    await prisma.inventoryTransaction.create({
      data: {
        rawMaterialId: item.id,
        batchId: batch.id,
        transactionType: TransactionType.PURCHASE_RECEIPT,
        quantity: m.stock,
        previousStock: 0,
        newStock: m.stock,
        unitPrice: m.unitCost,
        referenceNumber: `GRN-2026-${m.sku}`,
        referenceDocumentType: 'STOCK_INITIALIZATION',
        notes: `Opening inventory balance for ${m.name}`,
        createdByUserId: adminUser!.id,
      },
    });
  }

  // =========================================================================
  // 5. SEED EXACTLY 1 ACTIVE JOB WORK ORDER / BATCH PER TYPE
  // =========================================================================
  console.log('🌱 Seeding 1 Job Work order / batch per production type...');

  const primaryVendor = vendors.find((v) => v.companyName.includes('Bleaching')) || vendors[0];

  // 1. External Subcontractor Job Work Order
  const jwo1 = await prisma.jobWorkOrder.create({
    data: {
      jobWorkNumber: 'JWO-2026-001',
      challanNumber: 'CH-2026-001',
      expectedReturnDate: new Date('2026-09-18'),
      status: JobWorkStatus.IN_PROGRESS,
      jobWorkCompanyId: primaryVendor.id,
      rawMaterialId: createdMaterials['RM-GAU-001'].id,
      finishedProductId: createdMaterials['FG-BLG-001'].id,
      totalIssuedWeight: 500,
      totalIssuedQty: 500,
      pendingWeight: 500,
      pendingQty: 500,
      vehicleNumber: 'TN-67-AB-1234',
      driverName: 'Murugan K.',
      remarks: 'Bleaching & scouring job work order for Grey Gauze Roll',
    },
  });

  await prisma.jobWorkIssueItem.create({
    data: {
      jobWorkOrderId: jwo1.id,
      rollNumber: 'ROLL-GZ-2026-01',
      issuedWeight: 500,
      issuedQty: 500,
      remarks: 'Dispatched for 48" scouring and chemical bleaching',
    },
  });

  await prisma.jobWorkStatusHistory.create({
    data: {
      jobWorkOrderId: jwo1.id,
      fromStatus: JobWorkStatus.CREATED,
      toStatus: JobWorkStatus.MATERIALS_ISSUED,
      notes: `Dispatched to ${primaryVendor.companyName} via vehicle TN-67-AB-1234`,
      performedByUserId: adminUser?.id,
    },
  });

  // 2. Gauze Production Batch (Golden Test Case)
  const gzType = (await prisma.gauzeType.findFirst()) || (await prisma.gauzeType.create({
    data: { name: 'BP17 Absorbent Gauze', code: 'GZ-BP17', active: true },
  }));
  const gzSize = (await prisma.gauzeSize.findFirst()) || (await prisma.gauzeSize.create({
    data: { name: '120 cm x 20 m', width: 120, widthUom: 'cm', length: 20, lengthUom: 'm', active: true },
  }));
  const bleachType = (await prisma.bleachingType.findFirst()) || (await prisma.bleachingType.create({
    data: { name: 'Hydrogen Peroxide Bleaching', code: 'BLEACH-H2O2', active: true },
  }));

  const gauzeBatch = await prisma.gauzeProductionBatch.create({
    data: {
      batchNumber: 'GZ-2026-00001',
      productId: createdMaterials['RM-GAU-001'].id,
      gauzeTypeId: gzType.id,
      gauzeSizeId: gzSize.id,
      supplierId: defaultSup,
      inputQuantity: 1000,
      inputUom: 'meter',
      currentQuantity: 950,
      currentUom: 'meter',
      currentStage: 'IN_PROCESSING',
      status: 'IN_PROCESSING',
      productionStartDate: new Date('2026-09-02'),
      expectedCompletionDate: new Date('2026-09-15'),
      notes: 'Active batch for BP17 Hospital Surgical Gauze Roll',
      createdById: adminUser?.id,
    },
  });

  await prisma.gauzeRawMaterial.create({
    data: {
      productionBatchId: gauzeBatch.id,
      productId: createdMaterials['RM-GAU-001'].id,
      supplierId: defaultSup,
      supplierReference: 'INV-2026-0901',
      rollOrThansNumber: 'LOT-GZ-001',
      gauzeTypeId: gzType.id,
      gauzeSizeId: gzSize.id,
      quantity: 1000,
      uom: 'meter',
      receivedDate: new Date('2026-09-02'),
      warehouseId: defaultLoc,
      notes: 'Initial raw gauze fabric intake',
    },
  });

  await prisma.gauzeBleachingJob.create({
    data: {
      jobNumber: 'BJ-2026-00001',
      productionBatchId: gauzeBatch.id,
      vendorId: primaryVendor.id,
      bleachingTypeId: bleachType.id,
      quantitySent: 1000,
      uom: 'meter',
      sentDate: new Date('2026-09-03'),
      expectedReturnDate: new Date('2026-09-06'),
      rate: 3.5,
      estimatedCost: 3500,
      status: 'COMPLETED',
      notes: 'Bleaching & scouring completed',
    },
  });

  // 3. Gamjee Production Batch
  const gamjeeSpec = (await prisma.gamjeeCottonSpecification.findFirst()) || (await prisma.gamjeeCottonSpecification.create({
    data: {
      cottonType: 'Combed Medical Cotton 100%',
      weightKg: 1.5,
      web: 12.0,
      gamjeeWidthCm: 15.0,
      piecesPerRoll: 1,
      description: 'Standard Surgical Absorbent Cotton Spec',
    },
  }));

  await prisma.gamjeeProductionBatch.create({
    data: {
      batchNumber: 'GMJ-2026-00001',
      cottonSpecId: gamjeeSpec.id,
      finishedProductId: createdMaterials['FG-GMJ-ROLL-01'].id,
      productionQuantity: 400,
      status: 'ROLLING',
      productionDate: new Date('2026-09-04'),
      expectedCompletionDate: new Date('2026-09-16'),
      notes: 'Absorbent surgical gamjee roll run 15cm x 3m',
      createdById: adminUser?.id,
    },
  });

  // =========================================================================
  // 6. ATTENDANCE & PAYROLL FOR LAST MONTH (AUGUST 2026) FOR ALL EMPLOYEES
  // =========================================================================
  console.log('🌱 Generating August 2026 attendance and payroll for all employees...');

  // August 2026: 31 days (Aug 1 to Aug 31)
  // Sundays: Aug 2, 9, 16, 23, 30 (5 Sundays = WEEKLY_OFF)
  // Working days: 26 days
  const sundays = [2, 9, 16, 23, 30];

  const employeeAttendanceStats: Record<string, { present: number; halfDay: number; otHours: number; otPay: number }> = {};

  for (const emp of employees) {
    let presentCount = 0;
    let halfDayCount = 0;
    let totalOtHours = 0;
    let totalOtPay = 0;

    for (let day = 1; day <= 31; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `2026-08-${dayStr}`;
      const isSunday = sundays.includes(day);

      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      let checkIn: Date | null = new Date(`${dateStr}T09:00:00+05:30`);
      let lunchStart: Date | null = new Date(`${dateStr}T13:30:00+05:30`);
      let lunchEnd: Date | null = new Date(`${dateStr}T14:30:00+05:30`);
      let checkOut: Date | null = new Date(`${dateStr}T18:30:00+05:30`);
      let workingHours = 8.5;
      let overtimeHours = 0;
      let otAmount = 0;

      if (isSunday) {
        status = AttendanceStatus.WEEKLY_OFF;
        checkIn = null;
        lunchStart = null;
        lunchEnd = null;
        checkOut = null;
        workingHours = 0;
      } else if (day === 15 && (emp.employeeCode === 'EMP-002' || emp.employeeCode === 'EMP-004')) {
        // Saturday half-day for Suresh & Hari
        status = AttendanceStatus.HALF_DAY;
        checkOut = new Date(`${dateStr}T13:45:00+05:30`);
        workingHours = 4.25;
        halfDayCount += 1;
      } else {
        presentCount += 1;
        // Overtime on Fridays (Aug 7, 14, 21, 28)
        if ([7, 14, 21, 28].includes(day)) {
          overtimeHours = 1.5;
          otAmount = 1.5 * Number(emp.otRatePerHour || 140);
          totalOtHours += overtimeHours;
          totalOtPay += otAmount;
          checkOut = new Date(`${dateStr}T20:00:00+05:30`);
        }
      }

      await prisma.attendanceLog.create({
        data: {
          employeeId: emp.id,
          date: new Date(dateStr),
          status,
          checkIn,
          lunchStart,
          lunchEnd,
          checkOut,
          workingHours,
          overtimeHours,
          otAmount,
          remarks: overtimeHours > 0 ? `Shift Overtime (+${overtimeHours}h)` : isSunday ? 'Sunday Weekly Off' : 'Regular Shift',
        },
      });
    }

    employeeAttendanceStats[emp.id] = {
      present: presentCount,
      halfDay: halfDayCount,
      otHours: totalOtHours,
      otPay: totalOtPay,
    };
  }

  // Create August 2026 Payroll Run (Month: 8, Year: 2026)
  const payrollRun = await prisma.payrollRun.create({
    data: {
      payrollCode: 'PAY-2026-08-M',
      month: 8,
      year: 2026,
      periodType: 'MONTHLY',
      totalEmployees: employees.length,
      totalGross: 0, // Will sum up below
      totalDeductions: 0,
      totalBonus: 0,
      totalOvertime: 0,
      totalNet: 0,
      status: PayrollStatus.PAID,
      remarks: 'August 2026 Staff & Operator Complete Payroll Settlement',
      generatedByUserId: adminUser?.id,
      approvedByUserId: adminUser?.id,
    },
  });

  let runGross = 0;
  let runNet = 0;
  let runOt = 0;

  for (const emp of employees) {
    const stats = employeeAttendanceStats[emp.id];
    const isMonthly = emp.salaryType === 'Monthly Salary';

    const payableDays = stats.present + stats.halfDay * 0.5;
    const baseWage = Number(emp.baseWage);

    let basicSalary = 0;
    if (isMonthly) {
      basicSalary = baseWage; // ₹15,000 full monthly salary
    } else {
      basicSalary = payableDays * baseWage; // e.g. 25.5 * ₹900 = ₹22,950
    }

    const otSalary = stats.otPay;
    const grossSalary = basicSalary + otSalary;
    const netSalary = grossSalary;

    runGross += grossSalary;
    runNet += netSalary;
    runOt += otSalary;

    const item = await prisma.payrollItem.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: emp.id,
        salaryType: emp.salaryType || 'Daily Wage',
        periodType: 'MONTHLY',
        baseWage,
        workingDaysInMonth: 26,
        presentDays: stats.present,
        absentDays: 26 - stats.present - stats.halfDay,
        halfDays: stats.halfDay,
        leaveDays: 0,
        holidayCount: 0,
        weeklyOffCount: 5,
        payableDays,
        basicSalary,
        overtimeHours: stats.otHours,
        overtimeRate: Number(emp.otRatePerHour || 140),
        overtimeSalary: otSalary,
        grossSalary,
        advanceDeduction: 0,
        totalDeductions: 0,
        netSalary,
        status: PayrollStatus.PAID,
      },
    });

    // Create Bank Transfer Settlement Payment for August 2026
    await prisma.salaryPayment.create({
      data: {
        employeeId: emp.id,
        payrollItemId: item.id,
        paymentType: 'FULL_SETTLEMENT',
        amount: netSalary,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionRef: `NEFT-202608-${emp.employeeCode}`,
        paymentDate: new Date('2026-09-01'),
        remarks: `August 2026 Salary Settlement for ${emp.firstName} ${emp.lastName}`,
        paidByUserId: adminUser?.id,
      },
    });
  }

  // Update PayrollRun with accurate grand totals
  await prisma.payrollRun.update({
    where: { id: payrollRun.id },
    data: {
      totalGross: runGross,
      totalNet: runNet,
      totalOvertime: runOt,
    },
  });

  console.log(`✅ August 2026 Payroll Run settled for ${employees.length} employees (Total: ₹${runNet.toFixed(2)}).`);

  // =========================================================================
  // 7. FABRIC COSTING: UPDATE 1ST & ADD 2 MORE EXAMPLES
  // =========================================================================
  console.log('🌱 Updating and adding 2 more Fabric Costing examples...');

  await prisma.greyFabricCosting.deleteMany({});

  const fabricCostingData = [
    {
      qualityName: 'Standard Hospital Gauze 40s (780 Ends x 16 Reed x 13 Pick)',
      notes: 'Standard mill formulation for hospital gauze roll weaving',
      ends: 780,
      reed: 16,
      pick: 13,
      totalLengthMeters: 1000,
      totalLengthYards: 1120,
      warpCount: 41,
      weftCount: 40,
      warpPricePerKg: 315,
      weftPricePerKg: 300,
      sizingRatePerKg: 38.6,
      weavingRatePerMeter: 2.015,
      bleachingRatePerKg: 57,
      yarnConstant: 0.54,
      conversionDivisor: 1000,
      endsDeduction: 24,
      meterToYardFactor: 1.12,
      baseReedPicks: 16,
      reedSpaceInches: 47.25,
      warpWeightKg: 10.68,
      weftWeightKg: 8.93,
      totalWeightKg: 19.61,
      weightPerMeterKg: 0.0196,
      weightPerMeterGram: 19.61,
      warpTotalPrice: 3364.2,
      weftTotalPrice: 2679.0,
      sizingTotalWages: 412.25,
      weavingTotalWages: 2015.0,
      bleachingTotalCharges: 1117.77,
      totalProductionCost: 9588.22,
      costPerMeter: 9.59,
      createdById: adminUser?.id,
    },
    {
      qualityName: 'BP17 Premium Absorbent Gauze 120cm (960 Ends x 20 Reed x 16 Pick)',
      notes: 'British Pharmacopoeia medical surgical gauze specification for sterile absorbent pads',
      ends: 960,
      reed: 20,
      pick: 16,
      totalLengthMeters: 1000,
      totalLengthYards: 1120,
      warpCount: 40,
      weftCount: 40,
      warpPricePerKg: 320,
      weftPricePerKg: 310,
      sizingRatePerKg: 40.0,
      weavingRatePerMeter: 2.25,
      bleachingRatePerKg: 58.0,
      yarnConstant: 0.54,
      conversionDivisor: 1000,
      endsDeduction: 24,
      meterToYardFactor: 1.12,
      baseReedPicks: 16,
      reedSpaceInches: 46.8,
      warpWeightKg: 12.96,
      weftWeightKg: 10.87,
      totalWeightKg: 23.83,
      weightPerMeterKg: 0.0238,
      weightPerMeterGram: 23.83,
      warpTotalPrice: 4147.2,
      weftTotalPrice: 3369.7,
      sizingTotalWages: 518.4,
      weavingTotalWages: 2250.0,
      bleachingTotalCharges: 1382.14,
      totalProductionCost: 11667.44,
      costPerMeter: 11.67,
      createdById: adminUser?.id,
    },
    {
      qualityName: 'Hospital Heavy Sheeting Bed Linen (1240 Ends x 24 Reed x 20 Pick)',
      notes: 'Commercial bleached sheeting specification for hospital bed linen and surgical covers',
      ends: 1240,
      reed: 24,
      pick: 20,
      totalLengthMeters: 1000,
      totalLengthYards: 1120,
      warpCount: 30,
      weftCount: 30,
      warpPricePerKg: 295,
      weftPricePerKg: 285,
      sizingRatePerKg: 36.0,
      weavingRatePerMeter: 2.5,
      bleachingRatePerKg: 55.0,
      yarnConstant: 0.54,
      conversionDivisor: 1000,
      endsDeduction: 24,
      meterToYardFactor: 1.12,
      baseReedPicks: 16,
      reedSpaceInches: 50.67,
      warpWeightKg: 22.32,
      weftWeightKg: 18.91,
      totalWeightKg: 41.23,
      weightPerMeterKg: 0.0412,
      weightPerMeterGram: 41.23,
      warpTotalPrice: 6584.4,
      weftTotalPrice: 5389.35,
      sizingTotalWages: 803.52,
      weavingTotalWages: 2500.0,
      bleachingTotalCharges: 2267.65,
      totalProductionCost: 17544.92,
      costPerMeter: 17.54,
      createdById: adminUser?.id,
    },
  ];

  for (const fc of fabricCostingData) {
    await prisma.greyFabricCosting.create({ data: fc });
  }

  console.log('✅ 3 Fabric Costing examples configured in database.');

  console.log('🎉 Selective database cleanup & re-seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing selective cleanup and reseed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
