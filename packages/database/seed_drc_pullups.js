const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Dr. C Adult Pullups - Premium finished product with sizes & pack configurations...');

  // Ensure Category exists
  let cat = await prisma.category.findFirst({
    where: { name: { contains: 'Hygiene', mode: 'insensitive' } }
  });
  if (!cat) {
    cat = await prisma.category.findFirst({
      where: { name: { contains: 'Finished', mode: 'insensitive' } }
    });
  }
  if (!cat) {
    cat = await prisma.category.create({
      data: {
        name: 'Hygiene & Incontinence Care',
        description: 'Adult pullups, diapers, underpads, and patient hygiene care products'
      }
    });
  }

  // Ensure Unit exists
  let packUnit = await prisma.unitOfMeasure.findFirst({
    where: { abbreviation: 'pk' }
  });
  if (!packUnit) {
    packUnit = await prisma.unitOfMeasure.create({
      data: { name: 'Packs', abbreviation: 'pk' }
    });
  }

  // Ensure Location exists
  let loc = await prisma.storageLocation.findFirst({
    where: { code: 'LOC-FG-01' }
  });
  if (!loc) {
    loc = await prisma.storageLocation.findFirst();
  }

  const drcVariants = [
    {
      sku: 'FG-DRC-PULLUPS-M',
      name: 'Dr. C Adult Pullups - Premium (Medium)',
      brand: 'Dr. C Premium',
      variantType: 'Adult Pullups - Premium',
      size: 'MEDIUM (M)',
      dimensionInches: '28"-44"',
      dimensionCm: '70-110 CM',
      packSize: '10 PCS/PACK',
      innerPackQty: 10,
      packUnit: 'Packs',
      boxSize: '12 PACKS/BOX (120 PCS)',
      masterCartonQty: 12,
      features: 'Soft Waist Panel, Anti Bacterial, Super Absorbent, Super Leak guard, Wetness indicator, Easy Pull on-Pull off',
      description: 'Premium disposable adult pullups with soft elastic waist panel, rapid absorption core, anti-bacterial protection, leak guards, and wetness indicator for waist 28"-44" (70-110 cm). Pack of 10 Pcs, 12 Packs per master box.',
      hsnCode: '961900',
      unitId: packUnit.id,
      categoryId: cat.id,
      storageLocationId: loc ? loc.id : null,
      minimumStockLevel: 200,
      maximumStockLevel: 3000,
      reorderQuantity: 500,
      currentStockBalance: 1200,
      unitCost: 380.0,
      lastPurchaseRate: 380.0,
      avgCost: 375.0,
      gstRate: 12.0,
      isActive: true,
      remarks: '10 Pcs/Pack, 12 Packs/Box (120 Pcs Master Box)',
    },
    {
      sku: 'FG-DRC-PULLUPS-L',
      name: 'Dr. C Adult Pullups - Premium (Large)',
      brand: 'Dr. C Premium',
      variantType: 'Adult Pullups - Premium',
      size: 'LARGE (L)',
      dimensionInches: '40"-54"',
      dimensionCm: '100-135 CM',
      packSize: '10 PCS/PACK',
      innerPackQty: 10,
      packUnit: 'Packs',
      boxSize: '12 PACKS/BOX (120 PCS)',
      masterCartonQty: 12,
      features: 'Soft Waist Panel, Anti Bacterial, Super Absorbent, Super Leak guard, Wetness indicator, Easy Pull on-Pull off',
      description: 'Premium disposable adult pullups with soft elastic waist panel, rapid absorption core, anti-bacterial protection, leak guards, and wetness indicator for waist 40"-54" (100-135 cm). Pack of 10 Pcs, 12 Packs per master box.',
      hsnCode: '961900',
      unitId: packUnit.id,
      categoryId: cat.id,
      storageLocationId: loc ? loc.id : null,
      minimumStockLevel: 200,
      maximumStockLevel: 3000,
      reorderQuantity: 500,
      currentStockBalance: 1500,
      unitCost: 420.0,
      lastPurchaseRate: 420.0,
      avgCost: 415.0,
      gstRate: 12.0,
      isActive: true,
      remarks: '10 Pcs/Pack, 12 Packs/Box (120 Pcs Master Box)',
    },
    {
      sku: 'FG-DRC-PULLUPS-XL',
      name: 'Dr. C Adult Pullups - Premium (Extra Large)',
      brand: 'Dr. C Premium',
      variantType: 'Adult Pullups - Premium',
      size: 'EXTRA LARGE (XL)',
      dimensionInches: '52"-63"',
      dimensionCm: '130-160 CM',
      packSize: '10 PCS/PACK',
      innerPackQty: 10,
      packUnit: 'Packs',
      boxSize: '12 PACKS/BOX (120 PCS)',
      masterCartonQty: 12,
      features: 'Soft Waist Panel, Anti Bacterial, Super Absorbent, Super Leak guard, Wetness indicator, Easy Pull on-Pull off',
      description: 'Premium disposable adult pullups with soft elastic waist panel, rapid absorption core, anti-bacterial protection, leak guards, and wetness indicator for waist 52"-63" (130-160 cm). Pack of 10 Pcs, 12 Packs per master box.',
      hsnCode: '961900',
      unitId: packUnit.id,
      categoryId: cat.id,
      storageLocationId: loc ? loc.id : null,
      minimumStockLevel: 200,
      maximumStockLevel: 3000,
      reorderQuantity: 500,
      currentStockBalance: 1100,
      unitCost: 460.0,
      lastPurchaseRate: 460.0,
      avgCost: 450.0,
      gstRate: 12.0,
      isActive: true,
      remarks: '10 Pcs/Pack, 12 Packs/Box (120 Pcs Master Box)',
    },
  ];

  for (const item of drcVariants) {
    const existing = await prisma.rawMaterial.findUnique({
      where: { sku: item.sku }
    });

    if (existing) {
      await prisma.rawMaterial.update({
        where: { id: existing.id },
        data: item,
      });
      console.log('Updated RawMaterial:', item.sku, item.name);
    } else {
      await prisma.rawMaterial.create({
        data: item,
      });
      console.log('Created RawMaterial:', item.sku, item.name);
    }

    // Also sync with ProductMaster
    const existingPM = await prisma.productMaster.findFirst({
      where: { productCode: item.sku }
    });

    if (existingPM) {
      await prisma.productMaster.update({
        where: { id: existingPM.id },
        data: {
          name: item.name,
          category: 'Hygiene & Incontinence Care',
          hsnCode: item.hsnCode,
          unitOfMeasure: 'Packs',
          minStockLevel: item.minimumStockLevel,
          brand: item.brand,
          size: item.size,
          dimensionInches: item.dimensionInches,
          dimensionCm: item.dimensionCm,
          packSize: item.packSize,
          boxSize: item.boxSize,
          features: item.features,
          variantType: item.variantType,
        }
      });
    } else {
      const pm = await prisma.productMaster.create({
        data: {
          productCode: item.sku,
          name: item.name,
          category: 'Hygiene & Incontinence Care',
          hsnCode: item.hsnCode,
          unitOfMeasure: 'Packs',
          standardWidth: 10,
          standardLength: 10,
          standardWeight: 0.45,
          targetGsm: 40,
          minStockLevel: item.minimumStockLevel,
          brand: item.brand,
          size: item.size,
          dimensionInches: item.dimensionInches,
          dimensionCm: item.dimensionCm,
          packSize: item.packSize,
          boxSize: item.boxSize,
          features: item.features,
          variantType: item.variantType,
        }
      });

      const existingBom = await prisma.billOfMaterial.findFirst({
        where: { productId: pm.id }
      });
      if (!existingBom) {
        await prisma.billOfMaterial.create({
          data: {
            bomNumber: `BOM-${item.sku}`,
            productId: pm.id,
            version: '1.0',
            description: `Bill of Material for ${item.name}`,
          }
        });
      }
    }
  }

  console.log('Dr. C Adult Pullups - Premium successfully seeded with all size and pack variant data!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
