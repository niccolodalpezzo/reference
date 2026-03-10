'use client';

import { useState, useEffect } from 'react';
import { getTopProfessionisti } from '@/lib/utils';
import { Professional } from '@/lib/types';
import {
  History, Pin, Trash2, Edit3, Star, TrendingUp, Award,
  Plus, Search, MapPin, Brain, Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface SavedSearch {
  id: string;
  title: string;
  timestamp: string;
  tags?: string[];
  pinned?: boolean;
  messageCount: number;
}

const SAVED_CHATS_KEY = 'ndp-saved-chats-v1';

function getDemoSavedSearches(): SavedSearch[] {
  return [
    { id: 'sc-1', title: 'Avvocato diritto societario Milano', timestamp: '2026-03-05T10:30:00', tags: ['Avvocato', 'Milano'], pinned: true, messageCount: 6 },
    { id: 'sc-2', title: 'Commercialista startup Bologna', timestamp: '2026-03-04T14:15:00', tags: ['Commercialista', 'Bologna'], pinned: false, messageCount: 4 },
    { id: 'sc-3', title: 'Medico di base Napoli', timestamp: '2026-03-03T09:00:00', tags: ['Medico', 'Napoli'], pinned: false, messageCount: 3 },
    { id: 'sc-4', title: 'Consulente IT cybersecurity', timestamp: '2026-03-01T16:45:00', tags: ['IT', 'Cyber'], pinned: false, messageCount: 8 },
  ];
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Ora';
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ieri';
  if (days < 7) return `${days}g fa`;
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

type ActiveTab = 'searches' | 'top';

interface ChatSidebarProps {
  onLoadChat?: (chatId: string) => void;
  onNewChat?: () => void;
  currentChatId?: string;
  onOpenProfessional?: (pro: Professional) => void;
}

// ─── Guest empty state ────────────────────────────────────────────────────────
function GuestSearchesEmpty() {
  return (
    <div className="p-5 flex flex-col items-center text-center pt-8">
      <div className="w-14 h-14 rounded-2xl bg-ndp-bg flex items-center justify-center mb-4 border border-ndp-border">
        <Lock size={20} className="text-ndp-muted/40" />
      </div>
      <p className="text-xs font-semibold text-ndp-text mb-1.5">
        La memoria delle ricerche è per i professionisti
      </p>
      <p className="text-[11px] text-ndp-muted leading-relaxed mb-5 max-w-[200px]">
        Registrandoti ogni ricerca viene salvata e ritrovabile in qualsiasi momento.
      </p>

      {/* Ghost preview */}
      <div className="w-full space-y-2 mb-5 opacity-40 pointer-events-none select-none">
        {[{ w: 'w-full', delay: '' }, { w: 'w-4/5', delay: 'delay-75' }, { w: 'w-3/5', delay: 'delay-150' }].map((item, i) => (
          <div key={i} className={`h-8 bg-ndp-border/60 rounded-xl animate-pulse ${item.w} ${item.delay}`} />
        ))}
      </div>

      <Link
        href="/registrazione"
        className="inline-flex items-center gap-1.5 bg-ndp-blue text-white text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all shadow-sm"
      >
        Registrati gratuitamente
      </Link>
      <Link href="/login" className="mt-2 text-[11px] text-ndp-muted hover:text-ndp-blue transition-colors">
        Hai già un account? Accedi
      </Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatSidebar({ onLoadChat, onNewChat, currentChatId, onOpenProfessional }: ChatSidebarProps) {
  const { user } = useAuth();
  const isGuest = user === null;

  const [tab, setTab] = useState<ActiveTab>('searches');
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isGuest) return;
    try {
      const saved = localStorage.getItem(SAVED_CHATS_KEY);
      setSearches(saved ? JSON.parse(saved) : getDemoSavedSearches());
    } catch {
      setSearches(getDemoSavedSearches());
    }
  }, [isGuest]);

  const saveSearches = (updated: SavedSearch[]) => {
    setSearches(updated);
    localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(updated));
  };

  const togglePin = (id: string) => {
    saveSearches(searches.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const deleteSearch = (id: string) => {
    saveSearches(searches.filter((c) => c.id !== id));
  };

  const startRename = (s: SavedSearch) => {
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const finishRename = () => {
    if (editingId && editTitle.trim()) {
      saveSearches(searches.map((c) => c.id === editingId ? { ...c, title: editTitle.trim() } : c));
    }
    setEditingId(null);
    setEditTitle('');
  };

  const pinnedSearches = searches.filter((c) => c.pinned);
  const regularSearches = searches.filter((c) => !c.pinned);
  const filteredSearches = searchQuery
    ? searches.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [...pinnedSearches, ...regularSearches];

  const top = getTopProfessionisti(6);
  const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long' });

  return (
    <div className="flex flex-col h-full bg-white border-l border-ndp-border">
      {/* ── Tabs ── */}
      <div className="flex border-b border-ndp-border shrink-0">
        <button
          onClick={() => setTab('searches')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all border-b-2 ${
            tab === 'searches'
              ? 'text-ndp-blue border-ndp-blue bg-ndp-blue/3'
              : 'text-ndp-muted border-transparent hover:text-ndp-text'
          }`}
        >
          <History size={13} />
          Le tue ricerche
        </button>
        <button
          onClick={() => setTab('top')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all border-b-2 ${
            tab === 'top'
              ? 'text-ndp-gold-dark border-ndp-gold bg-ndp-gold/5'
              : 'text-ndp-muted border-transparent hover:text-ndp-text'
          }`}
        >
          <Award size={13} />
          Top del Mese
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* ── Le tue ricerche ── */}
        {tab === 'searches' && (
          <>
            {isGuest ? (
              <GuestSearchesEmpty />
            ) : (
              <div className="p-3 space-y-2">
                {/* Module header */}
                <div className="flex items-center gap-2 px-1 pt-1 pb-2">
                  <Brain size={12} className="text-ndp-blue/60" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ndp-blue/60">
                    Memoria AI
                  </span>
                </div>

                {/* New search + search input */}
                <button
                  onClick={onNewChat}
                  className="w-full flex items-center justify-center gap-1.5 bg-ndp-blue text-white text-[11px] font-bold px-3 py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all"
                >
                  <Plus size={12} />
                  Nuova ricerca
                </button>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ndp-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca nelle ricerche..."
                    className="w-full pl-8 pr-3 py-2 text-[11px] border border-ndp-border rounded-xl bg-ndp-bg text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/40"
                  />
                </div>

                {/* Search list */}
                {filteredSearches.length === 0 && (
                  <div className="py-8 text-center text-ndp-muted text-xs">
                    Nessuna ricerca salvata
                  </div>
                )}
                {filteredSearches.map((item) => (
                  <div
                    key={item.id}
                    className={`group rounded-xl py-3.5 px-3 cursor-pointer transition-all hover:bg-ndp-bg ${
                      currentChatId === item.id
                        ? 'bg-ndp-blue/5 border border-ndp-blue/20'
                        : 'border border-transparent'
                    }`}
                    onClick={() => onLoadChat?.(item.id)}
                  >
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                        autoFocus
                        className="w-full text-xs font-medium text-ndp-text bg-white border border-ndp-blue/40 rounded-lg px-2 py-1 focus:outline-none"
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {item.pinned && <Pin size={9} className="text-ndp-gold-dark shrink-0" />}
                            <p className="text-xs font-medium text-ndp-text truncate leading-snug">{item.title}</p>
                          </div>
                          <span className="text-[10px] text-ndp-muted shrink-0">{formatTimestamp(item.timestamp)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.tags?.slice(0, 2).map((t) => (
                              <span key={t} className="text-[9px] bg-ndp-blue/8 text-ndp-blue px-1.5 py-0.5 rounded-md font-medium">{t}</span>
                            ))}
                            <span className="text-[9px] text-ndp-muted">{item.messageCount} msg</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); togglePin(item.id); }} className="p-1 rounded text-ndp-muted hover:text-ndp-gold-dark" title="Pin">
                              <Pin size={10} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); startRename(item); }} className="p-1 rounded text-ndp-muted hover:text-ndp-blue" title="Rinomina">
                              <Edit3 size={10} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteSearch(item.id); }} className="p-1 rounded text-ndp-muted hover:text-red-500" title="Elimina">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Top del Mese ── */}
        {tab === 'top' && (
          <div className="p-3 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2 px-1 pt-1 pb-3">
              <TrendingUp size={14} className="text-ndp-gold-dark" />
              <div>
                <p className="text-xs font-bold text-ndp-gold-dark uppercase tracking-wide">
                  Top del Mese
                </p>
                <p className="text-[10px] text-ndp-muted capitalize">{currentMonth} 2026</p>
              </div>
            </div>

            {/* Top 3 — prominent cards */}
            {top.slice(0, 3).map((pro, i) => (
              <button
                key={pro.id}
                onClick={() => onOpenProfessional?.(pro)}
                className={`w-full text-left rounded-2xl p-3.5 border transition-all hover:shadow-md group ${
                  i === 0
                    ? 'bg-ndp-gold/8 border-ndp-gold/30 hover:border-ndp-gold/50'
                    : 'bg-white border-ndp-border hover:border-ndp-blue/25 hover:bg-ndp-bg/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-[11px] font-bold ${
                        i === 0 ? 'bg-ndp-gold' : 'bg-ndp-blue/80'
                      }`}
                    >
                      {getInitials(pro.name)}
                    </div>
                    <div
                      className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm ${
                        i === 0 ? 'bg-ndp-gold text-white' : 'bg-ndp-bg text-ndp-muted'
                      }`}
                    >
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ndp-text truncate group-hover:text-ndp-blue transition-colors">
                      {pro.name}
                    </p>
                    <p className="text-[10px] text-ndp-muted truncate">{pro.profession}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-[10px] text-ndp-muted">
                        <MapPin size={8} /> {pro.city}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`flex items-center gap-0.5 text-base font-black ${i === 0 ? 'text-ndp-gold-dark' : 'text-ndp-text'}`}>
                      <Star size={11} fill="currentColor" className={i === 0 ? 'text-ndp-gold' : 'text-ndp-muted/50'} />
                      {pro.monthScore}
                    </div>
                    <p className="text-[9px] text-ndp-muted mt-0.5">pt</p>
                  </div>
                </div>
              </button>
            ))}

            {/* Rank 4-6 — compact list */}
            {top.length > 3 && (
              <div className="mt-1 border-t border-ndp-border pt-2 space-y-0.5">
                {top.slice(3, 6).map((pro, i) => (
                  <button
                    key={pro.id}
                    onClick={() => onOpenProfessional?.(pro)}
                    className="w-full text-left flex items-center gap-2.5 py-2.5 px-2 rounded-xl hover:bg-ndp-bg transition-all group"
                  >
                    <span className="text-[10px] font-black text-ndp-muted/50 w-4 text-center shrink-0">
                      {i + 4}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-ndp-bg flex items-center justify-center text-[9px] font-bold text-ndp-blue shrink-0 border border-ndp-border">
                      {getInitials(pro.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-ndp-text truncate group-hover:text-ndp-blue transition-colors">
                        {pro.name}
                      </p>
                      <p className="text-[9px] text-ndp-muted truncate">{pro.city}</p>
                    </div>
                    <span className="text-[11px] font-bold text-ndp-muted shrink-0">{pro.monthScore}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
