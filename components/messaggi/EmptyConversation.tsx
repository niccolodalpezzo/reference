'use client';

import { MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-ndp-bg/30 text-center px-8">
      <div className="w-20 h-20 bg-white rounded-3xl shadow-md flex items-center justify-center mb-5 border border-ndp-border">
        <MessageSquare className="w-9 h-9 text-ndp-blue/40" />
      </div>
      <h3 className="text-lg font-bold text-ndp-text mb-2">Seleziona una conversazione</h3>
      <p className="text-sm text-ndp-muted max-w-xs leading-relaxed mb-6">
        Scegli una chat dalla lista a sinistra, oppure inizia una nuova conversazione trovando un professionista.
      </p>
      <Link
        href="/assistente"
        className="flex items-center gap-2 bg-ndp-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-ndp-blue-dark transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Trova un professionista
      </Link>
    </div>
  );
}
