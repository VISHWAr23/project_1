const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.attendanceLog.deleteMany({ where: { status: 'OVERTIME' } });
  console.log('Deleted records');
}
main().catch(console.error).finally(() => prisma.$disconnect());
