import { createContext } from 'react';
import { type AuthenticatedUser } from './authService';

export interface AuthState {
  accessToken: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  setSession: (token: string, user: AuthenticatedUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
