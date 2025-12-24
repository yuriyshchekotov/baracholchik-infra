import type { BotContext } from '../../types';
import { subscribeUserToFilter } from '../triggers/subscribe-triggers';
import SessionManager from '../../db/SessionManager';
import handleSubscribeDialog from '../dialogs/subscribeDialog';

const subscribeCommand = async (ctx: BotContext): Promise<void> => {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Ошибка: не удалось определить пользователя.');
    return;
  }

  // Check if user already has an active session
  if (SessionManager.has(userId)) {
    const existingSession = SessionManager.get(userId);
    const action = existingSession?.command === 'subscribe' ? 'restart' : 'reject';
    console.log(`[Subscribe] user=${userId} already in dialog: step=${existingSession?.step || 'unknown'} -> action=${action}`);
    
    if (action === 'restart') {
      // End existing subscribe session and start new one
      SessionManager.end(userId);
    } else {
      // Reject - user is in different dialog
      await ctx.reply('У тебя уже активен другой диалог. Заверши его перед началом нового.');
      return;
    }
  }

  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
  
  // Debug logging - BEFORE processing
  console.log('🔍 Subscribe command debug:');
  console.log('  Raw text:', JSON.stringify(text));
  console.log('  Text length:', text.length);
  console.log('  Text starts with /subscribe:', text.startsWith('/subscribe'));
  console.log('  Text === "/subscribe":', text === '/subscribe');
  console.log('  Full message object:', JSON.stringify(ctx.message, null, 2));
  
  const parts = text.split(' ').slice(1); // отрезаем "/subscribe"
  
  // Debug logging - AFTER splitting
  console.log('  After split:', JSON.stringify(text.split(' ')));
  console.log('  Parts:', JSON.stringify(parts));
  console.log('  Parts length:', parts.length);
  console.log('  Parts[0]:', JSON.stringify(parts[0]));
  console.log('  Parts[0] === undefined:', parts[0] === undefined);
  console.log('  Parts[0] === "":', parts[0] === '');
  
  // Check if user provided any actual keywords (not just whitespace or empty strings)
  const hasKeywords = parts.some(part => part.trim() !== '');
  console.log('  Has keywords:', hasKeywords);
  console.log('  Parts with trim check:', parts.map(part => ({ part: JSON.stringify(part), trimmed: JSON.stringify(part.trim()), isEmpty: part.trim() === '' })));

  if (!hasKeywords) {
    console.log('  ✅ Starting dialog - no keywords provided');
    // Запуск диалога
    SessionManager.start(userId, 'subscribe');
    await handleSubscribeDialog(ctx, SessionManager.get(userId)!);
    return;
  }

  console.log('  ❌ Creating filter with keywords - keywords detected');
  // Альтернативный путь (без диалога)
  const conjunction = parts.includes('-and');
  const keywords = parts
    .filter(p => p !== '-and')
    .map(k => k.includes('+') ? k.replace(/\+/g, ' ') : k);

  console.log('  Keywords:', keywords);
  console.log('  Conjunction:', conjunction);

  if (keywords.length === 0) {
    await ctx.reply('Нужно указать хотя бы одно ключевое слово.');
    return;
  }

  const result = subscribeUserToFilter(userId, keywords, conjunction);

  if (result.status === 'alreadyExists') {
    await ctx.reply('Ты уже подписан на такой фильтр.');
    return;
  }

  await ctx.reply(`Фильтр "${result.name}" создан и добавлен в твою подписку.`);
};

export default subscribeCommand;