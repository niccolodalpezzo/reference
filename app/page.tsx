import Link from 'next/link';
import TopProfessionisti from '@/components/TopProfessionisti';
import {
  Sparkles, UserCheck, Network, ShieldCheck, TrendingUp,
  MessageSquare, Search, Star, MapPin, Calendar, CheckCircle2,
  ArrowRight,
} from 'lucide-react';

// ─── How It Works ────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'Racconta il tuo problema',
    desc: 'Scrivi in italiano naturale. Niente form, niente categorie: descrivi la situazione come la racconteresti a un collega.',
  },
  {
    icon: Search,
    step: '02',
    title: "L'AI legge il contesto",
    desc: 'Il nostro modello semantico analizza specialità, storico referral, territorio e performance reale di ogni professionista nella rete.',
  },
  {
    icon: UserCheck,
    step: '03',
    title: 'Trovi il match giusto',
    desc: 'Non un elenco di risultati. Un professionista che ha già risolto casi come il tuo, verificato e contattabile in un click.',
  },
];

// ─── Why Different ───────────────────────────────────────────────────────────

const WHY_DIFFERENT = [
  {
    icon: ShieldCheck,
    accent: 'text-ndp-gold',
    accentBg: 'bg-ndp-gold/15',
    title: 'Verificati dalla rete NDP',
    desc: 'Non pagano per essere presenti. Ogni professionista ha guadagnato la sua posizione con referral reali e rating della comunità.',
  },
  {
    icon: Sparkles,
    accent: 'text-ndp-blue-mid',
    accentBg: 'bg-ndp-blue-mid/15',
    title: 'AI semantica, non keyword',
    desc: 'Descrivi il problema in linguaggio naturale. L\'AI capisce il contesto, non solo le parole chiave.',
  },
  {
    icon: TrendingUp,
    accent: 'text-green-400',
    accentBg: 'bg-green-400/15',
    title: 'Ranking di merito dinamico',
    desc: 'La classifica mensile emerge dai risultati: referral completati, rating, attività nella rete. La qualità sale sempre in cima.',
  },
  {
    icon: MapPin,
    accent: 'text-ndp-gold',
    accentBg: 'bg-ndp-gold/15',
    title: 'Territorio ed eventi live',
    desc: 'La rete vive anche offline. Networking, workshop ed eventi nel tuo territorio, organizzati dai responsabili di zona.',
  },
  {
    icon: Network,
    accent: 'text-purple-400',
    accentBg: 'bg-purple-400/15',
    title: 'Matching di contesto',
    desc: 'Il sistema considera specialità verticali, area geografica, storico referral e compatibilità di profilo. Non il prezzo.',
  },
  {
    icon: UserCheck,
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-400/15',
    title: 'Reputazione trasparente',
    desc: 'Ogni profilo mostra score reale, referral evasi, tempo di risposta medio. Nessun dato nascosto.',
  },
];

// ─── Mock Events ─────────────────────────────────────────────────────────────

const MOCK_EVENTS = [
  {
    id: '1',
    city: 'Milano',
    region: 'Lombardia',
    title: 'NDP Chapter Milano Centro — Networking Morning',
    date: '18 Marzo 2026',
    label: 'Networking',
  },
  {
    id: '2',
    city: 'Roma',
    region: 'Lazio',
    title: 'Workshop AI per Professionisti NDP — Roma',
    date: '25 Marzo 2026',
    label: 'Workshop',
  },
  {
    id: '3',
    city: 'Torino',
    region: 'Piemonte',
    title: 'NDP Torino — Incontro Mensile di Chapter',
    date: '2 Aprile 2026',
    label: 'Chapter',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── 1. Hero Split-Screen ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ndp-blue via-ndp-blue to-[#0A006B] min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0 network-bg opacity-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-ndp-blue-mid/15 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-[58%_42%] gap-12 items-center">

            {/* LEFT: Copy */}
            <div>
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Rete NDP Verificata · 1.200+ Professionisti
              </div>

              {/* H1 */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
                Il professionista giusto<br />
                <span className="text-white/50">non si cerca.</span><br />
                <span className="bg-gradient-to-r from-ndp-gold to-ndp-gold-light bg-clip-text text-transparent">
                  Si trova.
                </span>
              </h1>

              {/* Subline */}
              <p className="text-white/60 text-lg leading-relaxed max-w-xl mb-10">
                La prima piattaforma italiana che usa AI semantica per matchare il tuo problema con il professionista che l&apos;ha già risolto. Verificato. Referenziato. Reale.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link
                  href="/assistente"
                  className="inline-flex items-center justify-center gap-2 bg-white text-ndp-blue font-bold px-7 py-4 rounded-2xl hover:bg-white/90 transition-all text-sm shadow-lg shadow-black/20"
                >
                  <Sparkles size={15} />
                  Prova l&apos;Assistente AI
                </Link>
                <Link
                  href="/registrazione"
                  className="inline-flex items-center justify-center gap-2 border-2 border-ndp-gold/60 text-ndp-gold font-bold px-7 py-4 rounded-2xl hover:bg-ndp-gold/10 transition-all text-sm"
                >
                  Diventa Professionista
                </Link>
                <Link
                  href="/eventi"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/70 font-medium px-7 py-4 rounded-2xl hover:bg-white/8 transition-all text-sm"
                >
                  <Calendar size={14} />
                  Prossimi eventi
                </Link>
              </div>

              {/* KPI strip */}
              <div className="border-t border-white/10 pt-8 flex flex-wrap gap-8">
                {[
                  { value: '45+', label: 'Capitoli attivi' },
                  { value: '1.200+', label: 'Professionisti' },
                  { value: '€580M', label: 'Business generato' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="font-display font-bold text-white text-2xl leading-none">{value}</div>
                    <div className="text-white/40 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Product preview (hidden on mobile) */}
            <div className="hidden lg:block relative">
              <div className="glass-card rounded-3xl p-5 relative">
                {/* Chat bubble */}
                <div className="mb-4">
                  <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-white/80 text-sm max-w-[85%]">
                    &ldquo;Ho bisogno di un avvocato specializzato in diritto societario a Milano&rdquo;
                  </div>
                </div>

                {/* AI response */}
                <div className="bg-ndp-blue-mid/20 border border-ndp-blue-mid/30 rounded-2xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={12} className="text-ndp-blue-mid" />
                    <span className="text-white/60 text-xs font-medium">3 match trovati</span>
                  </div>
                  {[
                    { initials: 'MF', name: 'Marco Ferretti', role: 'Avvocato · Milano', rating: '4.9' },
                    { initials: 'AL', name: 'Anna Lombardi', role: 'Avvocato · Milano', rating: '4.8' },
                  ].map((p) => (
                    <div key={p.initials} className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-ndp-blue flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-semibold truncate">{p.name}</div>
                        <div className="text-white/50 text-[10px]">{p.role}</div>
                      </div>
                      <div className="flex items-center gap-0.5 text-ndp-gold text-xs font-bold shrink-0">
                        <Star size={9} fill="currentColor" />
                        {p.rating}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <CheckCircle2 size={11} className="text-green-400" />
                    <span className="text-white/40 text-[10px]">Tutti verificati NDP</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 bg-ndp-gold text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Star size={9} fill="currentColor" /> Top del mese
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white text-ndp-text text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                +128 referral questo mese
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Come Funziona — Narrative Timeline ─────────────────────────── */}
      <section className="py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-ndp-blue/8 text-ndp-blue text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              Come funziona
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text">
              Tre passi. Zero complicazioni.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Horizontal connector */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.6%+24px)] right-[calc(16.6%+24px)] h-px bg-gradient-to-r from-transparent via-ndp-border to-transparent" />

            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative text-center">
                {/* Big background number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-display text-9xl font-bold text-ndp-bg select-none pointer-events-none leading-none">
                  {step}
                </div>
                {/* Icon */}
                <div className="relative inline-flex w-[104px] h-[104px] items-center justify-center bg-gradient-to-br from-ndp-blue to-ndp-blue-mid rounded-3xl shadow-lg mb-6 mx-auto">
                  <Icon size={36} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-ndp-text text-xl mb-3">{title}</h3>
                <p className="text-ndp-muted text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Perché Diverso — Dark Section ──────────────────────────────── */}
      <section className="py-24 bg-ndp-text overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-14 gap-6">
            <div>
              <span className="inline-flex items-center gap-2 bg-ndp-gold/15 border border-ndp-gold/25 text-ndp-gold text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                Perché NDP Reference
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                Non una directory.<br />
                Un&apos;infrastruttura di fiducia.
              </h2>
            </div>
            <p className="text-white/30 text-sm max-w-xs sm:text-right leading-relaxed">
              Costruita per la rete NDP. Aperta a chiunque abbia un problema da risolvere.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY_DIFFERENT.map(({ icon: Icon, accent, accentBg, title, desc }) => (
              <div
                key={title}
                className="bg-white/[0.04] border border-white/8 rounded-2xl p-7 hover:bg-white/[0.07] transition-colors"
              >
                <div className={`w-11 h-11 rounded-xl ${accentBg} flex items-center justify-center mb-5`}>
                  <Icon size={20} className={accent} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Top Professionisti — Podium ────────────────────────────────── */}
      <TopProfessionisti variant="podium" limit={8} />

      {/* ── 5. Events Preview ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <span className="inline-flex items-center gap-2 bg-ndp-blue/8 text-ndp-blue text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
                Network Live
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text">
                La rete si incontra. Sempre.
              </h2>
              <p className="text-ndp-muted text-sm mt-2">
                Networking, workshop ed eventi nel tuo territorio.
              </p>
            </div>
            <Link
              href="/eventi"
              className="inline-flex items-center gap-2 text-ndp-blue font-semibold text-sm hover:gap-3 transition-all shrink-0"
            >
              Esplora tutti gli eventi <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_EVENTS.map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl border border-ndp-border overflow-hidden hover:shadow-md transition-shadow">
                {/* Gradient header */}
                <div className="bg-gradient-to-r from-ndp-blue to-ndp-blue-mid px-5 py-5 relative overflow-hidden">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-display font-bold text-6xl text-white/10 select-none leading-none">
                    {ev.city[0]}
                  </div>
                  <span className="inline-block bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
                    {ev.label}
                  </span>
                  <h3 className="font-semibold text-white text-sm leading-snug relative pr-8">{ev.title}</h3>
                </div>
                {/* Body */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-4 text-xs text-ndp-muted mb-4">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {ev.city}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {ev.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Attivo
                    </span>
                    <Link href="/eventi" className="text-ndp-blue text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      Dettagli <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Guest vs Pro Paths ─────────────────────────────────────────── */}
      <section className="py-20 bg-ndp-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text">
              Per chi è NDP Reference?
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Guest card */}
            <div className="bg-white border-2 border-ndp-border rounded-3xl p-10">
              <div className="w-14 h-14 bg-ndp-blue/10 rounded-2xl flex items-center justify-center mb-6">
                <Search size={24} className="text-ndp-blue" />
              </div>
              <h3 className="font-display font-bold text-ndp-text text-2xl mb-3">
                Cerca. Trova. Contatta.
              </h3>
              <p className="text-ndp-muted text-sm leading-relaxed mb-7">
                Prova subito l&apos;assistente AI senza registrazione. Descrivi il tuo problema e trova il professionista giusto in secondi.
              </p>
              <Link
                href="/assistente"
                className="inline-flex items-center gap-2 bg-ndp-blue text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-ndp-blue-dark transition-colors text-sm mb-7"
              >
                <Sparkles size={14} /> Prova l&apos;AI
              </Link>
              <ul className="space-y-2.5">
                {['Nessuna registrazione', 'Risultati istantanei', 'Contatti diretti'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-ndp-muted">
                    <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro card */}
            <div className="bg-gradient-to-br from-ndp-blue to-[#0A006B] rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute inset-0 network-bg opacity-8 pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 bg-ndp-gold/20 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp size={24} className="text-ndp-gold" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-3">
                  Trasforma la tua presenza in referral.
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-7">
                  Profilo AI completo, ranking mensile, referral qualificati dalla rete NDP. Ogni mese la classifica premia chi lavora meglio.
                </p>
                <Link
                  href="/registrazione"
                  className="inline-flex items-center gap-2 bg-ndp-gold text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-ndp-gold-dark transition-colors text-sm mb-7"
                >
                  Diventa Professionista <ArrowRight size={14} />
                </Link>
                <ul className="space-y-2.5">
                  {['Profilo AI personalizzato', 'Ranking di merito mensile', 'Referral dalla rete NDP'].map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-sm text-white/60">
                      <CheckCircle2 size={15} className="text-ndp-gold shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CTA Manifesto ──────────────────────────────────────────────── */}
      <section className="relative bg-ndp-blue overflow-hidden py-28 px-4">
        <div className="absolute inset-0 network-bg opacity-15 pointer-events-none" />
        {/* Central glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-ndp-blue-mid/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight">
            La rete è già attiva.
          </h2>
          <p className="text-white/50 text-xl mb-10">
            1.200 professionisti. 45 capitoli.<br />
            Un&apos;AI che li conosce tutti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registrazione"
              className="inline-flex items-center justify-center gap-2 bg-white text-ndp-blue font-bold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all text-sm shadow-lg shadow-black/20"
            >
              Crea il tuo profilo <ArrowRight size={14} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/25 text-white/70 font-medium px-8 py-4 rounded-2xl hover:bg-white/8 transition-all text-sm"
            >
              Hai già un account? Accedi
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
