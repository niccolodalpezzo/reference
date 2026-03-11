import { Phone, Mail, Star, Award, MapPin } from 'lucide-react';
import { Professional } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import clsx from 'clsx';

interface ProfessionalCardProps {
  professional: Professional;
  compact?: boolean;
  highlighted?: boolean;
  inline?: boolean;
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

export default function ProfessionalCard({ professional: p, compact, highlighted, inline }: ProfessionalCardProps) {
  const initials = getInitials(p.name);
  const badgeClass = categoryColors[p.category] || 'bg-gray-100 text-gray-600';
  const isCondensed = compact || inline;

  const avatarClass = inline
    ? 'w-9 h-9 text-xs'
    : compact
    ? 'w-10 h-10 text-sm'
    : 'w-12 h-12 text-base';

  const paddingClass = inline ? 'p-3' : compact ? 'p-4' : 'p-6';
  const nameSizeClass = inline ? 'text-sm' : compact ? 'text-sm' : 'text-base';

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border transition-all duration-200 hover:shadow-md',
        highlighted
          ? 'border-ndp-blue shadow-md ring-2 ring-ndp-blue/20'
          : 'border-ndp-border shadow-sm',
        paddingClass
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={clsx(
            'rounded-xl bg-ndp-blue flex items-center justify-center text-white font-bold flex-shrink-0',
            avatarClass
          )}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={clsx('font-semibold text-ndp-text truncate', nameSizeClass)}>
            {p.name}
          </h3>
          <p className="text-xs text-ndp-muted truncate">{p.profession}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', badgeClass)}>
              {p.category}
            </span>
          </div>
        </div>
        {highlighted && (
          <div className="shrink-0 text-ndp-blue-mid" title="Top match AI">
            <Star size={16} fill="currentColor" />
          </div>
        )}
      </div>

      {/* Location + Chapter */}
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin size={12} className="text-ndp-muted shrink-0" />
        <span className="text-xs text-ndp-muted truncate">{p.city} · {p.chapter}</span>
      </div>

      {/* Bio */}
      {!isCondensed && (
        <p className="text-ndp-muted text-xs leading-relaxed mb-4 line-clamp-2">{p.bio}</p>
      )}

      {/* Specialties */}
      {!isCondensed && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {p.specialties.slice(0, 4).map((s) => (
            <span key={s} className="text-xs bg-ndp-bg text-ndp-muted px-2 py-0.5 rounded-full border border-ndp-border">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className={clsx('flex items-center gap-3 py-2.5 border-y border-ndp-border', isCondensed ? 'mb-3' : 'mb-4')}>
        <div className="flex items-center gap-1">
          <Award size={11} className="text-ndp-blue-mid" />
          <span className="text-xs text-ndp-muted">
            <strong className="text-ndp-text">{p.yearsInNDP}</strong>a
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={11} className="text-ndp-blue-mid fill-current" />
          <span className="text-xs text-ndp-muted">
            <strong className="text-ndp-text">{p.rating}</strong>
          </span>
        </div>
        <div className="text-xs text-ndp-muted">
          {p.referralsGiven} ref
        </div>
      </div>

      {/* Contacts (full view) */}
      {!isCondensed && (
        <div className="space-y-1.5">
          <a
            href={`tel:${p.phone}`}
            className="flex items-center gap-2 text-xs text-ndp-muted hover:text-ndp-blue transition-colors"
          >
            <Phone size={11} className="text-ndp-blue shrink-0" />
            {p.phone}
          </a>
          <a
            href={`mailto:${p.email}`}
            className="flex items-center gap-2 text-xs text-ndp-muted hover:text-ndp-blue transition-colors"
          >
            <Mail size={11} className="text-ndp-blue shrink-0" />
            {p.email}
          </a>
        </div>
      )}

      {/* Condensed contact buttons (compact + inline) */}
      {isCondensed && (
        <div className="flex gap-2">
          <a
            href={`tel:${p.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-ndp-blue text-white py-2 rounded-lg hover:bg-ndp-blue-dark transition-colors font-medium"
          >
            <Phone size={11} />
            Chiama
          </a>
          <a
            href={`mailto:${p.email}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-ndp-bg text-ndp-text py-2 rounded-lg hover:bg-ndp-border transition-colors font-medium border border-ndp-border"
          >
            <Mail size={11} />
            Email
          </a>
        </div>
      )}
    </div>
  );
}
