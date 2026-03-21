import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const phone = '+998901234567';
  const password = 'admin'; // Changed to common default for local dev
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { phone },
    update: { 
      role: 'ADMIN',
      password: hashedPassword 
    },
    create: {
      phone,
      name: 'Admin',
      role: 'ADMIN',
      password: hashedPassword
    }
  });

  console.log('✅ Admin user ready:', admin.phone);
}

main().catch(console.error).finally(() => prisma.$disconnect());
