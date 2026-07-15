'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Stay } from '@/data/db';
import { 
  Sparkles, ShieldCheck, Compass, ArrowRight, Star, 
  MapPin, Gift, HelpCircle, ChevronDown, CheckCircle,
  TrendingUp, Award, Users, Globe2, Mail
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

const CHART_DATA = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 5800 },
  { month: 'Mar', revenue: 8400 },
  { month: 'Apr', revenue: 7900 },
  { month: 'May', revenue: 11200 },
  { month: 'Jun', revenue: 14800 },
  { month: 'Jul', revenue: 19500 },
];

const TESTIMONIALS = [
  {
    quote: "LuxeStay turned our honeymoon into an unforgettable dream. The Aura Cottage was pure magic, isolated from the world with 5-star concierge service.",
    author: "Charlotte & James Miller",
    location: "London, UK",
    stay: "Aura Glass Cottage",
    rating: 5
  },
  {
    quote: "As a host, the platform has been exceptional. The caliber of guests, the ease of payout, and the support dashboard have helped me scale my listings.",
    author: "Alexander Vane",
    location: "Oregon, USA",
    stay: "LuxeStay Host",
    rating: 5
  },
  {
    quote: "The reef-access beachfront villa in the Maldives was spectacular. Everything from the private boat transfer to the private chef exceeded expectations.",
    author: "Siddharth Mehta",
    location: "Mumbai, India",
    stay: "Vela Beachfront Villa",
    rating: 5
  }
];

const FAQS = [
  {
    q: "How are properties vetted on LuxeStay?",
    a: "Every home listed on LuxeStay undergoes a comprehensive 150-point inspection covering architectural integrity, amenities, premium bedding quality, and local connectivity to ensure an unparalleled guest experience."
  },
  {
    q: "What is the LuxeStay Concierge Service?",
    a: "Our concierge service is available 24/7. Once your booking is confirmed, your personal concierge can coordinate airport transfers, private chefs, custom excursions, spa bookings, and grocery stocking before your arrival."
  },
  {
    q: "Are the airport transfers and private chefs included?",
    a: "Airport transfers are complimentary for select Tier-1 properties (e.g. Vela Beachfront Villa). Custom experiences, spa services, and private chefs can be added to any stay during or after checkout via your host or concierge."
  },
  {
    q: "How do I list my property on LuxeStay?",
    a: "If you own a premium, architecturally unique stay, you can register, click 'Add Listing' in the navbar, and submit details. Our curation board reviews submissions within 48 hours before publishing them to the public explorer."
  }
];

export default function HomePage() {
  const router = useRouter();
  const [featuredStays, setFeaturedStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hero Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Testimonial State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    async function fetchStays() {
      try {
        const res = await fetch('/api/stays?limit=100');
        const data = await res.json();
        if (data.success) {
          const featured = data.data.filter((s: Stay) => s.featured === 'Featured');
          setFeaturedStays(featured);
        }
      } catch (err) {
        console.error("Error fetching stays for homepage", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStays();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/explore?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      try {
        const res = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newsletterEmail })
        });
        const data = await res.json();
        if (data.success) {
          setSubscribed(true);
          setNewsletterEmail('');
        }
      } catch (err) {
        console.error("Failed to subscribe newsletter", err);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />

      {/* SECTION 1: HERO SECTION (60-70% height) */}
      <header className="relative w-full h-[65vh] flex items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-dark/30 via-slate-dark/85 to-slate-dark" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-gold/15 border border-gold/30 px-3 py-1.5 rounded-full text-gold text-xs font-semibold tracking-wider uppercase mb-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Collection of Curation</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Bespoke Stays for the <br />
            <span className="bg-gradient-to-r from-gold via-amber-200 to-yellow-500 bg-clip-text text-transparent">
              Discerning Traveler
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            Explore architecturally unique cabins, beachfront villas, and luxury penthouses with 24/7 dedicated concierge service.
          </p>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mt-8 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-2 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-white/5">
              <MapPin className="w-5 h-5 text-gold mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Where would you like to escape?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-gray-900 dark:text-white text-sm w-full focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center px-4 py-2">
              <Compass className="w-5 h-5 text-gold mr-3 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none text-gray-900 dark:text-white text-sm w-full focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">All Categories</option>
                <option value="Cabins" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Cabins</option>
                <option value="Beachfront" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Beachfront</option>
                <option value="Penthouses" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Penthouses</option>
                <option value="Villas" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Villas</option>
                <option value="Treehouses" className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">Treehouses</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-gold hover:bg-gold-hover hover:scale-105 active:scale-95 text-slate-dark font-bold text-sm px-8 py-3 rounded-xl sm:rounded-full transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-gold/20 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* SECTION 2: FEATURED CATEGORIES CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {['All', 'Cabins', 'Beachfront', 'Penthouses', 'Villas', 'Treehouses'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                router.push(`/explore?category=${cat}`);
              }}
              className="px-5 py-3 rounded-2xl glass-card text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 hover:border-gold/30 hover:bg-gold/5 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>{cat === 'All' ? 'Explore All' : cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: CORE HIGHLIGHTS & DEALS (Listing Card Section Preview) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-xs font-bold text-gold tracking-widest uppercase">Curated Selection</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">Special Stay Highlights</h3>
          </div>
          <Link 
            href="/explore" 
            className="flex items-center space-x-1.5 text-sm text-gold hover:text-gold-hover transition-colors font-semibold group"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : featuredStays.length > 0 ? (
            featuredStays.map((stay) => (
              <PropertyCard
                key={stay.id}
                id={stay.id}
                title={stay.title}
                shortDescription={stay.shortDescription}
                price={stay.price}
                rating={stay.rating}
                location={stay.location}
                image={stay.image}
                category={stay.category}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-400 text-sm">No special stay highlights featured at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 4: PLATFORM STATISTICS */}
      <section className="w-full bg-slate-950/40 py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-gold tracking-tight">$2.4M+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-widest">Host Earnings</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-gold tracking-tight">45,000+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-widest">Nights Booked</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-gold tracking-tight">4.96 / 5</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-widest">Average Rating</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-gold tracking-tight">120+</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-widest">Destinations</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SERVICES & FEATURES (Why Us) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <h2 className="text-xs font-bold text-gold tracking-widest uppercase">The LuxeStay Standard</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">Uncompromising Quality & Service</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center">
              <Award className="w-6 h-6 text-gold" />
            </div>
            <h4 className="text-xl font-bold text-white">Vetted Premium Standard</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every listing undergoes rigorous physical inspection. We verify architectural excellence, high-end linens, and smart security features.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-white">Complete Safety & Support</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Travel securely with secure checkout, fully verified hosts, private property barriers, and 24/7 emergency response service.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold text-white">24/7 Private Concierge</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              From personal private chefs and local yacht charters to customized destination itineraries, our luxury concierge satisfies any request.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: HOST DASHBOARD REVENUE PREVIEW (Recharts Chart Integration) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gold/15 border border-gold/20 px-3 py-1 rounded-full text-gold text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hosting on LuxeStay</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Unlock the Revenue Potential of Your Unique Space
            </h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
              Our hosts earn up to 4x the industry average by listing their properties to our exclusive, high-net-worth traveler network. Add your property, set pricing, view booking requests, and watch your monthly host revenue compound.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/items/add" 
                className="bg-gold hover:bg-gold-hover text-slate-dark font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
              >
                List Your Property
              </Link>
              <Link 
                href="/about" 
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all"
              >
                Learn Host Benefits
              </Link>
            </div>
          </div>

          {/* Recharts Graphical Dashboard Mock */}
          <div className="glass-panel bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold">Average Host Yield</span>
                <h4 className="text-2xl font-bold text-white mt-0.5">$19,500 <span className="text-xs text-emerald-400 font-medium">+46% YoY</span></h4>
              </div>
              <span className="text-xs text-gold font-medium bg-gold/15 py-1 px-3 rounded-full border border-gold/20">Monthly Analytics</span>
            </div>
            
            {/* Recharts Area Chart */}
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-4 left-6 text-9xl text-gold/5 font-serif select-none pointer-events-none">“</div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex justify-center space-x-1">
              {Array.from({ length: TESTIMONIALS[currentTestimonial].rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-gold text-gold" />
              ))}
            </div>
            
            <p className="text-xl sm:text-2xl text-white font-medium italic leading-relaxed">
              "{TESTIMONIALS[currentTestimonial].quote}"
            </p>
            
            <div>
              <h4 className="text-base font-bold text-gold">{TESTIMONIALS[currentTestimonial].author}</h4>
              <p className="text-xs text-gray-400">{TESTIMONIALS[currentTestimonial].location} • Verified Stay ({TESTIMONIALS[currentTestimonial].stay})</p>
            </div>

            {/* Carousel navigation controls */}
            <div className="flex justify-center space-x-2 pt-4">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentTestimonial === idx ? 'bg-gold w-6' : 'bg-white/20'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQ ACCORDION SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <HelpCircle className="w-10 h-10 text-gold mx-auto mb-3" />
          <h3 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h3>
          <p className="text-sm text-gray-400 mt-2">Everything you need to know about booking with LuxeStay.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="glass-panel rounded-2xl overflow-hidden border border-white/5 transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-white font-bold text-sm sm:text-base hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gold transform transition-transform duration-300 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {openFaq === idx && (
                <div className="p-5 pt-0 text-sm text-gray-400 border-t border-white/5 bg-slate-900/10 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: NEWSLETTER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-r from-slate-dark via-slate-950 to-slate-dark">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
            <Mail className="w-10 h-10 text-gold mx-auto mb-2" />
            <h3 className="text-2xl sm:text-3xl font-black text-white">Subscribe to The Curation</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Join our exclusive journal. Receive weekly updates on newly inspected luxury properties, discount alerts, and curated destination guides.
            </p>
            
            {subscribed ? (
              <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/20 px-6 py-3.5 rounded-2xl text-emerald-400 text-sm font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>You have been subscribed successfully! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 mt-4">
                <input
                  type="email"
                  required
                  placeholder="Enter your private email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-grow glass-input px-5 py-3.5 rounded-xl text-sm"
                />
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-hover text-slate-dark font-bold text-sm px-8 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Join Curation
                </button>
              </form>
            )}
            
            <p className="text-xs text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
