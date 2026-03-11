'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { MapPin, Calendar, Clock, Users, UserPlus, UserCheck, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  getEventById,
  getRegistrationCount,
  isRegistered as checkIsRegistered,
  registerForEvent,
  unregisterFromEvent,
  type EventRow,
} from '@/lib/db/events';
import { useAuth } from '@/context/AuthContext';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function statusLabel(status: EventRow['status']): string {
  if (status === 'attivo') return 'Attivo';
  if (status === 'annullato') return 'Annullato';
  return 'Passato';
}

function statusColor(status: EventRow['status']): string {
  if (status === 'attivo') return 'bg-green-100 text-green-700';
  if (status === 'annullato') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}

function RegistrationPanel({ event }: { event: EventRow }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function load() {
      const [c, r] = await Promise.all([
        getRegistrationCount(event.id),
        user ? checkIsRegistered(event.id, user.id) : Promise.resolve(false),
      ]);
      setCount(c);
      setRegistered(r);
      setLoading(false);
    }
    load();
  }, [event.id, user]);

  async function handleRegister() {
    if (!user) return;
    setRegistering(true);
    await registerForEvent(event.id, user.id);
    setRegistered(true);
    setCount((c) => c + 1);
    setRegistering(false);
  }

  async function handleUnregister() {
    if (!user) return;
    setRegistering(true);
    await unregisterFromEvent(event.id, user.id);
    setRegistered(false);
    setCount((c) => Math.max(0, c - 1));
    setRegistering(false);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-ndp-border p-6 flex items-center justify-center">
        <Loader2 size={24} className="text-ndp-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-ndp-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-ndp-blue/5 rounded-xl flex items-center justify-center">
          <Users size={16} className="text-ndp-blue" />
        </div>
        <div>
          <div className="font-bold text-ndp-text text-xl">{count}</div>
          <div className="text-xs text-ndp-muted">iscritti</div>
        </div>
      </div>

      {event.status !== 'attivo' ? (
        <div className="w-full text-center text-sm text-ndp-muted bg-ndp-bg border border-ndp-border rounded-2xl py-3">
          {event.status === 'annullato' ? 'Evento annullato' : 'Evento concluso'}
        </div>
      ) : !user ? (
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 bg-ndp-blue text-white font-bold py-3 rounded-2xl hover:bg-ndp-blue-dark transition-colors"
        >
          Accedi per partecipare
        </Link>
      ) : registering ? (
        <div className="w-full flex items-center justify-center gap-2 bg-ndp-blue/50 text-white font-bold py-3 rounded-2xl">
          <Loader2 size={16} className="animate-spin" />
          {registered ? 'Annullando...' : 'Iscrizione in corso...'}
        </div>
      ) : registered ? (
        <div className="space-y-3">
          <div className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-2xl">
            <UserCheck size={18} /> Già iscritto
          </div>
          <button
            onClick={handleUnregister}
            className="w-full text-sm text-ndp-muted hover:text-red-500 transition-colors text-center"
          >
            Annulla iscrizione
          </button>
        </div>
      ) : (
        <button
          onClick={handleRegister}
          className="w-full flex items-center justify-center gap-2 bg-ndp-blue text-white font-bold py-3 rounded-2xl hover:bg-ndp-blue-dark transition-colors"
        >
          <UserPlus size={18} /> Iscriviti all&apos;evento
        </button>
      )}

      <p className="text-xs text-ndp-muted text-center">
        La partecipazione è gratuita per i membri della rete NDP.
      </p>
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<EventRow | null | undefined>(undefined);

  useEffect(() => {
    if (id) {
      getEventById(id).then((data) => setEvent(data));
    }
  }, [id]);

  if (event === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <Loader2 size={32} className="text-ndp-blue animate-spin" />
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <div className="text-center">
          <h2 className="text-xl font-bold text-ndp-text mb-2">Evento non trovato</h2>
          <Link href="/eventi" className="text-ndp-blue text-sm hover:underline">Torna agli eventi</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ndp-blue to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/eventi" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Tutti gli eventi
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${statusColor(event.status)}`}>
                {statusLabel(event.status)}
              </span>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-3 leading-tight">
                {event.titolo}
              </h1>
              <div className="flex flex-wrap gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {event.citta}{event.regione ? `, ${event.regione}` : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {formatDate(event.data_evento)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> ore {formatTime(event.orario_evento)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left: description + details */}
          <div className="lg:col-span-2 space-y-6 mb-8 lg:mb-0">
            {event.descrizione && (
              <div className="bg-white rounded-2xl border border-ndp-border p-6">
                <h2 className="font-semibold text-ndp-text mb-3">Descrizione</h2>
                <p className="text-sm text-ndp-muted leading-relaxed whitespace-pre-line">{event.descrizione}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-ndp-border p-6">
              <h2 className="font-semibold text-ndp-text mb-4">Dettagli evento</h2>
              <div className="space-y-3">
                {[
                  { icon: Calendar, label: 'Data', value: formatDate(event.data_evento) },
                  { icon: Clock, label: 'Orario', value: `ore ${formatTime(event.orario_evento)}` },
                  { icon: MapPin, label: 'Città', value: `${event.citta}${event.regione ? `, ${event.regione}` : ''}` },
                  ...(event.indirizzo ? [{ icon: MapPin, label: 'Indirizzo', value: event.indirizzo }] : []),
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-ndp-blue/5 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-ndp-blue" />
                    </div>
                    <div>
                      <div className="text-xs text-ndp-muted">{label}</div>
                      <div className="text-sm font-medium text-ndp-text">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: registration panel (sticky on desktop) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <RegistrationPanel event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
