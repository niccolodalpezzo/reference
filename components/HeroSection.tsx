'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Users, TrendingUp, Star } from 'lucide-react';

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (searchQuery.trim()) {
      router.push(`/cerca?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/cerca');
    }
  };

  const suggestions = [
    'Ho bisogno di un avvocato a Milano',
    'Cerco un commercialista per la mia startup',
    'Agenzia immobiliare a Roma per vendita',
    'Consulente IT per cybersecurity',
  ];

  return (
    <section className="relative bg-ndp-blue overflow-hidden">
      {/* Network dot pattern */}
      <div className="absolute inset-0 network-bg opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        {/* Headline */}
        <div className="text-center mb-6">
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Trova il professionista
            <br />
            <span className="text-white/60">giusto in secondi.</span>
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Descrivi la tua esigenza in italiano, la nostra AI analizza la rete NDP
            e ti presenta i professionisti più adatti — senza filtri manuali, senza perdere tempo.
          </p>
        </div>

        {/* AI Search Box */}
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-2xl shadow-2xl p-2 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Es: Ho bisogno di un avvocato per diritto societario a Milano..."
              className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 text-sm outline-none rounded-xl bg-transparent"
            />
            <button
              onClick={() => handleSearch()}
              className="bg-ndp-text hover:bg-ndp-text/90 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap"
            >
              Cerca
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all border border-white/20"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            { icon: Users, value: '12.000+', label: 'Professionisti' },
            { icon: TrendingUp, value: '€580M', label: 'Business generato' },
            { icon: Star, value: '4.9/5', label: 'Soddisfazione' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon size={20} className="text-white/60 mx-auto mb-2" />
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-white/50 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
