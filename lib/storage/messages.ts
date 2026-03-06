import { Message, MessageType, MessageStatus } from '@/lib/types';
import { updateConversation } from './conversations';

const KEY = 'ndp-messages-v1';

function getAll(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(items: Message[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getMessages(conversationId: string): Message[] {
  return getAll()
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function addMessage(payload: Omit<Message, 'id' | 'timestamp' | 'status'>): Message {
  const msg: Message = {
    ...payload,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'sent',
    timestamp: new Date().toISOString(),
  };
  const all = getAll();
  all.push(msg);
  saveAll(all);

  // Update conversation preview
  updateConversation(msg.conversationId, {
    lastMessagePreview: msg.content.slice(0, 80),
    lastMessageAt: msg.timestamp,
  });

  return msg;
}

export function addSystemMessage(conversationId: string, content: string): Message {
  return addMessage({
    conversationId,
    senderId: 'system',
    senderName: 'Sistema',
    content,
    type: 'system',
  });
}

export function updateMessageStatus(id: string, status: MessageStatus): void {
  const all = getAll().map((m) => (m.id === id ? { ...m, status } : m));
  saveAll(all);
}

export function getMessageCount(conversationId: string): number {
  return getAll().filter((m) => m.conversationId === conversationId).length;
}
