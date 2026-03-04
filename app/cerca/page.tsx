'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import { Sparkles } from 'lucide-react';

function CercaContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || undefined;

  return (
    <div className="h-[calc(100vh-64px)] bg-white">
      <ChatInterface initialQuery={initialQuery} />
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
