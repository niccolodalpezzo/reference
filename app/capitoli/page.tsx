import { chapters } from '@/lib/data';
import ChapterCard from '@/components/ChapterCard';
import Link from 'next/link';
import { Building2, Users, Calendar, TrendingUp } from 'lucide-react';

export default function CapitoliPage() {
  const totalMembers = chapters.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="min-h-screen bg-ndp-bg">
      {/* Hero */}
      <div className="bg-ndp-blue py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-white/80 text-xs font-medium mb-6">
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
                  <Icon size={16} className="text-white/60" />
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
      <div className="bg-white border-b border-ndp-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: Calendar, title: 'Riunione settimanale', desc: 'Ogni capitolo si riunisce una volta a settimana con una colazione di lavoro strutturata' },
              { icon: Users, title: 'Un solo professionista per categoria', desc: 'In ogni capitolo c\'è spazio per un solo professionista per categoria — massima esclusività' },
              { icon: TrendingUp, title: 'Referral verificati', desc: 'I referral vengono tracciati e certificati. Solo opportunità di business reali e qualificate' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <div className="w-12 h-12 bg-ndp-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-ndp-blue" />
                </div>
                <h3 className="font-semibold text-ndp-text text-sm mb-2">{title}</h3>
                <p className="text-ndp-muted text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chapters grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-bold text-ndp-text text-xl">
            {chapters.length} Capitoli Attivi
          </h2>
          <Link
            href="/cerca"
            className="inline-flex items-center gap-2 text-sm text-ndp-blue font-medium hover:text-ndp-blue-dark transition-colors"
          >
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
        <div className="bg-ndp-blue rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 network-bg opacity-20 pointer-events-none" />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold text-white mb-3">
              Vuoi entrare in un capitolo?
            </h3>
            <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
              Fai crescere il tuo business attraverso referral qualificati e relazioni professionali durature.
            </p>
            <a
              href="mailto:info@ndpreference.it?subject=Voglio entrare in un capitolo NDP"
              className="inline-flex items-center gap-2 bg-white text-ndp-blue font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all text-sm"
            >
              Richiedi informazioni
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
