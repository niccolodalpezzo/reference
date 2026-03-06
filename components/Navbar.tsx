'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Sparkles, User, LogOut, ChevronDown, MapPin, MessageSquare, UserPlus, Shield } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { getTotalUnread } from '@/lib/storage/conversations';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user?.role === 'member') {
      setUnreadCount(getTotalUnread(user.id));
    } else {
      setUnreadCount(0);
    }
  }, [user, pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  const isGuest = !user;
  const isMember = user?.role === 'member';
  const isZone = user?.role === 'zone_manager';

  const navLink = (href: string, label: string, icon: React.ReactNode, badge?: number) => (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all rounded-lg',
        pathname?.startsWith(href)
          ? 'text-ndp-blue bg-ndp-blue/5'
          : 'text-gray-600 hover:text-ndp-blue hover:bg-gray-50'
      )}
    >
      {icon}
      {label}
      {badge != null && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-ndp-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image src="/logo.svg" alt="NDP Reference" width={36} height={36} priority className="rounded-lg" />
            <div className="leading-tight hidden sm:block">
              <span className="font-display font-bold text-ndp-blue text-base tracking-tight">NDP</span>
              <span className="font-display font-normal text-ndp-muted text-base ml-1">reference</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLink('/assistente', 'Assistente', <Sparkles size={14} />)}
            {navLink('/eventi', 'Eventi', <MapPin size={14} />)}
            {isMember && navLink('/messaggi', 'Messaggi', <MessageSquare size={14} />, unreadCount)}
            {isZone && navLink('/resp-zona', 'Area Zona', <Shield size={14} />)}
          </nav>

          {/* Right: auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-ndp-border hover:border-ndp-blue/30 transition-all text-sm"
                >
                  <div className="w-6 h-6 bg-ndp-blue rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-ndp-text">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={13} className="text-ndp-muted" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-ndp-border rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-ndp-border mb-1">
                      <p className="text-xs font-semibold text-ndp-text truncate">{user.name}</p>
                      <p className="text-[10px] text-ndp-muted capitalize">{user.role.replace('_', ' ')}</p>
                      {user.zone && <p className="text-[10px] text-ndp-muted">{user.zone}</p>}
                    </div>
                    {isMember && (
                      <>
                        <Link href="/professionisti/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-ndp-text hover:bg-ndp-bg">
                          <User size={13} /> Dashboard
                        </Link>
                        <Link href="/professionisti/wizard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-ndp-text hover:bg-ndp-bg">
                          <Sparkles size={13} /> Profilo AI
                        </Link>
                        <Link href="/messaggi" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-ndp-text hover:bg-ndp-bg">
                          <MessageSquare size={13} /> Messaggi
                          {unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 rounded-full">{unreadCount}</span>}
                        </Link>
                      </>
                    )}
                    {isZone && (
                      <Link href="/resp-zona" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-ndp-text hover:bg-ndp-bg">
                        <Shield size={13} /> Dashboard Zona
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full">
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-ndp-text px-3 py-2 rounded-xl border border-ndp-border hover:border-ndp-blue/40 transition-all">
                  Accedi
                </Link>
                <Link href="/registrazione" className="flex items-center gap-1.5 bg-ndp-blue text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-ndp-blue-dark transition-all">
                  <UserPlus size={14} />
                  Registrati
                </Link>
              </div>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ndp-border bg-white px-4 py-4 space-y-1">
          <Link href="/assistente" onClick={() => setOpen(false)} className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium', pathname?.startsWith('/assistente') ? 'bg-ndp-bg text-ndp-blue' : 'text-gray-700 hover:bg-gray-50')}>
            <Sparkles size={15} /> Assistente AI
          </Link>
          <Link href="/eventi" onClick={() => setOpen(false)} className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium', pathname?.startsWith('/eventi') ? 'bg-ndp-bg text-ndp-blue' : 'text-gray-700 hover:bg-gray-50')}>
            <MapPin size={15} /> Eventi BNI
          </Link>
          {isMember && (
            <Link href="/messaggi" onClick={() => setOpen(false)} className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium', pathname?.startsWith('/messaggi') ? 'bg-ndp-bg text-ndp-blue' : 'text-gray-700 hover:bg-gray-50')}>
              <MessageSquare size={15} /> Messaggi
              {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </Link>
          )}
          {isMember && (
            <Link href="/professionisti/dashboard" onClick={() => setOpen(false)} className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium', pathname?.startsWith('/professionisti') ? 'bg-ndp-bg text-ndp-blue' : 'text-gray-700 hover:bg-gray-50')}>
              <User size={15} /> La mia area
            </Link>
          )}
          {isZone && (
            <Link href="/resp-zona" onClick={() => setOpen(false)} className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium', pathname?.startsWith('/resp-zona') ? 'bg-ndp-bg text-ndp-blue' : 'text-gray-700 hover:bg-gray-50')}>
              <Shield size={15} /> Area Zona
            </Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut size={15} /> Logout ({user.name.split(' ')[0]})
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-ndp-border">
                Accedi
              </Link>
              <Link href="/registrazione" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-ndp-blue text-white">
                <UserPlus size={15} /> Registrati
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
