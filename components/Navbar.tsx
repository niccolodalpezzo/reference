'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Network } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Home' },
  { href: '/professionisti', label: 'Professionisti' },
  { href: '/capitoli', label: 'Capitoli' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-ndp-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-ndp-blue flex items-center justify-center">
              <Network size={16} className="text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-display font-bold text-ndp-blue text-lg tracking-tight">NDP</span>
              <span className="font-display font-normal text-ndp-muted text-lg ml-1">reference</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'px-4 py-2 text-sm font-medium transition-all',
                  pathname === l.href
                    ? 'border-b-2 border-ndp-blue text-ndp-blue'
                    : 'text-gray-600 hover:text-ndp-blue'
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/cerca"
              className="ml-2 border border-ndp-blue text-ndp-blue hover:bg-ndp-blue hover:text-white rounded-lg px-4 py-1.5 text-sm font-medium transition-all"
            >
              Ricerca AI
            </Link>
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
        <div className="md:hidden border-t border-ndp-border bg-white px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                pathname === l.href
                  ? 'bg-ndp-bg text-ndp-blue'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/cerca"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-ndp-blue text-white"
          >
            Ricerca AI
          </Link>
        </div>
      )}
    </header>
  );
}
