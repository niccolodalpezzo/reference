'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'zone_manager';
  city: string | null;
  province: string | null;
  region: string | null;
  capoluogo: string | null;
  zone: string | null;
  zone_manager_id: string | null;
  professional_id: string | null;
  registered_at: string;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => ({ error: null }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  async function loadUserProfile(userId: string, email: string, retries = 2): Promise<void> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 = "Row not found" — profile not yet created (mid-registration flow)
      if (error.code === 'PGRST116') {
        setUser(null);
        return;
      }
      // Retry on transient errors (network, timeout, RLS timing)
      if (retries > 0) {
        console.warn(`[AuthContext] loadUserProfile retry (${retries} left):`, error.message);
        await new Promise((r) => setTimeout(r, 500));
        return loadUserProfile(userId, email, retries - 1);
      }
      console.error('[AuthContext] loadUserProfile failed after retries:', error.message);
      setUser(null);
      return;
    }

    if (data) setUser({ ...(data as Omit<AppUser, 'email'>), email, id: userId });
    else setUser(null);
  }

  useEffect(() => {
    // Fallback: if Supabase never emits INITIAL_SESSION (unreachable, stale token, etc.)
    // unblock loading after 3s so the login page is always reachable.
    const timeout = setTimeout(() => {
      setUser(null);
      setIsLoading(false);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        clearTimeout(timeout);
        try {
          if (session?.user) {
            await loadUserProfile(session.user.id, session.user.email ?? '');
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('[AuthContext] onAuthStateChange error:', err);
          // Do NOT signOut or clear user on DB/network errors — only on actual
          // auth failures. Supabase handles invalid JWT internally.
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Email non ancora confermata. Controlla la tua casella di posta (anche lo spam).' };
      }
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email o password non corretti.' };
      }
      return { error: error.message };
    }
    return { error: null };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function refreshUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await loadUserProfile(authUser.id, authUser.email ?? '');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
