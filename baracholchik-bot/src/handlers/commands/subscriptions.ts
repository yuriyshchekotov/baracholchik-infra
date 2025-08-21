import type { BotContext } from '../../types';
import UserManager from '../../db/UserManager';
import FilterManager from '../../db/FilterManager';

const subscriptionsCommand = async (ctx: BotContext): Promise<void> => {
  if (!ctx.from?.id) {
    await ctx.reply('Ошибка: не удалось определить пользователя');
    return;
  }

  const userId = ctx.from.id;
  const user = UserManager.getById(userId) || UserManager.addUserIfNotExists(userId);
  const userFilters = user.filters;

  if (!userFilters || userFilters.length === 0) {
    await ctx.reply(
      'Активных фильтров нет.\n' +
      'Чтобы подписаться на фильтр — используйте команду /subscribe и ключевое слово.'
    );
    return;
  }

  const lines = ['Ваши активные фильтры:'];

  for (const filterId of userFilters) {
    const filter = FilterManager.getById(filterId);
    if (filter) {
      lines.push(`${filter.id} — ${filter.name}`);
    } else {
      lines.push(`${filterId} — [неизвестный фильтр]`);
    }
  }

  lines.push('');
  lines.push('Чтобы подписаться на новый фильтр — используйте команду /subscribe и ключевое слово.');
  lines.push('Чтобы отписаться от всех фильтров — используйте команду /unsubscribe-all.');
  lines.push('Чтобы отписаться от конкретных фильтров — используйте команду /unsubscribe и id или имена одного или нескольких фильтров.');

  await ctx.reply(lines.join('\n'));
};

export default subscriptionsCommand; 