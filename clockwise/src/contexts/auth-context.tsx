import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Employee } from '../types';
import type { BlocksOidcUserInfo } from '@seliseblocks/client';
import { fetchSessionClaims, startLogin, performLogout } from '../lib/blocks/auth';

interface AuthContextType {
  user: Employee | null;
  claims: BlocksOidcUserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapClaimsToEmployee(claims: BlocksOidcUserInfo): Employee {
  const sub = (claims.sub as string) || 'user';
  const email = (claims.email as string) || '';
  const name =
    (claims.name as string) ||
    (email ? email.split('@')[0].replace(/[._-]/g, ' ') : 'Employee');

  // Capitalize name words
  const formattedName = name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: sub,
    name: formattedName,
    email,
    employeeId: `EMP-${sub.slice(0, 4).toUpperCase()}`,
    department: 'Engineering',
    position: 'Team Member',
    avatar: (claims.picture as string) || undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState<BlocksOidcUserInfo | null>(null);
  const [user, setUser] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const sessionClaims = await fetchSessionClaims();
      if (sessionClaims) {
        setClaims(sessionClaims);
        setUser(mapClaimsToEmployee(sessionClaims));
      } else {
        setClaims(null);
        setUser(null);
      }
    } catch {
      setClaims(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Refresh when tab gains focus
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Periodic check every 5 minutes
    const interval = setInterval(refresh, 5 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(interval);
    };
  }, [refresh]);

  const login = useCallback(async (returnTo?: string) => {
    await startLogin(returnTo);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    await performLogout();
    setClaims(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        claims,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
