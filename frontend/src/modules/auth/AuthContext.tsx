import { useMemo, useState } from 'react';
import { AuthContext, type AuthState } from './auth-context';
import { type AuthenticatedUser } from './authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const value = useMemo<AuthState>(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
      setAccessToken: (token) => {
        setAccessToken(token);

        if (!token) {
          setUser(null);
        }
      },
      setSession: (token, authenticatedUser) => {
        setAccessToken(token);
        setUser(authenticatedUser);
      },
      logout: () => {
        setAccessToken(null);
        setUser(null);
      },
    }),
    [accessToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
