'use client';

import AuthGuard from '@/components/AuthGuard';
import { professionals } from '@/lib/data';
import { getAlertMembers, daysSince } from '@/lib/utils';
import Link from 'next/link';
import { Users, CheckCircle2, AlertTriangle, TrendingUp, Clock, ChevronRight } from 'lucide-react';

function ZonaDashboardContent() {
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
    <div className="min-h-screen bg-ndp-bg">
      {/* Header */}
      <div className="bg-ndp-blue py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-ndp-gold/20 text-ndp-gold text-xs font-bold px-3 py-1 rounded-full mb-4">
            Area Responsabile di Zona
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Dashboard Zona
          </h1>
          <p className="text-white/60 text-sm">
            Monitora i tuoi membri, gestisci gli alert e incentiva i top performer.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpi.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`bg-white rounded-2xl border border-ndp-border p-5 shadow-sm`}>
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <div className="font-bold text-ndp-text text-2xl">{value}</div>
              <div className="text-xs text-ndp-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Alert members */}
        {recentAlerts.length > 0 && (
          <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ndp-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                <h2 className="font-semibold text-ndp-text">Richieste aperte da oltre 7 giorni</h2>
              </div>
              <Link
                href="/resp-zona/membri"
                className="text-xs text-ndp-blue font-medium hover:underline flex items-center gap-1"
              >
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
                      <Link
                        href={`/resp-zona/membri/${p.id}`}
                        className="text-xs text-ndp-blue font-medium border border-ndp-blue/30 px-3 py-1.5 rounded-lg hover:bg-ndp-blue/5 transition-all"
                      >
                        Dettaglio
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/resp-zona/membri"
            className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-ndp-text mb-1">Lista completa membri</h3>
              <p className="text-xs text-ndp-muted">Score, profilo, richieste aperte e azioni rapide</p>
            </div>
            <ChevronRight size={20} className="text-ndp-muted group-hover:text-ndp-blue transition-colors" />
          </Link>
          <Link
            href="/assistente"
            className="bg-ndp-blue rounded-2xl p-6 shadow-sm hover:opacity-95 transition-opacity flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-white mb-1">Assistente AI</h3>
              <p className="text-xs text-white/60">Trova il professionista giusto per una referenza</p>
            </div>
            <ChevronRight size={20} className="text-white/60 group-hover:text-white transition-colors" />
          </Link>
        </div>
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
