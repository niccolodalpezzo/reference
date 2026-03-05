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
    if (!isLoading && (!user || user.role !== requiredRole)) {
      router.replace(`/login?from=${requiredRole}`);
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <div className="text-center">
          <Loader2 size={32} className="text-ndp-blue animate-spin mx-auto mb-3" />
          <p className="text-ndp-muted text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ndp-bg">
        <div className="text-center">
          <Loader2 size={32} className="text-ndp-blue animate-spin mx-auto mb-3" />
          <p className="text-ndp-muted text-sm">Reindirizzamento...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
