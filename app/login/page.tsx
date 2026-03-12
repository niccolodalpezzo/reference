'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // If auth bootstrap takes too long, force-render the form after 2s
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'zone_manager') router.replace('/resp-zona');
      else router.replace('/professionisti/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: loginError } = await login(email, password);
    if (loginError) setError(loginError);
    setSubmitting(false);
  };

  // Show loader only while auth is bootstrapping AND we haven't hit the timeout
  if (isLoading && !forceShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <Loader2 size={32} className="text-ndp-blue animate-spin" />
      </div>
    );
  }

  // If auth resolved and user is logged in, wait for redirect (avoid form flash)
  if (!isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <Loader2 size={32} className="text-ndp-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ndp-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.svg" alt="NDP Reference" width={80} height={80} priority />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-ndp-border p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-ndp-text mb-1">Accedi</h1>
            <p className="text-ndp-muted text-sm">
              {from === 'zone_manager'
                ? 'Accedi come Responsabile di Zona per continuare.'
                : from === 'member'
                ? 'Accedi come Professionista per continuare.'
                : 'Entra nella tua area riservata.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ndp-text mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tua@email.it"
                required
                className="w-full px-4 py-2.5 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ndp-text mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-10 border border-ndp-border rounded-xl text-sm focus:outline-none focus:border-ndp-blue transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ndp-muted hover:text-ndp-text">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full bg-ndp-blue text-white font-bold py-3 rounded-xl text-sm hover:bg-ndp-blue-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Accedi
            </button>
          </form>

          <p className="text-center text-xs text-ndp-muted mt-6">
            Non hai un account?{' '}
            <Link href="/registrazione" className="text-ndp-blue font-medium hover:underline">Registrati</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={32} className="text-ndp-blue animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
