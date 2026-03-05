import Image from 'next/image';
import Link from 'next/link';
import TopProfessionisti from '@/components/TopProfessionisti';
import { Sparkles, UserCheck, Network, ShieldCheck, Users, TrendingUp, Building2, MessageSquare, Search } from 'lucide-react';

const HOW_IT_WORKS = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Descrivi la tua esigenza',
    desc: 'Scrivi in italiano naturale: "Ho bisogno di un avvocato per un contratto" o "Cerco un consulente IT a Milano".',
  },
  {
    icon: Search,
    step: '02',
    title: "L'AI analizza il network",
    desc: 'Il nostro Assistente AI analizza i profili di tutti i professionisti verificati nella rete BNI, valutando specialità, città e referral.',
  },
  {
    icon: UserCheck,
    step: '03',
    title: 'Trova il professionista',
    desc: 'Ricevi i migliori match con profilo completo e contatti diretti. Nessun filtro, solo risultati.',
  },
];

const WHY_DIFFERENT = [
  { icon: ShieldCheck, title: 'Verificati da BNI', desc: 'Ogni professionista è un membro attivo della rete BNI. Non trovi chi paga per essere presente — trovi chi ha guadagnato la sua reputazione.' },
  { icon: Network, title: 'Ricerca semantica AI', desc: 'Non cerchi per categoria o città. Descrivi il problema e l\'AI trova il professionista che ha già risolto casi simili al tuo.' },
  { icon: TrendingUp, title: 'Ranking di merito', desc: 'I professionisti sono ordinati per referral evasi, rating e attività reale. La qualità emerge da sola.' },
];

const KPI = [
  { icon: Building2, value: '45+', label: 'Capitoli attivi' },
  { icon: Users, value: '1.200+', label: 'Professionisti' },
  { icon: TrendingUp, value: '€580M', label: 'Business generato' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ndp-blue pt-20 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 network-bg opacity-10 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative text-center">
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.svg"
              alt="NDP Reference"
              width={120}
              height={120}
              priority
              className="rounded-2xl shadow-2xl"
            />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            Il network di fiducia<br />
            per professionisti verificati
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Trova il professionista giusto in secondi grazie all&apos;AI. Non filtri, non directory statiche — intelligenza semantica sulla rete BNI.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assistente"
              className="inline-flex items-center justify-center gap-2 bg-white text-ndp-blue font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-all text-sm shadow-lg"
            >
              <Sparkles size={16} />
              Prova l&apos;Assistente AI
            </Link>
            <Link
              href="/login?from=member"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              Accedi come Professionista
            </Link>
            <Link
              href="/login?from=zone_manager"
              className="inline-flex items-center justify-center gap-2 border border-ndp-gold/50 text-ndp-gold font-medium px-8 py-4 rounded-xl hover:bg-ndp-gold/10 transition-all text-sm"
            >
              Resp. di Zona
            </Link>
          </div>

          {/* KPI mini */}
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {KPI.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon size={16} className="text-white/50" />
                <div className="text-left">
                  <div className="font-bold text-white text-xl leading-none">{value}</div>
                  <div className="text-white/40 text-xs">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-ndp-blue/10 text-ndp-blue text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Come funziona
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text mb-3">
              Tre passi verso il professionista giusto
            </h2>
            <p className="text-ndp-muted max-w-lg mx-auto text-sm">
              Niente filtri complicati. L&apos;AI fa il lavoro per te.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 bg-ndp-blue rounded-2xl flex items-center justify-center mx-auto shadow-md">
                    <Icon size={26} className="text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-ndp-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {step.replace('0', '')}
                  </div>
                </div>
                <h3 className="font-display font-bold text-ndp-text text-lg mb-2">{title}</h3>
                <p className="text-ndp-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perché diverso */}
      <section className="py-20 bg-ndp-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-ndp-gold/15 text-ndp-gold-dark text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-ndp-gold/20">
              Perché NDP Reference
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text mb-3">
              Non una directory. Un network di fiducia.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY_DIFFERENT.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-ndp-border shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-ndp-blue rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-ndp-text mb-2">{title}</h3>
                <p className="text-ndp-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Professionisti del Mese */}
      <TopProfessionisti />

      {/* CTA finale */}
      <section className="bg-ndp-blue py-20 px-4">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 network-bg opacity-10 pointer-events-none" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 relative">
            Sei un professionista BNI?
          </h2>
          <p className="text-white/70 text-sm max-w-lg mx-auto mb-8 relative">
            Compila il tuo profilo AI, ricevi referral qualificati e scala la classifica mensile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
            <Link
              href="/login?from=member"
              className="inline-flex items-center justify-center gap-2 bg-white text-ndp-blue font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-all text-sm"
            >
              Accedi alla tua area
            </Link>
            <Link
              href="/assistente"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              <Sparkles size={15} />
              Prova l&apos;Assistente
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
