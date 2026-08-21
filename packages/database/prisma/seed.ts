import {
  PrismaClient,
  RollStatus,
  RollStage,
  UserRole,
  TransactionType,
  JobWorkStatus,
  ProductionWorkOrderStatus,
  QCResultStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate past dates relative to reference date (August 2026)
function getPastDate(daysAgo: number, hour = 9, minute = 0): Date {
  const d = new Date('2026-08-17T12:00:00Z');
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log('🔄 Cleaning up previous job work, raw material, roll, and finished product records...');

  // 1. Clean up operational data in safe relational order
  await prisma.jobWorkStatusHistory.deleteMany({});
  await prisma.jobWorkReturnItem.deleteMany({});
  await prisma.jobWorkIssueItem.deleteMany({});
  await prisma.jobWorkOrder.deleteMany({});
  await prisma.jobWorkChallan.deleteMany({});

  await prisma.packingBundleItem.deleteMany({});
  await prisma.packingBundle.deleteMany({});
  await prisma.qCInspection.deleteMany({});
  await prisma.rollStatusHistory.deleteMany({});
  await prisma.cottonRoll.deleteMany({});

  await prisma.bOMItem.deleteMany({});
  await prisma.billOfMaterial.deleteMany({});
  await prisma.productMaster.deleteMany({});

  await prisma.materialIssue.deleteMany({});
  await prisma.workOrder.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventoryBatch.deleteMany({});
  await prisma.rawMaterial.deleteMany({});

  await prisma.productionBatch.deleteMany({});
  await prisma.jobWorkCompany.deleteMany({});
  await prisma.storageLocation.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.unitOfMeasure.deleteMany({});

  console.log('✅ Previous job work & material records cleared.');

  // 2. Ensure Admin User Exists
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@manufacturing.com' },
    update: {},
    create: {
      email: 'admin@manufacturing.com',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fKbX26D.g7Fq2ZkXoV9N9/0YfM0eM.vN4mB6a/C', // bcrypt hash for Admin@12345
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✔ Admin user ready:', adminUser.email);

  // 3. Seed Units of Measure
  const unitsData = [
    { name: 'Kilogram', abbreviation: 'Kg' },
    { name: 'Roll', abbreviation: 'Roll' },
    { name: 'Meter', abbreviation: 'Meter' },
    { name: 'Piece', abbreviation: 'Pcs' },
    { name: 'Pack', abbreviation: 'Pack' },
    { name: 'Liter', abbreviation: 'Liter' },
    { name: 'Carton Box', abbreviation: 'Box' },
    { name: 'Kit / Set', abbreviation: 'Set' },
  ];

  const units: Record<string, string> = {};
  for (const u of unitsData) {
    const created = await prisma.unitOfMeasure.create({ data: u });
    units[u.abbreviation] = created.id;
  }
  console.log('✔ Units of Measure seeded.');

  // 4. Seed Product & Material Master Categories
  const categoriesData = [
    { name: 'Dressing Care / Surgical Products', description: 'Gauze bandages, X-ray detectable swabs, cotton rolls & balls' },
    { name: 'Patient Safety & Hygienic Care', description: 'Surgeon gowns, disposable bed spreads, Knee-O drapes, drape packs & surgery kits' },
    { name: "Women's Care", description: 'Maternity sanitary pads, delivery mats, period panties, underpads, bamboo & anion pads' },
    { name: 'Adult Care', description: 'Fresh Feel adult diapers & Dr.C premium pullups (M, L, XL)' },
    { name: 'Baby Care', description: 'Babio wet towels, natural dry mats & BeBe baby diapers (NB to XL)' },
    { name: 'Mosquito Protection', description: 'Z Guard natural repellent spray (Lemongrass, Tulasi, Neem)' },
    { name: 'Raw Materials - Textile & Cotton', description: 'Raw combed cotton, grey gauze woven fabric, bleached gauze & spandex yarn' },
    { name: 'Raw Materials - Non-Wovens & Films', description: 'SMS medical non-woven, Spunbond PP, PE breathable film, fluff pulp & SAP' },
    { name: 'Raw Materials - Liquids & Botanicals', description: 'Essential oils (Lemongrass, Tulasi, Neem) and Aloe Vera formulation base' },
    { name: 'Packaging & Components', description: 'Mist spray bottles, sterilization pouches, adhesive fenestration tape & cartons' },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const created = await prisma.category.create({ data: c });
    categories[c.name] = created.id;
  }
  console.log('✔ Master Categories seeded.');

  // 5. Seed Storage Locations
  const locationsData = [
    { code: 'LOC-RM-COTTON', name: 'Raw Cotton & Yarn Store', warehouseZone: 'Zone A', description: 'Combed cotton bales and grey fabric rolls bin' },
    { code: 'LOC-RM-NONWOVEN', name: 'Non-Woven & Film Warehouse', warehouseZone: 'Zone B', description: 'SMS fabrics, PP rolls, fluff pulp & SAP polymer silos' },
    { code: 'LOC-RM-BOTANICAL', name: 'Essential Oils & Liquid Vault', warehouseZone: 'Zone C', description: 'Lemongrass, Tulasi, Neem extract oils & formulation base' },
    { code: 'LOC-PKG-DEPOT', name: 'Packaging Depot & Bottles', warehouseZone: 'Zone D', description: 'Spray bottles, mist pumps, pouches & master cartons' },
    { code: 'LOC-FG-MAIN', name: 'Finished Goods Central Warehouse', warehouseZone: 'Zone E', description: 'Sterilized medical supplies and packaged hygiene care items' },
  ];

  const storageLocations: Record<string, string> = {};
  for (const loc of locationsData) {
    const created = await prisma.storageLocation.create({ data: loc });
    storageLocations[loc.code] = created.id;
  }
  console.log('✔ Storage Locations seeded.');

  // 6. Seed Suppliers
  const suppliersData = [
    {
      code: 'SUP-COTTON-01',
      name: 'Coimbatore Cotton Mills Ltd',
      contactPerson: 'S. K. Raman',
      phone: '9843012345',
      email: 'sales@coimbatorecotton.com',
      gstin: '33AAACC1234A1Z1',
      address: 'Industrial Belt, Coimbatore, Tamil Nadu',
    },
    {
      code: 'SUP-NONWOVEN-02',
      name: 'Supreme Medical Nonwovens Pvt Ltd',
      contactPerson: 'R. Rajesh',
      phone: '9842188442',
      email: 'orders@supremenonwovens.com',
      gstin: '33BBBDD4321B1Z4',
      address: 'SIPCOT Industrial Park, Perundurai, Tamil Nadu',
    },
    {
      code: 'SUP-POLYMERS-03',
      name: 'Reliance Hygiene Polymers & Films',
      contactPerson: 'Amitabh Sen',
      phone: '9988776655',
      email: 'hygiene.supplies@reliancepolymers.com',
      gstin: '27AABCR1234C1Z9',
      address: 'Petrochemical Complex, Hazira, Gujarat',
    },
    {
      code: 'SUP-HERBAL-04',
      name: 'Nilgiri Botanical & Aroma Extracts Ltd',
      contactPerson: 'V. Sundaram',
      phone: '9443190876',
      email: 'botanicals@nilgiriaroma.in',
      gstin: '33CCCEE9876D1Z3',
      address: 'Tea Estate Road, Ooty, Nilgiris, Tamil Nadu',
    },
    {
      code: 'SUP-PACK-05',
      name: 'Global Medical Packaging & Containers Ltd',
      contactPerson: 'P. Murugesan',
      phone: '9841239900',
      email: 'contact@globalmedpack.in',
      gstin: '33FFFGG7654E1Z8',
      address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    },
  ];

  const suppliers: Record<string, string> = {};
  for (const s of suppliersData) {
    const created = await prisma.supplier.create({ data: s });
    suppliers[s.code] = created.id;
  }
  console.log('✔ Suppliers seeded.');

  // 7. Seed Job Work Subcontractor Companies
  const jwCompaniesData = [
    {
      companyName: 'Sri Lakshmi Bleaching & Scouring Works',
      contactPerson: 'K. Rajendran',
      phone: '9842100912',
      email: 'contact@lakshmibleaching.com',
      gstin: '33AAAAA0000A1Z5',
      address: '12/4 Industrial Estate, Erode, Tamil Nadu',
      creditDays: 30,
    },
    {
      companyName: 'Apex Medical Sterilization & Gamma Processing',
      contactPerson: 'Dr. N. Swaminathan',
      phone: '9442551122',
      email: 'sterilization@apexgamma.com',
      gstin: '33GGGGG8888G1Z1',
      address: 'Plot 45, SIPCOT Phase II, Hosur, Tamil Nadu',
      creditDays: 30,
    },
    {
      companyName: 'Tirupur Elastic & Webbing Mills',
      contactPerson: 'M. Shanmugam',
      phone: '9443209123',
      email: 'info@tirupurelastic.in',
      gstin: '33BBBBB1111B1Z2',
      address: '45 Weavers Colony, Tirupur, Tamil Nadu',
      creditDays: 45,
    },
    {
      companyName: 'Deccan Non-Woven Converting & Lamination Works',
      contactPerson: 'S. Balamurugan',
      phone: '9789012345',
      email: 'converting@deccannonwoven.com',
      gstin: '33CCCCC2222C1Z6',
      address: 'Sulur Industrial Area, Coimbatore, Tamil Nadu',
      creditDays: 30,
    },
  ];

  const jwCompanies: Record<string, string> = {};
  for (const jwc of jwCompaniesData) {
    const created = await prisma.jobWorkCompany.create({ data: jwc });
    jwCompanies[jwc.companyName] = created.id;
  }
  console.log('✔ Job Work Subcontractors seeded.');

  // 8. Seed Raw Materials (Essential Components & Ingredients)
  const rawMaterialsData = [
    // Cotton & Textile RMs
    {
      sku: 'RM-COTTON-RAW',
      name: 'Raw Cotton 100% Combed Medical Grade',
      description: 'High-grade long-staple combed cotton bales for absorbent balls & surgical rolls',
      hsnCode: '520100',
      min: 1500,
      max: 15000,
      stock: 6800,
      unitCost: 135.0,
      cat: 'Raw Materials - Textile & Cotton',
      uom: 'Kg',
      sup: 'SUP-COTTON-01',
      loc: 'LOC-RM-COTTON',
    },
    {
      sku: 'RM-GAUZE-GREY',
      name: 'Grey Woven Gauze Fabric Roll 48 Inch',
      description: 'Unbleached grey gauze fabric rolls for scouring, bleaching & bandage conversion',
      hsnCode: '520811',
      min: 1000,
      max: 10000,
      stock: 4500,
      unitCost: 145.0,
      cat: 'Raw Materials - Textile & Cotton',
      uom: 'Kg',
      sup: 'SUP-COTTON-01',
      loc: 'LOC-RM-COTTON',
    },
    {
      sku: 'RM-GAUZE-BLEACH',
      name: 'Bleached Gauze Fabric Roll 48 Inch (Medical Grade)',
      description: 'Pharmacopoeia-grade scoured and bleached medical gauze roll (Ready for slitting)',
      hsnCode: '300590',
      min: 800,
      max: 8000,
      stock: 3200,
      unitCost: 190.0,
      cat: 'Raw Materials - Textile & Cotton',
      uom: 'Kg',
      sup: 'SUP-COTTON-01',
      loc: 'LOC-RM-COTTON',
    },
    {
      sku: 'RM-SPANDEX-YARN',
      name: 'Polyurethane Spandex Elastic Yarn',
      description: 'High elasticity Spandex yarn for elastic securing gauze bandages and pullup waist panels',
      hsnCode: '540244',
      min: 200,
      max: 2000,
      stock: 850,
      unitCost: 320.0,
      cat: 'Raw Materials - Textile & Cotton',
      uom: 'Kg',
      sup: 'SUP-COTTON-01',
      loc: 'LOC-RM-COTTON',
    },
    {
      sku: 'RM-XRAY-FILAMENT',
      name: 'Barium Sulphate X-Ray Detectable Filament',
      description: 'Radio-opaque barium sulphate monofilament thread for surgical gauze swabs',
      hsnCode: '283321',
      min: 100,
      max: 1000,
      stock: 380,
      unitCost: 480.0,
      cat: 'Raw Materials - Textile & Cotton',
      uom: 'Kg',
      sup: 'SUP-NONWOVEN-02',
      loc: 'LOC-RM-COTTON',
    },

    // Non-Woven & Polymer RMs
    {
      sku: 'RM-SMS-FABRIC-45',
      name: 'SMS Non-Woven Medical Blue Fabric 45 GSM',
      description: 'Spunbond-Meltblown-Spunbond fluid-resistant medical grade fabric for Surgeon Gowns & Drape Packs',
      hsnCode: '560312',
      min: 1200,
      max: 12000,
      stock: 5400,
      unitCost: 210.0,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-NONWOVEN-02',
      loc: 'LOC-RM-NONWOVEN',
    },
    {
      sku: 'RM-SPUNBOND-PP-30',
      name: 'Spunbond Polypropylene (PP) Fabric 30 GSM',
      description: 'Hydrophilic breathable PP non-woven for bed spreads, pillow covers & hygiene topsheets',
      hsnCode: '560312',
      min: 1000,
      max: 10000,
      stock: 4900,
      unitCost: 175.0,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-NONWOVEN-02',
      loc: 'LOC-RM-NONWOVEN',
    },
    {
      sku: 'RM-PE-FILM-BREATH',
      name: 'Laminated PE Breathable Backsheet Film Roll',
      description: 'Impermeable microporous backsheet film for Poly Aprons, Underpads, Adult Diapers & Delivery Mats',
      hsnCode: '392010',
      min: 800,
      max: 8000,
      stock: 3800,
      unitCost: 195.0,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-POLYMERS-03',
      loc: 'LOC-RM-NONWOVEN',
    },
    {
      sku: 'RM-FLUFF-PULP',
      name: 'Super Bleached Untreated Fluff Pulp Rolls',
      description: 'Elemental chlorine-free softwood fluff pulp roll for high absorbency pads & diapers',
      hsnCode: '470321',
      min: 2000,
      max: 20000,
      stock: 8900,
      unitCost: 95.0,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-POLYMERS-03',
      loc: 'LOC-RM-NONWOVEN',
    },
    {
      sku: 'RM-SAP-POLYMER',
      name: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate',
      description: 'Ultra-absorbent crosslinked polymer granules with 50x retention capacity for hygiene pads & diapers',
      hsnCode: '390690',
      min: 1000,
      max: 10000,
      stock: 4300,
      unitCost: 240.0,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-POLYMERS-03',
      loc: 'LOC-RM-NONWOVEN',
    },
    {
      sku: 'RM-BAMBOO-NONWOVEN',
      name: '100% Bamboo Natural Fibre Non-Woven Sheet',
      description: 'Biodegradable, antibacterial organic bamboo fibre non-woven roll for Bamboo Sanitary Pads',
      hsnCode: '560392',
      min: 500,
      max: 5000,
      stock: 2100,
      unitCost: 260.0,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-NONWOVEN-02',
      loc: 'LOC-RM-NONWOVEN',
    },
    {
      sku: 'RM-ANION-STRIP',
      name: 'Far-Infrared Anion Negative Ion Chip Strip',
      description: 'Negative ion infused tourmaline chip strip for Anion Sanitary Pads with antibacterial protection',
      hsnCode: '842139',
      min: 3000,
      max: 30000,
      stock: 16500,
      unitCost: 8.5,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Meter',
      sup: 'SUP-NONWOVEN-02',
      loc: 'LOC-RM-NONWOVEN',
    },
    {
      sku: 'RM-SPUNLACE-WIPE',
      name: 'Cross-Lapped Spunlace Viscose Wipe Fabric Roll 50 GSM',
      description: 'Extra soft textured viscose/polyester blend fabric for Babio Baby Wet Towels',
      hsnCode: '560392',
      min: 600,
      max: 6000,
      stock: 2600,
      unitCost: 230.0,
      cat: 'Raw Materials - Non-Wovens & Films',
      uom: 'Kg',
      sup: 'SUP-NONWOVEN-02',
      loc: 'LOC-RM-NONWOVEN',
    },

    // Botanical & Liquid Formulations
    {
      sku: 'RM-OIL-LEMONGRASS',
      name: 'Pure Natural Lemon Grass Essential Oil',
      description: 'Steam-distilled 100% pure Cymbopogon Citratus oil for Z Guard mosquito repellent',
      hsnCode: '330129',
      min: 50,
      max: 500,
      stock: 190,
      unitCost: 1450.0,
      cat: 'Raw Materials - Liquids & Botanicals',
      uom: 'Liter',
      sup: 'SUP-HERBAL-04',
      loc: 'LOC-RM-BOTANICAL',
    },
    {
      sku: 'RM-OIL-TULASI',
      name: 'Pure Tulasi (Holy Basil) Extract Oil',
      description: 'Ocimum Sanctum therapeutic active extract for antibacterial soothing repellent formulation',
      hsnCode: '330129',
      min: 30,
      max: 300,
      stock: 110,
      unitCost: 2200.0,
      cat: 'Raw Materials - Liquids & Botanicals',
      uom: 'Liter',
      sup: 'SUP-HERBAL-04',
      loc: 'LOC-RM-BOTANICAL',
    },
    {
      sku: 'RM-OIL-NEEM',
      name: 'Pure Cold-Pressed Neem Seed Oil',
      description: 'Azadirachta Indica organic cold-pressed oil with high azadirachtin repellent efficacy',
      hsnCode: '151590',
      min: 80,
      max: 800,
      stock: 350,
      unitCost: 450.0,
      cat: 'Raw Materials - Liquids & Botanicals',
      uom: 'Liter',
      sup: 'SUP-HERBAL-04',
      loc: 'LOC-RM-BOTANICAL',
    },
    {
      sku: 'RM-ALOE-BASE',
      name: 'Purified Aloe Vera & Chamomile Liquid Base',
      description: 'Hypoallergenic soothing formulation lotion base for Babio Baby Wet Towels',
      hsnCode: '330499',
      min: 150,
      max: 1500,
      stock: 720,
      unitCost: 160.0,
      cat: 'Raw Materials - Liquids & Botanicals',
      uom: 'Liter',
      sup: 'SUP-HERBAL-04',
      loc: 'LOC-RM-BOTANICAL',
    },

    // Packaging & Auxiliary Components
    {
      sku: 'RM-BOTTLE-SPRAY-100',
      name: 'HDPE 100ml Spray Bottle with Fine Mist Pump',
      description: 'Opaque protective HDPE dispenser bottle with ergonomic mist nozzle for Z Guard Spray',
      hsnCode: '392330',
      min: 3000,
      max: 30000,
      stock: 13500,
      unitCost: 12.0,
      cat: 'Packaging & Components',
      uom: 'Pcs',
      sup: 'SUP-PACK-05',
      loc: 'LOC-PKG-DEPOT',
    },
    {
      sku: 'RM-ADHESIVE-TAPE',
      name: 'Medical Grade Fenestration Adhesive Tape Roll',
      description: 'Skin-friendly hypoallergenic transfer tape for surgical drapes & center hole sheets',
      hsnCode: '300510',
      min: 1500,
      max: 15000,
      stock: 6500,
      unitCost: 15.0,
      cat: 'Packaging & Components',
      uom: 'Meter',
      sup: 'SUP-PACK-05',
      loc: 'LOC-PKG-DEPOT',
    },
    {
      sku: 'RM-POUCH-STERILE',
      name: 'Medical Grade Tyvek / Poly Sterilization Pouches',
      description: 'Steam/ETO gas indicator peelable sterile pouches for kits and surgical swabs',
      hsnCode: '392329',
      min: 5000,
      max: 50000,
      stock: 28000,
      unitCost: 4.5,
      cat: 'Packaging & Components',
      uom: 'Pcs',
      sup: 'SUP-PACK-05',
      loc: 'LOC-PKG-DEPOT',
    },
  ];

  const createdRawMaterials: Record<string, any> = {};
  for (const rm of rawMaterialsData) {
    const created = await prisma.rawMaterial.create({
      data: {
        sku: rm.sku,
        name: rm.name,
        description: rm.description,
        hsnCode: rm.hsnCode,
        minimumStockLevel: rm.min,
        maximumStockLevel: rm.max,
        reorderQuantity: rm.min * 1.5,
        currentStockBalance: rm.stock,
        unitCost: rm.unitCost,
        lastPurchaseRate: rm.unitCost,
        avgCost: rm.unitCost,
        gstRate: 12.0,
        categoryId: categories[rm.cat],
        unitId: units[rm.uom],
        supplierId: suppliers[rm.sup],
        storageLocationId: storageLocations[rm.loc],
      },
    });
    createdRawMaterials[rm.sku] = created;

    // Log Opening Inventory Balance Transaction
    await prisma.inventoryTransaction.create({
      data: {
        rawMaterialId: created.id,
        transactionType: TransactionType.PURCHASE_RECEIPT,
        quantity: rm.stock,
        previousStock: 0,
        newStock: rm.stock,
        unitPrice: rm.unitCost,
        referenceNumber: `INV-OPENING-${rm.sku.slice(-6)}`,
        notes: `Opening inventory batch intake - Verified physical warehouse audit`,
        createdByUserId: adminUser.id,
      },
    });
  }
  console.log('✔ All Raw Materials & Opening Ledger seeded.');

  // 9. Seed Authentic Finished Products Catalogue (Master Products + Inventory Representation + BOM)
  const finishedProductsCatalog = [
    // 🏥 1. Dressing Care / Surgical Products
    {
      code: 'FP-GAUZE-BANDAGE',
      name: 'Elastic Securing Gauze Bandage',
      cat: 'Dressing Care / Surgical Products',
      hsn: '300590',
      uom: 'Roll',
      price: 45.0,
      stock: 3500,
      min: 500,
      desc: 'High-elasticity securing gauze bandage for orthopedic & wound dressing support',
      bom: [
        { mat: 'Bleached Gauze Fabric Roll 48 Inch (Medical Grade)', qty: 0.08, uom: 'Kg' },
        { mat: 'Polyurethane Spandex Elastic Yarn', qty: 0.02, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-XRAY-SWABS',
      name: 'Absorbent X-Ray Detectable Gauze Swabs',
      cat: 'Dressing Care / Surgical Products',
      hsn: '300590',
      uom: 'Pack',
      price: 120.0,
      stock: 2200,
      min: 300,
      desc: '100% cotton sterile gauze swabs woven with radio-opaque barium sulphate X-ray filament',
      bom: [
        { mat: 'Bleached Gauze Fabric Roll 48 Inch (Medical Grade)', qty: 0.15, uom: 'Kg' },
        { mat: 'Barium Sulphate X-Ray Detectable Filament', qty: 0.01, uom: 'Kg' },
        { mat: 'Medical Grade Tyvek / Poly Sterilization Pouches', qty: 1, uom: 'Pcs' },
      ],
    },
    {
      code: 'FP-COTTON-ROLLS',
      name: 'Cotton Rolls',
      cat: 'Dressing Care / Surgical Products',
      hsn: '300590',
      uom: 'Roll',
      price: 180.0,
      stock: 1800,
      min: 250,
      desc: '500g high absorbency surgical cotton rolls conforming to pharmacopoeia standards',
      bom: [
        { mat: 'Raw Cotton 100% Combed Medical Grade', qty: 0.52, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-COTTON-BALLS',
      name: 'Cotton Balls',
      cat: 'Dressing Care / Surgical Products',
      hsn: '300590',
      uom: 'Pack',
      price: 65.0,
      stock: 4500,
      min: 600,
      desc: 'Ultra soft pre-formed absorbent cotton balls for antiseptic application & cleansing',
      bom: [
        { mat: 'Raw Cotton 100% Combed Medical Grade', qty: 0.18, uom: 'Kg' },
        { mat: 'Medical Grade Tyvek / Poly Sterilization Pouches', qty: 1, uom: 'Pcs' },
      ],
    },

    // 🧑‍⚕️ 2. Patient Safety & Hygienic Care
    {
      code: 'FP-SURGEON-GOWN-KIT',
      name: 'Surgeon’s Gown Kit',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '621010',
      uom: 'Set',
      price: 380.0,
      stock: 1400,
      min: 200,
      desc: 'Complete sterile surgical kit with SMS 45 GSM reinforced gown, hand towels & wrap',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 0.35, uom: 'Kg' },
        { mat: 'Medical Grade Tyvek / Poly Sterilization Pouches', qty: 1, uom: 'Pcs' },
      ],
    },
    {
      code: 'FP-DISP-BEDSPREAD',
      name: 'Disposable Bed Spread / Pillow Cover',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '630222',
      uom: 'Set',
      price: 95.0,
      stock: 3200,
      min: 400,
      desc: 'Hygienic spunbond PP fluid-resistant bed spread and matching pillow cover for hospitals',
      bom: [
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.22, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-KNEE-O-DRAPE',
      name: 'Knee-O Drape',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '630790',
      uom: 'Pcs',
      price: 220.0,
      stock: 950,
      min: 150,
      desc: 'Specialized arthroscopy surgical drape with circular elastic fenestration and fluid collection pouch',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 0.28, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.12, uom: 'Kg' },
        { mat: 'Medical Grade Fenestration Adhesive Tape Roll', qty: 0.8, uom: 'Meter' },
      ],
    },
    {
      code: 'FP-CENTER-HOLE-SHEET',
      name: 'Center Hole Sheet',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '630790',
      uom: 'Pcs',
      price: 140.0,
      stock: 1600,
      min: 200,
      desc: 'Impermeable surgical aperture sheet with medical adhesive border for localized procedures',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 0.18, uom: 'Kg' },
        { mat: 'Medical Grade Fenestration Adhesive Tape Roll', qty: 0.6, uom: 'Meter' },
      ],
    },
    {
      code: 'FP-POLY-APRON',
      name: 'Poly Apron',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '392620',
      uom: 'Pcs',
      price: 22.0,
      stock: 6000,
      min: 1000,
      desc: 'Impervious lightweight polyethylene apron with halter neck and tie waist for medical protection',
      bom: [
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.05, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-GEN-SURGERY-KIT',
      name: 'General Surgery Kit',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '901890',
      uom: 'Set',
      price: 850.0,
      stock: 750,
      min: 100,
      desc: 'Comprehensive surgical drape kit with trolley covers, Mayo stand cover, side drapes & OP towels',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 0.75, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.25, uom: 'Kg' },
        { mat: 'Medical Grade Fenestration Adhesive Tape Roll', qty: 2.0, uom: 'Meter' },
      ],
    },
    {
      code: 'FP-ORTHO-DRAPE-PACK',
      name: 'Ortho Drape Pack',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '901890',
      uom: 'Set',
      price: 1150.0,
      stock: 520,
      min: 80,
      desc: 'Heavy-duty orthopedic surgical pack with fluid collection pouch, U-drapes and extremity sheets',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 1.10, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.40, uom: 'Kg' },
        { mat: 'Medical Grade Fenestration Adhesive Tape Roll', qty: 3.5, uom: 'Meter' },
      ],
    },
    {
      code: 'FP-KNEE-DRAPE-PACK',
      name: 'Knee-O Drape Pack',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '901890',
      uom: 'Set',
      price: 980.0,
      stock: 610,
      min: 90,
      desc: 'Dedicated knee arthroplasty & reconstruction drape pack with reinforced fluid suction connectors',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 0.95, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.35, uom: 'Kg' },
        { mat: 'Medical Grade Fenestration Adhesive Tape Roll', qty: 2.8, uom: 'Meter' },
      ],
    },
    {
      code: 'FP-GEN-DRAPE-PACK',
      name: 'General Drape Pack',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '901890',
      uom: 'Set',
      price: 780.0,
      stock: 830,
      min: 120,
      desc: 'Standard universal procedural drape pack with adhesive towels, top & bottom drapes',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 0.65, uom: 'Kg' },
        { mat: 'Medical Grade Fenestration Adhesive Tape Roll', qty: 2.0, uom: 'Meter' },
      ],
    },
    {
      code: 'FP-DELIV-DRAPE-PACK',
      name: 'Delivery Drape Pack',
      cat: 'Patient Safety & Hygienic Care',
      hsn: '901890',
      uom: 'Set',
      price: 890.0,
      stock: 690,
      min: 110,
      desc: 'Obstetric delivery kit featuring under-buttocks drape with calibrated fluid collection bag and leggings',
      bom: [
        { mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM', qty: 0.70, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.30, uom: 'Kg' },
      ],
    },

    // 👩 3. Women’s Care
    {
      code: 'FP-MOMS-MATERNITY-PAD',
      name: 'Mom’s Maternity Sanitary Pad & Fixator / Disposable Maternity Pad',
      cat: "Women's Care",
      hsn: '961900',
      uom: 'Pack',
      price: 195.0,
      stock: 2800,
      min: 400,
      desc: 'Postpartum extra-length high absorbency maternity pad with elastic fixator waistband netting',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.12, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.03, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.04, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.03, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-DELIV-MAT-BAG',
      name: 'Normal Delivery Mat with Collection Bag',
      cat: "Women's Care",
      hsn: '961900',
      uom: 'Pcs',
      price: 165.0,
      stock: 1900,
      min: 250,
      desc: 'Sterile delivery under-pad with graduated fluid collection cone pouch for clinical volume monitoring',
      bom: [
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.10, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.12, uom: 'Kg' },
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.08, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-REALCARE-PANTIES',
      name: 'RealCare Period Panties',
      cat: "Women's Care",
      hsn: '961900',
      uom: 'Pack',
      price: 240.0,
      stock: 2100,
      min: 300,
      desc: '360-degree leak-guard disposable menstrual panty with seamless 4-way stretch elastic waistband',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.08, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.02, uom: 'Kg' },
        { mat: 'Polyurethane Spandex Elastic Yarn', qty: 0.03, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.05, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-REALCARE-UNDERPDS',
      name: 'RealCare Underpads',
      cat: "Women's Care",
      hsn: '961900',
      uom: 'Pack',
      price: 310.0,
      stock: 1750,
      min: 250,
      desc: '60x90 cm premium bed & chair underpads with diamond embossed SAP lock channels',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.25, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.05, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.08, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.06, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-DRLIKE-UNDERPDS',
      name: 'Dr. Like Multipurpose Underpads',
      cat: "Women's Care",
      hsn: '961900',
      uom: 'Pack',
      price: 280.0,
      stock: 2400,
      min: 350,
      desc: 'Multi-utility waterproof absorbent underpads for maternity, clinical beds & baby changing stations',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.20, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.04, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.07, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-BAMBOO-PADS',
      name: 'Bamboo Pads',
      cat: "Women's Care",
      hsn: '961900',
      uom: 'Pack',
      price: 175.0,
      stock: 3100,
      min: 450,
      desc: '100% natural organic bamboo fibre ultra-thin antibacterial sanitary pads with wings',
      bom: [
        { mat: '100% Bamboo Natural Fibre Non-Woven Sheet', qty: 0.06, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.02, uom: 'Kg' },
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.04, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.02, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-ANION-PADS',
      name: 'Anion Pads',
      cat: "Women's Care",
      hsn: '961900',
      uom: 'Pack',
      price: 190.0,
      stock: 2900,
      min: 400,
      desc: 'Far-infrared anion negative ion chip sanitary pad for active odor control and comfort',
      bom: [
        { mat: 'Far-Infrared Anion Negative Ion Chip Strip', qty: 0.25, uom: 'Meter' },
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.05, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.02, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.03, uom: 'Kg' },
      ],
    },

    // 👴 4. Adult Care
    {
      code: 'FP-LATHIKKA-ADULT-DIAPERS',
      name: 'Lathikka Fresh Feel Adult Diapers',
      cat: 'Adult Care',
      hsn: '961900',
      uom: 'Pack',
      price: 480.0,
      stock: 1600,
      min: 250,
      desc: 'All-night heavy absorbency adult diapers with refastenable frontal tape and wetness indicator',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.35, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.08, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.09, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.08, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-DRC-PULLUPS-M',
      name: 'Dr.C Adult Pullups – Premium (Medium)',
      cat: 'Adult Care',
      hsn: '961900',
      uom: 'Pack',
      price: 540.0,
      stock: 1200,
      min: 200,
      desc: 'Dr.C Medium (28-44 in) pullup pant with soft waist panel, super absorbency, antibacterial protection & leak guard',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.30, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.07, uom: 'Kg' },
        { mat: 'Polyurethane Spandex Elastic Yarn', qty: 0.04, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.08, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-DRC-PULLUPS-L',
      name: 'Dr.C Adult Pullups – Premium (Large)',
      cat: 'Adult Care',
      hsn: '961900',
      uom: 'Pack',
      price: 560.0,
      stock: 1450,
      min: 220,
      desc: 'Dr.C Large (38-54 in) pullup pant with soft waist panel, super absorbency, antibacterial protection & leak guard',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.34, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.08, uom: 'Kg' },
        { mat: 'Polyurethane Spandex Elastic Yarn', qty: 0.04, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.09, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-DRC-PULLUPS-XL',
      name: 'Dr.C Adult Pullups – Premium (XL)',
      cat: 'Adult Care',
      hsn: '961900',
      uom: 'Pack',
      price: 590.0,
      stock: 1100,
      min: 180,
      desc: 'Dr.C Extra Large (48-68 in) pullup pant with soft waist panel, super absorbency, antibacterial protection & leak guard',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.38, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.09, uom: 'Kg' },
        { mat: 'Polyurethane Spandex Elastic Yarn', qty: 0.05, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.10, uom: 'Kg' },
      ],
    },

    // 👶 5. Baby Care
    {
      code: 'FP-BABIO-WET-TOWELS',
      name: 'Babio Baby Wet Towels',
      cat: 'Baby Care',
      hsn: '340119',
      uom: 'Pack',
      price: 115.0,
      stock: 3800,
      min: 500,
      desc: '99% pure water wipes with organic Aloe Vera & Chamomile extract, alcohol-free & dermatologically tested',
      bom: [
        { mat: 'Cross-Lapped Spunlace Viscose Wipe Fabric Roll 50 GSM', qty: 0.14, uom: 'Kg' },
        { mat: 'Purified Aloe Vera & Chamomile Liquid Base', qty: 0.12, uom: 'Liter' },
      ],
    },
    {
      code: 'FP-LATHIKKA-DRY-MAT',
      name: 'Lathikka Naturals Dry Mat',
      cat: 'Baby Care',
      hsn: '630492',
      uom: 'Pcs',
      price: 295.0,
      stock: 1950,
      min: 250,
      desc: 'Breathable waterproof fleece quick-dry bed protector sheet for babies, reusable & skin-friendly',
      bom: [
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.12, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.10, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-BEBE-DIAPERS-NB',
      name: 'BeBe Baby Diapers (Premature / New Born)',
      cat: 'Baby Care',
      hsn: '961900',
      uom: 'Pack',
      price: 320.0,
      stock: 2200,
      min: 300,
      desc: 'BeBe Baby Diapers Premature / New Born with umbilical cord cut-out & ultra-soft bubble topsheet',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.15, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.04, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.05, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.04, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-BEBE-DIAPERS-S',
      name: 'BeBe Baby Diapers (Small)',
      cat: 'Baby Care',
      hsn: '961900',
      uom: 'Pack',
      price: 340.0,
      stock: 2500,
      min: 350,
      desc: 'BeBe Baby Diapers Small (3-6 Kg) with 12-hour leak lock core & wetness indicator',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.18, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.05, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.06, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.05, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-BEBE-DIAPERS-M',
      name: 'BeBe Baby Diapers (Medium)',
      cat: 'Baby Care',
      hsn: '961900',
      uom: 'Pack',
      price: 360.0,
      stock: 2800,
      min: 400,
      desc: 'BeBe Baby Diapers Medium (6-11 Kg) with 3D leak guard & flexible stretch waistband',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.22, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.06, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.07, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.06, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-BEBE-DIAPERS-L',
      name: 'BeBe Baby Diapers (Large)',
      cat: 'Baby Care',
      hsn: '961900',
      uom: 'Pack',
      price: 380.0,
      stock: 2400,
      min: 350,
      desc: 'BeBe Baby Diapers Large (9-14 Kg) with active air channels & feather-soft leg cuffs',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.25, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.07, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.08, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.07, uom: 'Kg' },
      ],
    },
    {
      code: 'FP-BEBE-DIAPERS-XL',
      name: 'BeBe Baby Diapers (XL)',
      cat: 'Baby Care',
      hsn: '961900',
      uom: 'Pack',
      price: 400.0,
      stock: 1900,
      min: 250,
      desc: 'BeBe Baby Diapers Extra Large (12-17 Kg) with max absorbency night lock channels',
      bom: [
        { mat: 'Super Bleached Untreated Fluff Pulp Rolls', qty: 0.28, uom: 'Kg' },
        { mat: 'Super Absorbent Polymer (SAP) Sodium Polyacrylate', qty: 0.08, uom: 'Kg' },
        { mat: 'Spunbond Polypropylene (PP) Fabric 30 GSM', qty: 0.09, uom: 'Kg' },
        { mat: 'Laminated PE Breathable Backsheet Film Roll', qty: 0.08, uom: 'Kg' },
      ],
    },

    // 🦟 6. Mosquito Protection
    {
      code: 'FP-ZGUARD-SPRAY-100',
      name: 'Z Guard Natural Mosquito Repellent Spray',
      cat: 'Mosquito Protection',
      hsn: '380891',
      uom: 'Pcs',
      price: 145.0,
      stock: 4200,
      min: 600,
      desc: '100% natural Ayurvedic DEET-free mosquito repellent spray with pure Lemon Grass, Tulasi Oil & Neem Oil',
      bom: [
        { mat: 'Pure Natural Lemon Grass Essential Oil', qty: 0.02, uom: 'Liter' },
        { mat: 'Pure Tulasi (Holy Basil) Extract Oil', qty: 0.01, uom: 'Liter' },
        { mat: 'Pure Cold-Pressed Neem Seed Oil', qty: 0.01, uom: 'Liter' },
        { mat: 'HDPE 100ml Spray Bottle with Fine Mist Pump', qty: 1, uom: 'Pcs' },
      ],
    },
  ];

  const createdFinishedProducts: Record<string, any> = {};

  for (const fp of finishedProductsCatalog) {
    // 1. Create in ProductMaster (Master Catalogue)
    const productMaster = await prisma.productMaster.create({
      data: {
        productCode: fp.code,
        name: fp.name,
        category: fp.cat,
        hsnCode: fp.hsn,
        unitOfMeasure: fp.uom,
        minStockLevel: fp.min,
      },
    });

    // 2. Create Bill of Material (BOM Recipe)
    const bom = await prisma.billOfMaterial.create({
      data: {
        bomNumber: `BOM-${fp.code}`,
        productId: productMaster.id,
        version: '1.0',
        description: `Standard Manufacturing Formula for ${fp.name}`,
        items: {
          create: fp.bom.map((b) => ({
            materialName: b.mat,
            quantity: b.qty,
            uom: b.uom,
            wastagePercent: 1.5,
          })),
        },
      },
    });

    // 3. Create entry in RawMaterial table (As Finished Goods inventory) for stock tracking
    const fgMaterial = await prisma.rawMaterial.create({
      data: {
        sku: fp.code,
        name: fp.name,
        description: fp.desc,
        hsnCode: fp.hsn,
        minimumStockLevel: fp.min,
        maximumStockLevel: fp.min * 10,
        reorderQuantity: fp.min * 2,
        currentStockBalance: fp.stock,
        unitCost: fp.price * 0.6, // Approximate manufacturing cost
        lastPurchaseRate: fp.price * 0.6,
        avgCost: fp.price * 0.6,
        gstRate: 12.0,
        categoryId: categories[fp.cat],
        unitId: units[fp.uom],
        storageLocationId: storageLocations['LOC-FG-MAIN'],
      },
    });

    createdFinishedProducts[fp.code] = {
      productMaster,
      bom,
      fgMaterial,
    };

    // Log Opening Finished Goods Transaction
    await prisma.inventoryTransaction.create({
      data: {
        rawMaterialId: fgMaterial.id,
        transactionType: TransactionType.ADJUSTMENT_ADD,
        quantity: fp.stock,
        previousStock: 0,
        newStock: fp.stock,
        unitPrice: fp.price * 0.6,
        referenceNumber: `INV-OPENING-FG-${fp.code.slice(-6)}`,
        notes: `Opening finished goods batch - ${fp.name} in Central Depot E`,
        createdByUserId: adminUser.id,
      },
    });
  }
  console.log('✔ All Finished Products, BOM Formulas & FG Stock seeded.');

  // 10. Seed Realistic Job Work Orders & Delivery Challans (14-Day Subcontracting Flow)
  const rmGrey = createdRawMaterials['RM-GAUZE-GREY'];
  const rmBleached = createdRawMaterials['RM-GAUZE-BLEACH'];
  const rmSpandex = createdRawMaterials['RM-SPANDEX-YARN'];
  const rmSMS = createdRawMaterials['RM-SMS-FABRIC-45'];
  const rmPEFilm = createdRawMaterials['RM-PE-FILM-BREATH'];
  const rmCotton = createdRawMaterials['RM-COTTON-RAW'];

  const fpBandage = createdFinishedProducts['FP-GAUZE-BANDAGE'].fgMaterial;
  const fpDelivMat = createdFinishedProducts['FP-DELIV-MAT-BAG'].fgMaterial;
  const fpGownKit = createdFinishedProducts['FP-SURGEON-GOWN-KIT'].fgMaterial;

  const jobWorkOrdersData = [
    {
      jobWorkNumber: 'JW-2026-0101',
      challanNumber: 'DC-2026-0801',
      companyId: jwCompanies['Sri Lakshmi Bleaching & Scouring Works'],
      rawMatId: rmGrey.id,
      finishedProdId: rmBleached.id,
      status: JobWorkStatus.COMPLETED,
      daysAgo: 14,
      issuedWeight: 1200.0,
      issuedQty: 24,
      returnedWeight: 1164.0,
      returnedQty: 24,
      wastageWeight: 36.0,
      remarks: 'Subcontract scouring, bleaching & pharmacopoeia absorbency treatment for grey gauze',
    },
    {
      jobWorkNumber: 'JW-2026-0102',
      challanNumber: 'DC-2026-0805',
      companyId: jwCompanies['Tirupur Elastic & Webbing Mills'],
      rawMatId: rmSpandex.id,
      finishedProdId: fpBandage.id,
      status: JobWorkStatus.COMPLETED,
      daysAgo: 9,
      issuedWeight: 600.0,
      issuedQty: 15,
      returnedWeight: 588.0,
      returnedQty: 14,
      wastageWeight: 12.0,
      remarks: 'Weaving of high elasticity securing bandage web rolls',
    },
    {
      jobWorkNumber: 'JW-2026-0103',
      challanNumber: 'DC-2026-0809',
      companyId: jwCompanies['Deccan Non-Woven Converting & Lamination Works'],
      rawMatId: rmSMS.id,
      finishedProdId: fpDelivMat.id,
      status: JobWorkStatus.PARTIAL_RETURN,
      daysAgo: 5,
      issuedWeight: 1500.0,
      issuedQty: 30,
      returnedWeight: 900.0,
      returnedQty: 18,
      wastageWeight: 18.0,
      remarks: 'Ultrasonic lamination of SMS non-woven & PE film with collection bag cone',
    },
    {
      jobWorkNumber: 'JW-2026-0104',
      challanNumber: 'DC-2026-0813',
      companyId: jwCompanies['Apex Medical Sterilization & Gamma Processing'],
      rawMatId: rmSMS.id,
      finishedProdId: fpGownKit.id,
      status: JobWorkStatus.MATERIALS_ISSUED,
      daysAgo: 2,
      issuedWeight: 850.0,
      issuedQty: 17,
      returnedWeight: 0.0,
      returnedQty: 0,
      wastageWeight: 0.0,
      remarks: 'ETO gas & Gamma radiation sterilization of packed Surgeon Gown Kits',
    },
    {
      jobWorkNumber: 'JW-2026-0105',
      challanNumber: null,
      companyId: jwCompanies['Sri Lakshmi Bleaching & Scouring Works'],
      rawMatId: rmCotton.id,
      finishedProdId: createdFinishedProducts['FP-COTTON-ROLLS'].fgMaterial.id,
      status: JobWorkStatus.CREATED,
      daysAgo: 0,
      issuedWeight: 1000.0,
      issuedQty: 20,
      returnedWeight: 0.0,
      returnedQty: 0,
      wastageWeight: 0.0,
      remarks: 'Bleaching raw combed cotton bales for 500g absorbent surgical cotton rolls',
    },
  ];

  for (const jw of jobWorkOrdersData) {
    const jwOrder = await prisma.jobWorkOrder.create({
      data: {
        jobWorkNumber: jw.jobWorkNumber,
        challanNumber: jw.challanNumber,
        expectedReturnDate: getPastDate(jw.daysAgo - 7),
        status: jw.status,
        totalIssuedWeight: jw.issuedWeight,
        totalIssuedQty: jw.issuedQty,
        totalReturnedWeight: jw.returnedWeight,
        totalReturnedQty: jw.returnedQty,
        totalWastageWeight: jw.wastageWeight,
        pendingWeight: Math.max(0, jw.issuedWeight - jw.returnedWeight - jw.wastageWeight),
        pendingQty: Math.max(0, jw.issuedQty - jw.returnedQty),
        jobWorkCompanyId: jw.companyId,
        rawMaterialId: jw.rawMatId,
        finishedProductId: jw.finishedProdId,
        remarks: jw.remarks,
        vehicleNumber: 'TN-38-CC-4521',
        driverName: 'K. Senthil Kumar',
        createdAt: getPastDate(jw.daysAgo),
        issueItems: {
          create: {
            rollNumber: `ROL-${jw.jobWorkNumber.slice(-4)}-ISSUE-01`,
            issuedWeight: jw.issuedWeight,
            issuedQty: jw.issuedQty,
            remarks: 'Subcontract material issue batch with security seal',
          },
        },
        returnItems: jw.returnedWeight > 0 ? {
          create: {
            returnedDate: getPastDate(jw.daysAgo - 4),
            rollNumber: `ROL-${jw.jobWorkNumber.slice(-4)}-RET-01`,
            returnedWeight: jw.returnedWeight,
            returnedQty: jw.returnedQty,
            wastageWeight: jw.wastageWeight,
            finishedProductId: jw.finishedProdId,
            remarks: 'Processed material received back with vendor weight certificate & QC slip',
            receivedByUserId: adminUser.id,
          },
        } : undefined,
        statusHistory: {
          create: [
            {
              fromStatus: null,
              toStatus: JobWorkStatus.CREATED,
              notes: 'Job work order registered and approved by Job Work Manager',
              createdAt: getPastDate(jw.daysAgo),
            },
            ...(jw.status !== JobWorkStatus.CREATED ? [{
              fromStatus: JobWorkStatus.CREATED,
              toStatus: jw.status,
              notes: `Order progressed to ${jw.status}`,
              createdAt: getPastDate(Math.max(0, jw.daysAgo - 1)),
            }] : []),
          ],
        },
      },
    });

    // Create Delivery Challan for issued job work orders
    if (jw.challanNumber) {
      await prisma.jobWorkChallan.create({
        data: {
          challanNumber: jw.challanNumber,
          dispatchDate: getPastDate(jw.daysAgo),
          expectedReturnDate: getPastDate(jw.daysAgo - 7),
          dispatchedQuantity: jw.issuedWeight,
          returnedQuantity: jw.returnedWeight,
          wastageQuantity: jw.wastageWeight,
          processingChargePerUnit: 18.5,
          status: jw.status === JobWorkStatus.COMPLETED ? 'COMPLETED' : 'DISPATCHED',
          jobWorkCompanyId: jw.companyId,
          rawMaterialId: jw.rawMatId,
        },
      });
    }
  }
  console.log('✔ Job Work Orders, Challans & Subcontracting Ledger seeded.');

  // 11. Seed Serialized Fabric Rolls Ledger with QC Passed Records
  const serializedRolls = [
    {
      num: 'ROL-20260801-001',
      mat: 'Grey Gauze Fabric Roll 48 Inch',
      stage: RollStage.GREY_FABRIC_ROLL,
      status: RollStatus.CONVERTED,
      weight: 48.5,
      width: 48,
      length: 500,
      gsm: 28.0,
      daysAgo: 14,
    },
    {
      num: 'ROL-20260804-002',
      mat: 'Bleached Gauze Fabric Roll 48 Inch (Medical Grade)',
      stage: RollStage.BLEACHED_GAUZE_ROLL,
      status: RollStatus.QC_APPROVED,
      weight: 44.2,
      width: 48,
      length: 480,
      gsm: 28.5,
      daysAgo: 10,
    },
    {
      num: 'ROL-20260808-003',
      mat: 'SMS Non-Woven Medical Blue Fabric 45 GSM',
      stage: RollStage.SLIT_ROLL,
      status: RollStatus.IN_PRODUCTION,
      weight: 52.0,
      width: 60,
      length: 650,
      gsm: 45.0,
      daysAgo: 6,
    },
    {
      num: 'ROL-20260811-004',
      mat: '100% Bamboo Natural Fibre Non-Woven Sheet',
      stage: RollStage.SLIT_ROLL,
      status: RollStatus.IN_PRODUCTION,
      weight: 36.8,
      width: 40,
      length: 400,
      gsm: 32.0,
      daysAgo: 4,
    },
    {
      num: 'ROL-20260814-005',
      mat: 'Cross-Lapped Spunlace Viscose Wipe Fabric Roll 50 GSM',
      stage: RollStage.FINISHED_PRODUCT_ROLL,
      status: RollStatus.PACKED,
      weight: 32.0,
      width: 36,
      length: 350,
      gsm: 50.0,
      daysAgo: 2,
    },
    {
      num: 'ROL-20260816-006',
      mat: 'Raw Cotton 100% Combed Medical Grade',
      stage: RollStage.RAW_COTTON_BALE,
      status: RollStatus.STORED_IN_RM,
      weight: 165.0,
      width: 0,
      length: 0,
      gsm: 0,
      daysAgo: 1,
    },
  ];

  for (const r of serializedRolls) {
    await prisma.cottonRoll.create({
      data: {
        rollNumber: r.num,
        barcode: `BAR-${r.num}`,
        batchNumber: `BAT-2026-AUG-${r.num.slice(-3)}`,
        materialName: r.mat,
        stage: r.stage,
        widthInches: r.width,
        lengthMeters: r.length,
        weightKg: r.weight,
        gsm: r.gsm > 0 ? r.gsm : null,
        currentStatus: r.status,
        currentLocation: r.status === RollStatus.STORED_IN_RM ? 'Raw Cotton Bay A' : 'Production Floor Area 1',
        createdAt: getPastDate(r.daysAgo),
        statusHistory: {
          create: [
            {
              fromStatus: null,
              toStatus: RollStatus.RAW_RECEIVED,
              location: 'Warehouse Receiving Bay',
              remarks: 'Intake and barcoded on receipt',
              performedBy: 'Murugan Selvam (Store Keeper)',
              createdAt: getPastDate(r.daysAgo),
            },
            {
              fromStatus: RollStatus.RAW_RECEIVED,
              toStatus: r.status,
              location: 'Active Production / Storage Bin',
              remarks: `Transitioned to state: ${r.status}`,
              performedBy: 'Floor Supervisor',
              createdAt: getPastDate(Math.max(0, r.daysAgo - 1)),
            },
          ],
        },
        qcInspections: {
          create: {
            inspectionNumber: `QC-INS-${r.num.slice(-6)}`,
            testedGsm: r.gsm > 0 ? r.gsm + 0.5 : 28.5,
            testedAbsorbency: 1.6, // < 10 seconds pharmacopoeia pass
            testedWhiteness: 89.5, // > 80% pass
            testedpH: 6.8,
            moistureContent: 5.2,
            resultStatus: QCResultStatus.PASSED,
            remarks: 'Complies with Indian & British Pharmacopoeia Standards for Surgical Absorbency',
            inspectorName: 'Priya Sharma (Lead QC)',
            inspectedAt: getPastDate(Math.max(0, r.daysAgo - 1)),
          },
        },
      },
    });
  }
  console.log('✔ Serialized Rolls & QC Pharmacopoeia Lab Inspections seeded.');

  // 12. Seed Production Batches across Categories
  const productionBatchesData = [
    {
      num: 'PB-2026-0801',
      target: 'Elastic Securing Gauze Bandage',
      planned: 5000,
      completed: 5000,
      status: ProductionWorkOrderStatus.COMPLETED,
      daysAgo: 13,
    },
    {
      num: 'PB-2026-0802',
      target: 'Mom’s Maternity Sanitary Pad & Fixator / Disposable Maternity Pad',
      planned: 3000,
      completed: 3000,
      status: ProductionWorkOrderStatus.COMPLETED,
      daysAgo: 10,
    },
    {
      num: 'PB-2026-0803',
      target: 'Dr.C Adult Pullups – Premium (Large)',
      planned: 2000,
      completed: 2000,
      status: ProductionWorkOrderStatus.COMPLETED,
      daysAgo: 7,
    },
    {
      num: 'PB-2026-0804',
      target: 'BeBe Baby Diapers (Medium)',
      planned: 4000,
      completed: 2800,
      status: ProductionWorkOrderStatus.IN_PROGRESS,
      daysAgo: 4,
    },
    {
      num: 'PB-2026-0805',
      target: 'Z Guard Natural Mosquito Repellent Spray',
      planned: 3000,
      completed: 1800,
      status: ProductionWorkOrderStatus.IN_PROGRESS,
      daysAgo: 2,
    },
    {
      num: 'PB-2026-0806',
      target: 'Surgeon’s Gown Kit',
      planned: 1200,
      completed: 0,
      status: ProductionWorkOrderStatus.PLANNED,
      daysAgo: 1,
    },
  ];

  for (const pb of productionBatchesData) {
    await prisma.productionBatch.create({
      data: {
        batchNumber: pb.num,
        workOrderNumber: `WO-${pb.num}`,
        targetProduct: pb.target,
        plannedQty: pb.planned,
        completedQty: pb.completed,
        status: pb.status,
        startDate: getPastDate(pb.daysAgo),
        endDate: pb.status === ProductionWorkOrderStatus.COMPLETED ? getPastDate(pb.daysAgo - 2) : null,
        createdAt: getPastDate(pb.daysAgo),
      },
    });
  }
  console.log('✔ Production Batches seeded.');

  console.log('🚀 DB UPDATE COMPLETED: All new catalogue products, raw materials, and job work orders seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
