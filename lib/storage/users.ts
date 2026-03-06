import { DemoUser } from '@/lib/types';

const KEY = 'ndp-users-v1';

export function getUsers(): DemoUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: DemoUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(users));
}

export function getUserById(id: string): DemoUser | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function getUserByEmail(email: string): DemoUser | null {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function addUser(user: DemoUser): void {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

export function updateUser(id: string, partial: Partial<DemoUser>): void {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...partial } : u));
  saveUsers(users);
}

export function seedUsers(users: DemoUser[]): void {
  const existing = getUsers();
  const existingIds = new Set(existing.map((u) => u.id));
  const toAdd = users.filter((u) => !existingIds.has(u.id));
  if (toAdd.length > 0) {
    saveUsers([...existing, ...toAdd]);
  }
}
