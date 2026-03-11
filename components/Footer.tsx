import Link from 'next/link';
import { Mail, Phone, MapPin, Network } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ndp-blue text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Network size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl">
                NDP <span className="font-normal text-white/60">reference</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              La piattaforma AI-powered che rivoluziona il networking professionale.
              Trova il professionista giusto in secondi, non in ore.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs">
                Powered by AI
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs">
                Network NDP Italia
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white/40 mb-4 text-xs uppercase tracking-wider">Piattaforma</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/cerca', label: 'Ricerca AI' },
                { href: '/professionisti', label: 'Professionisti' },
                { href: '/eventi', label: 'Eventi' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white/40 mb-4 text-xs uppercase tracking-wider">Contatti</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-white/60 text-sm">
                <Mail size={14} className="shrink-0" />
                info@ndpreference.it
              </li>
              <li className="flex items-center gap-2.5 text-white/60 text-sm">
                <Phone size={14} className="shrink-0" />
                +39 02 1234 5678
              </li>
              <li className="flex items-start gap-2.5 text-white/60 text-sm">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                Via Montenapoleone 12, 20121 Milano
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © 2026 NDP Reference. Tutti i diritti riservati.
          </p>
          <p className="text-white/40 text-xs">
            Una demo innovativa per il futuro del networking professionale.
          </p>
        </div>
      </div>
    </footer>
  );
}
