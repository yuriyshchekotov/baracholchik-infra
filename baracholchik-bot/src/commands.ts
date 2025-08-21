import type { Command } from './types';
import UserManager from './db/UserManager';

const commands: Command[] = [
    { command: 'start', description: 'Список доступных команд' },
    { command: 'help', description: 'Справка по командам' },
    { command: 'subscribe', description: 'Подписаться на рассылку', permission: 'user_casual' },
    { command: 'notify', description: 'Отправить тестовое сообщение подписчикам (для разработчиков)', permission: 'admin_all' },
    { command: 'search', description: 'Найти в основной базе ключевые слова. Поддерживает --and и --or, по умолчанию --or. Пример: /search -and робот пылесос робот-пылесос', permission: 'admin_all' },
    { command: 'chats', description: 'Просмотр информации о чатах', permission: 'admin_all' },
    { command: 'permit', description: 'Выдать права пользователю', permission: 'admin_all' },
    { command: 'forbid', description: 'Отозвать права у пользователя', permission: 'admin_all' },
    { command: 'subscriptions', description: 'Посмотреть список активных фильтров-подписок', permission: 'user_casual' },
    { command: 'unsubscribe', description: 'Отписаться от одного или нескольких фильтров по ID или имени', permission: 'user_casual' },
    { command: 'unsubscribeall', description: 'Отписаться ото всех фильтров', permission: 'user_casual' }
];

/**
 * Get available commands for a specific user based on their permissions
 */
export function getAvailableCommands(userId: number): Command[] {
    const user = UserManager.getById(userId);
    
    const availableCommands = commands.filter(cmd => {
        // Public commands (no permission required)
        if (!cmd.permission) {
            return true;
        }
        
        // Check if user has the required permission
        return user && user.hasPermission(cmd.permission);
    });
    
    console.log(`📋 Доступные команды для пользователя ${userId}:`, availableCommands.map(c => c.command));
    
    return availableCommands;
}

export default commands; 