'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getProfessionalById } from '@/lib/utils';
import { computeScore } from '@/lib/scoring';
import { getReferencesByProfessional } from '@/lib/storage/references';
import { getConversations } from '@/lib/storage/conversations';
import { AfidabilityScore } from '@/lib/types';
import AfidabilityGauge from '@/components/scoring/AfidabilityGauge';
import ScoreBreakdown from '@/components/scoring/ScoreBreakdown';
import MotivationBanner from '@/components/scoring/MotivationBanner';
import Link from 'next/link';
import {
  MessageSquare, Clock, Eye, Edit3, Award, ChevronRight,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const professional = user?.professionalId ? getProfessionalById(user.professionalId) : null;

  const [score, setScore] = useState<AfidabilityScore | null>(null);

  useEffect(() => {
    if (!professional || !user) return;
    const refs = getReferencesByProfessional(professional.id);
    const convs = getConversations(user.id);
    setScore(computeScore(professional, refs, convs));
  }, [professional, user]);

  const avgResponseTime = professional?.avgResponseTime ?? 18;
  const isTopOfMonth = professional?.isTopOfMonth ?? false;

  const recentRequests = [
    { id: 1, from: 'Giovanni F.', need: 'Contratto distribuzione internazionale', date: '2 ore fa', status: 'new' },
    { id: 2, from: 'Laura B.', need: 'Fusione societaria PMI', date: 'Ieri', status: 'answered' },
    { id: 3, from: 'Antonio M.', need: 'Tutela marchio registrato', date: '3 giorni fa', status: 'answered' },
    { id: 4, from: 'Chiara R.', need: 'Contratto di agenzia', date: '5 giorni fa', status: 'answered' },
  ];

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Header */}
      <div className="bg-ndp-blue py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {isTopOfMonth && (
                <div className="inline-flex items-center gap-1.5 bg-ndp-gold text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Award size={12} />
                  Top del Mese
                </div>
              )}
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Ciao, {user?.name.split(' ')[0]}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {professional?.profession ?? 'Professionista'} · {professional?.city ?? ''} · {professional?.chapter ?? ''}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/professionisti/preview"
                className="inline-flex items-center gap-2 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <Eye size={15} />
                Preview
              </Link>
              <Link
                href="/professionisti/wizard"
                className="inline-flex items-center gap-2 bg-white text-ndp-blue text-sm font-bold px-4 py-2 rounded-xl hover:bg-white/90 transition-all"
              >
                <Edit3 size={15} />
                Modifica profilo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Reliability Score Card */}
        {score && (
          <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ndp-border flex items-center justify-between">
              <h2 className="font-semibold text-ndp-text">Indice di Affidabilità</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                score.total >= 700 ? 'bg-ndp-gold-light text-ndp-gold-dark' :
                score.total >= 400 ? 'bg-ndp-blue/10 text-ndp-blue' :
                'bg-red-50 text-red-600'
              }`}>
                {score.total >= 700 ? 'Eccellente' : score.total >= 400 ? 'In crescita' : 'Da migliorare'}
              </span>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="mx-auto sm:mx-0">
                  <AfidabilityGauge score={score} size="lg" />
                </div>
                <div className="flex-1 w-full">
                  <ScoreBreakdown score={score} />
                </div>
              </div>
              <div className="mt-6">
                <MotivationBanner score={score} />
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/messaggi"
            className="bg-ndp-blue rounded-2xl p-5 shadow-sm hover:opacity-95 transition-opacity flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-white mb-1">Vai ai messaggi</h3>
              <p className="text-xs text-white/60">Gestisci le tue conversazioni e invia referenze</p>
            </div>
            <MessageSquare size={22} className="text-white/60 group-hover:text-white transition-colors" />
          </Link>
          <Link
            href="/cerca"
            className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-ndp-text mb-1">Cerca professionisti</h3>
              <p className="text-xs text-ndp-muted">Trova il contatto giusto nella rete NDP</p>
            </div>
            <ChevronRight size={20} className="text-ndp-muted group-hover:text-ndp-blue transition-colors" />
          </Link>
        </div>

        {/* Recent requests */}
        <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-ndp-border flex items-center justify-between">
            <h2 className="font-semibold text-ndp-text">Ultime richieste ricevute</h2>
            <div className="flex items-center gap-1.5 text-xs text-ndp-muted">
              <Clock size={12} />
              Tempo medio risposta: {avgResponseTime}h
            </div>
          </div>
          <div className="divide-y divide-ndp-border">
            {recentRequests.map((req) => (
              <div key={req.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-ndp-text">{req.from}</span>
                    {req.status === 'new' && (
                      <span className="text-[10px] font-bold text-white bg-ndp-blue px-2 py-0.5 rounded-full">NUOVA</span>
                    )}
                  </div>
                  <p className="text-xs text-ndp-muted truncate">{req.need}</p>
                </div>
                <span className="text-xs text-ndp-muted shrink-0">{req.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="member">
      <DashboardContent />
    </AuthGuard>
  );
}
