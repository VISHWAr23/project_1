"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const bcrypt = __importStar(require("bcryptjs"));
async function seed() {
    console.log('🌱 Starting IMS Database Seeding...');
    // 1. Create Default Departments
    const deptProduction = await index_1.prisma.department.upsert({
        where: { code: 'PROD' },
        update: {},
        create: {
            name: 'Production & Manufacturing',
            code: 'PROD',
            description: 'Shop floor manufacturing and operations department',
        },
    });
    const deptWarehouse = await index_1.prisma.department.upsert({
        where: { code: 'WH' },
        update: {},
        create: {
            name: 'Warehouse & Logistics',
            code: 'WH',
            description: 'Raw material storage and stock management',
        },
    });
    // 2. Create Default Designations
    const desigAdmin = await index_1.prisma.designation.upsert({
        where: { code: 'SYS_ADMIN' },
        update: {},
        create: {
            name: 'System Administrator',
            code: 'SYS_ADMIN',
            description: 'Full system management and configuration access',
        },
    });
    // 3. Create Admin Employee Record
    const adminEmp = await index_1.prisma.employee.upsert({
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
    const adminUser = await index_1.prisma.user.upsert({
        where: { email: 'admin@manufacturing.com' },
        update: {
            passwordHash,
            role: index_1.UserRole.ADMIN,
            isActive: true,
        },
        create: {
            email: 'admin@manufacturing.com',
            passwordHash,
            role: index_1.UserRole.ADMIN,
            isActive: true,
            employeeId: adminEmp.id,
        },
    });
    // 5. Create Default Categories & UOMs
    const catMetals = await index_1.prisma.category.upsert({
        where: { name: 'Raw Metals' },
        update: {},
        create: { name: 'Raw Metals', description: 'Aluminum, Steel, Copper raw stock' },
    });
    const uomKg = await index_1.prisma.unitOfMeasure.upsert({
        where: { name: 'Kilogram' },
        update: {},
        create: { name: 'Kilogram', abbreviation: 'Kg' },
    });
    // 6. Create Demo Raw Materials
    await index_1.prisma.rawMaterial.upsert({
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
    await index_1.prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map