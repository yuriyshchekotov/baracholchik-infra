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

if (fs.existsSync(sessionFile)) {
    const sessionString = fs.readFileSync(sessionFile, "utf8").trim();
    if (sessionString && sessionString.length > 0) {
        try {
            session = new StringSession(sessionString);
            console.log(">> Сессия загружена из файла.");
        } catch (error) {
            console.log(">> Ошибка при загрузке сессии, создаем новую:", error);
            session = new StringSession("");
        }
    } else {
        console.log(">> Файл сессии пуст, создаем новую сессию.");
        session = new StringSession("");
    }
} else {
    console.log(">> Файл сессии не найден, создаем новую сессию.");
    session = new StringSession("");
}

const sourceChat = process.env.SOURCE_CHAT!;
const sourceTag = process.env.SOURCE_TAG;
const rawTargetChats = process.env.TARGET_CHATS;
if (!rawTargetChats) {
    throw new Error("TARGET_CHATS is not defined in .env");
}
const targetChats = rawTargetChats.split(",").map((s) => s.trim()).filter(Boolean);

async function main() {
    const client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
    });

    const prompt = promptSync();

    await client.start({
        phoneNumber: async () => prompt("Введите номер: ")!,
        password: async () => prompt("Введите пароль (если есть): "),
        phoneCode: async () => prompt("Введите код из Telegram: "),
        onError: (err) => console.error(err),
    });

    const sessionData = (session as StringSession).save();
    fs.writeFileSync(sessionFile, sessionData);
    console.log(">> Сессия сохранена в файл:", sessionFile);

    console.log(">> Успешный вход!");
    console.log(">> Сессия сохранена:", client.session.save());

    await client.sendMessage("me", { message: "Я онлайн (бот-пересылка)" });

    // Подписка на новые сообщения
    client.addEventHandler(async (event: NewMessageEvent) => {
        const message = event.message;

        // Логируем всё, что приходит
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
        console.log(`>> Поступило сообщение: "${text}"`);

        for (const target of targetChats) {
            await client.sendMessage(target.trim(), { message: text });
            console.log(`>> Сообщение отправлено в: ${target}`);
        }
    }, new NewMessage({}));

    console.log(`>> Бот слушает чат: ${sourceChat}`);
}

main().catch((err) => {
    console.error("‼️ Ошибка при запуске бота:", err);
    process.exit(1);
});
