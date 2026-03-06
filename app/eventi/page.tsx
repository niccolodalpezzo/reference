'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { chapters } from '@/lib/data';
import { Chapter } from '@/lib/types';
import {
  Send, MapPin, Clock, Users, Calendar, Sparkles, Navigation,
  ExternalLink, ChevronRight, Loader2, CheckCircle2, Building2
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

// Chapter with mock coordinates for map display
const CHAPTER_LOCATIONS: Record<string, { lat: number; lng: number; address: string }> = {
  'ch-mi-001': { lat: 45.464, lng: 9.191, address: 'Piazza del Duomo, Milano' },
  'ch-mi-002': { lat: 45.472, lng: 9.185, address: 'Via Brera 12, Milano' },
  'ch-mi-003': { lat: 45.531, lng: 9.217, address: 'Via Sesto San Giovanni, Milano Nord' },
  'ch-rm-001': { lat: 41.910, lng: 12.472, address: 'Viale Prati 8, Roma' },
  'ch-rm-002': { lat: 41.920, lng: 12.489, address: 'Viale Parioli 44, Roma' },
  'ch-to-001': { lat: 45.063, lng: 7.678, address: 'Corso Re Umberto 18, Torino' },
  'ch-to-002': { lat: 45.105, lng: 7.672, address: 'Via Lanzo 8, Torino Nord' },
  'ch-fi-001': { lat: 43.769, lng: 11.256, address: 'Via della Vigna Nuova, Firenze' },
  'ch-bo-001': { lat: 44.493, lng: 11.343, address: 'Via Indipendenza 5, Bologna' },
  'ch-na-001': { lat: 40.835, lng: 14.248, address: 'Via Partenope 36, Napoli' },
};

interface ChatMsg { role: 'user' | 'assistant'; content: string; chapter?: Chapter | null }

const CITY_ALIASES: Record<string, string> = {
  'mi': 'Milano', 'milano': 'Milano', 'milan': 'Milano',
  'rm': 'Roma', 'roma': 'Roma', 'rome': 'Roma',
  'to': 'Torino', 'torino': 'Torino', 'turin': 'Torino',
  'fi': 'Firenze', 'firenze': 'Firenze', 'florence': 'Firenze',
  'bo': 'Bologna', 'bologna': 'Bologna',
  'na': 'Napoli', 'napoli': 'Napoli', 'naples': 'Napoli',
};

function findNearestChapter(query: string): Chapter | null {
  const q = query.toLowerCase();
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (q.includes(alias)) {
      return chapters.find((c) => c.city === city) ?? null;
    }
  }
  // fallback: return first chapter
  return chapters[0];
}

function generateAIResponse(query: string): { text: string; chapter: Chapter | null } {
  const chapter = findNearestChapter(query);
  const loc = chapter ? CHAPTER_LOCATIONS[chapter.id] : null;

  if (!chapter) {
    return {
      text: 'Non ho trovato un capitolo nelle vicinanze. Prova a specificare la città (es. "Milano", "Roma", "Torino").',
      chapter: null,
    };
  }

  const mapsUrl = loc
    ? `https://maps.google.com/?q=${encodeURIComponent(loc.address)}`
    : '';

  const text = `Ho trovato il capitolo più vicino a te:

**${chapter.name}** — ${chapter.city}
📍 ${loc?.address ?? chapter.city}
📅 Incontri ogni **${chapter.meetingDay}** alle **${chapter.meetingTime}**
👥 ${chapter.memberCount} membri attivi

${chapter.description}

Puoi partecipare come ospite. È gratuito e senza impegno.`;

  return { text, chapter };
}

function MapPlaceholder({ highlighted, chapters: chaps }: { highlighted: Chapter | null; chapters: Chapter[] }) {
  // SVG-based map representation of Italy with chapter pins
  const cityPositions: Record<string, { x: number; y: number }> = {
    'Milano':  { x: 38, y: 18 },
    'Torino':  { x: 24, y: 22 },
    'Bologna': { x: 52, y: 35 },
    'Firenze': { x: 50, y: 45 },
    'Roma':    { x: 56, y: 62 },
    'Napoli':  { x: 65, y: 75 },
  };

  const shown = chaps.filter((c) => cityPositions[c.city]);
  const shownCities = shown.map((c) => c.city).filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(34,0,204,0.06)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Italy silhouette (approximate) */}
        <ellipse cx="50" cy="55" rx="22" ry="42" fill="rgba(34,0,204,0.04)" stroke="rgba(34,0,204,0.1)" strokeWidth="0.5" />

        {/* City pins */}
        {shownCities.map((city) => {
          const pos = cityPositions[city];
          const isHigh = highlighted?.city === city;
          return (
            <g key={city}>
              {isHigh && (
                <circle cx={pos.x} cy={pos.y} r="5" fill="rgba(201,168,76,0.2)" className="animate-ping" />
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHigh ? 3.5 : 2.5}
                fill={isHigh ? '#C9A84C' : '#2200CC'}
                stroke="white"
                strokeWidth="1"
              />
              <text x={pos.x + 4} y={pos.y + 1} fontSize="3.5" fill="#374151" fontFamily="sans-serif">
                {city}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 text-xs shadow-sm border border-ndp-border space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-ndp-blue border-2 border-white shadow-sm" />
          <span className="text-ndp-text">Capitolo NDP attivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-ndp-gold border-2 border-white shadow-sm" />
          <span className="text-ndp-text">Capitolo consigliato</span>
        </div>
      </div>

      {/* Chapter count */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs font-bold text-ndp-blue border border-ndp-border shadow-sm">
        {chaps.length} capitoli attivi
      </div>
    </div>
  );
}

function ChapterCard({ chapter, isHighlighted }: { chapter: Chapter; isHighlighted: boolean }) {
  const loc = CHAPTER_LOCATIONS[chapter.id];
  const mapsUrl = loc ? `https://maps.google.com/?q=${encodeURIComponent(loc.address)}` : '#';

  return (
    <div className={clsx(
      'rounded-2xl border p-4 transition-all',
      isHighlighted
        ? 'border-ndp-gold bg-ndp-gold/5 shadow-md'
        : 'border-ndp-border bg-white shadow-sm'
    )}>
      {isHighlighted && (
        <div className="inline-flex items-center gap-1 bg-ndp-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3">
          <Navigation size={9} /> Consigliato per te
        </div>
      )}
      <h3 className="font-semibold text-ndp-text text-sm mb-1">{chapter.name}</h3>
      <p className="text-xs text-ndp-muted mb-3 leading-snug">{chapter.description}</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: Calendar, label: chapter.meetingDay },
          { icon: Clock, label: chapter.meetingTime },
          { icon: Users, label: `${chapter.memberCount} membri` },
          { icon: MapPin, label: chapter.city },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[11px] text-ndp-muted">
            <Icon size={11} className="text-ndp-blue shrink-0" /> {label}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-ndp-blue text-white py-2 rounded-xl hover:bg-ndp-blue-dark transition-all"
        >
          <MapPin size={11} /> Apri su Maps
        </a>
        <Link
          href="/assistente"
          className="flex items-center justify-center gap-1 text-[11px] bg-ndp-bg text-ndp-text py-2 px-3 rounded-xl hover:bg-ndp-border border border-ndp-border transition-all"
        >
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}

export default function EventiPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([{
    role: 'assistant',
    content: 'Ciao! Sono il tuo assistente per gli eventi BNI. Dimmi la tua città o CAP e ti mostro il capitolo più vicino con orari e indirizzo.',
    chapter: null,
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedChapter, setHighlightedChapter] = useState<Chapter | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || isLoading) return;
    setInput('');

    const userMsg: ChatMsg = { role: 'user', content, chapter: null };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 800));

    const { text: aiText, chapter } = generateAIResponse(content);
    const aiMsg: ChatMsg = { role: 'assistant', content: aiText, chapter };
    setMessages((prev) => [...prev, aiMsg]);
    if (chapter) setHighlightedChapter(chapter);
    setIsLoading(false);
    inputRef.current?.focus();
  }, [input, isLoading]);

  const QUICK_SEARCHES = [
    { text: 'Trova evento a Milano', icon: '🏙️' },
    { text: 'Capitolo più vicino a Roma', icon: '🏛️' },
    { text: 'Eventi BNI a Torino', icon: '🚗' },
    { text: 'Capitolo a Bologna o Firenze', icon: '🎯' },
  ];

  const renderMsg = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/📍|📅|👥/g, (m) => m)
      .split('\n')
      .map((line, i) => <div key={i} className={line === '' ? 'h-2' : ''} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-ndp-bg">
      {/* Map — left */}
      <div className="flex-1 min-w-0 relative hidden md:block">
        <MapPlaceholder highlighted={highlightedChapter} chapters={chapters} />

        {/* Highlighted chapter card overlay */}
        {highlightedChapter && (
          <div className="absolute bottom-6 left-6 right-6 animate-slide-up">
            <ChapterCard chapter={highlightedChapter} isHighlighted />
          </div>
        )}
      </div>

      {/* Chat panel — right */}
      <div className="w-full md:w-[420px] flex flex-col bg-white border-l border-ndp-border shrink-0">
        {/* Header */}
        <div className="bg-ndp-blue px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-sm">Trova evento BNI</h1>
              <p className="text-white/60 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                AI attiva · {chapters.length} capitoli nella rete
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={clsx('animate-fade-in', msg.role === 'user' ? 'flex justify-end' : 'flex gap-2.5')}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-ndp-blue/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-ndp-blue" />
                </div>
              )}
              <div className={clsx(
                'rounded-2xl text-sm leading-relaxed max-w-[85%]',
                msg.role === 'user'
                  ? 'bg-ndp-blue text-white px-4 py-3 rounded-br-md'
                  : 'bg-ndp-bg/60 border border-ndp-border/60 px-4 py-3 rounded-tl-md text-ndp-text'
              )}>
                {msg.role === 'assistant' ? renderMsg(msg.content) : msg.content}

                {/* Chapter detail card in chat */}
                {msg.chapter && (
                  <div className="mt-3 bg-white rounded-xl border border-ndp-border overflow-hidden">
                    <div className="bg-ndp-blue/5 px-3 py-2 flex items-center gap-2 border-b border-ndp-border">
                      <Building2 size={12} className="text-ndp-blue" />
                      <span className="text-xs font-semibold text-ndp-text">{msg.chapter.name}</span>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {[
                        { icon: Calendar, label: `${msg.chapter.meetingDay} alle ${msg.chapter.meetingTime}` },
                        { icon: Users, label: `${msg.chapter.memberCount} membri` },
                        { icon: MapPin, label: CHAPTER_LOCATIONS[msg.chapter.id]?.address ?? msg.chapter.city },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-[11px] text-ndp-muted">
                          <Icon size={11} className="text-ndp-blue shrink-0" />
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="px-3 pb-3 flex gap-2">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(CHAPTER_LOCATIONS[msg.chapter.id]?.address ?? msg.chapter.city)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold bg-ndp-blue text-white py-2 rounded-xl hover:bg-ndp-blue-dark"
                      >
                        <MapPin size={11} /> Apri su Maps
                      </a>
                      <button
                        onClick={() => sendMessage(`Altri capitoli vicini a ${msg.chapter!.city}`)}
                        className="flex items-center justify-center gap-1 text-[11px] bg-ndp-bg text-ndp-text py-2 px-3 rounded-xl border border-ndp-border hover:bg-ndp-border"
                      >
                        Alternative
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2.5 animate-fade-in">
              <div className="w-7 h-7 bg-ndp-blue/10 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-ndp-blue" />
              </div>
              <div className="bg-ndp-bg border border-ndp-border px-4 py-3 rounded-2xl rounded-tl-md">
                <Loader2 size={14} className="animate-spin text-ndp-blue" />
              </div>
            </div>
          )}
        </div>

        {/* Quick searches (shown when only 1 message = welcome) */}
        {messages.length === 1 && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-2">
            {QUICK_SEARCHES.map((q) => (
              <button
                key={q.text}
                onClick={() => sendMessage(q.text)}
                className="flex items-start gap-2 text-left text-[11px] bg-ndp-bg border border-ndp-border rounded-xl px-3 py-2.5 hover:border-ndp-blue/30 hover:bg-white transition-all"
              >
                <span className="text-sm shrink-0">{q.icon}</span>
                <span className="text-ndp-text leading-snug">{q.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-ndp-border bg-white px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 bg-ndp-bg rounded-2xl px-4 py-2.5 border-2 border-transparent focus-within:border-ndp-blue/25 focus-within:bg-white transition-all">
            <MapPin size={14} className="text-ndp-blue/40 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Scrivi la tua città o CAP..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-ndp-text placeholder-ndp-muted/60 outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className={clsx(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all',
                input.trim() && !isLoading
                  ? 'bg-ndp-blue text-white hover:bg-ndp-blue-dark'
                  : 'bg-transparent text-ndp-muted/30 cursor-not-allowed'
              )}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
