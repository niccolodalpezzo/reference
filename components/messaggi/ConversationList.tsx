'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Conversation } from '@/lib/db/conversations';
import ConversationItem from './ConversationItem';
import clsx from 'clsx';

type FilterType = 'all' | 'active' | 'archived';

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew?: () => void;
}

export default function ConversationList({ conversations, selectedId, onSelect, onNew }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const matchFilter =
        filter === 'all' ||
        (filter === 'active' && (c.status === 'active' || c.status === 'muted')) ||
        (filter === 'archived' && (c.status === 'archived' || c.status === 'resolved'));
      if (!matchFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          c.last_message_preview.toLowerCase().includes(q) ||
          (c.subject ?? '').toLowerCase().includes(q) ||
          c.professional_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [conversations, filter, search]);

  const filterLabels: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Tutte' },
    { key: 'active', label: 'Attive' },
    { key: 'archived', label: 'Archiviate' },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-ndp-border">
      <div className="px-4 pt-4 pb-3 border-b border-ndp-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-ndp-text text-base">Messaggi</h2>
          {onNew && (
            <button onClick={onNew} className="w-8 h-8 bg-ndp-blue text-white rounded-lg flex items-center justify-center hover:bg-ndp-blue-dark transition-colors">
              <Plus size={16} />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ndp-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca conversazione..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-ndp-bg rounded-xl border border-ndp-border focus:border-ndp-blue focus:outline-none"
          />
        </div>

        <div className="flex gap-1 mt-2.5">
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={clsx(
                'flex-1 py-1 text-xs font-medium rounded-lg transition-all',
                filter === key ? 'bg-ndp-blue text-white' : 'text-ndp-muted hover:bg-ndp-bg'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
            <div className="w-12 h-12 bg-ndp-bg rounded-full flex items-center justify-center mb-3">
              <Filter className="w-6 h-6 text-ndp-muted" />
            </div>
            <p className="text-sm text-ndp-muted">
              {search ? 'Nessun risultato' : 'Nessuna conversazione'}
            </p>
            <p className="text-xs text-ndp-muted/60 mt-1">
              {search ? 'Prova con altri termini' : "Trova un professionista con l'Assistente AI"}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedId === conv.id}
              onClick={() => onSelect(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
