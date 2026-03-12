'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Sparkles, Loader2, MapPin, Calendar, Users, Clock,
  Zap, UserPlus, UserCheck, Lock, CheckCircle2, ArrowRight, CalendarX,
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import EventCard, { getEventBadge } from '@/components/eventi/EventCard';
import {
  getActiveEvents,
  registerForEvent,
  unregisterFromEvent,
  getRegistrationCountsBatch,
  getUserRegisteredEventIds,
  type EventRow,
} from '@/lib/db/events';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

// ─── Utilities ────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function generateReasoning(event: EventRow, userCity: string | null): string {
  if (userCity && event.citta.toLowerCase().includes(userCity.toLowerCase())) {
    return `Evento nel tuo territorio — ${event.citta}. Ottima occasione per incontrare professionisti della tua area.`;
  }
  const days = daysUntil(event.data_evento);
  if (days < 0) return `Evento recente nella rete NDP. Torna presto per i prossimi appuntamenti.`;
  if (days === 0) return `Evento in programma oggi. Non perdere l'occasione.`;
  if (days === 1) return `Domani. Tra i più imminenti in tutta la rete.`;
  if (days <= 7) return `In programma tra ${days} giorni. Tra gli eventi più vicini nel calendario NDP.`;
  if (days <= 30) return `Nei prossimi ${days} giorni. Ideale per pianificare la tua presenza.`;
  return `Evento selezionato nella rete NDP. Aperto a tutti i professionisti verificati.`;
}

function getRecommended(events: EventRow[], userCity: string | null): EventRow[] {
  const today = new Date().toISOString().split('T')[0];
  const active = events.filter((e) => e.status === 'attivo' && e.data_evento >= today);
  if (!active.length) return events.slice(0, 3);

  // Prioritise: user's city → soonest
  const cityMatch = userCity
    ? active.filter((e) => e.citta.toLowerCase().includes(userCity.toLowerCase()))
    : [];
  const others = active.filter((e) => !cityMatch.includes(e));
  const sorted = [...cityMatch, ...others].sort(
    (a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime(),
  );
  return sorted.slice(0, 3);
}

// ─── Intent chips ─────────────────────────────────────────────────────────────

const INTENT_CHIPS = [
  { key: 'prossimi', label: 'In arrivo' },
  { key: 'week', label: 'Questa settimana' },
  { key: 'networking', label: 'Per networking' },
  { key: 'local', label: 'Vicino a me' },
] as const;

type IntentKey = (typeof INTENT_CHIPS)[number]['key'];

// ─── Concierge card (left panel) ─────────────────────────────────────────────

function ConciergeCard({
  event,
  isGuest,
  isRegistered,
  registrationCount,
  isHighlighted,
  onRegister,
  onUnregister,
  onFocus,
  userCity,
}: {
  event: EventRow;
  isGuest: boolean;
  isRegistered: boolean;
  registrationCount: number;
  isHighlighted: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  onFocus: () => void;
  userCity: string | null;
}) {
  const badge = getEventBadge(event, registrationCount);
  const reasoning = generateReasoning(event, userCity);
  const days = daysUntil(event.data_evento);

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer group',
        isHighlighted
          ? 'border-ndp-blue ring-2 ring-ndp-blue/15 shadow-lg'
          : 'border-ndp-border hover:border-ndp-blue/30 hover:shadow-lg',
      )}
      onClick={onFocus}
    >
      {/* Gradient top bar */}
      <div className={clsx(
        'h-1.5',
        event.status === 'attivo'
          ? 'bg-gradient-to-r from-ndp-blue via-ndp-blue-mid to-indigo-400'
          : event.status === 'annullato' ? 'bg-red-400' : 'bg-gray-300',
      )} />

      {/* Header */}
      <div className="px-5 pt-4 pb-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {event.status === 'attivo' && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Attivo
            </span>
          )}
          {event.status === 'annullato' && (
            <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
              Annullato
            </span>
          )}
          {badge && (
            <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', badge.className)}>
              {badge.label}
            </span>
          )}
          {days >= 0 && days <= 30 && (
            <span className="ml-auto text-[10px] text-ndp-muted font-medium">
              {days === 0 ? 'Oggi' : days === 1 ? 'Domani' : `Tra ${days}gg`}
            </span>
          )}
        </div>
        <h3 className="font-display font-bold text-ndp-text text-base leading-snug group-hover:text-ndp-blue transition-colors">
          {event.titolo}
        </h3>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-ndp-muted">
          <span className="flex items-center gap-1.5">
            <MapPin size={11} className="text-ndp-blue shrink-0" />
            {event.citta}{event.regione ? `, ${event.regione}` : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="text-ndp-blue shrink-0" />
            {formatDate(event.data_evento)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-ndp-blue shrink-0" />
            {formatTime(event.orario_evento)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={11} className="text-ndp-blue shrink-0" />
            {registrationCount} iscritti
          </span>
        </div>

        {/* AI Reasoning */}
        <div className="bg-ndp-blue/4 border border-ndp-blue/10 rounded-xl px-3.5 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ndp-blue/50 mb-1 flex items-center gap-1">
            <Sparkles size={9} /> Perché te lo consigliamo
          </p>
          <p className="text-xs text-ndp-text/70 leading-relaxed">{reasoning}</p>
        </div>

        {/* Address if available */}
        {event.indirizzo && (
          <p className="text-[11px] text-ndp-muted truncate">{event.indirizzo}</p>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5" onClick={(e) => e.stopPropagation()}>
        {isGuest ? (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-ndp-blue bg-ndp-blue/7 border border-ndp-blue/20 py-2.5 rounded-xl hover:bg-ndp-blue hover:text-white transition-all duration-200"
          >
            <Lock size={13} /> Accedi per iscriverti
          </Link>
        ) : event.status !== 'attivo' ? (
          <span className="w-full flex items-center justify-center text-sm text-ndp-muted bg-ndp-bg border border-ndp-border py-2.5 rounded-xl">
            {event.status === 'annullato' ? 'Evento annullato' : 'Evento concluso'}
          </span>
        ) : isRegistered ? (
          <div className="space-y-2">
            <div className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-green-500 text-white py-2.5 rounded-xl">
              <UserCheck size={14} /> Sei iscritto
            </div>
            <button
              onClick={() => onUnregister()}
              className="w-full text-xs text-ndp-muted hover:text-red-500 transition-colors text-center"
            >
              Annulla iscrizione
            </button>
          </div>
        ) : (
          <button
            onClick={() => onRegister()}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-ndp-blue text-white py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <UserPlus size={14} /> Iscriviti <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Premium empty state ──────────────────────────────────────────────────────

function PremiumEmptyState({ isGuest }: { isGuest: boolean }) {
  const features = [
    'Trovare eventi di networking nella tua città',
    'Iscriverti con un click ai prossimi incontri',
    'Incontrare professionisti verificati NDP',
    'Scoprire workshop e sessioni formative',
  ];

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl text-center">
        {/* Icon */}
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 bg-ndp-blue/10 rounded-3xl blur-2xl scale-150" />
          <div className="relative w-20 h-20 bg-white border border-ndp-border rounded-3xl flex items-center justify-center shadow-sm">
            <CalendarX size={34} className="text-ndp-blue/40" />
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-ndp-text mb-3">
          Nessun evento disponibile al momento
        </h2>
        <p className="text-ndp-muted text-sm leading-relaxed mb-8 max-w-md mx-auto">
          Gli eventi torneranno presto. Questa sezione ospita incontri reali di networking,
          workshop territoriali e occasioni selezionate dalla rete NDP.
        </p>

        {/* What you can do here */}
        <div className="bg-white border border-ndp-border rounded-2xl p-6 mb-8 text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-ndp-muted mb-4">
            Cosa potrai fare qui
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-ndp-text">
                <CheckCircle2 size={15} className="text-ndp-blue shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {isGuest ? (
            <>
              <Link
                href="/registrazione"
                className="inline-flex items-center gap-2 bg-ndp-blue text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-ndp-blue-dark transition-all shadow-sm"
              >
                Registrati per essere notificato <ArrowRight size={14} />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-ndp-muted border border-ndp-border px-5 py-3 rounded-xl hover:border-ndp-blue/30 hover:text-ndp-text transition-all"
              >
                Torna alla home
              </Link>
            </>
          ) : (
            <Link
              href="/professionisti/dashboard"
              className="inline-flex items-center gap-2 bg-ndp-blue text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-ndp-blue-dark transition-all shadow-sm"
            >
              Vai alla dashboard <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 bg-ndp-blue/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 size={22} className="text-ndp-blue animate-spin" />
        </div>
        <p className="text-sm text-ndp-muted">Caricamento eventi...</p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EventiPage() {
  const { user } = useAuth();
  const isGuest = !user;
  const userCity = user?.city ?? null;

  const [events, setEvents] = useState<EventRow[]>([]);
  const [filtered, setFiltered] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeChip, setActiveChip] = useState<IntentKey | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  // ── Fetch events with timeout guard ────────────────────────────────────────
  useEffect(() => {
    withTimeout(getActiveEvents(), 8000, [])
      .then((data) => {
        setEvents(data);
        setFiltered(data);
      })
      .catch(() => {
        setEvents([]);
        setFiltered([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Batch-load counts + user registrations whenever events or auth changes ──
  useEffect(() => {
    if (!events.length) return;
    const ids = events.map((e) => e.id);
    // Single query for counts — replaces N individual getRegistrationCount() calls
    getRegistrationCountsBatch(ids).then(setRegistrationCounts);
    // Single query for user's registrations
    if (user) {
      getUserRegisteredEventIds(user.id, ids).then((set) => setRegisteredIds(set));
    }
  }, [events, user]);

  // ── Realtime: refresh counts when any registration changes ─────────────────
  useEffect(() => {
    if (!events.length) return;
    const ids = events.map((e) => e.id);
    const supabase = createClient();
    const channel = supabase
      .channel('eventi-registrations-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        () => {
          getRegistrationCountsBatch(ids).then(setRegistrationCounts);
          if (user) getUserRegisteredEventIds(user.id, ids).then((set) => setRegisteredIds(set));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, user?.id]);

  // ── Filter helpers ──────────────────────────────────────────────────────────
  function applyDateFilter(evts: EventRow[], chip: IntentKey | null): EventRow[] {
    const today = new Date().toISOString().split('T')[0];
    const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (chip === 'prossimi') return evts.filter((e) => e.data_evento >= today && e.data_evento <= in30);
    if (chip === 'week') return evts.filter((e) => e.data_evento >= today && e.data_evento <= in7);
    if (chip === 'local') {
      if (!userCity) return evts;
      const local = evts.filter((e) => e.citta.toLowerCase().includes(userCity.toLowerCase()));
      return local.length > 0 ? local : evts;
    }
    return evts;
  }

  // ── AI search ───────────────────────────────────────────────────────────────
  const handleSearch = useCallback(async (q: string) => {
    setActiveChip(null);
    if (!q.trim()) {
      setFiltered(events);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch('/api/events-search', {
        method: 'POST',
        body: JSON.stringify({ query: q, events }),
        headers: { 'Content-Type': 'application/json' },
      });
      const { matchedIds } = await res.json();
      const ordered = (matchedIds as string[])
        .map((id) => events.find((e) => e.id === id))
        .filter(Boolean) as EventRow[];
      setFiltered(ordered.length > 0 ? ordered : events);
    } catch {
      const q2 = q.toLowerCase();
      setFiltered(events.filter(
        (e) => e.titolo.toLowerCase().includes(q2) || e.citta.toLowerCase().includes(q2) ||
               (e.regione ?? '').toLowerCase().includes(q2),
      ));
    } finally {
      setIsSearching(false);
    }
  }, [events]);

  // ── Intent chip handler ────────────────────────────────────────────────────
  function handleChip(chip: IntentKey) {
    if (activeChip === chip) {
      setActiveChip(null);
      setFiltered(events);
      setQuery('');
      return;
    }
    setActiveChip(chip);
    setQuery('');

    if (chip === 'networking') {
      setQuery('networking');
      handleSearch('networking');
    } else {
      setFiltered(applyDateFilter(events, chip));
    }
  }

  // ── Registration handlers ──────────────────────────────────────────────────
  async function handleRegister(eventId: string) {
    if (!user) return;
    setRegisteringId(eventId);
    await registerForEvent(eventId, user.id);
    setRegisteredIds((prev) => new Set(Array.from(prev).concat(eventId)));
    setRegistrationCounts((prev) => ({ ...prev, [eventId]: (prev[eventId] ?? 0) + 1 }));
    setRegisteringId(null);
  }

  async function handleUnregister(eventId: string) {
    if (!user) return;
    setRegisteringId(eventId);
    await unregisterFromEvent(eventId, user.id);
    setRegisteredIds((prev) => { const s = new Set(prev); s.delete(eventId); return s; });
    setRegistrationCounts((prev) => ({ ...prev, [eventId]: Math.max(0, (prev[eventId] ?? 1) - 1) }));
    setRegisteringId(null);
  }

  const recommended = getRecommended(events, userCity);
  const hasEvents = events.length > 0;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-ndp-bg">

      {/* ── A. Intro Header ── */}
      <div className="bg-white border-b border-ndp-border shrink-0 px-5 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-display font-bold text-ndp-text text-lg leading-none">
                  Eventi NDP
                </h1>
                {isGuest && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2 py-0.5">
                    Preview
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ndp-muted hidden sm:block">
                Il lato vivo della rete — incontri reali, networking territoriale
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {[
                { icon: <Zap size={10} />, label: 'Networking reale' },
                { icon: <MapPin size={10} />, label: 'Presenza territoriale' },
                { icon: <Users size={10} />, label: 'Occasioni selezionate' },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1 text-[10px] font-medium text-ndp-blue bg-ndp-blue/6 border border-ndp-blue/15 px-2.5 py-1 rounded-full"
                >
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>

          {isGuest && (
            <Link
              href="/registrazione"
              className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-xs font-bold text-ndp-blue border border-ndp-blue/25 bg-ndp-blue/5 px-3.5 py-2 rounded-xl hover:bg-ndp-blue hover:text-white transition-all duration-200"
            >
              Registrati <ArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>

      {/* ── B. AI Search Bar ── */}
      <div className="bg-white border-b border-ndp-border shrink-0 px-5 py-3.5 space-y-2.5">
        {/* Search input */}
        <div className="flex gap-2.5">
          <div className={clsx(
            'flex-1 flex items-center gap-2.5 rounded-2xl px-4 py-2.5 border-2 transition-all duration-200',
            isSearching
              ? 'border-ndp-blue/40 bg-white shadow-[0_0_0_4px_rgba(34,0,204,0.06)]'
              : 'border-transparent bg-ndp-bg hover:bg-white hover:border-ndp-border focus-within:border-ndp-blue/40 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(34,0,204,0.06)]',
          )}>
            {isSearching ? (
              <Sparkles size={15} className="text-ndp-blue shrink-0 animate-pulse" />
            ) : (
              <Search size={15} className="text-ndp-muted/60 shrink-0" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(query); }}
              placeholder="Es. Cerco un evento di networking a Milano questo mese..."
              className="flex-1 bg-transparent text-sm text-ndp-text placeholder-ndp-muted/50 outline-none"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setFiltered(events); setActiveChip(null); }}
                className="text-ndp-muted/50 hover:text-ndp-muted text-xs shrink-0"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={isSearching || !query.trim()}
            className="shrink-0 bg-ndp-blue text-white text-sm font-bold px-5 rounded-2xl hover:bg-ndp-blue-dark transition-colors disabled:opacity-40"
          >
            Cerca
          </button>
        </div>

        {/* Intent chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-ndp-muted/60 font-medium mr-0.5 hidden sm:block">Oppure:</span>
          {INTENT_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => handleChip(chip.key)}
              className={clsx(
                'text-xs font-medium px-3 py-1 rounded-full border transition-all duration-150',
                activeChip === chip.key
                  ? 'bg-ndp-blue text-white border-ndp-blue shadow-sm'
                  : 'bg-white text-ndp-muted border-ndp-border hover:border-ndp-blue/30 hover:text-ndp-blue hover:bg-ndp-blue/4',
              )}
            >
              {chip.label}
              {chip.key === 'local' && !userCity && isGuest && (
                <Lock size={9} className="inline ml-1 opacity-60" />
              )}
            </button>
          ))}
          {hasEvents && (
            <span className="ml-auto text-[11px] text-ndp-muted shrink-0">
              {filtered.length} event{filtered.length !== 1 ? 'i' : 'o'}
            </span>
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      {loading ? (
        <LoadingState />
      ) : !hasEvents ? (
        <PremiumEmptyState isGuest={isGuest} />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">

          {/* ── C. Left panel: Consigliati per te ── */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-ndp-border">
            {/* Panel header */}
            <div className="px-5 py-3 border-b border-ndp-border bg-white/60 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-ndp-blue" />
                <span className="text-sm font-semibold text-ndp-text">Consigliati per te</span>
                {userCity && (
                  <span className="text-[10px] text-ndp-muted bg-ndp-bg border border-ndp-border px-2 py-0.5 rounded-full ml-1">
                    area {userCity}
                  </span>
                )}
                {isGuest && (
                  <span className="text-[10px] text-ndp-muted/70 ml-auto italic hidden sm:block">
                    Accedi per consigli personalizzati
                  </span>
                )}
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
              {recommended.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
                  <Calendar size={28} className="text-ndp-blue/30 mb-3" />
                  <p className="text-sm font-medium text-ndp-text mb-1">Nessun evento da consigliare</p>
                  <p className="text-xs text-ndp-muted">Prova a modificare la ricerca o i filtri.</p>
                </div>
              ) : (
                recommended.map((event) => (
                  <ConciergeCard
                    key={event.id}
                    event={event}
                    isGuest={isGuest}
                    isRegistered={registeredIds.has(event.id)}
                    registrationCount={registrationCounts[event.id] ?? 0}
                    isHighlighted={highlightedId === event.id}
                    onRegister={registeringId === event.id ? () => {} : () => handleRegister(event.id)}
                    onUnregister={registeringId === event.id ? () => {} : () => handleUnregister(event.id)}
                    onFocus={() => setHighlightedId(event.id)}
                    userCity={userCity}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── D. Right panel: Tutti gli eventi ── */}
          <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col bg-ndp-bg overflow-hidden">
            {/* Panel header */}
            <div className="px-5 py-3 border-b border-ndp-border bg-white/60 backdrop-blur-sm shrink-0 flex items-center justify-between">
              <span className="text-sm font-semibold text-ndp-text">Tutti gli eventi</span>
              <span className="text-[11px] font-medium text-ndp-muted bg-ndp-bg border border-ndp-border px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
                  <Search size={22} className="text-ndp-muted/30 mb-3" />
                  <p className="text-sm font-medium text-ndp-text mb-1">Nessun risultato</p>
                  <p className="text-xs text-ndp-muted">
                    Prova a modificare la ricerca o{' '}
                    <button
                      onClick={() => { setQuery(''); setFiltered(events); setActiveChip(null); }}
                      className="text-ndp-blue hover:underline"
                    >
                      resetta i filtri
                    </button>
                  </p>
                </div>
              ) : (
                filtered.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="member"
                    compact
                    isGuest={isGuest}
                    isHighlighted={highlightedId === event.id}
                    isRegistered={registeredIds.has(event.id)}
                    registrationCount={registrationCounts[event.id] ?? 0}
                    onClick={() => setHighlightedId(event.id)}
                    onRegister={registeringId === event.id ? undefined : () => handleRegister(event.id)}
                    onUnregister={registeringId === event.id ? undefined : () => handleUnregister(event.id)}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
