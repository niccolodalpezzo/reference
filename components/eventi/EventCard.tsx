'use client';

import {
  MapPin, Calendar, Users, Clock,
  Eye, Pencil, Trash2, UserPlus, UserCheck, Lock,
} from 'lucide-react';
import clsx from 'clsx';
import type { EventRow } from '@/lib/db/events';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function statusColor(status: EventRow['status']) {
  if (status === 'attivo') return 'bg-green-400';
  if (status === 'annullato') return 'bg-red-400';
  return 'bg-gray-400';
}

function statusLabel(status: EventRow['status']): string {
  if (status === 'attivo') return 'Attivo';
  if (status === 'annullato') return 'Annullato';
  return 'Passato';
}

export function getEventBadge(
  event: EventRow,
  registrationCount: number,
): { label: string; className: string } | null {
  const today = new Date();
  const eventDate = new Date(event.data_evento + 'T00:00:00');
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const createdDate = new Date(event.created_at);
  const daysSinceCreation = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  if (registrationCount >= 8)
    return { label: 'Più richiesto', className: 'bg-ndp-gold/15 text-ndp-gold-dark border border-ndp-gold/30' };
  if (daysSinceCreation <= 7 && daysUntil >= 0)
    return { label: 'Nuovo', className: 'bg-green-50 text-green-700 border border-green-200' };
  if (daysUntil >= 0 && daysUntil <= 7)
    return { label: 'Questa settimana', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
  if (daysUntil >= 0 && daysUntil <= 30)
    return { label: 'In arrivo', className: 'bg-ndp-blue/8 text-ndp-blue border border-ndp-blue/20' };
  return null;
}

// ─── Type definitions ─────────────────────────────────────────────────────────

interface MemberVariantProps {
  variant: 'member';
  compact?: boolean;
  isGuest?: boolean;
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
} & (MemberVariantProps | ManagerVariantProps);

// ─── Main component ───────────────────────────────────────────────────────────

export default function EventCard(props: EventCardProps) {
  const { event, variant } = props;
  const regCount = props.registrationCount ?? 0;
  const badge = getEventBadge(event, regCount);

  // ── Compact member card (right panel) ──────────────────────────────────────
  if (variant === 'member') {
    const mp = props as MemberVariantProps;

    return (
      <div
        className={clsx(
          'bg-white rounded-2xl border transition-all duration-200 overflow-hidden',
          mp.isHighlighted
            ? 'border-ndp-blue ring-2 ring-ndp-blue/20 shadow-md'
            : 'border-ndp-border hover:border-ndp-blue/30 hover:shadow-md',
          mp.onClick && 'cursor-pointer',
        )}
        onClick={mp.onClick}
      >
        {/* Accent top bar */}
        <div
          className={clsx(
            'h-1',
            event.status === 'attivo'
              ? 'bg-gradient-to-r from-ndp-blue to-ndp-blue-mid'
              : event.status === 'annullato'
              ? 'bg-red-400'
              : 'bg-gray-300',
          )}
        />

        <div className={clsx('px-4', mp.compact ? 'py-3' : 'py-4')}>
          {/* Title row + badges */}
          <div className="flex items-start gap-2 mb-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', statusColor(event.status))} />
                <span className="text-[10px] font-medium text-ndp-muted">{statusLabel(event.status)}</span>
                {badge && (
                  <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', badge.className)}>
                    {badge.label}
                  </span>
                )}
              </div>
              <h3 className={clsx(
                'font-semibold text-ndp-text leading-tight',
                mp.compact ? 'text-sm' : 'text-sm',
              )}>
                {event.titolo}
              </h3>
            </div>
          </div>

          {/* Metadata */}
          <div className={clsx('flex flex-wrap gap-x-4 gap-y-1 mb-3', mp.compact ? 'text-[11px]' : 'text-xs')}>
            <span className="flex items-center gap-1 text-ndp-muted">
              <MapPin size={10} className="text-ndp-blue shrink-0" />
              {event.citta}{event.regione ? `, ${event.regione}` : ''}
            </span>
            <span className="flex items-center gap-1 text-ndp-muted">
              <Calendar size={10} className="text-ndp-blue shrink-0" />
              {mp.compact ? formatDateShort(event.data_evento) : formatDate(event.data_evento)}
            </span>
            <span className="flex items-center gap-1 text-ndp-muted">
              <Clock size={10} className="text-ndp-blue shrink-0" />
              {formatTime(event.orario_evento)}
            </span>
            <span className="flex items-center gap-1 text-ndp-muted">
              <Users size={10} className="text-ndp-blue shrink-0" />
              {regCount} iscritti
            </span>
          </div>

          {/* CTA */}
          <div onClick={(e) => e.stopPropagation()}>
            {mp.isGuest ? (
              <a
                href="/login"
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-ndp-blue bg-ndp-blue/6 border border-ndp-blue/20 py-2 rounded-xl hover:bg-ndp-blue/12 transition-colors"
              >
                <Lock size={11} /> Accedi per iscriverti
              </a>
            ) : event.status !== 'attivo' ? (
              <span className="w-full flex items-center justify-center gap-1.5 text-xs text-ndp-muted bg-ndp-bg border border-ndp-border py-2 rounded-xl">
                {event.status === 'annullato' ? 'Evento annullato' : 'Evento concluso'}
              </span>
            ) : mp.isRegistered ? (
              <div className="space-y-1">
                <div className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-green-500 text-white py-2 rounded-xl">
                  <UserCheck size={12} /> Già iscritto
                </div>
                <button
                  onClick={() => mp.onUnregister?.()}
                  className="w-full text-[11px] text-ndp-muted hover:text-red-500 transition-colors text-center"
                >
                  Annulla iscrizione
                </button>
              </div>
            ) : (
              <button
                onClick={() => mp.onRegister?.()}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-ndp-blue text-white py-2 rounded-xl hover:bg-ndp-blue-dark transition-colors"
              >
                <UserPlus size={12} /> Iscriviti
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Manager card ────────────────────────────────────────────────────────────
  const mp = props as ManagerVariantProps;

  return (
    <div className="bg-white rounded-2xl border border-ndp-border overflow-hidden shadow-sm">
      <div className="h-1 bg-gradient-to-r from-ndp-blue to-ndp-blue-mid" />
      <div className="px-4 py-4">
        <div className="flex items-start gap-2 mb-2.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', statusColor(event.status))} />
              <span className="text-[10px] font-medium text-ndp-muted">{statusLabel(event.status)}</span>
            </div>
            <h3 className="text-sm font-semibold text-ndp-text leading-tight">{event.titolo}</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3">
          <span className="flex items-center gap-1 text-ndp-muted">
            <MapPin size={10} className="text-ndp-blue shrink-0" />
            {event.citta}
          </span>
          <span className="flex items-center gap-1 text-ndp-muted">
            <Calendar size={10} className="text-ndp-blue shrink-0" />
            {formatDate(event.data_evento)}
          </span>
          <span className="flex items-center gap-1 text-ndp-muted">
            <Clock size={10} className="text-ndp-blue shrink-0" />
            {formatTime(event.orario_evento)}
          </span>
          <span className="flex items-center gap-1 text-ndp-muted">
            <Users size={10} className="text-ndp-blue shrink-0" />
            {mp.registrationCount ?? 0} iscritti
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={mp.onViewRegistrations}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-ndp-bg border border-ndp-border text-ndp-text py-2 rounded-xl hover:border-ndp-blue/30 transition-colors"
          >
            <Eye size={12} /> Iscritti
          </button>
          <button
            onClick={mp.onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-ndp-bg border border-ndp-border text-ndp-text py-2 rounded-xl hover:border-ndp-blue/30 transition-colors"
          >
            <Pencil size={12} /> Modifica
          </button>
          <button
            onClick={mp.onDelete}
            className="flex items-center justify-center gap-1.5 text-[11px] font-medium bg-red-50 border border-red-200 text-red-600 py-2 px-3 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
