import type { BotContext } from '../types';

interface UserConstructor {
  id: number;
  filters?: string[];
  permissions?: string[];
}

class User {
  public id: number;
  public filters: string[];
  public permissions: string[];

  constructor({ id, filters, permissions }: UserConstructor) {
    this.id = id;
    this.filters = filters || [];
    this.permissions = permissions || [];
  }

  subscribeTo(filterId: string): void {
    if (!this.filters.includes(filterId)) {
      this.filters.push(filterId);
    }
  }

  unsubscribeFrom(filterId: string): void {
    this.filters = this.filters.filter(id => id !== filterId);
  }

  async notify(ctx: BotContext, message: string): Promise<void> {
    console.log(`Notify user ${this.id}: ${message}`);
    await ctx.telegram.sendMessage(this.id, message);
  }

  hasFilter(filterId: string): boolean {
    return this.filters.includes(filterId);
  }

  permitTo(permissionName: string): void {
    if (!this.permissions.includes(permissionName)) {
      this.permissions.push(permissionName);
    }
  }

  forbidTo(permissionName: string): void {
    this.permissions = this.permissions.filter(p => p !== permissionName);
  }

  hasPermission(permissionName: string): boolean {
    return this.permissions.includes(permissionName);
  }
}

export default User; 