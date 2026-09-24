import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto, loginApi, registerApi, fetchMeApi, LoginPayload, RegisterPayload } from '../api/auth';

interface AuthContextType {
  token: string | null;
  user: UserDto | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('petsafe_jwt_token'));
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('petsafe_jwt_token');
    if (savedToken) {
      try {
        const userProfile = await fetchMeApi();
        setUser(userProfile);
        setToken(savedToken);
      } catch (err) {
        console.warn('Session expired or invalid JWT token.');
        localStorage.removeItem('petsafe_jwt_token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (data: LoginPayload) => {
    setLoading(true);
    try {
      const res = await loginApi(data);
      localStorage.setItem('petsafe_jwt_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterPayload) => {
    setLoading(true);
    try {
      const res = await registerApi(data);
      localStorage.setItem('petsafe_jwt_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('petsafe_jwt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
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
