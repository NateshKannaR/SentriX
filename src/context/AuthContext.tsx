import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, UserRole } from '../types';

export type PortalType = 'commander' | 'citizen';

interface AuthContextType {
  session: UserSession & { portalType: PortalType };
  loginCommander: (email?: string, password?: string, badgeId?: string) => boolean;
  loginCitizen: (name?: string, phoneOrEmail?: string, bloodGroup?: string) => boolean;
  login: (email?: string, password?: string) => boolean; // backward compatibility alias
  logout: () => void;
  switchPortal: (portal: PortalType) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isCommander: boolean;
  isCitizen: boolean;
}

const AUTH_STORAGE_KEY = 'sentrix_auth_session_v3';
const THEME_STORAGE_KEY = 'sentrix_theme';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession & { portalType: PortalType }>(() => {
    try {
      const stored =
        localStorage.getItem(AUTH_STORAGE_KEY) ||
        localStorage.getItem('sentrix_auth_session') ||
        localStorage.getItem('sentinel_360_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          return {
            ...parsed,
            portalType: parsed.portalType || (parsed.user.role === 'Citizen' ? 'citizen' : 'commander'),
          };
        }
      }
    } catch {
      // ignore
    }
    // Default session for Hackathon Commander evaluation
    return {
      isAuthenticated: true,
      portalType: 'commander',
      user: {
        id: 'usr-chief-01',
        email: 'commander.rao@sentrix.gov',
        name: 'Chief Aditi Rao',
        role: 'Commander',
        badge: 'DISPATCH-CMD-01',
        phone: '+91 7806869597',
      },
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('sentinel_360_theme');
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

  const loginCommander = (
    email = 'commander.rao@sentrix.gov',
    _password = '',
    badgeId = 'DISPATCH-CMD-01'
  ): boolean => {
    const newSession: UserSession & { portalType: PortalType } = {
      isAuthenticated: true,
      portalType: 'commander',
      user: {
        id: 'usr-chief-01',
        email: email || 'commander.rao@sentrix.gov',
        name: email.includes('admin') ? 'Administrator General' : 'Chief Aditi Rao',
        role: 'Commander',
        badge: badgeId || 'DISPATCH-CMD-01',
        phone: '+91 7806869597',
      },
    };
    setSession(newSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    return true;
  };

  const loginCitizen = (
    name = 'Natesh Kanna',
    phoneOrEmail = '+91 7806869597',
    bloodGroup = 'O+'
  ): boolean => {
    const isPhone = /^\+?[0-9\s-]+$/.test(phoneOrEmail);
    const newSession: UserSession & { portalType: PortalType } = {
      isAuthenticated: true,
      portalType: 'citizen',
      user: {
        id: `usr-citizen-${Date.now().toString(36)}`,
        email: isPhone ? `${phoneOrEmail.replace(/\D/g, '')}@citizen.sentrix.in` : phoneOrEmail,
        name: name || 'Verified Citizen Reporter',
        role: 'Citizen',
        badge: 'CITIZEN-VERIFIED',
        phone: isPhone ? phoneOrEmail : '+91 7806869597',
        bloodGroup: bloodGroup || 'O+',
      },
    };
    setSession(newSession);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
    return true;
  };

  const login = (email = 'commander.rao@sentrix.gov', password = ''): boolean => {
    if (email.includes('citizen') || email.includes('+91') || email.includes('user')) {
      return loginCitizen('Verified Citizen', email);
    }
    return loginCommander(email, password);
  };

  const logout = () => {
    const emptySession: UserSession & { portalType: PortalType } = {
      isAuthenticated: false,
      portalType: 'citizen',
      user: null,
    };
    setSession(emptySession);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchPortal = (portal: PortalType) => {
    if (portal === 'commander') {
      loginCommander();
    } else {
      loginCitizen();
    }
  };

  const isCommander = session.isAuthenticated && session.portalType === 'commander';
  const isCitizen = session.isAuthenticated && session.portalType === 'citizen';

  return (
    <AuthContext.Provider
      value={{
        session,
        loginCommander,
        loginCitizen,
        login,
        logout,
        switchPortal,
        theme,
        toggleTheme,
        isCommander,
        isCitizen,
      }}
    >
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
