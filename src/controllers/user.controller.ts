import { Request, Response } from 'express';
import prisma from '../config/db';
import { clearUserCache } from '../middleware/auth.middleware';

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, phone: true, telegramId: true,
        role: true, createdAt: true, updatedAt: true,
        specialist: {
          select: {
            id: true, isVerified: true, rating: true,
            reviewCount: true, bio: true, location: true
          }
        }
      }
    });

    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { name, phone } = req.body;

    // Phone uniqueness check
    if (phone && phone !== req.user.phone) {
      const existing = await prisma.user.findUnique({
        where: { phone },
        select: { id: true }
      });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan"
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      },
      select: {
        id: true, name: true, phone: true, telegramId: true,
        role: true, createdAt: true, updatedAt: true,
        specialist: { select: { id: true, isVerified: true, rating: true } }
      }
    });

    // Auth cache ni tozalash (yangi ma'lumot bilan login bo'lishi uchun)
    clearUserCache(req.user.id);

    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
