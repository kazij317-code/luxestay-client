'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PlusCircle, ArrowLeft, Image, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function AddStayPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Form States
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

  const handleImgBBInputUpload = async (file: File, setter: (val: string) => void, setLoading: (val: boolean) => void) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // Specs & Amenities States
  const [beds, setBeds] = useState(1);
  const [guests, setGuests] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [wifi, setWifi] = useState(true);
  const [pool, setPool] = useState(false);
  const [kitchen, setKitchen] = useState(true);

  // Status States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!title.trim() || !shortDescription.trim() || !fullDescription.trim() || !location.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
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
        setSuccess(true);
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

        setTimeout(() => {
          router.push('/items/manage');
        }, 1500);
      } else {
        setError(data.error || 'Failed to list property');
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-dark">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-gold">
          <div className="animate-pulse font-bold">Verifying host credentials...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-6">

        {/* Back Button */}
        <div>
          <button
            onClick={() => router.push('/items/manage')}
            className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gold transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl">

          <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
            <PlusCircle className="w-6 h-6 text-gold" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">List a New Luxury Property</h1>
              <p className="text-xs sm:text-sm text-gray-400">Introduce your curated space to luxury travelers worldwide</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>Listing created successfully! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Core Info */}
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
                {/* Main Image */}
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

                {/* Gallery Image 1 */}
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

                {/* Gallery Image 2 */}
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

                {/* Gallery Image 3 */}
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

            {/* Descriptions */}
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

            {/* Specifications Details */}
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
              disabled={submitting}
              className="w-full bg-gold hover:bg-gold-hover hover:scale-102 active:scale-98 text-slate-dark font-bold text-sm py-4 rounded-xl transition-all shadow-lg shadow-gold/10 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{submitting ? 'Creating Listing...' : 'Publish Property'}</span>
            </button>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
