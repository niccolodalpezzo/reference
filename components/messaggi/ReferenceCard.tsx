'use client';

import { useEffect, useState } from 'react';
import { getReferencesByConversation, Ref } from '@/lib/db/references';
import { Award, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { createClient } from '@/lib/supabase/client';

interface Props {
  referenceId: string;
}

const urgencyColors: Record<string, string> = {
  bassa: 'text-green-600 bg-green-50',
  media: 'text-yellow-700 bg-yellow-50',
  alta: 'text-red-600 bg-red-50',
};

const contactTypeLabels: Record<string, string> = {
  lead: 'Lead',
  referenza: 'Referenza',
  'opportunità': 'Opportunità',
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  in_verifica: { label: 'In verifica', icon: AlertCircle, color: 'text-yellow-700 bg-yellow-50' },
  approvata: { label: 'Approvata', icon: CheckCircle2, color: 'text-green-700 bg-green-50' },
  rifiutata: { label: 'Rifiutata', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export default function ReferenceCard({ referenceId }: Props) {
  const [ref, setRef] = useState<Ref | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('references').select('*').eq('id', referenceId).single().then(({ data }) => {
      if (data) setRef(data as Ref);
    });
  }, [referenceId]);

  if (!ref) return (
    <div className="rounded-2xl border border-ndp-border bg-ndp-bg p-4 animate-pulse">
      <div className="h-4 bg-ndp-border rounded w-2/3 mb-2" />
      <div className="h-3 bg-ndp-border rounded w-1/2" />
    </div>
  );

  const status = statusConfig[ref.status] ?? statusConfig['in_verifica'];
  const StatusIcon = status.icon;
  const isApproved = ref.status === 'approvata';

  return (
    <div className={clsx(
      'rounded-2xl border-2 p-4 transition-all',
      isApproved ? 'border-ndp-gold bg-gradient-to-br from-ndp-gold-light/30 to-white' : 'border-ndp-border bg-white'
    )}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', isApproved ? 'bg-ndp-gold/20' : 'bg-ndp-blue/10')}>
            <Award className={clsx('w-4 h-4', isApproved ? 'text-ndp-gold-dark' : 'text-ndp-blue')} />
          </div>
          <div>
            <p className="text-xs font-bold text-ndp-text">Referenza NDP</p>
            <p className="text-[10px] text-ndp-muted">{contactTypeLabels[ref.contact_type] ?? ref.contact_type}</p>
          </div>
        </div>
        <span className={clsx('flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full', status.color)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <p className="text-sm font-semibold text-ndp-text">{ref.contact_name}</p>
        <p className="text-xs text-ndp-muted">{ref.contact_info}</p>
        {ref.notes && (
          <p className="text-xs text-ndp-text/70 leading-relaxed bg-ndp-bg rounded-lg px-2.5 py-2">
            &quot;{ref.notes}&quot;
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', urgencyColors[ref.urgency] ?? 'text-gray-600 bg-gray-50')}>
          Urgenza {ref.urgency}
        </span>
        {ref.status === 'in_verifica' && (
          <span className="text-[10px] font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full ml-auto">
            +10 pt assegnati · In verifica per bonus
          </span>
        )}
        {isApproved && (
          <span className="text-[10px] font-bold text-ndp-gold-dark bg-ndp-gold-light px-2 py-0.5 rounded-full ml-auto">
            +40 pt totali
          </span>
        )}
      </div>
    </div>
  );
}
