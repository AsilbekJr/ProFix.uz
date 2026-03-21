import { Request, Response } from 'express';
import prisma from '../config/db';
import { uploadToCloud } from '../config/cloudinary';
import { clearUserCache } from '../middleware/auth.middleware';

export const getSpecialists = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categoryId, verified, location, district } = req.query;

    // Verified filter
    let isVerifiedFilter: boolean | undefined = true;
    if (verified === 'false') isVerifiedFilter = false;
    else if (verified === 'all') isVerifiedFilter = undefined;

    // Location filter: district yoki location bo'yicha qidirish
    const locationFilter = (district || location)
      ? { location: { contains: String(district || location), mode: 'insensitive' as const } }
      : {};

    const specialists = await prisma.specialist.findMany({
      where: {
        ...(isVerifiedFilter !== undefined && { isVerified: isVerifiedFilter }),
        ...(categoryId && { services: { some: { categoryId: String(categoryId) } } }),
        ...locationFilter,
      },
      select: {
        id: true,
        rating: true,
        reviewCount: true,
        location: true,
        isVerified: true,
        bio: true,
        documents: true,
        user: {
          select: { id: true, name: true, phone: true }
        },
        services: {
          select: { id: true, price: true, category: { select: { id: true, name: true } } }
        },
        _count: {
          select: {
            ordersAsSpecialist: { where: { status: 'COMPLETED' } }
          }
        }
      },
      orderBy: { rating: 'desc' },
      take: 100
    });

    res.json({ success: true, data: specialists });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSpecialistById = async (req: Request, res: Response): Promise<any> => {
  try {
    const specialist = await prisma.specialist.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        bio: true,
        location: true,
        rating: true,
        reviewCount: true,
        isVerified: true,
        documents: true,
        user: {
          select: { id: true, name: true, phone: true, telegramId: true }
        },
        services: {
          select: { id: true, price: true, category: { select: { id: true, name: true } } }
        },
        _count: {
          select: {
             ordersAsSpecialist: { where: { status: 'COMPLETED' } }
          }
        },
        portfolios: {
          select: { id: true, title: true, description: true, beforeImage: true, afterImage: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reviews: {
          select: {
            id: true, rating: true, comment: true, createdAt: true,
            client: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        availabilities: {
          where: { date: { gte: new Date() }, isBooked: false },
          select: { id: true, date: true, startTime: true, endTime: true },
          orderBy: { date: 'asc' },
          take: 14
        }
      }
    });

    if (!specialist) return res.status(404).json({ success: false, message: 'Usta topilmadi' });
    res.json({ success: true, data: specialist });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rateSpecialist = async (req: Request, res: Response): Promise<any> => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Reyting 1-5 oraligida bo'lishi kerak" });
    }

    const specialist = await prisma.specialist.findUnique({
      where: { id: req.params.id },
      select: { id: true, rating: true }
    });
    if (!specialist) return res.status(404).json({ success: false, message: 'Usta topilmadi' });

    const newRating = (specialist.rating + parseFloat(rating)) / 2;
    const updated = await prisma.specialist.update({
      where: { id: req.params.id },
      data: { rating: Number(newRating.toFixed(1)) },
      select: { id: true, rating: true }
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const applyAsSpecialist = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const existing = await prisma.specialist.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });
    if (existing) return res.status(400).json({ success: false, message: 'Siz allaqachon usta ariza topshirgansiz' });

    const { bio, location, categoryId, customCategoryName, locationLat, locationLng } = req.body;
    const files = req.files as Express.Multer.File[];

    // Parallel file uploads
    let documentUrls: string[] = [];
    if (files && files.length > 0) {
      const results = await Promise.all(files.map(f => uploadToCloud(f.buffer, 'specialist_docs')));
      documentUrls = results.map(r => r.secure_url);
    }

    // Parallel: specialist create + category lookup
    let finalCategoryId = categoryId;

    if (customCategoryName) {
      let newCat = await prisma.category.findFirst({ where: { name: customCategoryName }, select: { id: true } });
      if (!newCat) {
        newCat = await prisma.category.create({ data: { name: customCategoryName, icon: '✨' }, select: { id: true } });
      }
      finalCategoryId = newCat.id;
    }

    // Transaction: at omit atomik qilish
    const specialist = await prisma.$transaction(async (tx) => {
      const s = await tx.specialist.create({
        data: {
          userId: req.user!.id,
          bio: bio || null,
          location: location || null,
          locationLat: locationLat ? parseFloat(locationLat) : null,
          locationLng: locationLng ? parseFloat(locationLng) : null,
          documents: documentUrls
        }
      });

      if (finalCategoryId && finalCategoryId !== 'other') {
        await tx.service.create({
          data: { specialistId: s.id, categoryId: finalCategoryId, price: 0 }
        });
      }

      await tx.user.update({ where: { id: req.user!.id }, data: { role: 'SPECIALIST' } });
      return s;
    });

    res.status(201).json({
      success: true,
      data: specialist,
      message: 'Ariza qabul qilindi. Admin tasdiqlashini kuting.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifySpecialist = async (req: Request, res: Response): Promise<any> => {
  try {
    const specialist = await prisma.specialist.update({
      where: { id: req.params.id },
      data: { isVerified: true },
      select: { id: true, isVerified: true, userId: true }
    });

    await prisma.user.update({
      where: { id: specialist.userId },
      data: { role: 'SPECIALIST' }
    });

    clearUserCache(specialist.userId);

    res.json({ success: true, data: specialist, message: 'Usta tasdiqlandi' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── YANGI: Ustani tasdiqlashni bekor qilish ──────────────────────────────────
export const unverifySpecialist = async (req: Request, res: Response): Promise<any> => {
  try {
    const specialist = await prisma.specialist.update({
      where: { id: req.params.id },
      data: { isVerified: false },
      select: { id: true, isVerified: true }
    });
    res.json({ success: true, data: specialist, message: "Usta tasdiqlanishi bekor qilindi" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
