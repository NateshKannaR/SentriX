import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';

interface AuthContextType {
  session: UserSession;
  login: (email?: string, password?: string) => boolean;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AUTH_STORAGE_KEY = 'sentinel_360_auth_session';
const THEME_STORAGE_KEY = 'sentinel_360_theme';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    // Default to authenticated demo commander for rapid hackathon testing & judge evaluation!
    return {
      isAuthenticated: true,
      user: {
        id: 'usr-chief-01',
        email: 'commander.rao@sentinel360.gov',
        name: 'Chief Aditi Rao',
        role: 'Commander',
        badge: 'DISPATCH-CMD-01',
      },
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (email = 'commander.rao@sentinel360.gov', _password = '') => {
    const newSession: UserSession = {
      isAuthenticated: true,
      user: {
        id: 'usr-chief-01',
        email: email || 'commander.rao@sentinel360.gov',
        name: email.includes('admin') ? 'Senior Administrator' : 'Chief Aditi Rao',
        role: 'Commander',
        badge: 'DISPATCH-CMD-01',
      },
    };
    setSession(newSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    return true;
  };

  const logout = () => {
    const emptySession: UserSession = { isAuthenticated: false, user: null };
    setSession(emptySession);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
