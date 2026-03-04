'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Users, Star, TrendingUp } from 'lucide-react';

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
    <section className="relative bg-gradient-to-br from-ndp-navy via-ndp-navy to-[#0f1d4a] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-ndp-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-ndp-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-ndp-gold/10 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-ndp-gold/15 border border-ndp-gold/30 rounded-full text-ndp-gold text-sm font-medium backdrop-blur">
            <Sparkles size={14} />
            Intelligenza Artificiale per il Networking Professionale
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Trova il professionista
            <br />
            <span className="text-ndp-gold">giusto in secondi</span>
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Descrivi la tua esigenza in italiano, la nostra AI analizza la rete NDP
            e ti presenta i professionisti più adatti — senza filtri manuali, senza perdere tempo.
          </p>
        </div>

        {/* AI Search Box */}
        <div className="max-w-2xl mx-auto mt-10">
          <div className="relative bg-white rounded-2xl shadow-2xl p-2 flex gap-2">
            <div className="absolute -top-3 left-4 bg-ndp-gold text-ndp-navy text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles size={11} />
              AI
            </div>
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
              className="bg-ndp-navy hover:bg-ndp-navy-dark text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap"
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
                className="text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all border border-white/10"
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
              <Icon size={20} className="text-ndp-gold mx-auto mb-2" />
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-white/50 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
