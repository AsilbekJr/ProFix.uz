import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import logger from '../config/logger';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET muhit o\'zgaruvchisi o\'rnatilmagan yoki juda qisqa!');
  }
  return secret;
};

const generateToken = (id: string) =>
  jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' });

// ── Referral kodi generatsiya ────────────────────────────────────────────────
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { phone, name, password, refCode } = req.body;

    if (!phone) return res.status(400).json({ success: false, message: 'Telefon raqam kiritilishi shart' });
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Ism kiritilishi shart' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: "Parol kamida 6 belgi bo'lishi kerak" });

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) return res.status(400).json({ success: false, message: "Bu raqam allaqachon ro'yxatdan o'tgan" });

    const hashedPassword = await bcrypt.hash(password, 12);

    // Unique referral kodi yaratamiz
    let referralCode: string;
    let codeExists = true;
    do {
      referralCode = generateReferralCode();
      const check = await prisma.user.findUnique({ where: { referralCode } });
      codeExists = !!check;
    } while (codeExists);

    // Referral orqali kelganini tekshiramiz
    let referredBy: string | undefined;
    if (refCode) {
      const referrer = await prisma.user.findFirst({ where: { referralCode: refCode.toUpperCase() } });
      if (referrer) {
        referredBy = refCode.toUpperCase();
        // Referrer'ga bonus qo'shamiz
        await prisma.user.update({
          where: { id: referrer.id },
          data: { bonusBalance: { increment: 10 } },
        });
      }
    }

    const { password: _, ...user } = await prisma.user.create({
      data: { phone, name: name.trim(), password: hashedPassword, referralCode, referredBy }
    });

    res.status(201).json({ success: true, token: generateToken(user.id), user });
  } catch (err: any) {
    logger.error({ err }, 'Register error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};


export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { phone, password } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Telefon raqam kiritilishi shart' });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    // ADMIN va parol mavjud bo'lganda, parolni tekshirish
    if (user.role === 'ADMIN' || user.password) {
      if (!password) {
        return res.status(400).json({ success: false, message: 'Parol kiritilishi shart', requirePassword: true });
      }
      if (!user.password) {
        return res.status(401).json({ success: false, message: 'Hisob parol bilan himoyalanmagan' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Parol noto\'g\'ri' });
      }
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, token: generateToken(user.id), user: safeUser });
  } catch (err: any) {
    logger.error({ err }, 'Login error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

export const telegramAuth = async (req: Request, res: Response): Promise<any> => {
  try {
    const { telegramId, name, refCode } = req.body;
    if (!telegramId) return res.status(400).json({ success: false, message: 'Telegram ID kiritilishi shart' });

    let user = await prisma.user.findUnique({ where: { telegramId: String(telegramId) } });

    if (!user) {
      // Unique referral kodi yaratamiz
      let referralCode: string;
      let codeExists = true;
      do {
        referralCode = generateReferralCode();
        const check = await prisma.user.findUnique({ where: { referralCode } });
        codeExists = !!check;
      } while (codeExists);

      // Referral orqali kelganini tekshiramiz
      let referredBy: string | undefined;
      if (refCode) {
        const referrer = await prisma.user.findFirst({ where: { referralCode: String(refCode).toUpperCase() } });
        if (referrer && referrer.telegramId !== String(telegramId)) {
          referredBy = String(refCode).toUpperCase();
          await prisma.user.update({
            where: { id: referrer.id },
            data: { bonusBalance: { increment: 10 } },
          });
        }
      }

      user = await prisma.user.create({
        data: { telegramId: String(telegramId), name, referralCode, referredBy }
      });
    } else if (!user.referralCode) {
      // Eski foydalanuvchiga ham referral kodi yaratamiz
      let referralCode: string;
      let codeExists = true;
      do {
        referralCode = generateReferralCode();
        const check = await prisma.user.findUnique({ where: { referralCode } });
        codeExists = !!check;
      } while (codeExists);
      user = await prisma.user.update({ where: { id: user.id }, data: { referralCode } });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, token: generateToken(user.id), user: safeUser });
  } catch (err: any) {
    logger.error({ err }, 'Telegram auth error');
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
};

