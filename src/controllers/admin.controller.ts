import { Request, Response } from 'express';
import prisma from '../config/db';

// ── Admin statistikasi — allaqachon optimallashtirilgan (parallel queries) ───
export const getAdminStats = async (_req: Request, res: Response): Promise<any> => {
  try {
    const [totalUsers, totalOrders, pendingOrders, completedOrders, totalSpecialists, pendingSpecialists] =
      await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'COMPLETED' } }),
        prisma.specialist.count(),
        prisma.specialist.count({ where: { isVerified: false } }),
      ]);

    res.json({
      success: true,
      data: { totalUsers, totalOrders, pendingOrders, completedOrders, totalSpecialists, pendingSpecialists }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Foydalanuvchilar — faqat kerakli fieldlar, pagination ───────────────────
export const getAdminUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string | undefined;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
              ]
            }
          : undefined,
        select: {
          id: true, name: true, phone: true, telegramId: true,
          role: true, createdAt: true,
          specialist: { select: { id: true, isVerified: true, rating: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({
        where: search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
              ]
            }
          : undefined
      })
    ]);

    res.json({ success: true, data: users, meta: { total, page, limit } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAdminUser = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Foydalanuvchi o'chirildi" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Buyurtmalar — pagination + faqat kerakli fieldlar ───────────────────────
export const getAdminOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const where = status ? { status: status as any } : undefined;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          status: true,
          description: true,
          address: true,
          secondaryPhone: true,
          createdAt: true,
          photos: true,
          client: { select: { id: true, name: true, phone: true } },
          specialist: {
            select: {
              id: true,
              user: { select: { id: true, name: true, phone: true } }
            }
          },
          category: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where })
    ]);

    res.json({ success: true, data: orders, meta: { total, page, limit } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
