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
import { MessageSquare, Pin, Trash2, Edit3, Star, TrendingUp, Award, Plus, Search, MapPin } from 'lucide-react';

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

type ActiveTab = 'chats' | 'top';

interface ChatSidebarProps {
  onLoadChat?: (chatId: string) => void;
  onNewChat?: () => void;
  currentChatId?: string | null;
  onOpenProfessional?: (pro: Professional) => void;
}

export default function ChatSidebar({ onLoadChat, onNewChat, currentChatId, onOpenProfessional }: ChatSidebarProps) {
  const [tab, setTab] = useState<ActiveTab>('chats');
  const [chats, setChats] = useState<SavedChat[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setChats(getSavedChats());
  }, []);

  const handleTogglePin = (id: string) => {
    togglePinStorage(id);
    setChats(getSavedChats());
  };

  const handleDelete = (id: string) => {
    deleteChatStorage(id);
    setChats(getSavedChats());
  };

  const startRename = (chat: SavedChat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const finishRename = () => {
    if (editingId && editTitle.trim()) {
      renameChatStorage(editingId, editTitle.trim());
      setChats(getSavedChats());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const pinnedChats = chats.filter((c) => c.pinned);
  const regularChats = chats.filter((c) => !c.pinned);
  const filteredChats = searchQuery
    ? chats.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [...pinnedChats, ...regularChats];

  const top = getTopProfessionisti(6);

  return (
    <div className="flex flex-col h-full bg-white border-l border-ndp-border">
      {/* Tabs */}
      <div className="flex border-b border-ndp-border shrink-0">
        <button
          onClick={() => setTab('chats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all border-b-2 ${tab === 'chats' ? 'text-ndp-blue border-ndp-blue bg-ndp-blue/3' : 'text-ndp-muted border-transparent hover:text-ndp-text'}`}
        >
          <MessageSquare size={13} />
          Le tue chat
        </button>
        <button
          onClick={() => setTab('top')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-semibold transition-all border-b-2 ${tab === 'top' ? 'text-ndp-gold-dark border-ndp-gold bg-ndp-gold/5' : 'text-ndp-muted border-transparent hover:text-ndp-text'}`}
        >
          <Award size={13} />
          Top del Mese
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'chats' && (
          <div className="p-3 space-y-2">
            <div className="flex gap-2 mb-1">
              <button
                onClick={onNewChat}
                className="flex items-center gap-1.5 bg-ndp-blue text-white text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-ndp-blue-dark transition-all flex-1"
              >
                <Plus size={12} />
                Nuova chat
              </button>
            </div>
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ndp-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca nelle chat..."
                className="w-full pl-8 pr-3 py-2 text-[11px] border border-ndp-border rounded-lg bg-ndp-bg text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/40"
              />
            </div>

            {filteredChats.length === 0 && (
              <div className="py-8 text-center text-ndp-muted text-xs">
                Nessuna chat salvata
              </div>
            )}
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`group rounded-xl p-3 cursor-pointer transition-all hover:bg-ndp-bg ${currentChatId === chat.id ? 'bg-ndp-blue/5 border border-ndp-blue/20' : 'border border-transparent'}`}
                onClick={() => onLoadChat?.(chat.id)}
              >
                {editingId === chat.id ? (
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
                        {chat.pinned && <Pin size={9} className="text-ndp-gold-dark shrink-0" />}
                        <p className="text-xs font-medium text-ndp-text truncate leading-snug">{chat.title}</p>
                      </div>
                      <span className="text-[10px] text-ndp-muted shrink-0">{formatTimestamp(chat.timestamp)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {chat.tags?.slice(0, 2).map((t) => (
                          <span key={t} className="text-[9px] bg-ndp-blue/8 text-ndp-blue px-1.5 py-0.5 rounded-full font-medium">{t}</span>
                        ))}
                        <span className="text-[9px] text-ndp-muted">{chat.messageCount} msg</span>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleTogglePin(chat.id); }} className="p-1 rounded text-ndp-muted hover:text-ndp-gold-dark" title="Pin">
                          <Pin size={10} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); startRename(chat); }} className="p-1 rounded text-ndp-muted hover:text-ndp-blue" title="Rinomina">
                          <Edit3 size={10} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }} className="p-1 rounded text-ndp-muted hover:text-red-500" title="Elimina">
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

        {tab === 'top' && (
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2 px-1 mb-2">
              <TrendingUp size={12} className="text-ndp-gold-dark" />
              <span className="text-[11px] font-semibold text-ndp-gold-dark uppercase tracking-wide">
                Classifica {new Date().toLocaleDateString('it-IT', { month: 'long' })}
              </span>
            </div>
            {top.map((pro, i) => (
              <button
                key={pro.id}
                onClick={() => onOpenProfessional?.(pro)}
                className="w-full text-left group rounded-xl p-3 border border-ndp-border hover:border-ndp-gold/40 hover:bg-ndp-gold/3 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${i === 0 ? 'bg-ndp-gold' : 'bg-ndp-blue'}`}>
                      {getInitials(pro.name)}
                    </div>
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${i < 3 ? 'bg-ndp-gold text-white' : 'bg-ndp-bg text-ndp-muted border border-ndp-border'}`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ndp-text truncate group-hover:text-ndp-blue transition-colors">{pro.name}</p>
                    <p className="text-[10px] text-ndp-muted truncate">{pro.profession}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-0.5 text-[10px] text-ndp-muted">
                        <MapPin size={8} /> {pro.city}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-ndp-gold-dark">
                        <Star size={8} fill="currentColor" /> {pro.monthScore}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <p className="text-[10px] text-ndp-muted text-center pt-2 pb-1">
              Ranking basato su richieste evase, referral e profilo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
