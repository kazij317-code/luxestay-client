'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lock, Mail, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoType: 'alex' | 'elena') => {
    if (demoType === 'alex') {
      setEmail('alex@luxestay.com');
      setPassword('demo1234');
    } else {
      setEmail('elena@luxestay.com');
      setPassword('demo1234');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm text-gray-400">Access your private account panel</p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold-hover hover:scale-102 active:scale-98 text-slate-dark font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-gold/10 mt-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
              Quick Demo Auto-Fill
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('alex')}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-gold/10 hover:text-gold text-xs font-semibold text-gray-300 border border-white/5 hover:border-gold/20 transition-all cursor-pointer"
              >
                Host Alexander
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('elena')}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-gold/10 hover:text-gold text-xs font-semibold text-gray-300 border border-white/5 hover:border-gold/20 transition-all cursor-pointer"
              >
                Host Elena
              </button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-gold hover:text-gold-hover font-semibold underline underline-offset-4">
              Register Here
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
