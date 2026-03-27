import { Request, Response } from 'express';
import prisma from '../config/db';
import { uploadToCloud } from '../config/cloudinary';
import logger from '../config/logger';

export const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { categoryId, description, address, locationLat, locationLng, specialistId, secondaryPhone } = req.body;

    // Parallel uploads
    let photos: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const results = await Promise.all(
        (req.files as Express.Multer.File[]).map(f => uploadToCloud(f.buffer, 'orders'))
      );
      photos = results.map(r => r.secure_url);
    }

    // Usta o'ziga o'zi buyurtma berolmasligini tekshirish
    if (specialistId) {
      const targetSpecialist = await prisma.specialist.findUnique({ where: { id: specialistId } });
      if (targetSpecialist && targetSpecialist.userId === req.user.id) {
        return res.status(400).json({ success: false, message: "O'zingizga o'zingiz buyurtma bera olmaysiz" });
      }
    }

    const order = await prisma.order.create({
      data: {
        clientId: req.user.id,
        categoryId,
        description,
        address,
        locationLat:
          locationLat && !isNaN(parseFloat(locationLat)) ? parseFloat(locationLat) : null,
        locationLng:
          locationLng && !isNaN(parseFloat(locationLng)) ? parseFloat(locationLng) : null,
        specialistId: specialistId || null,
        secondaryPhone: secondaryPhone || null,
        photos
      },
      select: {
        id: true,
        status: true,
        description: true,
        address: true,
        secondaryPhone: true,
        photos: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, phone: true } }
      }
    });

    req.io?.emit('new_order', order);
    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    logger.error({ err }, 'createOrder error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const orders = await prisma.order.findMany({
      where: { clientId: req.user.id },
      select: {
        id: true,
        status: true,
        description: true,
        address: true,
        photos: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
        specialist: {
          select: {
            id: true,
            rating: true,
            user: { select: { id: true, name: true, phone: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<any> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        status: true,
        description: true,
        address: true,
        secondaryPhone: true,
        photos: true,
        createdAt: true,
        updatedAt: true,
        specialistId: true,
        clientId: true,
        category: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, phone: true } },
        specialist: {
          select: {
            id: true,
            rating: true,
            user: { select: { id: true, name: true, phone: true } }
          }
        },
        review: { select: { id: true, rating: true, comment: true } }
      }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });

    // Usta ochiq tenderni ko'rayotganda mijoz raqamini yashirish
    if (req.user?.role === 'SPECIALIST' && order.status === 'PENDING' && !order.specialistId) {
      if (order.client) order.client.phone = 'Yashiringan';
      if (order.secondaryPhone) order.secondaryPhone = 'Yashiringan';
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const { status } = req.body;
    let { specialistId } = req.body;

    // Buyurtmani topib, egasini tekshirish
    const existing = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: { id: true, clientId: true, specialistId: true, status: true }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });

    // Usta o'z buyurtmasini qabul qiladigan yoki statusni yangilaydigan
    if (req.user.role === 'SPECIALIST') {
      const specialist = await prisma.specialist.findUnique({ where: { userId: req.user.id } });
      if (!specialist) return res.status(403).json({ success: false, message: 'Usta profili topilmadi' });

      // ACCEPTED va IN_PROGRESS holatlari uchun: faqat o'sha buyurtmaga birikkan usta
      if (['IN_PROGRESS', 'COMPLETED'].includes(status)) {
        if (existing.specialistId !== specialist.id) {
          return res.status(403).json({ success: false, message: 'Bu buyurtmaga ruxsatingiz yo\'q' });
        }
      }

      // ACCEPTED: ochiq tender uchun birinchi bo'lib qabul qilish
      if (status === 'ACCEPTED' && !specialistId) {
        specialistId = specialist.id;
      }
    } else if (req.user.role === 'CLIENT') {
      // Mijoz faqat CANCELLED statusini o'z buyurtmasi uchun o'zgartira oladi
      if (existing.clientId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Bu sizning buyurtmangiz emas' });
      }
      if (status !== 'CANCELLED') {
        return res.status(403).json({ success: false, message: 'Mijoz faqat bekor qila oladi' });
      }
    } else if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, ...(specialistId && { specialistId }) },
      select: { id: true, status: true, specialistId: true }
    });

    req.io?.to(order.id).emit('order_status_changed', { orderId: order.id, status });
    res.json({ success: true, data: order });
  } catch (err: any) {
    logger.error({ err }, 'updateOrderStatus error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

    const existing = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: { clientId: true, status: true }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });

    // Faqat egasi (yoki admin) bekor qila oladi
    if (existing.clientId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Bu sizning buyurtmangiz emas' });
    }

    // Allaqachon yakunlangan yoki bekor qilinganlarni o'zgartirish mumkin emas
    if (['COMPLETED', 'CANCELLED'].includes(existing.status)) {
      return res.status(400).json({ success: false, message: `Buyurtma "${existing.status}" holatida - bekor qilib bo'lmaydi` });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      select: { id: true, status: true }
    });

    req.io?.to(order.id).emit('order_status_changed', { orderId: order.id, status: 'CANCELLED' });
    res.json({ success: true, message: 'Buyurtma bekor qilindi' });
  } catch (err: any) {
    logger.error({ err }, 'cancelOrder error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const getOpenTenders = async (req: Request, res: Response): Promise<any> => {
  try {
    if (!req.user || req.user.role !== 'SPECIALIST') {
      return res.status(403).json({ success: false, message: 'Faqat ustalar uchun' });
    }

    const specialist = await prisma.specialist.findUnique({
      where: { userId: req.user.id },
      include: { services: true }
    });

    if (!specialist) return res.status(404).json({ success: false, message: 'Usta profili topilmadi' });

    const categoryIds = specialist.services.map(s => s.categoryId);

    const orders = await prisma.order.findMany({
      where: { 
        OR: [
          // Barcha ochiq tenderlar - mutaxassisligidan qat'iy nazar
          {
            specialistId: null, 
            status: 'PENDING'
          },
          // Bevosita shu ustaga yuborilgan yoki usta tomonidan qabul qilingan buyurtmalar
          {
            specialistId: specialist.id,
            status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] }
          }
        ]
      },
      select: {
        id: true,
        status: true,
        specialistId: true,
        description: true,
        address: true,
        locationLat: true,
        locationLng: true,
        photos: true,
        createdAt: true,
        category: { select: { id: true, name: true } },
        client: { select: { id: true, name: true, phone: true } },
        specialist: {
          select: {
            id: true,
            rating: true,
            user: { select: { id: true, name: true, phone: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Maxfiylikni ta'minlash: Ochiq (nomzod biriktirilmagan) arizalarda mijoz raqamini yashirish
    const sanitizedOrders = orders.map(order => {
      if (order.status === 'PENDING' && !order.specialistId) {
        if (order.client) (order.client as any).phone = 'Yashiringan';
      }
      return order;
    });
    
    res.json({ 
      success: true, 
      data: sanitizedOrders,
      meta: {
        specialistLat: specialist.locationLat,
        specialistLng: specialist.locationLng,
        categoryIds
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
