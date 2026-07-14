'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Award, ShieldCheck, Compass, Sparkles, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow space-y-16">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold/15 border border-gold/30 px-3 py-1 rounded-full text-gold text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Reimagining Premium Hospitality
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            LuxeStay was founded on a simple premise: travel should be inspiring, private, and uncompromising. We connect discerning global citizens with architecturally unique spaces that evoke emotion.
          </p>
        </section>

        {/* Curation Standards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center">
              <Award className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-lg font-bold text-white">150-Point Curation Check</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              We inspect every property physically. From mattress comfort and architectural integrity to private acoustics and local support availability.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Dedicated Private Support</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every guest is assigned a personal concierge upon booking to arrange private chefs, local transport, excursions, and custom grocery stocking.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
              <Compass className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Unique Architectural Gems</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              We look for geometric cabins, cliffside glass villas, and overwater structures. We celebrate spaces that embrace local geography.
            </p>
          </div>
        </section>

        {/* Narrative / Focus section */}
        <section className="glass-panel p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Only The Most Captivating Locations</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              We believe a property should do more than house a traveler; it should inspire them. Whether you seek to watch the Northern Lights through the inclined glass ceiling of a Tromsø cabin, view Maldivian marine life beneath your bedroom's glass-bottom floor, or look out over the Manhattan skyline from a sky-high wraps terrace, LuxeStay places you in the center of the world's most captivating geography.
            </p>
            <div className="flex space-x-2">
              <span className="text-xs text-gold font-bold bg-gold/10 px-3.5 py-1.5 rounded-lg border border-gold/15">Cabin Retreas</span>
              <span className="text-xs text-gold font-bold bg-gold/10 px-3.5 py-1.5 rounded-lg border border-gold/15">Cliff Mansions</span>
              <span className="text-xs text-gold font-bold bg-gold/10 px-3.5 py-1.5 rounded-lg border border-gold/15">Water Villas</span>
            </div>
          </div>
          <div className="relative h-72 w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" 
              alt="Luxury Pool Stay" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
