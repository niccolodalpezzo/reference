'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getProfessionalById } from '@/lib/utils';
import { WizardProfile } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, MapPin, Building2, Star, Edit3, Phone, Mail, Award } from 'lucide-react';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function PreviewContent() {
  const { user } = useAuth();
  const professional = user?.professional_id ? getProfessionalById(user.professional_id) : null;
  // wizard data loaded from Supabase (not yet implemented)
  const wizard = null as WizardProfile | null;

  const name = professional?.name ?? user?.name ?? '';
  const profession = professional?.profession ?? '';
  const city = professional?.city ?? '';
  const chapter = professional?.chapter ?? '';
  const bio = professional?.bio ?? '';
  const rating = professional?.rating ?? 0;
  const referralsGiven = professional?.referralsGiven ?? 0;
  const yearsInBNI = professional?.yearsInBNI ?? 0;
  const specialties = professional?.specialties ?? [];
  const isTopOfMonth = professional?.isTopOfMonth ?? false;

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Preview banner */}
      <div className="bg-ndp-gold-light border-b border-ndp-gold/30 py-2.5 px-4 text-center">
        <p className="text-ndp-gold-dark text-xs font-medium">
          Anteprima del tuo profilo pubblico —{' '}
          <Link href="/professionisti/wizard" className="underline">
            Modifica profilo
          </Link>
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/professionisti/dashboard"
          className="inline-flex items-center gap-1.5 text-ndp-muted hover:text-ndp-blue text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Dashboard
        </Link>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-ndp-border shadow-sm overflow-hidden mb-5">
          {/* Header */}
          <div className="bg-ndp-blue p-8 relative">
            {isTopOfMonth && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 bg-ndp-gold text-white text-xs font-bold px-3 py-1 rounded-full">
                  <Award size={11} />
                  Top del Mese
                </span>
              </div>
            )}
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-ndp-gold rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {getInitials(name)}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">{name}</h1>
                <p className="text-white/80 text-sm font-medium">{profession}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <MapPin size={11} /> {city}
                  </span>
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <Building2 size={11} /> {chapter}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-ndp-border border-b border-ndp-border">
            {[
              { label: 'Rating', value: `★ ${rating}` },
              { label: 'Referral dati', value: referralsGiven },
              { label: 'Anni in BNI', value: yearsInBNI },
            ].map(({ label, value }) => (
              <div key={label} className="py-4 text-center">
                <div className="font-bold text-ndp-text text-lg">{value}</div>
                <div className="text-xs text-ndp-muted">{label}</div>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {bio && (
              <div>
                <h3 className="font-semibold text-ndp-text text-sm mb-2">Chi sono</h3>
                <p className="text-ndp-muted text-sm leading-relaxed">{bio}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-ndp-text text-sm mb-2">Specialità</h3>
              <div className="flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <span key={s} className="text-xs bg-ndp-blue/8 text-ndp-blue px-3 py-1 rounded-full border border-ndp-blue/15">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {wizard?.typicalCases && (
              <div>
                <h3 className="font-semibold text-ndp-text text-sm mb-2">Casi tipici che gestisco</h3>
                <p className="text-ndp-muted text-sm leading-relaxed">{wizard.typicalCases}</p>
              </div>
            )}

            {wizard?.goodReference && (
              <div className="bg-ndp-bg rounded-xl p-4 border border-ndp-border">
                <h3 className="font-semibold text-ndp-text text-xs uppercase tracking-wide mb-2">
                  Come presentarmi
                </h3>
                <p className="text-ndp-muted text-sm leading-relaxed italic">&quot;{wizard.goodReference}&quot;</p>
              </div>
            )}

            {/* Contact (demo) */}
            <div className="border-t border-ndp-border pt-5 flex flex-wrap gap-4">
              {professional?.phone && (
                <a href={`tel:${professional.phone}`} className="flex items-center gap-1.5 text-sm text-ndp-blue hover:underline">
                  <Phone size={14} /> {professional.phone}
                </a>
              )}
              {professional?.email && (
                <a href={`mailto:${professional.email}`} className="flex items-center gap-1.5 text-sm text-ndp-blue hover:underline">
                  <Mail size={14} /> {professional.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/professionisti/wizard"
            className="inline-flex items-center gap-2 bg-ndp-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-ndp-blue-dark transition-all text-sm"
          >
            <Edit3 size={15} />
            Modifica profilo
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <AuthGuard requiredRole="member">
      <PreviewContent />
    </AuthGuard>
  );
}
