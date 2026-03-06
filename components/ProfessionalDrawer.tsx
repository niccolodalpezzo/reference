'use client';

import { useState } from 'react';
import { X, MapPin, Star, Clock, MessageSquare, Heart, Share2, CheckCircle2, TrendingUp, Sparkles, ExternalLink, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Professional } from '@/lib/types';
import { getInitials } from '@/lib/auth';
import { getOrCreateConversation } from '@/lib/db/conversations';
import { addSystemMessage } from '@/lib/db/messages';
import { appendLog } from '@/lib/db/logs';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

interface Props {
  professional: Professional;
  onClose: () => void;
  aiReasons?: string[];
}

const DEFAULT_AI_REASONS = [
  'Profilo completo con casi pratici dettagliati',
  'Alta reattività: risponde entro 2 ore in media',
  'Specializzato nel settore richiesto',
];

export default function ProfessionalDrawer({ professional: p, onClose, aiReasons }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSubject, setRequestSubject] = useState('');
  const [showRequestInput, setShowRequestInput] = useState(false);
  const reasons = aiReasons ?? DEFAULT_AI_REASONS;

  function handleInviaRichiesta() {
    if (!user) {
      router.push('/login?from=member');
      onClose();
      return;
    }
    if (!showRequestInput) {
      setShowRequestInput(true);
      return;
    }
    sendRequest();
  }

  async function sendRequest() {
    if (!user) return;
    setIsRequesting(true);

    const conv = await getOrCreateConversation(user.id, p.id, requestSubject || `Richiesta a ${p.name}`);
    if (conv) {
      await addSystemMessage(conv.id, `Richiesta inviata a ${p.name}`);
      await appendLog({
        user_id: user.id,
        user_display_name: user.name,
        type: 'chat_started',
        description: `Conversazione avviata con ${p.name} (${p.profession})`,
        metadata: { conversationId: conv.id, professionalId: p.id },
      });
      setIsRequesting(false);
      onClose();
      router.push(`/messaggi/${conv.id}`);
    } else {
      setIsRequesting(false);
    }
  }

  const sla = p.avgResponseTime
    ? p.avgResponseTime < 4 ? 'verde' : p.avgResponseTime < 24 ? 'giallo' : 'rosso'
    : 'verde';

  const slaColor = { verde: 'text-green-700 bg-green-50', giallo: 'text-yellow-700 bg-yellow-50', rosso: 'text-red-700 bg-red-50' }[sla];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-ndp-blue to-ndp-blue-mid px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={clsx('w-8 h-8 rounded-lg flex items-center justify-center transition-all', isSaved ? 'bg-red-400 text-white' : 'bg-white/20 hover:bg-white/30 text-white')}
              >
                <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
              <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors text-white">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-xl font-bold">
              {getInitials(p.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-lg leading-tight">{p.name}</h2>
              <p className="text-indigo-200 text-sm">{p.profession}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-indigo-300" />
                <span className="text-indigo-200 text-xs">{p.city} · {p.chapter}</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{p.rating.toFixed(1)}</p>
              <p className="text-indigo-200 text-[10px]">Rating</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">{p.referralsGiven}</p>
              <p className="text-indigo-200 text-[10px]">Referral</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">{p.yearsInBNI}y</p>
              <p className="text-indigo-200 text-[10px]">In BNI</p>
            </div>
            {p.avgResponseTime && (
              <>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <p className="text-white font-bold text-lg">{p.avgResponseTime < 1 ? `${Math.round(p.avgResponseTime * 60)}m` : `${p.avgResponseTime}h`}</p>
                  <p className="text-indigo-200 text-[10px]">Risposta</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Request input (shown when user clicks Invia richiesta) */}
          {showRequestInput && (
            <div className="m-4 p-4 bg-ndp-bg rounded-2xl border border-ndp-blue/20 animate-fade-in">
              <p className="text-xs font-bold text-ndp-text mb-2">Oggetto della richiesta (opzionale)</p>
              <input
                type="text"
                value={requestSubject}
                onChange={(e) => setRequestSubject(e.target.value)}
                placeholder={`es. Consulenza contratto, Pianificazione fiscale...`}
                className="w-full px-3 py-2 rounded-xl border border-ndp-border text-sm focus:border-ndp-blue focus:outline-none bg-white"
                onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
                autoFocus
              />
              <p className="text-[10px] text-ndp-muted mt-1.5">Premi Invio o il bottone per aprire la chat</p>
            </div>
          )}

          <div className="p-5 space-y-5">
            {/* Bio */}
            {p.bio && (
              <div>
                <h3 className="text-xs font-bold text-ndp-text uppercase tracking-wide mb-2">Chi sono</h3>
                <p className="text-sm text-ndp-muted leading-relaxed">{p.bio}</p>
              </div>
            )}

            {/* Specialties */}
            {p.specialties?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-ndp-text uppercase tracking-wide mb-2">Specialità</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.specialties.map((s) => (
                    <span key={s} className="text-xs bg-ndp-bg text-ndp-blue px-2.5 py-1 rounded-full font-medium border border-ndp-border">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI match reasons */}
            <div className="bg-gradient-to-br from-ndp-gold-light/40 to-ndp-bg rounded-2xl p-4 border border-ndp-gold/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-ndp-gold-dark" />
                <h3 className="text-xs font-bold text-ndp-gold-dark uppercase tracking-wide">Perché questo professionista</h3>
              </div>
              <div className="space-y-2">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ndp-gold-dark mt-0.5 shrink-0" />
                    <p className="text-xs text-ndp-text">{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity metrics */}
            <div>
              <h3 className="text-xs font-bold text-ndp-text uppercase tracking-wide mb-2.5">Attività nella rete</h3>
              <div className="grid grid-cols-2 gap-2">
                {p.requestsReceived !== undefined && (
                  <div className="bg-ndp-bg rounded-xl p-3">
                    <p className="text-sm font-bold text-ndp-text">{p.requestsReceived}</p>
                    <p className="text-[10px] text-ndp-muted">Richieste ricevute</p>
                  </div>
                )}
                {p.requestsFulfilled !== undefined && (
                  <div className="bg-ndp-bg rounded-xl p-3">
                    <p className="text-sm font-bold text-ndp-text">{p.requestsFulfilled}</p>
                    <p className="text-[10px] text-ndp-muted">Richieste evase</p>
                  </div>
                )}
                {p.avgResponseTime && (
                  <div className={clsx('rounded-xl p-3', slaColor)}>
                    <p className="text-sm font-bold">{p.avgResponseTime}h</p>
                    <p className="text-[10px]">Tempo medio risposta</p>
                  </div>
                )}
                {p.monthScore !== undefined && (
                  <div className="bg-ndp-bg rounded-xl p-3">
                    <p className="text-sm font-bold text-ndp-blue">{p.monthScore}</p>
                    <p className="text-[10px] text-ndp-muted">Score mensile</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contacts */}
            {(p.email || p.phone) && (
              <div>
                <h3 className="text-xs font-bold text-ndp-text uppercase tracking-wide mb-2">Contatti</h3>
                <div className="space-y-1.5">
                  {p.email && <p className="text-xs text-ndp-blue">{p.email}</p>}
                  {p.phone && <p className="text-xs text-ndp-muted">{p.phone}</p>}
                </div>
              </div>
            )}

            <Link
              href={`/professionisti/profilo/${p.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-ndp-border text-ndp-muted text-xs font-medium hover:bg-ndp-bg transition-colors"
              onClick={onClose}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Vedi profilo completo
            </Link>
          </div>
        </div>

        {/* Sticky footer CTA */}
        <div className="p-4 border-t border-ndp-border bg-white">
          <button
            onClick={handleInviaRichiesta}
            disabled={isRequesting}
            className="w-full py-3.5 bg-ndp-blue text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-ndp-blue-dark transition-colors disabled:opacity-60"
          >
            {isRequesting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {showRequestInput ? <Send className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                {showRequestInput ? 'Invia e apri chat' : 'Invia richiesta'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
