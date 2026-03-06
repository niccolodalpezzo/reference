'use client';

import { AfidabilityScore } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  score: AfidabilityScore;
}

const CATEGORIES = [
  {
    key: 'affidabilita' as const,
    label: 'Affidabilità',
    desc: 'Velocità di risposta',
    max: 300,
    color: 'bg-ndp-blue',
    textColor: 'text-ndp-blue',
  },
  {
    key: 'riferenze' as const,
    label: 'Riferenze',
    desc: 'Referenze approvate',
    max: 400,
    color: 'bg-ndp-gold',
    textColor: 'text-ndp-gold-dark',
  },
  {
    key: 'attivita' as const,
    label: 'Attività',
    desc: 'Conversazioni risolte',
    max: 200,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
  },
  {
    key: 'profilo' as const,
    label: 'Profilo',
    desc: 'Completamento %',
    max: 100,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
  },
];

export default function ScoreBreakdown({ score }: Props) {
  return (
    <div className="space-y-3.5">
      {CATEGORIES.map(({ key, label, desc, max, color, textColor }) => {
        const value = score[key];
        const pct = Math.round((value / max) * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <span className="text-xs font-semibold text-ndp-text">{label}</span>
                <span className="text-[10px] text-ndp-muted ml-1.5">{desc}</span>
              </div>
              <div className="text-right">
                <span className={clsx('text-sm font-bold', textColor)}>{value}</span>
                <span className="text-[10px] text-ndp-muted">/{max}</span>
              </div>
            </div>
            <div className="h-2 bg-ndp-bg rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all duration-700', color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
