'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { getProfessionalsByIds } from '@/lib/utils';
import ProfessionalCard from '@/components/ProfessionalCard';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  matchedIds?: string[];
}

interface ChatInterfaceProps {
  initialQuery?: string;
}

const SUGGESTIONS = [
  'Ho bisogno di un avvocato per diritto societario a Milano',
  'Cerco un commercialista esperto in startup a Bologna',
  'Agenzia immobiliare per vendita casa a Firenze',
  'Consulente IT per cybersecurity e cloud',
  'Dentista specializzato in estetica a Roma',
  'Coach executive per il mio team commerciale',
];

const renderText = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,3}\s/gm, '')
    .trim();
};

export default function ChatInterface({ initialQuery }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialQuery && !initialized.current) {
      initialized.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  const extractMatchedIds = (text: string): string[] => {
    const match = text.match(/MATCHED_IDS:\[([^\]]*)\]/);
    if (!match) return [];
    try {
      return JSON.parse(`[${match[1]}]`);
    } catch {
      return [];
    }
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
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0">
        <div className="w-8 h-8 bg-ndp-navy rounded-lg flex items-center justify-center">
          <Sparkles size={15} className="text-ndp-gold" />
        </div>
        <div>
          <h1 className="font-semibold text-ndp-navy text-sm">NDP AI Search</h1>
          <p className="text-xs text-gray-400">Intelligenza artificiale per il networking</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

          {/* Welcome screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-ndp-gold/20 rounded-3xl blur-xl" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-ndp-navy to-ndp-navy-dark rounded-3xl flex items-center justify-center shadow-lg">
                  <Sparkles size={36} className="text-ndp-gold" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-ndp-navy mb-2">
                Trova il professionista giusto
              </h2>
              <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-8">
                Descrivi la tua esigenza in italiano naturale. L&apos;AI analizzerà la rete NDP
                e ti presenterà i profili più adatti.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs text-gray-600 bg-white px-4 py-3 rounded-2xl border border-gray-100 hover:border-ndp-navy/30 hover:text-ndp-navy transition-all duration-150 shadow-sm hover:shadow flex items-start gap-2"
                  >
                    <span className="text-ndp-gold shrink-0 mt-0.5 font-medium">→</span>
                    <span>{s}</span>
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
              <div
                key={i}
                className={clsx(
                  'flex gap-3 animate-fade-in',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div
                  className={clsx(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                    msg.role === 'user' ? 'bg-ndp-navy' : 'bg-ndp-gold/15'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Bot size={14} className="text-ndp-navy" />
                  )}
                </div>

                {/* Content column */}
                <div
                  className={clsx(
                    'flex flex-col gap-3',
                    msg.role === 'user' ? 'items-end max-w-[75%]' : 'items-start max-w-[85%]'
                  )}
                >
                  {/* Text bubble */}
                  <div
                    className={clsx(
                      'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-ndp-navy text-white rounded-tr-sm'
                        : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-tl-sm'
                    )}
                  >
                    {msg.content ? (
                      <div className="whitespace-pre-wrap">{renderText(msg.content)}</div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs">Sto analizzando il network...</span>
                      </div>
                    )}
                  </div>

                  {/* Inline professional cards carousel */}
                  {professionals.length > 0 && (
                    <div className="w-full animate-slide-in">
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {professionals.map((p, idx) => (
                          <div key={p.id} className="shrink-0 w-60">
                            <ProfessionalCard
                              professional={p}
                              highlighted={idx === 0}
                              inline
                            />
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/professionisti"
                        className="inline-flex items-center gap-1.5 text-xs text-ndp-navy/50 hover:text-ndp-navy mt-1.5 transition-colors"
                      >
                        Vedi tutti i professionisti
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium input bar */}
      <div className="border-t border-gray-100 bg-white px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div
            className={clsx(
              'flex items-center gap-3 bg-white rounded-2xl px-4 py-3',
              'border-2 transition-all duration-200 shadow-sm',
              isFocused
                ? 'border-ndp-navy/40 shadow-[0_0_0_4px_rgba(27,43,107,0.07)]'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Sparkles size={16} className="text-ndp-gold shrink-0" />
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
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                input.trim() && !isLoading
                  ? 'bg-gradient-to-br from-ndp-navy to-ndp-navy-dark text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI powered · Risponde in italiano · Professionisti verificati NDP
          </p>
        </div>
      </div>
    </div>
  );
}
