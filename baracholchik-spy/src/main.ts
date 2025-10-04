import fs from "fs";
import path from "path";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import type { NewMessageEvent } from "telegram/events";
import promptSync from "prompt-sync";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

console.log(">> TARGET_CHATS =", process.env.TARGET_CHATS);

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH!;
const sessionFile = path.resolve(process.env.SESSION || "anon.txt");
let session: StringSession;

const prompt = promptSync();

async function authenticateNewSession(): Promise<TelegramClient> {
    session = new StringSession("");
    const client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => prompt("Введите номер: ")!,
        password: async () => prompt("Введите пароль (если есть): "),
        phoneCode: async () => prompt("Введите код из Telegram: "),
        onError: (err) => console.error(err),
    });

    const sessionData = (client.session && typeof client.session.save === "function") ? client.session.save() : "";
    fs.writeFileSync(sessionFile, String(sessionData));
    console.log(">> Сессия сохранена в файл:", sessionFile);

    return client;
}

async function loadClient(): Promise<TelegramClient> {
    if (fs.existsSync(sessionFile)) {
        const sessionString = fs.readFileSync(sessionFile, "utf8").trim();
        try {
            session = new StringSession(sessionString);
            console.log(">> Сессия загружена из файла.");
            const client = new TelegramClient(session, apiId, apiHash, {
                connectionRetries: 5,
            });
            await client.connect();
            if (!client.connected) throw new Error("Сессия невалидна");
            return client;
        } catch (error) {
            console.log(">> Ошибка при загрузке сессии, создаем новую:", error);
            return authenticateNewSession();
        }
    } else {
        console.log(">> Файл сессии не найден, создаем новую сессию.");
        return authenticateNewSession();
    }
}

const sourceChat = process.env.SOURCE_CHAT!;
const sourceTag = process.env.SOURCE_TAG;
const rawTargetChats = process.env.TARGET_CHATS;
if (!rawTargetChats) {
    throw new Error("TARGET_CHATS is not defined in .env");
}
const targetChats = rawTargetChats.split(",").map((s) => s.trim()).filter(Boolean);

async function main() {
    const client = await loadClient();

    await client.sendMessage("me", { message: "Я онлайн (бот-пересылка)" });

    // Разрешаем все targetChats в сущности один раз
    const resolvedTargets = await Promise.all(
        targetChats.map(async (target) => {
            try {
                const entity = await client.getEntity(target);
                console.log(`>> Целевой чат '${target}' разрешён`);
                return entity;
            } catch (err) {
                console.error(`‼️ Ошибка при разрешении '${target}':`, (err as Error).message);
                return null;
            }
        })
    );

    client.addEventHandler(async (event: NewMessageEvent) => {
        const message = event.message;

        console.log(">> Событие NewMessage:");
        console.log(" - raw text:", message.message);
        console.log(" - sender ID:", message.senderId?.toString());
        console.log(" - chat ID:", message.chatId?.toString());

        if (message.out) {
            console.log(" - пропущено: наше сообщение");
            return;
        }

        const chat = await message.getChat();
        const chatId = (chat as any)?.username || (chat as any)?.id?.toString();
        console.log(" - получен чат:", chatId);

        const messageId = message.id;
        const link = `https://t.me/${sourceTag}/${messageId}`;
        const text = `${message.message || ""}\n\n🔗 ORIGIN: ${link}`;
        console.log(`>> Поступило сообщение: \"${text}\"`);

        for (const entity of resolvedTargets) {
            if (!entity) continue;
            try {
                await client.sendMessage(entity, { message: text });
                console.log(`>> Сообщение отправлено в:`, entity);
            } catch (err) {
                console.error("‼️ Ошибка при отправке:", (err as Error).message);
            }
        }
    }, new NewMessage({}));

    console.log(`>> Бот слушает чат: ${sourceChat}`);
}

main().catch((err) => {
    console.error("‼️ Ошибка при запуске бота:", err);
    process.exit(1);
});