import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../modules/auth/AuthContext';
import { AppRouter } from '../router/AppRouter';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
