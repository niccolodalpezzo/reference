'use client';

import { AfidabilityScore } from '@/lib/types';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface Props {
  score: AfidabilityScore;
}

export default function MotivationBanner({ score }: Props) {
  const suggestions: { message: string; cta: string; href: string; points: number }[] = [];

  if (score.profilo < 100) {
    suggestions.push({
      message: `Il tuo profilo è al ${score.profilo}% — completalo per aumentare la visibilità`,
      cta: 'Completa il profilo',
      href: '/professionisti/wizard',
      points: 100 - score.profilo,
    });
  }

  if (score.riferenze < 200) {
    suggestions.push({
      message: 'Ogni referenza approvata vale +40 punti nel tuo indice',
      cta: 'Invia una referenza',
      href: '/messaggi',
      points: 40,
    });
  }

  if (score.affidabilita < 200) {
    suggestions.push({
      message: 'Rispondi più velocemente per migliorare l\'Indice di Affidabilità',
      cta: 'Vai ai messaggi',
      href: '/messaggi',
      points: 50,
    });
  }

  if (suggestions.length === 0) return null;

  const top = suggestions[0];

  return (
    <div className="bg-gradient-to-r from-ndp-blue to-ndp-blue-mid rounded-2xl p-4 flex items-center gap-4">
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
        <Zap className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium leading-tight">{top.message}</p>
        <p className="text-indigo-200 text-xs mt-0.5">+{top.points} punti potenziali</p>
      </div>
      <Link
        href={top.href}
        className="shrink-0 flex items-center gap-1 bg-white text-ndp-blue text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-ndp-bg transition-colors whitespace-nowrap"
      >
        {top.cta}
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
