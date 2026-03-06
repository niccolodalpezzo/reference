'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { professionals } from '@/lib/data';
import { getAlertMembers, daysSince } from '@/lib/utils';
import Link from 'next/link';
import {
  Users, CheckCircle2, AlertTriangle, TrendingUp, Clock,
  ChevronRight, Plus, X, GitMerge, FileText, Shield,
  Info, AlertOctagon, Search, ArrowUpRight, Inbox,
} from 'lucide-react';
import { Alert, AlertSeverity, Reference } from '@/lib/types';
import { getAlerts, createAlert, closeAlert, archiveAlert } from '@/lib/storage/alerts';
import { getPendingReferences, approveReference, rejectReference } from '@/lib/storage/references';
import { log } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

type Tab = 'panoramica' | 'membri' | 'alert' | 'in-verifica';

// ─── Alert Severity helpers ───────────────────────────────────────────────────

function severityLabel(s: AlertSeverity) {
  return { info: 'Info', warning: 'Attenzione', critical: 'Critico' }[s];
}

function severityColor(s: AlertSeverity) {
  return {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  }[s];
}

function SeverityIcon({ severity, size = 14 }: { severity: AlertSeverity; size?: number }) {
  const cls = { info: 'text-blue-500', warning: 'text-amber-500', critical: 'text-red-500' }[severity];
  const Icon = severity === 'critical' ? AlertOctagon : severity === 'warning' ? AlertTriangle : Info;
  return <Icon size={size} className={cls} />;
}

// ─── Create Alert Modal ───────────────────────────────────────────────────────

function CreateAlertModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const member = professionals.find((p) => p.id === memberId);
    createAlert({
      memberId: memberId || 'none',
      memberName: member?.name ?? memberName,
      createdByUserId: user.id,
      title,
      description,
      severity,
    });
    log(user, 'alert_created', `Alert "${title}" creato (${severity})`, { memberId, severity });
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-ndp-border">
          <h3 className="font-semibold text-ndp-text">Crea nuovo alert</h3>
          <button onClick={onClose} className="text-ndp-muted hover:text-ndp-text"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Titolo *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Profilo incompleto da 30 giorni"
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Descrizione</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Dettagli aggiuntivi sull'alert..."
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Gravità *</label>
            <div className="flex gap-2">
              {(['info', 'warning', 'critical'] as AlertSeverity[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${severity === s ? severityColor(s) : 'border-ndp-border text-ndp-muted hover:bg-ndp-bg'}`}
                >
                  {severityLabel(s)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Assegna a membro (opzionale)</label>
            <select
              value={memberId}
              onChange={(e) => {
                setMemberId(e.target.value);
                const m = professionals.find((p) => p.id === e.target.value);
                setMemberName(m?.name ?? '');
              }}
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50 bg-white"
            >
              <option value="">— Nessun membro specifico —</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.profession})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-ndp-blue text-white font-bold py-2.5 rounded-xl text-sm hover:bg-ndp-blue-dark transition-all"
            >
              Crea alert
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-muted hover:bg-ndp-bg"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Rejection Modal ──────────────────────────────────────────────────────────

function RejectModal({ reference, onClose, onRejected }: {
  reference: Reference;
  onClose: () => void;
  onRejected: () => void;
}) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || reason.trim().length < 10) return;
    rejectReference(reference.id, user.id, reason.trim());
    log(user, 'reference_rejected', `Referenza rifiutata: ${reference.contactName} per ${reference.toProfessionalName}`, {
      referenceId: reference.id,
      reason,
    });
    onRejected();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-ndp-border">
          <h3 className="font-semibold text-ndp-text">Rifiuta referenza</h3>
          <button onClick={onClose} className="text-ndp-muted hover:text-ndp-text"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-ndp-muted">
            Stai rifiutando la referenza <strong className="text-ndp-text">{reference.contactName}</strong> inviata da {reference.fromUserName}.
          </p>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Motivo del rifiuto *</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              minLength={10}
              placeholder="Spiega il motivo del rifiuto (min. 10 caratteri)..."
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-red-400 resize-none"
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-xs text-red-500 mt-1">Ancora {10 - reason.length} caratteri necessari.</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={reason.trim().length < 10}
              className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600 transition-all disabled:opacity-40"
            >
              Conferma rifiuto
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-muted hover:bg-ndp-bg">
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tab: Panoramica ──────────────────────────────────────────────────────────

function PanoramicaTab() {
  const totalMembers = professionals.length;
  const completeProfiles = professionals.filter((p) => p.profileComplete !== false).length;
  const alertMembers = getAlertMembers();
  const alertCount = alertMembers.filter((p) => {
    const lastUp = p.lastUpdate ? daysSince(p.lastUpdate) : 0;
    return (p.openRequests ?? 0) > 0 && lastUp > 7;
  }).length;
  const avgScore = Math.round(
    professionals.reduce((s, p) => s + (p.monthScore ?? 0), 0) / totalMembers
  );

  const kpi = [
    { label: 'Membri totali', value: totalMembers, icon: Users, color: 'text-ndp-blue', bg: 'bg-ndp-blue/5' },
    { label: 'Profili completi', value: `${completeProfiles}/${totalMembers}`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Alert attivi', value: alertCount, icon: AlertTriangle, color: alertCount > 0 ? 'text-red-500' : 'text-ndp-muted', bg: alertCount > 0 ? 'bg-red-50' : 'bg-ndp-bg' },
    { label: 'Score medio', value: avgScore, icon: TrendingUp, color: 'text-ndp-gold-dark', bg: 'bg-ndp-gold-light/30' },
  ];

  const recentAlerts = professionals
    .filter((p) => (p.openRequests ?? 0) > 0)
    .sort((a, b) => (b.openRequests ?? 0) - (a.openRequests ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {recentAlerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-ndp-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h2 className="font-semibold text-ndp-text">Richieste aperte da oltre 7 giorni</h2>
            </div>
            <Link href="/resp-zona/membri" className="text-xs text-ndp-blue font-medium hover:underline flex items-center gap-1">
              Vedi tutti <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-ndp-border">
            {recentAlerts.map((p) => {
              const daysOld = p.lastUpdate ? daysSince(p.lastUpdate) : 10;
              const isAlert = daysOld > 7;
              return (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-ndp-bg rounded-xl flex items-center justify-center text-xs font-bold text-ndp-text shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ndp-text truncate">{p.name}</p>
                      <p className="text-xs text-ndp-muted">{p.profession} · {p.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isAlert ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      <Clock size={11} />
                      {p.openRequests} aperte
                    </div>
                    <Link href={`/resp-zona/membri/${p.id}`} className="text-xs text-ndp-blue font-medium border border-ndp-blue/30 px-3 py-1.5 rounded-lg hover:bg-ndp-blue/5 transition-all">
                      Dettaglio
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/resp-zona/membri" className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <h3 className="font-semibold text-ndp-text mb-1">Lista completa membri</h3>
            <p className="text-xs text-ndp-muted">Score, profilo, richieste aperte e azioni rapide</p>
          </div>
          <ChevronRight size={20} className="text-ndp-muted group-hover:text-ndp-blue transition-colors" />
        </Link>
        <Link href="/assistente" className="bg-ndp-blue rounded-2xl p-6 shadow-sm hover:opacity-95 transition-opacity flex items-center justify-between group">
          <div>
            <h3 className="font-semibold text-white mb-1">Assistente AI</h3>
            <p className="text-xs text-white/60">Trova il professionista giusto per una referenza</p>
          </div>
          <ChevronRight size={20} className="text-white/60 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  );
}

// ─── Tab: Membri ──────────────────────────────────────────────────────────────

function MembriTab() {
  const [query, setQuery] = useState('');
  const filtered = professionals.filter((p) => {
    const q = query.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.profession.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
  }).slice(0, 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ndp-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome, professione, città..."
            className="w-full pl-9 pr-4 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50 bg-white shadow-sm"
          />
        </div>
        <Link href="/resp-zona/membri" className="shrink-0 flex items-center gap-1.5 bg-ndp-blue text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all">
          Lista completa <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
        <div className="divide-y divide-ndp-border">
          {filtered.map((p) => {
            const daysOld = p.lastUpdate ? daysSince(p.lastUpdate) : 99;
            const hasAlert = (p.openRequests ?? 0) > 0 && daysOld > 7;
            return (
              <div key={p.id} className={`px-5 py-3.5 flex items-center justify-between gap-4 ${hasAlert ? 'bg-red-50/40' : ''}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-ndp-blue rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ndp-text truncate flex items-center gap-1.5">
                      {p.name}
                      {p.isTopOfMonth && <span className="text-[9px] bg-ndp-gold text-white px-1.5 py-0.5 rounded-full font-bold">TOP</span>}
                    </div>
                    <div className="text-xs text-ndp-muted">{p.profession} · {p.city}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ndp-blue font-bold">{p.monthScore ?? '–'}</span>
                  {hasAlert && <AlertTriangle size={13} className="text-red-500" />}
                  <Link href={`/resp-zona/membri/${p.id}`} className="text-xs text-ndp-blue font-medium border border-ndp-blue/30 px-2.5 py-1 rounded-lg hover:bg-ndp-blue/5 transition-all flex items-center gap-0.5">
                    Dettaglio <ChevronRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-ndp-muted text-sm">Nessun membro trovato.</div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Alert ───────────────────────────────────────────────────────────────

function AlertTab() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  const load = useCallback(() => setAlerts(getAlerts()), []);
  useEffect(() => { load(); }, [load]);

  function handleClose(id: string) {
    closeAlert(id);
    setClosingId(null);
    load();
  }

  function handleArchive(id: string) {
    archiveAlert(id);
    load();
  }

  const open = alerts.filter((a) => a.status === 'open');
  const closed = alerts.filter((a) => a.status !== 'open');

  return (
    <div className="space-y-4">
      {showCreate && <CreateAlertModal onClose={() => setShowCreate(false)} onCreated={load} />}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ndp-text">{open.length} alert {open.length === 1 ? 'aperto' : 'aperti'}</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-ndp-blue text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all"
        >
          <Plus size={14} /> Crea alert
        </button>
      </div>

      {open.length === 0 && (
        <div className="bg-white rounded-2xl border border-ndp-border p-12 text-center">
          <Shield size={32} className="text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-ndp-text mb-1">Nessun alert attivo</p>
          <p className="text-xs text-ndp-muted">La zona è in buona salute.</p>
        </div>
      )}

      {open.length > 0 && (
        <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
          <div className="divide-y divide-ndp-border">
            {open.map((a) => (
              <div key={a.id} className="px-5 py-4 flex items-start gap-4">
                <div className="mt-0.5 shrink-0">
                  <SeverityIcon severity={a.severity} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-ndp-text">{a.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColor(a.severity)}`}>
                      {severityLabel(a.severity)}
                    </span>
                  </div>
                  {a.description && <p className="text-xs text-ndp-muted mb-1.5 leading-relaxed">{a.description}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-ndp-muted">
                    {a.memberName && a.memberId !== 'none' && (
                      <span className="flex items-center gap-1"><Users size={10} /> {a.memberName}</span>
                    )}
                    <span>{new Date(a.createdAt).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {closingId === a.id ? (
                    <button
                      onClick={() => handleClose(a.id)}
                      className="text-xs font-bold text-green-600 border border-green-300 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all"
                    >
                      Conferma
                    </button>
                  ) : (
                    <button
                      onClick={() => setClosingId(a.id)}
                      className="text-xs text-ndp-muted border border-ndp-border px-2.5 py-1.5 rounded-lg hover:bg-ndp-bg transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> Chiudi
                    </button>
                  )}
                  {closingId !== a.id && (
                    <button
                      onClick={() => handleArchive(a.id)}
                      className="text-xs text-ndp-muted hover:text-ndp-text transition-colors p-1"
                      title="Archivia"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {closed.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-ndp-muted font-medium hover:text-ndp-text flex items-center gap-1">
            <ChevronRight size={12} className="group-open:rotate-90 transition-transform" />
            {closed.length} alert chiusi / archiviati
          </summary>
          <div className="mt-3 bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
            <div className="divide-y divide-ndp-border">
              {closed.map((a) => (
                <div key={a.id} className="px-5 py-3.5 flex items-center gap-4 opacity-60">
                  <SeverityIcon severity={a.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ndp-text truncate">{a.title}</p>
                    <p className="text-xs text-ndp-muted">{a.status === 'closed' ? 'Chiuso' : 'Archiviato'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

// ─── Tab: In Verifica ─────────────────────────────────────────────────────────

function InVerificaTab() {
  const { user } = useAuth();
  const [refs, setRefs] = useState<Reference[]>([]);
  const [rejectingRef, setRejectingRef] = useState<Reference | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const load = useCallback(() => setRefs(getPendingReferences()), []);
  useEffect(() => { load(); }, [load]);

  function handleApprove(ref: Reference) {
    if (!user) return;
    approveReference(ref.id, user.id, 'Approvata dal responsabile di zona.');
    log(user, 'reference_approved', `Referenza approvata: ${ref.contactName} per ${ref.toProfessionalName} (+40 punti)`, {
      referenceId: ref.id,
      scoreAwarded: 40,
    });
    setConfirmingId(null);
    load();
  }

  const urgencyColor: Record<string, string> = {
    alta: 'bg-red-100 text-red-700',
    media: 'bg-amber-50 text-amber-700',
    bassa: 'bg-green-50 text-green-700',
  };

  const contactTypeLabel: Record<string, string> = {
    lead: 'Lead',
    referenza: 'Referenza',
    'opportunità': 'Opportunità',
  };

  return (
    <div className="space-y-4">
      {rejectingRef && (
        <RejectModal
          reference={rejectingRef}
          onClose={() => setRejectingRef(null)}
          onRejected={load}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ndp-text">
          {refs.length} referenz{refs.length === 1 ? 'a' : 'e'} in attesa di verifica
        </h2>
      </div>

      {refs.length === 0 && (
        <div className="bg-white rounded-2xl border border-ndp-border p-12 text-center">
          <Inbox size={32} className="text-ndp-muted mx-auto mb-3" />
          <p className="font-semibold text-ndp-text mb-1">Nessuna referenza da verificare</p>
          <p className="text-xs text-ndp-muted">Tutte le referenze sono state elaborate.</p>
        </div>
      )}

      {refs.length > 0 && (
        <div className="space-y-3">
          {refs.map((ref) => (
            <div key={ref.id} className="bg-white rounded-2xl border border-ndp-border shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-ndp-text">{ref.contactName}</span>
                    <span className="text-[10px] font-bold bg-ndp-blue/10 text-ndp-blue px-2 py-0.5 rounded-full">
                      {contactTypeLabel[ref.contactType] ?? ref.contactType}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgencyColor[ref.urgency] ?? 'bg-gray-100 text-gray-600'}`}>
                      Urgenza: {ref.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-ndp-muted">
                    Da <strong className="text-ndp-text">{ref.fromUserName}</strong> → a <strong className="text-ndp-text">{ref.toProfessionalName}</strong>
                  </p>
                </div>
                {ref.estimatedValue && (
                  <span className="shrink-0 text-sm font-bold text-ndp-gold-dark">
                    €{ref.estimatedValue.toLocaleString('it-IT')}
                  </span>
                )}
              </div>
              {ref.notes && (
                <div className="bg-ndp-bg rounded-xl px-4 py-3 mb-3">
                  <p className="text-xs text-ndp-muted leading-relaxed">{ref.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] text-ndp-muted mb-4">
                <FileText size={11} />
                {ref.contactInfo}
                <span>·</span>
                <span>{new Date(ref.createdAt).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex gap-2">
                {confirmingId === ref.id ? (
                  <>
                    <button
                      onClick={() => handleApprove(ref)}
                      className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-green-600 transition-all"
                    >
                      Conferma approvazione (+30 bonus)
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="px-4 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-muted hover:bg-ndp-bg"
                    >
                      Annulla
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setConfirmingId(ref.id)}
                      className="flex-1 bg-green-50 text-green-700 font-bold py-2.5 rounded-xl text-sm border border-green-200 hover:bg-green-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Approva (+30 bonus)
                    </button>
                    <button
                      onClick={() => setRejectingRef(ref)}
                      className="flex-1 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-sm border border-red-200 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <X size={14} /> Rifiuta
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'panoramica', label: 'Panoramica', icon: TrendingUp },
  { id: 'membri', label: 'Membri', icon: Users },
  { id: 'alert', label: 'Alert', icon: AlertTriangle },
  { id: 'in-verifica', label: 'In Verifica', icon: GitMerge },
];

function ZonaDashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>('panoramica');

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Header */}
      <div className="bg-ndp-blue pb-0 px-4 pt-12">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-ndp-gold/20 text-ndp-gold text-xs font-bold px-3 py-1 rounded-full mb-4">
            Area Responsabile di Zona
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Dashboard Zona
          </h1>
          <p className="text-white/60 text-sm mb-6">
            Monitora i tuoi membri, gestisci gli alert e verifica le referenze.
          </p>
          {/* Tab nav */}
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as Tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-ndp-bg text-ndp-blue'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'panoramica' && <PanoramicaTab />}
        {activeTab === 'membri' && <MembriTab />}
        {activeTab === 'alert' && <AlertTab />}
        {activeTab === 'in-verifica' && <InVerificaTab />}
      </div>
    </div>
  );
}

export default function RespZonaPage() {
  return (
    <AuthGuard requiredRole="zone_manager">
      <ZonaDashboardContent />
    </AuthGuard>
  );
}
