import { DemoUser, UserRole, RegistrationPayload } from './types';
import { getUsers, addUser } from './storage/users';
import { getZoneForCity, DEMO_ZONE_MANAGER_ID } from './cityZoneMap';

const DEMO_USERS: DemoUser[] = [
  {
    id: 'u1',
    name: 'Marco Mastella',
    email: 'marco@demo.it',
    role: 'member',
    professionalId: 'demo-marco',
    password: 'demo',
    city: 'Milano',
    zone: 'Zona Nord',
    zoneManagerId: 'u2',
  },
  {
    id: 'u2',
    name: 'Luca Ferrari',
    email: 'luca@demo.it',
    role: 'zone_manager',
    password: 'demo',
    city: 'Milano',
    zone: 'Zona Nord',
  },
];

const AUTH_STORAGE_KEY = 'ndp-auth-v1';

export function login(email: string, password: string): DemoUser | null {
  const demoUser = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (demoUser && (password === 'demo' || password === demoUser.password)) {
    return demoUser;
  }
  try {
    const storageUsers = getUsers();
    const user = storageUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.password === password) {
      return user;
    }
  } catch {}
  return null;
}

export function registerUser(payload: RegistrationPayload): DemoUser {
  const zone = getZoneForCity(payload.city);
  const newUser: DemoUser = {
    id: `user-${Date.now()}`,
    name: `${payload.nome} ${payload.cognome}`,
    email: payload.email,
    role: 'member',
    password: payload.password,
    city: payload.city,
    zone,
    zoneManagerId: DEMO_ZONE_MANAGER_ID,
    registeredAt: new Date().toISOString(),
  };
  addUser(newUser);
  return newUser;
}

export function isEmailTaken(email: string): boolean {
  const demoMatch = DEMO_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (demoMatch) return true;
  try {
    const users = getUsers();
    return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  } catch {
    return false;
  }
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
