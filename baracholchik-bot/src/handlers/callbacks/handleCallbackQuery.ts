import SessionManager from '../../db/SessionManager';
import { subscribeUserToFilter } from '../triggers/subscribe-triggers';
import type { BotContext } from "../../types";

const handleCallbackQuery = async (ctx: BotContext): Promise<void> => {
    const callbackQuery = ctx.callbackQuery;

    if (!callbackQuery || !('data' in callbackQuery)) {
        console.warn('Получен callback_query без data');
        return;
    }

    const data = callbackQuery.data;
    console.log('🔘 Получен callback_query:', data);

    const userId = ctx.from?.id;
    if (!userId) {
        await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
        return;
    }

    // Handle subscribe dialog AND/OR selection
    if (data === 'subscribe:and' || data === 'subscribe:or') {
        const session = SessionManager.get(userId);
        const hasSession = SessionManager.has(userId);
        const sessionStep = session?.step || 'none';
        
        console.log(`[Callback] user=${userId} data=${data} sessionStep=${sessionStep} hasSession=${hasSession}`);
        
        if (!session || session.command !== 'subscribe') {
            await ctx.answerCbQuery('Сессия не найдена');
            console.log(`[Callback] done user=${userId} endedSession=false`);
            return;
        }

        const conjunction = data === 'subscribe:and';
        const keywords = session.data?.keywords || [];

        if (keywords.length === 0) {
            await ctx.answerCbQuery('Ключевые слова не найдены');
            SessionManager.end(userId);
            console.log(`[Callback] done user=${userId} endedSession=true`);
            return;
        }

        // Safely delete the message with buttons
        if (callbackQuery.message && 'message_id' in callbackQuery.message) {
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;
            await ctx.telegram.deleteMessage(chatId, messageId).catch(() => {
                // Ignore deletion errors (message might already be deleted)
            });
        }

        // Process subscription with error handling
        try {
            const result = subscribeUserToFilter(userId, keywords, conjunction);

            if (result.status === 'alreadyExists') {
                await ctx.reply('Ты уже подписан на такой фильтр.');
            } else {
                await ctx.reply(`Фильтр "${result.name}" создан и добавлен в твою подписку.`);
            }
        } catch (error) {
            console.error('Ошибка при создании фильтра:', error);
            await ctx.answerCbQuery('Произошла ошибка при создании фильтра');
            await ctx.reply('Произошла ошибка при создании фильтра. Попробуй еще раз.');
        } finally {
            // Always end the session, even if there was an error
            SessionManager.end(userId);
            console.log(`[Callback] done user=${userId} endedSession=true`);
        }

        return;
    }

    // Handle other callback queries
    await ctx.answerCbQuery('Кнопка нажата!');
};

export default handleCallbackQuery;