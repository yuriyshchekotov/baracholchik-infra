import type { BotContext } from '../../types';
import SessionManager from "../../db/SessionManager";
import {Session} from "../../db/Session";
import { subscribeUserToFilter } from '../triggers/subscribe-triggers';

export default async function handleSubscribeDialog(ctx: BotContext, session: Session): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId || !ctx.message || !('text' in ctx.message)) return;

  const text = ctx.message.text.trim().toLowerCase();

  console.log(`[Session] user=${userId} command=${session.command} step=${session.step}`);

  if (text === 'отмена' || text === '/cancel') {
    SessionManager.end(userId);
    await ctx.reply('Диалог подписки отменён.');
    return;
  }

  switch (session.step) {
    case 'start': {
      // This is the initial step - just ask for keywords and move to next step
      await ctx.reply('Пожалуйста, укажи хотя бы одно ключевое слово. Можно указать сразу несколько, через запятую или через пробел. Я смогу искать как строго по всем словам сразу, так и по любому из слов');
      SessionManager.update(userId, { step: 'askKeywords' });
      return;
    }
    
    case 'askKeywords': {
      const normalizedText = text.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      const keywords = normalizedText.split(' ').filter(Boolean);
      const hasCompound = normalizedText.includes('+');

      if (keywords.length === 0) {
        await ctx.reply('Пожалуйста, укажи хотя бы одно ключевое слово. Можно указать сразу несколько, через запятую или через пробел. Я смогу искать как строго по всем словам сразу, так и по любому из слов');
        return;
      }

      if (keywords.length === 1 && !hasCompound) {
        const result = subscribeUserToFilter(userId, keywords, false);
        SessionManager.end(userId);

        if (result.status === 'alreadyExists') {
          await ctx.reply('Ты уже подписан на такой фильтр.');
        } else {
          await ctx.reply(`Фильтр "${result.name}" создан и добавлен в твою подписку.`);
        }
        return;
      }

      await ctx.reply('Выбери режим фильтрации:', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'И', callback_data: 'subscribe:and' }],
            [{ text: 'ИЛИ', callback_data: 'subscribe:or' }]
          ]
        }
      });

      SessionManager.update(userId, {
        step: 'askAndOr',
        data: { keywords }
      });

      return;
    }

    case 'askAndOr': {
      const keywords = session.data?.keywords || [];
      const conjunction = text === 'и';

      // Support both button clicks (handled by callback) and text input
      if (text === 'и' || text === 'или') {
        const result = subscribeUserToFilter(userId, keywords, conjunction);
        SessionManager.end(userId);

        if (result.status === 'alreadyExists') {
          await ctx.reply('Ты уже подписан на такой фильтр.');
        } else {
          await ctx.reply(`Фильтр "${result.name}" создан и добавлен в твою подписку.`);
        }
        return;
      }

      // Invalid input - keep session active and prompt again
      await ctx.reply('Пожалуйста, ответь одним словом: *и* или *или*. Или напиши "отмена" для отмены.');
      return;
    }

    default:
      SessionManager.end(userId);
      await ctx.reply('Что-то пошло не так. Диалог завершён.');
  }
}