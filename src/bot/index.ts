import { Telegraf, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { analyzeTextWithAI, analyzeImageWithAI, ParsedRequest, keywordFallbackCategory } from './ai.service';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const botToken = process.env.TELEGRAM_BOT_TOKEN;

// ── In-memory session to store pending requests per user ─────────────────────
interface UserSession {
  parsedRequest: ParsedRequest;
  step: 'waiting_location' | 'waiting_contact';
  refCode?: string;
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

  // ── Helper: ensure referral code ────────────────────────────────────────────
  async function ensureReferralCode(userId: string): Promise<string> {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (u?.referralCode) return u.referralCode;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    let exists = true;
    while (exists) {
      code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      exists = !!(await prisma.user.findUnique({ where: { referralCode: code } }));
    }
    await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
    return code;
  }

  // ── /start ───────────────────────────────────────────────────────────────
  bot.start(async (ctx) => {
    sessions.delete(ctx.from.id);

    const payload = (ctx as any).startPayload as string | undefined;
    const refCode = payload?.startsWith('ref_') ? payload.slice(4).toUpperCase() : undefined;

    const telegramId = String(ctx.from.id);
    const dbUser = await prisma.user.findUnique({ where: { telegramId } });

    if (!dbUser) {
      // Yozishma holati: raqam kutish
      sessions.set(ctx.from.id, { parsedRequest: {} as any, step: 'waiting_contact', refCode });
      
      await ctx.reply(
        `Assalomu alaykum, <b>${ctx.from.first_name}</b>! 👋\n\n` +
        `🛠 <b>ProFix.uz</b> — o'z ishingizning ustalarini 15 daqiqada topamiz!\n\n` +
        (refCode ? `🎁 Do'stingiz taklif qildi — birinchi buyurtmada bonus!\n\n` : '') +
        `Davom etish uchun telefon raqamingizni ulashing 👇`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('📱 Telefon raqamni ulashish')]
          ]).resize().oneTime()
        }
      );
      return;
    }

    // Mavjud foydalanuvchi — asosiy menyu
    const referralCode = await ensureReferralCode(dbUser.id);
    const twaUrl = getTwaUrl(ctx);
    const botUsername = ctx.botInfo?.username || 'pro_fix_uz_bot';
    const refLink = `https://t.me/${botUsername}?start=ref_${referralCode}`;

    await ctx.reply(
      `Xush kelibsiz, <b>${ctx.from.first_name}</b>! 👋\n\n` +
      `Nima muammo bo'lyapti sizda? Yozing <i>(Masalan: suvim oqyapti, chiroq o'chdi...)</i> yoki rasm yuboring.\n\n` +
      `📱 Yoki to'g'ridan to'g'ri ilovaga o'ting👇`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.url('📍 Usta chaqirish (Mini Ilova)', twaUrl)],
          [Markup.button.callback('🔗 Mening havolam', `my_referral_${referralCode}`), Markup.button.callback('📋 Buyurtmalarim', 'my_orders')]
        ])
      }
    );
  });

  // ── Contact Handling ───────────────────────────────────────────────────────
  bot.on('contact', async (ctx) => {
    const contact = ctx.message.contact;
    const telegramId = String(ctx.from.id);
    
    // Check if user is sharing their own number
    if (contact.user_id && contact.user_id !== ctx.from.id) {
       return ctx.reply("❌ Iltimos, o'zingizning raqamingizni yuboring!");
    }

    let phone = contact.phone_number;
    if (!phone.startsWith('+')) phone = '+' + phone;

    const session = sessions.get(ctx.from.id);
    const refCode = session?.refCode;

    try {
      const twaUrl = getTwaUrl(ctx);
      let dbUser = await prisma.user.findFirst({ where: { phone } });
      
      if (!dbUser) {
         dbUser = await prisma.user.create({
            data: {
               phone,
               name: ctx.from.first_name,
               telegramId,
               role: 'CLIENT',
               // Additional fields like referring user mapping can be added here
            }
         });
      } else {
         dbUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: { telegramId, name: ctx.from.first_name }
         });
      }
      
      sessions.delete(ctx.from.id);
      
      const referralCode = await ensureReferralCode(dbUser.id);

      await ctx.reply("✅ <b>Ajoyib! Ro'yxatdan o'tdingiz.</b>", {
        parse_mode: 'HTML',
        ...Markup.removeKeyboard()
      });

      await ctx.reply(
        `Nima muammo bo'lyapti sizda? Yozing <i>(Masalan: suvim oqyapti, chiroq o'chdi...)</i> yoki rasm yuboring.\n\n` +
        `📱 Yoki to'g'ridan to'g'ri ilovaga o'ting👇`,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.url('📍 Usta chaqirish (Mini Ilova)', twaUrl)],
            [Markup.button.callback('🔗 Mening havolam', `my_referral_${referralCode}`), Markup.button.callback('📋 Buyurtmalarim', 'my_orders')]
          ])
        }
      );
    } catch (e) {
      console.error('Contact error:', e);
      ctx.reply("❌ Xatolik yuz berdi. Iltimos, raqamni qayta yuboring.");
    }
  });

  // ── Missing Actions ────────────────────────────────────────────────────────
  bot.action(/^my_referral_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const refCode = ctx.match[1];
    const botUsername = ctx.botInfo?.username || 'pro_fix_uz_bot';
    const refLink = `https://t.me/${botUsername}?start=ref_${refCode}`;
    
    await ctx.reply(
      `🎁 <b>Sizning taklif havolangiz:</b>\n` +
      `<code>${refLink}</code>\n\n` +
      `👉 Do'stlaringizga yuboring va bonuslarga ega bo'ling!`,
      { parse_mode: 'HTML' }
    );
  });

  bot.action('my_orders', async (ctx) => {
    await ctx.answerCbQuery();
    const twaUrl = getTwaUrl(ctx);
    await ctx.reply(
      "📋 Barcha buyurtmalaringizni to'liq ro'yxatini ko'rish uchun <b>Mini Ilovaning 'Buyurtmalar' bo'limiga</b> o'ting:",
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.url("Mening buyurtmalarim", `${twaUrl}?startapp=orders`)]
        ])
      }
    );
  });


  // ── Helper: Ask for location after AI analysis ────────────────────────────
  async function askForLocation(ctx: any, parsedRequest: ParsedRequest) {
    const userId = ctx.from.id;
    sessions.set(userId, { parsedRequest, step: 'waiting_location' });

    const { summary, categoryName, isUrgent } = parsedRequest;
    await ctx.reply(
      `✅ <b>Tushundim!</b>\n\n` +
      `📋 <b>Muammo:</b> ${summary}\n` +
      `📂 <b>Toifa:</b> ${categoryName}\n` +
      `${isUrgent ? '🚨 <b>Holat:</b> Shoshilinch!' : ''}\n\n` +
      `📍 <b>Sizga eng yaqin ustani qidirish...</b>\n\n` +
      `Quyidagilardan manzilni tanlang:`,
      {
         parse_mode: 'HTML',
         ...Markup.inlineKeyboard([
           [Markup.button.callback('📍 GPS Lokatsiyamni ulashish', 'share_location')],
           [Markup.button.callback('✏️ Qo\'lda yozaman', 'manual_address')]
         ])
      }
    );
  }

  // ── Callback: GPS ulashish so'rovi ────────────────────────────────────────
  bot.action('share_location', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      '📍 Iltimos, <b>pastdagi tugma</b> orqali joylashuvingizni yuboring:',
      {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          [Markup.button.locationRequest('📍 Joylashuvimni yuborish')]
        ]).resize().oneTime()
      }
    );
  });

  // ── Callback: Qo'lda manzil yozish ───────────────────────────────────────
  bot.action('manual_address', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      "✏️ Manzilingizni yozing <i>(Masalan: Toshkent, Yunusobod tumani...)</i>:",
      { parse_mode: 'HTML', ...Markup.removeKeyboard() }
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
      ctx.sendChatAction('typing');
      const waitMsg = await ctx.reply('⏳ Rasmni tahlil qilyapman... Bu biroz vaqt olishi mumkin ⚡️');
      const photos = ctx.message.photo;
      // Pick medium size photo (index 1 or last-1, ~300KB) instead of highest resolution (3-5MB)
      const photo = photos.length > 2 ? photos[photos.length - 2] : photos[photos.length - 1];
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const caption = ctx.message.caption || '';

      const parsedRequest = await analyzeImageWithAI(fileLink.href, caption);

      if (!parsedRequest) {
        // Vision failed: save a generic session so user can still share location
        const fallback: ParsedRequest = {
          categoryName: caption ? keywordFallbackCategory(caption) : 'Qurilish va ta\'mirlash',
          isUrgent: false,
          summary: caption || 'Rasmdan aniqlangan muammo',
        };
        sessions.set(ctx.from.id, { parsedRequest: fallback, step: 'waiting_location' });
        await ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, undefined,
          `✅ Rasmni qabul qildim!\n\n` +
          `📋 <b>Muammo:</b> ${fallback.summary}\n\n` +
          `📍 Endi sizga eng yaqin ustani topish uchun manzilingiz kerak.\n` +
          `Quyidagilardan birini tanlang:`,
          {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '📍 GPS Lokatsiyamni ulashish', callback_data: 'share_location' }],
                [{ text: '✏️ Qo\'lda yozaman', callback_data: 'manual_address' }]
              ]
            }
          });
        return;
      }

      await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id);
      await askForLocation(ctx, parsedRequest);
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Kechirasiz, rasmni o'qishda xatolik! Muammoingizni matnda yozib yuboring.");
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
      const waitMsg = await ctx.reply(`🔍 <b>"${text}"</b> doirasida ustalar qidirilmoqda...`, { parse_mode: 'HTML' });
      ctx.sendChatAction('find_location');
      await findAndSendSpecialists(ctx, session.parsedRequest, { textAddress: text }, waitMsg.message_id);
      return;
    }

    // Checking if phone registration is missing logic
    if (session && session.step === 'waiting_contact') {
       return ctx.reply("Iltimos, avval raqamingizni ulashing 📱", Markup.keyboard([
         [Markup.button.contactRequest('📱 Telefon raqamni ulashish')]
       ]).resize().oneTime());
    }

    // Otherwise, treat as new problem description
    try {
      ctx.sendChatAction('typing');
      const waitMsg = await ctx.reply('🤖 <b>Aqlli yordamchi</b> murojaatni o\'rganib chiqmoqda...', { parse_mode: 'HTML' });
      const parsedRequest = await analyzeTextWithAI(text);
      if (!parsedRequest) {
        return ctx.telegram.editMessageText(ctx.chat.id, waitMsg.message_id, undefined,
          "Tushuna olmadim 😕. Muammoingizni aniqroq yozib yuboring.");
      }
      await ctx.telegram.deleteMessage(ctx.chat.id, waitMsg.message_id);
      await askForLocation(ctx, parsedRequest);
    } catch (err) {
      console.error(err);
      ctx.reply('❌ Kechirasiz, xabarni tahlil qilishda xatolik yuz berdi 😟.');
    }
  });

  // ── Core: Find specialists by category + location ─────────────────────────
  async function findAndSendSpecialists(
    ctx: any,
    parsedRequest: ParsedRequest,
    location: { lat?: number; lng?: number; cityName?: string; textAddress?: string },
    waitMsgId: number
  ) {
    try {
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
        await ctx.reply('❌ Afsuski, bu toifada ustalar topilmadi.');
        return;
      }

      // 2. Find all specialists in that category
      const services = await prisma.service.findMany({
        where: { categoryId: matchedCategory.id },
        include: { specialist: { include: { user: true } } }
      });

      let specialists = services
        .filter((s: any) => s.specialist.isVerified)
        .map((s: any) => s.specialist);

      // 3. Sort by location
      let specialistsWithDist: Array<any> = [];

      if (location.lat && location.lng) {
        specialistsWithDist = specialists
          .filter((sp: any) => sp.locationLat && sp.locationLng)
          .map((sp: any) => ({
            ...sp,
            distKm: haversine(location.lat!, location.lng!, sp.locationLat!, sp.locationLng!)
          }))
          .sort((a: any, b: any) => a.distKm - b.distKm);

        // append those without GPS coords but matching city text
        const withoutCoords = specialists
          .filter((sp: any) => !sp.locationLat || !sp.locationLng)
          .filter((sp: any) =>
            location.cityName && sp.location?.toLowerCase().includes(location.cityName.toLowerCase())
          )
          .map((sp: any) => ({ ...sp, distKm: undefined }));

        specialistsWithDist = [...specialistsWithDist, ...withoutCoords];

        // If still empty, show all (no location data in DB yet)
        if (specialistsWithDist.length === 0) {
          specialistsWithDist = specialists.map((sp: any) => ({ ...sp, distKm: undefined }));
        }
      } else {
        const lower = (location.textAddress || '').toLowerCase();
        specialistsWithDist = lower
          ? specialists.filter((sp: any) => sp.location?.toLowerCase().includes(lower))
                       .map((sp: any) => ({ ...sp, distKm: undefined }))
          : [];
        if (specialistsWithDist.length === 0) {
          specialistsWithDist = specialists.map((sp: any) => ({ ...sp, distKm: undefined }));
        }
      }

      const top3 = specialistsWithDist.slice(0, 3);
      const twaUrl = getTwaUrl(ctx);

      // Use HTML for beautiful replies
      let replyText = `✅ <b>Buyurtma tayyor:</b>\n\n`;
      replyText += `📝 <b>Muammo:</b> ${summary}\n`;
      replyText += `📂 <b>Toifa:</b> ${matchedCategory.name}\n`;
      if (location.cityName) replyText += `📍 <b>Hudud:</b> ${location.cityName}\n`;
      if (location.textAddress) replyText += `📍 <b>Manzil:</b> ${location.textAddress}\n`;
      if (isUrgent) replyText += `🚨 <b>Holat: Shoshilinch!</b>\n`;
      replyText += `\n👨‍🔧 <b>Sizga eng mos ustalar:</b>\n`;

      const buttons: any[] = [];
      if (top3.length > 0) {
        top3.forEach((sp: any, idx: number) => {
          const rating = sp.rating > 0 ? `${sp.rating.toFixed(1)}⭐️` : 'Yangi';
          const dist = sp.distKm != null ? ` · ${sp.distKm.toFixed(1)} km` : '';
          const loc = sp.location ? ` (${sp.location})` : '';
          replyText += `\n<b>${idx + 1}. ${sp.user?.name || 'Usta'}</b>\n`;
          replyText += `  └ ${rating}${dist}${loc}\n`;
          
          const btnText = `👨‍🔧 ${sp.user?.name || 'Usta'} ni tanlash`;
          const btnUrl = `${twaUrl}?startapp=specialist_${sp.id}`;
          buttons.push([Markup.button.url(btnText, btnUrl)]);
        });
        
        buttons.push([Markup.button.url('↗️ Ilovada davom etish', twaUrl)]);
      } else {
        replyText += `\nAfsuski, bu hududda hozircha mos ustalar topilmadi 😔.\nBoshqa hududdan izlab ko'rishingiz mumkin yoki tegishli ustalarga ariza qoldiring:`;
        buttons.push([Markup.button.url('📝 Ariza qoldirish', `${twaUrl}?startapp=create_order`)]);
      }

      // Try edit, fall back to fresh reply if it fails
      try {
        await ctx.telegram.editMessageText(ctx.chat.id, waitMsgId, undefined, replyText, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: buttons }
        });
      } catch {
        await ctx.reply(replyText, {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard(buttons)
        });
      }
    } catch (err: any) {
      console.error('findAndSendSpecialists error:', err?.message || err);
      try {
        await ctx.telegram.editMessageText(ctx.chat.id, waitMsgId, undefined,
          '❌ Ustalarni qidirishda xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
      } catch {
        await ctx.reply('❌ Ustalarni qidirishda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
      }
    }
  }

  // Start bot
  bot.launch().then(() => console.log('🤖 Telegram Bot ishga tushdi!')).catch(console.error);
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
};
