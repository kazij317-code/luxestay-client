'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Compass, PlusCircle, Settings, LogOut, User, Sparkles, HelpCircle, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Logged out routes (min 3)
  // 1. Home (represented by logo / link)
  // 2. Explore
  // 3. About
  // 4. Contact
  
  // Logged in routes (min 5)
  // 1. Home
  // 2. Explore
  // 3. Add Stay
  // 4. Manage Stays
  // 5. About
  // 6. Contact

  const loggedInLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Add Listing', path: '/items/add', icon: PlusCircle },
    { name: 'Dashboard', path: '/items/manage', icon: Settings },
    { name: 'About', path: '/about', icon: Sparkles },
    { name: 'Contact', path: '/contact', icon: PhoneCall },
  ];

  const loggedOutLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'About', path: '/about', icon: Sparkles },
    { name: 'Contact', path: '/contact', icon: PhoneCall },
  ];

  const currentLinks = user ? loggedInLinks : loggedOutLinks;

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-gold via-amber-300 to-yellow-500 bg-clip-text text-transparent tracking-wide">
                LuxeStay
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-gold/15 text-gold border border-gold/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop User profile/CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/5 py-1.5 px-3.5 rounded-full border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-gold text-slate-dark hover:bg-gold-hover hover:scale-105 active:scale-95 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-gold/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 focus:outline-none transition-all duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 py-4 px-2 space-y-1">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-gold/15 text-gold border border-gold/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="border-t border-white/5 my-4 pt-4 px-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                    <User className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-base font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-base font-medium text-center text-gray-300 bg-white/5 border border-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-base font-semibold text-center text-slate-dark bg-gold hover:bg-gold-hover shadow-lg shadow-gold/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
