import { DemoUser, UserRole } from './types';

const DEMO_USERS: DemoUser[] = [
  {
    id: 'u1',
    name: 'Marco Mastella',
    email: 'marco@demo.it',
    role: 'member',
    professionalId: 'demo-marco',
  },
  {
    id: 'u2',
    name: 'Luca Ferrari',
    email: 'luca@demo.it',
    role: 'zone_manager',
  },
];

const DEMO_PASSWORD = 'demo';
const AUTH_STORAGE_KEY = 'ndp-auth-v1';

export function login(email: string, password: string): DemoUser | null {
  if (password !== DEMO_PASSWORD) return null;
  const user = DEMO_USERS.find((u) => u.email === email);
  return user ?? null;
}

export function saveUser(user: DemoUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser(): DemoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function hasRole(user: DemoUser | null, role: UserRole): boolean {
  return user?.role === role;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
