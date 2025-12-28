import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserSettings } from '../types';

interface AuthContextType {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  addPaymentMethod: (method: string) => void;
  removePaymentMethod: (method: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('subtracker_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('subtracker_user', JSON.stringify(user));
    }
  }, [user]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const mockUser: User = {
      id: 'google-12345',
      name: '김개발',
      email: 'dev.kim@gmail.com',
      avatar_url: 'https://ui-avatars.com/api/?name=%EA%B9%80+%EA%B0%9C%EB%B0%9C&background=3B82F6&color=fff&rounded=true',
      paymentMethods: ['현대카드', '카카오페이', '토스', '신한카드'],
      settings: {
        currency: 'KRW',
        language: 'ko',
        notifications: true
      }
    };

    setUser(mockUser);
    localStorage.setItem('subtracker_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('subtracker_user');
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (user) {
      setUser({
        ...user,
        settings: { ...user.settings, ...newSettings }
      });
    }
  };

  const addPaymentMethod = (method: string) => {
    if (user && !user.paymentMethods.includes(method)) {
      setUser({
        ...user,
        paymentMethods: [...user.paymentMethods, method]
      });
    }
  };

  const removePaymentMethod = (method: string) => {
    if (user) {
      setUser({
        ...user,
        paymentMethods: user.paymentMethods.filter(m => m !== method)
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, updateSettings, addPaymentMethod, removePaymentMethod, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};