import { Alert, AlertStatus, AlertSeverity } from '@/lib/types';

const KEY = 'ndp-alerts-v1';

function getAll(): Alert[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(items: Alert[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getAlerts(): Alert[] {
  return getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOpenAlerts(): Alert[] {
  return getAlerts().filter((a) => a.status === 'open');
}

export function getAlertById(id: string): Alert | null {
  return getAll().find((a) => a.id === id) ?? null;
}

export function createAlert(payload: Omit<Alert, 'id' | 'createdAt' | 'status'>): Alert {
  const alert: Alert = {
    ...payload,
    id: `alert-${Date.now()}`,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  const all = getAll();
  all.push(alert);
  saveAll(all);
  return alert;
}

export function updateAlert(id: string, partial: Partial<Alert>): void {
  const all = getAll().map((a) => (a.id === id ? { ...a, ...partial } : a));
  saveAll(all);
}

export function closeAlert(id: string, closedNotes?: string): void {
  updateAlert(id, {
    status: 'closed',
    closedAt: new Date().toISOString(),
    closedNotes,
  });
}

export function archiveAlert(id: string): void {
  updateAlert(id, { status: 'archived' });
}

export function seedAlerts(alerts: Alert[]): void {
  const existing = getAll();
  const existingIds = new Set(existing.map((a) => a.id));
  const toAdd = alerts.filter((a) => !existingIds.has(a.id));
  saveAll([...existing, ...toAdd]);
}
