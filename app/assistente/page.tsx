'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import ChatSidebar from '@/components/ChatSidebar';
import ProfessionalDrawer from '@/components/ProfessionalDrawer';
import { Professional } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import {
  getActiveChatId,
  setActiveChatId,
  migrateLegacyChat,
} from '@/lib/chatStorage';
import { Sparkles, Loader2, PanelRightOpen, PanelRightClose, LogIn } from 'lucide-react';
import Link from 'next/link';

function AssistenteContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || undefined;
  const { user } = useAuth();
  const isGuest = user === null;

  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);

  useEffect(() => {
    migrateLegacyChat();
    const saved = getActiveChatId();
    if (saved) setCurrentChatId(saved);
  }, []);

  const handleOpenProfessional = useCallback((pro: Professional) => {
    if (!isGuest) setSelectedPro(pro);
  }, [isGuest]);

  const handleLoadChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setActiveChatId(chatId);
  }, []);

  const handleNewChat = useCallback(() => {
    setCurrentChatId(null);
    setActiveChatId(null);
  }, []);

  const handleChatUpdated = useCallback((chatId: string) => {
    if (chatId) {
      setCurrentChatId(chatId);
      setActiveChatId(chatId);
    }
    setSidebarKey((k) => k + 1);
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {selectedPro && !isGuest && (
        <ProfessionalDrawer
          professional={selectedPro}
          onClose={() => setSelectedPro(null)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Trust / status banner */}
        <div className={`px-5 py-2.5 flex items-center justify-between shrink-0 ${isGuest ? 'bg-ndp-blue/90' : 'bg-ndp-blue/95'}`}>
          {isGuest ? (
            <p className="text-[11px] text-white/80 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-300 rounded-full" />
              Anteprima gratuita — registrati per sbloccare tutte le funzioni premium
            </p>
          ) : (
            <p className="text-[11px] text-white/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Professionisti verificati nella rete BNI — ogni risposta è basata su profili reali
            </p>
          )}
          <div className="flex items-center gap-2">
            {isGuest && (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-white/15 border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/25 transition-colors"
              >
                <LogIn size={11} />Accedi
              </Link>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors md:flex hidden"
              title={sidebarOpen ? 'Chiudi sidebar' : 'Apri sidebar'}
            >
              {sidebarOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
            </button>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            key={currentChatId ?? '__new__'}
            chatId={currentChatId}
            initialQuery={initialQuery}
            onOpenProfessional={handleOpenProfessional}
            onChatUpdated={handleChatUpdated}
          />
        </div>
      </div>

      {/* Sidebar — desktop only */}
      {sidebarOpen && (
        <div className="hidden md:flex w-80 shrink-0">
          <ChatSidebar
            key={sidebarKey}
            currentChatId={currentChatId}
            onLoadChat={handleLoadChat}
            onNewChat={handleNewChat}
            onOpenProfessional={isGuest ? () => {} : handleOpenProfessional}
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
            <div className="w-14 h-14 bg-ndp-blue rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_8px_32px_rgba(34,0,204,0.25)]">
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
