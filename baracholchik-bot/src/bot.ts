import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import type { BotContext, HandlerFunction } from './types';
import startCommand from './handlers/commands/start';
import helpCommand from './handlers/commands/help';
import subscribeCommand from './handlers/commands/subscribe';
import notifyCommand from './handlers/commands/notify';
import searchCommand from './handlers/commands/search';
import chatsCommand from './handlers/commands/chats';
import permitCommand from './handlers/commands/permit';
import forbidCommand from './handlers/commands/forbid';
import subscriptionsCommand from './handlers/commands/subscriptions';
import unsubscribeCommand from './handlers/commands/unsubscribe';
import unsubscribeAllCommand from './handlers/commands/unsubscribeall';
import messageEventHandler from './handlers/events/message';
import myChatMemberHandler from './handlers/events/myChatMember';
import requirePermission from './handlers/middleware/requirePermission';
import ensureUser from './handlers/middleware/ensureUser';
import handleCallbackQuery from './handlers/callbacks/handleCallbackQuery';
import { getAvailableCommands } from './commands';

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN!);
console.log('🤖 Бот инициализирован');

/**
 * Clear commands for a specific user
 */
async function clearUserCommands(userId: number): Promise<void> {
  try {
    await bot.telegram.setMyCommands([], {
      scope: { type: 'chat', chat_id: userId }
    });
    console.log(`🗑️ Команды очищены для пользователя ${userId}`);
  } catch (error) {
    console.error(`❌ Ошибка очистки команд для пользователя ${userId}:`, error);
  }
}

/**
 * Set available commands for a specific user based on their permissions
 */
async function setUserCommands(userId: number): Promise<void> {
  try {
    const availableCommands = getAvailableCommands(userId);
    const commandsForTelegram = availableCommands.map(cmd => ({
      command: cmd.command,
      description: cmd.description
    }));

    // Filter out commands that might cause issues with Telegram API
    const validCommands = commandsForTelegram.filter(cmd => {
      // Telegram doesn't support commands with hyphens or special characters
      return /^[a-zA-Z0-9_]+$/.test(cmd.command);
    });

    if (validCommands.length === 0) {
      console.log(`⚠️ Нет валидных команд для пользователя ${userId}`);
      return;
    }

    await bot.telegram.setMyCommands(validCommands, {
      scope: { type: 'chat', chat_id: userId }
    });

    console.log(`📋 Установлены команды для пользователя ${userId}:`, validCommands.map(c => c.command));
  } catch (error) {
    console.error(`❌ Ошибка установки команд для пользователя ${userId}:`, error);
  }
}

/**
 * Middleware to update user commands on each message
 */
async function updateUserCommandsMiddleware(ctx: BotContext, next: () => Promise<void>): Promise<void> {
  const userId = ctx.from?.id;
  if (userId && ctx.message && 'text' in ctx.message) {
    console.log(`🔄 Обновление команд для пользователя ${userId}`);
    // Clear commands first, then set new ones
    await clearUserCommands(userId);
    await setUserCommands(userId);
  }
  await next();
}

// --- Глобальный middleware ---
bot.use(ensureUser);

// --- Команды и требуемые для них права доступа ---
bot.command('start', requirePermission('user_casual'), startCommand);
bot.command('help', requirePermission('user_casual'), helpCommand);
bot.command('subscriptions', requirePermission('user_casual'), subscriptionsCommand);
bot.command('subscribe', requirePermission('user_casual'), subscribeCommand);
bot.command('unsubscribe', requirePermission('user_casual'), unsubscribeCommand);
bot.command('unsubscribeall', requirePermission('user_casual'), unsubscribeAllCommand);
bot.command('notify', requirePermission('admin_all'), notifyCommand);
bot.command('search', requirePermission('admin_all'), searchCommand);
bot.command('chats', requirePermission('admin_all'), chatsCommand);
bot.command('permit', requirePermission('admin_all'), permitCommand);
bot.command('forbid', requirePermission('admin_all'), forbidCommand);

// --- Обработка неизвестных команд ---
bot.on(message('text'), async (ctx, next) => {
  console.log(`📥 Получено текстовое сообщение: ${ctx.message.text}`);
  const text = ctx.message.text;
  const userId = ctx.from?.id;
  
  if (text.startsWith('/') && userId) {
    const availableCommands = getAvailableCommands(userId);
    const knownCommands = availableCommands.map(cmd => cmd.command);
    const command = text.split(' ')[0].substring(1);

    if (!knownCommands.includes(command)) {
      await ctx.reply('Команда не распознана 🤷‍♂️');
      return;
    }
  }

  await next();
});

// --- Обработка событий ---
bot.on(message('text'), updateUserCommandsMiddleware, messageEventHandler);
bot.on('my_chat_member', myChatMemberHandler);
bot.on('callback_query', handleCallbackQuery);

console.log('📦 Команды загружены и обработчики установлены');
bot.on('message', (ctx) => {
  console.log('📨 Поймано событие message:', ctx.message);
});

export default bot; 