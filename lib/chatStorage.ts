/**
 * Chat storage utilities — persists multiple chat sessions in localStorage.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  matchedIds?: string[];
}

export interface SavedChat {
  id: string;
  title: string;
  timestamp: string;
  tags?: string[];
  pinned?: boolean;
  messageCount: number;
}

const CHATS_INDEX_KEY = 'ndp-saved-chats-v1';
const CHAT_MESSAGES_PREFIX = 'ndp-chat-msgs-';
const ACTIVE_CHAT_KEY = 'ndp-active-chat-id';

// ── Index (list of all chats) ──────────────────────────────

export function getSavedChats(): SavedChat[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHATS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistIndex(chats: SavedChat[]) {
  localStorage.setItem(CHATS_INDEX_KEY, JSON.stringify(chats));
}

// ── Messages for a single chat ─────────────────────────────

export function getChatMessages(chatId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHAT_MESSAGES_PREFIX + chatId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatMessages(chatId: string, messages: ChatMessage[]) {
  localStorage.setItem(CHAT_MESSAGES_PREFIX + chatId, JSON.stringify(messages));
}

// ── Active chat tracking ───────────────────────────────────

export function getActiveChatId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_CHAT_KEY);
}

export function setActiveChatId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_CHAT_KEY, id);
  else localStorage.removeItem(ACTIVE_CHAT_KEY);
}

// ── CRUD operations ────────────────────────────────────────

/** Generate a short ID */
function genId(): string {
  return 'chat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Extract a readable title from the first user message */
function deriveTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user');
  if (!first) return 'Nuova chat';
  const text = first.content.slice(0, 60);
  return text.length < first.content.length ? text + '...' : text;
}

/** Extract tag-like keywords from a title */
function deriveTags(title: string): string[] {
  const keywords: Record<string, string> = {
    avvocato: 'Avvocato', commercialista: 'Commercialista', architetto: 'Architetto',
    dentista: 'Dentista', medico: 'Medico', consulente: 'Consulente',
    coach: 'Coach', assicurat: 'Assicuratore', marketing: 'Marketing',
    immobili: 'Immobiliare', ingegnere: 'Ingegnere', notaio: 'Notaio',
    milano: 'Milano', roma: 'Roma', torino: 'Torino', firenze: 'Firenze',
    bologna: 'Bologna', napoli: 'Napoli', venezia: 'Venezia', genova: 'Genova',
    it: 'IT', cyber: 'Cyber', startup: 'Startup',
  };
  const lower = title.toLowerCase();
  const tags: string[] = [];
  for (const [k, v] of Object.entries(keywords)) {
    if (lower.includes(k) && tags.length < 3) tags.push(v);
  }
  return tags;
}

/**
 * Create or update a chat in the index + persist its messages.
 * Returns the chat ID.
 */
export function upsertChat(chatId: string | null, messages: ChatMessage[]): string {
  const id = chatId || genId();
  saveChatMessages(id, messages);

  const title = deriveTitle(messages);
  const tags = deriveTags(title);
  const chats = getSavedChats();
  const idx = chats.findIndex((c) => c.id === id);

  const entry: SavedChat = {
    id,
    title,
    timestamp: new Date().toISOString(),
    tags,
    pinned: idx >= 0 ? chats[idx].pinned : false,
    messageCount: messages.filter((m) => m.role === 'user').length,
  };

  if (idx >= 0) {
    chats[idx] = { ...chats[idx], ...entry, pinned: chats[idx].pinned };
  } else {
    chats.unshift(entry);
  }

  persistIndex(chats);
  setActiveChatId(id);
  return id;
}

export function deleteChat(chatId: string) {
  const chats = getSavedChats().filter((c) => c.id !== chatId);
  persistIndex(chats);
  localStorage.removeItem(CHAT_MESSAGES_PREFIX + chatId);
  if (getActiveChatId() === chatId) setActiveChatId(null);
}

export function togglePin(chatId: string) {
  const chats = getSavedChats().map((c) =>
    c.id === chatId ? { ...c, pinned: !c.pinned } : c
  );
  persistIndex(chats);
}

export function renameChat(chatId: string, newTitle: string) {
  const chats = getSavedChats().map((c) =>
    c.id === chatId ? { ...c, title: newTitle } : c
  );
  persistIndex(chats);
}

// ── Guest cleanup ──────────────────────────────────────────

/**
 * Remove ALL ndp-* data from localStorage (called when user is not authenticated).
 * Ensures guest sessions never see demo data or previous sessions' data.
 * Covers: chat keys, seed flag, legacy storage keys (conversations, messages,
 * references, alerts, logs, users seeded by the old SeedProvider).
 */
export function clearGuestStorage() {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('ndp-')) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

// ── Migration: import legacy single-chat data ──────────────

export function migrateLegacyChat() {
  if (typeof window === 'undefined') return;
  const legacy = localStorage.getItem('ndp-chat-v1');
  if (!legacy) return;
  try {
    const msgs: ChatMessage[] = JSON.parse(legacy);
    if (msgs.length > 0) {
      upsertChat(null, msgs);
    }
    localStorage.removeItem('ndp-chat-v1');
  } catch {
    localStorage.removeItem('ndp-chat-v1');
  }
}
