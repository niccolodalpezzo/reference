'use client';

import { getReferenceById } from '@/lib/storage/references';
import { Reference, ReferenceStatus } from '@/lib/types';
import { Award, AlertCircle, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  referenceId: string;
  reference?: Reference;
}

const urgencyColors = {
  bassa: 'text-green-600 bg-green-50',
  media: 'text-yellow-700 bg-yellow-50',
  alta: 'text-red-600 bg-red-50',
};

const contactTypeLabels = {
  lead: 'Lead',
  referenza: 'Referenza',
  opportunità: 'Opportunità',
};

const statusConfig: Record<ReferenceStatus, { label: string; icon: React.ElementType; color: string }> = {
  inviata: { label: 'Inviata', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  in_verifica: { label: 'In verifica', icon: AlertCircle, color: 'text-yellow-700 bg-yellow-50' },
  approvata: { label: 'Approvata', icon: CheckCircle2, color: 'text-green-700 bg-green-50' },
  rifiutata: { label: 'Rifiutata', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export default function ReferenceCard({ referenceId, reference: propRef }: Props) {
  const ref = propRef ?? getReferenceById(referenceId);
  if (!ref) return null;

  const status = statusConfig[ref.status];
  const StatusIcon = status.icon;
  const isApproved = ref.status === 'approvata';

  return (
    <div className={clsx(
      'rounded-2xl border-2 p-4 transition-all',
      isApproved ? 'border-ndp-gold bg-gradient-to-br from-ndp-gold-light/30 to-white' : 'border-ndp-border bg-white'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', isApproved ? 'bg-ndp-gold/20' : 'bg-ndp-blue/10')}>
            <Award className={clsx('w-4 h-4', isApproved ? 'text-ndp-gold-dark' : 'text-ndp-blue')} />
          </div>
          <div>
            <p className="text-xs font-bold text-ndp-text">Referenza NDP</p>
            <p className="text-[10px] text-ndp-muted">{contactTypeLabels[ref.contactType]}</p>
          </div>
        </div>
        <span className={clsx('flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full', status.color)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 mb-3">
        <p className="text-sm font-semibold text-ndp-text">{ref.contactName}</p>
        <p className="text-xs text-ndp-muted">{ref.contactInfo}</p>
        {ref.notes && (
          <p className="text-xs text-ndp-text/70 leading-relaxed bg-ndp-bg rounded-lg px-2.5 py-2">
            "{ref.notes}"
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', urgencyColors[ref.urgency])}>
          Urgenza {ref.urgency}
        </span>
        {ref.estimatedValue && (
          <span className="text-[10px] font-semibold text-ndp-blue bg-ndp-bg px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            ~€{ref.estimatedValue.toLocaleString('it-IT')}
          </span>
        )}
        {isApproved && ref.scoreAwarded && (
          <span className="text-[10px] font-bold text-ndp-gold-dark bg-ndp-gold-light px-2 py-0.5 rounded-full ml-auto">
            +{ref.scoreAwarded} pts
          </span>
        )}
      </div>
    </div>
  );
}
