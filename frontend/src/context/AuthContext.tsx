import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { userService } from '@/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = 'shopkart_token';
const USER_KEY = 'shopkart_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (raw && token) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    if (u) {
      if (u.token) {
        localStorage.setItem(TOKEN_KEY, u.token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      setUser(u);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const res = await userService.login(email, password);
        persist({ ...res.user, token: res.token });
      },
      register: async (name, email, password) => {
        const res = await userService.register(name, email, password);
        persist({ ...res.user, token: res.token });
      },
      logout: () => persist(null),
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
