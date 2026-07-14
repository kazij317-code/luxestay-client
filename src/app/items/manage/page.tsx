'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Stay } from '@/data/db';
import { 
  Trash2, Eye, PlusCircle, Compass, Settings, 
  MapPin, DollarSign, Star, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function ManageStaysPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stays, setStays] = useState<Stay[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Fetch host properties
  async function loadHostStays() {
    setFetching(true);
    try {
      const res = await fetch('/api/stays');
      const data = await res.json();
      if (data.success && user) {
        // Filter stays owned by current host
        const userStays = data.data.filter((s: Stay) => s.hostId === user.id);
        setStays(userStays);
      }
    } catch (err) {
      setError('Failed to fetch dashboard properties.');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadHostStays();
    }
  }, [user, loading, router]);

  const handleDelete = async (stayId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(stayId);
    setError('');

    try {
      const token = localStorage.getItem('luxestay_token');
      const res = await fetch(`/api/stays/${stayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStays(prev => prev.filter(s => s.id !== stayId));
      } else {
        setError(data.error || 'Failed to delete listing');
      }
    } catch (err) {
      setError('Failed to delete stay, please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-dark">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-gold">
          <div className="animate-pulse font-bold">Verifying host session...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
              <Settings className="w-7 h-7 text-gold" />
              <span>Host Dashboard</span>
            </h1>
            <p className="text-sm text-gray-400">
              Welcome back, <span className="text-gold font-bold">{user.name}</span>. Manage your published listings below.
            </p>
          </div>
          
          <Link
            href="/items/add"
            className="flex items-center space-x-2 bg-gold hover:bg-gold-hover text-slate-dark font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-gold/10 hover:scale-105 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Stay</span>
          </Link>
        </div>

        {error && (
          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Listings Display */}
        {fetching ? (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <RefreshCw className="w-8 h-8 text-gold mx-auto animate-spin" />
            <div className="text-sm font-semibold">Updating dashboard properties...</div>
          </div>
        ) : stays.length > 0 ? (
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Property</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {stays.map((stay) => (
                    <tr key={stay.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Image + Title */}
                      <td className="py-4 px-6 flex items-center space-x-4">
                        <img 
                          src={stay.image} 
                          alt={stay.title}
                          className="w-12 h-12 rounded-lg object-cover border border-white/5 flex-shrink-0"
                        />
                        <span className="font-bold text-white max-w-[200px] truncate">{stay.title}</span>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 text-gray-300">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-gold" />
                          <span>{stay.location}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        <span className="bg-white/5 text-gold border border-gold/10 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {stay.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-white">
                        ${stay.price} <span className="text-[10px] text-gray-500">/ night</span>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          <span className="font-bold text-gray-200">{stay.rating.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/stays/${stay.id}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-gold/15 hover:text-gold text-gray-400 transition-colors border border-white/5"
                            title="View Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            disabled={deletingId === stay.id}
                            onClick={() => handleDelete(stay.id)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20 disabled:opacity-50 cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {stays.map((stay) => (
                <div key={stay.id} className="bg-slate-900/60 p-4 rounded-xl space-y-4 border border-white/5">
                  <div className="flex space-x-3">
                    <img 
                      src={stay.image} 
                      alt={stay.title}
                      className="w-16 h-16 rounded-lg object-cover border border-white/5"
                    />
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{stay.title}</h4>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3 text-gold" />
                        <span>{stay.location}</span>
                      </div>
                      <span className="inline-block bg-white/5 text-gold border border-gold/10 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {stay.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <div>
                      <span className="text-sm font-bold text-white">${stay.price}</span>
                      <span className="text-[10px] text-gray-500"> / night</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/stays/${stay.id}`}
                        className="p-2 rounded-lg bg-white/5 text-gray-300 border border-white/5 text-xs font-semibold"
                      >
                        View
                      </Link>
                      <button
                        disabled={deletingId === stay.id}
                        onClick={() => handleDelete(stay.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold cursor-pointer"
                      >
                        {deletingId === stay.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-3xl space-y-4">
            <Compass className="w-16 h-16 text-gold/20 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Listings Published Yet</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              You haven't listed any luxury stays yet. Click the list button above to register your first property.
            </p>
            <Link 
              href="/items/add" 
              className="inline-block bg-gold hover:bg-gold-hover text-slate-dark font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              List Your Property
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
