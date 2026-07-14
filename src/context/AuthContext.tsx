'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, image?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Listen to session changes or fetch session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: (session.user as any).role || 'user',
            image: session.user.image || undefined,
          });
          const tokenRes = await authClient.token();
          const token = tokenRes.data?.token || '';
          localStorage.setItem('luxestay_token', token);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to load auth session", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
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
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message || 'Invalid credentials' };
      }

      if (data?.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: (data.user as any).role || 'user',
          image: data.user.image || undefined,
        });
        
        // Better Auth sets session cookie, but let's store a token in localStorage if the Express backend needs it.
        // The token plugin in Better Auth stores JWT, we can fetch it via authClient.token() or it's standard in cookies.
        // Wait, since Express backend reads Bearer token from headers, let's fetch the JWT token:
        const tokenRes = await authClient.token();
        const token = tokenRes.data?.token || '';
        localStorage.setItem('luxestay_token', token);
        localStorage.setItem('luxestay_user', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: (data.user as any).role || 'user',
          image: data.user.image || undefined,
        }));

        router.push('/items/manage');
        return { success: true };
      }
      return { success: false, error: 'Sign in failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error, please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string, image?: string, role?: string) => {
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        image,
        role: role || 'user',
      });

      if (error) {
        return { success: false, error: error.message || 'Registration failed' };
      }

      if (data?.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: (data.user as any).role || 'user',
          image: data.user.image || undefined,
        });

        const tokenRes = await authClient.token();
        const token = tokenRes.data?.token || '';
        localStorage.setItem('luxestay_token', token);
        localStorage.setItem('luxestay_user', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: (data.user as any).role || 'user',
          image: data.user.image || undefined,
        }));

        router.push('/items/manage');
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error, please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Signout error", err);
    }
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
