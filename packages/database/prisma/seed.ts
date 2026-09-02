import {
  PrismaClient,
  RollStatus,
  RollStage,
  UserRole,
  TransactionType,
  JobWorkStatus,
  ProductionWorkOrderStatus,
  QCResultStatus,
  EmployeeStatus,
  AttendanceStatus,
  PaymentMethod,
  PayrollStatus,
  AdjustmentType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 [1/8] Removing all existing data from database across all modules...');

  // 1. Clean in strict foreign key order
  await prisma.gauzeMaterialMovement.deleteMany({});
  await prisma.gauzeBatchStatusHistory.deleteMany({});
  await prisma.gauzePackingEntry.deleteMany({});
  await prisma.gauzeProductionOperation.deleteMany({});
  await prisma.gauzeBleachingReceipt.deleteMany({});
  await prisma.gauzeBleachingJob.deleteMany({});
  await prisma.gauzeRawMaterial.deleteMany({});
  await prisma.gauzeProductionBatch.deleteMany({});
  await prisma.gauzeOperationType.deleteMany({});
  await prisma.bleachingType.deleteMany({});
  await prisma.gauzeSize.deleteMany({});
  await prisma.gauzeType.deleteMany({});

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

  await prisma.jobWorkStatusHistory.deleteMany({});
  await prisma.jobWorkReturnItem.deleteMany({});
  await prisma.jobWorkIssueItem.deleteMany({});
  await prisma.jobWorkOrder.deleteMany({});
  await prisma.jobWorkChallan.deleteMany({});
  await prisma.jobWorkCompany.deleteMany({});

  await prisma.materialIssue.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventoryBatch.deleteMany({});
  await prisma.rawMaterial.deleteMany({});
  await prisma.storageLocation.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.unitOfMeasure.deleteMany({});

  await prisma.advanceRepayment.deleteMany({});
  await prisma.employeeAdvance.deleteMany({});
  await prisma.salarySlip.deleteMany({});
  await prisma.salaryPayment.deleteMany({});
  await prisma.salaryAdjustment.deleteMany({});
  await prisma.payrollItem.deleteMany({});
  await prisma.payrollDetail.deleteMany({});
  await prisma.payrollRun.deleteMany({});
  await prisma.salaryHistory.deleteMany({});
  await prisma.salaryStructure.deleteMany({});
  await prisma.attendanceLog.deleteMany({});
  await prisma.employeeDocument.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.designation.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('✅ Database completely wiped.');

  // =========================================================================
  // 2. DEPARTMENTS & DESIGNATIONS (5 records each)
  // =========================================================================
  console.log('🌱 [2/8] Seeding 5 Departments & 5 Designations...');

  const departmentsData = [
    { name: 'Spinning & Weaving', code: 'DEPT-SW', description: 'Raw cotton spinning, carding and grey fabric roll weaving' },
    { name: 'Bleaching & Chemical Processing', code: 'DEPT-BC', description: 'Kier boiling, scouring, peroxide bleaching and washing' },
    { name: 'Cutting & Bandage Slitting', code: 'DEPT-CS', description: 'High-speed roll slitting, cutting, folding and stitching' },
    { name: 'Quality Assurance & Lab', code: 'DEPT-QC', description: 'Testing GSM, whiteness, absorbency time and microbiology QC' },
    { name: 'Packaging & Warehouse', code: 'DEPT-PW', description: 'Sterilization pouch packing, boxing, bundling and dispatch' },
  ];

  const depts: Record<string, any> = {};
  for (const d of departmentsData) {
    const created = await prisma.department.create({ data: d });
    depts[d.code] = created;
  }

  const designationsData = [
    { name: 'Production Supervisor', code: 'DES-SUP', description: 'Oversees shop floor shifts, machines and attendance' },
    { name: 'Master Weaver', code: 'DES-WV', description: 'Expert loom operator and woven fabric roll specialist' },
    { name: 'Bleaching Technician', code: 'DES-BT', description: 'Kier boiling and chemical bleaching operator' },
    { name: 'Quality Inspector', code: 'DES-QC', description: 'Laboratory quality testing and standard compliance' },
    { name: 'Packaging Lead', code: 'DES-PK', description: 'Packaging line supervisor and bundle barcode verification' },
  ];

  const desigs: Record<string, any> = {};
  for (const des of designationsData) {
    const created = await prisma.designation.create({ data: des });
    desigs[des.code] = created;
  }

  // =========================================================================
  // 3. EMPLOYEES & USERS (5 realistic staff records with Daily Wages)
  // =========================================================================
  console.log('🌱 [3/8] Seeding 5 Staff Employees & User Accounts...');

  const passwordHash = '$2a$10$IDSOiQ9lOn0VSIvu2xCLi.oZPOODTQp6hFSHAj/VDhOHrfatYaRGq'; // Admin@12345

  const employeesData = [
    {
      employeeCode: 'EMP-001',
      firstName: 'Ramesh',
      lastName: 'Kumar',
      phone: '+91 98430 11223',
      email: 'ramesh.supervisor@manufacturing.com',
      gender: 'Male',
      joiningDate: new Date('2024-01-15'),
      departmentId: depts['DEPT-SW'].id,
      designationId: desigs['DES-SUP'].id,
      salaryType: 'Daily Wage',
      salaryCycle: 'WEEKLY',
      baseWage: 900, // ₹900 per day
      otRatePerHour: 150, // ₹150 / hr
      bankName: 'State Bank of India',
      bankAccountNo: '30491029381',
      bankIfsc: 'SBIN0001234',
      upiId: 'ramesh.kumar@oksbi',
      role: UserRole.PRODUCTION_MANAGER,
    },
    {
      employeeCode: 'EMP-002',
      firstName: 'Suresh',
      lastName: 'Patel',
      phone: '+91 98421 22334',
      email: 'suresh.weaver@manufacturing.com',
      gender: 'Male',
      joiningDate: new Date('2024-03-10'),
      departmentId: depts['DEPT-SW'].id,
      designationId: desigs['DES-WV'].id,
      salaryType: 'Daily Wage',
      salaryCycle: 'MONTHLY',
      baseWage: 850, // ₹850 per day
      otRatePerHour: 140, // ₹140 / hr
      bankName: 'HDFC Bank',
      bankAccountNo: '50100234567890',
      bankIfsc: 'HDFC0000456',
      upiId: 'suresh.weaver@okhdfcbank',
      role: UserRole.JOB_WORK_MANAGER,
    },
    {
      employeeCode: 'EMP-003',
      firstName: 'Lakshmi',
      lastName: 'Devi',
      phone: '+91 97890 33445',
      email: 'lakshmi.packaging@manufacturing.com',
      gender: 'Female',
      joiningDate: new Date('2024-06-01'),
      departmentId: depts['DEPT-PW'].id,
      designationId: desigs['DES-PK'].id,
      salaryType: 'Daily Wage',
      salaryCycle: 'WEEKLY',
      baseWage: 750, // ₹750 per day
      otRatePerHour: 120, // ₹120 / hr
      bankName: 'Canara Bank',
      bankAccountNo: '120938475610',
      bankIfsc: 'CNRB0002345',
      upiId: 'lakshmidevi@okaxis',
      role: UserRole.WAREHOUSE_INCHARGE,
    },
    {
      employeeCode: 'EMP-004',
      firstName: 'Hari',
      lastName: 'Bhaskar',
      phone: '+91 94432 44556',
      email: 'hari.bleach@manufacturing.com',
      gender: 'Male',
      joiningDate: new Date('2024-08-01'),
      departmentId: depts['DEPT-BC'].id,
      designationId: desigs['DES-BT'].id,
      salaryType: 'Daily Wage',
      salaryCycle: 'WEEKLY',
      baseWage: 800, // ₹800 per day
      otRatePerHour: 130, // ₹130 / hr
      bankName: 'Indian Overseas Bank',
      bankAccountNo: '045601000012345',
      bankIfsc: 'IOBA0000456',
      upiId: 'haribhaskar@ybl',
      role: UserRole.PRODUCTION_MANAGER,
    },
    {
      employeeCode: 'EMP-005',
      firstName: 'Anitha',
      lastName: 'Krishnan',
      phone: '+91 98412 55667',
      email: 'anitha.qc@manufacturing.com',
      gender: 'Female',
      joiningDate: new Date('2023-11-20'),
      departmentId: depts['DEPT-QC'].id,
      designationId: desigs['DES-QC'].id,
      salaryType: 'Daily Wage',
      salaryCycle: 'MONTHLY',
      baseWage: 1000, // ₹1000 per day
      otRatePerHour: 160, // ₹160 / hr
      bankName: 'Axis Bank',
      bankAccountNo: '918020034567890',
      bankIfsc: 'UTIB0000789',
      upiId: 'anitha.qc@okaxis',
      role: UserRole.QC_INSPECTOR,
    },
  ];

  const employees: Record<string, any> = {};
  for (const empData of employeesData) {
    const { role, ...empFields } = empData;
    const emp = await prisma.employee.create({
      data: {
        ...empFields,
        status: EmployeeStatus.ACTIVE,
      },
    });
    employees[emp.employeeCode] = emp;

    // Create User Account
    await prisma.user.create({
      data: {
        email: emp.email!,
        passwordHash,
        role,
        isActive: true,
        employeeId: emp.id,
      },
    });

    // Create Salary Structure
    await prisma.salaryStructure.create({
      data: {
        employeeId: emp.id,
        baseSalary: Number(emp.baseWage) * 26,
        hra: 2000,
        conveyance: 1000,
        pfDeduction: 0,
        esiDeduction: 0,
      },
    });
  }

  // Create Primary Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@manufacturing.com',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✔ Master Admin User ready: admin@manufacturing.com / Admin@12345');

  // =========================================================================
  // 4. ATTENDANCE LOGS (5 distinct days per employee with IST timestamps)
  // =========================================================================
  console.log('🌱 [4/8] Seeding Attendance Logs (IST Shifts & OT)...');

  // Dates: August 21 to 25, 2026
  const attendanceDates = ['2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24', '2026-08-25'];

  for (const empCode of Object.keys(employees)) {
    const emp = employees[empCode];
    const isWeaver = empCode === 'EMP-002';
    const isBleach = empCode === 'EMP-004';

    for (let i = 0; i < attendanceDates.length; i++) {
      const dateStr = attendanceDates[i];
      const isSunday = i === 2; // Aug 23 was Sunday

      let status: AttendanceStatus = AttendanceStatus.PRESENT;
      let checkInStr: string | null = `${dateStr}T09:00:00+05:30`;
      let lunchStartStr: string | null = `${dateStr}T13:30:00+05:30`;
      let lunchEndStr: string | null = `${dateStr}T14:30:00+05:30`;
      let checkOutStr: string | null = `${dateStr}T18:30:00+05:30`;
      let workingHours = 8.5;
      let overtimeHours = 0;
      let otAmount = 0;

      if (isSunday) {
        status = AttendanceStatus.WEEKLY_OFF;
        checkInStr = null;
        lunchStartStr = null;
        lunchEndStr = null;
        checkOutStr = null;
        workingHours = 0;
      } else if (i === 1 && isWeaver) {
        // Half day on Saturday for weaver
        status = AttendanceStatus.HALF_DAY;
        checkOutStr = `${dateStr}T13:45:00+05:30`;
        workingHours = 4.25;
      } else if (i === 4 && isBleach) {
        // Overtime shift (worked till 08:30 PM = 2 hours OT)
        checkOutStr = `${dateStr}T20:30:00+05:30`;
        workingHours = 8.5;
        overtimeHours = 2.0;
        otAmount = 2.0 * Number(emp.otRatePerHour);
      } else if (i === 0 && empCode === 'EMP-001') {
        // Ramesh worked 1.5h OT on Friday
        checkOutStr = `${dateStr}T20:00:00+05:30`;
        workingHours = 8.5;
        overtimeHours = 1.5;
        otAmount = 1.5 * Number(emp.otRatePerHour);
      }

      await prisma.attendanceLog.create({
        data: {
          employeeId: emp.id,
          date: new Date(dateStr),
          status,
          checkIn: checkInStr ? new Date(checkInStr) : null,
          lunchStart: lunchStartStr ? new Date(lunchStartStr) : null,
          lunchEnd: lunchEndStr ? new Date(lunchEndStr) : null,
          checkOut: checkOutStr ? new Date(checkOutStr) : null,
          workingHours,
          overtimeHours,
          otAmount,
          remarks: overtimeHours > 0 ? `Urgent production shift (+${overtimeHours}h OT)` : 'Regular shift',
        },
      });
    }
  }

  // =========================================================================
  // 5. EMPLOYEE ADVANCES, REPAYMENTS & SALARY SETTLEMENTS (3-5 records)
  // =========================================================================
  console.log('🌱 [5/8] Seeding Employee Advances & Payment Settlements...');

  // Advance 1: Ramesh Kumar ₹5,000 (Active, ₹500/week deduction, ₹1,000 repaid)
  const adv1 = await prisma.employeeAdvance.create({
    data: {
      employeeId: employees['EMP-001'].id,
      amount: 5000,
      repaidAmount: 1000,
      balanceAmount: 4000,
      weeklyDeduction: 500,
      reason: 'Medical Emergency Loan',
      status: 'ACTIVE',
      issueDate: new Date('2026-08-01'),
      createdByUserId: adminUser.id,
    },
  });

  await prisma.advanceRepayment.create({
    data: {
      advanceId: adv1.id,
      employeeId: employees['EMP-001'].id,
      amount: 1000,
      paymentMethod: PaymentMethod.CASH,
      repaymentDate: new Date('2026-08-15'),
      notes: 'Weekly cash installment repayment (2 weeks)',
      recordedByUserId: adminUser.id,
    },
  });

  // Advance 2: Lakshmi Devi ₹3,000 (Active, ₹500/week deduction)
  const adv2 = await prisma.employeeAdvance.create({
    data: {
      employeeId: employees['EMP-003'].id,
      amount: 3000,
      repaidAmount: 500,
      balanceAmount: 2500,
      weeklyDeduction: 500,
      reason: 'School Fees Advance',
      status: 'ACTIVE',
      issueDate: new Date('2026-08-10'),
      createdByUserId: adminUser.id,
    },
  });

  await prisma.advanceRepayment.create({
    data: {
      advanceId: adv2.id,
      employeeId: employees['EMP-003'].id,
      amount: 500,
      paymentMethod: PaymentMethod.CASH,
      repaymentDate: new Date('2026-08-17'),
      notes: 'Weekly deduction',
      recordedByUserId: adminUser.id,
    },
  });

  // Advance 3: Suresh Patel ₹2,000 (Fully Repaid)
  const adv3 = await prisma.employeeAdvance.create({
    data: {
      employeeId: employees['EMP-002'].id,
      amount: 2000,
      repaidAmount: 2000,
      balanceAmount: 0,
      weeklyDeduction: 500,
      reason: 'Travel Expense Advance',
      status: 'FULLY_REPAID',
      issueDate: new Date('2026-07-01'),
      createdByUserId: adminUser.id,
    },
  });

  // Payroll Run: July 2026 Monthly Run (Approved & Paid)
  const payrollRun = await prisma.payrollRun.create({
    data: {
      payrollCode: 'PAY-2026-07-M',
      month: 7,
      year: 2026,
      periodType: 'MONTHLY',
      totalEmployees: 5,
      totalGross: 115000,
      totalDeductions: 2000,
      totalBonus: 0,
      totalOvertime: 4500,
      totalNet: 117500,
      status: PayrollStatus.PAID,
      remarks: 'July 2026 Monthly Staff & Operator Salary Run',
      generatedByUserId: adminUser.id,
      approvedByUserId: adminUser.id,
    },
  });

  // Payroll Items & Payments for July
  for (const empCode of Object.keys(employees)) {
    const emp = employees[empCode];
    const item = await prisma.payrollItem.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: emp.id,
        salaryType: emp.salaryType || 'Daily Wage',
        periodType: 'MONTHLY',
        baseWage: Number(emp.baseWage),
        workingDaysInMonth: 26,
        presentDays: 24,
        absentDays: 2,
        halfDays: 0,
        leaveDays: 0,
        holidayCount: 0,
        weeklyOffCount: 4,
        payableDays: 24,
        basicSalary: 24 * Number(emp.baseWage),
        overtimeHours: 6.0,
        overtimeRate: Number(emp.otRatePerHour),
        overtimeSalary: 6.0 * Number(emp.otRatePerHour),
        grossSalary: 24 * Number(emp.baseWage) + 6.0 * Number(emp.otRatePerHour),
        advanceDeduction: empCode === 'EMP-002' ? 2000 : 0,
        totalDeductions: empCode === 'EMP-002' ? 2000 : 0,
        netSalary: 24 * Number(emp.baseWage) + 6.0 * Number(emp.otRatePerHour) - (empCode === 'EMP-002' ? 2000 : 0),
        status: PayrollStatus.PAID,
      },
    });

    // Create Payment Record
    await prisma.salaryPayment.create({
      data: {
        employeeId: emp.id,
        payrollItemId: item.id,
        paymentType: 'FULL_SETTLEMENT',
        amount: item.netSalary,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        transactionRef: `NEFT-202607-${emp.employeeCode}`,
        paymentDate: new Date('2026-08-01'),
        remarks: `July 2026 Salary Settlement for ${emp.firstName}`,
        paidByUserId: adminUser.id,
      },
    });
  }

  // =========================================================================
  // 6. UNITS, CATEGORIES, STORAGE LOCATIONS & SUPPLIERS (5 records each)
  // =========================================================================
  console.log('🌱 [6/8] Seeding Masters: Units, Categories, Locations, Suppliers...');

  const unitsData = [
    { name: 'Kilogram', abbreviation: 'Kg' },
    { name: 'Meter', abbreviation: 'm' },
    { name: 'Roll', abbreviation: 'Roll' },
    { name: 'Piece', abbreviation: 'Pcs' },
    { name: 'Carton Box', abbreviation: 'Box' },
  ];

  const uoms: Record<string, string> = {};
  for (const u of unitsData) {
    const created = await prisma.unitOfMeasure.create({ data: u });
    uoms[u.abbreviation] = created.id;
  }

  const categoriesData = [
    { name: 'Raw Cotton & Textile Yarn', description: 'High-grade combed cotton bales, grey yarn and woven gauze' },
    { name: 'Bleached Medical Gauze & Fabrics', description: 'Scoured and peroxide-bleached medical gauze fabrics' },
    { name: 'Non-Wovens & Films', description: 'SMS polypropylene, breathable PE film and spunbond fabrics' },
    { name: 'Packaging Materials', description: 'Sterilization pouches, cartons, fenestration tape and rolls' },
    { name: 'Finished Surgical Products', description: 'Sterile gauze swabs, roller bandages, gamjee pads and kits' },
  ];

  const cats: Record<string, string> = {};
  for (const c of categoriesData) {
    const created = await prisma.category.create({ data: c });
    cats[c.name] = created.id;
  }

  const locationsData = [
    { code: 'LOC-RM-01', name: 'Raw Cotton Warehouse', warehouseZone: 'Zone A', description: 'Bale storage and grey roll staging' },
    { code: 'LOC-PR-02', name: 'Bleaching & Chemical Bay', warehouseZone: 'Zone B', description: 'Kier boiling and scouring chemical vault' },
    { code: 'LOC-NW-03', name: 'Non-Woven & Fabric Store', warehouseZone: 'Zone C', description: 'SMS fabrics, PP rolls and films' },
    { code: 'LOC-PK-04', name: 'Packaging Depot', warehouseZone: 'Zone D', description: 'Corrugated cartons, rolls and pouches' },
    { code: 'LOC-FG-05', name: 'Finished Goods Warehouse', warehouseZone: 'Zone E', description: 'Sterilized medical supplies ready for dispatch' },
  ];

  const locs: Record<string, string> = {};
  for (const loc of locationsData) {
    const created = await prisma.storageLocation.create({ data: loc });
    locs[loc.code] = created.id;
  }

  const suppliersData = [
    {
      code: 'SUP-001',
      name: 'Coimbatore Cotton Mills Ltd',
      contactPerson: 'S. K. Raman',
      phone: '+91 98430 12345',
      email: 'sales@coimbatorecotton.com',
      gstin: '33AAACC1234A1Z1',
      address: 'Industrial Belt, Coimbatore, Tamil Nadu',
    },
    {
      code: 'SUP-002',
      name: 'Supreme Medical Nonwovens Pvt Ltd',
      contactPerson: 'R. Rajesh',
      phone: '+91 98421 88442',
      email: 'orders@supremenonwovens.com',
      gstin: '33BBBDD4321B1Z4',
      address: 'SIPCOT Industrial Park, Perundurai, Tamil Nadu',
    },
    {
      code: 'SUP-003',
      name: 'Reliance Hygiene Polymers & Films',
      contactPerson: 'Amitabh Sen',
      phone: '+91 99887 76655',
      email: 'hygiene.supplies@reliancepolymers.com',
      gstin: '27AABCR1234C1Z9',
      address: 'Petrochemical Complex, Hazira, Gujarat',
    },
    {
      code: 'SUP-004',
      name: 'Nilgiri Botanical Extracts Ltd',
      contactPerson: 'V. Sundaram',
      phone: '+91 94431 90876',
      email: 'botanicals@nilgiriaroma.in',
      gstin: '33CCCEE9876D1Z3',
      address: 'Tea Estate Road, Ooty, Tamil Nadu',
    },
    {
      code: 'SUP-005',
      name: 'Global Medical Packaging Ltd',
      contactPerson: 'P. Murugesan',
      phone: '+91 98412 39900',
      email: 'contact@globalmedpack.in',
      gstin: '33FFFGG7654E1Z8',
      address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    },
  ];

  const sups: Record<string, string> = {};
  for (const s of suppliersData) {
    const created = await prisma.supplier.create({ data: s });
    sups[s.code] = created.id;
  }

  // =========================================================================
  // 7. RAW MATERIALS & INVENTORY BATCHES (5 records)
  // =========================================================================
  console.log('🌱 [7/8] Seeding 5 Core Raw Materials & Batches...');

  const rawMaterialsData = [
    {
      sku: 'RM-COT-001',
      name: 'Raw Cotton 100% Combed Medical Grade',
      description: 'Long-staple combed cotton bales for absorbent balls and surgical rolls',
      hsnCode: '520100',
      min: 500,
      max: 5000,
      stock: 2500,
      unitCost: 135,
      cat: 'Raw Cotton & Textile Yarn',
      uom: 'Kg',
      sup: 'SUP-001',
      loc: 'LOC-RM-01',
    },
    {
      sku: 'RM-GAU-002',
      name: 'Grey Woven Gauze Fabric Roll 48"',
      description: 'Unbleached grey gauze rolls ready for scouring and bleaching',
      hsnCode: '520811',
      min: 300,
      max: 3000,
      stock: 2000,
      unitCost: 145,
      cat: 'Raw Cotton & Textile Yarn',
      uom: 'Kg',
      sup: 'SUP-001',
      loc: 'LOC-RM-01',
    },
    {
      sku: 'RM-BLG-003',
      name: 'Bleached Medical Gauze Roll 48"',
      description: 'Pharmacopoeia-grade scoured and bleached surgical gauze fabric',
      hsnCode: '300590',
      min: 250,
      max: 2500,
      stock: 1200,
      unitCost: 190,
      cat: 'Bleached Medical Gauze & Fabrics',
      uom: 'Kg',
      sup: 'SUP-001',
      loc: 'LOC-PR-02',
    },
    {
      sku: 'RM-SMS-004',
      name: 'Medical Grade SMS Non-Woven 45 GSM',
      description: 'Hydrophobic 3-ply SMS non-woven fabric for surgical drapes and gowns',
      hsnCode: '560312',
      min: 200,
      max: 2000,
      stock: 800,
      unitCost: 210,
      cat: 'Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-002',
      loc: 'LOC-NW-03',
    },
    {
      sku: 'PKG-BOX-005',
      name: 'Corrugated 5-Ply Master Carton Box',
      description: 'Heavy duty corrugated export box for surgical bandage packing',
      hsnCode: '481910',
      min: 100,
      max: 1000,
      stock: 800,
      unitCost: 35,
      cat: 'Packaging Materials',
      uom: 'Pcs',
      sup: 'SUP-005',
      loc: 'LOC-PK-04',
    },
  ];

  const rawMaterials: Record<string, any> = {};
  for (const rm of rawMaterialsData) {
    const created = await prisma.rawMaterial.create({
      data: {
        sku: rm.sku,
        name: rm.name,
        description: rm.description,
        hsnCode: rm.hsnCode,
        minimumStockLevel: rm.min,
        maximumStockLevel: rm.max,
        reorderQuantity: rm.min * 2,
        currentStockBalance: rm.stock,
        unitCost: rm.unitCost,
        lastPurchaseRate: rm.unitCost,
        avgCost: rm.unitCost,
        gstRate: 5.0,
        categoryId: cats[rm.cat],
        unitId: uoms[rm.uom],
        supplierId: sups[rm.sup],
        storageLocationId: locs[rm.loc],
      },
    });
    rawMaterials[rm.sku] = created;

    // Create Initial Batch
    const batch = await prisma.inventoryBatch.create({
      data: {
        rawMaterialId: created.id,
        batchNumber: `BAT-2026-${rm.sku.slice(-3)}`,
        quantityReceived: rm.stock,
        quantityRemaining: rm.stock,
        receivedDate: new Date('2026-08-01'),
        supplierInvoiceRef: `INV-2026-${rm.sku.slice(-3)}`,
      },
    });

    // Create Inventory Transaction
    await prisma.inventoryTransaction.create({
      data: {
        rawMaterialId: created.id,
        batchId: batch.id,
        transactionType: TransactionType.PURCHASE_RECEIPT,
        quantity: rm.stock,
        previousStock: 0,
        newStock: rm.stock,
        unitPrice: rm.unitCost,
        referenceNumber: `GRN-2026-${rm.sku.slice(-3)}`,
        referenceDocumentType: 'PURCHASE_ORDER',
        notes: `Initial stock receipt of ${rm.name}`,
        createdByUserId: adminUser.id,
      },
    });
  }

  // =========================================================================
  // 8. SUBCONTRACTING JOB WORK, SERIALIZED ROLLS & WORK ORDERS (3-5 records)
  // =========================================================================
  console.log('🌱 [8/8] Seeding Job Work Subcontractors, Serialized Rolls & Work Orders...');

  // 3 Job Work Subcontractor Companies
  const jwCompaniesData = [
    {
      companyName: 'Sri Lakshmi Bleaching & Scouring Works',
      contactPerson: 'K. Rajendran',
      phone: '+91 98421 00912',
      email: 'contact@lakshmibleaching.com',
      gstin: '33AAAAA0000A1Z5',
      address: '12/4 Industrial Estate, Erode, Tamil Nadu',
      creditDays: 30,
    },
    {
      companyName: 'Apex Medical Sterilization & Gamma Processing',
      contactPerson: 'Dr. N. Swaminathan',
      phone: '+91 94425 51122',
      email: 'sterilization@apexgamma.com',
      gstin: '33GGGGG8888G1Z1',
      address: 'Plot 45, SIPCOT Phase II, Hosur, Tamil Nadu',
      creditDays: 30,
    },
    {
      companyName: 'Tirupur Elastic & Webbing Mills',
      contactPerson: 'M. Shanmugam',
      phone: '+91 94432 09123',
      email: 'info@tirupurelastic.in',
      gstin: '33BBBBB1111B1Z2',
      address: '45 Weavers Colony, Tirupur, Tamil Nadu',
      creditDays: 45,
    },
  ];

  const jwComps: Record<string, any> = {};
  for (const jwc of jwCompaniesData) {
    const created = await prisma.jobWorkCompany.create({ data: jwc });
    jwComps[jwc.companyName] = created;
  }

  // 3 Product Masters (Finished Goods)
  const productsData = [
    {
      productCode: 'FG-GAU-100',
      name: 'Sterile Roller Bandage 10cm x 4m',
      category: 'Dressing Care',
      hsnCode: '300590',
      unitOfMeasure: 'Pcs',
      standardWidth: 4,
      standardLength: 4,
      standardWeight: 0.045,
      targetGsm: 32,
      minStockLevel: 500,
    },
    {
      productCode: 'FG-GAM-200',
      name: 'Gamjee Pad 20cm x 20cm (Absorbent)',
      category: 'Dressing Care',
      hsnCode: '300590',
      unitOfMeasure: 'Pcs',
      standardWidth: 8,
      standardLength: 8,
      standardWeight: 0.08,
      targetGsm: 180,
      minStockLevel: 300,
    },
    {
      productCode: 'FG-DRP-300',
      name: 'Surgical SMS Drape Sheet 150cm x 200cm',
      category: 'Patient Safety',
      hsnCode: '630790',
      unitOfMeasure: 'Pcs',
      standardWidth: 60,
      standardLength: 80,
      standardWeight: 0.15,
      targetGsm: 45,
      minStockLevel: 200,
    },
  ];

  const products: Record<string, any> = {};
  for (const p of productsData) {
    const created = await prisma.productMaster.create({ data: p });
    products[p.productCode] = created;

    // Create BOM Header
    const bom = await prisma.billOfMaterial.create({
      data: {
        bomNumber: `BOM-${p.productCode}`,
        productId: created.id,
        version: '1.0',
        description: `Standard Bill of Material for ${p.name}`,
      },
    });

    // Add BOM Item
    await prisma.bOMItem.create({
      data: {
        bomId: bom.id,
        materialName: 'Bleached Medical Gauze Fabric Roll 48"',
        quantity: 0.05,
        uom: 'Kg',
        wastagePercent: 2.5,
      },
    });
  }

  // 3 Production Batches / Work Orders
  const batch1 = await prisma.productionBatch.create({
    data: {
      batchNumber: 'PB-2026-001',
      workOrderNumber: 'WO-2026-001',
      targetProduct: 'Sterile Roller Bandage 10cm x 4m',
      plannedQty: 1000,
      completedQty: 1000,
      rejectedQty: 10,
      status: ProductionWorkOrderStatus.COMPLETED,
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-12'),
    },
  });

  const batch2 = await prisma.productionBatch.create({
    data: {
      batchNumber: 'PB-2026-002',
      workOrderNumber: 'WO-2026-002',
      targetProduct: 'Gamjee Pad 20cm x 20cm (Absorbent)',
      plannedQty: 500,
      completedQty: 250,
      rejectedQty: 5,
      status: ProductionWorkOrderStatus.IN_PROGRESS,
      startDate: new Date('2026-08-18'),
    },
  });

  const batch3 = await prisma.productionBatch.create({
    data: {
      batchNumber: 'PB-2026-003',
      workOrderNumber: 'WO-2026-003',
      targetProduct: 'Surgical SMS Drape Sheet 150cm x 200cm',
      plannedQty: 400,
      completedQty: 0,
      rejectedQty: 0,
      status: ProductionWorkOrderStatus.PLANNED,
    },
  });

  // 5 Serialized Cotton Rolls (Spanning Different Lifecycle Stages)
  const rollsData = [
    {
      rollNumber: 'ROLL-2026-001',
      barcode: 'BAR-ROLL-2026-001',
      batchNumber: 'BAT-2026-001',
      materialName: 'Raw Cotton 100% Combed Medical Grade',
      stage: RollStage.RAW_COTTON_BALE,
      widthInches: 48,
      lengthMeters: 250,
      weightKg: 120.5,
      gsm: 40,
      currentStatus: RollStatus.STORED_IN_RM,
      currentLocation: 'LOC-RM-01: Bay 1',
    },
    {
      rollNumber: 'ROLL-2026-002',
      barcode: 'BAR-ROLL-2026-002',
      batchNumber: 'BAT-2026-002',
      materialName: 'Grey Woven Gauze Fabric Roll 48"',
      stage: RollStage.GREY_FABRIC_ROLL,
      widthInches: 48,
      lengthMeters: 400,
      weightKg: 85.0,
      gsm: 32,
      currentStatus: RollStatus.ISSUED_TO_JOBWORK,
      currentLocation: 'Sri Lakshmi Bleaching & Scouring Works',
      jobWorkCompanyId: jwComps['Sri Lakshmi Bleaching & Scouring Works'].id,
    },
    {
      rollNumber: 'ROLL-2026-003',
      barcode: 'BAR-ROLL-2026-003',
      batchNumber: 'BAT-2026-003',
      materialName: 'Bleached Medical Gauze Roll 48"',
      stage: RollStage.BLEACHED_GAUZE_ROLL,
      widthInches: 48,
      lengthMeters: 400,
      weightKg: 82.5,
      gsm: 30,
      currentStatus: RollStatus.QC_APPROVED,
      currentLocation: 'LOC-PR-02: Rack B-4',
      productionBatchId: batch1.id,
    },
    {
      rollNumber: 'ROLL-2026-004',
      barcode: 'BAR-ROLL-2026-004',
      batchNumber: 'BAT-2026-004',
      materialName: 'Slit Gauze Ribbon Roll 10cm',
      stage: RollStage.SLIT_ROLL,
      widthInches: 4,
      lengthMeters: 800,
      weightKg: 42.0,
      gsm: 30,
      currentStatus: RollStatus.IN_PRODUCTION,
      currentLocation: 'LOC-PR-02: Cutting Station 1',
      productionBatchId: batch2.id,
    },
    {
      rollNumber: 'ROLL-2026-005',
      barcode: 'BAR-ROLL-2026-005',
      batchNumber: 'BAT-2026-005',
      materialName: 'Finished Roller Bandage 10cm x 4m',
      stage: RollStage.FINISHED_PRODUCT_ROLL,
      widthInches: 4,
      lengthMeters: 4,
      weightKg: 0.045,
      gsm: 32,
      currentStatus: RollStatus.PACKED,
      currentLocation: 'LOC-FG-05: Pouch Bin 12',
      finishedProductId: products['FG-GAU-100'].id,
    },
  ];

  for (const r of rollsData) {
    const createdRoll = await prisma.cottonRoll.create({ data: r });

    // Status History
    await prisma.rollStatusHistory.create({
      data: {
        rollId: createdRoll.id,
        toStatus: r.currentStatus,
        location: r.currentLocation,
        performedBy: 'Ramesh Kumar (Supervisor)',
        remarks: `Initialized roll ${r.rollNumber} at stage ${r.stage}`,
      },
    });

    // QC Inspection for QC_APPROVED roll
    if (r.currentStatus === RollStatus.QC_APPROVED) {
      await prisma.qCInspection.create({
        data: {
          inspectionNumber: `QC-INSP-2026-001`,
          rollId: createdRoll.id,
          productionBatchId: batch1.id,
          testedGsm: 30.5,
          testedAbsorbency: 1.8, // < 10 sec is standard
          testedWhiteness: 88.5, // > 80% is medical grade
          testedpH: 6.8, // Neutral
          moistureContent: 6.2,
          resultStatus: QCResultStatus.PASSED,
          inspectorName: 'Anitha Krishnan (QC Lead)',
          remarks: 'Pharmacopoeia standards met. Absorbency & whiteness approved.',
        },
      });
    }
  }

  // 3 Job Work Orders
  const jwo1 = await prisma.jobWorkOrder.create({
    data: {
      jobWorkNumber: 'JWO-2026-001',
      challanNumber: 'CH-2026-001',
      expectedReturnDate: new Date('2026-08-28'),
      status: JobWorkStatus.IN_PROGRESS,
      jobWorkCompanyId: jwComps['Sri Lakshmi Bleaching & Scouring Works'].id,
      rawMaterialId: rawMaterials['RM-GAU-002'].id,
      finishedProductId: rawMaterials['RM-BLG-003'].id,
      totalIssuedWeight: 85.0,
      totalIssuedQty: 1,
      pendingWeight: 85.0,
      pendingQty: 1,
      vehicleNumber: 'TN-33-AX-8910',
      driverName: 'Murugan K.',
      remarks: 'Bleaching & scouring job work order for Grey Gauze Roll',
    },
  });

  await prisma.jobWorkIssueItem.create({
    data: {
      jobWorkOrderId: jwo1.id,
      rollNumber: 'ROLL-2026-002',
      issuedWeight: 85.0,
      issuedQty: 1,
      remarks: 'Dispatched for 48" scouring and chemical bleaching',
    },
  });

  await prisma.jobWorkStatusHistory.create({
    data: {
      jobWorkOrderId: jwo1.id,
      fromStatus: JobWorkStatus.CREATED,
      toStatus: JobWorkStatus.MATERIALS_ISSUED,
      notes: 'Dispatched to Sri Lakshmi Bleaching via vehicle TN-33-AX-8910',
      performedByUserId: adminUser.id,
    },
  });

  const jwo2 = await prisma.jobWorkOrder.create({
    data: {
      jobWorkNumber: 'JWO-2026-002',
      challanNumber: 'CH-2026-002',
      expectedReturnDate: new Date('2026-08-20'),
      status: JobWorkStatus.COMPLETED,
      jobWorkCompanyId: jwComps['Apex Medical Sterilization & Gamma Processing'].id,
      rawMaterialId: rawMaterials['RM-BLG-003'].id,
      finishedProductId: rawMaterials['RM-BLG-003'].id,
      totalIssuedWeight: 150.0,
      totalIssuedQty: 2,
      totalReturnedWeight: 147.5,
      totalReturnedQty: 2,
      totalWastageWeight: 2.5,
      totalWastageQty: 0,
      pendingWeight: 0,
      pendingQty: 0,
      vehicleNumber: 'TN-29-BF-4412',
      driverName: 'Senthil Kumar',
      remarks: 'Gamma sterilization batch completed and returned',
      closedAt: new Date('2026-08-20'),
      closedByUserId: adminUser.id,
    },
  });

  await prisma.jobWorkReturnItem.create({
    data: {
      jobWorkOrderId: jwo2.id,
      returnedDate: new Date('2026-08-20'),
      rollNumber: 'ROLL-2026-003',
      returnedWeight: 147.5,
      returnedQty: 2,
      wastageWeight: 2.5,
      finishedProductId: rawMaterials['RM-BLG-003'].id,
      remarks: 'Gamma sterilization passed with zero microbial load',
      receivedByUserId: adminUser.id,
    },
  });

  // 2 Packing Bundles
  await prisma.packingBundle.create({
    data: {
      bundleBarcode: 'BUN-2026-001',
      bundleType: 'Master Export Carton (500 units)',
      grossWeightKg: 25.5,
      netWeightKg: 22.5,
      totalUnits: 500,
      locationBin: 'LOC-FG-05: Rack E-1',
      isDispatched: false,
    },
  });

  await prisma.packingBundle.create({
    data: {
      bundleBarcode: 'BUN-2026-002',
      bundleType: 'Standard Box (250 units)',
      grossWeightKg: 13.0,
      netWeightKg: 11.25,
      totalUnits: 250,
      locationBin: 'LOC-FG-05: Rack E-2',
      isDispatched: true,
    },
  });

  // 9. GAUZE PRODUCTION MODULE MASTERS & GOLDEN TEST CASE
  console.log('🏭 [9/9] Seeding Gauze Production Module & Golden Test Case...');

  const gzTypeBP17 = await prisma.gauzeType.create({
    data: {
      name: 'BP17 Absorbent Gauze',
      code: 'GZ-BP17',
      description: 'British Pharmacopoeia 17 threads/sq.cm standard surgical gauze fabric',
      active: true,
    },
  });

  const gzTypeLight = await prisma.gauzeType.create({
    data: {
      name: 'Type 13 Light Gauze',
      code: 'GZ-TYP13',
      description: '13 threads/sq.cm lightweight gauze for absorbent pads and bandages',
      active: true,
    },
  });

  const gzSizeThan = await prisma.gauzeSize.create({
    data: {
      name: '120 cm x 20 m (Than Roll)',
      width: 120,
      widthUom: 'cm',
      length: 20,
      lengthUom: 'm',
      description: 'Standard loom than roll dimensions',
      active: true,
    },
  });

  const gzSizePack = await prisma.gauzeSize.create({
    data: {
      name: '10 cm x 10 cm (Swab)',
      width: 10,
      widthUom: 'cm',
      length: 10,
      lengthUom: 'cm',
      description: 'Finished sterile 8-ply swab dimension',
      active: true,
    },
  });

  const bleachH2O2 = await prisma.bleachingType.create({
    data: {
      name: 'Hydrogen Peroxide Bleaching',
      code: 'BLEACH-H2O2',
      description: 'Eco-friendly, chlorine-free peroxide process ensuring high absorbency & optimal whiteness',
      active: true,
    },
  });

  const bleachKier = await prisma.bleachingType.create({
    data: {
      name: 'Kier Boiling & Scouring',
      code: 'BLEACH-KIER',
      description: 'Pressure kier scouring with caustic soda for maximum dewaxing and absorbency',
      active: true,
    },
  });

  const opCutting = await prisma.gauzeOperationType.create({
    data: {
      name: 'Cutting & Slitting',
      code: 'OP-CUT',
      description: 'Rotary cutting and continuous slitting to precise width',
      sequence: 1,
      active: true,
    },
  });

  const opFolding = await prisma.gauzeOperationType.create({
    data: {
      name: 'Folding & Layering',
      code: 'OP-FOLD',
      description: 'Automatic folding into multi-ply layers with tucked edges',
      sequence: 2,
      active: true,
    },
  });

  const opInspection = await prisma.gauzeOperationType.create({
    data: {
      name: 'Visual QC & Inspection',
      code: 'OP-INSP',
      description: '100% backlit visual inspection for thread defects, foreign matter, and dimensional tolerance',
      sequence: 3,
      active: true,
    },
  });

  // Target Raw Material, Supplier, and Warehouse IDs from existing seeded entities
  const rawGauzeProduct = rawMaterials['RM-COT-001'] || Object.values(rawMaterials)[0];
  const gauzeSupplierId = sups['SUP-001'];
  const bleachingVendor = jwComps['Sri Lakshmi Bleaching & Scouring Works'] || Object.values(jwComps)[0];
  const targetFinishedProduct = rawMaterials['RM-BLG-001'] || rawGauzeProduct;
  const mainWarehouseId = locs['LOC-RM-01'];
  const finishedWarehouseId = locs['LOC-FG-05'];

  // Golden Test Case Batch: GZ-2026-00001
  const goldenBatch = await prisma.gauzeProductionBatch.create({
    data: {
      batchNumber: 'GZ-2026-00001',
      productId: rawGauzeProduct.id,
      gauzeTypeId: gzTypeBP17.id,
      gauzeSizeId: gzSizeThan.id,
      supplierId: gauzeSupplierId,
      inputQuantity: 1000,
      inputUom: 'meter',
      currentQuantity: 0, // Fully packed and converted
      currentUom: 'meter',
      currentStage: 'FINISHED_GOODS_STOCK',
      status: 'COMPLETED',
      productionStartDate: new Date('2026-08-10'),
      expectedCompletionDate: new Date('2026-08-18'),
      completionDate: new Date('2026-08-18'),
      notes: 'Golden Test Case — End-to-end verified from unbleached roll through bleaching, cutting, folding & finished packs',
      createdById: adminUser.id,
    },
  });

  // 1. Raw Material Inward
  await prisma.gauzeRawMaterial.create({
    data: {
      productionBatchId: goldenBatch.id,
      productId: rawGauzeProduct.id,
      supplierId: gauzeSupplierId,
      supplierReference: 'INV-SLCM-2026-9901',
      rollOrThansNumber: 'LOT-SLCM-TH01-50',
      gauzeTypeId: gzTypeBP17.id,
      gauzeSizeId: gzSizeThan.id,
      quantity: 1000,
      uom: 'meter',
      receivedDate: new Date('2026-08-10'),
      warehouseId: mainWarehouseId,
      notes: '50 thans received @ 20m per than in pristine condition',
    },
  });

  await prisma.gauzeMaterialMovement.create({
    data: {
      productionBatchId: goldenBatch.id,
      referenceType: 'RAW_MATERIAL_RECEIPT',
      referenceId: goldenBatch.id,
      movementType: 'RAW_MATERIAL_RECEIPT',
      fromLocationName: 'Coimbatore Cotton Mills Ltd',
      toLocationId: mainWarehouseId,
      toLocationName: 'Raw Cotton Warehouse',
      quantity: 1000,
      uom: 'meter',
      movementDate: new Date('2026-08-10'),
      notes: 'Initial raw gauze receipt from mill',
    },
  });

  // 2. Bleaching Dispatch
  const bleachingJob = await prisma.gauzeBleachingJob.create({
    data: {
      jobNumber: 'BJ-2026-00001',
      productionBatchId: goldenBatch.id,
      vendorId: bleachingVendor.id,
      bleachingTypeId: bleachH2O2.id,
      quantitySent: 1000,
      uom: 'meter',
      sentDate: new Date('2026-08-11'),
      expectedReturnDate: new Date('2026-08-14'),
      rate: 3.5,
      estimatedCost: 3500,
      actualCost: 3500,
      status: 'COMPLETED',
      notes: 'Dispatched via Vehicle TN-29-BF-4412 for peroxide bleaching process',
    },
  });

  await prisma.gauzeMaterialMovement.create({
    data: {
      productionBatchId: goldenBatch.id,
      referenceType: 'BLEACHING_JOB',
      referenceId: bleachingJob.id,
      movementType: 'SEND_TO_BLEACHING',
      fromLocationId: mainWarehouseId,
      fromLocationName: 'Raw Cotton Warehouse',
      toLocationName: bleachingVendor.companyName,
      quantity: 1000,
      uom: 'meter',
      movementDate: new Date('2026-08-11'),
      notes: `Dispatched to bleaching vendor ${bleachingVendor.companyName}`,
    },
  });

  // 3. Bleaching Return Receipt
  const bleachingReceipt = await prisma.gauzeBleachingReceipt.create({
    data: {
      receiptNumber: 'BR-2026-00001',
      bleachingJobId: bleachingJob.id,
      productionBatchId: goldenBatch.id,
      quantitySent: 1000,
      quantityReceived: 950,
      wastageQuantity: 30,
      rejectedQuantity: 20,
      uom: 'meter',
      receivedDate: new Date('2026-08-14'),
      qualityStatus: 'PASSED',
      notes: 'Returned with 950m accepted good yield, 30m process shrinkage, 20m edge discoloration scrap',
    },
  });

  await prisma.gauzeMaterialMovement.create({
    data: {
      productionBatchId: goldenBatch.id,
      referenceType: 'BLEACHING_RECEIPT',
      referenceId: bleachingReceipt.id,
      movementType: 'RECEIVE_FROM_BLEACHING',
      fromLocationName: bleachingVendor.companyName,
      toLocationId: mainWarehouseId,
      toLocationName: 'Raw Cotton Warehouse',
      quantity: 950,
      uom: 'meter',
      movementDate: new Date('2026-08-14'),
      notes: 'Received bleached fabric back to shop floor',
    },
  });

  // 4. Internal Operations
  const op1 = await prisma.gauzeProductionOperation.create({
    data: {
      operationNumber: 'PR-2026-00001',
      productionBatchId: goldenBatch.id,
      operationTypeId: opCutting.id,
      sequenceNumber: 1,
      inputQuantity: 950,
      outputQuantity: 910,
      wastageQuantity: 40,
      rejectedQuantity: 0,
      uom: 'meter',
      operationDate: new Date('2026-08-15'),
      status: 'COMPLETED',
      notes: 'Rotary slit into 10cm continuous width strips. 40m selvage edge scrap.',
    },
  });

  const op2 = await prisma.gauzeProductionOperation.create({
    data: {
      operationNumber: 'PR-2026-00002',
      productionBatchId: goldenBatch.id,
      operationTypeId: opFolding.id,
      sequenceNumber: 2,
      inputQuantity: 910,
      outputQuantity: 900,
      wastageQuantity: 10,
      rejectedQuantity: 0,
      uom: 'meter',
      operationDate: new Date('2026-08-16'),
      status: 'COMPLETED',
      notes: 'Folded into 8-ply 10cm x 10cm squares with tucked in sealed edges.',
    },
  });

  // 5. Finished Goods Packing
  const packingEntry = await prisma.gauzePackingEntry.create({
    data: {
      packingNumber: 'PK-2026-00001',
      productionBatchId: goldenBatch.id,
      productId: targetFinishedProduct.id,
      sizeDescription: '10cm x 10cm (8-Ply)',
      ply: 8,
      piecesPerPack: 100,
      numberOfPacks: 50,
      totalPieces: 5000,
      packingDate: new Date('2026-08-18'),
      finishedGoodsWarehouseId: finishedWarehouseId,
      status: 'COMPLETED',
      notes: '50 sealed sterile packs of 100 pcs each inwarded to Finished Goods Warehouse.',
    },
  });

  await prisma.gauzeMaterialMovement.create({
    data: {
      productionBatchId: goldenBatch.id,
      referenceType: 'PACKING_ENTRY',
      referenceId: packingEntry.id,
      movementType: 'FINISHED_GOODS_RECEIPT',
      fromLocationName: 'Shop Floor Packing Station',
      toLocationId: finishedWarehouseId,
      toLocationName: 'Finished Goods Warehouse',
      quantity: 5000,
      uom: 'piece',
      movementDate: new Date('2026-08-18'),
      notes: '5,000 finished gauze swab pieces placed into stock',
    },
  });

  // Status History
  await prisma.gauzeBatchStatusHistory.create({
    data: {
      productionBatchId: goldenBatch.id,
      oldStatus: 'DRAFT',
      newStatus: 'RAW_MATERIAL_RECEIVED',
      changedById: adminUser.id,
      changedAt: new Date('2026-08-10'),
      remarks: 'Raw material intake recorded',
    },
  });

  await prisma.gauzeBatchStatusHistory.create({
    data: {
      productionBatchId: goldenBatch.id,
      oldStatus: 'RAW_MATERIAL_RECEIVED',
      newStatus: 'SENT_TO_BLEACHING',
      changedById: adminUser.id,
      changedAt: new Date('2026-08-11'),
      remarks: 'Material dispatched to Kaveri Bleaching',
    },
  });

  await prisma.gauzeBatchStatusHistory.create({
    data: {
      productionBatchId: goldenBatch.id,
      oldStatus: 'SENT_TO_BLEACHING',
      newStatus: 'BLEACHING_RECEIVED',
      changedById: adminUser.id,
      changedAt: new Date('2026-08-14'),
      remarks: 'Bleached fabric received with 950m accepted yield',
    },
  });

  await prisma.gauzeBatchStatusHistory.create({
    data: {
      productionBatchId: goldenBatch.id,
      oldStatus: 'BLEACHING_RECEIVED',
      newStatus: 'IN_PROCESSING',
      changedById: adminUser.id,
      changedAt: new Date('2026-08-15'),
      remarks: 'Internal cutting and folding begun',
    },
  });

  await prisma.gauzeBatchStatusHistory.create({
    data: {
      productionBatchId: goldenBatch.id,
      oldStatus: 'IN_PROCESSING',
      newStatus: 'COMPLETED',
      changedById: adminUser.id,
      changedAt: new Date('2026-08-18'),
      remarks: 'Batch packing finished — 5,000 units added to finished goods inventory',
    },
  });

  // Create another active batch in progress: GZ-2026-00002
  const gzBatch2 = await prisma.gauzeProductionBatch.create({
    data: {
      batchNumber: 'GZ-2026-00002',
      productId: rawGauzeProduct.id,
      gauzeTypeId: gzTypeLight.id,
      gauzeSizeId: gzSizeThan.id,
      supplierId: gauzeSupplierId,
      inputQuantity: 2000,
      inputUom: 'meter',
      currentQuantity: 2000,
      currentUom: 'meter',
      currentStage: 'SENT_TO_BLEACHING',
      status: 'SENT_TO_BLEACHING',
      productionStartDate: new Date('2026-08-22'),
      expectedCompletionDate: new Date('2026-08-28'),
      notes: 'Large batch for Type 13 light absorbent gauze roll production',
      createdById: adminUser.id,
    },
  });

  await prisma.gauzeBleachingJob.create({
    data: {
      jobNumber: 'BJ-2026-00002',
      productionBatchId: gzBatch2.id,
      vendorId: bleachingVendor.id,
      bleachingTypeId: bleachKier.id,
      quantitySent: 2000,
      uom: 'meter',
      sentDate: new Date('2026-08-23'),
      expectedReturnDate: new Date('2026-08-27'),
      rate: 3.8,
      estimatedCost: 7600,
      status: 'SENT',
      notes: 'Currently undergoing pressure kier scouring at Kaveri Bleaching',
    },
  });

  console.log('🎉 [DONE] Database successfully populated with exactly up to 5 clear records per module + Gauze Production tracking!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

