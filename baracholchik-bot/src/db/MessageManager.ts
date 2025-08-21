import fs from 'fs';
import path from 'path';
import Message from './Message';
import type { MessageData } from '../types';

// Fix the path to point to the source data directory, not the dist directory
const DB_PATH = path.join(process.cwd(), 'data/messages.json');

class MessageManager {
  private messages: Message[] = [];

  constructor() {
    this.ensureDbFile();
    this.loadMessages();
  }

  private ensureDbFile(): void {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, '[]', 'utf-8');
    }
  }

  private loadMessages(): void {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      const rawMessages: MessageData[] = JSON.parse(data);
      this.messages = rawMessages.map(obj => new Message(obj));
    } catch (error) {
      console.error('Error loading messages:', error);
      this.messages = [];
    }
  }

  private saveAll(): void {
    const plain: MessageData[] = this.messages.map(m => ({
      messageId: m.messageId,
      chatId: m.chatId,
      from: m.from,
      text: m.text,
      date: m.date
    }));
    fs.writeFileSync(DB_PATH, JSON.stringify(plain, null, 2), 'utf-8');
  }

  addMessage(message: Message): void {
    this.messages.push(message);
    this.saveAll();
  }

  getLatestMessages(count: number = 5): Message[] {
    return [...this.messages].slice(-count).reverse();
  }
}

export default new MessageManager();