'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Mail, Phone, MapPin, Send, CheckCircle, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitting(true);
      try {
        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            subject: subject || 'General Inquiry',
            message
          })
        });
        const data = await res.json();
        if (data.success) {
          setSubmitted(true);
          setName(user?.name || '');
          setEmail(user?.email || '');
          setSubject('');
          setMessage('');
        }
      } catch (err) {
        console.error('Failed to submit inquiry', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-12">
        {/* Header Title */}
        <section className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Connect With Concierge</h1>
          <p className="text-sm text-gray-400">Our concierge support team is available 24/7 to satisfy any request</p>
        </section>

        {/* Content Split: Details + Form */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Details side */}
          <div className="lg:col-span-1 glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white border-b border-white/5 pb-2">Direct Access</h2>
              
              <ul className="space-y-4">
                <li className="flex items-start space-x-3.5">
                  <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Office Headquarters</h4>
                    <p className="text-sm text-gray-400">100 Premium Avenue, Fifth Floor, New York, NY 10001</p>
                  </div>
                </li>

                <li className="flex items-start space-x-3.5">
                  <Phone className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Telephone Desk</h4>
                    <p className="text-sm text-gray-400">+1 (800) 555-LUXE</p>
                    <p className="text-xs text-gray-500">Toll free worldwide</p>
                  </div>
                </li>

                <li className="flex items-start space-x-3.5">
                  <Mail className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Concierge Email</h4>
                    <p className="text-sm text-gray-400">concierge@luxestay.com</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center space-x-3">
              <HelpCircle className="w-6 h-6 text-gold flex-shrink-0" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Looking to list? Navigate to the Host Dashboard to input your luxury property specs immediately.
              </p>
            </div>
          </div>

          {/* Form side */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white border-b border-white/5 pb-2">Send Private Inquiry</h2>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Inquiry Received</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Thank you for connecting. A dedicated luxury concierge has been assigned to your query and will reach out to you within 2 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-gold text-slate-dark font-bold text-xs px-4 py-2 rounded-lg transition-all"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Your Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Email Address</label>
                    <input 
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Subject</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Private chef booking for Aura Glass Cottage"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Message Inquiry</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Describe your inquiry details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                  />
                </div>

                 <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gold hover:bg-gold-hover disabled:opacity-50 text-slate-dark font-bold text-sm px-6 py-3 rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
