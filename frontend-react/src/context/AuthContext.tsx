import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { apiClient } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());

  const login = useCallback(async (password: string): Promise<boolean> => {
    const success = await apiClient.login(password);
    setIsAuthenticated(success);
    return success;
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
