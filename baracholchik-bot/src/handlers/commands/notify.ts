import type { BotContext } from '../../types';
import UserManager from '../../db/UserManager';
import FilterManager from '../../db/FilterManager';

const notifyCommand = async (ctx: BotContext): Promise<void> => {
  if (!ctx.message || !('text' in ctx.message)) {
    await ctx.reply('Сообщение пустое или не текстовое.');
    return;
  }

  const messageText = ctx.message.text;
  const matchingFilters = FilterManager.getMatching(messageText);
  if (matchingFilters.length === 0) {
    await ctx.reply('Нет совпадений ни с одним фильтром.');
    return;
  }

  const matchingFilterIds = matchingFilters.map(f => f.id);
  const users = UserManager.getAll();

  const recipients = users.filter(user =>
    user.filters.some(filterId => matchingFilterIds.includes(filterId))
  );

  if (recipients.length === 0) {
    await ctx.reply('Нет подписчиков для подходящих фильтров.');
    return;
  }

  const results = await Promise.allSettled(
    recipients.map(user =>
      user.notify(ctx, `Найдено новое сообщение: ${messageText}`)
    )
  );

  const failed = results
    .map((r, i) => ({ status: r.status, reason: r.status === 'rejected' ? (r as PromiseRejectedResult).reason : undefined, chatId: recipients[i].id }))
    .filter(r => r.status === 'rejected');

  if (failed.length > 0) {
    console.log('❌ Ошибки при рассылке:');
    failed.forEach(f =>
      console.log(`- chatId ${f.chatId}: ${(f.reason as any)?.description || (f.reason as any)?.message || 'unknown error'}`)
    );
  }

  await ctx.reply(`Рассылка завершена. Сообщение отправлено ${recipients.length} пользователям, с ошибками: ${failed.length}`);
};

export default notifyCommand; 