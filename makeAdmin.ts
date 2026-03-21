import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.user.updateMany({
    where: { phone: '901234567' },
    data: { role: 'ADMIN' },
  });
  console.log('✅ Admin tayinlandi, yangilangan qatorlar soni:', res.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
