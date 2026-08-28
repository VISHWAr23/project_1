const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const materials = await prisma.rawMaterial.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      hsnCode: true,
      currentStockBalance: true,
      unitCost: true,
      categoryId: true,
      category: { select: { name: true } }
    },
  });
  console.log('Total RawMaterials in DB:', materials.length);
  console.log(JSON.stringify(materials, null, 2));

  const products = await prisma.productMaster.findMany({
    select: {
      id: true,
      productCode: true,
      name: true,
      category: true,
    }
  });
  console.log('Total ProductMasters in DB:', products.length);
  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
