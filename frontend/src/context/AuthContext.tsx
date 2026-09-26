import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('repomind_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('repomind_token');
      if (savedToken) {
        try {
          const res = await authApi.verify();
          setUser({
            user_id: res.user_id,
            name: res.name,
            email: res.email,
            role: 'ADMIN',
            created_at: new Date().toISOString(),
          });
        } catch {
          // Token is invalid or expired — clear it
          localStorage.removeItem('repomind_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // No token — unauthenticated, show nothing
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    setToken(res.access_token);
    setUser({
      user_id: res.user_id,
      name: res.name,
      email: res.email,
      role: 'ADMIN',
      created_at: new Date().toISOString(),
    });
  };

  const register = async (name: string, email: string, pass: string) => {
    await authApi.register(name, email, pass);
    await login(email, pass);
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
