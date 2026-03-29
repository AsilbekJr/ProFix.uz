import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Referral kodi generatsiya ─────────────────────────────────────────────────
function generateReferralCode(userId: string): string {
  // userId'dan deterministik 8 ta belgi (uppercase + raqamlar)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    const charIndex = parseInt(userId.replace(/-/g, '').slice(i * 4, i * 4 + 4), 16) % chars.length;
    code += chars[charIndex];
  }
  return code;
}

// ── GET /api/referral/my-link ─────────────────────────────────────────────────
export const getMyReferralLink = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    let referralCode = user.referralCode;

    // Agar kodi yo'q bo'lsa — yaratib saqlaymiz
    if (!referralCode) {
      referralCode = generateReferralCode(userId);
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode },
      });
    }

    // Bu foydalanuvchi taklif qilganlari soni
    const referredCount = await prisma.user.count({
      where: { referredBy: referralCode },
    });

    const referralLink = `${process.env.CLIENT_URL || 'https://profix.uz'}/ref/${referralCode}`;
    const telegramLink = `https://t.me/pro_fix_uz_bot?start=ref_${referralCode}`;

    res.json({
      success: true,
      data: {
        referralCode,
        referralLink,
        telegramLink,
        referredCount,
        bonusBalance: user.bonusBalance,
        bonusPercent: 10, // 10% chegirma keyingi buyurtmada
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server xatosi' });
  }
};

// ── POST /api/referral/use ────────────────────────────────────────────────────
// Yangi foydalanuvchi ro'yxatdan o'tganda referral kodi ishlatiladi
export const useReferralCode = async (req: Request, res: Response) => {
  try {
    const newUserId = (req as any).user.id;
    const { code } = req.body;

    if (!code) return res.status(400).json({ success: false, message: 'Referral kodi kerak' });

    // Yangi foydalanuvchi allaqachon referral ishlatganmi?
    const newUser = await prisma.user.findUnique({ where: { id: newUserId } });
    if (!newUser) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    if (newUser.referredBy) {
      return res.status(400).json({ success: false, message: 'Referral kodi allaqachon ishlatilgan' });
    }

    // Referral kodi egasini topamiz
    const referrer = await prisma.user.findFirst({ where: { referralCode: code.toUpperCase() } });
    if (!referrer) return res.status(404).json({ success: false, message: 'Referral kodi topilmadi' });

    // O'zining kodini ishlatmasin
    if (referrer.id === newUserId) {
      return res.status(400).json({ success: false, message: "O'z kodni ishlatib bo'lmaydi" });
    }

    // Yangi foydalanuvchini referredBy bilan yangilaymiz
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: code.toUpperCase() },
    });

    // Referrer'ga 10% bonus belgisi (bonusBalance — keyingi buyurtmada ishlatiladi)
    // Haqiqiy chegirmani order yaratishda tekshiramiz
    await prisma.user.update({
      where: { id: referrer.id },
      data: { bonusBalance: { increment: 10 } }, // 10% qiymat
    });

    res.json({
      success: true,
      message: `Referral kodi qabul qilindi! ${referrer.name || 'Do\'stingiz'}ga bonus yozildi.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server xatosi' });
  }
};
