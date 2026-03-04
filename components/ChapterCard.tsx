import { Chapter } from '@/lib/types';
import { MapPin, Users, Clock, Calendar } from 'lucide-react';

export default function ChapterCard({ chapter: c }: { chapter: Chapter }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-ndp-border shadow-sm hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-ndp-text text-lg leading-tight group-hover:text-ndp-blue transition-colors">
            {c.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-ndp-muted text-sm">
            <MapPin size={13} />
            <span>{c.city}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-ndp-bg group-hover:bg-ndp-blue rounded-xl flex items-center justify-center transition-all duration-300">
          <span className="text-ndp-blue group-hover:text-white font-display font-bold text-lg transition-colors duration-300">
            {c.city.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-ndp-muted text-xs leading-relaxed mb-5 line-clamp-2">{c.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-ndp-bg rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Users size={12} className="text-ndp-blue" />
            <span className="text-xs text-ndp-muted">Membri</span>
          </div>
          <div className="font-bold text-ndp-text text-lg">{c.memberCount}</div>
        </div>
        <div className="bg-ndp-bg rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Calendar size={12} className="text-ndp-blue" />
            <span className="text-xs text-ndp-muted">Fondato</span>
          </div>
          <div className="font-bold text-ndp-text text-lg">{c.founded}</div>
        </div>
      </div>

      {/* Meeting info */}
      <div className="flex items-center gap-2 text-xs text-ndp-muted mb-4 py-3 border-y border-ndp-border">
        <Clock size={12} className="text-ndp-blue-mid shrink-0" />
        <span>
          Ogni <strong className="text-ndp-text">{c.meetingDay}</strong> alle{' '}
          <strong className="text-ndp-text">{c.meetingTime}</strong>
        </span>
      </div>

      {/* Top categories */}
      <div>
        <div className="text-xs text-ndp-muted mb-2">Categorie principali</div>
        <div className="flex flex-wrap gap-1.5">
          {c.topCategories.map((cat) => (
            <span
              key={cat}
              className="text-xs bg-ndp-bg text-ndp-blue px-2.5 py-1 rounded-full font-medium border border-ndp-border"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
