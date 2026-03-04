import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import FeatureCompare from '@/components/FeatureCompare';
import Link from 'next/link';
import { MessageSquare, Search, UserCheck, Sparkles, Quote } from 'lucide-react';

const howItWorksSteps = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Descrivi la tua esigenza',
    description:
      'Scrivi in italiano naturale: "Ho bisogno di un avvocato per una separazione a Roma" o "Cerco un consulente IT per la mia azienda".',
  },
  {
    icon: Search,
    step: '02',
    title: 'L\'AI analizza il network',
    description:
      'Il nostro sistema AI analizza il profilo di tutti i professionisti nella rete NDP, valutando specialità, città, referral e reputazione.',
  },
  {
    icon: UserCheck,
    step: '03',
    title: 'Trova il professionista',
    description:
      'Ricevi immediatamente i migliori match con profilo completo, contatti diretti e storico di referral nella rete.',
  },
];

const testimonials = [
  {
    name: 'Giovanni Ferrara',
    role: 'CEO, Ferrara Industries Srl',
    text: 'In cinque minuti ho trovato il commercialista giusto per la ristrutturazione del debito. Con la ricerca tradizionale ci avrei messo una settimana. NDP Reference è il futuro.',
    chapter: 'NDP Milano Duomo',
    rating: 5,
  },
  {
    name: 'Laura Benedetti',
    role: 'Architetta',
    text: 'Ho ricevuto tre referral di qualità dal network in un mese. La visibilità che la piattaforma mi dà è incomparabile rispetto a prima.',
    chapter: 'NDP Torino Nord',
    rating: 5,
  },
  {
    name: 'Antonio Martino',
    role: 'Imprenditore',
    text: 'Cercavo un avvocato specializzato in diritto del lavoro. Ho descritto il problema all\'AI e in 30 secondi avevo tre profili perfetti. Incredibile.',
    chapter: 'NDP Roma Centro',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeatureCompare />

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-ndp-navy/5 text-ndp-navy text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Come funziona
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-navy mb-4">
              Tre passi verso il professionista giusto
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Niente filtri complicati, niente ricerche infinite. L&apos;AI fa il lavoro per te.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map(({ icon: Icon, step, title, description }) => (
              <div key={step} className="relative">
                {/* Connector line (desktop) */}
                {step !== '03' && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-0 h-px bg-gradient-to-r from-ndp-gold/40 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 bg-ndp-navy rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Icon size={28} className="text-ndp-gold" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-ndp-gold rounded-full flex items-center justify-center text-ndp-navy text-xs font-bold">
                      {step.replace('0', '')}
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-ndp-navy text-lg mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-ndp-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-navy mb-4">
              Cosa dicono i membri
            </h2>
            <p className="text-gray-500">Professionisti reali, risultati reali.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <Quote size={24} className="text-ndp-gold mb-4" />
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ndp-navy rounded-xl flex items-center justify-center text-ndp-gold font-bold text-sm">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.role}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{t.chapter}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-ndp-gold text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-ndp-navy to-[#0f1d4a] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-ndp-gold/20 border border-ndp-gold/30 px-4 py-2 rounded-full text-ndp-gold text-sm font-medium mb-6">
            <Sparkles size={14} />
            Prova subito, gratuitamente
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronti a rivoluzionare
            <br />
            il tuo networking?
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Unisciti ai professionisti che usano l&apos;AI per trovare collaborazioni di valore.
            La tua prossima opportunità è a una domanda di distanza.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cerca"
              className="inline-flex items-center justify-center gap-2 bg-ndp-gold text-ndp-navy font-bold px-8 py-4 rounded-xl hover:bg-ndp-gold-light transition-all text-sm"
            >
              <Sparkles size={16} />
              Inizia la ricerca AI
            </Link>
            <Link
              href="/professionisti"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              Esplora la directory
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
