'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import ProfessionalCard from '@/components/ProfessionalCard';
import { getProfessionalsByIds } from '@/lib/utils';
import { Professional } from '@/lib/types';
import { Sparkles, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CercaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || undefined;
  const [matchedProfessionals, setMatchedProfessionals] = useState<Professional[]>([]);

  const handleMatchedIds = (ids: string[]) => {
    const found = getProfessionalsByIds(ids);
    setMatchedProfessionals(found);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-ndp-bg">
      {/* Left: Chat panel */}
      <div className="flex-1 flex flex-col border-r border-gray-200 bg-white min-w-0">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0">
          <div className="w-8 h-8 bg-ndp-navy rounded-lg flex items-center justify-center">
            <Sparkles size={15} className="text-ndp-gold" />
          </div>
          <div>
            <h1 className="font-semibold text-ndp-navy text-sm">NDP AI Search</h1>
            <p className="text-xs text-gray-400">Intelligenza artificiale per il networking</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface initialQuery={initialQuery} onMatchedIds={handleMatchedIds} />
        </div>
      </div>

      {/* Right: Professionals panel */}
      <div className="w-96 shrink-0 flex flex-col bg-ndp-bg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-ndp-navy" />
              <span className="font-semibold text-ndp-navy text-sm">
                Professionisti trovati
              </span>
            </div>
            {matchedProfessionals.length > 0 && (
              <span className="bg-ndp-gold text-ndp-navy text-xs font-bold px-2 py-0.5 rounded-full">
                {matchedProfessionals.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {matchedProfessionals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <Users size={22} className="text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-2">
                Nessun professionista selezionato
              </p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Scrivi la tua esigenza nella chat e l&apos;AI troverà i professionisti più adatti.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 px-1">
                I professionisti più adatti alla tua richiesta:
              </p>
              {matchedProfessionals.map((p, i) => (
                <ProfessionalCard
                  key={p.id}
                  professional={p}
                  compact
                  highlighted={i === 0}
                />
              ))}
              <div className="pt-2">
                <Link
                  href="/professionisti"
                  className="flex items-center justify-center gap-2 text-xs text-ndp-navy hover:text-ndp-navy-dark font-medium py-3 px-4 bg-white rounded-xl border border-gray-100 hover:border-ndp-navy/20 transition-all"
                >
                  Vedi tutti i professionisti
                  <ArrowRight size={12} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CercaPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-ndp-navy rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles size={20} className="text-ndp-gold animate-pulse" />
          </div>
          <p className="text-gray-500 text-sm">Caricamento ricerca AI...</p>
        </div>
      </div>
    }>
      <CercaContent />
    </Suspense>
  );
}
