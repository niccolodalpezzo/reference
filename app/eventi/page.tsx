'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Sparkles, Loader2, MapPin, Calendar } from 'lucide-react';
import clsx from 'clsx';
import EventCard from '@/components/eventi/EventCard';
import EventMap from '@/components/eventi/EventMap';
import {
  getActiveEvents,
  registerForEvent,
  unregisterFromEvent,
  getRegistrationCount,
  isRegistered as checkIsRegistered,
  type EventRow,
} from '@/lib/db/events';
import { useAuth } from '@/context/AuthContext';

const FILTER_OPTIONS = [
  { key: 'tutti', label: 'Tutti' },
  { key: 'attivi', label: 'Attivi' },
  { key: 'prossimi', label: 'Prossimi 30gg' },
] as const;

type FilterKey = (typeof FILTER_OPTIONS)[number]['key'];

export default function EventiPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [filtered, setFiltered] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('tutti');
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Load events on mount
  useEffect(() => {
    getActiveEvents().then((data) => {
      setEvents(data);
      applyFilter(data, activeFilter);
      loadCounts(data);
      setLoading(false);
    });
  }, []);

  // Load user registrations when user is available
  useEffect(() => {
    if (user && events.length > 0) {
      loadUserRegistrations(events);
    }
  }, [user, events]);

  async function loadCounts(evts: EventRow[]) {
    const counts: Record<string, number> = {};
    await Promise.all(evts.map(async (e) => {
      counts[e.id] = await getRegistrationCount(e.id);
    }));
    setRegistrationCounts(counts);
  }

  async function loadUserRegistrations(evts: EventRow[]) {
    if (!user) return;
    const results = await Promise.all(evts.map((e) => checkIsRegistered(e.id, user.id)));
    const ids = new Set(evts.filter((_, i) => results[i]).map((e) => e.id));
    setRegisteredIds(ids);
  }

  function applyFilter(evts: EventRow[], filter: FilterKey) {
    const today = new Date().toISOString().split('T')[0];
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    let result = evts;
    if (filter === 'attivi') {
      result = evts.filter((e) => e.status === 'attivo');
    } else if (filter === 'prossimi') {
      result = evts.filter((e) => e.status === 'attivo' && e.data_evento >= today && e.data_evento <= in30);
    }
    setFiltered(result);
  }

  function handleFilterChange(filter: FilterKey) {
    setActiveFilter(filter);
    applyFilter(events, filter);
    setQuery('');
  }

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      applyFilter(events, activeFilter);
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
      setFiltered(events.filter((e) =>
        e.titolo.toLowerCase().includes(q2) ||
        e.citta.toLowerCase().includes(q2) ||
        (e.regione ?? '').toLowerCase().includes(q2)
      ));
    } finally {
      setIsSearching(false);
    }
  }, [events, activeFilter]);

  function handlePinClick(eventId: string) {
    setHighlightedEventId(eventId);
    const ref = cardRefs.current.get(eventId);
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function handleRegister(eventId: string) {
    if (!user) return;
    setRegisteringId(eventId);
    await registerForEvent(eventId, user.id);
    setRegisteredIds((prev) => { const s = new Set(Array.from(prev)); s.add(eventId); return s; });
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

  const isGuest = !user;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-ndp-bg">
      {/* Search + Filter bar */}
      <div className="bg-white border-b border-ndp-border px-4 py-3 shrink-0 space-y-3">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-ndp-bg border-2 border-transparent focus-within:border-ndp-blue/25 focus-within:bg-white rounded-2xl px-4 py-2.5 shadow-sm transition-all">
            {isSearching ? (
              <Sparkles size={14} className="text-ndp-blue shrink-0 animate-spin" />
            ) : (
              <Search size={14} className="text-ndp-muted shrink-0" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(query); }}
              placeholder="Cerca eventi per città, regione o tipo..."
              className="flex-1 bg-transparent text-sm text-ndp-text placeholder-ndp-muted/60 outline-none"
            />
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={isSearching}
            className="shrink-0 bg-ndp-blue text-white text-sm font-bold px-5 rounded-2xl hover:bg-ndp-blue-dark transition-colors disabled:opacity-50"
          >
            Cerca
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={clsx(
                'text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
                activeFilter === f.key
                  ? 'bg-ndp-blue text-white border-ndp-blue'
                  : 'bg-white text-ndp-muted border-ndp-border hover:border-ndp-blue/30'
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-ndp-muted self-center">{filtered.length} eventi</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map — left 55% on desktop */}
        <div className="flex-1 min-w-0 relative hidden md:block">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-ndp-bg">
              <Loader2 size={32} className="text-ndp-blue animate-spin" />
            </div>
          ) : (
            <EventMap
              events={filtered}
              highlightedEventId={highlightedEventId}
              onPinClick={handlePinClick}
            />
          )}
        </div>

        {/* Event card list — right 45% on desktop, full width on mobile */}
        <div className="w-full md:w-[420px] lg:w-[460px] flex flex-col bg-ndp-bg border-l border-ndp-border shrink-0 overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={28} className="text-ndp-blue animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
              <div className="w-16 h-16 rounded-2xl bg-ndp-blue/5 flex items-center justify-center mb-4">
                <Calendar size={28} className="text-ndp-blue/40" />
              </div>
              <h3 className="font-semibold text-ndp-text mb-2">Nessun evento trovato</h3>
              <p className="text-sm text-ndp-muted">Prova a cambiare i filtri o la ricerca.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filtered.map((event) => (
                <div
                  key={event.id}
                  ref={(el) => { if (el) cardRefs.current.set(event.id, el); else cardRefs.current.delete(event.id); }}
                >
                  <EventCard
                    event={event}
                    variant="member"
                    isGuest={isGuest}
                    isHighlighted={highlightedEventId === event.id}
                    isRegistered={registeredIds.has(event.id)}
                    registrationCount={registrationCounts[event.id] ?? 0}
                    onClick={() => setHighlightedEventId(event.id)}
                    onRegister={registeringId === event.id ? undefined : () => handleRegister(event.id)}
                    onUnregister={registeringId === event.id ? undefined : () => handleUnregister(event.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: floating map toggle */}
      <button
        onClick={() => setShowMapMobile(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-ndp-blue text-white text-sm font-bold px-4 py-3 rounded-2xl shadow-lg"
      >
        <MapPin size={16} /> Vedi su mappa
      </button>

      {/* Mobile map sheet */}
      {showMapMobile && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setShowMapMobile(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 h-[60vh] bg-white rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-ndp-border bg-white">
              <span className="font-semibold text-sm text-ndp-text">Mappa eventi</span>
              <button onClick={() => setShowMapMobile(false)} className="text-ndp-muted hover:text-ndp-text">
                ✕
              </button>
            </div>
            <div className="h-full">
              <EventMap
                events={filtered}
                highlightedEventId={highlightedEventId}
                onPinClick={(id) => { handlePinClick(id); setShowMapMobile(false); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
