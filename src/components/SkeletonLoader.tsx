'use client';

import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
}

export default function SkeletonLoader({ count = 4 }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className="glass-card flex flex-col h-[380px] rounded-2xl overflow-hidden border border-white/5"
        >
          {/* Image Shimmer */}
          <div className="h-48 sm:h-52 w-full animate-shimmer" />

          {/* Body Shimmer */}
          <div className="p-5 flex flex-col flex-grow space-y-4">
            {/* Meta row */}
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-white/10 rounded animate-shimmer" />
              <div className="h-4 w-12 bg-white/10 rounded animate-shimmer" />
            </div>

            {/* Title */}
            <div className="h-6 w-3/4 bg-white/10 rounded animate-shimmer" />

            {/* Description lines */}
            <div className="space-y-2 flex-grow">
              <div className="h-3 w-full bg-white/10 rounded animate-shimmer" />
              <div className="h-3 w-5/6 bg-white/10 rounded animate-shimmer" />
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="h-5 w-20 bg-white/10 rounded animate-shimmer" />
              <div className="h-8 w-20 bg-white/10 rounded-xl animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
