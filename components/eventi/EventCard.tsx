'use client';

import { MapPin, Calendar, Users, Clock, Eye, Pencil, Trash2, UserPlus, UserCheck } from 'lucide-react';
import clsx from 'clsx';
import type { EventRow } from '@/lib/db/events';

function statusGradient(status: EventRow['status']): string {
  if (status === 'attivo') return 'from-ndp-blue to-blue-700';
  if (status === 'annullato') return 'from-red-500 to-red-600';
  return 'from-gray-400 to-gray-500';
}

function statusLabel(status: EventRow['status']): string {
  if (status === 'attivo') return 'Attivo';
  if (status === 'annullato') return 'Annullato';
  return 'Passato';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

interface MemberVariantProps {
  variant: 'member';
  isRegistered?: boolean;
  onRegister?: () => void;
  onUnregister?: () => void;
  registrationCount?: number;
  isHighlighted?: boolean;
  onClick?: () => void;
}

interface ManagerVariantProps {
  variant: 'manager';
  registrationCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewRegistrations?: () => void;
}

type EventCardProps = {
  event: EventRow;
  isGuest?: boolean;
} & (MemberVariantProps | ManagerVariantProps);

export default function EventCard(props: EventCardProps) {
  const { event, variant } = props;
  const gradient = statusGradient(event.status);

  return (
    <div
      className={clsx(
        'rounded-2xl border overflow-hidden shadow-sm transition-all',
        variant === 'member' && (props as MemberVariantProps).isHighlighted
          ? 'border-ndp-gold ring-2 ring-ndp-gold/40 shadow-md'
          : 'border-ndp-border',
        variant === 'member' && (props as MemberVariantProps).onClick && 'cursor-pointer hover:shadow-md'
      )}
      onClick={variant === 'member' ? (props as MemberVariantProps).onClick : undefined}
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
        <span className="text-white font-semibold text-sm truncate pr-2">{event.titolo}</span>
        <span className="shrink-0 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
          {statusLabel(event.status)}
        </span>
      </div>

      {/* Body */}
      <div className="bg-white px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-ndp-muted">
          <MapPin size={11} className="text-ndp-blue shrink-0" />
          <span>{event.citta}{event.regione ? `, ${event.regione}` : ''}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-ndp-muted">
            <Calendar size={11} className="text-ndp-blue shrink-0" />
            <span>{formatDate(event.data_evento)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-ndp-muted">
            <Clock size={11} className="text-ndp-blue shrink-0" />
            <span>{formatTime(event.orario_evento)}</span>
          </div>
        </div>
        {event.indirizzo && (
          <div className="text-xs text-ndp-muted truncate">{event.indirizzo}</div>
        )}

        {/* Registration count */}
        <div className="flex items-center gap-1.5 text-xs text-ndp-muted">
          <Users size={11} className="text-ndp-blue shrink-0" />
          <span>{(props.registrationCount ?? 0)} iscritti</span>
        </div>

        {/* Member variant CTA */}
        {variant === 'member' && (
          <div className="pt-1">
            {(props as MemberVariantProps & { isGuest?: boolean }).isGuest ? (
              <span className="w-full flex items-center justify-center gap-1.5 text-xs text-ndp-muted bg-ndp-bg border border-ndp-border py-2 rounded-xl">
                Accedi per iscriverti
              </span>
            ) : event.status !== 'attivo' ? (
              <span className="w-full flex items-center justify-center gap-1.5 text-xs text-ndp-muted bg-ndp-bg border border-ndp-border py-2 rounded-xl">
                {event.status === 'annullato' ? 'Evento annullato' : 'Evento concluso'}
              </span>
            ) : (props as MemberVariantProps).isRegistered ? (
              <div className="space-y-1.5">
                <div className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-green-500 text-white py-2 rounded-xl">
                  <UserCheck size={13} /> Già iscritto
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); (props as MemberVariantProps).onUnregister?.(); }}
                  className="w-full text-xs text-ndp-muted hover:text-red-500 transition-colors text-center"
                >
                  Annulla iscrizione
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); (props as MemberVariantProps).onRegister?.(); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-ndp-blue text-white py-2 rounded-xl hover:bg-ndp-blue-dark transition-colors"
              >
                <UserPlus size={13} /> Iscriviti
              </button>
            )}
          </div>
        )}

        {/* Manager variant actions */}
        {variant === 'manager' && (
          <div className="pt-1 flex gap-2">
            <button
              onClick={(props as ManagerVariantProps).onViewRegistrations}
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-ndp-bg border border-ndp-border text-ndp-text py-2 rounded-xl hover:border-ndp-blue/30 transition-colors"
            >
              <Eye size={12} /> Iscritti
            </button>
            <button
              onClick={(props as ManagerVariantProps).onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-ndp-bg border border-ndp-border text-ndp-text py-2 rounded-xl hover:border-ndp-blue/30 transition-colors"
            >
              <Pencil size={12} /> Modifica
            </button>
            <button
              onClick={(props as ManagerVariantProps).onDelete}
              className="flex items-center justify-center gap-1.5 text-[11px] font-medium bg-red-50 border border-red-200 text-red-600 py-2 px-3 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
