'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Network, Loader2, ArrowRight, RotateCcw, Bookmark, BookmarkCheck, Sparkles, ChevronRight, Star, MapPin, Phone, Mail, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { getProfessionalsByIds } from '@/lib/utils';
import { Professional } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  matchedIds?: string[];
}

interface ChatInterfaceProps {
  initialQuery?: string;
  onOpenProfessional?: (pro: Professional) => void;
}

const STORAGE_KEY = 'ndp-chat-v1';

const SUGGESTIONS = [
  { text: 'Avvocato per diritto societario a Milano', icon: '⚖️' },
  { text: 'Commercialista esperto in startup', icon: '📊' },
  { text: 'Agenzia immobiliare per vendita a Firenze', icon: '🏠' },
  { text: 'Consulente IT per cybersecurity', icon: '🔒' },
  { text: 'Dentista specializzato in estetica a Roma', icon: '🦷' },
  { text: 'Coach executive per team commerciale', icon: '🎯' },
];

const FOLLOW_UP_SUGGESTIONS = [
  'Mostrami le specialità di questo professionista',
  'Ci sono alternative nella stessa città?',
  'Chi ha il rating più alto nella categoria?',
  'Puoi spiegarmi meglio perché lo consigli?',
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

const renderText = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,3}\s/gm, '')
    .trim();
};

// Inline professional card for chat results
function ChatProfessionalCard({ p, rank, onOpen }: { p: Professional; rank: number; onOpen?: (pro: Professional) => void }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border p-4 transition-all hover:shadow-lg cursor-pointer group',
        rank === 0 ? 'border-ndp-blue/30 shadow-md ring-1 ring-ndp-blue/10' : 'border-ndp-border shadow-sm'
      )}
      onClick={() => onOpen?.(p)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0', rank === 0 ? 'bg-ndp-blue' : 'bg-ndp-blue/80')}>
          {getInitials(p.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-ndp-text truncate group-hover:text-ndp-blue transition-colors">{p.name}</h4>
            {p.isTopOfMonth && (
              <Award size={12} className="text-ndp-gold shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-ndp-muted truncate">{p.profession}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-[10px] text-ndp-muted">
              <MapPin size={9} /> {p.city}
            </span>
            <span className="text-[10px] text-ndp-muted">·</span>
            <span className="text-[10px] text-ndp-muted truncate">{p.chapter}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-ndp-border">
        <div className="flex items-center gap-1">
          <Star size={10} className="text-ndp-gold" fill="currentColor" />
          <span className="text-xs font-bold text-ndp-text">{p.rating}</span>
        </div>
        <span className="text-[10px] text-ndp-muted">{p.referralsGiven} referral</span>
        <span className="text-[10px] text-ndp-muted">{p.yearsInBNI}a in BNI</span>
        {p.monthScore && (
          <span className="ml-auto flex items-center gap-0.5 text-[10px] font-bold text-ndp-blue">
            <TrendingUp size={9} /> {p.monthScore}
          </span>
        )}
      </div>

      {/* Specialties (compact) */}
      <div className="flex flex-wrap gap-1 mb-3">
        {p.specialties.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] bg-ndp-blue/6 text-ndp-blue px-2 py-0.5 rounded-full">{s}</span>
        ))}
        {p.specialties.length > 3 && (
          <span className="text-[10px] text-ndp-muted">+{p.specialties.length - 3}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onOpen?.(p); }}
          className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-ndp-blue text-white py-2 rounded-xl hover:bg-ndp-blue-dark transition-all"
        >
          Apri profilo <ChevronRight size={11} />
        </button>
        <a
          href={`tel:${p.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1 text-[11px] bg-ndp-bg text-ndp-text py-2 px-3 rounded-xl hover:bg-ndp-border transition-all border border-ndp-border"
        >
          <Phone size={11} /> Chiama
        </a>
      </div>
    </div>
  );
}

export default function ChatInterface({ initialQuery, onOpenProfessional }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [chatSaved, setChatSaved] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (container) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (initialQuery && !initialized.current) {
      initialized.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  const clearChat = () => {
    setMessages([]);
    setChatSaved(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const saveChat = () => {
    setChatSaved(true);
    // In a real app, save to backend. For demo, just toggle the icon.
    setTimeout(() => setChatSaved(false), 3000);
  };

  const extractMatchedIds = (text: string): string[] => {
    const match = text.match(/MATCHED_IDS:\[([^\]]*)\]/);
    if (!match) return [];
    try { return JSON.parse(`[${match[1]}]`); } catch { return []; }
  };

  const cleanText = (text: string): string => {
    return text.replace(/MATCHED_IDS:\[([^\]]*)\]/g, '').trim();
  };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;

    const userMsg: Message = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: fullText };
          return updated;
        });
      }

      const matchedIds = extractMatchedIds(fullText);
      const cleanContent = cleanText(fullText);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: cleanContent, matchedIds };
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Mi dispiace, si è verificato un errore. Riprova tra un momento.',
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header bar */}
      <div className="px-5 py-3 border-b border-ndp-border flex items-center gap-3 bg-white shrink-0">
        <div className="w-8 h-8 bg-ndp-blue rounded-xl flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-ndp-text text-sm">Assistente AI</h2>
          <p className="text-[10px] text-ndp-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Online — Professionisti verificati BNI
          </p>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <>
              <button
                onClick={saveChat}
                title="Salva ricerca"
                className={clsx('p-2 rounded-lg transition-colors', chatSaved ? 'text-ndp-gold-dark bg-ndp-gold/10' : 'text-ndp-muted hover:text-ndp-blue hover:bg-ndp-bg')}
              >
                {chatSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              </button>
              <button
                onClick={clearChat}
                title="Nuova conversazione"
                className="p-2 rounded-lg text-ndp-muted hover:text-ndp-blue hover:bg-ndp-bg transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

          {/* Welcome screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-ndp-blue/8 rounded-3xl blur-xl scale-150" />
                <div className="relative w-16 h-16 bg-ndp-blue rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles size={28} className="text-white" />
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-ndp-text mb-1.5">
                Come posso aiutarti?
              </h2>
              <p className="text-ndp-muted text-sm max-w-sm leading-relaxed mb-8">
                Descrivi la tua esigenza. Ti trovo il professionista giusto nella rete BNI.
              </p>
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => sendMessage(s.text)}
                    className="text-left text-xs text-ndp-text bg-ndp-bg px-4 py-3.5 rounded-2xl border border-ndp-border hover:border-ndp-blue/30 hover:bg-white hover:shadow-sm transition-all duration-150 flex items-start gap-2.5 group"
                  >
                    <span className="text-base shrink-0">{s.icon}</span>
                    <span className="leading-snug group-hover:text-ndp-blue transition-colors">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages list */}
          {messages.map((msg, i) => {
            const professionals =
              msg.role === 'assistant' && msg.matchedIds && msg.matchedIds.length > 0
                ? getProfessionalsByIds(msg.matchedIds)
                : [];

            return (
              <div key={i} className="animate-fade-in">
                {msg.role === 'user' ? (
                  /* User message */
                  <div className="flex justify-end">
                    <div className="bg-ndp-blue text-white px-5 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed max-w-[75%] shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant message */
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-ndp-blue/8 rounded-xl flex items-center justify-center shrink-0 mt-1">
                      <Sparkles size={13} className="text-ndp-blue" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Text content */}
                      <div className="bg-ndp-bg/60 px-5 py-3.5 rounded-2xl rounded-tl-md text-sm text-ndp-text leading-relaxed border border-ndp-border/50">
                        {msg.content ? (
                          <div className="whitespace-pre-wrap">{renderText(msg.content)}</div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-ndp-muted">
                            <Loader2 size={14} className="animate-spin text-ndp-blue" />
                            <span className="text-xs">Analizzo il network...</span>
                          </div>
                        )}
                      </div>

                      {/* Professional cards */}
                      {professionals.length > 0 && (
                        <div className="animate-slide-up">
                          <div className="flex items-center gap-2 mb-3 px-1">
                            <CheckCircle2 size={12} className="text-green-500" />
                            <span className="text-[11px] font-semibold text-ndp-text">
                              {professionals.length} professionist{professionals.length === 1 ? 'a' : 'i'} trovat{professionals.length === 1 ? 'o' : 'i'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {professionals.map((p, idx) => (
                              <ChatProfessionalCard
                                key={p.id}
                                p={p}
                                rank={idx}
                                onOpen={onOpenProfessional}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up suggestions after assistant response with results */}
                      {msg.content && !isLoading && i === messages.length - 1 && professionals.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 animate-fade-in">
                          {FOLLOW_UP_SUGGESTIONS.slice(0, 3).map((s) => (
                            <button
                              key={s}
                              onClick={() => sendMessage(s)}
                              className="text-[10px] text-ndp-blue bg-ndp-blue/5 border border-ndp-blue/15 px-3 py-1.5 rounded-full hover:bg-ndp-blue/10 transition-all font-medium"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-ndp-border bg-white px-5 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div
            className={clsx(
              'flex items-center gap-3 bg-ndp-bg rounded-2xl px-4 py-3',
              'border-2 transition-all duration-200',
              isFocused
                ? 'border-ndp-blue/30 shadow-[0_0_0_4px_rgba(34,0,204,0.06)] bg-white'
                : 'border-transparent hover:border-ndp-border'
            )}
          >
            <Sparkles size={15} className="text-ndp-blue/40 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Descrivi la tua esigenza..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-ndp-text placeholder-ndp-muted/60 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                input.trim() && !isLoading
                  ? 'bg-ndp-blue text-white shadow-md hover:bg-ndp-blue-dark hover:shadow-lg active:scale-95'
                  : 'bg-transparent text-ndp-muted/30 cursor-not-allowed'
              )}
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <p className="text-[10px] text-ndp-muted/50 mt-2 text-center">
            AI powered · Risposte basate su profili verificati BNI · I dati sono demo
          </p>
        </div>
      </div>
    </div>
  );
}
