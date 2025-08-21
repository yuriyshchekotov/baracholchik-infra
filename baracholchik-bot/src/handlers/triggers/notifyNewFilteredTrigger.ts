import type { BotContext } from '../../types';
import UserManager from '../../db/UserManager';
import Message from '../../db/Message';
import Filter from '../../db/Filter';

function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

function extractOriginLink(text: string): string | null {
  const match = text.match(/ORIGIN:\s*(https:\/\/t\.me\/[^\s]+)/);
  return match ? match[1] : null;
}

const notifyNewFilteredTrigger = async (
    ctx: BotContext,
    message: Message,
    filter: Filter
): Promise<void> => {
  const matchingUsers = UserManager.getAll().filter(user =>
      user.hasFilter(filter.id)
  );

  if (matchingUsers.length === 0) return;

  const chatId = message.chatId;
  const messageId = message.messageId;
  const cleanText = message.text
    .split('\n')
    .filter(line => !line.startsWith('🔗 ORIGIN:'))
    .join('\n');
  const text = escapeMarkdown(cleanText);
  const filterName = escapeMarkdown(filter.name);

  const extractedLink = extractOriginLink(message.text);
  const fallbackLink = `https://t.me/c/${String(chatId).replace('-100', '')}/${messageId}`;
  const link = extractedLink || fallbackLink;

  const notification =
      `📢 Новость по теме *${filterName}*:\n` +
      `> ${text}\n\n` +
      `[Перейти к сообщению](${escapeMarkdown(link)})`;

  await Promise.allSettled(
      matchingUsers.map(user =>
          ctx.telegram.sendMessage(user.id, notification, {
            parse_mode: 'MarkdownV2',
            link_preview_options: { is_disabled: true }
          })
      )
  );
};

export default notifyNewFilteredTrigger;