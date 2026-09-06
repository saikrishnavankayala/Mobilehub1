import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminUser } from '../types';

interface AdminContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('mobile_hub_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mobile_hub_admin_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      const data = res.data.data;
      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('mobile_hub_admin_token', data.token);
      localStorage.setItem('mobile_hub_admin_user', JSON.stringify(data.admin));
      return { success: true, message: res.data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid credentials' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('mobile_hub_admin_token');
    localStorage.removeItem('mobile_hub_admin_user');
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
