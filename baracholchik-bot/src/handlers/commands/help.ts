import type { BotContext } from '../../types';
import { getAvailableCommands } from '../../commands';

const helpCommand = (ctx: BotContext): void => {
  const userId = ctx.from?.id;
  if (!userId) {
    ctx.reply('Ошибка: не удалось определить пользователя.');
    return;
  }

  const availableCommands = getAvailableCommands(userId);
  let response = 'Справка по командам:\n\n';
  availableCommands.forEach((cmd) => {
    response += `/${cmd.command} – ${cmd.description}\n`;
  });

  ctx.reply(response);
};

export default helpCommand; 