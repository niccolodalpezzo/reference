'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DemoUser } from '@/lib/types';
import { getStoredUser, saveUser, clearUser } from '@/lib/auth';

interface AuthContextValue {
  user: DemoUser | null;
  login: (user: DemoUser) => void;
  logout: () => void;
  refreshUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = (u: DemoUser) => {
    saveUser(u);
    setUser(u);
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  const refreshUser = () => {
    const stored = getStoredUser();
    setUser(stored);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
