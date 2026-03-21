import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const orders = await prisma.order.findMany();
  console.log('Orders in DB:', orders.length);
  if (orders.length > 0) {
    console.log('First order details:', JSON.stringify(orders[0], null, 2));
  }
}

check().finally(() => prisma.$disconnect());
