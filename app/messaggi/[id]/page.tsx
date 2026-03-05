'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Conversation } from '@/lib/types';
import { getConversations, getConversationById } from '@/lib/storage/conversations';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import ConversationList from '@/components/messaggi/ConversationList';
import MessageThread from '@/components/messaggi/MessageThread';
import EmptyConversation from '@/components/messaggi/EmptyConversation';

export default function ConversationPage() {
  return (
    <AuthGuard requiredRole="member">
      <ConversationContent />
    </AuthGuard>
  );
}

function ConversationContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const convId = params?.id as string;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    const convs = getConversations(user.id);
    setConversations(convs);
    if (convId) {
      const conv = getConversationById(convId);
      setSelected(conv);
    }
  }, [user, convId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Left panel: conversation list (hidden on mobile) */}
      <div className="hidden md:flex w-80 shrink-0 h-full flex-col">
        <ConversationList
          conversations={conversations}
          selectedId={convId}
          onSelect={(id) => router.push(`/messaggi/${id}`)}
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile back button */}
        <div className="md:hidden px-4 py-3 border-b border-ndp-border flex items-center gap-2">
          <button onClick={() => router.push('/messaggi')} className="flex items-center gap-1.5 text-ndp-blue text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Messaggi
          </button>
        </div>

        {selected ? (
          <MessageThread
            conversation={selected}
            onUpdate={load}
          />
        ) : (
          <EmptyConversation />
        )}
      </div>
    </div>
  );
}
