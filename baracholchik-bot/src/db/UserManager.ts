import fs from 'fs';
import path from 'path';
import User from './User';

// Fix the path to point to the source data directory, not the dist directory
const DB_PATH = path.join(process.cwd(), 'data/users.json');

interface UserData {
  id: number;
  filters: string[];
  permissions: string[];
}

class UserManager {
  private users: User[] = [];

  constructor() {
    this.ensureUsersFile();
    this.loadUsers();
  }

  private ensureUsersFile(): void {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, '[]', 'utf-8');
    }
  }

  private loadUsers(): void {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      const rawUsers: UserData[] = JSON.parse(data);
      
      this.users = rawUsers.map(obj =>
        new User({
          id: Number(obj.id),
          filters: obj.filters,
          permissions: obj.permissions
        })
      );
    } catch (error) {
      console.error('❌ Error loading users:', error);
      this.users = [];
    }
  }

  private saveUsers(): void {
    const plain: UserData[] = this.users.map(user => ({
      id: user.id,
      filters: user.filters,
      permissions: user.permissions
    }));
    fs.writeFileSync(DB_PATH, JSON.stringify(plain, null, 2), 'utf-8');
  }

  getAll(): User[] {
    return this.users;
  }

  getById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  addUserIfNotExists(id: number): User {
    let user = this.getById(id);
    if (!user) {
      user = new User({ id, filters: [] });
      this.users.push(user);
      this.saveUsers();
    }
    return user;
  }

  saveUser(user: User): void {
    const index = this.users.findIndex(u => u.id === user.id);
    console.log(`[SAVE] user.id: ${user.id}, matched index: ${index}`);
    if (index !== -1) {
      this.users[index] = user;
      this.saveUsers();
    }
  }
}

export default new UserManager(); 