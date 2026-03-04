import { chapters } from '@/lib/data';
import ChapterCard from '@/components/ChapterCard';
import Link from 'next/link';
import { Building2, Users, Sparkles, Calendar, TrendingUp } from 'lucide-react';

export default function CapitoliPage() {
  const totalMembers = chapters.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Hero */}
      <div className="bg-ndp-navy py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-ndp-gold/20 border border-ndp-gold/30 px-3 py-1.5 rounded-full text-ndp-gold text-xs font-medium mb-6">
              <Building2 size={12} />
              Network Nazionale
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              I Capitoli NDP Reference
            </h1>
            <p className="text-white/60 leading-relaxed mb-8">
              Ogni capitolo è una comunità di professionisti che si incontrano settimanalmente,
              si supportano a vicenda e scambiano referral di qualità. Insieme costruiamo
              il network di fiducia più solido d&apos;Italia.
            </p>
            <div className="flex flex-wrap gap-6">
              {[
                { icon: Building2, value: `${chapters.length}`, label: 'Capitoli attivi' },
                { icon: Users, value: `${totalMembers}+`, label: 'Professionisti' },
                { icon: TrendingUp, value: '€580M', label: 'Business generato' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon size={16} className="text-ndp-gold" />
                  <div>
                    <div className="font-bold text-white text-lg leading-none">{value}</div>
                    <div className="text-white/40 text-xs">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How chapters work */}
      <div className="bg-white border-b border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Calendar, title: 'Riunione settimanale', desc: 'Ogni capitolo si riunisce una volta a settimana con una colazione di lavoro strutturata' },
              { icon: Users, title: 'Un solo professionista per categoria', desc: 'In ogni capitolo c\'è spazio per un solo professionista per categoria — massima esclusività' },
              { icon: TrendingUp, title: 'Referral verificati', desc: 'I referral vengono tracciati e certificati. Solo opportunità di business reali e qualificate' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <div className="w-12 h-12 bg-ndp-navy/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-ndp-navy" />
                </div>
                <h3 className="font-semibold text-ndp-navy text-sm mb-2">{title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chapters grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-ndp-navy text-xl">
            {chapters.length} Capitoli Attivi
          </h2>
          <Link
            href="/cerca"
            className="inline-flex items-center gap-2 text-sm text-ndp-navy font-medium hover:text-ndp-navy-dark transition-colors"
          >
            <Sparkles size={14} className="text-ndp-gold" />
            Cerca professionisti con AI
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-ndp-navy rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ndp-gold/5 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-ndp-gold/20 border border-ndp-gold/30 px-3 py-1.5 rounded-full text-ndp-gold text-xs font-medium mb-4">
              <Sparkles size={12} />
              Unisciti alla rete
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-3">
              Vuoi entrare in un capitolo?
            </h3>
            <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
              Fai crescere il tuo business attraverso referral qualificati e relazioni professionali durature.
            </p>
            <a
              href="mailto:info@ndpreference.it?subject=Voglio entrare in un capitolo NDP"
              className="inline-flex items-center gap-2 bg-ndp-gold text-ndp-navy font-bold px-8 py-3.5 rounded-xl hover:bg-ndp-gold-light transition-all text-sm"
            >
              Richiedi informazioni
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
