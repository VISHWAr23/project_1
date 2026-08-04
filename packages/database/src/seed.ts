import { prisma, UserRole } from './index';
import * as bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting IMS Database Seeding...');

  // 1. Create Default Departments
  const deptProduction = await prisma.department.upsert({
    where: { code: 'PROD' },
    update: {},
    create: {
      name: 'Production & Manufacturing',
      code: 'PROD',
      description: 'Shop floor manufacturing and operations department',
    },
  });

  const deptWarehouse = await prisma.department.upsert({
    where: { code: 'WH' },
    update: {},
    create: {
      name: 'Warehouse & Logistics',
      code: 'WH',
      description: 'Raw material storage and stock management',
    },
  });

  // 2. Create Default Designations
  const desigAdmin = await prisma.designation.upsert({
    where: { code: 'SYS_ADMIN' },
    update: {},
    create: {
      name: 'System Administrator',
      code: 'SYS_ADMIN',
      description: 'Full system management and configuration access',
    },
  });

  // 3. Create Admin Employee Record
  const adminEmp = await prisma.employee.upsert({
    where: { employeeCode: 'EMP-001' },
    update: {},
    create: {
      employeeCode: 'EMP-001',
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@manufacturing.com',
      phone: '+919876543210',
      joiningDate: new Date('2025-01-01'),
      departmentId: deptProduction.id,
      designationId: desigAdmin.id,
    },
  });

  // 4. Create System Admin User Account
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@12345', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@manufacturing.com' },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@manufacturing.com',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
      employeeId: adminEmp.id,
    },
  });

  // 5. Create Default Categories & UOMs
  const catMetals = await prisma.category.upsert({
    where: { name: 'Raw Metals' },
    update: {},
    create: { name: 'Raw Metals', description: 'Aluminum, Steel, Copper raw stock' },
  });

  const uomKg = await prisma.unitOfMeasure.upsert({
    where: { name: 'Kilogram' },
    update: {},
    create: { name: 'Kilogram', abbreviation: 'Kg' },
  });

  // 6. Create Demo Raw Materials
  await prisma.rawMaterial.upsert({
    where: { sku: 'RM-ALU-001' },
    update: {},
    create: {
      sku: 'RM-ALU-001',
      name: 'Aluminum Sheet Grade 6061',
      hsnCode: '7606',
      minimumStockLevel: 500,
      reorderQuantity: 1000,
      currentStockBalance: 120,
      unitCost: 280,
      categoryId: catMetals.id,
      unitId: uomKg.id,
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`👤 Admin Account Created: ${adminUser.email} / Password: Admin@12345`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
