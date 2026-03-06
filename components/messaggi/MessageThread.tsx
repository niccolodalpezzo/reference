'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Award, Phone, ExternalLink } from 'lucide-react';
import { getMessages, addMessage, markConversationRead, Message } from '@/lib/db/messages';
import { Conversation } from '@/lib/db/conversations';
import { getProfessionalById } from '@/lib/utils';
import { getInitials } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';
import { appendLog } from '@/lib/db/logs';
import { createClient } from '@/lib/supabase/client';
import MessageBubble from './MessageBubble';
import DaiReferenceModal from './DaiReferenceModal';
import ConversationActions from './ConversationActions';
import Link from 'next/link';
import clsx from 'clsx';

interface Props {
  conversation: Conversation;
  onUpdate: () => void;
}

function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  let label = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  if (diffDays === 0) label = 'Oggi';
  if (diffDays === 1) label = 'Ieri';
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-ndp-border" />
      <span className="text-[11px] text-ndp-muted font-medium px-2">{label}</span>
      <div className="flex-1 h-px bg-ndp-border" />
    </div>
  );
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function MessageThread({ conversation, onUpdate }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pro = getProfessionalById(conversation.professional_id);

  const loadMessages = useCallback(async () => {
    const msgs = await getMessages(conversation.id);
    setMessages(msgs);
    await markConversationRead(conversation.id);
    onUpdate();
  }, [conversation.id, onUpdate]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`,
      }, (payload) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find((m) => m.id === (payload.new as Message).id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !user) return;
    setIsSending(true);

    const isFirstReply = messages.filter((m) => m.sender_id === user.id).length === 0;
    await addMessage({
      conversation_id: conversation.id,
      sender_id: user.id,
      sender_name: user.name,
      content: input.trim(),
      type: 'text',
    });

    if (isFirstReply) {
      await appendLog({
        user_id: user.id,
        user_display_name: user.name,
        type: 'first_response',
        description: `Prima risposta nella conversazione con ${pro?.name ?? 'professionista'}`,
        metadata: { conversationId: conversation.id },
      });
    }

    setInput('');
    setIsSending(false);
    loadMessages();
  }

  async function handleAttachmentClick() {
    if (!user) return;
    await addMessage({
      conversation_id: conversation.id,
      sender_id: user.id,
      sender_name: user.name,
      content: '',
      type: 'attachment',
      attachment_name: 'documento_allegato.pdf',
      attachment_size: '1.4 MB',
    });
    await appendLog({
      user_id: user.id,
      user_display_name: user.name,
      type: 'attachment_sent',
      description: 'Allegato inviato nella conversazione',
      metadata: { conversationId: conversation.id },
    });
    loadMessages();
  }

  const statusBadge = {
    active: { label: 'Attiva', color: 'bg-green-100 text-green-700' },
    resolved: { label: 'Risolta', color: 'bg-gray-100 text-gray-600' },
    archived: { label: 'Archiviata', color: 'bg-gray-100 text-gray-500' },
    muted: { label: 'Silenziata', color: 'bg-yellow-100 text-yellow-700' },
  }[conversation.status];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-ndp-border flex items-center gap-3 bg-white">
        {pro ? (
          <>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ndp-blue to-ndp-blue-mid flex items-center justify-center text-white font-bold text-sm shrink-0">
              {getInitials(pro.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-ndp-text text-sm truncate">{pro.name}</h3>
                <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', statusBadge.color)}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-ndp-muted truncate">{pro.profession} · {pro.city}</p>
            </div>
            <div className="flex items-center gap-1">
              {pro.phone && (
                <a href={`tel:${pro.phone}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ndp-bg text-ndp-muted transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
              <Link href={`/professionisti/profilo/${pro.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ndp-bg text-ndp-muted transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <ConversationActions conversation={conversation} onUpdate={onUpdate} />
            </div>
          </>
        ) : (
          <div className="flex-1">
            <p className="font-semibold text-ndp-text text-sm">Conversazione</p>
          </div>
        )}
      </div>

      {/* Subject banner */}
      {conversation.subject && (
        <div className="px-5 py-2 bg-ndp-bg/50 border-b border-ndp-border">
          <p className="text-xs text-ndp-muted">
            <span className="font-semibold text-ndp-text">Oggetto:</span> {conversation.subject}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 bg-ndp-bg rounded-full flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-ndp-muted" />
            </div>
            <p className="text-sm text-ndp-muted">Nessun messaggio ancora</p>
            <p className="text-xs text-ndp-muted/60 mt-1">Inizia la conversazione qui sotto</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender_id === user?.id;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDate = !prevMsg || !sameDay(prevMsg.sent_at, msg.sent_at);
            const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
            return (
              <div key={msg.id}>
                {showDate && <DateSeparator date={msg.sent_at} />}
                <MessageBubble message={msg} isOwn={isOwn} showAvatar={showAvatar} />
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reference button */}
      {user?.role === 'member' && conversation.initiator_id === user.id && (
        <div className="px-5 pb-2">
          <button
            onClick={() => setShowReferenceModal(true)}
            className="w-full py-2.5 bg-gradient-to-r from-ndp-gold to-ndp-gold-dark text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <Award className="w-4 h-4" />
            Dai Reference
          </button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-ndp-border">
        <div className="flex items-end gap-2 bg-ndp-bg rounded-2xl px-3 py-2 border border-ndp-border focus-within:border-ndp-blue transition-colors">
          <button
            onClick={handleAttachmentClick}
            className="p-1.5 rounded-lg hover:bg-white text-ndp-muted transition-colors shrink-0"
            title="Allega file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Scrivi un messaggio..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-ndp-text placeholder-ndp-muted resize-none focus:outline-none py-1 max-h-24"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="p-1.5 rounded-lg bg-ndp-blue text-white hover:bg-ndp-blue-dark transition-colors shrink-0 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-ndp-muted mt-1 text-center">Invio con Enter · Shift+Enter per nuova riga</p>
      </div>

      {showReferenceModal && (
        <DaiReferenceModal
          conversationId={conversation.id}
          professionalId={conversation.professional_id}
          onClose={() => setShowReferenceModal(false)}
          onCreated={() => {
            setShowReferenceModal(false);
            loadMessages();
          }}
        />
      )}
    </div>
  );
}
