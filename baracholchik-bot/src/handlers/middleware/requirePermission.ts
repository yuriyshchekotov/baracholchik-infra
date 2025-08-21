import type { BotContext, MiddlewareFunction } from '../../types';
import UserManager from '../../db/UserManager';

const requirePermission = (permissionName: string): MiddlewareFunction => {
  return async (ctx: BotContext, next: () => Promise<void>) => {
    const userId = ctx.from?.id;
    if (!userId) {
      console.log('❌ No user ID found in context');
      await ctx.reply('Ошибка: не удалось определить пользователя');
      return;
    }

    const user = UserManager.getById(userId) || UserManager.addUserIfNotExists(userId);

    if (!user.hasPermission(permissionName)) {
      console.log(`❌ Permission denied: User ${userId} doesn't have permission '${permissionName}'`);
      await ctx.reply('У вас нет прав для выполнения этой команды 🔒');
      return;
    }

    await next();
  };
};

export default requirePermission;