import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { login as apiLogin, logout as apiLogout, me as apiMe } from '../api/endpoints';

interface AuthState {
  token: string | null;
  ready: boolean;
  admin: any;
}

interface AuthCtx extends AuthState {
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('admin_token'),
  );
  const [admin, setAdmin] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const me = await apiMe();
        if (!cancelled) setAdmin(me);
      } catch {
        if (!cancelled) {
          localStorage.removeItem('admin_token');
          setToken(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const signIn = useCallback(async (username: string, password: string) => {
    const t = await apiLogin(username, password);
    localStorage.setItem('admin_token', t);
    setToken(t);
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <Ctx.Provider value={{ token, admin, ready, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
