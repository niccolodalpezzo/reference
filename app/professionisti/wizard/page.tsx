'use client';

import AuthGuard from '@/components/AuthGuard';
import ProfileWizard from '@/components/ProfileWizard';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { WizardProfile } from '@/lib/types';
import { useState } from 'react';

function WizardContent() {
  const [saved, setSaved] = useState(false);

  const handleSave = (_profile: WizardProfile) => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Header */}
      <div className="bg-ndp-blue py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/professionisti/dashboard"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
                Il tuo profilo AI
              </h1>
              <p className="text-white/60 text-sm">
                Più completo e preciso il profilo, più referral qualificati ricevi dall&apos;Assistente AI.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full shrink-0">
              <Sparkles size={12} />
              AI Copilot attivo
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div className="bg-green-500 text-white text-center text-sm font-medium py-2.5 px-4">
          Profilo salvato con successo!
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <ProfileWizard onSave={handleSave} />
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <AuthGuard requiredRole="member">
      <WizardContent />
    </AuthGuard>
  );
}
