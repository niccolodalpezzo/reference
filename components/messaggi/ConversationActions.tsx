'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Archive, VolumeX, CheckCircle2 } from 'lucide-react';
import { updateConversation, Conversation } from '@/lib/db/conversations';
import { appendLog } from '@/lib/db/logs';
import { useAuth } from '@/context/AuthContext';

interface Props {
  conversation: Conversation;
  onUpdate: () => void;
}

export default function ConversationActions({ conversation, onUpdate }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  async function handleAction(action: string) {
    if (action === 'archive') {
      await updateConversation(conversation.id, { status: 'archived' });
    } else if (action === 'mute') {
      await updateConversation(conversation.id, { status: 'muted' });
    } else if (action === 'resolve') {
      await updateConversation(conversation.id, { status: 'resolved' });
      if (user) {
        await appendLog({
          user_id: user.id,
          user_display_name: user.name,
          type: 'conversation_resolved',
          description: 'Conversazione risolta',
          metadata: { conversationId: conversation.id },
        });
      }
    }
    setOpen(false);
    onUpdate();
  }

  const actions = [
    { key: 'resolve', label: 'Segna come risolta', icon: CheckCircle2, className: 'text-green-700 hover:bg-green-50' },
    { key: 'mute', label: 'Silenzia notifiche', icon: VolumeX, className: 'text-ndp-muted hover:bg-ndp-bg' },
    { key: 'archive', label: 'Archivia conversazione', icon: Archive, className: 'text-ndp-muted hover:bg-ndp-bg' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ndp-bg text-ndp-muted transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-52 bg-white border border-ndp-border rounded-xl shadow-xl py-1.5 z-20 animate-fade-in">
          {actions.map(({ key, label, icon: Icon, className }) => (
            <button
              key={key}
              onClick={() => handleAction(key)}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-medium transition-colors ${className}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
