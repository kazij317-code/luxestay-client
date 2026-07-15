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
  MapPin, DollarSign, Star, AlertCircle, RefreshCw,
  LayoutDashboard, Heart, Calendar, User as UserIcon, LogOut,
  Image as ImageIcon, Sparkles, Check, CheckCircle, Shield, Users, CreditCard, X, Mail
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  isBlocked: boolean;
  createdAt?: string;
}

interface ReservationItem {
  id: string;
  stayId: string;
  userId: string;
  userEmail: string;
  userName: string;
  checkIn: string;
  checkOut: string;
  price: number;
  guests: number;
  status: string;
  propertyTitle: string;
  location: string;
  image?: string;
}

export default function ManageStaysPage() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Core Lists
  const [allStays, setAllStays] = useState<Stay[]>([]); // All stays in system (for admin stays list)
  const [watchlist, setWatchlist] = useState<Stay[]>([]); // User's watchlist
  const [reservations, setReservations] = useState<ReservationItem[]>([]); // User's or admin's reservations
  const [usersList, setUsersList] = useState<UserItem[]>([]); // Admin: all users in system
  const [inquiriesList, setInquiriesList] = useState<any[]>([]); // Admin: all inquiries in system
  const [subscribersList, setSubscribersList] = useState<any[]>([]); // Admin: all newsletter subscribers
  
  const [fetching, setFetching] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Form States for Add Listing Tab (Admin Only)
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [price, setPrice] = useState(250);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Cabins');
  const [image, setImage] = useState('');
  const [galleryImg1, setGalleryImg1] = useState('');
  const [galleryImg2, setGalleryImg2] = useState('');
  const [galleryImg3, setGalleryImg3] = useState('');
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingG1, setUploadingG1] = useState(false);
  const [uploadingG2, setUploadingG2] = useState(false);
  const [uploadingG3, setUploadingG3] = useState(false);
  const [beds, setBeds] = useState(1);
  const [guests, setGuests] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [wifi, setWifi] = useState(true);
  const [pool, setPool] = useState(false);
  const [kitchen, setKitchen] = useState(true);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Update Profile Modal States
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateName, setUpdateName] = useState('');
  const [updateAvatar, setUpdateAvatar] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Fetch all necessary data depending on role
  async function loadDashboardData() {
    setFetching(true);
    setError('');
    try {
      const token = localStorage.getItem('luxestay_token');
      
      // 1. Fetch stays (needed for both user watchlist and admin manage stays)
      const staysRes = await fetch('/api/stays');
      const staysData = await staysRes.json();
      let staysList: Stay[] = [];
      if (staysData.success) {
        staysList = staysData.data;
        setAllStays(staysList);
      }

      if (user?.role === 'admin') {
        // Admin Data Load
        // Fetch all users
        const usersRes = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        if (usersData.success) {
          setUsersList(usersData.data);
        }

        // Fetch all reservations (Transactions)
        const reservationsRes = await fetch('/api/admin/reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const reservationsData = await reservationsRes.json();
        if (reservationsData.success) {
          setReservations(reservationsData.data);
        }

        // Fetch all inquiries
        const inquiriesRes = await fetch('/api/admin/inquiries', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const inquiriesData = await inquiriesRes.json();
        if (inquiriesData.success) {
          setInquiriesList(inquiriesData.data);
        }

        // Fetch newsletter subscribers
        const subscribersRes = await fetch('/api/admin/subscriptions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const subscribersData = await subscribersRes.json();
        if (subscribersData.success) {
          setSubscribersList(subscribersData.data);
        }
      } else {
        // Regular User Data Load
        // Fetch user watchlist
        const watchlistRes = await fetch('/api/user/watchlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const watchlistData = await watchlistRes.json();
        if (watchlistData.success) {
          const watchlisted = staysList.filter((s: Stay) => watchlistData.watchlist.includes(s.id));
          setWatchlist(watchlisted);
        }

        // Fetch user reservations
        const reservationsRes = await fetch('/api/reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const reservationsData = await reservationsRes.json();
        if (reservationsData.success) {
          setReservations(reservationsData.data);
        }
      }
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      loadDashboardData();
    }
  }, [user, loading, router]);

  // Admin: Toggle User Block Status
  const handleToggleBlockUser = async (userId: string) => {
    setActionLoadingId(userId);
    try {
      const token = localStorage.getItem('luxestay_token');
      const res = await fetch(`/api/admin/users/${userId}/toggle-block`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: data.isBlocked } : u));
      } else {
        setError(data.error || 'Failed to update user block status');
      }
    } catch (err) {
      setError('Connection error toggling user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Admin: Toggle Stay Featured Status
  const handleToggleFeaturedStay = async (stayId: string) => {
    setActionLoadingId(stayId);
    try {
      const token = localStorage.getItem('luxestay_token');
      const res = await fetch(`/api/admin/stays/${stayId}/toggle-featured`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllStays(prev => prev.map(s => s.id === stayId ? { ...s, featured: data.featured } : s));
      } else {
        setError(data.error || 'Failed to update stay featured status');
      }
    } catch (err) {
      setError('Connection error updating stay featured status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Admin: Delete Stay Listing
  const handleDeleteStay = async (stayId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }
    
    setActionLoadingId(stayId);
    setError('');

    try {
      const token = localStorage.getItem('luxestay_token');
      const res = await fetch(`/api/stays/${stayId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAllStays(prev => prev.filter(s => s.id !== stayId));
      } else {
        setError(data.error || 'Failed to delete listing');
      }
    } catch (err) {
      setError('Failed to delete stay, please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // User: Toggle Watchlist (Remove from wishlist tab)
  const handleToggleWatchlist = async (stayId: string) => {
    try {
      const token = localStorage.getItem('luxestay_token');
      const res = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stayId })
      });
      const data = await res.json();
      if (data.success) {
        setWatchlist(prev => prev.filter(s => s.id !== stayId));
      }
    } catch (err) {
      console.error("Watchlist toggle failed", err);
    }
  };

  // ImageBB upload helper for Add Listing form
  const handleImgBBInputUpload = async (file: File, setter: (val: string) => void, setUploading: (val: boolean) => void) => {
    setUploading(true);
    setError('');
    try {
      const apiKey = process.env.NEXT_PUBLIC_IMAGE_UPLOAD_API || 'a200bdd6c842d731956d138bf894b798';
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setter(data.data.url);
      } else {
        setError('Failed to upload image to ImageBB.');
      }
    } catch (err) {
      setError('Error uploading image.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormSuccess(false);

    if (!title.trim() || !shortDescription.trim() || !fullDescription.trim() || !location.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    try {
      const token = localStorage.getItem('luxestay_token');
      const response = await fetch('/api/stays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          shortDescription,
          fullDescription,
          price: Number(price),
          location,
          category,
          image,
          images: [image, galleryImg1, galleryImg2, galleryImg3].filter(Boolean),
          beds: Number(beds),
          guests: Number(guests),
          bathrooms: Number(bathrooms),
          wifi,
          pool,
          kitchen
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setFormSuccess(true);
        setTitle('');
        setShortDescription('');
        setFullDescription('');
        setPrice(250);
        setLocation('');
        setImage('');
        setGalleryImg1('');
        setGalleryImg2('');
        setGalleryImg3('');
        setBeds(1);
        setGuests(2);
        setBathrooms(1);
        setWifi(true);
        setPool(false);
        setKitchen(true);
        
        loadDashboardData();
        setTimeout(() => {
          setActiveTab('manage-stays');
          setFormSuccess(false);
        }, 1500);
      } else {
        setError(data.error || 'Failed to list property');
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmReservation = async (reservationId: string) => {
    setActionLoadingId(reservationId);
    try {
      const token = localStorage.getItem('luxestay_token');
      const res = await fetch(`/api/admin/reservations/${reservationId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, status: 'Confirmed' } : r));
      }
    } catch (err) {
      console.error("Failed to confirm reservation", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-dark">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-gold">
          <div className="animate-pulse font-bold">Verifying dashboard credentials...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  // Sidebar Menu list configured dynamically by role
  const menuItems = isAdmin 
    ? [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'add', name: 'Add Listing', icon: PlusCircle },
        { id: 'manage-users', name: 'Manage Users', icon: Users },
        { id: 'manage-stays', name: 'Manage Stays', icon: Compass },
        { id: 'transactions', name: 'Transactions', icon: CreditCard },
        { id: 'inquiries', name: 'Inquiries', icon: Mail },
        { id: 'subscribers', name: 'Subscribers', icon: Sparkles },
        { id: 'profile', name: 'Profile', icon: UserIcon },
      ]
    : [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'wishlist', name: 'Favourites', icon: Heart },
        { id: 'reservation', name: 'My Reservation', icon: Calendar },
        { id: 'profile', name: 'Profile', icon: UserIcon },
      ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-dark text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Layout */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="glass-panel p-6 rounded-3xl text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120"}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-gold/40"
              />
              <span className="absolute bottom-0 right-0 bg-gold text-slate-dark text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                {user.role === 'admin' ? 'ADMIN' : 'USER'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{user.name}</h3>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="glass-panel p-2.5 rounded-3xl space-y-0.5">
            <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 mb-2">
              <Shield className="w-3.5 h-3.5 text-gold" />
              <span>{isAdmin ? 'Admin Panel' : 'User Panel'}</span>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setError('');
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all border border-transparent text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-grow min-w-0">
          
          {error && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {fetching ? (
            <div className="text-center py-24 text-gray-400 space-y-2">
              <RefreshCw className="w-8 h-8 text-gold mx-auto animate-spin" />
              <div className="text-sm font-semibold">Loading command center...</div>
            </div>
          ) : (
            <>
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
                    <p className="text-sm text-gray-400 mt-1">
                      Welcome back, <span className="text-gold font-bold">{user.name}</span>. Here is your command center.
                    </p>
                  </div>

                  {/* Cards Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isAdmin ? (
                      <>
                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</p>
                            <h2 className="text-4xl font-black text-white">{usersList.length}</h2>
                            <button onClick={() => setActiveTab('manage-users')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                              <span>Manage users</span>
                              <span>→</span>
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <Users className="w-6 h-6 text-cyan-400" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Stays</p>
                            <h2 className="text-4xl font-black text-white">{allStays.length}</h2>
                            <button onClick={() => setActiveTab('manage-stays')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                              <span>Manage stays</span>
                              <span>→</span>
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <Compass className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transactions</p>
                            <h2 className="text-4xl font-black text-white">{reservations.length}</h2>
                            <button onClick={() => setActiveTab('transactions')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                              <span>View details</span>
                              <span>→</span>
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <CreditCard className="w-6 h-6 text-amber-400" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inquiries</p>
                            <h2 className="text-4xl font-black text-white">{inquiriesList.length}</h2>
                            <button onClick={() => setActiveTab('inquiries')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                              <span>View details</span>
                              <span>→</span>
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <Mail className="w-6 h-6 text-emerald-400" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscribers</p>
                            <h2 className="text-4xl font-black text-white">{subscribersList.length}</h2>
                            <button onClick={() => setActiveTab('subscribers')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                              <span>View details</span>
                              <span>→</span>
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Saved Favourites</p>
                            <h2 className="text-4xl font-black text-white">{watchlist.length}</h2>
                            <button onClick={() => setActiveTab('wishlist')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                              <span>View Favourites</span>
                              <span>→</span>
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <Heart className="w-6 h-6 text-cyan-400 fill-cyan-500/20" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">My Reservations</p>
                            <h2 className="text-4xl font-black text-white">{reservations.length}</h2>
                            <button onClick={() => setActiveTab('reservation')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                              <span>View reservations</span>
                              <span>→</span>
                            </button>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <Calendar className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex items-center justify-between">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Member Status</p>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Active User</h2>
                            <div className="text-[10px] text-gray-400 mt-2">Verified Luxe Account</div>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl">
                            <UserIcon className="w-6 h-6 text-amber-400" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Level description box */}
                  <div className="glass-panel p-6 rounded-3xl space-y-2 border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
                    <div className="flex items-center space-x-2 text-gold">
                      <Sparkles className="w-5 h-5 fill-gold/25" />
                      <span className="font-bold text-sm">
                        {isAdmin ? 'System Administrator Center' : 'Premium Guest Account unlocked'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300">
                      {isAdmin 
                        ? 'Manage property inventory, authorize features, review transactions, and block/unblock system credentials.'
                        : 'Explore premium stays, secure luxury bookings, and customize your retreats catalog in real time.'}
                    </p>
                  </div>
                </div>
              )}

              {/* USER: MY WISHLIST */}
              {activeTab === 'wishlist' && !isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <Heart className="w-8 h-8 text-cyan-400 fill-cyan-400/10" />
                      <span>Favourites ({watchlist.length})</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Your saved bespoke retreats and properties</p>
                  </div>

                  {watchlist.length > 0 ? (
                    <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <th className="py-4 px-6">Item Details</th>
                              <th className="py-4 px-6">Category</th>
                              <th className="py-4 px-6">Rating</th>
                              <th className="py-4 px-6">Price</th>
                              <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {watchlist.map((stay) => (
                              <tr key={stay.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 px-6 flex items-center space-x-4">
                                  <img 
                                    src={stay.image} 
                                    alt={stay.title}
                                    className="w-14 h-14 rounded-xl object-cover border border-white/5 flex-shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-white block truncate max-w-[220px]">{stay.title}</span>
                                    <div className="flex items-center text-xs text-gray-400 mt-0.5">
                                      <MapPin className="w-3.5 h-3.5 text-gold mr-1" />
                                      <span>{stay.location}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="text-cyan-400 font-semibold">{stay.category}</span>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                                    <span className="font-bold text-gray-200">{stay.rating.toFixed(1)}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 font-black text-white text-base">
                                  ${stay.price}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center justify-center space-x-2">
                                    <Link
                                      href={`/stays/${stay.id}`}
                                      className="p-2.5 rounded-xl bg-white/5 hover:bg-gold/15 hover:text-gold text-gray-400 transition-colors border border-white/5"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Link>
                                    <button
                                      onClick={() => handleToggleWatchlist(stay.id)}
                                      className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20 cursor-pointer"
                                      title="Remove"
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
                    </div>
                  ) : (
                    <div className="text-center py-20 glass-panel rounded-3xl space-y-4">
                      <Heart className="w-16 h-16 text-gray-600 mx-auto" />
                      <h3 className="text-xl font-bold text-white">Your Favourites are Empty</h3>
                      <p className="text-sm text-gray-400 max-w-sm mx-auto">
                        Explore retreats and click the heart icon on any stay to save it here.
                      </p>
                      <Link 
                        href="/explore" 
                        className="inline-block bg-gold hover:bg-gold-hover text-slate-dark font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
                      >
                        Explore Stays
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* USER: MY RESERVATION */}
              {activeTab === 'reservation' && !isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <Calendar className="w-8 h-8 text-cyan-400" />
                      <span>My Reservations ({reservations.length})</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Manage luxury stays you have reserved</p>
                  </div>

                  {reservations.length > 0 ? (
                    <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <th className="py-4 px-6">Reserved Property</th>
                              <th className="py-4 px-6">Check-in / Check-out</th>
                              <th className="py-4 px-6">Total Paid</th>
                              <th className="py-4 px-6">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {reservations.map((res) => (
                              <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 px-6 flex items-center space-x-4">
                                  <img 
                                    src={res.image || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80"} 
                                    alt={res.propertyTitle}
                                    className="w-12 h-12 rounded-lg object-cover border border-white/5 flex-shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-white block">{res.propertyTitle}</span>
                                    <span className="text-xs text-gray-400">{res.location}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-gray-300">
                                  <div>{res.checkIn}</div>
                                  <div className="text-xs text-gray-500">to {res.checkOut}</div>
                                </td>
                                <td className="py-4 px-6 font-bold text-white">
                                  ${res.price}
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    res.status === 'Pending'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {res.status || 'Pending'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 glass-panel rounded-3xl space-y-4">
                      <Calendar className="w-16 h-16 text-gray-600 mx-auto" />
                      <h3 className="text-xl font-bold text-white">No Reservations Found</h3>
                      <p className="text-sm text-gray-400 max-w-sm mx-auto">
                        Find a villa or treehouse and request a reservation.
                      </p>
                      <Link 
                        href="/explore" 
                        className="inline-block bg-gold hover:bg-gold-hover text-slate-dark font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
                      >
                        Find Luxury Stays
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN: ADD LISTING */}
              {activeTab === 'add' && isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">List a New Luxury Property</h1>
                    <p className="text-sm text-gray-400 mt-1">Introduce your curated space to luxury travelers worldwide</p>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl">
                    {formSuccess && (
                      <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span>Listing created successfully! Redirecting to stays dashboard...</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateStay} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase">Property Title *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Sapphire Overwater Villa"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase">Location *</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Amalfi Coast, Italy"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase">Category *</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full glass-input px-4 py-3 rounded-xl text-sm cursor-pointer"
                          >
                            <option value="Cabins">Cabins</option>
                            <option value="Beachfront">Beachfront</option>
                            <option value="Penthouses">Penthouses</option>
                            <option value="Villas">Villas</option>
                            <option value="Treehouses">Treehouses</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase">Price per Night ($) *</label>
                          <input 
                            type="number"
                            required
                            min="1"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      {/* Image Fields Section */}
                      <div className="space-y-4 border-t border-white/5 pt-4">
                        <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Property Images</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Main Image URL / Upload *</label>
                            <div className="relative flex gap-2">
                              <input 
                                type="url"
                                required
                                placeholder="Enter image URL or upload"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                              />
                              <label className="cursor-pointer bg-white/5 hover:bg-gold/10 hover:text-gold text-gray-300 px-4 py-3 rounded-xl text-sm font-semibold border border-white/5 hover:border-gold/20 transition-all flex items-center justify-center min-w-[80px]">
                                <span>{uploadingMain ? '...' : 'Upload'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImgBBInputUpload(file, setImage, setUploadingMain);
                                  }}
                                  className="hidden"
                                  disabled={uploadingMain}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Gallery Image 1 (Optional)</label>
                            <div className="relative flex gap-2">
                              <input 
                                type="url"
                                placeholder="Enter image URL or upload"
                                value={galleryImg1}
                                onChange={(e) => setGalleryImg1(e.target.value)}
                                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                              />
                              <label className="cursor-pointer bg-white/5 hover:bg-gold/10 hover:text-gold text-gray-300 px-4 py-3 rounded-xl text-sm font-semibold border border-white/5 hover:border-gold/20 transition-all flex items-center justify-center min-w-[80px]">
                                <span>{uploadingG1 ? '...' : 'Upload'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImgBBInputUpload(file, setGalleryImg1, setUploadingG1);
                                  }}
                                  className="hidden"
                                  disabled={uploadingG1}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Gallery Image 2 (Optional)</label>
                            <div className="relative flex gap-2">
                              <input 
                                type="url"
                                placeholder="Enter image URL or upload"
                                value={galleryImg2}
                                onChange={(e) => setGalleryImg2(e.target.value)}
                                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                              />
                              <label className="cursor-pointer bg-white/5 hover:bg-gold/10 hover:text-gold text-gray-300 px-4 py-3 rounded-xl text-sm font-semibold border border-white/5 hover:border-gold/20 transition-all flex items-center justify-center min-w-[80px]">
                                <span>{uploadingG2 ? '...' : 'Upload'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImgBBInputUpload(file, setGalleryImg2, setUploadingG2);
                                  }}
                                  className="hidden"
                                  disabled={uploadingG2}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Gallery Image 3 (Optional)</label>
                            <div className="relative flex gap-2">
                              <input 
                                type="url"
                                placeholder="Enter image URL or upload"
                                value={galleryImg3}
                                onChange={(e) => setGalleryImg3(e.target.value)}
                                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                              />
                              <label className="cursor-pointer bg-white/5 hover:bg-gold/10 hover:text-gold text-gray-300 px-4 py-3 rounded-xl text-sm font-semibold border border-white/5 hover:border-gold/20 transition-all flex items-center justify-center min-w-[80px]">
                                <span>{uploadingG3 ? '...' : 'Upload'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImgBBInputUpload(file, setGalleryImg3, setUploadingG3);
                                  }}
                                  className="hidden"
                                  disabled={uploadingG3}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase">Short Description *</label>
                          <input 
                            type="text"
                            required
                            maxLength={120}
                            placeholder="One sentence summary of the layout/vibe (Max 120 chars)"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase">Full Description / Overview *</label>
                          <textarea 
                            rows={4}
                            required
                            placeholder="Write a thorough overview detailing architectural style, private features, proximity, and check-in specifications."
                            value={fullDescription}
                            onChange={(e) => setFullDescription(e.target.value)}
                            className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div className="glass-panel bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Property Specifications & Amenities</h3>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase">Beds Count</label>
                            <input 
                              type="number"
                              min="1"
                              value={beds}
                              onChange={(e) => setBeds(Number(e.target.value))}
                              className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase">Max Guests</label>
                            <input 
                              type="number"
                              min="1"
                              value={guests}
                              onChange={(e) => setGuests(Number(e.target.value))}
                              className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase">Bathrooms</label>
                            <input 
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={bathrooms}
                              onChange={(e) => setBathrooms(Number(e.target.value))}
                              className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2">
                          <label className="flex items-center space-x-2.5 text-xs text-gray-300 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={wifi}
                              onChange={(e) => setWifi(e.target.checked)}
                              className="w-4 h-4 accent-gold"
                            />
                            <span>Free Wi-Fi</span>
                          </label>
                          
                          <label className="flex items-center space-x-2.5 text-xs text-gray-300 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={pool}
                              onChange={(e) => setPool(e.target.checked)}
                              className="w-4 h-4 accent-gold"
                            />
                            <span>Private Pool</span>
                          </label>

                          <label className="flex items-center space-x-2.5 text-xs text-gray-300 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={kitchen}
                              onChange={(e) => setKitchen(e.target.checked)}
                              className="w-4 h-4 accent-gold"
                            />
                            <span>Private Kitchen</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={formSubmitting || uploadingMain || uploadingG1 || uploadingG2 || uploadingG3}
                        className="w-full bg-gold hover:bg-gold-hover hover:scale-102 active:scale-98 text-slate-dark font-bold text-sm py-4 rounded-xl transition-all shadow-lg shadow-gold/10 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>{formSubmitting ? 'Creating Listing...' : 'Publish Property'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ADMIN: MANAGE USERS */}
              {activeTab === 'manage-users' && isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <Users className="w-8 h-8 text-cyan-400" />
                      <span>Manage Users 👥</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Block/unblock users and manage roles</p>
                  </div>

                  <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Role</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6">Joined</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {usersList.map((usr) => (
                            <tr key={usr.id} className="hover:bg-white/[0.02] transition-colors">
                              {/* User Info */}
                              <td className="py-4 px-6 flex items-center space-x-3">
                                <img
                                  src={usr.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                                  alt={usr.name}
                                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                                />
                                <div>
                                  <span className="font-bold text-white block">{usr.name}</span>
                                  <span className="text-xs text-gray-400">{usr.email}</span>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="py-4 px-6">
                                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  usr.role === 'admin'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}>
                                  {usr.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="py-4 px-6">
                                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  usr.isBlocked
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {usr.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                              </td>

                              {/* Joined */}
                              <td className="py-4 px-6 text-gray-300">
                                {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : '21/06/2026'}
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center">
                                  {usr.role === 'admin' ? (
                                    <button
                                      disabled
                                      className="px-4 py-1.5 rounded-xl bg-white/5 text-gray-600 text-xs font-bold border border-white/5"
                                    >
                                      Block
                                    </button>
                                  ) : (
                                    <button
                                      disabled={actionLoadingId === usr.id}
                                      onClick={() => handleToggleBlockUser(usr.id)}
                                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        usr.isBlocked
                                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                      }`}
                                    >
                                      {usr.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN: MANAGE STAYS */}
              {activeTab === 'manage-stays' && isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <Compass className="w-8 h-8 text-cyan-400" />
                      <span>Manage Stays 📋</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Delete properties or toggle featured status</p>
                  </div>

                  <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-6">Stay</th>
                            <th className="py-4 px-6">Author/Host</th>
                            <th className="py-4 px-6">Category</th>
                            <th className="py-4 px-6">Likes</th>
                            <th className="py-4 px-6">Featured</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {allStays.map((stay) => (
                            <tr key={stay.id} className="hover:bg-white/[0.02] transition-colors">
                              {/* Stay details */}
                              <td className="py-4 px-6 flex items-center space-x-3">
                                <img
                                  src={stay.image}
                                  alt={stay.title}
                                  className="w-12 h-12 rounded-lg object-cover border border-white/5 flex-shrink-0"
                                />
                                <span className="font-bold text-white max-w-[200px] truncate">{stay.title}</span>
                              </td>

                              {/* Author/Host */}
                              <td className="py-4 px-6 text-gray-300">
                                {stay.hostName || 'Host'}
                              </td>

                              {/* Category */}
                              <td className="py-4 px-6">
                                <span className="bg-white/5 text-gold border border-gold/10 text-xs font-semibold px-2.5 py-1 rounded-full">
                                  {stay.category}
                                </span>
                              </td>

                              {/* Likes */}
                              <td className="py-4 px-6 text-gray-300 font-bold">
                                <div className="flex items-center space-x-1.5">
                                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                                  <span>{stay.reviews?.length || 3}</span>
                                </div>
                              </td>

                              {/* Featured status */}
                              <td className="py-4 px-6">
                                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  stay.featured === 'Featured'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-white/5 text-gray-400 border border-white/10'
                                }`}>
                                  {stay.featured === 'Featured' ? 'Featured' : 'Regular'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    disabled={actionLoadingId === stay.id}
                                    onClick={() => handleToggleFeaturedStay(stay.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      stay.featured === 'Featured'
                                        ? 'bg-white/5 hover:bg-gold/15 text-gold border border-gold/20'
                                        : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20'
                                    }`}
                                  >
                                    {stay.featured === 'Featured' ? 'Unfeature' : 'Feature'}
                                  </button>
                                  <button
                                    disabled={actionLoadingId === stay.id}
                                    onClick={() => handleDeleteStay(stay.id)}
                                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-red-500/20 disabled:opacity-50 cursor-pointer"
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
                  </div>
                </div>
              )}

              {/* ADMIN: TRANSACTIONS */}
              {activeTab === 'transactions' && isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <CreditCard className="w-8 h-8 text-cyan-400" />
                      <span>Transactions Dashboard 💳</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Review system bookings and premium payments</p>
                  </div>

                  <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-6">Transaction ID</th>
                            <th className="py-4 px-6">Guest Info</th>
                            <th className="py-4 px-6">Stay Reserved</th>
                            <th className="py-4 px-6">Check-in / Check-out</th>
                            <th className="py-4 px-6 font-center">Total Price</th>
                            <th className="py-4 px-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {reservations.map((res) => (
                            <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-6 font-bold text-gray-400 text-xs truncate max-w-[120px]">
                                {res.id}
                              </td>
                              <td className="py-4 px-6 text-white font-semibold">
                                <div>{res.userName}</div>
                                <div className="text-[10px] text-gray-400">{res.userEmail}</div>
                              </td>
                              <td className="py-4 px-6 text-gray-300 font-bold">
                                {res.propertyTitle}
                              </td>
                              <td className="py-4 px-6 text-gray-400">
                                <div>{res.checkIn}</div>
                                <div className="text-xs text-gray-500">to {res.checkOut}</div>
                              </td>
                              <td className="py-4 px-6 text-gold font-black text-base">
                                ${res.price}
                              </td>
                              <td className="py-4 px-6">
                                {res.status === 'Pending' ? (
                                  <button
                                    onClick={() => handleConfirmReservation(res.id)}
                                    disabled={actionLoadingId === res.id}
                                    className="bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/25 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all duration-200"
                                  >
                                    {actionLoadingId === res.id ? 'Confirming...' : 'Pending'}
                                  </button>
                                ) : (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    {res.status || 'Confirmed'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN: INQUIRIES */}
              {activeTab === 'inquiries' && isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <Mail className="w-8 h-8 text-cyan-400" />
                      <span>Private Inquiries ✉️</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Review guest inquiries and custom requests</p>
                  </div>

                  <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-6">Sender Info</th>
                            <th className="py-4 px-6">Stay Reference</th>
                            <th className="py-4 px-6">Subject</th>
                            <th className="py-4 px-6">Inquiry Details</th>
                            <th className="py-4 px-6">Date Received</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {inquiriesList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-500">
                                No inquiries found in the system.
                              </td>
                            </tr>
                          ) : (
                            inquiriesList.map((inq) => (
                              <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 px-6 text-white font-semibold">
                                  <div>{inq.name}</div>
                                  <div className="text-[10px] text-gray-400">{inq.email}</div>
                                </td>
                                <td className="py-4 px-6 text-gray-300 font-bold">
                                  {inq.propertyTitle}
                                </td>
                                <td className="py-4 px-6 text-cyan-400 font-semibold">
                                  {inq.subject}
                                </td>
                                <td className="py-4 px-6 text-gray-400 max-w-xs whitespace-normal break-words">
                                  {inq.message}
                                </td>
                                <td className="py-4 px-6 text-gray-500 text-xs">
                                  {new Date(inq.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN: SUBSCRIBERS */}
              {activeTab === 'subscribers' && isAdmin && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <Sparkles className="w-8 h-8 text-cyan-400" />
                      <span>Newsletter Subscribers ✉️</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Review premium newsletter signups and user subscriptions</p>
                  </div>

                  <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-4 px-6">Subscriber Email</th>
                            <th className="py-4 px-6">Subscription Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {subscribersList.length === 0 ? (
                            <tr>
                              <td colSpan={2} className="py-8 text-center text-gray-500">
                                No newsletter subscribers found.
                              </td>
                            </tr>
                          ) : (
                            subscribersList.map((sub) => (
                              <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 px-6 text-white font-semibold">
                                  {sub.email}
                                </td>
                                <td className="py-4 px-6 text-gray-400">
                                  {new Date(sub.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <UserIcon className="w-8 h-8 text-cyan-400" />
                      <span>User Profile</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Manage your account information and credentials</p>
                  </div>

                  <div className="glass-panel p-8 rounded-3xl space-y-6 max-w-2xl">
                    <div className="flex items-center space-x-4 pb-6 border-b border-white/5">
                      <img
                        src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120"}
                        alt={user.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gold/40"
                      />
                      <div>
                        <h2 className="text-xl font-bold text-white">{user.name}</h2>
                        <span className="inline-block bg-gold/15 text-gold border border-gold/20 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1.5 uppercase">
                          {user.role || 'Guest / User'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</p>
                        <p className="text-sm font-semibold text-white mt-1">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-semibold text-white mt-1">{user.email}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          setUpdateName(user.name);
                          setUpdateAvatar(user.image || '');
                          setShowUpdateModal(true);
                        }}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Update Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>

      </div>

      {/* Update User Profile Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-sm w-full space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Close X Button */}
            <button 
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <UserIcon className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-white">Update User</h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!updateName.trim()) return;
              setUpdatingProfile(true);
              const res = await updateProfile(updateName, updateAvatar);
              setUpdatingProfile(false);
              if (res.success) {
                setShowUpdateModal(false);
              } else {
                setError(res.error || 'Failed to update profile');
              }
            }} className="space-y-4">
              {/* Name field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={updateName}
                  onChange={(e) => setUpdateName(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                />
              </div>

              {/* Avatar URL field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Avatar Image URL</label>
                <input 
                  type="text"
                  placeholder="https://..."
                  value={updateAvatar}
                  onChange={(e) => setUpdateAvatar(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3.5 rounded-2xl text-sm transition-all cursor-pointer border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-lg cursor-pointer"
                >
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
