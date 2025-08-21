import type { BotContext } from '../../types';
import ChatManager from '../../db/ChatManager';

const chatsCommand = async (ctx: BotContext): Promise<void> => {
  const chats = ChatManager.getFollowedChats();

  if (chats.length === 0) {
    await ctx.reply('Нет активных чатов.');
    return;
  }

  const lines = chats.map(chat => {
    const title = chat.title || '(без названия)';
    return `• ${title} (${chat.id}) [${chat.type}]`;
  });

  await ctx.reply(`📋 Активные чаты:\n` + lines.join('\n'));
};

export default chatsCommand; 