import fs from 'fs';
import path from 'path';

// Fix the path to point to the source data directory, not the dist directory
const DB_PATH = path.join(process.cwd(), 'data/chats.json');

interface Chat {
  id: number;
  title: string;
  type: string;
  follow: boolean;
  joinedAt: string;
  leftAt: string | null;
}

interface AddChatParams {
  id: number;
  title: string;
  type: string;
}

class ChatManager {
  private chats: Chat[] = [];

  constructor() {
    this.ensureDbFile();
    this.loadChats();
  }

  private ensureDbFile(): void {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, '[]', 'utf-8');
    }
  }

  private loadChats(): void {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      this.chats = JSON.parse(data);
    } catch (error) {
      console.error('Error loading chats:', error);
      this.chats = [];
    }
  }

  private saveChats(): void {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.chats, null, 2), 'utf-8');
  }

  getById(id: number): Chat | undefined {
    return this.chats.find(chat => chat.id === id);
  }

  addIfNotExists({ id, title, type }: AddChatParams): Chat {
    let chat = this.getById(id);
    if (!chat) {
      chat = {
        id,
        title,
        type,
        follow: true,
        joinedAt: new Date().toISOString(),
        leftAt: null
      };
      this.chats.push(chat);
      this.saveChats();
    }
    return chat;
  }

  setFollow(chatId: number, bool: boolean): void {
    const chat = this.getById(chatId);
    if (chat) {
      chat.follow = bool;
      if (bool) {
        chat.joinedAt = new Date().toISOString();
        chat.leftAt = null;
      } else {
        chat.leftAt = new Date().toISOString();
      }
      this.saveChats();
    }
  }

  getFollowedChats(): Chat[] {
    return this.chats.filter(chat => chat.follow);
  }
}

export default new ChatManager(); 