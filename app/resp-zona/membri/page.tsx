'use client';

import AuthGuard from '@/components/AuthGuard';
import { getMembersByZoneManager, ProfessionalRow } from '@/lib/db/professionals';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Search, ChevronRight, ArrowLeft } from 'lucide-react';

type SortKey = 'month_score' | 'profile_score' | 'open_requests' | 'name';

function MembriContent() {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProfessionalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('month_score');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getMembersByZoneManager(user.id).then((data) => {
      setMembers(data);
      setIsLoading(false);
    });
  }, [user?.id]);

  const filtered = members
    .filter((p) => {
      const q = query.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.profession.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
      if (onlyAlerts) return (p.open_requests ?? 0) > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return ((b[sortKey] as number) ?? 0) - ((a[sortKey] as number) ?? 0);
    });

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Header */}
      <div className="bg-ndp-blue py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/resp-zona"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Lista Membri ({isLoading ? '…' : members.length})
          </h1>
          <p className="text-white/60 text-sm">
            {user?.zone ?? user?.capoluogo ?? 'Zona non assegnata'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ndp-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per nome, professione, città..."
              className="w-full pl-9 pr-4 py-2.5 border border-ndp-border rounded-xl text-sm text-ndp-text placeholder-ndp-muted focus:outline-none focus:border-ndp-blue/50 bg-white shadow-sm"
            />
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-white border border-ndp-border rounded-xl px-3 py-2.5 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 shadow-sm"
          >
            <option value="month_score">Ordina: Score mese</option>
            <option value="profile_score">Ordina: Profilo %</option>
            <option value="open_requests">Ordina: Richieste aperte</option>
            <option value="name">Ordina: Nome</option>
          </select>
          <button
            onClick={() => setOnlyAlerts(!onlyAlerts)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${onlyAlerts ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-ndp-muted border-ndp-border hover:border-red-200'}`}
          >
            <AlertTriangle size={14} />
            Solo alert
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-ndp-border shadow-sm py-16 text-center">
            <div className="w-8 h-8 border-2 border-ndp-blue/20 border-t-ndp-blue rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-ndp-muted">Caricamento membri...</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && (
          <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ndp-border bg-ndp-bg text-xs text-ndp-muted font-semibold uppercase tracking-wide">
                    <th className="px-5 py-3 text-left">Membro</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-center">Profilo</th>
                    <th className="px-4 py-3 text-center">Richieste</th>
                    <th className="px-4 py-3 text-center">Iscritto il</th>
                    <th className="px-4 py-3 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ndp-border">
                  {filtered.map((p) => {
                    const hasAlert = (p.open_requests ?? 0) > 0;
                    return (
                      <tr key={p.id} className={`hover:bg-ndp-bg/50 transition-colors ${hasAlert ? 'bg-red-50/30' : ''}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-ndp-blue rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-ndp-text flex items-center gap-2">
                                {p.name}
                                {p.is_top_of_month && (
                                  <span className="text-[9px] bg-ndp-gold text-white px-1.5 py-0.5 rounded-full font-bold">TOP</span>
                                )}
                              </div>
                              <div className="text-xs text-ndp-muted">{p.profession} · {p.city}{p.province ? ` (${p.province})` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-ndp-blue">
                            <TrendingUp size={11} />
                            {p.month_score ?? '–'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-16 h-1.5 bg-ndp-bg rounded-full overflow-hidden">
                              <div
                                className="h-full bg-ndp-gold rounded-full"
                                style={{ width: `${p.profile_score ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-ndp-muted">{p.profile_score ?? 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {(p.open_requests ?? 0) > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                              <AlertTriangle size={10} />
                              {p.open_requests}
                            </span>
                          ) : (
                            <span className="text-xs text-ndp-muted">–</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-xs text-ndp-muted">
                            {formatDate(p.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Link
                            href={`/resp-zona/membri/${p.id}`}
                            className="inline-flex items-center gap-1 text-xs text-ndp-blue font-medium border border-ndp-blue/30 px-2.5 py-1 rounded-lg hover:bg-ndp-blue/5 transition-all"
                          >
                            Dettaglio <ChevronRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-ndp-muted text-sm">
                {members.length === 0
                  ? 'Nessun membro assegnato alla tua zona.'
                  : 'Nessun membro trovato con i filtri selezionati.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MembriPage() {
  return (
    <AuthGuard requiredRole="zone_manager">
      <MembriContent />
    </AuthGuard>
  );
}
