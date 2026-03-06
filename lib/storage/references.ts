import { Reference, ReferenceStatus } from '@/lib/types';

const KEY = 'ndp-references-v1';

function getAll(): Reference[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(items: Reference[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getReferences(): Reference[] {
  return getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getReferencesByConversation(conversationId: string): Reference[] {
  return getAll().filter((r) => r.conversationId === conversationId);
}

export function getReferencesByUser(userId: string): Reference[] {
  return getAll().filter((r) => r.fromUserId === userId);
}

export function getReferencesByProfessional(professionalId: string): Reference[] {
  return getAll().filter((r) => r.toProfessionalId === professionalId);
}

export function getPendingReferences(): Reference[] {
  return getAll().filter((r) => r.status === 'in_verifica');
}

export function getReferenceById(id: string): Reference | null {
  return getAll().find((r) => r.id === id) ?? null;
}

export function createReference(payload: Omit<Reference, 'id' | 'createdAt' | 'status' | 'scoreAwarded'>): Reference {
  const ref: Reference = {
    ...payload,
    id: `ref-${Date.now()}`,
    status: 'in_verifica',
    scoreAwarded: 10,
    createdAt: new Date().toISOString(),
  };
  const all = getAll();
  all.push(ref);
  saveAll(all);
  return ref;
}

export function updateReference(id: string, partial: Partial<Reference>): void {
  const all = getAll().map((r) => (r.id === id ? { ...r, ...partial } : r));
  saveAll(all);
}

export function approveReference(id: string, reviewedByUserId: string, reviewNotes?: string): void {
  updateReference(id, {
    status: 'approvata',
    reviewedByUserId,
    reviewNotes,
    reviewedAt: new Date().toISOString(),
    scoreAwarded: 40, // +10 at creation + 30 bonus on approval
  });
}

export function rejectReference(id: string, reviewedByUserId: string, reviewNotes: string): void {
  updateReference(id, {
    status: 'rifiutata',
    reviewedByUserId,
    reviewNotes,
    reviewedAt: new Date().toISOString(),
    scoreAwarded: 0,
  });
}
