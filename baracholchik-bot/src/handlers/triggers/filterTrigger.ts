import type { BotContext } from '../../types';
import FilterManager from '../../db/FilterManager';
import Message from '../../db/Message';
import Filter from '../../db/Filter';
import notifyNewFilteredTrigger from './notifyNewFilteredTrigger';

const filterTrigger = async (ctx: BotContext, message: Message): Promise<void> => {
  if (!message || !message.text) {
    return; // Нет текста — нечего фильтровать
  }

  const matchingFilters = FilterManager.getMatching(message.text);

  if (matchingFilters.length === 0) {
    return; // Нет сработавших фильтров — дальше не идём
  }

  for (const filter of matchingFilters) {
    await notifyNewFilteredTrigger(ctx, message, filter);
  }
};

export default filterTrigger; 