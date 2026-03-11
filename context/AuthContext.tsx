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

  async function loadUserProfile(userId: string, email: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) console.error('[AuthContext] loadUserProfile:', error.message);
    if (data) setUser({ ...(data as Omit<AppUser, 'email'>), email, id: userId });
    else setUser(null);
  }

  useEffect(() => {
    // Timeout fallback: se onAuthStateChange non emette INITIAL_SESSION entro 5s
    // (es. Supabase irraggiungibile), sblocchiamo il loading per mostrare la pagina.
    const timeout = setTimeout(() => setIsLoading(false), 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        clearTimeout(timeout);
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email ?? '');
        } else {
          setUser(null);
        }
        setIsLoading(false);
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
    if (error) return { error: 'Credenziali non valide.' };
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
