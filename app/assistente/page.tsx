'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import TopProfessionisti from '@/components/TopProfessionisti';
import { ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

function AssistenteContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || undefined;

  return (
    <>
      {/* Trust layer + chat */}
      <div className="bg-ndp-blue py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <ShieldCheck size={12} />
            Professionisti verificati nella rete BNI — ogni risposta è basata su profili reali
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
            Assistente AI
          </h1>
          <p className="text-white/60 text-sm">
            Descrivi la tua esigenza in italiano naturale. Nessun filtro, solo il professionista giusto.
          </p>
        </div>
      </div>

      <div className="bg-white min-h-[500px]" style={{ height: 'calc(100vh - 400px)', minHeight: 480 }}>
        <ChatInterface initialQuery={initialQuery} />
      </div>

      {/* Top professionisti del mese */}
      <TopProfessionisti
        title="Top Professionisti del Mese"
        subtitle="I migliori della rete NDP in questo momento — pronti a ricevere la tua richiesta."
      />
    </>
  );
}

export default function AssistentePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
          <div className="text-center">
            <div className="w-14 h-14 bg-ndp-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={22} className="text-white animate-pulse" />
            </div>
            <Loader2 size={20} className="text-ndp-muted animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <AssistenteContent />
    </Suspense>
  );
}
