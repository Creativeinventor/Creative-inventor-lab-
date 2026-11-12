import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { UserProfile } from '../types/index.js';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api.js';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSubscriber: boolean;
  login: (identifier: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickSwitchDemo: (role: 'ADMIN' | 'SUBSCRIBER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (error) {
      console.warn('Session expired or invalid:', error);
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const result = await api.login(identifier, password);
      setStoredToken(result.token);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  const quickSwitchDemo = async (role: 'ADMIN' | 'SUBSCRIBER') => {
    if (role === 'ADMIN') {
      await login('admin', '123');
    } else {
      await login('CI1001', 'subscriber123');
    }
  };

  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const isSubscriber = String(user?.role || '').toLowerCase() === 'subscriber';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isSubscriber,
        login,
        logout,
        refreshUser,
        quickSwitchDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
