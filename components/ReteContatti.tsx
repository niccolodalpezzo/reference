'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, Plus, Trash2, X, ChevronRight, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import {
  getContacts,
  addContact as dbAddContact,
  deleteContact as dbDeleteContact,
  migrateFromLocalStorage,
  type ContactRow,
} from '@/lib/db/contacts';

const LEGACY_KEY = 'ndp-rete-contatti-v1';

// ─── Level system ─────────────────────────────────────────────────────────────
const LEVELS = [
  { min: 0,  max: 5,  label: 'Starter',          color: 'text-ndp-muted',     bg: 'bg-ndp-bg',           border: 'border-ndp-border' },
  { min: 6,  max: 15, label: 'In crescita',       color: 'text-ndp-blue',      bg: 'bg-ndp-blue/8',       border: 'border-ndp-blue/20' },
  { min: 16, max: 30, label: 'Connesso',          color: 'text-green-600',     bg: 'bg-green-50',         border: 'border-green-200' },
  { min: 31, max: 50, label: 'Network attivo',    color: 'text-ndp-gold-dark', bg: 'bg-ndp-gold/10',      border: 'border-ndp-gold/25' },
  { min: 51, max: Infinity, label: 'Power connector', color: 'text-purple-700', bg: 'bg-purple-50',      border: 'border-purple-200' },
];

function getLevel(count: number) {
  return LEVELS.find((l) => count >= l.min && count <= l.max) ?? LEVELS[0];
}

function getNextLevelTarget(count: number): { next: number; label: string } | null {
  const idx = LEVELS.findIndex((l) => count >= l.min && count <= l.max);
  if (idx < 0 || idx === LEVELS.length - 1) return null;
  return { next: LEVELS[idx + 1].min, label: LEVELS[idx + 1].label };
}

function getProgressPct(count: number): number {
  const level = LEVELS.find((l) => count >= l.min && count <= l.max) ?? LEVELS[0];
  if (level.max === Infinity) return 100;
  const range = level.max - level.min + 1;
  const pos = count - level.min;
  return Math.round((pos / range) * 100);
}

// ─── SVG Progress ring ────────────────────────────────────────────────────────
function ProgressRing({ pct, count }: { pct: number; count: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2200CC" />
          <stop offset="100%" stopColor="#6644EE" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle
        cx="44" cy="44" r={r}
        fill="none"
        stroke="#E8E5FF"
        strokeWidth="6"
      />
      {/* Progress */}
      <circle
        cx="44" cy="44" r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        filter={pct > 0 ? 'url(#glow)' : undefined}
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Center text */}
      <text x="44" y="40" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0D0A2E" fontFamily="Space Grotesk, sans-serif">
        {count}
      </text>
      <text x="44" y="53" textAnchor="middle" fontSize="8" fill="#7370A0" fontFamily="Inter, sans-serif">
        contatti
      </text>
    </svg>
  );
}

// ─── Contact card ─────────────────────────────────────────────────────────────
function ContactCard({ contact, onDelete, isNew }: { contact: ContactRow; onDelete: (id: string) => void; isNew: boolean }) {
  function initials(nome: string, cognome: string) {
    return `${nome[0] ?? ''}${cognome[0] ?? ''}`.toUpperCase();
  }

  return (
    <div className={clsx(
      'group flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200',
      'bg-white hover:shadow-sm',
      isNew ? 'border-ndp-blue/30 animate-bounce-in' : 'border-ndp-border hover:border-ndp-blue/20',
    )}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-ndp-blue/10 flex items-center justify-center text-sm font-bold text-ndp-blue shrink-0">
        {initials(contact.nome, contact.cognome)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ndp-text truncate">
          {contact.nome} {contact.cognome}
        </p>
        {contact.professione && (
          <p className="text-xs text-ndp-muted truncate">{contact.professione}</p>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(contact.id)}
        className="p-1.5 rounded-lg text-ndp-muted/0 group-hover:text-ndp-muted hover:text-red-500 hover:bg-red-50 transition-all"
        title="Rimuovi contatto"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Add contact form ─────────────────────────────────────────────────────────
function AddContactForm({ onAdd, onCancel, isSubmitting }: {
  onAdd: (c: { nome: string; cognome: string; professione: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [professione, setProfessione] = useState('');
  const [error, setError] = useState('');
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Il nome è obbligatorio.');
      return;
    }
    setError('');
    onAdd({ nome: nome.trim(), cognome: cognome.trim(), professione: professione.trim() });
  }

  const field = 'w-full text-sm border border-ndp-border rounded-xl px-3.5 py-2.5 bg-white text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/50 focus:shadow-[0_0_0_3px_rgba(34,0,204,0.06)] transition-all';

  return (
    <form onSubmit={handleSubmit} className="bg-ndp-bg/50 border border-ndp-border rounded-2xl p-4 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-ndp-text">Nuovo contatto</p>
        <button type="button" onClick={onCancel} className="p-1 rounded text-ndp-muted hover:text-ndp-text">
          <X size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <input ref={firstRef} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome *" className={field} disabled={isSubmitting} />
        <input value={cognome} onChange={(e) => setCognome(e.target.value)} placeholder="Cognome" className={field} disabled={isSubmitting} />
      </div>
      <input value={professione} onChange={(e) => setProfessione(e.target.value)} placeholder="Professione / Ruolo" className={field} disabled={isSubmitting} />
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-ndp-blue text-white text-xs font-bold py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all shadow-sm disabled:opacity-60"
        >
          {isSubmitting ? 'Salvataggio...' : 'Aggiungi contatto'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 text-xs text-ndp-muted bg-white border border-ndp-border rounded-xl hover:bg-ndp-bg transition-all"
        >
          Annulla
        </button>
      </div>
    </form>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReteContatti({ userId }: { userId: string }) {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function load() {
      const data = await getContacts(userId);

      // Migrate from localStorage if Supabase is empty and localStorage has data
      if (data.length === 0) {
        try {
          const raw = localStorage.getItem(LEGACY_KEY);
          if (raw) {
            const legacy = JSON.parse(raw) as Array<{ nome: string; cognome: string; telefono?: string; professione: string }>;
            if (legacy.length > 0) {
              await migrateFromLocalStorage(userId, legacy);
              localStorage.removeItem(LEGACY_KEY);
              const fresh = await getContacts(userId);
              setContacts(fresh);
              setIsLoading(false);
              return;
            }
          }
        } catch { /* ignore localStorage errors */ }
      }

      setContacts(data);
      setIsLoading(false);
    }

    load();
  }, [userId]);

  async function handleAddContact(data: { nome: string; cognome: string; professione: string }) {
    setIsSubmitting(true);
    setFormError(null);

    const { data: newContact, error } = await dbAddContact(userId, data);

    if (error) {
      setFormError(error);
      setIsSubmitting(false);
      return;
    }

    if (newContact) {
      setContacts((prev) => [newContact, ...prev]);
      setNewId(newContact.id);
      setTimeout(() => setNewId(null), 2000);
    }

    setShowForm(false);
    setIsSubmitting(false);
  }

  async function handleDeleteContact(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    await dbDeleteContact(id);
  }

  const count = contacts.length;
  const level = getLevel(count);
  const nextLevel = getNextLevelTarget(count);
  const pct = getProgressPct(count);

  // Count contacts added this month
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newThisMonth = contacts.filter((c) => {
    const d = new Date(c.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-ndp-border shadow-sm p-12 text-center">
        <div className="w-8 h-8 border-2 border-ndp-blue/20 border-t-ndp-blue rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-ndp-muted">Caricamento rete contatti...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
      {/* ── Header section ── */}
      <div className="px-6 py-5 border-b border-ndp-border bg-gradient-to-br from-ndp-bg/60 to-white">
        <div className="flex items-start gap-5">
          {/* Progress ring */}
          <ProgressRing pct={pct} count={count} />

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="font-display text-lg font-bold text-ndp-text mb-1">
              La tua Rete Contatti
            </h2>
            <p className="text-xs text-ndp-muted leading-relaxed mb-3">
              Ogni contatto inserito rafforza il tuo profilo nella rete. I professionisti con una rete strutturata vengono valorizzati di più dal sistema.
            </p>

            {/* Level + growth badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={clsx(
                'inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border',
                level.color, level.bg, level.border
              )}>
                <Zap size={10} />
                {level.label}
              </span>
              {newThisMonth > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                  <TrendingUp size={10} />
                  +{newThisMonth} questo mese
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar toward next level */}
        {nextLevel && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-ndp-muted">
                {count} / {nextLevel.next} per sbloccare <strong className="text-ndp-text">{nextLevel.label}</strong>
              </span>
              <span className="text-[10px] font-bold text-ndp-blue">{pct}%</span>
            </div>
            <div className="h-2 bg-ndp-bg rounded-full overflow-hidden border border-ndp-border/50">
              <div
                className="h-full bg-gradient-to-r from-ndp-blue to-ndp-blue-mid rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
        {!nextLevel && count > 0 && (
          <div className="mt-4 text-center">
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl inline-block">
              Livello massimo raggiunto — Power Connector
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5 space-y-4">
        {/* Error banner */}
        {formError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-2.5 rounded-xl animate-fade-in">
            <AlertCircle size={13} />
            {formError}
            <button onClick={() => setFormError(null)} className="ml-auto p-0.5 hover:bg-red-100 rounded">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Add form or button */}
        {showForm ? (
          <AddContactForm onAdd={handleAddContact} onCancel={() => { setShowForm(false); setFormError(null); }} isSubmitting={isSubmitting} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-ndp-blue text-white text-sm font-bold py-3 rounded-xl hover:bg-ndp-blue-dark transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={15} />
            Aggiungi contatto
          </button>
        )}

        {/* Empty state */}
        {contacts.length === 0 && !showForm && (
          <div className="flex flex-col items-center text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-ndp-bg border border-ndp-border flex items-center justify-center mb-4">
              <Users size={28} className="text-ndp-muted/30" />
            </div>
            <p className="text-sm font-semibold text-ndp-text mb-1.5">
              La tua rete è il tuo valore
            </p>
            <p className="text-xs text-ndp-muted leading-relaxed max-w-xs mb-5">
              Inserisci i contatti che potrebbero diventare future reference.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-ndp-blue bg-ndp-blue/8 border border-ndp-blue/20 px-4 py-2.5 rounded-xl hover:bg-ndp-blue hover:text-white transition-all"
            >
              Aggiungi il primo contatto
              <ChevronRight size={13} />
            </button>
            <p className="text-[10px] text-ndp-muted/60 mt-4 max-w-xs">
              I professionisti con una rete più strutturata vengono valorizzati di più dal sistema.
            </p>
          </div>
        )}

        {/* Contact list */}
        {contacts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[11px] font-semibold text-ndp-muted uppercase tracking-wide">
                {count} {count === 1 ? 'contatto' : 'contatti'}
              </p>
            </div>
            {contacts.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onDelete={handleDeleteContact}
                isNew={c.id === newId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
