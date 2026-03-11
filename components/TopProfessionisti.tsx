'use client';

import { getTopProfessionisti } from '@/lib/utils';
import { Professional } from '@/lib/types';
import { Star, Award, TrendingUp, Crown } from 'lucide-react';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── Grid variant (originale, retrocompatibile) ───────────────────────────────

function TopCard({ pro, rank }: { pro: Professional; rank: number }) {
  const isFirst = rank === 1;
  return (
    <div className={`relative bg-white rounded-2xl border ${isFirst ? 'border-ndp-gold shadow-md' : 'border-ndp-border shadow-sm'} p-5 hover:shadow-md transition-shadow`}>
      {isFirst && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 bg-ndp-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            <Award size={10} />
            Top del Mese
          </span>
        </div>
      )}
      {!isFirst && rank <= 3 && (
        <div className="absolute -top-3 left-4">
          <span className="inline-flex items-center gap-1 bg-ndp-gold-light text-ndp-gold-dark text-[10px] font-bold px-2.5 py-1 rounded-full border border-ndp-gold/30">
            Top {rank}
          </span>
        </div>
      )}
      <div className="flex items-start gap-3 mt-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${isFirst ? 'bg-ndp-gold' : 'bg-ndp-blue'}`}>
          {getInitials(pro.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ndp-text text-sm truncate">{pro.name}</h3>
          <p className="text-ndp-muted text-xs truncate">{pro.profession}</p>
          <p className="text-ndp-muted text-xs">{pro.city} · {pro.chapter}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-ndp-bg rounded-lg py-2">
          <div className="font-bold text-ndp-text text-sm">{pro.monthScore ?? '–'}</div>
          <div className="text-[10px] text-ndp-muted">Score</div>
        </div>
        <div className="bg-ndp-bg rounded-lg py-2">
          <div className="font-bold text-ndp-text text-sm">{pro.referralsGiven}</div>
          <div className="text-[10px] text-ndp-muted">Referral</div>
        </div>
        <div className="bg-ndp-bg rounded-lg py-2">
          <div className="font-bold text-ndp-text text-sm flex items-center justify-center gap-0.5">
            <Star size={10} className="text-ndp-gold" fill="currentColor" />
            {pro.rating}
          </div>
          <div className="text-[10px] text-ndp-muted">Rating</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {pro.specialties.slice(0, 2).map((s) => (
          <span key={s} className="text-[10px] bg-ndp-blue/5 text-ndp-blue px-2 py-0.5 rounded-full">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Podium: Spotlight #1 ────────────────────────────────────────────────────

function PodiumSpotlight({ pro }: { pro: Professional }) {
  return (
    <div className="relative bg-white rounded-3xl border-2 border-ndp-gold shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-ndp-gold to-ndp-gold-dark px-6 py-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold">
          <Crown size={13} fill="currentColor" /> #1 del Mese
        </span>
        <span className="text-white/70 text-xs">{pro.city}</span>
      </div>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-ndp-gold flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md">
            {getInitials(pro.name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-ndp-text text-xl leading-tight mb-0.5">{pro.name}</h3>
            <p className="text-ndp-muted text-sm">{pro.profession}</p>
            <p className="text-ndp-muted text-xs mt-0.5">{pro.city} · {pro.chapter}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-ndp-gold/8 border border-ndp-gold/20 rounded-2xl py-3 text-center">
            <div className="font-display font-bold text-ndp-text text-2xl">{pro.monthScore ?? '–'}</div>
            <div className="text-[11px] text-ndp-muted mt-0.5">Score</div>
          </div>
          <div className="bg-ndp-bg rounded-2xl py-3 text-center">
            <div className="font-display font-bold text-ndp-text text-2xl">{pro.referralsGiven}</div>
            <div className="text-[11px] text-ndp-muted mt-0.5">Referral</div>
          </div>
          <div className="bg-ndp-bg rounded-2xl py-3 text-center">
            <div className="font-display font-bold text-ndp-text text-2xl flex items-center justify-center gap-1">
              <Star size={14} className="text-ndp-gold" fill="currentColor" />
              {pro.rating}
            </div>
            <div className="text-[11px] text-ndp-muted mt-0.5">Rating</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pro.specialties.slice(0, 3).map((s) => (
            <span key={s} className="text-[11px] bg-ndp-gold/8 text-ndp-gold-dark border border-ndp-gold/20 px-2.5 py-1 rounded-full font-medium">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Podium: Medium cards #2, #3 ─────────────────────────────────────────────

function PodiumMedium({ pro, rank }: { pro: Professional; rank: number }) {
  return (
    <div className="relative bg-white rounded-2xl border border-ndp-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="bg-ndp-blue/4 border-b border-ndp-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-ndp-blue text-xs font-bold">#{rank}</span>
        <span className="text-ndp-muted text-xs">{pro.city}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-ndp-blue flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials(pro.name)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-ndp-text text-sm truncate">{pro.name}</h3>
            <p className="text-ndp-muted text-xs truncate">{pro.profession}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-ndp-bg rounded-xl py-2">
            <div className="font-bold text-ndp-text text-sm">{pro.monthScore ?? '–'}</div>
            <div className="text-[10px] text-ndp-muted">Score</div>
          </div>
          <div className="bg-ndp-bg rounded-xl py-2">
            <div className="font-bold text-ndp-text text-sm">{pro.referralsGiven}</div>
            <div className="text-[10px] text-ndp-muted">Ref</div>
          </div>
          <div className="bg-ndp-bg rounded-xl py-2">
            <div className="font-bold text-ndp-text text-sm flex items-center justify-center gap-0.5">
              <Star size={9} className="text-ndp-gold" fill="currentColor" />{pro.rating}
            </div>
            <div className="text-[10px] text-ndp-muted">Rating</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {pro.specialties.slice(0, 2).map((s) => (
            <span key={s} className="text-[10px] bg-ndp-blue/5 text-ndp-blue px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Podium: Compact row #4–8 ────────────────────────────────────────────────

function PodiumCompact({ pro, rank }: { pro: Professional; rank: number }) {
  return (
    <div className="bg-white rounded-2xl border border-ndp-border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-xl bg-ndp-blue/8 flex items-center justify-center text-ndp-blue font-bold text-xs">
            {getInitials(pro.name)}
          </div>
          <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-ndp-blue rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {rank}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ndp-text text-xs truncate">{pro.name}</p>
          <p className="text-ndp-muted text-[10px] truncate">{pro.profession}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold text-ndp-text">{pro.monthScore ?? '–'} pt</span>
        <span className="text-ndp-muted flex items-center gap-0.5">
          <Star size={9} fill="currentColor" className="text-ndp-gold" />{pro.rating}
        </span>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface TopProfessionistiProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  variant?: 'grid' | 'podium';
}

export default function TopProfessionisti({
  title,
  subtitle,
  limit = 8,
  variant = 'grid',
}: TopProfessionistiProps) {
  const top = getTopProfessionisti(limit);
  const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  if (variant === 'podium' && top.length >= 3) {
    const [first, second, third, ...rest] = top;
    return (
      <section className="py-20 bg-ndp-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-ndp-gold/10 text-ndp-gold-dark text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 border border-ndp-gold/20">
                <TrendingUp size={12} />
                Classifica {currentMonth}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text">
                {title ?? 'I professionisti che dominano questo mese'}
              </h2>
              <p className="text-ndp-muted text-sm mt-2">
                {subtitle ?? 'Classifica live basata su referral completati, score AI e valutazioni della rete.'}
              </p>
            </div>
          </div>

          {/* Top 3 podium */}
          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            <PodiumSpotlight pro={first} />
            <div className="grid sm:grid-cols-2 gap-4">
              <PodiumMedium pro={second} rank={2} />
              <PodiumMedium pro={third} rank={3} />
            </div>
          </div>

          {/* Compact row #4-8 */}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {rest.map((pro, i) => (
                <PodiumCompact key={pro.id} pro={pro} rank={i + 4} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Grid variant (default, retrocompatibile)
  return (
    <section className="py-16 bg-ndp-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-ndp-gold/10 text-ndp-gold-dark text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 border border-ndp-gold/20">
              <TrendingUp size={12} />
              Classifica {currentMonth}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ndp-text">
              {title ?? 'Top Professionisti del Mese'}
            </h2>
            {subtitle && <p className="text-ndp-muted text-sm mt-1">{subtitle}</p>}
          </div>
          <p className="text-xs text-ndp-muted">
            Ranking basato su richieste evase, referral e completamento profilo.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {top.map((pro, i) => (
            <TopCard key={pro.id} pro={pro} rank={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
