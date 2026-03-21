import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const cats = await prisma.category.findMany();
  console.log('Categories in DB:', JSON.stringify(cats, null, 2));
  await prisma.$disconnect();
}

check();
