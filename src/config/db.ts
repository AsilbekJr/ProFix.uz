import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Test the connection
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL (Prisma) bazasi bilan ulanish o'rnatildi!");
  } catch (error) {
    console.error('Baza bilan ulanishda xatolik:', error);
    process.exit(1);
  }
}

export default prisma;
