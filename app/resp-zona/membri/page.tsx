'use client';

import AuthGuard from '@/components/AuthGuard';
import { professionals } from '@/lib/data';
import { daysSince, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, TrendingUp, Search, ChevronRight, ArrowLeft } from 'lucide-react';

type SortKey = 'monthScore' | 'profileScore' | 'openRequests' | 'name';

function MembriContent() {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('monthScore');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const filtered = professionals
    .filter((p) => {
      const q = query.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.profession.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
      if (onlyAlerts) {
        const daysOld = p.lastUpdate ? daysSince(p.lastUpdate) : 0;
        return (p.openRequests ?? 0) > 0 && daysOld > 7;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
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
            Lista Membri ({professionals.length})
          </h1>
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
            <option value="monthScore">Ordina: Score mese</option>
            <option value="profileScore">Ordina: Profilo %</option>
            <option value="openRequests">Ordina: Richieste aperte</option>
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

        {/* Table */}
        <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ndp-border bg-ndp-bg text-xs text-ndp-muted font-semibold uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Membro</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Profilo</th>
                  <th className="px-4 py-3 text-center">Richieste</th>
                  <th className="px-4 py-3 text-center">Ultimo agg.</th>
                  <th className="px-4 py-3 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ndp-border">
                {filtered.map((p) => {
                  const daysOld = p.lastUpdate ? daysSince(p.lastUpdate) : 99;
                  const hasAlert = (p.openRequests ?? 0) > 0 && daysOld > 7;
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
                              {p.isTopOfMonth && (
                                <span className="text-[9px] bg-ndp-gold text-white px-1.5 py-0.5 rounded-full font-bold">TOP</span>
                              )}
                            </div>
                            <div className="text-xs text-ndp-muted">{p.profession} · {p.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-ndp-blue">
                          <TrendingUp size={11} />
                          {p.monthScore ?? '–'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 h-1.5 bg-ndp-bg rounded-full overflow-hidden">
                            <div
                              className="h-full bg-ndp-gold rounded-full"
                              style={{ width: `${p.profileScore ?? 70}%` }}
                            />
                          </div>
                          <span className="text-xs text-ndp-muted">{p.profileScore ?? 70}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {(p.openRequests ?? 0) > 0 ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${hasAlert ? 'bg-red-100 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {hasAlert && <AlertTriangle size={10} />}
                            {p.openRequests}
                          </span>
                        ) : (
                          <span className="text-xs text-ndp-muted">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-xs ${daysOld > 30 ? 'text-red-500' : 'text-ndp-muted'}`}>
                          {p.lastUpdate ? formatDate(p.lastUpdate) : '–'}
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
              Nessun membro trovato con i filtri selezionati.
            </div>
          )}
        </div>
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
