'use client';

import { Conversation } from '@/lib/db/conversations';
import { getProfessionalById } from '@/lib/utils';
import { getInitials } from '@/lib/auth';
import clsx from 'clsx';

interface Props {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export default function ConversationItem({ conversation, isSelected, onClick }: Props) {
  const pro = getProfessionalById(conversation.professional_id);
  const name = pro?.name ?? 'Professionista';
  const profession = pro?.profession ?? '';
  const initials = getInitials(name);

  const statusColor = {
    active: 'bg-green-400',
    resolved: 'bg-gray-300',
    archived: 'bg-gray-200',
    muted: 'bg-yellow-400',
  }[conversation.status];

  const timeLabel = (() => {
    const d = new Date(conversation.last_message_at);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'ieri';
    if (diffDays < 7) return `${diffDays}g fa`;
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  })();

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all border-b border-ndp-border/50 hover:bg-ndp-bg/60',
        isSelected && 'bg-ndp-blue/5 border-l-2 border-l-ndp-blue'
      )}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ndp-blue to-ndp-blue-mid flex items-center justify-center text-white text-sm font-bold">
          {initials}
        </div>
        <span className={clsx('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white', statusColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={clsx('text-sm font-semibold truncate', isSelected ? 'text-ndp-blue' : 'text-ndp-text')}>
            {name}
          </span>
          <span className="text-[10px] text-ndp-muted shrink-0 ml-2">{timeLabel}</span>
        </div>
        <p className="text-[11px] text-ndp-muted truncate mb-1">{profession}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-ndp-muted truncate flex-1">{conversation.last_message_preview || 'Nessun messaggio'}</p>
          {conversation.unread_count > 0 && (
            <span className="shrink-0 w-5 h-5 bg-ndp-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </span>
          )}
        </div>
        {conversation.subject && (
          <p className="text-[11px] text-ndp-blue/70 truncate mt-0.5 font-medium">{conversation.subject}</p>
        )}
      </div>
    </button>
  );
}
