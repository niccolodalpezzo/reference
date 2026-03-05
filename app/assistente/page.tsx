'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import ChatSidebar from '@/components/ChatSidebar';
import ProfessionalDrawer from '@/components/ProfessionalDrawer';
import { Professional } from '@/lib/types';
import { Sparkles, Loader2, PanelRightOpen, PanelRightClose } from 'lucide-react';

function AssistenteContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || undefined;
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleOpenProfessional = useCallback((pro: Professional) => {
    setSelectedPro(pro);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Professional drawer */}
      {selectedPro && (
        <ProfessionalDrawer
          professional={selectedPro}
          onClose={() => setSelectedPro(null)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Trust banner */}
        <div className="bg-ndp-blue/95 px-5 py-2 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-white/70 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Professionisti verificati nella rete BNI — ogni risposta è basata su profili reali
          </p>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors md:flex hidden"
            title={sidebarOpen ? 'Chiudi sidebar' : 'Apri sidebar'}
          >
            {sidebarOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          </button>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            initialQuery={initialQuery}
            onOpenProfessional={handleOpenProfessional}
          />
        </div>
      </div>

      {/* Sidebar — desktop only */}
      {sidebarOpen && (
        <div className="hidden md:flex w-80 shrink-0">
          <ChatSidebar
            onOpenProfessional={handleOpenProfessional}
            onNewChat={() => {
              // Could clear current chat
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function AssistentePage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-white">
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
