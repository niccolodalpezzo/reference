'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  matchedIds?: string[];
}

interface ChatInterfaceProps {
  initialQuery?: string;
  onMatchedIds: (ids: string[]) => void;
}

const SUGGESTIONS = [
  'Ho bisogno di un avvocato per diritto societario a Milano',
  'Cerco un commercialista esperto in startup a Bologna',
  'Agenzia immobiliare per vendita casa a Firenze',
  'Consulente IT per cybersecurity e cloud',
  'Dentista specializzato in estetica a Roma',
  'Coach executive per il mio team commerciale',
];

export default function ChatInterface({ initialQuery, onMatchedIds }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send initial query if provided
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

    // Add a placeholder for the streaming assistant message
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

        // Update streaming message
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: fullText,
          };
          return updated;
        });
      }

      // Extract matched IDs and update final message
      const matchedIds = extractMatchedIds(fullText);
      const cleanContent = cleanText(fullText);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: cleanContent,
          matchedIds,
        };
        return updated;
      });

      if (matchedIds.length > 0) {
        onMatchedIds(matchedIds);
      }
    } catch (err) {
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
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-ndp-navy rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Sparkles size={28} className="text-ndp-gold" />
            </div>
            <h3 className="font-display font-bold text-ndp-navy text-xl mb-2">
              Ciao! Sono l&apos;AI di NDP Reference
            </h3>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
              Dimmi di cosa hai bisogno e troverò il professionista giusto nella rete NDP.
              Scrivi in italiano naturale!
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-md">
              {SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs text-gray-600 bg-white border border-gray-100 hover:border-ndp-navy/30 hover:text-ndp-navy px-4 py-3 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx('flex gap-3 animate-fade-in', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {/* Avatar */}
            <div
              className={clsx(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                msg.role === 'user' ? 'bg-ndp-navy' : 'bg-ndp-gold/20'
              )}
            >
              {msg.role === 'user' ? (
                <User size={14} className="text-white" />
              ) : (
                <Bot size={14} className="text-ndp-navy" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={clsx(
                'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-ndp-navy text-white rounded-tr-sm'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
              )}
            >
              {msg.content ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Sto analizzando il network...</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Descrivi la tua esigenza in italiano..."
              disabled={isLoading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-ndp-navy/40 focus:ring-2 focus:ring-ndp-navy/10 transition-all disabled:opacity-50"
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-ndp-navy hover:bg-ndp-navy-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shrink-0"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI powered · Risponde in italiano · Professionisti verificati NDP
        </p>
      </div>
    </div>
  );
}
