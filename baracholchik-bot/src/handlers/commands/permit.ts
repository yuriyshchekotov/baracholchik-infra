import type { BotContext } from '../../types';
import UserManager from '../../db/UserManager';

const permitCommand = async (ctx: BotContext): Promise<void> => {
  if (!ctx.message || !('text' in ctx.message)) {
    await ctx.reply('Ошибка: сообщение не содержит текст');
    return;
  }

  const args = ctx.message.text.split(' ').slice(1);
  if (args.length !== 2) {
    await ctx.reply('Использование: /permit <userId> <permission>');
    return;
  }

  const [userIdRaw, permission] = args;
  const userId = parseInt(userIdRaw, 10);
  if (isNaN(userId)) {
    await ctx.reply('userId должен быть числом');
    return;
  }

  const user = UserManager.getById(userId);
  if (!user) {
    await ctx.reply('Пользователь не найден');
    return;
  }

  user.permitTo(permission);
  UserManager.saveUser(user);
  await ctx.reply(`✅ Выдано право "${permission}" пользователю ${userId}`);
};

export default permitCommand; 