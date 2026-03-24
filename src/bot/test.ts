import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log("No token found");
  process.exit();
}

console.log("Token:", token.substring(0, 10) + "...");
const bot = new Telegraf(token);
bot.start((ctx) => ctx.reply('Test success'));

bot.launch().then(() => {
  console.log("Bot launched successfully!");
  process.exit(0);
}).catch(err => {
  console.error("Failed to launch:", err);
  process.exit(1);
});
