'use client';

import { Professional } from '@/lib/types';
import { X, Phone, Mail, MapPin, Building2, Star, Award, TrendingUp, Heart, Share2, Send, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

interface ProfessionalDrawerProps {
  professional: Professional;
  onClose: () => void;
}

export default function ProfessionalDrawer({ professional: p, onClose }: ProfessionalDrawerProps) {
  const [saved, setSaved] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(`${p.name} — ${p.profession} | NDP Reference`);
    setShareMsg('Link copiato!');
    setTimeout(() => setShareMsg(''), 2000);
  };

  const handleRequest = () => {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-ndp-blue px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-white font-bold text-xl shrink-0 backdrop-blur-sm border border-white/10">
              {getInitials(p.name)}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="font-display text-xl font-bold text-white truncate">{p.name}</h2>
                {p.isTopOfMonth && (
                  <span className="inline-flex items-center gap-1 bg-ndp-gold text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    <Award size={8} /> TOP
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm">{p.profession}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-white/60 text-xs">
                  <MapPin size={10} /> {p.city}
                </span>
                <span className="flex items-center gap-1 text-white/60 text-xs">
                  <Building2 size={10} /> {p.chapter}
                </span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/15">
            {[
              { label: 'Rating', value: `${p.rating}`, icon: Star },
              { label: 'Referral', value: `${p.referralsGiven}`, icon: TrendingUp },
              { label: 'Anni BNI', value: `${p.yearsInBNI}`, icon: Award },
              ...(p.monthScore ? [{ label: 'Score', value: `${p.monthScore}`, icon: TrendingUp }] : []),
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 text-white font-bold text-sm">
                  <Icon size={11} className="text-ndp-gold" />
                  {value}
                </div>
                <div className="text-white/40 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions bar */}
        <div className="sticky top-0 z-[5] bg-white border-b border-ndp-border px-6 py-3 flex items-center gap-2">
          <button
            onClick={handleRequest}
            disabled={requestSent}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-ndp-blue text-white text-xs font-bold py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all disabled:opacity-70"
          >
            {requestSent ? <CheckCircle2 size={13} /> : <Send size={13} />}
            {requestSent ? 'Richiesta inviata!' : 'Invia richiesta'}
          </button>
          <button
            onClick={handleSave}
            className={`p-2.5 rounded-xl border transition-all ${saved ? 'bg-red-50 border-red-200 text-red-500' : 'border-ndp-border text-ndp-muted hover:text-ndp-blue hover:border-ndp-blue/30'}`}
          >
            <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-ndp-border text-ndp-muted hover:text-ndp-blue hover:border-ndp-blue/30 transition-all relative"
          >
            <Share2 size={15} />
            {shareMsg && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ndp-text text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                {shareMsg}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Chi sono */}
          <section>
            <h3 className="text-xs font-bold text-ndp-muted uppercase tracking-wider mb-2.5">Chi sono</h3>
            <p className="text-sm text-ndp-text leading-relaxed">{p.bio}</p>
          </section>

          {/* Specialità */}
          <section>
            <h3 className="text-xs font-bold text-ndp-muted uppercase tracking-wider mb-2.5">Specialità</h3>
            <div className="flex flex-wrap gap-2">
              {p.specialties.map((s) => (
                <span key={s} className="text-xs bg-ndp-blue/6 text-ndp-blue px-3 py-1.5 rounded-full border border-ndp-blue/12 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* Perché questo professionista — AI match reason */}
          <section className="bg-gradient-to-br from-ndp-blue/4 to-ndp-gold/4 rounded-2xl p-5 border border-ndp-blue/10">
            <h3 className="text-xs font-bold text-ndp-blue uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp size={11} />
              Perché questo professionista
            </h3>
            <ul className="space-y-2 text-sm text-ndp-text">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                Specializzato nelle aree richieste con {p.yearsInBNI} anni di esperienza nella rete BNI
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                Rating {p.rating}/5 con {p.referralsGiven} referral generati nella rete
              </li>
              {p.monthScore && p.monthScore > 80 && (
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                  Score mensile alto ({p.monthScore}/100) — professionista molto attivo
                </li>
              )}
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                Opera su {p.city} — compatibile con la richiesta geografica
              </li>
            </ul>
          </section>

          {/* Metriche attività */}
          {(p.requestsReceived || p.requestsFulfilled) && (
            <section>
              <h3 className="text-xs font-bold text-ndp-muted uppercase tracking-wider mb-2.5">Attività nella rete</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Richieste', value: p.requestsReceived ?? 0 },
                  { label: 'Evase', value: p.requestsFulfilled ?? 0 },
                  { label: 'Tempo risposta', value: `${p.avgResponseTime ?? 24}h` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-ndp-bg rounded-xl p-3 text-center">
                    <div className="font-bold text-ndp-text text-lg">{value}</div>
                    <div className="text-[10px] text-ndp-muted">{label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contatti */}
          <section>
            <h3 className="text-xs font-bold text-ndp-muted uppercase tracking-wider mb-2.5">Contatti diretti</h3>
            <div className="space-y-2">
              <a
                href={`tel:${p.phone}`}
                className="flex items-center gap-3 text-sm text-ndp-text hover:text-ndp-blue bg-ndp-bg rounded-xl px-4 py-3 transition-colors group"
              >
                <div className="w-8 h-8 bg-ndp-blue/10 rounded-lg flex items-center justify-center group-hover:bg-ndp-blue/20 transition-colors">
                  <Phone size={14} className="text-ndp-blue" />
                </div>
                {p.phone}
              </a>
              <a
                href={`mailto:${p.email}`}
                className="flex items-center gap-3 text-sm text-ndp-text hover:text-ndp-blue bg-ndp-bg rounded-xl px-4 py-3 transition-colors group"
              >
                <div className="w-8 h-8 bg-ndp-blue/10 rounded-lg flex items-center justify-center group-hover:bg-ndp-blue/20 transition-colors">
                  <Mail size={14} className="text-ndp-blue" />
                </div>
                {p.email}
              </a>
            </div>
          </section>

          {/* Apri profilo completo link */}
          <Link
            href={`/professionisti/profilo/${p.id}`}
            className="flex items-center justify-center gap-2 w-full bg-ndp-bg border border-ndp-border text-ndp-text font-medium py-3 rounded-xl hover:border-ndp-blue/30 hover:text-ndp-blue transition-all text-sm"
          >
            <ExternalLink size={14} />
            Apri profilo completo
          </Link>
        </div>
      </div>
    </div>
  );
}
