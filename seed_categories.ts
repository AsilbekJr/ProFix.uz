import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.category.count();
  if (count === 0) {
    const cats = [
      { name: 'Santexnika xizmatlari', icon: '🚽' },
      { name: 'Elektr xizmatlari', icon: '⚡' },
      { name: 'Qurilish va ta\'mirlash', icon: '🧱' },
      { name: 'Uy tozalash', icon: '🧹' },
      { name: 'Maishiy texnika ta\'mirlash', icon: '🔌' },
      { name: 'Mebel yig\'ish / tuzatish', icon: '🛋️' },
      { name: 'Yuk tashish', icon: '🚚' },
      { name: 'Kompyuter va IT xizmatlari', icon: '💻' },
      { name: 'Bog\'dorchilik', icon: '🌳' },
    ];
    await prisma.category.createMany({ data: cats });
    console.log('✅ Boshlang\'ich kategoriyalar qo\'shildi!');
  } else {
    console.log('Kategoriyalar allaqachon mavjud o\'tkazib yuborildi.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
