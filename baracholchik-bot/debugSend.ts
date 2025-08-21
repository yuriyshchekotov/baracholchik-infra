import 'dotenv/config';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Укажи chatId второго пользователя
const chatId = 5553361186;
bot.telegram.sendMessage(chatId, 'Тестовое сообщение напрямую')
  .then(() => console.log('✅ Успешно отправлено'))
  .catch((err) => console.error('❌ Ошибка при отправке:', err)); 