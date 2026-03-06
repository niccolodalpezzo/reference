'use client';

import { Message } from '@/lib/db/messages';
import { Check, CheckCheck, Paperclip } from 'lucide-react';
import clsx from 'clsx';
import ReferenceCard from './ReferenceCard';

interface Props {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export default function MessageBubble({ message, isOwn, showAvatar = true }: Props) {
  const time = new Date(message.sent_at).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs text-ndp-muted bg-ndp-bg px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.type === 'reference_card' && message.reference_id) {
    return (
      <div className={clsx('flex mb-4', isOwn ? 'justify-end' : 'justify-start')}>
        <div className={clsx('max-w-sm', isOwn ? 'items-end' : 'items-start')}>
          <p className="text-xs text-ndp-muted mb-1.5 px-1">
            {isOwn ? 'Hai inviato una referenza' : 'Ha inviato una referenza'}
          </p>
          <ReferenceCard referenceId={message.reference_id} />
        </div>
      </div>
    );
  }

  if (message.type === 'attachment') {
    return (
      <div className={clsx('flex mb-3 gap-2', isOwn ? 'justify-end flex-row-reverse' : 'justify-start')}>
        {!isOwn && showAvatar && (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-auto">
            {message.sender_name.charAt(0)}
          </div>
        )}
        <div className="max-w-xs">
          {message.content && (
            <p className={clsx('text-sm mb-1.5 px-3 py-2 rounded-2xl', isOwn ? 'bg-ndp-blue text-white rounded-tr-sm' : 'bg-ndp-bg text-ndp-text rounded-tl-sm')}>
              {message.content}
            </p>
          )}
          <div className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-2xl border', isOwn ? 'bg-ndp-blue/10 border-ndp-blue/20' : 'bg-white border-ndp-border')}>
            <div className="w-8 h-8 bg-ndp-blue/10 rounded-lg flex items-center justify-center shrink-0">
              <Paperclip className="w-4 h-4 text-ndp-blue" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ndp-text truncate">{message.attachment_name}</p>
              <p className="text-[10px] text-ndp-muted">{message.attachment_size} · Demo allegato</p>
            </div>
          </div>
          <div className={clsx('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
            <span className="text-[10px] text-ndp-muted">{time}</span>
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex mb-3 gap-2', isOwn ? 'justify-end flex-row-reverse' : 'justify-start')}>
      {!isOwn && showAvatar && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ndp-blue-mid to-ndp-blue flex items-center justify-center text-white text-xs font-bold shrink-0 mt-auto">
          {message.sender_name.charAt(0)}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-7 shrink-0" />}

      <div className="max-w-sm lg:max-w-md xl:max-w-lg">
        <div
          className={clsx(
            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn ? 'bg-ndp-blue text-white rounded-tr-sm' : 'bg-ndp-bg text-ndp-text rounded-tl-sm'
          )}
        >
          {message.content}
        </div>
        <div className={clsx('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] text-ndp-muted">{time}</span>
          {isOwn && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'read') return <CheckCheck className="w-3 h-3 text-ndp-gold" />;
  if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-ndp-muted" />;
  return <Check className="w-3 h-3 text-ndp-muted" />;
}
