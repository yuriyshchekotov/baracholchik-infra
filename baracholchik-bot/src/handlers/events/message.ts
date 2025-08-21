import SessionManager from '../../db/SessionManager';
import handleSubscribeDialog from '../dialogs/subscribeDialog';
import type { BotContext } from '../../types';
import MessageManager from '../../db/MessageManager';
import ChatManager from '../../db/ChatManager';
import Message from '../../db/Message';
import filterTrigger from '../triggers/filterTrigger';

console.log('📨 Вошли в messageEventHandler');

const messageEventHandler = async (ctx: BotContext): Promise<void> => {
  if (!ctx.message) {
    return;
  }

  const msg = ctx.message;
  if ('chat' in msg && msg.chat.type !== 'private') {
    ChatManager.addIfNotExists({
      id: msg.chat.id,
      title: msg.chat.title || '(без названия)',
      type: msg.chat.type,
    });
  }

  if (!msg || (!('text' in msg) && !('caption' in msg))) {
    // Пока обрабатываем только текстовые и подписанные медиа-сообщения
    return;
  }

  const text = ('text' in msg ? msg.text : '') || ('caption' in msg ? msg.caption : '') || '';
  const from = msg.from?.username || msg.from?.first_name || 'unknown';
  const chatId = msg.chat.id;

  console.log(`[${chatId}] ${from}: ${text}`);

  const userId = msg.from?.id;
  if (userId && SessionManager.has(userId)) {
    const session = SessionManager.get(userId);
    if (session?.command === 'subscribe') {
      await handleSubscribeDialog(ctx, session);
      return;
    }
  }

  const newMessage = new Message({
    messageId: msg.message_id,
    chatId,
    from: {
      id: msg.from?.id || 0,
      username: msg.from?.username,
      first_name: msg.from?.first_name,
      last_name: msg.from?.last_name
    },
    text,
    date: new Date(msg.date * 1000).toISOString()
  });

  // Сохраняем сообщение в базу
  MessageManager.addMessage(newMessage);

  // Передаём сообщение в фильтровщик
  await filterTrigger(ctx, newMessage);
};

export default messageEventHandler; 