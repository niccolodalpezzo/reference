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
  clearGuestStorage,
} from '@/lib/chatStorage';
import { Sparkles, Loader2 } from 'lucide-react';

function AssistenteContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || undefined;
  const { user, isLoading: authLoading } = useAuth();
  const isGuest = user === null;

  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarKey, setSidebarKey] = useState(0);
  // hasStarted: false = State 1 (hero), true = State 2 (workspace + sidebar)
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (isGuest) {
      clearGuestStorage();
      setCurrentChatId(null);
      setHasStarted(false);
    } else {
      migrateLegacyChat();
      const saved = getActiveChatId();
      if (saved) {
        setCurrentChatId(saved);
        setHasStarted(true); // existing chat → go directly to workspace
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isGuest]);

  // If there's an initialQuery, go straight to workspace state
  useEffect(() => {
    if (initialQuery) setHasStarted(true);
  }, [initialQuery]);

  const handleOpenProfessional = useCallback((pro: Professional) => {
    if (!isGuest) setSelectedPro(pro);
  }, [isGuest]);

  const handleLoadChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setActiveChatId(chatId);
    setHasStarted(true);
  }, []);

  const handleNewChat = useCallback(() => {
    setCurrentChatId(null);
    setActiveChatId(null);
    setHasStarted(false);
  }, []);

  const handleChatUpdated = useCallback((chatId: string) => {
    if (chatId) {
      setCurrentChatId(chatId);
      setActiveChatId(chatId);
    }
    setSidebarKey((k) => k + 1);
  }, []);

  const handleFirstMessage = useCallback(() => {
    setHasStarted(true);
  }, []);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-ndp-bg">
      {selectedPro && !isGuest && (
        <ProfessionalDrawer
          professional={selectedPro}
          onClose={() => setSelectedPro(null)}
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <ChatInterface
          key={currentChatId ?? '__new__'}
          chatId={currentChatId}
          initialQuery={initialQuery}
          onOpenProfessional={handleOpenProfessional}
          onChatUpdated={handleChatUpdated}
          onFirstMessage={handleFirstMessage}
        />
      </div>

      {/* Sidebar — appears in State 2 only, desktop only */}
      {hasStarted && (
        <div className="hidden md:flex w-96 shrink-0 animate-slide-in">
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
        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-ndp-bg">
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
