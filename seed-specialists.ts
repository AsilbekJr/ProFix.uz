import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding specialst data...');

  // Get categories
  const categories = await prisma.category.findMany();
  
  if (categories.length === 0) {
    console.log('No categories found. Adding some categories...');
    const createdCat1 = await prisma.category.create({ data: { name: 'Santexnika', icon: 'Wrench' }});
    const createdCat2 = await prisma.category.create({ data: { name: 'Elektr', icon: 'Zap' }});
    categories.push(createdCat1, createdCat2);
  }

  const category1 = categories[0];
  const category2 = categories.length > 1 ? categories[1] : categories[0];

  // Helper function to create specialist
  const createSpec = async (name: string, phone: string, bio: string, catId: string, rating: number, lat: number, lng: number) => {
    // create user
    const u = await prisma.user.create({
      data: {
        name,
        phone,
        role: 'SPECIALIST',
        password: 'hashed_password_placeholder', // doesn't matter for mock
      }
    });

    // create specialist profile
    const s = await prisma.specialist.create({
      data: {
        userId: u.id,
        bio,
        location: 'Toshkent, Chilonzor',
        rating,
        reviewCount: Math.floor(Math.random() * 50) + 5,
        locationLat: lat,
        locationLng: lng,
        isVerified: true,
      }
    });

    // assign service
    await prisma.service.create({
      data: {
        specialistId: s.id,
        categoryId: catId,
        price: 150000 + Math.floor(Math.random() * 200000),
      }
    });

    // create portfolio
    await prisma.portfolio.create({
      data: {
        specialistId: s.id,
        title: `${name} ishidan namuna`,
        description: 'Juda sifatli va tezkor ish.',
        afterImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=200&auto=format&fit=crop',
        beforeImage: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=200&auto=format&fit=crop'
      }
    });

    // create fake reviews
    const client = await prisma.user.create({
      data: { phone: `+99890${Math.floor(Math.random() * 10000000)}`, name: 'Alijon', role: 'CLIENT' }
    });

    const orderForReview = await prisma.order.create({
      data: {
        clientId: client.id,
        specialistId: s.id,
        categoryId: catId,
        description: 'Test review order',
        status: 'COMPLETED'
      }
    });

    await prisma.review.create({
      data: {
        orderId: orderForReview.id,
        clientId: client.id,
        specialistId: s.id,
        rating: Math.floor(rating),
        comment: 'Juda zo\'r ishladi, tavsiya qilaman!'
      }
    });

    console.log(`Created specialist: ${name}`);
  };

  // Create mock specialists (assuming coords around Toshkent center: 41.311081, 69.240562)
  await createSpec('Azamat (Santexnik)', '+998910001122', '10 yillik tajribaga ega tajribali santexnik.', category1.id, 4.8, 41.315, 69.245);
  await createSpec('Bobur (Elektr)', '+998930002233', 'Elektr toki bilan bog\'liq barcha ishlar boyicha malakali.', category2.id, 4.6, 41.310, 69.240);
  await createSpec('Sherzod (Universal)', '+998940003344', 'Arzon va sifatli universal xizmat.', category1.id, 4.2, 41.320, 69.250);
  await createSpec('Jahongir Usta', '+998990004455', 'Pol, tom, eshik va deraza tamirlash ustasi.', category2.id, 4.9, 41.305, 69.230);
  await createSpec('Farhod (Master)', '+998970005566', 'Ham santexnika ham uydagi uskunalar boyicha yordam bera olaman.', category1.id, 4.5, 41.330, 69.220);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
