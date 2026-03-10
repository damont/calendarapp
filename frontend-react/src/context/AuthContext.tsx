import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiClient } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());
  const [user, setUser] = useState<User | null>(null);

  // On mount, validate existing token by fetching user info
  useEffect(() => {
    if (isAuthenticated) {
      apiClient.getMe().then(setUser).catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const success = await apiClient.login(email, password);
    if (success) {
      setIsAuthenticated(true);
      const me = await apiClient.getMe();
      setUser(me);
    }
    return success;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    const success = await apiClient.register(name, email, password);
    if (success) {
      setIsAuthenticated(true);
      const me = await apiClient.getMe();
      setUser(me);
    }
    return success;
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
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
