'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Stay } from '@/data/db';
import { useAuth } from '@/context/AuthContext';
import { 
  Star, MapPin, Wifi, Bath, Users, Bed, HelpCircle, 
  ArrowLeft, Send, CheckCircle, Home, Heart, Calendar, Share2 
} from 'lucide-react';

export default function StayDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [stay, setStay] = useState<Stay | null>(null);
  const [related, setRelated] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Review Form States
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Booking Simulation States
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [booked, setBooked] = useState(false);

  // Watchlist & Share States
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) {
        setReviewAuthor(user.name);
        setInquiryName(user.name);
      }
      if (user.email) {
        setInquiryEmail(user.email);
      }
    }
  }, [user]);

  // Inquiry Form States
  const [inquiryName, setInquiryName] = useState(user?.name || '');
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || '');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadStayDetails() {
      setLoading(true);
      try {
        const detailsRes = await fetch(`/api/stays/${id}`);
        const detailsData = await detailsRes.json();
        if (detailsData.success) {
          const stayData = detailsData.data;
          setStay(stayData);
          
          // Load related stays (same category, excluding current stay)
          const relatedRes = await fetch(`/api/stays?category=${stayData.category}&limit=3`);
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            setRelated(relatedData.data.filter((s: Stay) => s.id !== id));
          }
        }
      } catch (err) {
        console.error("Error loading stay details", err);
      } finally {
        setLoading(false);
      }
    }
    loadStayDetails();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const checkWatchlistStatus = async () => {
      try {
        const token = localStorage.getItem('luxestay_token');
        if (!token) return;
        const res = await fetch('/api/user/watchlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setIsInWatchlist(data.watchlist.includes(id));
        }
      } catch (err) {
        console.error("Failed to fetch watchlist", err);
      }
    };
    checkWatchlistStatus();
  }, [id]);

  const toggleWatchlist = async () => {
    if (!id) return;
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const token = localStorage.getItem('luxestay_token');
      const res = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stayId: id })
      });
      const data = await res.json();
      if (data.success) {
        setIsInWatchlist(data.watchlist.includes(id));
      }
    } catch (err) {
      console.error("Failed to toggle watchlist", err);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareStatus('Copied!');
      setTimeout(() => setShareStatus(''), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/stays/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: reviewAuthor,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setStay(data.data);
        setReviewAuthor('');
        setReviewComment('');
        setReviewRating(5);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to post review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquirySubject.trim() || !inquiryMessage.trim()) return;

    setSubmittingInquiry(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stayId: id,
          name: inquiryName,
          email: inquiryEmail,
          subject: inquirySubject,
          message: inquiryMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setInquirySuccess(true);
        setInquirySubject('');
        setInquiryMessage('');
        setTimeout(() => setInquirySuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to post inquiry", err);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (checkIn && checkOut && stay) {
      try {
        const token = localStorage.getItem('luxestay_token');
        const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
        const priceTotal = stay.price * (days <= 0 ? 1 : days);
        const finalPrice = isNaN(priceTotal) ? stay.price : priceTotal;
        
        const res = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            stayId: stay.id,
            checkIn,
            checkOut,
            price: finalPrice,
            guests: guestsCount
          })
        });
        const data = await res.json();
        if (data.success) {
          setBooked(true);
        }
      } catch (err) {
        console.error("Booking error:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-dark">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-gold">
          <div className="animate-pulse font-bold">Retrieving Luxury Details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-dark">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <HelpCircle className="w-16 h-16 text-gold/30" />
          <h2 className="text-xl font-bold text-white">Listing Not Found</h2>
          <button 
            onClick={() => router.push('/explore')}
            className="bg-gold text-slate-dark font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            Return to Explore
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-8">
        
        {/* Back Button */}
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gold transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </button>
        </div>

        {/* Gallery / Images Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 relative h-96 sm:h-[450px] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
            <img 
              src={stay.images[activeImage] || stay.image} 
              alt={stay.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md text-gold text-xs font-semibold px-3 py-1 rounded-full border border-gold/20">
              {stay.category}
            </div>
          </div>
          
          {/* Sidebar Images Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
            {stay.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative h-28 lg:h-32 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === idx ? 'border-gold' : 'border-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* Split Details Container */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Overview, Specifications, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Block */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{stay.title}</h1>
              <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-gold" />
                  <span>{stay.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-white font-bold">{stay.rating.toFixed(2)}</span>
                  <span>({stay.reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            {/* Watchlist & Share Buttons */}
            <div className="border-t border-b border-white/5 py-4 flex items-center space-x-3">
              <button
                onClick={toggleWatchlist}
                className={`flex-grow flex items-center justify-center space-x-2 py-3 px-6 rounded-xl border transition-all cursor-pointer select-none ${
                  isInWatchlist
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-500 hover:bg-rose-950/30 hover:border-rose-500/40'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4.5 h-4.5 transition-colors ${isInWatchlist ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                <span className="font-semibold text-sm">
                  {isInWatchlist ? 'Added to Favourite' : 'Add to Favourite'}
                </span>
              </button>
              
              <button
                onClick={handleShare}
                className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                title="Share Listing"
              >
                <Share2 className="w-4.5 h-4.5 text-gray-400 hover:text-white" />
              </button>
              {shareStatus && (
                <span className="text-xs text-gold font-semibold ml-2 transition-all duration-300 bg-gold/15 px-2.5 py-1.5 rounded-lg border border-gold/10 animate-pulse">
                  {shareStatus}
                </span>
              )}
            </div>

            {/* Overview / Description */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Description Overview</h2>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {stay.fullDescription}
              </p>
            </div>

            {/* Specifications & Amenities */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Specifications & Comforts</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-xl text-center space-y-1">
                  <Users className="w-5 h-5 text-gold mx-auto" />
                  <div className="text-xs text-gray-400">Accommodates</div>
                  <div className="text-sm font-bold text-white">{stay.guests} Guests</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center space-y-1">
                  <Bed className="w-5 h-5 text-gold mx-auto" />
                  <div className="text-xs text-gray-400">Sleeping Arrangements</div>
                  <div className="text-sm font-bold text-white">{stay.beds} Beds</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center space-y-1">
                  <Bath className="w-5 h-5 text-gold mx-auto" />
                  <div className="text-xs text-gray-400">Bathrooms</div>
                  <div className="text-sm font-bold text-white">{stay.bathrooms} Baths</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center space-y-1">
                  <Wifi className="w-5 h-5 text-gold mx-auto" />
                  <div className="text-xs text-gray-400">High-Speed Wi-Fi</div>
                  <div className="text-sm font-bold text-white">{stay.wifi ? 'Included' : 'N/A'}</div>
                </div>
              </div>

              {/* Extra Amenities checklist */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${stay.pool ? 'text-gold' : 'text-gray-600'}`} />
                  <span className={stay.pool ? '' : 'line-through text-gray-500'}>Private Swimming Pool</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${stay.kitchen ? 'text-gold' : 'text-gray-600'}`} />
                  <span className={stay.kitchen ? '' : 'line-through text-gray-500'}>Professional Chef's Kitchen</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Star className="w-5 h-5 text-gold fill-gold" />
                <span>Reviews ({stay.reviews.length})</span>
              </h2>

              <div className="space-y-4">
                {stay.reviews.map((rev) => (
                  <div key={rev.id} className="glass-panel p-5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{rev.author}</h4>
                        <span className="text-[10px] text-gray-500">{rev.date}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gold/15 py-0.5 px-2 rounded text-gold text-xs font-semibold border border-gold/10">
                        <Star className="w-3 h-3 fill-gold" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}

                {stay.reviews.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No reviews yet. Be the first to share your experience!
                  </div>
                )}
              </div>

              {/* Leave Review Form */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white border-b border-white/5 pb-2">Post an Experience Review</h3>
                
                {reviewSuccess && (
                  <div className="flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/20 px-4 py-3 rounded-xl text-emerald-400 text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Your experience review has been recorded! Thank you.</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">YOUR NAME</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. John Doe"
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Rating Score</label>
                      <select 
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full glass-input px-4 py-2.5 rounded-xl text-sm cursor-pointer"
                      >
                        <option value="5">5 Stars (Exceptional)</option>
                        <option value="4">4 Stars (Good)</option>
                        <option value="3">3 Stars (Average)</option>
                        <option value="2">2 Stars (Poor)</option>
                        <option value="1">1 Star (Terrible)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Review Comment</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Share details of your stay..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-gold hover:bg-gold-hover disabled:opacity-50 text-slate-dark font-bold text-sm px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* RIGHT: Booking card & Host Details */}
          <div className="space-y-6">
            
            {/* Booking Card */}
            <div className="glass-panel p-6 rounded-2xl space-y-6 border border-gold/15 sticky top-24">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-black text-white">${stay.price}</span>
                  <span className="text-xs text-gray-400 ml-1">/ night</span>
                </div>
                <div className="flex items-center space-x-1 text-gold text-xs font-bold bg-gold/15 px-2 py-0.5 rounded border border-gold/10">
                  <Star className="w-3.5 h-3.5 fill-gold" />
                  <span>{stay.rating.toFixed(2)}</span>
                </div>
              </div>

              {booked ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Booking Requested!</h4>
                  <p className="text-xs text-gray-400">
                    Your concierge will contact you shortly to coordinate billing and verify transfers.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase">Check In</label>
                      <input 
                        type="date"
                        required
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase">Check Out</label>
                      <input 
                        type="date"
                        required
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full glass-input px-3 py-2 rounded-lg text-xs" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase">Guests</label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full glass-input px-3 py-2.5 rounded-lg text-xs cursor-pointer"
                    >
                      {Array.from({ length: stay.guests }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gold hover:bg-gold-hover hover:scale-105 active:scale-95 text-slate-dark font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-gold/10 cursor-pointer"
                  >
                    Request Reservation
                  </button>
                </form>
              )}

              <div className="text-center text-[10px] text-gray-500">
                You won't be charged yet. Private verification follows.
              </div>
            </div>

            {/* Host Profile */}
            <div className="glass-panel p-5 rounded-xl flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <div>
                <div className="text-xs text-gray-400">Hosted by</div>
                <div className="text-sm font-bold text-white">{stay.hostName || 'Alexander Vane'}</div>
                <div className="text-[10px] text-emerald-400 font-medium">Verified Luxe Host</div>
              </div>
            </div>

            {/* Send Private Inquiry Form */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
              <h3 className="text-base font-bold text-white tracking-tight">Send Private Inquiry</h3>
              
              {inquirySuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-xs font-bold text-emerald-400">Inquiry Sent Successfully!</h4>
                  <p className="text-[10px] text-gray-400">Our curation team will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase block">YOUR NAME</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase block">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase block">SUBJECT</label>
                    <input 
                      type="text" 
                      required
                      placeholder={`e.g. Private chef booking for ${stay.title}`}
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase block">MESSAGE INQUIRY</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Describe your inquiry details..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      className="w-full glass-input px-3 py-2 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className="w-full bg-gold hover:bg-gold-hover text-slate-dark font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingInquiry ? 'Sending...' : 'Send Inquiry'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </section>

        {/* Related Items Section */}
        {related.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-white/5">
            <div>
              <h2 className="text-xs font-bold text-gold tracking-widest uppercase">Recommendations</h2>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">Related Luxury Properties</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <PropertyCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  shortDescription={item.shortDescription}
                  price={item.price}
                  rating={item.rating}
                  location={item.location}
                  image={item.image}
                  category={item.category}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
