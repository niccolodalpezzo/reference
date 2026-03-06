'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Conversation } from '@/lib/types';
import { getConversations } from '@/lib/storage/conversations';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import ConversationList from '@/components/messaggi/ConversationList';
import EmptyConversation from '@/components/messaggi/EmptyConversation';

export default function MessaggiPage() {
  return (
    <AuthGuard requiredRole="member">
      <MessaggiContent />
    </AuthGuard>
  );
}

function MessaggiContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const load = useCallback(() => {
    if (user) setConversations(getConversations(user.id));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      {/* Left: conversation list (full width on mobile, 320px on desktop) */}
      <div className="w-full md:w-80 shrink-0 h-full">
        <ConversationList
          conversations={conversations}
          selectedId={null}
          onSelect={(id) => router.push(`/messaggi/${id}`)}
        />
      </div>

      {/* Right: empty state on desktop */}
      <div className="hidden md:flex flex-1 h-full">
        <EmptyConversation />
      </div>
    </div>
  );
}
