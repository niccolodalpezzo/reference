'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';

import { getProfessionalById } from '@/lib/utils';
import Link from 'next/link';
import {
  TrendingUp,
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  Eye,
  Edit3,
  Award,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const professional = user?.professionalId ? getProfessionalById(user.professionalId) : null;

  const profileScore = professional?.profileScore ?? 72;
  const monthScore = professional?.monthScore ?? 84;
  const requestsReceived = professional?.requestsReceived ?? 14;
  const requestsFulfilled = professional?.requestsFulfilled ?? 11;
  const avgResponseTime = professional?.avgResponseTime ?? 18;
  const rating = professional?.rating ?? 4.7;
  const isTopOfMonth = professional?.isTopOfMonth ?? false;

  const fulfillmentRate = requestsReceived > 0 ? Math.round((requestsFulfilled / requestsReceived) * 100) : 0;

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
        {/* Profile completion */}
        <div className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ndp-text">Completamento profilo</h2>
            <span className="text-lg font-bold text-ndp-gold-dark">{profileScore}%</span>
          </div>
          <div className="h-3 bg-ndp-bg rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-ndp-gold to-ndp-gold-dark rounded-full transition-all"
              style={{ width: `${profileScore}%` }}
            />
          </div>
          <p className="text-xs text-ndp-muted">
            {profileScore < 80
              ? 'Completa il profilo per ricevere più referral e salire in classifica.'
              : 'Ottimo! Il tuo profilo è ben curato. Continua ad aggiornarlo ogni mese.'}
          </p>
          {profileScore < 80 && (
            <Link
              href="/professionisti/wizard"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-ndp-blue hover:underline"
            >
              Completa ora →
            </Link>
          )}
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Score mensile', value: monthScore, icon: TrendingUp, color: 'text-ndp-blue', suffix: '/100' },
            { label: 'Richieste ricevute', value: requestsReceived, icon: MessageSquare, color: 'text-purple-600', suffix: '' },
            { label: 'Tasso evasione', value: `${fulfillmentRate}%`, icon: CheckCircle2, color: 'text-green-600', suffix: '' },
            { label: 'Rating', value: rating, icon: Star, color: 'text-ndp-gold-dark', suffix: '/5' },
          ].map(({ label, value, icon: Icon, color, suffix }) => (
            <div key={label} className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm text-center">
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <div className="font-bold text-ndp-text text-xl">
                {value}{suffix}
              </div>
              <div className="text-xs text-ndp-muted mt-1">{label}</div>
            </div>
          ))}
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
