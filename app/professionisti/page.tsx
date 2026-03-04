'use client';

import { useState, useMemo } from 'react';
import ProfessionalCard from '@/components/ProfessionalCard';
import { filterProfessionals, getUniqueCities, getUniqueCategories } from '@/lib/utils';
import { Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function ProfessionistiPage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Tutte');
  const [category, setCategory] = useState('Tutte');

  const cities = useMemo(() => getUniqueCities(), []);
  const categories = useMemo(() => getUniqueCategories(), []);
  const results = useMemo(
    () => filterProfessionals(category, city, query),
    [category, city, query]
  );

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Page header */}
      <div className="bg-ndp-blue py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
            Directory Professionisti
          </h1>
          <p className="text-white/60 mb-8 max-w-xl">
            Esplora i professionisti verificati della rete NDP. Usa i filtri o lascia che
            l&apos;AI ti guidi verso il match perfetto.
          </p>

          {/* Search + AI shortcut */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca per nome, specialità..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-0 text-sm text-gray-800 placeholder-gray-400 outline-none shadow-sm"
              />
            </div>
            <Link
              href="/cerca"
              className="flex items-center justify-center gap-2 bg-white text-ndp-blue font-bold px-5 py-3 rounded-xl hover:bg-white/90 transition-all text-sm shrink-0"
            >
              Usa l&apos;AI
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2 text-ndp-muted text-sm">
            <SlidersHorizontal size={15} />
            Filtra per:
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-ndp-border rounded-xl px-3 py-2 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 cursor-pointer shadow-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-white border border-ndp-border rounded-xl px-3 py-2 text-sm text-ndp-text outline-none focus:border-ndp-blue/40 cursor-pointer shadow-sm"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(category !== 'Tutte' || city !== 'Tutte' || query) && (
            <button
              onClick={() => { setCategory('Tutte'); setCity('Tutte'); setQuery(''); }}
              className="text-xs text-ndp-blue underline underline-offset-2 hover:no-underline"
            >
              Rimuovi filtri
            </button>
          )}
          <div className="ml-auto text-sm text-ndp-muted font-medium">
            {results.length} professionist{results.length === 1 ? 'a' : 'i'} trovat{results.length === 1 ? 'a' : 'i'}
          </div>
        </div>

        {/* Grid */}
        {results.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <ProfessionalCard key={p.id} professional={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Search size={40} className="text-ndp-border mx-auto mb-4" />
            <h3 className="font-semibold text-ndp-muted mb-2">Nessun risultato</h3>
            <p className="text-ndp-muted text-sm mb-6">
              Prova a modificare i filtri o usa la ricerca AI per trovare il professionista giusto.
            </p>
            <Link
              href="/cerca"
              className="inline-flex items-center gap-2 bg-ndp-blue text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-ndp-blue-dark transition-all"
            >
              Vai alla ricerca AI
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
