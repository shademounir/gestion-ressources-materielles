import { useMemo, useState } from 'react';
import { AuthContext, type AuthState } from './auth-context';
import { type AuthenticatedUser } from './authService';

const authStorageKey = 'grm.auth.session';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface StoredAuthSession {
  accessToken: string;
  user: AuthenticatedUser;
  expiresAt: number;
}

function readStoredSession(): StoredAuthSession | null {
  try {
    const storedSession = window.sessionStorage.getItem(authStorageKey);

    if (!storedSession) {
      return null;
    }

    const parsedSession = JSON.parse(storedSession) as Partial<StoredAuthSession>;

    if (
      !parsedSession.accessToken ||
      !parsedSession.user ||
      !parsedSession.expiresAt ||
      parsedSession.expiresAt <= Date.now()
    ) {
      writeStoredSession(null);
      return null;
    }

    return parsedSession as StoredAuthSession;
  } catch {
    window.sessionStorage.removeItem(authStorageKey);
    return null;
  }
}

function writeStoredSession(session: StoredAuthSession | null) {
  if (!session) {
    window.sessionStorage.removeItem(authStorageKey);
    return;
  }

  window.sessionStorage.setItem(authStorageKey, JSON.stringify(session));
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSessionState] = useState<StoredAuthSession | null>(() => readStoredSession());

  const value = useMemo<AuthState>(
    () => ({
      accessToken: session?.accessToken ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      setAccessToken: (token) => {
        if (!token) {
          writeStoredSession(null);
          setSessionState(null);
          return;
        }

        setSessionState((currentSession) => {
          if (!currentSession) {
            return null;
          }

          const updatedSession = {
            ...currentSession,
            accessToken: token,
          };
          writeStoredSession(updatedSession);
          return updatedSession;
        });
      },
      setSession: (token, authenticatedUser, expiresIn) => {
        const nextSession = {
          accessToken: token,
          expiresAt: Date.now() + expiresIn * 1000,
          user: authenticatedUser,
        };
        writeStoredSession(nextSession);
        setSessionState(nextSession);
      },
      logout: () => {
        writeStoredSession(null);
        setSessionState(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
