import { createContext } from 'react';

export interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
