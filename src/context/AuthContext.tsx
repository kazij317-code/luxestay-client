'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('luxestay_user');
        const token = localStorage.getItem('luxestay_token');
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to load auth session", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Protect pages
  useEffect(() => {
    if (!loading) {
      const isProtected = pathname?.startsWith('/items/add') || pathname?.startsWith('/items/manage');
      if (isProtected && !user) {
        router.push('/login');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('luxestay_user', JSON.stringify(data.user));
        localStorage.setItem('luxestay_token', data.token);
        router.push('/items/manage');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, error: 'Network error, please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('luxestay_user', JSON.stringify(data.user));
        localStorage.setItem('luxestay_token', data.token);
        router.push('/items/manage');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error, please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('luxestay_user');
    localStorage.removeItem('luxestay_token');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
