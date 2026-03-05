'use client';

import { professionals } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import {
  MapPin, Building2, Star, Phone, Mail, Award, TrendingUp, ArrowLeft,
  CheckCircle2, Users, Briefcase, Target, Heart, Lightbulb, Network, Zap
} from 'lucide-react';
import { demoMarcoProfile } from '@/lib/memberData';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-ndp-border p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-ndp-blue/8 rounded-xl flex items-center justify-center text-ndp-blue">
          {icon}
        </div>
        <h3 className="font-semibold text-ndp-text">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pro = professionals.find((p) => p.id === id);
  if (!pro) notFound();

  const isDemoMarco = pro.id === 'demo-marco';
  const wizard = isDemoMarco ? demoMarcoProfile : null;

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Hero */}
      <div className="bg-ndp-blue py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 network-bg opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <Link
            href="/assistente"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Torna alla ricerca
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-white/15 flex items-center justify-center text-white font-bold text-2xl shrink-0 border border-white/10 backdrop-blur-sm">
              {getInitials(pro.name)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">{pro.name}</h1>
                {pro.isTopOfMonth && (
                  <span className="inline-flex items-center gap-1 bg-ndp-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <Award size={10} /> Top del Mese
                  </span>
                )}
              </div>
              <p className="text-white/80 text-base font-medium mb-2">{pro.profession}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1.5"><MapPin size={13} />{pro.city}</span>
                <span className="flex items-center gap-1.5"><Building2 size={13} />{pro.chapter}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={13} />{pro.yearsInBNI} anni in BNI</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-3 mt-6 bg-white/8 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            {[
              { label: 'Rating', value: `${pro.rating}`, icon: Star },
              { label: 'Referral', value: `${pro.referralsGiven}`, icon: TrendingUp },
              { label: 'Score mensile', value: pro.monthScore ? `${pro.monthScore}` : '–', icon: Zap },
              { label: 'Tasso evasione', value: pro.requestsReceived ? `${Math.round(((pro.requestsFulfilled ?? 0) / pro.requestsReceived) * 100)}%` : '–', icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Icon size={12} className="text-ndp-gold" />
                  <span className="font-bold text-white text-lg">{value}</span>
                </div>
                <span className="text-[10px] text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions + Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Action bar */}
        <div className="bg-white rounded-2xl border border-ndp-border shadow-sm p-4 mb-6 flex flex-wrap gap-3">
          <a
            href={`tel:${pro.phone}`}
            className="flex items-center gap-2 text-sm font-bold bg-ndp-blue text-white px-5 py-2.5 rounded-xl hover:bg-ndp-blue-dark transition-all"
          >
            <Phone size={14} /> Chiama
          </a>
          <a
            href={`mailto:${pro.email}`}
            className="flex items-center gap-2 text-sm font-medium border border-ndp-border text-ndp-text px-5 py-2.5 rounded-xl hover:border-ndp-blue/30 hover:text-ndp-blue transition-all"
          >
            <Mail size={14} /> Invia email
          </a>
          <Link
            href={`/assistente?q=referral per ${pro.name}`}
            className="ml-auto flex items-center gap-2 text-sm font-medium border border-ndp-blue/30 text-ndp-blue px-5 py-2.5 rounded-xl hover:bg-ndp-blue/5 transition-all"
          >
            <Network size={14} /> Chiedi referral all&apos;AI
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio / Chi sono */}
            <Section icon={<Users size={15} />} title="Chi sono">
              <p className="text-sm text-ndp-muted leading-relaxed">{pro.bio}</p>
            </Section>

            {/* Specialità */}
            <Section icon={<Briefcase size={15} />} title="Specialità e servizi">
              <div className="flex flex-wrap gap-2">
                {pro.specialties.map((s) => (
                  <span key={s} className="text-sm bg-ndp-blue/6 text-ndp-blue px-3 py-1.5 rounded-full border border-ndp-blue/12 font-medium">
                    {s}
                  </span>
                ))}
              </div>
              {wizard && wizard.mainServices.length > 0 && (
                <div className="mt-4 space-y-2">
                  {wizard.mainServices.map((s) => (
                    <div key={s} className="flex items-start gap-2 text-sm text-ndp-muted">
                      <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Casi tipici */}
            {wizard?.typicalCases && (
              <Section icon={<Target size={15} />} title="Casi tipici che gestisco">
                <p className="text-sm text-ndp-muted leading-relaxed">{wizard.typicalCases}</p>
                {wizard.triggerPhrases.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-ndp-text mb-2">Parole chiave che mi identificano</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wizard.triggerPhrases.map((t) => (
                        <span key={t} className="text-xs bg-ndp-bg border border-ndp-border text-ndp-muted px-2.5 py-1 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {/* GAINS */}
            {wizard && (
              <Section icon={<Lightbulb size={15} />} title="GAINS">
                <div className="space-y-4">
                  {[
                    { label: 'Goals', value: wizard.goals },
                    { label: 'Achievements', value: wizard.achievements },
                    { label: 'Interests', value: wizard.interests },
                    { label: 'Networks', value: wizard.networks },
                    { label: 'Skills', value: wizard.skills },
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <p className="text-[11px] font-bold text-ndp-blue uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm text-ndp-muted leading-relaxed">{value}</p>
                    </div>
                  ) : null)}
                </div>
              </Section>
            )}

            {/* Come presentarmi */}
            {wizard?.goodReference && (
              <Section icon={<Heart size={15} />} title="Come presentarmi">
                <div className="bg-ndp-bg rounded-xl p-4 border border-ndp-border">
                  <p className="text-sm text-ndp-muted leading-relaxed italic">&ldquo;{wizard.goodReference}&rdquo;</p>
                </div>
                {wizard.badReference && (
                  <div className="mt-3 bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs font-semibold text-red-600 mb-1">Non ho bisogno di referenze per:</p>
                    <p className="text-sm text-red-500 leading-relaxed">{wizard.badReference}</p>
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Contatti */}
            <div className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm">
              <h3 className="font-semibold text-ndp-text text-sm mb-4">Contatti</h3>
              <div className="space-y-3">
                <a href={`tel:${pro.phone}`} className="flex items-center gap-3 text-sm text-ndp-text hover:text-ndp-blue group transition-colors">
                  <div className="w-8 h-8 bg-ndp-bg rounded-lg flex items-center justify-center group-hover:bg-ndp-blue/10">
                    <Phone size={13} className="text-ndp-blue" />
                  </div>
                  {pro.phone}
                </a>
                <a href={`mailto:${pro.email}`} className="flex items-center gap-3 text-sm text-ndp-text hover:text-ndp-blue group transition-colors">
                  <div className="w-8 h-8 bg-ndp-bg rounded-lg flex items-center justify-center group-hover:bg-ndp-blue/10">
                    <Mail size={13} className="text-ndp-blue" />
                  </div>
                  {pro.email}
                </a>
              </div>
            </div>

            {/* Clienti ideali */}
            {wizard?.idealClientProfile && (
              <div className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm">
                <h3 className="font-semibold text-ndp-text text-sm mb-3">Cliente ideale</h3>
                <p className="text-xs text-ndp-muted leading-relaxed">{wizard.idealClientProfile}</p>
              </div>
            )}

            {/* Power Team */}
            {wizard && wizard.powerTeam.length > 0 && (
              <div className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm">
                <h3 className="font-semibold text-ndp-text text-sm mb-3">Power Team</h3>
                <div className="space-y-2">
                  {wizard.powerTeam.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-xs text-ndp-muted">
                      <Network size={11} className="text-ndp-blue shrink-0" />
                      {pt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Perché questo professionista */}
            <div className="bg-gradient-to-br from-ndp-blue/5 to-ndp-gold/5 rounded-2xl border border-ndp-blue/10 p-5">
              <h3 className="font-semibold text-ndp-blue text-sm mb-3 flex items-center gap-1.5">
                <Zap size={13} />
                Perché sceglierlo
              </h3>
              <ul className="space-y-2">
                <li className="text-xs text-ndp-text flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                  {pro.yearsInBNI} anni di fiducia nella rete BNI
                </li>
                <li className="text-xs text-ndp-text flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                  {pro.referralsGiven} referral generati per la rete
                </li>
                <li className="text-xs text-ndp-text flex items-start gap-2">
                  <CheckCircle2 size={12} className="text-green-500 mt-0.5 shrink-0" />
                  Rating {pro.rating}/5 da colleghi verificati
                </li>
                {pro.isTopOfMonth && (
                  <li className="text-xs text-ndp-text flex items-start gap-2">
                    <Award size={12} className="text-ndp-gold mt-0.5 shrink-0" />
                    Top del mese per attività e qualità
                  </li>
                )}
              </ul>
            </div>

            {/* Personal info */}
            {wizard?.personalInfo && (
              <div className="bg-white rounded-2xl border border-ndp-border p-5 shadow-sm">
                <h3 className="font-semibold text-ndp-text text-sm mb-3">Info personali</h3>
                <p className="text-xs text-ndp-muted leading-relaxed">{wizard.personalInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
