'use client';

import { getTopProfessionisti } from '@/lib/utils';
import { Professional } from '@/lib/types';
import { Star, Award, TrendingUp } from 'lucide-react';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

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

interface TopProfessionistiProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export default function TopProfessionisti({ title, subtitle, limit = 8 }: TopProfessionistiProps) {
  const top = getTopProfessionisti(limit);
  const currentMonth = new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

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
