import { Context, Telegraf } from 'telegraf';

// Bot context type
export interface BotContext extends Context {
  // Extend with any custom properties if needed
}

// User interface
export interface UserData {
  id: number;
  filters: string[];
  permissions: string[];
}

// Filter interface
export interface FilterData {
  id: string;
  name: string;
  keywords: string[];
  regex: string[];
  conjunction: boolean;
}

// Message interface
export interface MessageData {
  messageId: number;
  chatId: number;
  from: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  text: string;
  date: string;
}

// Command interface
export interface Command {
  command: string;
  description: string;
  permission?: string; // null or undefined for public commands
}
export type SessionStep =
    | 'start'
    | 'askKeywords'
    | 'askAndOr'
    | 'askAndOrConfirmed'
    | 'nextStep';
// Handler function type
export type HandlerFunction = (ctx: BotContext) => Promise<void> | void;

// Middleware function type
export type MiddlewareFunction = (ctx: BotContext, next: () => Promise<void>) => Promise<void>;

// Bot instance type
export type BotInstance = Telegraf<BotContext>;

// Dialog system types
export type DialogCommand = 'subscribe' | 'unsubscribe';

export type DialogStep = 'start' | 'askKeywords' | 'askAndOr';