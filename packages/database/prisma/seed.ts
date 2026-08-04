import {
  PrismaClient,
  RollStatus,
  RollStage,
  EmployeeStatus,
  AttendanceStatus,
  UserRole,
  TransactionType,
  JobWorkStatus,
  PaymentStatus,
  PayrollStatus,
  ProductionWorkOrderStatus,
  QCResultStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate dates over the past 14 days
function getPastDate(daysAgo: number, hour = 9, minute = 0): Date {
  const d = new Date('2026-08-04T12:00:00Z');
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log('🌱 Generating 2 Weeks (14 Days) Operational History for All ERP Modules...');

  // 1. Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@manufacturing.com' },
    update: {},
    create: {
      email: 'admin@manufacturing.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.g7Fq2ZkXoV9N9/0YfM0eM.vN4mB6a/C', // dummy hashed password
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✔ Admin user ready:', adminUser.email);

  // 2. Seed Master Categories, Units, Suppliers & Storage Locations
  const categoryRaw = await prisma.category.upsert({
    where: { name: 'Raw Gauze & Cotton' },
    update: {},
    create: { name: 'Raw Gauze & Cotton', description: 'Raw grey fabric rolls & raw cotton bales' },
  });

  const categoryPackaging = await prisma.category.upsert({
    where: { name: 'Packaging Materials' },
    update: {},
    create: { name: 'Packaging Materials', description: 'Carton boxes, pouches & labels' },
  });

  const unitKg = await prisma.unitOfMeasure.upsert({
    where: { abbreviation: 'Kg' },
    update: {},
    create: { name: 'Kilogram', abbreviation: 'Kg' },
  });

  const unitRoll = await prisma.unitOfMeasure.upsert({
    where: { abbreviation: 'Roll' },
    update: {},
    create: { name: 'Roll', abbreviation: 'Roll' },
  });

  const supplierCotton = await prisma.supplier.upsert({
    where: { code: 'SUP-COTTON-01' },
    update: {},
    create: {
      code: 'SUP-COTTON-01',
      name: 'Coimbatore Cotton Mills Ltd',
      contactPerson: 'S. K. Raman',
      phone: '9843012345',
      email: 'sales@coimbatorecotton.com',
      gstin: '33AAACC1234A1Z1',
      address: 'Industrial Belt, Coimbatore, Tamil Nadu',
    },
  });

  const storageLocationRM = await prisma.storageLocation.upsert({
    where: { code: 'LOC-RM-ZONE-A' },
    update: {},
    create: {
      code: 'LOC-RM-ZONE-A',
      name: 'Raw Material Bay A',
      warehouseZone: 'Zone A',
      description: 'Primary raw cotton and grey roll storage bin',
    },
  });

  console.log('✔ Inventory Master Data seeded.');

  // 3. Seed Raw Materials
  const rawMaterialGrey = await prisma.rawMaterial.upsert({
    where: { sku: 'RM-GREY-48' },
    update: { currentStockBalance: 4500.0 },
    create: {
      sku: 'RM-GREY-48',
      name: 'Grey Fabric Woven Roll 48 Inch',
      description: 'Unbleached grey fabric rolls for gauze production',
      hsnCode: '520811',
      minimumStockLevel: 1000.0,
      maximumStockLevel: 10000.0,
      currentStockBalance: 4500.0,
      unitCost: 145.0,
      lastPurchaseRate: 145.0,
      avgCost: 145.0,
      gstRate: 5.0,
      categoryId: categoryRaw.id,
      unitId: unitKg.id,
      supplierId: supplierCotton.id,
      storageLocationId: storageLocationRM.id,
    },
  });

  const rawMaterialBleached = await prisma.rawMaterial.upsert({
    where: { sku: 'RM-BLEACHED-48' },
    update: { currentStockBalance: 2800.0 },
    create: {
      sku: 'RM-BLEACHED-48',
      name: 'Bleached Gauze Fabric Roll 48 Inch',
      description: 'Scoured and bleached surgical gauze fabric',
      hsnCode: '300590',
      minimumStockLevel: 500.0,
      maximumStockLevel: 5000.0,
      currentStockBalance: 2800.0,
      unitCost: 185.0,
      lastPurchaseRate: 185.0,
      avgCost: 185.0,
      gstRate: 12.0,
      categoryId: categoryRaw.id,
      unitId: unitKg.id,
      supplierId: supplierCotton.id,
      storageLocationId: storageLocationRM.id,
    },
  });

  console.log('✔ Raw Materials seeded.');

  // 4. Seed Departments & Designations
  const departmentsData = [
    { code: 'DEPT-PROD', name: 'Production & Manufacturing', description: 'Bandage cutting, gauze slitting & roll processing' },
    { code: 'DEPT-PACK', name: 'Packing & Packaging', description: 'Pouch sealing, box packing & bundle assembly' },
    { code: 'DEPT-QA', name: 'Quality Assurance & QC Lab', description: 'GSM, absorbency & whiteness testing' },
    { code: 'DEPT-WH', name: 'Raw Material Store & Warehouse', description: 'Raw cotton bales & grey fabric roll storage' },
    { code: 'DEPT-ACC', name: 'Accounts & Finance', description: 'Payroll, vendor invoicing & GST ledger' },
  ];

  const departments: Record<string, string> = {};
  for (const d of departmentsData) {
    const existing = await prisma.department.findFirst({
      where: { OR: [{ code: d.code }, { name: d.name }] },
    });
    if (existing) {
      departments[d.code] = existing.id;
    } else {
      const created = await prisma.department.create({ data: d });
      departments[d.code] = created.id;
    }
  }

  const designationsData = [
    { code: 'DESG-OPR', name: 'Machine Operator', description: 'Operates slitting & cutting machinery' },
    { code: 'DESG-SUP', name: 'Floor Supervisor', description: 'Oversees shift output & floor safety' },
    { code: 'DESG-PCK', name: 'Packing Staff', description: 'Pouching, labeling & box cartooning' },
    { code: 'DESG-QC', name: 'Quality Inspector', description: 'Conducts absorbency & GSM lab checks' },
    { code: 'DESG-STR', name: 'Store Keeper', description: 'Intake grey fabric & issue job work rolls' },
  ];

  const designations: Record<string, string> = {};
  for (const des of designationsData) {
    const existing = await prisma.designation.findFirst({
      where: { OR: [{ code: des.code }, { name: des.name }] },
    });
    if (existing) {
      designations[des.code] = existing.id;
    } else {
      const created = await prisma.designation.create({ data: des });
      designations[des.code] = created.id;
    }
  }

  console.log('✔ Departments & Designations seeded.');

  // 5. Seed Employees & 14-Day Attendance Logs
  const employeesList = [
    { code: 'EMP-001', fname: 'Ramesh', lname: 'Kumar', phone: '9876543210', dept: 'DEPT-PROD', desg: 'DESG-OPR', baseSalary: 850 },
    { code: 'EMP-002', fname: 'Suresh', lname: 'Patel', phone: '9876543211', dept: 'DEPT-PROD', desg: 'DESG-SUP', baseSalary: 1200 },
    { code: 'EMP-003', fname: 'Lakshmi', lname: 'Devi', phone: '9876543212', dept: 'DEPT-PACK', desg: 'DESG-PCK', baseSalary: 750 },
    { code: 'EMP-004', fname: 'Priya', lname: 'Sharma', phone: '9876543213', dept: 'DEPT-QA', desg: 'DESG-QC', baseSalary: 950 },
    { code: 'EMP-005', fname: 'Murugan', lname: 'Selvam', phone: '9876543214', dept: 'DEPT-WH', desg: 'DESG-STR', baseSalary: 900 },
  ];

  const createdEmployees: string[] = [];

  for (const emp of employeesList) {
    const existingEmp = await prisma.employee.findUnique({ where: { employeeCode: emp.code } });
    let empId = existingEmp?.id;

    if (!empId) {
      const created = await prisma.employee.create({
        data: {
          employeeCode: emp.code,
          firstName: emp.fname,
          lastName: emp.lname,
          phone: emp.phone,
          email: `${emp.fname.toLowerCase()}@surgicalcotton.com`,
          joiningDate: getPastDate(120),
          status: EmployeeStatus.ACTIVE,
          salaryType: 'Monthly Salary',
          baseWage: emp.baseSalary * 30,
          overtimeRate: 150,
          bankName: 'HDFC Bank',
          bankAccountNo: `50100${Math.floor(1000000 + Math.random() * 9000000)}`,
          bankIfsc: 'HDFC0001234',
          panNo: 'ABCDE1234F',
          departmentId: departments[emp.dept],
          designationId: designations[emp.desg],
          salaryStructure: {
            create: {
              baseSalary: emp.baseSalary * 30,
              hra: 3000,
              conveyance: 1500,
              overtimeHourlyRate: 150,
              pfDeduction: 1800,
              esiDeduction: 750,
            },
          },
        },
      });
      empId = created.id;
    }
    createdEmployees.push(empId);

    // Seed full month attendance history for July 2026 (31 days) & August 2026 for each employee
    for (let day = 1; day <= 31; day++) {
      // July 2026
      const julDate = new Date(Date.UTC(2026, 6, day)); // Month index 6 = July
      const julDayOfWeek = julDate.getDay();

      let julStatus: AttendanceStatus = AttendanceStatus.PRESENT;
      let julOtHours = 0;

      if (julDayOfWeek === 0) {
        julStatus = AttendanceStatus.WEEKLY_OFF;
      } else if (day % 11 === 0) {
        julStatus = AttendanceStatus.LEAVE;
      } else if (day % 6 === 0) {
        julStatus = AttendanceStatus.HALF_DAY;
      } else if (day % 3 === 0) {
        julStatus = AttendanceStatus.OVERTIME;
        julOtHours = 2.5;
      }

      await prisma.attendanceLog.upsert({
        where: {
          employeeId_date: {
            employeeId: empId,
            date: julDate,
          },
        },
        update: {
          status: julStatus,
          workingHours: julStatus === AttendanceStatus.HALF_DAY ? 4 : (julStatus === AttendanceStatus.LEAVE || julStatus === AttendanceStatus.WEEKLY_OFF ? 0 : 8),
          overtimeHours: julOtHours,
        },
        create: {
          employeeId: empId,
          date: julDate,
          checkIn: julStatus !== AttendanceStatus.LEAVE && julStatus !== AttendanceStatus.WEEKLY_OFF ? new Date(Date.UTC(2026, 6, day, 8, 0)) : null,
          checkOut: julStatus !== AttendanceStatus.LEAVE && julStatus !== AttendanceStatus.WEEKLY_OFF ? new Date(Date.UTC(2026, 6, day, 17, 0)) : null,
          status: julStatus,
          workingHours: julStatus === AttendanceStatus.HALF_DAY ? 4 : (julStatus === AttendanceStatus.LEAVE || julStatus === AttendanceStatus.WEEKLY_OFF ? 0 : 8),
          overtimeHours: julOtHours,
          remarks: 'Automated July Shift Log',
        },
      });
    }

    // August 2026 (Days 1 to 4)
    for (let day = 1; day <= 4; day++) {
      const augDate = new Date(Date.UTC(2026, 7, day)); // Month index 7 = August
      const augDayOfWeek = augDate.getDay();

      let augStatus: AttendanceStatus = AttendanceStatus.PRESENT;
      let augOtHours = 0;

      if (augDayOfWeek === 0) {
        augStatus = AttendanceStatus.WEEKLY_OFF;
      } else if (day % 3 === 0) {
        augStatus = AttendanceStatus.OVERTIME;
        augOtHours = 3.0;
      }

      await prisma.attendanceLog.upsert({
        where: {
          employeeId_date: {
            employeeId: empId,
            date: augDate,
          },
        },
        update: {
          status: augStatus,
          workingHours: augStatus === AttendanceStatus.HALF_DAY ? 4 : (augStatus === AttendanceStatus.LEAVE || augStatus === AttendanceStatus.WEEKLY_OFF ? 0 : 8),
          overtimeHours: augOtHours,
        },
        create: {
          employeeId: empId,
          date: augDate,
          checkIn: augStatus !== AttendanceStatus.LEAVE && augStatus !== AttendanceStatus.WEEKLY_OFF ? new Date(Date.UTC(2026, 7, day, 8, 0)) : null,
          checkOut: augStatus !== AttendanceStatus.LEAVE && augStatus !== AttendanceStatus.WEEKLY_OFF ? new Date(Date.UTC(2026, 7, day, 17, 0)) : null,
          status: augStatus,
          workingHours: augStatus === AttendanceStatus.HALF_DAY ? 4 : (augStatus === AttendanceStatus.LEAVE || augStatus === AttendanceStatus.WEEKLY_OFF ? 0 : 8),
          overtimeHours: augOtHours,
          remarks: 'Automated August Shift Log',
        },
      });
    }
  }
  console.log('✔ Attendance Logs seeded for July & August 2026 across all staff.');

  // 6. Seed Past Month Payroll Run (July 2026)
  const monthStr = '07';
  const payrollCode = `PAY-2026-${monthStr}`;

  const payrollRun = await prisma.payrollRun.upsert({
    where: { month_year: { month: 7, year: 2026 } },
    update: {},
    create: {
      payrollCode,
      month: 7,
      year: 2026,
      totalEmployees: createdEmployees.length,
      totalGross: 135000.0,
      totalDeductions: 14500.0,
      totalBonus: 5000.0,
      totalOvertime: 9000.0,
      totalNet: 125500.0,
      status: PayrollStatus.PAID,
    },
  });

  for (const empId of createdEmployees) {
    const emp = await prisma.employee.findUnique({ where: { id: empId } });
    if (!emp) continue;

    const pItem = await prisma.payrollItem.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: empId,
        salaryType: emp.salaryType || 'Monthly Salary',
        baseWage: emp.baseWage || 25000,
        workingDaysInMonth: 26,
        presentDays: 22,
        absentDays: 1,
        halfDays: 1,
        leaveDays: 1,
        holidayCount: 1,
        weeklyOffCount: 4,
        payableDays: 25.5,
        overtimeHours: 12,
        overtimeRate: 150,
        overtimeAmount: 1800,
        basicSalary: 24520,
        grossSalary: 27320,
        bonusAmount: 1000,
        pfDeduction: 1800,
        esiDeduction: 750,
        professionalTax: 200,
        totalDeductions: 2750,
        netSalary: 25570,
        status: PayrollStatus.PAID,
      },
    });

    const slipNo = `SLIP-202607-${emp.employeeCode}`;
    await prisma.salarySlip.create({
      data: {
        slipNumber: slipNo,
        payrollItemId: pItem.id,
        employeeId: empId,
        month: 7,
        year: 2026,
      },
    });

    await prisma.salaryHistory.create({
      data: {
        employeeId: empId,
        month: 7,
        year: 2026,
        salaryType: emp.salaryType || 'Monthly Salary',
        grossSalary: 27320,
        totalDeductions: 2750,
        netSalary: 25570,
        status: 'PAID',
        paymentDate: getPastDate(3),
        snapshotData: { basicSalary: 24520, overtimeAmount: 1800, bonusAmount: 1000 },
      },
    });
  }
  console.log('✔ July 2026 Payroll Run, Line Items & Salary Slips seeded.');

  // 7. Seed Job Work Vendors & 14-Day Subcontracting Orders
  const vendorLakshmi = await prisma.jobWorkCompany.findFirst({
    where: { companyName: 'Sri Lakshmi Bleaching & Scouring Works' },
  }) || await prisma.jobWorkCompany.create({
    data: {
      companyName: 'Sri Lakshmi Bleaching & Scouring Works',
      contactPerson: 'K. Rajendran',
      phone: '9842100912',
      email: 'contact@lakshmibleaching.com',
      gstin: '33AAAAA0000A1Z5',
      address: '12/4 Industrial Estate, Erode, Tamil Nadu',
      creditDays: 30,
    },
  });

  const vendorKannan = await prisma.jobWorkCompany.findFirst({
    where: { companyName: 'Kannan Weaving & Processing Mill' },
  }) || await prisma.jobWorkCompany.create({
    data: {
      companyName: 'Kannan Weaving & Processing Mill',
      contactPerson: 'P. Kannan',
      phone: '9443209123',
      email: 'info@kannanweaving.in',
      gstin: '33BBBBB1111B1Z2',
      address: '45 Weavers Colony, Salem, Tamil Nadu',
      creditDays: 45,
    },
  });

  // 14-Day Job Work Orders History
  const jwOrdersData = [
    {
      jobWorkNumber: 'JW-2026-0035',
      challanNumber: 'DC-2026-0722',
      companyId: vendorLakshmi.id,
      status: JobWorkStatus.COMPLETED,
      daysAgo: 13,
      issuedWeight: 500.0,
      returnedWeight: 485.0,
      wastageWeight: 15.0,
    },
    {
      jobWorkNumber: 'JW-2026-0038',
      challanNumber: 'DC-2026-0726',
      companyId: vendorKannan.id,
      status: JobWorkStatus.COMPLETED,
      daysAgo: 9,
      issuedWeight: 650.0,
      returnedWeight: 632.0,
      wastageWeight: 18.0,
    },
    {
      jobWorkNumber: 'JW-2026-0041',
      challanNumber: 'DC-2026-0730',
      companyId: vendorLakshmi.id,
      status: JobWorkStatus.PARTIAL_RETURN,
      daysAgo: 5,
      issuedWeight: 800.0,
      returnedWeight: 450.0,
      wastageWeight: 12.0,
    },
    {
      jobWorkNumber: 'JW-2026-0043',
      challanNumber: 'DC-2026-0802',
      companyId: vendorLakshmi.id,
      status: JobWorkStatus.MATERIALS_ISSUED,
      daysAgo: 2,
      issuedWeight: 450.0,
      returnedWeight: 0.0,
      wastageWeight: 0.0,
    },
    {
      jobWorkNumber: 'JW-2026-0044',
      challanNumber: null,
      companyId: vendorKannan.id,
      status: JobWorkStatus.CREATED,
      daysAgo: 0,
      issuedWeight: 350.0,
      returnedWeight: 0.0,
      wastageWeight: 0.0,
    },
  ];

  for (const jw of jwOrdersData) {
    const existing = await prisma.jobWorkOrder.findUnique({ where: { jobWorkNumber: jw.jobWorkNumber } });
    if (!existing) {
      await prisma.jobWorkOrder.create({
        data: {
          jobWorkNumber: jw.jobWorkNumber,
          challanNumber: jw.challanNumber,
          expectedReturnDate: getPastDate(jw.daysAgo - 7),
          status: jw.status,
          totalIssuedWeight: jw.issuedWeight,
          totalIssuedQty: 10,
          totalReturnedWeight: jw.returnedWeight,
          totalReturnedQty: jw.returnedWeight > 0 ? 8 : 0,
          totalWastageWeight: jw.wastageWeight,
          pendingWeight: Math.max(0, jw.issuedWeight - jw.returnedWeight - jw.wastageWeight),
          jobWorkCompanyId: jw.companyId,
          rawMaterialId: rawMaterialGrey.id,
          finishedProductId: rawMaterialBleached.id,
          createdAt: getPastDate(jw.daysAgo),
          issueItems: {
            create: {
              rollNumber: `ROL-202607-${jw.jobWorkNumber.slice(-2)}01`,
              issuedWeight: jw.issuedWeight,
              issuedQty: 10,
              remarks: 'Outward grey fabric roll dispatch',
            },
          },
          returnItems: jw.returnedWeight > 0 ? {
            create: {
              returnedDate: getPastDate(jw.daysAgo - 3),
              rollNumber: `ROL-BLEACHED-${jw.jobWorkNumber.slice(-2)}01`,
              returnedWeight: jw.returnedWeight,
              returnedQty: 8,
              wastageWeight: jw.wastageWeight,
              finishedProductId: rawMaterialBleached.id,
              remarks: 'Bleached fabric rolls received with weight slip',
            },
          } : undefined,
          statusHistory: {
            create: {
              toStatus: jw.status,
              notes: `Order created and shifted to ${jw.status}`,
              createdAt: getPastDate(jw.daysAgo),
            },
          },
        },
      });
    }
  }
  console.log('✔ 14-Day Job Work Orders & Challans seeded.');

  // 8. Seed 14-Day Serialized Cotton Rolls Engine Ledger
  const rollsData = [
    { num: 'ROL-20260722-0001', stage: RollStage.GREY_FABRIC_ROLL, status: RollStatus.CONVERTED, weight: 45.0, daysAgo: 13 },
    { num: 'ROL-20260724-0002', stage: RollStage.BLEACHED_GAUZE_ROLL, status: RollStatus.QC_APPROVED, weight: 42.5, daysAgo: 11 },
    { num: 'ROL-20260726-0003', stage: RollStage.BLEACHED_GAUZE_ROLL, status: RollStatus.RETURNED_FROM_JOBWORK, weight: 41.0, daysAgo: 9 },
    { num: 'ROL-20260728-0004', stage: RollStage.GREY_FABRIC_ROLL, status: RollStatus.ISSUED_TO_JOBWORK, weight: 46.8, daysAgo: 7 },
    { num: 'ROL-20260730-0005', stage: RollStage.SLIT_ROLL, status: RollStatus.IN_PRODUCTION, weight: 18.0, daysAgo: 5 },
    { num: 'ROL-20260801-0006', stage: RollStage.FINISHED_PRODUCT_ROLL, status: RollStatus.PACKED, weight: 12.0, daysAgo: 3 },
    { num: 'ROL-20260803-0007', stage: RollStage.GREY_FABRIC_ROLL, status: RollStatus.STORED_IN_RM, weight: 48.0, daysAgo: 1 },
  ];

  for (const r of rollsData) {
    const existing = await prisma.cottonRoll.findUnique({ where: { rollNumber: r.num } });
    if (!existing) {
      await prisma.cottonRoll.create({
        data: {
          rollNumber: r.num,
          barcode: `BAR-${r.num}`,
          batchNumber: `BAT-2026-AUG-${r.num.slice(-2)}`,
          materialName: r.stage === RollStage.GREY_FABRIC_ROLL ? 'Grey Gauze Fabric Roll' : 'Bleached Gauze Fabric Roll',
          stage: r.stage,
          widthInches: 48,
          lengthMeters: 450,
          weightKg: r.weight,
          gsm: 28,
          currentStatus: r.status,
          currentLocation: r.status === 'STORED_IN_RM' ? 'RM Bay A' : 'Production Floor 2',
          createdAt: getPastDate(r.daysAgo),
          statusHistory: {
            create: [
              {
                fromStatus: null,
                toStatus: RollStatus.RAW_RECEIVED,
                location: 'Receiving Gate',
                remarks: 'Intake grey roll',
                performedBy: 'Floor Supervisor',
                createdAt: getPastDate(r.daysAgo),
              },
              {
                fromStatus: RollStatus.RAW_RECEIVED,
                toStatus: r.status,
                location: 'Processing Bin',
                remarks: 'Shifted to active state',
                performedBy: 'Quality Inspector',
                createdAt: getPastDate(Math.max(0, r.daysAgo - 1)),
              },
            ],
          },
          qcInspections: {
            create: {
              inspectionNumber: `QC-INS-${r.num.slice(-4)}`,
              testedGsm: 29.5,
              testedAbsorbency: 1.8,
              testedWhiteness: 88.5,
              resultStatus: QCResultStatus.PASSED,
              remarks: 'Conforms to Pharmacopoeia Absorbency Standard',
              inspectorName: 'Priya Sharma (Lead QC)',
              inspectedAt: getPastDate(Math.max(0, r.daysAgo - 1)),
            },
          },
        },
      });
    }
  }
  console.log('✔ 14-Day Serialized Cotton Rolls & QC Inspection History seeded.');

  // 9. Seed Production Batches (Over 14 days)
  const prodBatches = [
    { num: 'PB-2026-0722', target: 'Roller Bandage 10cm x 4m', planned: 2000, completed: 2000, status: ProductionWorkOrderStatus.COMPLETED, daysAgo: 13 },
    { num: 'PB-2026-0728', target: 'Gamjee Roll 15cm x 3m', planned: 1000, completed: 1000, status: ProductionWorkOrderStatus.COMPLETED, daysAgo: 7 },
    { num: 'PB-2026-0802', target: 'Absorbent Gauze Cloth 90cm', planned: 1500, completed: 800, status: ProductionWorkOrderStatus.IN_PROGRESS, daysAgo: 2 },
  ];

  for (const pb of prodBatches) {
    const existing = await prisma.productionBatch.findUnique({ where: { batchNumber: pb.num } });
    if (!existing) {
      await prisma.productionBatch.create({
        data: {
          batchNumber: pb.num,
          workOrderNumber: `WO-${pb.num}`,
          targetProduct: pb.target,
          plannedQty: pb.planned,
          completedQty: pb.completed,
          status: pb.status,
          startDate: getPastDate(pb.daysAgo),
          endDate: pb.status === 'COMPLETED' ? getPastDate(pb.daysAgo - 2) : null,
          createdAt: getPastDate(pb.daysAgo),
        },
      });
    }
  }
  console.log('✔ 14-Day Production Batches seeded.');

  console.log('🚀 14-Day Full ERP Operational History Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
