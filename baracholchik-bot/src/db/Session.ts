

import type { DialogCommand, SessionStep } from '../types';


export interface SessionConstructor {
  userId: number;
  command: DialogCommand;
  step?: SessionStep;
  data?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

class Session {
  public userId: number;
  public command: DialogCommand;
  public step: SessionStep;
  public data: Record<string, any>;
  public createdAt: string;
  public updatedAt: string;

  constructor({ userId, command, step = 'start', data = {}, createdAt, updatedAt }: SessionConstructor) {
    this.userId = userId;
    this.command = command;
    this.step = step;
    this.data = data;
    const now = new Date().toISOString();
    this.createdAt = createdAt || now;
    this.updatedAt = updatedAt || now;
  }

  update(partial: Partial<Pick<Session, 'step' | 'data'>>): void {
    if (partial.step) this.step = partial.step;
    if (partial.data) this.data = { ...this.data, ...partial.data };
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): Record<string, any> {
    return {
      userId: this.userId,
      command: this.command,
      step: this.step,
      data: this.data,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export default Session;
export type { Session };