import { ActivityLog, ActivityLogType } from '@/lib/types';

const KEY = 'ndp-logs-v1';
const MAX_ENTRIES = 500;

function getAll(): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(items: ActivityLog[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getLogs(): ActivityLog[] {
  return getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getLogsForUser(userId: string): ActivityLog[] {
  return getLogs().filter((l) => l.userId === userId);
}

export function appendLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
  const entry: ActivityLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  let all = getAll();
  all.push(entry);
  // FIFO eviction if over max
  if (all.length > MAX_ENTRIES) {
    all = all.slice(all.length - MAX_ENTRIES);
  }
  saveAll(all);
  return entry;
}

export function seedLogs(logs: ActivityLog[]): void {
  const existing = getAll();
  const existingIds = new Set(existing.map((l) => l.id));
  const toAdd = logs.filter((l) => !existingIds.has(l.id));
  saveAll([...existing, ...toAdd]);
}
