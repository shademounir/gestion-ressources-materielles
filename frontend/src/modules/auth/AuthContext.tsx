import { useMemo, useState } from 'react';
import { AuthContext, type AuthState } from './auth-context';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const value = useMemo<AuthState>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      setAccessToken,
      logout: () => setAccessToken(null),
    }),
    [accessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
