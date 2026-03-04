import { X, Check, Clock, MousePointer, Brain, Zap, Search, MessageCircle } from 'lucide-react';

const traditional = [
  { icon: Clock, text: 'Ricerca manuale per province' },
  { icon: MousePointer, text: 'Filtri complicati e interfaccia lenta' },
  { icon: X, text: 'Nessun contesto sulla qualità' },
  { icon: X, text: 'Non capisce esigenze complesse' },
  { icon: X, text: 'Risultati irrilevanti da scorrere' },
];

const ndpAI = [
  { icon: MessageCircle, text: 'Scrivi in italiano naturale' },
  { icon: Brain, text: 'L\'AI capisce il contesto preciso' },
  { icon: Check, text: 'Professionisti verificati con referral reali' },
  { icon: Zap, text: 'Risultati istantanei e pertinenti' },
  { icon: Search, text: 'Matching semantico su specialità e città' },
];

export default function FeatureCompare() {
  return (
    <section className="py-24 bg-ndp-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-ndp-blue/10 text-ndp-blue text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            La rivoluzione
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ndp-text mb-4">
            Perché l&apos;AI cambia tutto
          </h2>
          <p className="text-ndp-muted max-w-lg mx-auto">
            La ricerca tradizionale non basta più. NDP Reference porta l&apos;intelligenza
            artificiale nel cuore del networking professionale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traditional */}
          <div className="bg-white rounded-2xl p-8 border border-ndp-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <Search size={18} className="text-red-400" />
              </div>
              <div>
                <div className="font-semibold text-ndp-text">Ricerca Tradizionale</div>
                <div className="text-xs text-ndp-muted">Come funziona oggi</div>
              </div>
            </div>
            <ul className="space-y-4">
              {traditional.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <span className="text-ndp-muted text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NDP AI */}
          <div className="bg-ndp-blue rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              NUOVO
            </div>
            <div className="relative flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">NDP AI Search</div>
                <div className="text-xs text-white/60">La rivoluzione del networking</div>
              </div>
            </div>
            <ul className="space-y-4">
              {ndpAI.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon size={16} className="text-white/80 mt-0.5 shrink-0" />
                  <span className="text-white/80 text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
