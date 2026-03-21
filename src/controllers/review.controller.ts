import { Request, Response } from 'express';
import prisma from '../config/db';

// POST /api/reviews
// Faqat COMPLETED orderga, faqat buyurtma bergan mijoz sharh yozishi mumkin
export const createReview = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { orderId, rating, comment } = req.body;

    // Validatsiya
    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'orderId va rating majburiy' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Reyting 1 dan 5 gacha bo\'lishi kerak' });
    }

    // Buyurtmani topish
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
    }

    // Faqat o'sha sijoz sharh yoza oladi
    if (order.clientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Siz bu buyurtmaning mijozi emassiz' });
    }

    // Faqat bitgan buyurtmaga sharh yozish mumkin
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Faqat bajarilgan buyurtmaga sharh yozish mumkin' });
    }

    // Ustasiz buyurtmaga reyting bermaydi
    if (!order.specialistId) {
      return res.status(400).json({ success: false, message: 'Bu buyurtmada usta tayinlanmagan' });
    }

    // Takroriy sharh tekshirish
    if (order.review) {
      return res.status(400).json({ success: false, message: 'Siz bu buyurtma uchun allaqachon sharh qoldirdingiz' });
    }

    // Sharh yaratish
    const review = await prisma.review.create({
      data: {
        orderId,
        clientId: req.user.id,
        specialistId: order.specialistId,
        rating: parseInt(rating),
        comment: comment?.trim() || null
      },
      include: {
        client: { select: { id: true, name: true } },
        specialist: { select: { id: true } }
      }
    });

    // ── Specialist reytingini yangilash ──────────────────
    const allReviews = await prisma.review.findMany({
      where: { specialistId: order.specialistId },
      select: { rating: true }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.specialist.update({
      where: { id: order.specialistId },
      data: {
        rating: Math.round(avgRating * 10) / 10,  // 1 kasr nuqtaga yaxlitlash
        reviewCount: allReviews.length
      }
    });

    return res.status(201).json({ success: true, data: review, message: 'Sharh muvaffaqiyatli qo\'shildi' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/specialist/:specialistId
// Ustaning barcha sharhlari
export const getSpecialistReviews = async (req: Request, res: Response): Promise<any> => {
  try {
    const { specialistId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { specialistId },
      include: {
        client: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: reviews });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/order/:orderId
// Biror buyurtmaga biriktirilgan sharh
export const getOrderReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const review = await prisma.review.findUnique({
      where: { orderId: req.params.orderId },
      include: { client: { select: { id: true, name: true } } }
    });

    return res.json({ success: true, data: review || null });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
