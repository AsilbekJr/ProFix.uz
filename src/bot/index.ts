import { Telegraf, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { analyzeTextWithAI, analyzeImageWithAI, ParsedRequest } from './ai.service';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const botToken = process.env.TELEGRAM_BOT_TOKEN;

// ── In-memory session to store pending requests per user ─────────────────────
interface UserSession {
  parsedRequest: ParsedRequest;
  step: 'waiting_location';
}
const sessions = new Map<number, UserSession>();

// ── Haversine distance (km) ───────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Reverse geocode coordinates → city name (Nominatim, free) ────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`,
      { headers: { 'User-Agent': 'ProFix-Bot/1.0' } }
    );
    const data: any = await resp.json();
    // Return city/town/village/county
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      data.address?.state ||
      'Noma\'lum joy'
    );
  } catch {
    return 'Noma\'lum joy';
  }
}

export const setupBot = () => {
  if (!botToken) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN topilmadi! Bot ishga tushmadi.');
    return null;
  }

  const bot = new Telegraf(botToken);

  const getTwaUrl = (ctx: any) => {
    const botUsername = ctx.botInfo?.username || 'pro_fix_uz_bot';
    return process.env.VITE_CLIENT_URL || `https://t.me/${botUsername}/app`;
  };

  // ── /start ────────────────────────────────────────────────────────────────
  bot.start((ctx) => {
    // Clear any pending session so next message is treated as a fresh problem
    sessions.delete(ctx.from.id);
    ctx.reply(
      `Assalomu alaykum, ${ctx.from.first_name}! 👋\n\nMen **ProFix.uz** aqlli yordamchisiman.\n\n📝 Muammoingizni yozing yoki 📷 buzilgan narsaning rasmini yuboring — men siz yaqinidagi eng yaxshi ustani topib beraman!`,
      Markup.inlineKeyboard([
        Markup.button.url('Ilovani ochish 📱', getTwaUrl(ctx))
      ])
    );
  });

  // ── Helper: Ask for location after AI analysis ────────────────────────────
  async function askForLocation(ctx: any, parsedRequest: ParsedRequest) {
    const userId = ctx.from.id;
    sessions.set(userId, { parsedRequest, step: 'waiting_location' });

    const { summary, categoryName } = parsedRequest;
    await ctx.reply(
      `✅ Tushundim!\n📋 **Muammo:** ${summary}\n📂 **Toifa:** ${categoryName}\n\n📍 Endi sizga eng yaqin ustani topish uchun manzilingiz kerak.\n\nQuyidagilardan birini tanlang:`,
      Markup.inlineKeyboard([
        [Markup.button.callback('📍 GPS Lokatsiyamni ulashish', 'share_location')],
        [Markup.button.callback('✏️ Qo\'lda yozaman', 'manual_address')]
      ])
    );
  }

  // ── Callback: GPS ulashish so'rovi ────────────────────────────────────────
  bot.action('share_location', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      '📍 Iltimos, **pastdagi tugma** orqali joylashuvingizni yuboring:',
      Markup.keyboard([
        [Markup.button.locationRequest('📍 Joylashuvimni yuborish')]
      ]).resize().oneTime()
    );
  });

  // ── Callback: Qo'lda manzil yozish ───────────────────────────────────────
  bot.action('manual_address', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      '✏️ Manzilingizni yozing (Masalan: **Toshkent, Yunusobod tumani**):',
      Markup.removeKeyboard()
    );
  });

  // ── GPS location received ─────────────────────────────────────────────────
  bot.on('location', async (ctx) => {
    const userId = ctx.from.id;
    const session = sessions.get(userId);

    if (!session || session.step !== 'waiting_location') {
      return ctx.reply('Iltimos, avval muammoingizni yozing.');
    }
    sessions.delete(userId);

    const { latitude: lat, longitude: lng } = ctx.message.location;
    const waitMsg = await ctx.reply('⏳ Sizga eng yaqin ustalar qidirilmoqda...', Markup.removeKeyboard());

    // Reverse geocode to get city name for display
    const cityName = await reverseGeocode(lat, lng);

    await findAndSendSpecialists(ctx, session.parsedRequest, { lat, lng, cityName }, waitMsg.message_id);
  });

  // ── Photos ────────────────────────────────────────────────────────────────
  bot.on('photo', async (ctx) => {
    try {
      const waitMsg = await ctx.reply('⏳ Rasmni tahlil qilyapman...');
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const caption = ctx.message.caption || '';

      const parsedRequest = await analyzeImageWithAI(fileLink.href, caption);
      if (!parsedRequest) {
        return ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, undefined,
          'Rasmni tahlil qilishda xatolik. Iltimos, muammoingizni matnda yozing.');
      }
      await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id);
      await askForLocation(ctx, parsedRequest);
    } catch (err) {
      console.error(err);
      ctx.reply("Kechirasiz, rasmni o'qishda xatolik yuz berdi 😟.");
    }
  });

  // ── Text ──────────────────────────────────────────────────────────────────
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;

    const userId = ctx.from.id;
    const session = sessions.get(userId);

    // If waiting for manual address, perform search with text address
    if (session && session.step === 'waiting_location') {
      sessions.delete(userId);
      const waitMsg = await ctx.reply(`⏳ "${text}" hududida ustalar qidirilmoqda...`);
      await findAndSendSpecialists(ctx, session.parsedRequest, { textAddress: text }, waitMsg.message_id);
      return;
    }

    // Otherwise, treat as new problem description
    try {
      const waitMsg = await ctx.reply('⏳ Xabaringizni tahlil qilyapman...');
      const parsedRequest = await analyzeTextWithAI(text);
      if (!parsedRequest) {
        return ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, undefined,
          "Tushuna olmadim. Muammoingizni boshqacharoq yozing.");
      }
      await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id);
      await askForLocation(ctx, parsedRequest);
    } catch (err) {
      console.error(err);
      ctx.reply('Kechirasiz, xabarni tahlil qilishda xatolik yuz berdi 😟.');
    }
  });

  // ── Core: Find specialists by category + location ─────────────────────────
  async function findAndSendSpecialists(
    ctx: any,
    parsedRequest: ParsedRequest,
    location: { lat?: number; lng?: number; cityName?: string; textAddress?: string },
    waitMsgId: number
  ) {
    const { categoryName, isUrgent, summary } = parsedRequest;

    // 1. Find category
    const categories = await prisma.category.findMany();
    const matchedCategory =
      categories.find(
        (c) =>
          c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
          categoryName.toLowerCase().includes(c.name.toLowerCase())
      ) || categories[0];

    if (!matchedCategory) {
      return ctx.telegram.editMessageText(ctx.chat.id, waitMsgId, undefined,
        `Afsuski, bu toifada ustalar topilmadi.`);
    }

    // 2. Find all specialists in that category
    const services = await prisma.service.findMany({
      where: { categoryId: matchedCategory.id },
      include: {
        specialist: { include: { user: true } }
      }
    });

    let specialists = services
      .filter((s) => s.specialist.isVerified)
      .map((s) => s.specialist);

    // 3. Filter/sort by location
    const searchAddress = location.textAddress || location.cityName || '';
    let specialistsWithDist: Array<typeof specialists[0] & { distKm?: number }> = [];

    if (location.lat && location.lng) {
      // GPS: sort by haversine distance, only those with coordinates OR matching address
      specialistsWithDist = specialists
        .filter((sp) => sp.locationLat && sp.locationLng)
        .map((sp) => ({ ...sp, distKm: haversine(location.lat!, location.lng!, sp.locationLat!, sp.locationLng!) }))
        .sort((a, b) => (a.distKm ?? 999) - (b.distKm ?? 999));

      // Fallback: also include specialists with text location matching city
      const withoutCoords = specialists
        .filter((sp) => !sp.locationLat || !sp.locationLng)
        .filter((sp) => location.cityName && sp.location?.toLowerCase().includes(location.cityName.toLowerCase()))
        .map((sp) => ({ ...sp, distKm: undefined }));

      specialistsWithDist = [...specialistsWithDist, ...withoutCoords];
    } else if (searchAddress) {
      // Text: filter by address string match
      const lower = searchAddress.toLowerCase();
      specialistsWithDist = specialists
        .filter((sp) => sp.location && sp.location.toLowerCase().includes(lower))
        .map((sp) => ({ ...sp, distKm: undefined }));

      // Fallback: if nothing matched, return all
      if (specialistsWithDist.length === 0) {
        specialistsWithDist = specialists.map((sp) => ({ ...sp, distKm: undefined }));
      }
    } else {
      specialistsWithDist = specialists.map((sp) => ({ ...sp, distKm: undefined }));
    }

    // Take top 3
    const top3 = specialistsWithDist.slice(0, 3);
    const twaUrl = getTwaUrl(ctx);

    let replyText = `✅ **Muammo:** ${summary}\n`;
    replyText += `📂 **Toifa:** ${matchedCategory.name}\n`;
    if (location.cityName) replyText += `📍 **Hudud:** ${location.cityName}\n`;
    if (location.textAddress) replyText += `📍 **Manzil:** ${location.textAddress}\n`;
    if (isUrgent) replyText += `🚨 **Shoshilinch!**\n`;
    replyText += `\nSizga eng mos ustalar:\n`;

    const buttons: any[] = [];
    if (top3.length > 0) {
      top3.forEach((sp, idx) => {
        const rating = sp.rating > 0 ? `${sp.rating}⭐` : 'Yangi';
        const dist = sp.distKm != null ? ` · ${sp.distKm.toFixed(1)} km` : '';
        const loc = sp.location ? ` (${sp.location})` : '';
        replyText += `\n${idx + 1}. **${sp.user.name || 'Usta'}**${loc} — ${rating}${dist}`;
        buttons.push([Markup.button.url(`👨‍🔧 ${sp.user.name} ga murojaat`, `${twaUrl}?startapp=specialist_${sp.id}`)]);
      });
    } else {
      replyText += `\nAfsuski, bu hududda hozircha mos ustalar topilmadi.\nBoshqa hududdan izlab ko'rishlari mumkin:`;
      buttons.push([Markup.button.url('Barcha ustalar 👨‍🔧', twaUrl)]);
    }

    await ctx.telegram.editMessageText(ctx.chat.id, waitMsgId, undefined, replyText, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons }
    });
  }

  // Start bot
  bot.launch().then(() => console.log('🤖 Telegram Bot ishga tushdi!')).catch(console.error);
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
};
