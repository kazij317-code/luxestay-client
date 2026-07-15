'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Stay } from '@/data/db';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search & Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('rating_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Data State
  const [stays, setStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const limit = 8;

  // Sync with searchParams initially
  useEffect(() => {
    const searchVal = searchParams.get('search');
    const categoryVal = searchParams.get('category');
    if (searchVal) setSearch(searchVal);
    if (categoryVal) setCategory(categoryVal);
  }, [searchParams]);

  // Fetch stays whenever filters change
  useEffect(() => {
    async function loadStays() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search,
          category,
          minPrice: minPrice.toString(),
          maxPrice: maxPrice.toString(),
          minRating: minRating.toString(),
          sort,
          page: page.toString(),
          limit: limit.toString(),
        });

        const res = await fetch(`/api/stays?${queryParams.toString()}`);
        const data = await res.json();
        
        if (data.success) {
          setStays(data.data);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error("Failed to load stays", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadStays();
    }, 300); // Debounce typing

    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice, minRating, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice(0);
    setMaxPrice(10000);
    setMinRating(0);
    setSort('rating_desc');
    setPage(1);
    router.replace('/explore');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow flex flex-col">
      {/* Title Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Explore Luxe Stays</h1>
        <p className="text-sm text-gray-400 mt-1">Find the perfect sanctuary tailored for your bespoke escape.</p>
      </div>

      {/* Main Grid: Filters Side + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* FILTERS PANEL (Desktop Sidebar / Mobile Drawer) */}
        <aside className={`lg:block ${showFiltersMobile ? 'fixed inset-0 z-50 bg-slate-dark/95 p-6 overflow-y-auto' : 'hidden'} lg:relative lg:bg-transparent lg:inset-auto lg:p-0 lg:z-auto`}>
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-gold" />
                <span>Filters</span>
              </h2>
              {showFiltersMobile && (
                <button onClick={() => setShowFiltersMobile(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={handleResetFilters}
                className="text-xs text-gold hover:text-gold-hover font-semibold transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Field 1: Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm"
              >
                <option value="All">All Categories</option>
                <option value="Cabins">Cabins</option>
                <option value="Beachfront">Beachfront</option>
                <option value="Penthouses">Penthouses</option>
                <option value="Villas">Villas</option>
                <option value="Treehouses">Treehouses</option>
              </select>
            </div>

            {/* Field 2: Price Range Filter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Price / Night</label>
                <span className="text-xs text-gold font-bold">${minPrice} - ${maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-gold bg-white/10 h-1 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                <span>$0</span>
                <span>$10,000+</span>
              </div>
            </div>

            {/* Field 3: Minimum Rating Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Minimum Rating</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 3, 4, 4.5, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => {
                      setMinRating(rating);
                      setPage(1);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      minRating === rating
                        ? 'bg-gold/15 border-gold text-gold'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}★`}
                  </button>
                ))}
              </div>
            </div>
            
            {showFiltersMobile && (
              <button 
                onClick={() => setShowFiltersMobile(false)}
                className="w-full bg-gold text-slate-dark font-bold py-3 rounded-xl text-sm"
              >
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        {/* RESULTS PANEL */}
        <main className="lg:col-span-3 space-y-6">
          {/* Search bar & Sort controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, location, description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder-gray-400"
              />
            </div>

            {/* Sort Dropdown & Mobile Filter Button */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFiltersMobile(true)}
                className="lg:hidden flex-1 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 text-gray-300 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-gold" />
                <span>Filters</span>
              </button>

              <div className="flex items-center space-x-2 bg-white/5 py-1 px-3 rounded-xl border border-white/10 flex-1 sm:flex-none">
                <ArrowUpDown className="w-4 h-4 text-gold flex-shrink-0" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none w-full cursor-pointer py-1.5"
                >
                  <option value="rating_desc" className="bg-slate-900 text-white">Top Rated</option>
                  <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                  <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-xs sm:text-sm text-gray-400">
            Showing {loading ? '...' : stays.length} of {totalCount} properties found.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              <SkeletonLoader count={8} />
            ) : stays.length > 0 ? (
              stays.map((stay) => (
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
              <div className="col-span-full py-16 text-center space-y-3">
                <SlidersHorizontal className="w-12 h-12 text-gold/30 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Stays Found</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  Try adjusting your search criteria or resetting filters to see other luxury properties.
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="mt-2 bg-gold hover:bg-gold-hover text-slate-dark font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center space-x-4 pt-10 border-t border-white/5">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/5 text-gold transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/5 text-gold transition-colors disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-dark">
      <Navbar />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center text-gold">
          <div className="animate-pulse font-bold">Loading Explore...</div>
        </div>
      }>
        <ExploreContent />
      </Suspense>
      <Footer />
    </div>
  );
}
