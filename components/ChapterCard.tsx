import { Chapter } from '@/lib/types';
import { MapPin, Users, Clock, Calendar } from 'lucide-react';

export default function ChapterCard({ chapter: c }: { chapter: Chapter }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-ndp-navy text-lg leading-tight group-hover:text-ndp-navy transition-colors">
            {c.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-gray-400 text-sm">
            <MapPin size={13} />
            <span>{c.city}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-ndp-navy/5 group-hover:bg-ndp-navy rounded-xl flex items-center justify-center transition-all duration-300">
          <span className="text-ndp-navy group-hover:text-ndp-gold font-display font-bold text-lg transition-colors duration-300">
            {c.city.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-gray-500 text-xs leading-relaxed mb-5 line-clamp-2">{c.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-ndp-bg rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Users size={12} className="text-ndp-navy" />
            <span className="text-xs text-gray-400">Membri</span>
          </div>
          <div className="font-bold text-ndp-navy text-lg">{c.memberCount}</div>
        </div>
        <div className="bg-ndp-bg rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Calendar size={12} className="text-ndp-navy" />
            <span className="text-xs text-gray-400">Fondato</span>
          </div>
          <div className="font-bold text-ndp-navy text-lg">{c.founded}</div>
        </div>
      </div>

      {/* Meeting info */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 py-3 border-y border-gray-50">
        <Clock size={12} className="text-ndp-gold shrink-0" />
        <span>
          Ogni <strong className="text-gray-700">{c.meetingDay}</strong> alle{' '}
          <strong className="text-gray-700">{c.meetingTime}</strong>
        </span>
      </div>

      {/* Top categories */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Categorie principali</div>
        <div className="flex flex-wrap gap-1.5">
          {c.topCategories.map((cat) => (
            <span
              key={cat}
              className="text-xs bg-ndp-navy/5 text-ndp-navy px-2.5 py-1 rounded-full font-medium"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
