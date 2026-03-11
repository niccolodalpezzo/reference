'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getProfessionalById, ProfessionalRow } from '@/lib/db/professionals';
import { getLogsForUser, appendLog } from '@/lib/db/logs';
import type { Database } from '@/lib/supabase/types';
import { getAlertsForMember, createAlert } from '@/lib/db/alerts';
import type { Alert as AlertRow } from '@/lib/db/alerts';
import { getAwardsForMember, createAward } from '@/lib/db/awards';
import type { Award as AwardRow } from '@/lib/db/awards';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { use } from 'react';
import { ActivityLogType } from '@/lib/types';
import {
  ArrowLeft, AlertTriangle, Star, TrendingUp, Clock, CheckCircle2, MessageSquare,
  X, Send, Gift, UserPlus, Edit3, GitMerge, Filter,
  AlertOctagon, Info, Trophy, ShieldCheck,
} from 'lucide-react';

type DBActivityLog = Database['public']['Tables']['activity_logs']['Row'];
type AlertSeverityType = 'info' | 'warning' | 'critical';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Oggi';
  if (d === 1) return 'Ieri';
  if (d < 30) return `${d} giorni fa`;
  return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

function severityLabel(s: AlertSeverityType) {
  return { info: 'Info', warning: 'Attenzione', critical: 'Critico' }[s];
}

function severityColor(s: AlertSeverityType) {
  return {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  }[s];
}

function SeverityIcon({ severity, size = 14 }: { severity: AlertSeverityType; size?: number }) {
  const cls = { info: 'text-blue-500', warning: 'text-amber-500', critical: 'text-red-500' }[severity];
  const Icon = severity === 'critical' ? AlertOctagon : severity === 'warning' ? AlertTriangle : Info;
  return <Icon size={size} className={cls} />;
}

// ─── Create Alert Modal ───────────────────────────────────────────────────────

function CreateAlertModal({ professional, onClose, onCreated }: {
  professional: ProfessionalRow;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AlertSeverityType>('warning');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    await createAlert({
      member_id: professional.id,
      member_name: professional.name,
      created_by_user_id: user.id,
      title,
      description,
      severity,
    });
    await appendLog({
      user_id: user.id,
      user_display_name: user.name,
      type: 'alert_created',
      description: `Alert "${title}" creato per ${professional.name} (${severity})`,
      metadata: { professionalId: professional.id, severity },
    });
    setIsSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-ndp-border">
          <h3 className="font-semibold text-ndp-text">Crea alert per {professional.name}</h3>
          <button onClick={onClose} className="text-ndp-muted hover:text-ndp-text"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Titolo *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Profilo incompleto da 30 giorni"
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Descrizione</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Dettagli aggiuntivi..."
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Gravità *</label>
            <div className="flex gap-2">
              {(['info', 'warning', 'critical'] as AlertSeverityType[]).map((s) => (
                <button key={s} type="button" onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${severity === s ? severityColor(s) : 'border-ndp-border text-ndp-muted hover:bg-ndp-bg'}`}>
                  {severityLabel(s)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving}
              className="flex-1 bg-ndp-blue text-white font-bold py-2.5 rounded-xl text-sm hover:bg-ndp-blue-dark transition-all disabled:opacity-60">
              {isSaving ? 'Salvando...' : 'Crea alert'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-muted hover:bg-ndp-bg">
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Create Award Modal ───────────────────────────────────────────────────────

function CreateAwardModal({ professional, onClose, onCreated }: {
  professional: ProfessionalRow;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scoreBonus, setScoreBonus] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    await createAward({
      member_id: professional.id,
      member_name: professional.name,
      awarded_by_id: user.id,
      awarded_by_name: user.name,
      title,
      description,
      score_bonus: scoreBonus,
    });
    await appendLog({
      user_id: user.id,
      user_display_name: user.name,
      type: 'top_performer_marked',
      description: `Premio "${title}" assegnato a ${professional.name} (+${scoreBonus} punti)`,
      metadata: { professionalId: professional.id, scoreBonus },
    });
    setIsSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-ndp-border">
          <h3 className="font-semibold text-ndp-text">Assegna premio a {professional.name}</h3>
          <button onClick={onClose} className="text-ndp-muted hover:text-ndp-text"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Titolo premio *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Top Performer Marzo 2025"
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">Motivazione</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Motiva il riconoscimento..."
              className="w-full px-3 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue/50 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ndp-muted uppercase tracking-wide mb-1.5 block">
              Bonus punti: <span className="text-ndp-gold-dark">{scoreBonus}</span>
            </label>
            <input type="range" min={10} max={200} step={10} value={scoreBonus}
              onChange={(e) => setScoreBonus(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] text-ndp-muted mt-1"><span>10</span><span>200</span></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving}
              className="flex-1 bg-ndp-gold-dark text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-60">
              {isSaving ? 'Salvando...' : `Assegna +${scoreBonus} punti`}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-muted hover:bg-ndp-bg">
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

const LOG_TYPE_META: Record<ActivityLogType, { label: string; color: string; Icon: React.ElementType }> = {
  request_sent:          { label: 'Richiesta inviata',       color: 'text-ndp-blue',      Icon: Send },
  chat_started:          { label: 'Chat avviata',            color: 'text-ndp-blue',      Icon: MessageSquare },
  first_response:        { label: 'Prima risposta',          color: 'text-green-600',     Icon: CheckCircle2 },
  attachment_sent:       { label: 'Allegato inviato',        color: 'text-ndp-muted',     Icon: GitMerge },
  reference_created:     { label: 'Referenza inviata',       color: 'text-ndp-gold-dark', Icon: Gift },
  reference_approved:    { label: 'Referenza approvata',     color: 'text-green-600',     Icon: CheckCircle2 },
  reference_rejected:    { label: 'Referenza rifiutata',     color: 'text-red-500',       Icon: X },
  profile_updated:       { label: 'Profilo aggiornato',      color: 'text-ndp-muted',     Icon: Edit3 },
  profile_completed:     { label: 'Profilo completato',      color: 'text-ndp-gold-dark', Icon: Star },
  conversation_resolved: { label: 'Chat risolta',            color: 'text-green-600',     Icon: CheckCircle2 },
  top_performer_marked:  { label: 'Premio assegnato',        color: 'text-ndp-gold-dark', Icon: Trophy },
  alert_created:         { label: 'Alert creato',            color: 'text-amber-500',     Icon: AlertTriangle },
  alert_closed:          { label: 'Alert chiuso',            color: 'text-ndp-muted',     Icon: CheckCircle2 },
  user_registered:       { label: 'Registrazione',           color: 'text-ndp-blue',      Icon: UserPlus },
};

function ActivityLogSection({ logs }: { logs: DBActivityLog[] }) {
  const [filter, setFilter] = useState<ActivityLogType | 'all'>('all');
  const filtered = filter === 'all' ? logs : logs.filter((l) => l.type === filter);

  return (
    <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-ndp-border flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-semibold text-ndp-text">Log attività</h2>
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-ndp-muted" />
          <select value={filter} onChange={(e) => setFilter(e.target.value as ActivityLogType | 'all')}
            className="text-xs border border-ndp-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-ndp-blue/50 bg-white">
            <option value="all">Tutte le attività</option>
            {(Object.keys(LOG_TYPE_META) as ActivityLogType[]).map((t) => (
              <option key={t} value={t}>{LOG_TYPE_META[t].label}</option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-ndp-muted text-sm">
          {logs.length === 0 ? 'Nessuna attività registrata.' : 'Nessuna attività per questo filtro.'}
        </div>
      ) : (
        <div className="divide-y divide-ndp-border">
          {filtered.map((entry) => {
            const meta = LOG_TYPE_META[entry.type as ActivityLogType] ?? { label: entry.type, color: 'text-ndp-muted', Icon: Clock };
            const { Icon, color, label } = meta;
            return (
              <div key={entry.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${color}`}><Icon size={15} /></div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-ndp-text">{label}</span>
                  {entry.description && (
                    <p className="text-xs text-ndp-muted mt-0.5 leading-relaxed">{entry.description}</p>
                  )}
                </div>
                <span className="text-[11px] text-ndp-muted shrink-0 whitespace-nowrap">{relTime(entry.created_at)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function MemberDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [professional, setProfessional] = useState<ProfessionalRow | null>(null);
  const [logs, setLogs] = useState<DBActivityLog[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [awards, setAwards] = useState<AwardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);

  const loadData = useCallback(async () => {
    const prof = await getProfessionalById(id);
    if (!prof) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    setProfessional(prof);
    const [logsData, alertsData, awardsData] = await Promise.all([
      prof.user_id ? getLogsForUser(prof.user_id) : Promise.resolve([]),
      getAlertsForMember(prof.id),
      getAwardsForMember(prof.id),
    ]);
    setLogs(logsData);
    setAlerts(alertsData);
    setAwards(awardsData);
    setIsLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ndp-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ndp-blue/20 border-t-ndp-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !professional) {
    return (
      <div className="min-h-screen bg-ndp-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-ndp-muted mb-4">Membro non trovato.</p>
          <Link href="/resp-zona/membri" className="text-ndp-blue hover:underline text-sm">Torna alla lista</Link>
        </div>
      </div>
    );
  }

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const fulfillmentRate = professional.requests_received && professional.requests_received > 0
    ? Math.round(((professional.requests_fulfilled ?? 0) / professional.requests_received) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-ndp-bg">
      {showAlertModal && (
        <CreateAlertModal professional={professional} onClose={() => setShowAlertModal(false)} onCreated={loadData} />
      )}
      {showAwardModal && (
        <CreateAwardModal professional={professional} onClose={() => setShowAwardModal(false)} onCreated={loadData} />
      )}

      {/* Header */}
      <div className="bg-ndp-blue py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/resp-zona/membri"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeft size={14} />
            Lista membri
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 ${professional.is_top_of_month ? 'bg-ndp-gold' : 'bg-ndp-blue-mid'}`}>
                {getInitials(professional.name)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-xl font-bold text-white">{professional.name}</h1>
                  {professional.is_top_of_month && (
                    <span className="text-[10px] bg-ndp-gold text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Star size={9} /> TOP
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm">
                  {professional.profession} · {professional.city}
                  {professional.province ? ` (${professional.province})` : ''}
                  {professional.chapter ? ` · ${professional.chapter}` : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              <button onClick={() => setShowAlertModal(true)}
                className="inline-flex items-center gap-2 bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-600 transition-all">
                <AlertTriangle size={14} /> Alert
              </button>
              <button onClick={() => setShowAwardModal(true)}
                className="inline-flex items-center gap-2 bg-ndp-gold-dark text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all">
                <Trophy size={14} /> Premio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Open alerts banner */}
        {openAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                {openAlerts.length} alert {openAlerts.length === 1 ? 'aperto' : 'aperti'}
              </p>
              <p className="text-xs text-red-500">{openAlerts[0].title}</p>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Score mese', value: professional.month_score ?? '–', icon: TrendingUp, color: 'text-ndp-blue' },
            { label: 'Profilo', value: `${professional.profile_score ?? 0}%`, icon: CheckCircle2, color: 'text-ndp-gold-dark' },
            { label: 'Rating', value: `★ ${professional.rating ?? '–'}`, icon: Star, color: 'text-ndp-gold-dark' },
            { label: 'Evasione', value: `${fulfillmentRate}%`, icon: Clock, color: 'text-green-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-ndp-border p-4 shadow-sm text-center">
              <Icon size={18} className={`${color} mx-auto mb-2`} />
              <div className="font-bold text-ndp-text text-xl">{value}</div>
              <div className="text-xs text-ndp-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Anagrafica e attività */}
        <div className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm">
          <h2 className="font-semibold text-ndp-text mb-4">Anagrafica e attività</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Provincia', value: professional.province ?? '–' },
              { label: 'Città', value: professional.city },
              { label: 'Capitolo', value: professional.chapter ?? '–' },
              { label: 'Richieste ricevute', value: professional.requests_received ?? 0 },
              { label: 'Richieste evase', value: professional.requests_fulfilled ?? 0 },
              { label: 'Richieste aperte', value: professional.open_requests ?? 0 },
              { label: 'Tempo medio risposta', value: `${professional.avg_response_time ?? 24}h` },
              { label: 'Anni nel network', value: professional.years_in_bni ?? '–' },
              { label: 'Referral dati', value: professional.referrals_given ?? 0 },
              { label: 'Profilo completo', value: professional.profile_complete ? 'Sì' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-ndp-border last:border-0">
                <span className="text-ndp-muted text-xs">{label}</span>
                <span className="font-medium text-ndp-text text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bio & specialties */}
        {(professional.bio || (professional.specialties?.length ?? 0) > 0) && (
          <div className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm">
            <h2 className="font-semibold text-ndp-text mb-4">Profilo professionale</h2>
            {professional.bio && (
              <p className="text-ndp-muted text-sm leading-relaxed mb-4">{professional.bio}</p>
            )}
            {professional.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {professional.specialties.map((s) => (
                  <span key={s} className="text-xs bg-ndp-blue/5 text-ndp-blue px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ndp-border">
              <h2 className="font-semibold text-ndp-text">Premi ricevuti</h2>
            </div>
            <div className="divide-y divide-ndp-border">
              {awards.map((a) => (
                <div key={a.id} className="px-5 py-4 flex items-start gap-3">
                  <Trophy size={16} className="text-ndp-gold-dark mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ndp-text">{a.title}</p>
                    {a.description && <p className="text-xs text-ndp-muted mt-0.5">{a.description}</p>}
                    <p className="text-[11px] text-ndp-muted mt-1">
                      +{a.score_bonus} punti · {new Date(a.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts history */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ndp-border">
              <h2 className="font-semibold text-ndp-text">Storico alert</h2>
            </div>
            <div className="divide-y divide-ndp-border">
              {alerts.map((a) => (
                <div key={a.id} className="px-5 py-3.5 flex items-start gap-3">
                  <SeverityIcon severity={a.severity} size={15} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-ndp-text">{a.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${a.status !== 'open' ? 'bg-gray-50 text-gray-500 border-gray-200' : severityColor(a.severity)}`}>
                        {a.status === 'open' ? severityLabel(a.severity) : a.status === 'closed' ? 'Chiuso' : 'Archiviato'}
                      </span>
                    </div>
                    {a.description && <p className="text-xs text-ndp-muted">{a.description}</p>}
                  </div>
                  <span className="text-[11px] text-ndp-muted shrink-0">
                    {new Date(a.created_at).toLocaleDateString('it-IT')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log */}
        {professional.user_id ? (
          <ActivityLogSection logs={logs} />
        ) : (
          <div className="bg-white rounded-2xl border border-ndp-border p-8 text-center shadow-sm">
            <ShieldCheck size={28} className="text-ndp-muted/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-ndp-text mb-1">Nessun account collegato</p>
            <p className="text-xs text-ndp-muted">Questo professionista non ha ancora un account utente attivo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard requiredRole="zone_manager">
      <MemberDetailContent params={params} />
    </AuthGuard>
  );
}
