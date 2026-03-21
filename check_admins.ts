import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  console.log('Admins in DB:', users.length);
  if (users.length > 0) {
    console.log('Admin details:', JSON.stringify(users[0], null, 2));
  }
}

check().finally(() => prisma.$disconnect());
