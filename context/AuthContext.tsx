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
    // Supabase v2: onAuthStateChange emette INITIAL_SESSION immediatamente
    // all'iscrizione (con o senza sessione attiva), rendendo getSession() ridondante
    // e fonte di race condition. Usiamo solo onAuthStateChange come fonte unica di verità.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email ?? '');
        } else {
          setUser(null);
        }
        // setIsLoading(false) viene chiamato SEMPRE dopo ogni evento auth,
        // eliminando ogni possibilità di spinner infinito.
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
