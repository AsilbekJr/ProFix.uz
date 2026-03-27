import { Request, Response } from 'express';
import prisma from '../config/db';
import { clearUserCache } from '../middleware/auth.middleware';
import { uploadToCloud } from '../config/cloudinary';
import logger from '../config/logger';

// Update specialist profile (bio, location)
export const updateSpecialistProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'SPECIALIST') {
      return res.status(403).json({ success: false, message: 'Faqat ustalar tahrirlay oladi' });
    }

    const { bio, location, locationLat, locationLng } = req.body;

    const specialist = await prisma.specialist.findUnique({
      where: { userId: req.user.id }
    });

    if (!specialist) return res.status(404).json({ success: false, message: 'Usta profili topilmadi' });

    const updated = await prisma.specialist.update({
      where: { id: specialist.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(locationLat !== undefined && { locationLat }),
        ...(locationLng !== undefined && { locationLng })
      }
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSpecialists = async (req: Request, res: Response): Promise<any> => {
  try {
    const { categoryId, verified, location, district } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Verified filter
    let isVerifiedFilter: boolean | undefined = true;
    if (verified === 'false') isVerifiedFilter = false;
    else if (verified === 'all') isVerifiedFilter = undefined;

    // Location filter: district yoki location bo'yicha qidirish
    const locationFilter = (district || location)
      ? { location: { contains: String(district || location), mode: 'insensitive' as const } }
      : {};

    const whereCLAUSE = {
      ...(isVerifiedFilter !== undefined && { isVerified: isVerifiedFilter }),
      ...(categoryId && { services: { some: { categoryId: String(categoryId) } } }),
      ...locationFilter,
    };

    const [specialists, total] = await Promise.all([
      prisma.specialist.findMany({
        where: whereCLAUSE,
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
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.specialist.count({ where: whereCLAUSE })
    ]);

    // Ommaviy qidiruvda autentifikatsiya yo'q bo'lsa telefon raqamini yashirish
    const mappedSpecialists = specialists.map(s => {
      if (!req.user) {
         if (s.user) s.user.phone = 'Yashiringan';
      }
      return s;
    });

    res.json({ 
      success: true, 
      data: mappedSpecialists,
      meta: { total, page, limit }
    });
  } catch (err: any) {
    logger.error({ err }, 'getSpecialists error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
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

    if (!req.user && specialist.user) {
      specialist.user.phone = 'Yashiringan';
    }

    res.json({ success: true, data: specialist });
  } catch (err: any) {
    logger.error({ err }, 'getSpecialistById error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
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

    const { bio, location, categoryId, customCategoryName, locationLat, locationLng, contactPhone } = req.body;
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
          documents: documentUrls,
          // Kontakt raqamni user'ning asosiy phone'iga yozish (agar boshqasi berilmagan bo'lsa)
        }
      });

      // Agar alohida kontakt raqam berilgan bo'lsa — user profiliga saqlash
      if (contactPhone?.trim()) {
        await tx.user.update({
          where: { id: req.user!.id },
          data: { phone: contactPhone.trim() }
        });
      }

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
    logger.error({ err }, 'applyAsSpecialist error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
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
