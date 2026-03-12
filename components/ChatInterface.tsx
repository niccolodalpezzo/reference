'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Loader2, RotateCcw,
  Sparkles, ChevronRight, Star, MapPin, Award, TrendingUp,
  CheckCircle2, Lock, MessageCircle, ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import { getProfessionalsByIds } from '@/lib/utils';
import { Professional } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  ChatMessage,
  getChatMessages,
  upsertChat,
  migrateLegacyChat,
} from '@/lib/chatStorage';
import Link from 'next/link';

interface ChatInterfaceProps {
  chatId: string | null;
  initialQuery?: string;
  onOpenProfessional?: (pro: Professional) => void;
  onChatUpdated?: (chatId: string) => void;
}

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

// ─── Professional card ────────────────────────────────────────────────────────
function ChatProfessionalCard({
  p,
  rank,
  onOpen,
  isGuest,
  aiReasoning,
}: {
  p: Professional;
  rank: number;
  onOpen?: (pro: Professional) => void;
  isGuest: boolean;
  aiReasoning?: string;
}) {
  const isFirst = rank === 0;

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border transition-all duration-200 group p-5',
        isFirst
          ? 'border-ndp-blue/30 shadow-[0_4px_20px_rgba(34,0,204,0.10)] ring-1 ring-ndp-blue/8'
          : 'border-ndp-border shadow-md hover:shadow-xl',
        isGuest && 'opacity-90',
      )}
      onClick={() => !isGuest && onOpen?.(p)}
      style={{ cursor: isGuest ? 'default' : 'pointer' }}
    >
      {isGuest && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest bg-ndp-gold/12 text-ndp-gold-dark border border-ndp-gold/25 rounded-lg px-2.5 py-1">
            <Lock size={9} />
            Disponibile ai professionisti registrati
          </span>
        </div>
      )}

      <div className="flex items-start gap-3.5 mb-4">
        <div className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform group-hover:scale-105',
          isFirst ? 'bg-ndp-blue shadow-sm' : 'bg-ndp-blue/80',
        )}>
          {getInitials(p.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={clsx('text-sm font-semibold text-ndp-text truncate', !isGuest && 'group-hover:text-ndp-blue transition-colors')}>
              {p.name}
            </h4>
            {p.isTopOfMonth && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-ndp-gold/15 text-ndp-gold-dark border border-ndp-gold/20 rounded-lg px-2 py-0.5">
                <Award size={9} />Top del mese
              </span>
            )}
          </div>
          <p className="text-xs text-ndp-muted mt-0.5 truncate">{p.profession}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-ndp-muted"><MapPin size={10} /> {p.city}</span>
            {p.chapter && <span className="text-[11px] text-ndp-muted truncate">· {p.chapter}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-ndp-border/70">
        <div className="flex items-center gap-1">
          <Star size={11} className="text-ndp-gold" fill="currentColor" />
          <span className="text-xs font-bold text-ndp-text">{p.rating}</span>
        </div>
        <span className="text-[11px] text-ndp-muted">{p.referralsGiven} referral</span>
        <span className="text-[11px] text-ndp-muted">{p.yearsInNDP} anni NDP</span>
        {p.monthScore && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-ndp-blue">
            <TrendingUp size={10} /> {p.monthScore} pt
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {p.specialties.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] bg-ndp-blue/7 text-ndp-blue px-2.5 py-1 rounded-lg font-medium">{s}</span>
        ))}
        {p.specialties.length > 3 && (
          <span className="text-[10px] text-ndp-muted px-1 py-1">+{p.specialties.length - 3}</span>
        )}
      </div>

      {aiReasoning && (
        <div className="bg-ndp-blue/4 rounded-xl px-3.5 py-2.5 mb-4 border border-ndp-blue/8">
          <p className="text-[10px] uppercase tracking-widest text-ndp-blue/50 font-semibold mb-1">Perché te lo consiglio</p>
          <p className="text-[11px] text-ndp-text/70 leading-relaxed">{aiReasoning}</p>
        </div>
      )}

      <div className="flex gap-2">
        {isGuest ? (
          <Link
            href="/registrazione"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-ndp-blue/8 text-ndp-blue py-2.5 rounded-xl hover:bg-ndp-blue hover:text-white transition-all duration-200 border border-ndp-blue/15"
          >
            <Lock size={11} />Sblocca profilo
          </Link>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen?.(p); }}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold bg-ndp-blue text-white py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Apri profilo <ChevronRight size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen?.(p); }}
              className="flex items-center justify-center gap-1 text-xs bg-ndp-bg text-ndp-text py-2.5 px-3.5 rounded-xl hover:bg-ndp-border transition-all border border-ndp-border"
            >
              <MessageCircle size={11} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Guest teaser panel ───────────────────────────────────────────────────────
function GuestTeaserPanel() {
  return (
    <div className="mt-2 animate-fade-in">
      <div className="bg-gradient-to-br from-ndp-blue/6 via-ndp-bg to-ndp-bg border border-ndp-blue/15 rounded-2xl px-6 py-5">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 bg-ndp-blue/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={16} className="text-ndp-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ndp-text mb-1">Stai vedendo una preview dell&apos;Assistente AI</p>
            <p className="text-xs text-ndp-muted leading-relaxed mb-4">
              Registrandoti come Professionista puoi aprire i profili completi, salvare le ricerche e iniziare conversazioni dirette.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/registrazione"
                className="inline-flex items-center gap-2 bg-ndp-blue text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all shadow-sm"
              >
                Registrati gratuitamente <ArrowRight size={12} />
              </Link>
              <Link href="/login" className="text-xs text-ndp-blue font-medium hover:underline">Accedi</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ isGuest, onSend }: { isGuest: boolean; onSend: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[54vh] text-center px-4 animate-fade-in">
      {isGuest && (
        <div className="mb-5 inline-flex items-center gap-2 bg-ndp-gold/10 border border-ndp-gold/25 text-ndp-gold-dark text-[11px] font-semibold rounded-full px-4 py-1.5 animate-bounce-in">
          <span className="w-1.5 h-1.5 bg-ndp-gold rounded-full" />
          Anteprima gratuita · Registrati per sbloccare tutto
        </div>
      )}
      <div className="relative mb-7">
        <div className="absolute inset-0 bg-ndp-blue/8 rounded-3xl blur-2xl scale-150" />
        <div className="relative w-[72px] h-[72px] bg-ndp-blue rounded-3xl flex items-center justify-center shadow-[0_8px_32px_rgba(34,0,204,0.25)]">
          <Sparkles size={32} className="text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse-slow" />
        </div>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-ndp-blue/60 bg-ndp-blue/8 px-3 py-1 rounded-full mb-3">
        Assistente AI
      </span>
      <h2 className="font-display text-3xl font-bold text-ndp-text mb-3 leading-tight">Descrivi il tuo bisogno</h2>
      <p className="text-ndp-muted text-base max-w-md leading-relaxed mb-10">
        Ti trovo il professionista giusto nella rete NDP in linguaggio naturale.
      </p>
      <div
        className="w-full max-w-lg bg-ndp-bg/80 border border-ndp-border rounded-2xl px-5 py-4 text-left cursor-pointer hover:border-ndp-blue/30 hover:bg-white hover:shadow-sm transition-all duration-200 group"
        onClick={() => onSend("Ho trovato una vecchia borsa vintage ma la pelle è rovinata. Cerco qualcuno che possa sistemarla.")}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-ndp-muted mb-2">Esempio di richiesta</p>
        <p className="text-sm text-ndp-text/80 italic leading-relaxed group-hover:text-ndp-text transition-colors">
          &ldquo;Ho trovato una vecchia borsa vintage ma la pelle è rovinata. Cerco qualcuno che possa sistemarla.&rdquo;
        </p>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ndp-border/60">
          <span className="text-[10px] text-ndp-muted font-medium">Problema</span>
          <span className="text-[10px] text-ndp-muted/40">→</span>
          <span className="text-[10px] text-ndp-muted font-medium">Contesto</span>
          <span className="text-[10px] text-ndp-muted/40">→</span>
          <span className="text-[10px] text-ndp-muted font-medium">Risultato desiderato</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatInterface({ chatId, initialQuery, onOpenProfessional, onChatUpdated }: ChatInterfaceProps) {
  const { user } = useAuth();
  const isGuest = user === null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const localChatId = useRef<string | null>(chatId);

  useEffect(() => { if (!isGuest) migrateLegacyChat(); }, [isGuest]);

  useEffect(() => {
    if (chatId) {
      setMessages(getChatMessages(chatId));
      localChatId.current = chatId;
    } else {
      setMessages([]);
      localChatId.current = null;
    }
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (container) requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (initialQuery && !initialized.current) {
      initialized.current = true;
      sendMessage(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const persistMessages = useCallback((msgs: ChatMessage[]) => {
    if (msgs.length === 0) return;
    if (isGuest) return; // never persist guest sessions
    const id = upsertChat(localChatId.current, msgs);
    localChatId.current = id;
    onChatUpdated?.(id);
  }, [onChatUpdated, isGuest]);

  const clearChat = () => {
    setMessages([]);
    localChatId.current = null;
    onChatUpdated?.('');
  };

  const extractMatchedIds = (text: string): string[] => {
    const match = text.match(/MATCHED_IDS:\[([^\]]*)\]/);
    if (!match) return [];
    try { return JSON.parse(`[${match[1]}]`); } catch { return []; }
  };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    if (!isGuest) {
      const id = upsertChat(localChatId.current, newMessages);
      localChatId.current = id;
      onChatUpdated?.(id);
    }

    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })) }),
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
      const cleanContent = fullText.replace(/MATCHED_IDS:\[([^\]]*)\]/g, '').trim();
      const finalMessages: ChatMessage[] = [...newMessages, { role: 'assistant', content: cleanContent, matchedIds }];
      setMessages(finalMessages);
      persistMessages(finalMessages);
    } catch {
      const errorMessages: ChatMessage[] = [
        ...newMessages,
        { role: 'assistant', content: 'Mi dispiace, si è verificato un errore. Riprova tra un momento.' },
      ];
      setMessages(errorMessages);
      persistMessages(errorMessages);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const getReasoningForPro = (msgContent: string, proName: string): string => {
    const lines = msgContent.split('\n').filter(Boolean);
    const relevant = lines.find(
      (l) => l.toLowerCase().includes(proName.split(' ')[0].toLowerCase()) && l.length > 30
    );
    return relevant ? renderText(relevant).slice(0, 130) : '';
  };

  const hasResults = messages.some((m) => m.role === 'assistant' && m.matchedIds && m.matchedIds.length > 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-ndp-border flex items-center gap-3 bg-white shrink-0">
        <div className="w-9 h-9 bg-ndp-blue rounded-xl flex items-center justify-center shadow-sm">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-ndp-text text-sm">Assistente AI</h2>
            {isGuest && (
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5">
                Preview
              </span>
            )}
          </div>
          <p className="text-[10px] text-ndp-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-slow" />
            Online · Professionisti verificati NDP
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} title="Nuova conversazione" className="p-2 rounded-lg text-ndp-muted hover:text-ndp-blue hover:bg-ndp-bg transition-colors">
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
          {messages.length === 0 && <WelcomeScreen isGuest={isGuest} onSend={sendMessage} />}

          {messages.map((msg, i) => {
            const professionals = msg.role === 'assistant' && msg.matchedIds?.length
              ? getProfessionalsByIds(msg.matchedIds) : [];
            const isLast = i === messages.length - 1;

            return (
              <div key={i} className="animate-fade-in">
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-ndp-blue text-white px-5 py-3.5 rounded-2xl rounded-br-sm text-sm leading-relaxed max-w-[75%] shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3.5">
                    <div className="w-9 h-9 bg-ndp-blue/8 rounded-xl flex items-center justify-center shrink-0 mt-1 border border-ndp-blue/10">
                      <Sparkles size={14} className="text-ndp-blue" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="bg-ndp-bg/50 px-5 py-4 rounded-2xl rounded-tl-sm text-sm text-ndp-text leading-relaxed border border-ndp-border/60">
                        {msg.content ? (
                          <div className="whitespace-pre-wrap">{renderText(msg.content)}</div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-ndp-muted">
                            <Loader2 size={14} className="animate-spin text-ndp-blue" />
                            <span className="text-xs">Analizzo il network...</span>
                          </div>
                        )}
                      </div>

                      {professionals.length > 0 && (
                        <div className="animate-slide-up space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <CheckCircle2 size={13} className="text-green-500" />
                            <span className="text-xs font-semibold text-ndp-text">
                              {professionals.length} professionist{professionals.length === 1 ? 'a' : 'i'} selezionat{professionals.length === 1 ? 'o' : 'i'}
                            </span>
                            {isGuest && <span className="ml-auto text-[10px] text-ndp-muted italic">Accedi per sbloccare i profili</span>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {professionals.map((p, idx) => (
                              <ChatProfessionalCard
                                key={p.id} p={p} rank={idx}
                                onOpen={onOpenProfessional}
                                isGuest={isGuest}
                                aiReasoning={msg.content ? getReasoningForPro(msg.content, p.name) : undefined}
                              />
                            ))}
                          </div>
                          {isGuest && isLast && <GuestTeaserPanel />}
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

      {/* ── Input bar ── */}
      <div className="border-t border-ndp-border bg-white px-5 py-5 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className={clsx(
            'flex items-center gap-3 rounded-2xl px-5 py-4 transition-all duration-200 border-2 bg-ndp-bg',
            isFocused
              ? 'border-ndp-blue bg-white shadow-[0_0_0_4px_rgba(34,0,204,0.08)]'
              : 'border-transparent hover:border-ndp-border hover:bg-white'
          )}>
            <Sparkles size={18} className={clsx('shrink-0 transition-colors', isFocused ? 'text-ndp-blue' : 'text-ndp-muted/40')} />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Descrivi il tuo bisogno in parole semplici..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-ndp-text placeholder-ndp-muted/50 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                input.trim() && !isLoading
                  ? 'bg-ndp-blue text-white shadow-md hover:bg-ndp-blue-dark hover:shadow-lg active:scale-95'
                  : 'bg-ndp-bg text-ndp-muted/30 cursor-not-allowed border border-ndp-border'
              )}
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>

          {isGuest && !hasResults && (
            <p className="text-[11px] text-ndp-muted/60 mt-2.5 text-center">
              Stai usando l&apos;Assistente in modalità preview.{' '}
              <Link href="/login" className="text-ndp-blue hover:underline font-medium">Accedi</Link>{' '}
              o{' '}
              <Link href="/registrazione" className="text-ndp-blue hover:underline font-medium">registrati</Link>{' '}
              per accedere a tutte le funzioni.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
