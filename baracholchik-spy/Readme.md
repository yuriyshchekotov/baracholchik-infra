## baracholchik-spy

MVP Telegram-клиент-бот на основе userbot API, копирующей сообщения из одной группы в другую. Использует TypeScript и TelegramClient от gram.js.

forward-user-bot/
├── src/
│   ├── main.ts              # точка входа
│   ├── telegram/
│   │   ├── client.ts        # инициализация TelegramClient
│   │   └── forwarder.ts     # логика пересылки
│   └── config/
│       └── env.ts
├── .env
├── package.json
├── tsconfig.json

### 🔧 Работа с Docker

#### Сборка образа
```bash
docker build -t baracholchik-spy .
```

#### Запуск контейнера
```bash
docker-compose up -d
```

#### Проверка логов
```bash
docker-compose logs -f
```

#### Вход внутрь контейнера
```bash
docker exec -it baracholchik-spy sh
```

#### Ручной запуск для авторизации в Telegram
```bash
yarn start
```

Если бот не авторизован, он запросит номер телефона, код и пароль. После успешной авторизации будет создан и сохранён файл сессии (в volume `spybot_sessions`).