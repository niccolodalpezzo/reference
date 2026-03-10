'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getWizardProfile } from '@/lib/db/wizard';
import { getConversations, Conversation } from '@/lib/db/conversations';
import { computeProfileCompletion } from '@/lib/scoring';
import { WizardProfile } from '@/lib/types';
import Link from 'next/link';
import ReteContatti from '@/components/ReteContatti';
import {
  MessageSquare, Clock, Edit3, ChevronRight, Search,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profilePct, setProfilePct] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      if (!user) return;
      const [convs, wizardData] = await Promise.all([
        getConversations(user.id),
        getWizardProfile(user.id),
      ]);
      setConversations(convs);
      if (wizardData.profile) {
        setProfilePct(computeProfileCompletion(wizardData.profile as WizardProfile));
      } else {
        setProfilePct(wizardData.completionPct);
      }
      setIsLoading(false);
    }

    load();
  }, [user]);

  const recentConvs = conversations.slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ndp-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ndp-blue/20 border-t-ndp-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Header */}
      <div className="bg-ndp-blue py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Ciao, {user?.name.split(' ')[0]}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {user?.city ?? ''} {user?.province ? `· ${user.province}` : ''}
              </p>
            </div>
            <div className="flex gap-3">
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

        {/* Profile completion bar */}
        {profilePct < 100 && (
          <div className="bg-white rounded-2xl border border-ndp-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ndp-text">Completamento profilo</span>
              <span className="text-sm font-bold text-ndp-gold-dark">{profilePct}%</span>
            </div>
            <div className="h-2 bg-ndp-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ndp-gold to-ndp-gold-dark rounded-full transition-all duration-500"
                style={{ width: `${profilePct}%` }}
              />
            </div>
            {profilePct === 0 && (
              <p className="text-xs text-ndp-muted mt-2">
                Completa il tuo profilo AI per essere trovato dall&apos;Assistente.{' '}
                <Link href="/professionisti/wizard" className="text-ndp-blue font-medium hover:underline">
                  Inizia ora →
                </Link>
              </p>
            )}
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
            href="/assistente"
            className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-ndp-text mb-1">Cerca professionisti</h3>
              <p className="text-xs text-ndp-muted">Trova il contatto giusto nella rete NDP</p>
            </div>
            <Search size={20} className="text-ndp-muted group-hover:text-ndp-blue transition-colors" />
          </Link>
        </div>

        {/* Recent conversations */}
        <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-ndp-border flex items-center justify-between">
            <h2 className="font-semibold text-ndp-text">Ultime conversazioni</h2>
            <div className="flex items-center gap-1.5 text-xs text-ndp-muted">
              <Clock size={12} />
              {conversations.length} conversazioni
            </div>
          </div>
          {recentConvs.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <MessageSquare size={32} className="mx-auto text-ndp-muted/40 mb-3" />
              <p className="text-sm font-medium text-ndp-text mb-1">Nessuna conversazione ancora</p>
              <p className="text-xs text-ndp-muted mb-4">
                Usa l&apos;Assistente AI per trovare il tuo primo professionista.
              </p>
              <Link
                href="/assistente"
                className="inline-flex items-center gap-2 bg-ndp-blue text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-ndp-blue/90 transition-all"
              >
                Vai all&apos;Assistente AI
                <ChevronRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ndp-border">
              {recentConvs.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/messaggi/${conv.id}`}
                  className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-ndp-bg/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-ndp-text truncate">
                        {conv.subject ?? 'Conversazione'}
                      </span>
                      {conv.unread_count > 0 && (
                        <span className="text-[10px] font-bold text-white bg-ndp-blue px-2 py-0.5 rounded-full shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ndp-muted truncate">{conv.last_message_preview}</p>
                  </div>
                  <span className="text-xs text-ndp-muted shrink-0">
                    {new Date(conv.last_message_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Rete Contatti */}
        <ReteContatti />

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
