import { Telegraf, Markup } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { analyzeTextWithAI, analyzeImageWithAI } from './ai.service';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const botToken = process.env.TELEGRAM_BOT_TOKEN;

// Default to a placeholder if not set. Real TWA URL looks like: https://t.me/YourBotName/appName
const TWA_URL = process.env.VITE_CLIENT_URL || 'https://t.me/pro_fix_uz_bot/app'; 

export const setupBot = () => {
  if (!botToken) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN topilmadi! Bot ishga tushmadi.');
    return null;
  }

  const bot = new Telegraf(botToken);

  bot.start((ctx) => {
    ctx.reply(
      `Assalomu alaykum, ${ctx.from.first_name}! 👋\n\nMen **ProFix.uz** aqlli yordamchisiman. Sizga qanday usta kerakligini ayting yoki buzilgan narsangizning rasmini jo'nating. Men o'zim sizga eng zo'r ustani topib beraman! 🤖🛠️`,
      Markup.inlineKeyboard([
        Markup.button.url("Ilovani ochish 📱", TWA_URL)
      ])
    );
  });

  // Handle Photos
  bot.on('photo', async (ctx) => {
    try {
      const waitMsg = await ctx.reply("⏳ Rasmni tahlil qilyapman, biroz kuting...");
      
      const photo = ctx.message.photo[ctx.message.photo.length - 1]; // Highest resolution
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const caption = ctx.message.caption || "";

      const parsedRequest = await analyzeImageWithAI(fileLink.href, caption);
      await handleFindSpecialists(ctx, parsedRequest, waitMsg.message_id);

    } catch (error) {
      console.error(error);
      ctx.reply("Kechirasiz, rasmni o'qishda xatolik yuz berdi 😟.");
    }
  });

  // Handle Text
  bot.on('text', async (ctx) => {
    try {
      const waitMsg = await ctx.reply("⏳ Xabaringizni tahlil qilyapman, biroz kuting...");
      const text = ctx.message.text;

      const parsedRequest = await analyzeTextWithAI(text);
      await handleFindSpecialists(ctx, parsedRequest, waitMsg.message_id);

    } catch (error) {
      console.error(error);
      ctx.reply("Kechirasiz, xabarni tahlil qilishda xatolik yuz berdi 😟.");
    }
  });

  async function handleFindSpecialists(ctx: any, parsedRequest: any, waitMsgId: number) {
    if (!parsedRequest) {
      return ctx.telegram.editMessageText(ctx.chat.id, waitMsgId, undefined, "Kechirasiz, men muammoingizni to'liq tushuna olmadim. Iltimos, boshqacharoq yozib ko'ring yoki Web App dan foydalaning.");
    }

    const { categoryName, isUrgent, summary } = parsedRequest;

    // Search Database for matching category
    // Using string matching logic for robust selection (since Gemini might output slight variations)
    const categories = await prisma.category.findMany();
    const matchedCategory = categories.find(c => 
      c.name.toLowerCase().includes(categoryName.toLowerCase()) || 
      categoryName.toLowerCase().includes(c.name.toLowerCase())
    ) || categories[0]; // fallback

    if (!matchedCategory) {
      return ctx.telegram.editMessageText(ctx.chat.id, waitMsgId, undefined, `Afsuski, biznesimizda ${categoryName} bo'yicha ustalar topilmadi. Boshqa toifadan izlab ko'ring!`);
    }

    // Find verified specialists in this category
    const services = await prisma.service.findMany({
      where: { categoryId: matchedCategory.id },
      include: { 
        specialist: {
          include: { user: true }
        }
      },
      take: 3
    });

    const specialists = services.filter(s => s.specialist.isVerified).map(s => s.specialist);

    let replyText = `✅ **Muammo:** ${summary}\n`;
    replyText += `📂 **Toifa:** ${matchedCategory.name}\n`;
    if (isUrgent) replyText += `🚨 **Diqqat!** Holatingiz shoshilinch baholandi.\n`;
    
    replyText += `\nSizga shu soha bo'yicha quyidagi mutaxassislarni taklif qila olaman:\n`;

    const buttons = [];
    if (specialists.length > 0) {
      specialists.forEach((sp, idx) => {
        const ratingStr = sp.rating > 0 ? `${sp.rating} ⭐` : 'Yangi';
        replyText += `\n${idx + 1}. **${sp.user.name || 'Usta'}** (${ratingStr})`;
        
        // Button that opens the specific specialist profile in the Web App
        // Telegram Web App URLs can pass startapp parameter
        // Example: https://t.me/pro_fix_uz_bot/app?startapp=specialist_12345
        buttons.push([Markup.button.url(`👨‍🔧 ${sp.user.name} ga buyurtma`, `${TWA_URL}?startapp=specialist_${sp.id}`)]);
      });
    } else {
      replyText += `\nHozircha ushbu toifada bo'sh ustalar yo'q. Boshqalarni ko'rish uchun ilovaga kiring.`;
      buttons.push([Markup.button.url("Barcha ustalar 👨‍🔧", TWA_URL)]);
    }

    await ctx.telegram.editMessageText(ctx.chat.id, waitMsgId, undefined, replyText, {
       parse_mode: 'Markdown',
       reply_markup: {
         inline_keyboard: buttons
       }
    });
  }

  // Start the bot
  bot.launch().then(() => {
    console.log('🤖 Telegram Bot ishga tushdi!');
  }).catch(console.error);

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
};
