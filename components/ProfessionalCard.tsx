import { Phone, Mail, Star, Award, MapPin } from 'lucide-react';
import { Professional } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import clsx from 'clsx';

interface ProfessionalCardProps {
  professional: Professional;
  compact?: boolean;
  highlighted?: boolean;
}

const categoryColors: Record<string, string> = {
  'Avvocato': 'bg-blue-50 text-blue-700',
  'Commercialista': 'bg-emerald-50 text-emerald-700',
  'Agente Immobiliare': 'bg-orange-50 text-orange-700',
  'Assicuratore': 'bg-violet-50 text-violet-700',
  'Consulente IT': 'bg-cyan-50 text-cyan-700',
  'Marketing': 'bg-pink-50 text-pink-700',
  'Architetto': 'bg-amber-50 text-amber-700',
  'Dentista': 'bg-teal-50 text-teal-700',
  'Consulente Finanziario': 'bg-indigo-50 text-indigo-700',
  'Notaio': 'bg-slate-50 text-slate-700',
  'Ingegnere': 'bg-yellow-50 text-yellow-700',
  'Medico': 'bg-red-50 text-red-700',
  'Fotografo': 'bg-fuchsia-50 text-fuchsia-700',
  'Coach': 'bg-lime-50 text-lime-700',
  'Traduttore': 'bg-sky-50 text-sky-700',
};

export default function ProfessionalCard({ professional: p, compact, highlighted }: ProfessionalCardProps) {
  const initials = getInitials(p.name);
  const badgeClass = categoryColors[p.category] || 'bg-gray-100 text-gray-600';

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border transition-all duration-200 hover:shadow-md',
        highlighted
          ? 'border-ndp-gold shadow-md ring-2 ring-ndp-gold/20'
          : 'border-gray-100 shadow-sm',
        compact ? 'p-4' : 'p-6'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={clsx(
            'rounded-xl bg-ndp-navy flex items-center justify-center text-ndp-gold font-bold flex-shrink-0',
            compact ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base'
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={clsx('font-semibold text-gray-900 truncate', compact ? 'text-sm' : 'text-base')}>
            {p.name}
          </h3>
          <p className={clsx('text-gray-500 truncate', compact ? 'text-xs' : 'text-sm')}>{p.profession}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', badgeClass)}>
              {p.category}
            </span>
          </div>
        </div>
        {highlighted && (
          <div className="shrink-0 text-ndp-gold" title="Top match AI">
            <Star size={16} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Location + Chapter */}
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin size={12} className="text-gray-400 shrink-0" />
        <span className="text-xs text-gray-500 truncate">{p.city} · {p.chapter}</span>
      </div>

      {/* Bio */}
      {!compact && (
        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{p.bio}</p>
      )}

      {/* Specialties */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {p.specialties.slice(0, 4).map((s) => (
            <span key={s} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 py-3 border-y border-gray-50">
        <div className="flex items-center gap-1.5">
          <Award size={12} className="text-ndp-gold" />
          <span className="text-xs text-gray-600">
            <strong className="text-gray-800">{p.yearsInBNI}</strong> anni BNI
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-ndp-gold fill-current" />
          <span className="text-xs text-gray-600">
            <strong className="text-gray-800">{p.rating}</strong>/5
          </span>
        </div>
        <div className="text-xs text-gray-400">
          {p.referralsGiven} referral
        </div>
      </div>

      {/* Contacts */}
      <div className={clsx('space-y-1.5', compact ? 'hidden' : '')}>
        <a
          href={`tel:${p.phone}`}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-ndp-navy transition-colors"
        >
          <Phone size={11} className="text-ndp-navy shrink-0" />
          {p.phone}
        </a>
        <a
          href={`mailto:${p.email}`}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-ndp-navy transition-colors"
        >
          <Mail size={11} className="text-ndp-navy shrink-0" />
          {p.email}
        </a>
      </div>

      {/* Compact contact buttons */}
      {compact && (
        <div className="flex gap-2">
          <a
            href={`tel:${p.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-ndp-navy text-white py-2 rounded-lg hover:bg-ndp-navy-dark transition-colors font-medium"
          >
            <Phone size={11} />
            Chiama
          </a>
          <a
            href={`mailto:${p.email}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium border border-gray-100"
          >
            <Mail size={11} />
            Email
          </a>
        </div>
      )}
    </div>
  );
}
