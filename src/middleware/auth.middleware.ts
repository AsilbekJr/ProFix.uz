import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import logger from '../config/logger';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET muhit o\'zgaruvchisi o\'rnatilmagan yoki juda qisqa!');
  }
  return secret;
};

interface JwtPayload {
  id: string;
}

// ── Simple in-memory token→user cache (5 min TTL) ───────────────────────────
// Bu har so'rovda DB ga murojaat qilishni oldini oladi
const userCache = new Map<string, { user: any; exp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 daqiqa

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token kiritilmagan' });

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;

    // Cache dan foydalanuvchi ni olish
    const cached = userCache.get(decoded.id);
    if (cached && cached.exp > Date.now()) {
      req.user = cached.user;
      return next();
    }

    // DB dan yangi olish (password hech qachon client'ga chiqmasligi kerak)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, name: true, phone: true, telegramId: true,
        role: true, createdAt: true, updatedAt: true,
        specialist: { select: { id: true, isVerified: true, rating: true } }
      }
    });

    if (!user) return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    // Cache ga saqlash
    userCache.set(decoded.id, { user, exp: Date.now() + CACHE_TTL });

    req.user = user as any;
    next();
  } catch (err) {
    logger.warn({ err }, 'Auth token verification failed');
    res.status(401).json({ success: false, message: "Token noto'g'ri yoki muddati o'tgan" });
  }
};

// Cache ni tozalash (logout yoki profil o'zgarganda)
export const clearUserCache = (userId: string) => {
  userCache.delete(userId);
};

export const adminOnly = (req: Request, res: Response, next: NextFunction): any => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Faqat admin uchun' });
  }
  next();
};

// ── Optional Auth: Faqat mavjud bo'lsa pars qiladi, aks holda ignore ─────────
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();

    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    
    const cached = userCache.get(decoded.id);
    if (cached && cached.exp > Date.now()) {
      req.user = cached.user;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true, name: true, phone: true, telegramId: true,
        role: true, createdAt: true, updatedAt: true,
        specialist: { select: { id: true, isVerified: true, rating: true } }
      }
    });

    if (user) {
      userCache.set(decoded.id, { user, exp: Date.now() + CACHE_TTL });
      req.user = user as any;
    }
    
    next();
  } catch (err) {
    // optional, shuning uchun xatoni ignore qilamiz
    next();
  }
};
