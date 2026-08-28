const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding authentic Shri Lathikka Surgicals Finished Goods...');

  // 1. Ensure Finished Goods Category exists
  let fgCategory = await prisma.category.findFirst({
    where: { name: { contains: 'Finished', mode: 'insensitive' } }
  });

  if (!fgCategory) {
    fgCategory = await prisma.category.create({
      data: {
        name: 'Finished Surgical Products',
        description: 'Manufactured and sterile medical dressing goods ready for clinical dispatch'
      }
    });
    console.log('Created Category:', fgCategory.name);
  }

  // 2. Ensure Unit of Measures exist
  let packUnit = await prisma.unitOfMeasure.findFirst({
    where: { abbreviation: 'pk' }
  });
  if (!packUnit) {
    packUnit = await prisma.unitOfMeasure.create({
      data: { name: 'Packs', abbreviation: 'pk' }
    });
  }

  let boxUnit = await prisma.unitOfMeasure.findFirst({
    where: { abbreviation: 'bx' }
  });
  if (!boxUnit) {
    boxUnit = await prisma.unitOfMeasure.create({
      data: { name: 'Boxes', abbreviation: 'bx' }
    });
  }

  let rollUnit = await prisma.unitOfMeasure.findFirst({
    where: { abbreviation: 'rl' }
  });
  if (!rollUnit) {
    rollUnit = await prisma.unitOfMeasure.create({
      data: { name: 'Rolls', abbreviation: 'rl' }
    });
  }

  let pcsUnit = await prisma.unitOfMeasure.findFirst({
    where: { abbreviation: 'pc' }
  });
  if (!pcsUnit) {
    pcsUnit = await prisma.unitOfMeasure.create({
      data: { name: 'Pieces', abbreviation: 'pc' }
    });
  }

  // 3. Storage location
  let fgLocation = await prisma.storageLocation.findFirst({
    where: { code: 'LOC-FG-01' }
  });
  if (!fgLocation) {
    fgLocation = await prisma.storageLocation.create({
      data: {
        code: 'LOC-FG-01',
        name: 'Finished Goods Warehouse',
        warehouseZone: 'Zone E (Finished Products)',
        description: 'Sterilized medical supplies warehouse'
      }
    });
  }

  // 4. Client's Authentic Finished Goods from IndiaMART profile
  const finishedGoods = [
    {
      sku: 'FG-MEDIBATH-WIPES',
      name: 'Medi Bath Body Wipes (10 Wipes/Pack)',
      description: 'Antiseptic chlorhexidine patient bathing wipes with skin conditioners, fragrance-free',
      hsnCode: '330790',
      unitId: packUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 200,
      maximumStockLevel: 2000,
      reorderQuantity: 500,
      currentStockBalance: 850,
      unitCost: 65.0,
      lastPurchaseRate: 65.0,
      avgCost: 62.0,
      gstRate: 18.0,
      isActive: true,
      remarks: 'Certified clinical bathing care',
    },
    {
      sku: 'FG-COT-BALLS-500G',
      name: 'Surgical Cotton Balls (500g Pack)',
      description: '100% pure absorbent sterile surgical cotton wool balls for wound dressing & clinical prep',
      hsnCode: '300590',
      unitId: packUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 150,
      maximumStockLevel: 1500,
      reorderQuantity: 300,
      currentStockBalance: 620,
      unitCost: 180.0,
      lastPurchaseRate: 180.0,
      avgCost: 175.0,
      gstRate: 12.0,
      isActive: true,
      remarks: 'High absorbency IP grade cotton',
    },
    {
      sku: 'FG-GAUZE-ROLL-10X10',
      name: 'Bleached Gauze Bandage Roll (10cm x 10m)',
      description: 'High tensile bleached 100% cotton woven gauze bandage roll with selvedge edges',
      hsnCode: '300590',
      unitId: rollUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 500,
      maximumStockLevel: 5000,
      reorderQuantity: 1000,
      currentStockBalance: 2400,
      unitCost: 42.0,
      lastPurchaseRate: 42.0,
      avgCost: 40.0,
      gstRate: 12.0,
      isActive: true,
      remarks: 'Standard surgical dressing roll',
    },
    {
      sku: 'FG-COT-ROLL-400G',
      name: '400 Gram Surgical Cotton Wool Roll',
      description: 'Absorbent surgical cotton roll 400g net weight, IP Grade, layered with paper wrapper',
      hsnCode: '300590',
      unitId: rollUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 250,
      maximumStockLevel: 2000,
      reorderQuantity: 500,
      currentStockBalance: 1100,
      unitCost: 155.0,
      lastPurchaseRate: 155.0,
      avgCost: 150.0,
      gstRate: 12.0,
      isActive: true,
      remarks: 'IP/BP Grade surgical cotton wool',
    },
    {
      sku: 'FG-GAMJEE-ROLL-15X3',
      name: 'Cotton Gamjee Roll (15cm x 3m)',
      description: 'High absorbency bleached gamjee roll with thick absorbent cotton encased in low-lint gauze',
      hsnCode: '300590',
      unitId: rollUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 300,
      maximumStockLevel: 2500,
      reorderQuantity: 600,
      currentStockBalance: 950,
      unitCost: 125.0,
      lastPurchaseRate: 125.0,
      avgCost: 120.0,
      gstRate: 12.0,
      isActive: true,
      remarks: 'Heavy discharge surgical pad',
    },
    {
      sku: 'FG-GAUZE-SWAB-10X10',
      name: 'Sterile Gauze Swab 10cm x 10cm (12-Ply)',
      description: '100% cotton sterile surgical gauze swabs, 12 ply, folded edges, 100 pcs/box',
      hsnCode: '300590',
      unitId: boxUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 400,
      maximumStockLevel: 3000,
      reorderQuantity: 800,
      currentStockBalance: 1650,
      unitCost: 280.0,
      lastPurchaseRate: 280.0,
      avgCost: 275.0,
      gstRate: 12.0,
      isActive: true,
      remarks: 'Hospital standard 12-ply swab box',
    },
    {
      sku: 'FG-SURG-GOWN-SMS',
      name: 'Medical & Surgical Protective Clothing (Gown)',
      description: 'Disposable reinforced SMS sterile surgical gown with cuffs and tie strings, 45 GSM',
      hsnCode: '621010',
      unitId: pcsUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 100,
      maximumStockLevel: 1000,
      reorderQuantity: 250,
      currentStockBalance: 420,
      unitCost: 210.0,
      lastPurchaseRate: 210.0,
      avgCost: 200.0,
      gstRate: 5.0,
      isActive: true,
      remarks: 'Sterile OT protective apparel',
    },
    {
      sku: 'FG-LAP-SPONGE-30X30',
      name: 'Abdominal Lap Sponge Pad 30cm x 30cm',
      description: 'Pre-washed X-Ray detectable absorbent laparotomy sponge pad with blue barium sulfate loop',
      hsnCode: '300590',
      unitId: packUnit.id,
      categoryId: fgCategory.id,
      storageLocationId: fgLocation.id,
      minimumStockLevel: 150,
      maximumStockLevel: 1200,
      reorderQuantity: 300,
      currentStockBalance: 580,
      unitCost: 320.0,
      lastPurchaseRate: 320.0,
      avgCost: 310.0,
      gstRate: 12.0,
      isActive: true,
      remarks: 'OT Laparotomy surgery sponge',
    },
  ];

  for (const fg of finishedGoods) {
    const existing = await prisma.rawMaterial.findUnique({
      where: { sku: fg.sku }
    });

    if (existing) {
      await prisma.rawMaterial.update({
        where: { id: existing.id },
        data: fg,
      });
      console.log('Updated FG item:', fg.sku, fg.name);
    } else {
      await prisma.rawMaterial.create({
        data: fg,
      });
      console.log('Created FG item:', fg.sku, fg.name);
    }

    // Also sync with ProductMaster
    const existingPM = await prisma.productMaster.findFirst({
      where: { productCode: fg.sku }
    });

    if (existingPM) {
      await prisma.productMaster.update({
        where: { id: existingPM.id },
        data: {
          name: fg.name,
          category: 'Finished Goods',
          hsnCode: fg.hsnCode,
          unitOfMeasure: fg.sku.includes('WIPES') ? 'Packs' : fg.sku.includes('ROLL') ? 'Rolls' : fg.sku.includes('SWAB') ? 'Boxes' : 'Pcs',
          minStockLevel: fg.minimumStockLevel,
        }
      });
    } else {
      const pm = await prisma.productMaster.create({
        data: {
          productCode: fg.sku,
          name: fg.name,
          category: 'Finished Goods',
          hsnCode: fg.hsnCode,
          unitOfMeasure: fg.sku.includes('WIPES') ? 'Packs' : fg.sku.includes('ROLL') ? 'Rolls' : fg.sku.includes('SWAB') ? 'Boxes' : 'Pcs',
          standardWidth: 10,
          standardLength: 10,
          standardWeight: 0.1,
          targetGsm: 30,
          minStockLevel: fg.minimumStockLevel,
        }
      });

      // Ensure BOM Header exists
      const existingBom = await prisma.billOfMaterial.findFirst({
        where: { productId: pm.id }
      });
      if (!existingBom) {
        await prisma.billOfMaterial.create({
          data: {
            bomNumber: `BOM-${fg.sku}`,
            productId: pm.id,
            version: '1.0',
            description: `Bill of Material for ${fg.name}`,
          }
        });
      }
    }
  }

  console.log('Finished Goods synchronization completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
