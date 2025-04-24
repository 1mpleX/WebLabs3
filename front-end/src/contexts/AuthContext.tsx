import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import axiosInstance from '../api/axios';
import { removeTokens, setTokens } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Проверка валидности токена и получение данных пользователя
      axiosInstance.get('/auth/me')
        .then(response => {
          setUser(response.data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          removeTokens();
          setIsAuthenticated(false);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;
    setTokens(accessToken, refreshToken);
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (name: string, email: string, password: string) => {
    await axiosInstance.post('/auth/register', { name, email, password });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
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