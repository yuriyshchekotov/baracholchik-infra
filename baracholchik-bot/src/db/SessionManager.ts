import { promises as fs } from 'fs';
import path from 'path';
import Session from './Session';
import type { Session as SessionType } from './Session';
import type { DialogCommand } from '../types';

// Fix the path to point to the source data directory, not the dist directory
const SESSIONS_PATH = path.join(process.cwd(), 'data/sessions.json');

class SessionManager {
  private sessions: Map<number, Session> = new Map();

  constructor() {
    this.loadFromFile();
  }

  start(userId: number, command: DialogCommand): Session {
    const session = new Session({ userId, command });
    this.sessions.set(userId, session);
    this.saveToFile();
    return session;
  }

  update(userId: number, updates: Partial<Pick<Session, 'step' | 'data'>>): Session | undefined {
    const session = this.sessions.get(userId);
    if (!session) return;
    session.update(updates);
    this.sessions.set(userId, session);
    this.saveToFile();
    return session;
  }

  get(userId: number): Session | undefined {
    return this.sessions.get(userId);
  }

  has(userId: number): boolean {
    return this.sessions.has(userId);
  }

  end(userId: number): void {
    if (this.sessions.has(userId)) {
      this.sessions.delete(userId);
      this.saveToFile();
    }
  }

  private async loadFromFile() {
    try {
      const content = await fs.readFile(SESSIONS_PATH, 'utf-8');
      const json = JSON.parse(content) as Record<number, SessionType>;
      for (const [key, value] of Object.entries(json)) {
        this.sessions.set(Number(key), new Session(value));
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to load sessions:', err);
      }
    }
  }

  private saveToFile() {
    const json = Object.fromEntries(
      [...this.sessions.entries()].map(([key, value]) => [key, value.toJSON()])
    );
    fs.writeFile(SESSIONS_PATH, JSON.stringify(json, null, 2))
      .catch(err => console.error('Failed to save sessions:', err));
  }
}

export default new SessionManager();