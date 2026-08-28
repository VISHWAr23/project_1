const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.rawMaterialCategory.findMany();
  console.log('Categories:', cats);
  const units = await prisma.rawMaterialUnit.findMany();
  console.log('Units:', units);
  const locs = await prisma.storageLocation.findMany();
  console.log('Locations:', locs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
