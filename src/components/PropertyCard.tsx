'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, ArrowRight } from 'lucide-react';

export interface PropertyCardProps {
  id: string;
  title: string;
  shortDescription: string;
  price: number;
  rating: number;
  location: string;
  image: string;
  category: string;
}

export default function PropertyCard({
  id,
  title,
  shortDescription,
  price,
  rating,
  location,
  image,
  category,
}: PropertyCardProps) {
  return (
    <div className="glass-card flex flex-col h-full rounded-2xl overflow-hidden group">
      {/* Property Image */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md text-gold text-xs font-semibold px-3 py-1 rounded-full border border-gold/20">
          {category}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Location & Rating */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-gold" />
            <span className="truncate max-w-[150px]">{location}</span>
          </div>
          <div className="flex items-center space-x-1 bg-gold/15 py-0.5 px-2 rounded text-gold font-medium border border-gold/10">
            <Star className="w-3 h-3 fill-gold" />
            <span>{rating.toFixed(2)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors duration-200 line-clamp-1">
          {title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-grow">
          {shortDescription}
        </p>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div>
            <span className="text-lg font-bold text-gold">${price}</span>
            <span className="text-xs text-gray-400 ml-1">/ night</span>
          </div>
          
          <Link
            href={`/stays/${id}`}
            className="flex items-center space-x-1 bg-white/5 group-hover:bg-gold hover:text-slate-dark text-gray-300 group-hover:text-slate-dark font-medium text-xs px-3.5 py-2 rounded-xl border border-white/10 group-hover:border-gold transition-all duration-300"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
