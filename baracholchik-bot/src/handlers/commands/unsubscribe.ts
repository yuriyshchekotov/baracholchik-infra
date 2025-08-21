import type { BotContext } from '../../types';
import UserManager from '../../db/UserManager';
import FilterManager from '../../db/FilterManager';
import Filter from '../../db/Filter';

const unsubscribeCommand = async (ctx: BotContext): Promise<void> => {
  if (!ctx.from?.id) {
    await ctx.reply('Ошибка: не удалось определить пользователя');
    return;
  }

  if (!ctx.message || !('text' in ctx.message)) {
    await ctx.reply('Ошибка: сообщение не содержит текст');
    return;
  }

  const userId = ctx.from.id;
  const args = ctx.message.text.split(' ').slice(1);

  if (args.length === 0) {
    await ctx.reply('Укажите хотя бы один ID или имя фильтра для отписки.\nПример: /unsubscribe 5 велосипед');
    return;
  }

  const user = UserManager.getById(userId) || UserManager.addUserIfNotExists(userId);

  const allUserFilters = user.filters.map(id => FilterManager.getById(id)).filter((f): f is Filter => f !== undefined);
  const toRemove: string[] = [];

  for (const arg of args) {
    const asNumber = parseInt(arg, 10);
    if (!isNaN(asNumber)) {
      if (user.filters.includes(arg)) {
        toRemove.push(arg);
      }
    } else {
      const match = allUserFilters.find(f => f.name.toLowerCase() === arg.toLowerCase());
      if (match) {
        toRemove.push(match.id);
      }
    }
  }

  if (toRemove.length === 0) {
    await ctx.reply('Фильтры не найдены среди ваших активных подписок.');
    return;
  }

  const removedNames: string[] = [];
  for (const id of toRemove) {
    user.unsubscribeFrom(id);
    const filter = FilterManager.getById(id);
    if (filter) {
      removedNames.push(filter.name);
    }
  }

  UserManager.saveUser(user);

  await ctx.reply(`Вы отписались от фильтров: ${removedNames.join(', ')}`);
};

export default unsubscribeCommand; 