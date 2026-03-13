'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?from=${requiredRole}`);
    } else if (user.role !== requiredRole) {
      // Redirect to the correct dashboard for the user's actual role
      if (user.role === 'zone_manager') router.replace('/resp-zona');
      else router.replace('/professionisti/dashboard');
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading || !user || user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <div className="text-center">
          <Loader2 size={32} className="text-ndp-blue animate-spin mx-auto mb-3" />
          <p className="text-ndp-muted text-sm">{isLoading ? 'Caricamento...' : 'Reindirizzamento...'}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
