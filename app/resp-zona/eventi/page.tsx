'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import EventCard from '@/components/eventi/EventCard';
import {
  getEventsByManager,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
  getEventRegistrationsWithProfiles,
  getRegistrationCountsBatch,
  type EventRow,
  type EventInsert,
} from '@/lib/db/events';
import { createClient } from '@/lib/supabase/client';
import { appendLogAsync } from '@/lib/db/logs';
import {
  Calendar, Users, TrendingUp, Plus, X, Loader2, ArrowLeft, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

type EventStatus = 'attivo' | 'passato' | 'annullato';

interface EventFormData {
  titolo: string;
  descrizione: string;
  citta: string;
  regione: string;
  indirizzo: string;
  data_evento: string;
  orario_evento: string;
  status: EventStatus;
}

const EMPTY_FORM: EventFormData = {
  titolo: '',
  descrizione: '',
  citta: '',
  regione: '',
  indirizzo: '',
  data_evento: '',
  orario_evento: '',
  status: 'attivo',
};

// ─── Create/Edit Modal ────────────────────────────────────────────────────────

function EventModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
  initial?: EventFormData;
}) {
  const [form, setForm] = useState<EventFormData>(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function set(key: keyof EventFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titolo || !form.citta || !form.data_evento || !form.orario_evento) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ndp-border sticky top-0 bg-white rounded-t-3xl">
          <h2 className="font-bold text-ndp-text">{initial ? 'Modifica evento' : 'Crea nuovo evento'}</h2>
          <button onClick={onClose} className="text-ndp-muted hover:text-ndp-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ndp-muted mb-1.5">Titolo *</label>
            <input
              type="text"
              value={form.titolo}
              onChange={(e) => set('titolo', e.target.value)}
              required
              className="w-full bg-ndp-bg border border-ndp-border rounded-xl px-4 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 focus:bg-white transition-all"
              placeholder="es. Workshop Networking Milano"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ndp-muted mb-1.5">Descrizione</label>
            <textarea
              value={form.descrizione}
              onChange={(e) => set('descrizione', e.target.value)}
              rows={4}
              className="w-full bg-ndp-bg border border-ndp-border rounded-xl px-4 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 focus:bg-white transition-all resize-none"
              placeholder="Descrivi l'evento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ndp-muted mb-1.5">Città *</label>
              <input
                type="text"
                value={form.citta}
                onChange={(e) => set('citta', e.target.value)}
                required
                className="w-full bg-ndp-bg border border-ndp-border rounded-xl px-4 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 focus:bg-white transition-all"
                placeholder="Milano"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ndp-muted mb-1.5">Regione</label>
              <input
                type="text"
                value={form.regione}
                onChange={(e) => set('regione', e.target.value)}
                className="w-full bg-ndp-bg border border-ndp-border rounded-xl px-4 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 focus:bg-white transition-all"
                placeholder="Lombardia"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ndp-muted mb-1.5">Indirizzo</label>
            <input
              type="text"
              value={form.indirizzo}
              onChange={(e) => set('indirizzo', e.target.value)}
              className="w-full bg-ndp-bg border border-ndp-border rounded-xl px-4 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 focus:bg-white transition-all"
              placeholder="Via Roma 10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ndp-muted mb-1.5">Data *</label>
              <input
                type="date"
                value={form.data_evento}
                onChange={(e) => set('data_evento', e.target.value)}
                required
                className="w-full bg-ndp-bg border border-ndp-border rounded-xl px-4 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ndp-muted mb-1.5">Orario *</label>
              <input
                type="time"
                value={form.orario_evento}
                onChange={(e) => set('orario_evento', e.target.value)}
                required
                className="w-full bg-ndp-bg border border-ndp-border rounded-xl px-4 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ndp-muted mb-1.5">Status</label>
            <div className="flex gap-2">
              {(['attivo', 'passato', 'annullato'] as EventStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 text-xs font-medium py-2 rounded-xl border transition-all capitalize ${
                    form.status === s
                      ? 'bg-ndp-blue text-white border-ndp-blue'
                      : 'bg-white text-ndp-muted border-ndp-border hover:border-ndp-blue/30'
                  }`}
                >
                  {s === 'attivo' ? 'Attivo' : s === 'passato' ? 'Passato' : 'Annullato'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-ndp-blue text-white font-bold py-3 rounded-2xl hover:bg-ndp-blue-dark transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {initial ? 'Salva modifiche' : 'Crea evento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-ndp-border text-ndp-muted hover:border-ndp-blue/30 transition-colors text-sm"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Registrations Modal ──────────────────────────────────────────────────────

type RegWithProfile = {
  id: string;
  event_id: string;
  professionista_id: string;
  created_at: string;
  user_profiles: { name: string; city: string | null; province: string | null };
};

function RegistrationsModal({
  eventTitle,
  eventId,
  onClose,
}: {
  eventTitle: string;
  eventId: string;
  onClose: () => void;
}) {
  const [registrations, setRegistrations] = useState<RegWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventRegistrationsWithProfiles(eventId).then((data) => {
      setRegistrations(data as RegWithProfile[]);
      setLoading(false);
    });
  }, [eventId]);

  function formatDateShort(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ndp-border sticky top-0 bg-white rounded-t-3xl">
          <div>
            <h2 className="font-bold text-ndp-text">Iscritti</h2>
            <p className="text-xs text-ndp-muted truncate max-w-xs">{eventTitle}</p>
          </div>
          <button onClick={onClose} className="text-ndp-muted hover:text-ndp-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-ndp-blue animate-spin" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-ndp-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-ndp-blue/40" />
              </div>
              <p className="text-ndp-muted text-sm">Nessun iscritto ancora</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-ndp-muted uppercase tracking-wide pb-2 border-b border-ndp-border">
                <span className="col-span-2">Nome</span>
                <span>Città</span>
                <span>Data</span>
              </div>
              {registrations.map((r) => (
                <div key={r.id} className="grid grid-cols-4 gap-2 py-2 border-b border-ndp-border/50 text-sm">
                  <span className="col-span-2 font-medium text-ndp-text truncate">{r.user_profiles?.name ?? '—'}</span>
                  <span className="text-ndp-muted text-xs">{r.user_profiles?.city ?? '—'}</span>
                  <span className="text-ndp-muted text-xs">{formatDateShort(r.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Content ────────────────────────────────────────────────────────

function EventiManagerContent() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, totalRegistrations: 0 });
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<EventRow | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    // Fetch events first, then stats + counts in parallel (stats reuses events data)
    const evts = await getEventsByManager(user.id);
    const [st, counts] = await Promise.all([
      getEventStats(user.id, evts),
      evts.length > 0
        ? getRegistrationCountsBatch(evts.map((e) => e.id))
        : Promise.resolve({} as Record<string, number>),
    ]);
    setEvents(evts);
    setStats(st);
    setRegistrationCounts(counts);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Realtime: refresh when events or registrations change
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase
      .channel('manager-events-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => { load(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        () => { load(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleCreate(form: EventFormData) {
    if (!user) return;
    setError(null);
    const payload: EventInsert = {
      titolo: form.titolo,
      descrizione: form.descrizione || null,
      citta: form.citta,
      regione: form.regione || null,
      indirizzo: form.indirizzo || null,
      data_evento: form.data_evento,
      orario_evento: form.orario_evento,
      status: form.status,
      responsabile_id: user.id,
    };
    try {
      const created = await createEvent(payload);
      if (created) {
        setShowCreateModal(false); // close modal immediately
        appendLogAsync({ user_id: user.id, user_display_name: user.name, type: 'alert_created', description: `Evento creato: ${form.titolo}` });
        load(); // refresh in background — no await
      } else {
        setError('Errore nella creazione dell\'evento. Verifica i dati e riprova.');
      }
    } catch (err) {
      console.error('Create event error:', err);
      setError('Errore nella creazione dell\'evento. Riprova.');
    }
  }

  async function handleEdit(form: EventFormData) {
    if (!editingEvent) return;
    await updateEvent(editingEvent.id, {
      titolo: form.titolo,
      descrizione: form.descrizione || null,
      citta: form.citta,
      regione: form.regione || null,
      indirizzo: form.indirizzo || null,
      data_evento: form.data_evento,
      orario_evento: form.orario_evento,
      status: form.status,
    });
    setEditingEvent(null); // close modal immediately
    load(); // refresh in background
  }

  async function handleDelete(event: EventRow) {
    if (!confirm(`Eliminare l'evento "${event.titolo}"?`)) return;
    await deleteEvent(event.id);
    load(); // refresh in background
  }

  const kpi = [
    { label: 'Totale eventi', value: stats.total, icon: Calendar, color: 'text-ndp-blue', bg: 'bg-ndp-blue/5' },
    { label: 'Prossimi eventi', value: stats.upcoming, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Iscrizioni totali', value: stats.totalRegistrations, icon: Users, color: 'text-ndp-gold-dark', bg: 'bg-ndp-gold-light/30' },
  ];

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Header */}
      <div className="bg-ndp-blue text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/resp-zona" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl">Gestione eventi</h1>
              <p className="text-white/60 text-sm mt-1">Crea e gestisci gli eventi della tua zona</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-white text-ndp-blue font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-ndp-gold hover:text-white transition-all"
            >
              <Plus size={16} /> Crea evento
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-5 py-3 rounded-2xl animate-fade-in">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-lg">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {kpi.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <div className="font-bold text-ndp-text text-2xl">{value}</div>
              <div className="text-xs text-ndp-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Events list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="text-ndp-blue animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ndp-border p-12 text-center">
            <div className="w-16 h-16 bg-ndp-blue/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-ndp-blue/40" />
            </div>
            <h3 className="font-semibold text-ndp-text mb-2">Nessun evento</h3>
            <p className="text-sm text-ndp-muted mb-6">Crea il primo evento per la tua zona.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-ndp-blue text-white font-bold text-sm px-6 py-2.5 rounded-2xl hover:bg-ndp-blue-dark transition-all"
            >
              <Plus size={16} /> Crea evento
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="manager"
                registrationCount={registrationCounts[event.id] ?? 0}
                onViewRegistrations={() => setViewingRegistrations(event)}
                onEdit={() => setEditingEvent(event)}
                onDelete={() => handleDelete(event)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <EventModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {/* Edit modal */}
      {editingEvent && (
        <EventModal
          onClose={() => setEditingEvent(null)}
          onSave={handleEdit}
          initial={{
            titolo: editingEvent.titolo,
            descrizione: editingEvent.descrizione ?? '',
            citta: editingEvent.citta,
            regione: editingEvent.regione ?? '',
            indirizzo: editingEvent.indirizzo ?? '',
            data_evento: editingEvent.data_evento,
            orario_evento: editingEvent.orario_evento,
            status: editingEvent.status,
          }}
        />
      )}

      {/* Registrations modal */}
      {viewingRegistrations && (
        <RegistrationsModal
          eventTitle={viewingRegistrations.titolo}
          eventId={viewingRegistrations.id}
          onClose={() => setViewingRegistrations(null)}
        />
      )}
    </div>
  );
}

export default function RespZonaEventiPage() {
  return (
    <AuthGuard requiredRole="zone_manager">
      <EventiManagerContent />
    </AuthGuard>
  );
}
