import type { BotContext } from '../../types';
import UserManager from '../../db/UserManager';

const unsubscribeAllCommand = async (ctx: BotContext): Promise<void> => {
  if (!ctx.from?.id) {
    await ctx.reply('Ошибка: не удалось определить пользователя');
    return;
  }

  const userId = ctx.from.id;
  const user = UserManager.getById(userId) || UserManager.addUserIfNotExists(userId);

  user.filters = [];
  UserManager.saveUser(user);

  await ctx.reply(
    'Вы отписались ото всех фильтров.\n' +
    'Чтобы подписаться на новые, используйте команду /subscribe.'
  );
};

export default unsubscribeAllCommand;
