'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Home' },
  { href: '/cerca', label: 'Ricerca AI', highlight: true },
  { href: '/professionisti', label: 'Professionisti' },
  { href: '/capitoli', label: 'Capitoli' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-ndp-navy flex items-center justify-center">
              <span className="text-ndp-gold font-display font-bold text-sm">N</span>
            </div>
            <div className="leading-tight">
              <span className="font-display font-bold text-ndp-navy text-lg">NDP</span>
              <span className="text-ndp-gold font-bold text-lg ml-1">reference</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  l.highlight
                    ? 'bg-ndp-navy text-white hover:bg-ndp-navy-dark'
                    : pathname === l.href
                    ? 'bg-ndp-navy/10 text-ndp-navy'
                    : 'text-gray-600 hover:text-ndp-navy hover:bg-gray-50'
                )}
              >
                {l.highlight && <Sparkles size={14} />}
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                l.highlight
                  ? 'bg-ndp-navy text-white'
                  : pathname === l.href
                  ? 'bg-ndp-navy/10 text-ndp-navy'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {l.highlight && <Sparkles size={14} />}
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
