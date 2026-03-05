'use client';

import AuthGuard from '@/components/AuthGuard';
import { professionals } from '@/lib/data';
import { daysSince, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Star, TrendingUp, Clock, CheckCircle2, MessageSquare, Award, X } from 'lucide-react';
import { use } from 'react';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function SollecitaModal({ member, onClose }: { member: (typeof professionals)[0]; onClose: () => void }) {
  const [sent, setSent] = useState(false);

  const suggestedText = `Ciao ${member.name.split(' ')[0]},

ti scrivo come responsabile di zona. Ho notato che hai ${member.openRequests} richieste di referral ancora aperte da qualche giorno.

Ti chiedo gentilmente di aggiornarle il prima possibile — anche un breve aggiornamento sullo stato aiuta la rete a funzionare meglio per tutti.

Se hai bisogno di supporto per compilare il profilo AI o per gestire le richieste, sono disponibile.

Grazie!`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-ndp-border">
          <h3 className="font-semibold text-ndp-text">Sollecita {member.name.split(' ')[0]}</h3>
          <button onClick={onClose} className="text-ndp-muted hover:text-ndp-text">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          {!sent ? (
            <>
              <p className="text-xs text-ndp-muted mb-3">Testo suggerito — puoi modificarlo prima di inviare:</p>
              <textarea
                defaultValue={suggestedText}
                rows={10}
                className="w-full px-4 py-3 border border-ndp-border rounded-xl text-sm text-ndp-text focus:outline-none focus:border-ndp-blue/50 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setSent(true)}
                  className="flex-1 bg-ndp-blue text-white font-bold py-2.5 rounded-xl text-sm hover:bg-ndp-blue-dark transition-all"
                >
                  Invia sollecito
                </button>
                <button onClick={onClose} className="px-5 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-muted hover:bg-ndp-bg">
                  Annulla
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-ndp-text">Sollecito inviato!</p>
              <p className="text-xs text-ndp-muted mt-1">Il membro riceverà la notifica.</p>
              <button onClick={onClose} className="mt-5 bg-ndp-bg text-ndp-text px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-ndp-border">
                Chiudi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const member = professionals.find((p) => p.id === id);
  const [showSollecita, setShowSollecita] = useState(false);
  const [isTopPerformer, setIsTopPerformer] = useState(member?.isTopOfMonth ?? false);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <div className="text-center">
          <p className="text-ndp-muted mb-4">Membro non trovato.</p>
          <Link href="/resp-zona/membri" className="text-ndp-blue hover:underline text-sm">
            Torna alla lista
          </Link>
        </div>
      </div>
    );
  }

  const daysOld = member.lastUpdate ? daysSince(member.lastUpdate) : 99;
  const hasAlert = (member.openRequests ?? 0) > 0 && daysOld > 7;
  const fulfillmentRate = member.requestsReceived && member.requestsReceived > 0
    ? Math.round(((member.requestsFulfilled ?? 0) / member.requestsReceived) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-ndp-bg">
      {showSollecita && <SollecitaModal member={member} onClose={() => setShowSollecita(false)} />}

      {/* Header */}
      <div className="bg-ndp-blue py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/resp-zona/membri"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft size={14} />
            Lista membri
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 ${isTopPerformer ? 'bg-ndp-gold' : 'bg-ndp-blue-mid'}`}>
                {getInitials(member.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold text-white">{member.name}</h1>
                  {isTopPerformer && (
                    <span className="text-[10px] bg-ndp-gold text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Award size={9} /> TOP
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-sm">{member.profession} · {member.city} · {member.chapter}</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              {hasAlert && (
                <button
                  onClick={() => setShowSollecita(true)}
                  className="inline-flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-600 transition-all"
                >
                  <MessageSquare size={14} />
                  Sollecita
                </button>
              )}
              <button
                onClick={() => setIsTopPerformer(!isTopPerformer)}
                className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all ${isTopPerformer ? 'bg-ndp-gold text-white border-ndp-gold' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
              >
                <Award size={14} />
                {isTopPerformer ? 'Top Performer ✓' : 'Segna come Top'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Alert banner */}
        {hasAlert && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                {member.openRequests} richieste aperte da {daysOld} giorni
              </p>
              <p className="text-xs text-red-500">Questo membro non ha aggiornato le richieste negli ultimi 7 giorni.</p>
            </div>
          </div>
        )}

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Score mese', value: member.monthScore ?? '–', icon: TrendingUp, color: 'text-ndp-blue' },
            { label: 'Profilo', value: `${member.profileScore ?? 70}%`, icon: CheckCircle2, color: 'text-ndp-gold-dark' },
            { label: 'Rating', value: `★ ${member.rating}`, icon: Star, color: 'text-ndp-gold-dark' },
            { label: 'Evasione', value: `${fulfillmentRate}%`, icon: Clock, color: 'text-green-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-ndp-border p-4 shadow-sm text-center">
              <Icon size={18} className={`${color} mx-auto mb-2`} />
              <div className="font-bold text-ndp-text text-xl">{value}</div>
              <div className="text-xs text-ndp-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-ndp-text">Dettaglio attività</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Richieste ricevute', value: member.requestsReceived ?? 0 },
              { label: 'Richieste evase', value: member.requestsFulfilled ?? 0 },
              { label: 'Richieste aperte', value: member.openRequests ?? 0 },
              { label: 'Tempo medio risposta', value: `${member.avgResponseTime ?? 24}h` },
              { label: 'Anni in BNI', value: member.yearsInBNI },
              { label: 'Referral dati', value: member.referralsGiven },
              { label: 'Ultimo aggiornamento', value: member.lastUpdate ? formatDate(member.lastUpdate) : '–' },
              { label: 'Profilo completo', value: member.profileComplete !== false ? 'Sì' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-ndp-border last:border-0">
                <span className="text-ndp-muted text-xs">{label}</span>
                <span className="font-medium text-ndp-text text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bio & specialties */}
        <div className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm">
          <h2 className="font-semibold text-ndp-text mb-4">Profilo professionale</h2>
          <p className="text-ndp-muted text-sm leading-relaxed mb-4">{member.bio}</p>
          <div className="flex flex-wrap gap-2">
            {member.specialties.map((s) => (
              <span key={s} className="text-xs bg-ndp-blue/5 text-ndp-blue px-2.5 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
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
