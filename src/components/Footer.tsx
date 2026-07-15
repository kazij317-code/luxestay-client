'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full glass-panel border-t border-white/5 bg-slate-dark/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <span className="text-xl font-bold bg-gradient-to-r from-gold via-amber-300 to-yellow-500 bg-clip-text text-transparent tracking-wide">
              LuxeStay
            </span>
            <p className="text-sm text-gray-400 leading-relaxed">
              Curated luxury vacation rentals and bespoke travel experiences. Reimagining premium hospitality across the globe.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-gold/20 hover:text-gold text-gray-400 transition-all duration-200" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-gold/20 hover:text-gold text-gray-400 transition-all duration-200" aria-label="Instagram">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-gold/20 hover:text-gold text-gray-400 transition-all duration-200" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-gold/20 hover:text-gold text-gray-400 transition-all duration-200" aria-label="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Explore Stays</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explore?category=Cabins" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  Cozy Cabins
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Beachfront" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  Beachfront Villas
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Penthouses" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  Luxury Penthouses
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  All Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* User Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  About LuxeStay
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/items/add" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/items/manage" className="text-sm text-gray-400 hover:text-gold transition-colors">
                  Host Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Contact</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start space-x-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>Mujahid Nagar, Kodomtoly, Rayerbagh, Dhaka</span>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="tel:+8801712736526" className="hover:text-gold transition-colors">+8801712736526</a>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a href="mailto:mithu00781@gmail.com" className="hover:text-gold transition-colors">mithu00781@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} LuxeStay Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-gray-500">
            <Link href="/about" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link href="/about" className="hover:text-gray-400 transition-colors">Cookie Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
