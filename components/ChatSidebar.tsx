'use client';

import { useState, useEffect } from 'react';
import { getTopProfessionisti } from '@/lib/utils';
import { Professional } from '@/lib/types';
import {
  SavedChat,
  getSavedChats,
  deleteChat as deleteChatStorage,
  togglePin as togglePinStorage,
  renameChat as renameChatStorage,
} from '@/lib/chatStorage';
import {
  History, Pin, Trash2, Edit3, Star, TrendingUp, Award,
  Plus, Search, MapPin, Brain, Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
  currentChatId?: string | null;
  onOpenProfessional?: (pro: Professional) => void;
}

// ─── Guest empty state ────────────────────────────────────────────────────────
function GuestSearchesEmpty() {
  return (
    <div className="p-5 flex flex-col items-center text-center pt-8">
      <div className="w-14 h-14 rounded-2xl bg-ndp-bg flex items-center justify-center mb-4 border border-ndp-border">
        <Lock size={20} className="text-ndp-muted/40" />
      </div>
      <p className="text-sm font-semibold text-ndp-text mb-1.5">
        La memoria delle ricerche è per i professionisti
      </p>
      <p className="text-xs text-ndp-muted leading-relaxed mb-5 max-w-[200px]">
        Registrandoti ogni ricerca viene salvata e ritrovabile in qualsiasi momento.
      </p>
      {/* Ghost preview */}
      <div className="w-full space-y-2 mb-5 opacity-40 pointer-events-none select-none">
        {(['w-full', 'w-4/5', 'w-3/5'] as const).map((w, i) => (
          <div key={i} className={`h-10 bg-ndp-border/60 rounded-xl animate-pulse ${w}`} />
        ))}
      </div>
      <Link
        href="/registrazione"
        className="inline-flex items-center gap-1.5 bg-ndp-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all shadow-sm"
      >
        Registrati gratuitamente
      </Link>
      <Link href="/login" className="mt-2 text-xs text-ndp-muted hover:text-ndp-blue transition-colors">
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
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isGuest) return;
    setChats(getSavedChats());
  }, [isGuest]);

  const refreshChats = () => setChats(getSavedChats());

  const handleTogglePin = (id: string) => { togglePinStorage(id); refreshChats(); };
  const handleDelete = (id: string) => { deleteChatStorage(id); refreshChats(); };

  const startRename = (chat: SavedChat) => { setEditingId(chat.id); setEditTitle(chat.title); };
  const finishRename = () => {
    if (editingId && editTitle.trim()) { renameChatStorage(editingId, editTitle.trim()); refreshChats(); }
    setEditingId(null);
    setEditTitle('');
  };

  const pinnedChats = chats.filter((c) => c.pinned);
  const regularChats = chats.filter((c) => !c.pinned);
  const filteredChats = searchQuery
    ? chats.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [...pinnedChats, ...regularChats];

  const top = getTopProfessionisti(6);
  const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long' });

  return (
    <div className="flex flex-col h-full w-full bg-white border-l border-ndp-border">
      {/* ── Tabs ── */}
      <div className="flex border-b border-ndp-border shrink-0">
        <button
          onClick={() => setTab('searches')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-4 text-xs font-semibold transition-all border-b-2 ${
            tab === 'searches' ? 'text-ndp-blue border-ndp-blue bg-ndp-blue/3' : 'text-ndp-muted border-transparent hover:text-ndp-text'
          }`}
        >
          <History size={13} />Le tue ricerche
        </button>
        <button
          onClick={() => setTab('top')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-4 text-xs font-semibold transition-all border-b-2 ${
            tab === 'top' ? 'text-ndp-gold-dark border-ndp-gold bg-ndp-gold/5' : 'text-ndp-muted border-transparent hover:text-ndp-text'
          }`}
        >
          <Award size={13} />Top del Mese
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">

        {/* ── Le tue ricerche ── */}
        {tab === 'searches' && (
          isGuest ? (
            <GuestSearchesEmpty />
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 px-1 pt-1 pb-1">
                <Brain size={12} className="text-ndp-blue/60" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ndp-blue/60">Memoria AI</span>
              </div>
              <button
                onClick={onNewChat}
                className="w-full flex items-center justify-center gap-2 bg-ndp-blue text-white text-sm font-bold px-3 py-3 rounded-xl hover:bg-ndp-blue-dark transition-all"
              >
                <Plus size={14} />Nuova ricerca
              </button>
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-ndp-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca nelle ricerche..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-ndp-border rounded-xl bg-ndp-bg text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/40"
                />
              </div>

              {filteredChats.length === 0 && (
                <div className="py-8 text-center text-ndp-muted text-xs">Nessuna ricerca salvata</div>
              )}
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group rounded-xl py-4 px-4 cursor-pointer transition-all hover:bg-ndp-bg ${
                    currentChatId === chat.id ? 'bg-ndp-blue/5 border border-ndp-blue/20' : 'border border-transparent'
                  }`}
                  onClick={() => onLoadChat?.(chat.id)}
                >
                  {editingId === chat.id ? (
                    <input
                      type="text" value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={finishRename}
                      onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                      autoFocus
                      className="w-full text-sm font-medium text-ndp-text bg-white border border-ndp-blue/40 rounded-lg px-2 py-1 focus:outline-none"
                    />
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {chat.pinned && <Pin size={10} className="text-ndp-gold-dark shrink-0" />}
                          <p className="text-sm font-medium text-ndp-text truncate leading-snug">{chat.title}</p>
                        </div>
                        <span className="text-[11px] text-ndp-muted shrink-0">{formatTimestamp(chat.timestamp)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {chat.tags?.slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] bg-ndp-blue/8 text-ndp-blue px-2 py-0.5 rounded-md font-medium">{t}</span>
                          ))}
                          <span className="text-[10px] text-ndp-muted">{chat.messageCount} msg</span>
                        </div>
                        {/* Action buttons — always visible */}
                        <div className="flex items-center gap-0.5">
                          <button onClick={(e) => { e.stopPropagation(); handleTogglePin(chat.id); }} className="p-1.5 rounded text-ndp-muted hover:text-ndp-gold-dark hover:bg-ndp-gold/10 transition-colors" title="Pin">
                            <Pin size={12} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); startRename(chat); }} className="p-1.5 rounded text-ndp-muted hover:text-ndp-blue hover:bg-ndp-blue/8 transition-colors" title="Rinomina">
                            <Edit3 size={12} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }} className="p-1.5 rounded text-ndp-muted hover:text-red-500 hover:bg-red-50 transition-colors" title="Elimina">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Top del Mese ── */}
        {tab === 'top' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 px-1 pt-1 pb-3">
              <TrendingUp size={14} className="text-ndp-gold-dark" />
              <div>
                <p className="text-xs font-bold text-ndp-gold-dark uppercase tracking-wide">Top del Mese</p>
                <p className="text-[10px] text-ndp-muted capitalize">{currentMonth} 2026</p>
              </div>
            </div>

            {/* Top 3 */}
            {top.slice(0, 3).map((pro, i) => (
              <button
                key={pro.id}
                onClick={() => onOpenProfessional?.(pro)}
                className={`w-full text-left rounded-2xl p-4 border transition-all hover:shadow-md group ${
                  i === 0
                    ? 'bg-ndp-gold/8 border-ndp-gold/30 hover:border-ndp-gold/50'
                    : 'bg-white border-ndp-border hover:border-ndp-blue/25 hover:bg-ndp-bg/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-ndp-gold' : 'bg-ndp-blue/80'}`}>
                      {getInitials(pro.name)}
                    </div>
                    <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white shadow-sm ${i === 0 ? 'bg-ndp-gold text-white' : 'bg-ndp-bg text-ndp-muted'}`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ndp-text truncate group-hover:text-ndp-blue transition-colors">{pro.name}</p>
                    <p className="text-[11px] text-ndp-muted truncate">{pro.profession}</p>
                    <span className="flex items-center gap-0.5 text-[11px] text-ndp-muted mt-1"><MapPin size={8} /> {pro.city}</span>
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

            {/* Rank 4-6 */}
            {top.length > 3 && (
              <div className="border-t border-ndp-border pt-2 space-y-1">
                {top.slice(3, 6).map((pro, i) => (
                  <button
                    key={pro.id}
                    onClick={() => onOpenProfessional?.(pro)}
                    className="w-full text-left flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-ndp-bg transition-all group"
                  >
                    <span className="text-[11px] font-black text-ndp-muted/50 w-4 text-center shrink-0">{i + 4}</span>
                    <div className="w-8 h-8 rounded-lg bg-ndp-bg flex items-center justify-center text-[10px] font-bold text-ndp-blue shrink-0 border border-ndp-border">
                      {getInitials(pro.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ndp-text truncate group-hover:text-ndp-blue transition-colors">{pro.name}</p>
                      <p className="text-[10px] text-ndp-muted truncate">{pro.city}</p>
                    </div>
                    <span className="text-xs font-bold text-ndp-muted shrink-0">{pro.monthScore}</span>
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
