import { Conversation, ConversationStatus } from '@/lib/types';

const KEY = 'ndp-conversations-v1';

function getAll(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(items: Conversation[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getConversations(userId: string): Conversation[] {
  return getAll()
    .filter((c) => c.participants.includes(userId))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function getConversationById(id: string): Conversation | null {
  return getAll().find((c) => c.id === id) ?? null;
}

export function createConversation(payload: Omit<Conversation, 'id' | 'createdAt' | 'lastMessageAt' | 'unreadCount' | 'lastMessagePreview'>): Conversation {
  const conv: Conversation = {
    ...payload,
    id: `conv-${Date.now()}`,
    unreadCount: 0,
    lastMessagePreview: '',
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  const all = getAll();
  all.push(conv);
  saveAll(all);
  return conv;
}

export function updateConversation(id: string, partial: Partial<Conversation>): void {
  const all = getAll().map((c) => (c.id === id ? { ...c, ...partial } : c));
  saveAll(all);
}

export function markAllRead(conversationId: string): void {
  updateConversation(conversationId, { unreadCount: 0 });
}

export function getOrCreateConversation(userId: string, professionalId: string, subject?: string): Conversation {
  const existing = getAll().find(
    (c) => c.initiatorId === userId && c.professionalId === professionalId
  );
  if (existing) return existing;
  return createConversation({
    participants: [userId, professionalId],
    professionalId,
    initiatorId: userId,
    subject,
    status: 'active',
  });
}

export function getTotalUnread(userId: string): number {
  return getConversations(userId).reduce((sum, c) => sum + c.unreadCount, 0);
}
