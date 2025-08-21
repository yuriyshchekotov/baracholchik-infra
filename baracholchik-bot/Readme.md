# 🛠 Telegram Bot — Filtered Notifications & Access Control (Learning Project)

### Version: `v0.2`

This is a **learning-focused Node.js Telegram bot**, built to help understand and experiment with fundamental architecture patterns in JavaScript-based backend development. The bot processes messages from group chats, supports keyword-based filters, and implements a simple, extendable permission system.

> ⚠️ This is not intended for production use. Some components (e.g., permissions) are implemented in a simplified way for clarity and educational purposes.

---

## ✅ Features

### 🔍 Filtered Message Notifications
- Each user can subscribe to keyword-based filters.
- Filters are created automatically if a matching one doesn't exist.
- Every new message is checked against all filters (in memory).
- If matched, all subscribed users receive a notification.

### 💬 Chat Tracking
- The bot records every group, supergroup, or channel it joins or receives a message from.
- For each chat, it stores:
  - `id`, `title`, `type` (`group`, `supergroup`, or `channel`)
  - `follow`: whether the bot currently listens to this chat
  - `joinedAt` and `leftAt`: timestamps for when the bot entered or exited
- Rejoining a chat reactivates tracking.

### 🔐 Permissions (basic & conditional)
- A simple permission system associates each user with permission names like `admin_all`.
- Most bot commands are restricted and require the `admin_all` permission.
- This structure is provisional and can evolve into a more robust RBAC model.

---

## 💬 Commands

### Public:
- `/start` — welcome message
- `/help` — show list of commands

### Admin-only (`admin_all` required):
- `/subscribe <words>` — subscribe to keyword filter (AND/OR logic supported)
- `/notify` — trigger a test notification
- `/search <filter>` — placeholder for future message search by filter
- `/chats` — list all followed chats
- `/permit <userId> <permission>` — grant a permission to a user
- `/forbid <userId> <permission>` — remove a permission from a user

---

## 🧱 Project Structure

```bash
.
├── Dockerfile
├── Readme.md
├── data
│   ├── chats.json
│   ├── filters.json
│   ├── messages.json
│   ├── permissions.json
│   └── users.json
├── debugSend.ts
├── index.ts
├── package.json
├── src
│   ├── bot.ts
│   ├── commands.ts
│   ├── db
│   │   ├── ChatManager.ts
│   │   ├── Filter.ts
│   │   ├── FilterManager.ts
│   │   ├── Message.ts
│   │   ├── MessageManager.ts
│   │   ├── Session.ts
│   │   ├── SessionManager.ts
│   │   ├── User.ts
│   │   └── UserManager.ts
│   ├── handlers
│   │   ├── callbacks
│   │   ├── commands
│   │   │   ├── chats.ts
│   │   │   ├── forbid.ts
│   │   │   ├── help.ts
│   │   │   ├── notify.ts
│   │   │   ├── permit.ts
│   │   │   ├── search.ts
│   │   │   ├── start.ts
│   │   │   ├── subscribe.ts
│   │   │   ├── subscriptions.ts
│   │   │   ├── unsubscribe-all.ts
│   │   │   └── unsubscribe.ts
│   │   ├── dialogs
│   │   │   └── subscribeDialog.ts
│   │   ├── errors
│   │   ├── events
│   │   │   ├── message.ts
│   │   │   └── myChatMember.ts
│   │   ├── middleware
│   │   │   └── requirePermission.ts
│   │   └── triggers
│   │       ├── filterTrigger.ts
│   │       ├── notifyNewFilteredTrigger.ts
│   │       └── subscribe-triggers.ts
│   └── types
│       └── index.ts
└── tsconfig.json

```

---

## 🚀 Goals & Learning Focus

This bot is a step-by-step exercise in:
- Organizing modular code with responsibilities split across layers
- Working with structured JSON-based data instead of databases (for now)
- Building scalable patterns like managers, triggers, and permissions
- Understanding the Telegram bot API through real interaction

Future iterations may replace JSON storage with a real database and support more complex access control.

---

## 🧪 Status

- ✅ Core logic (messages, filters, chats, permissions)
- ⚠️ Some features are placeholders or simplified (e.g., `search`, `filtered.json`)
- 🧩 Actively evolving — new ideas added regularly

---

> Made for learning. Feedback and improvements welcome.