'use client'
import { useState } from 'react'
import Badge from './Badge'
import type { Venue } from '../types/portfolio'

interface VenueShowcaseProps {
  venues: {
    nightclubs: Venue[];
    beachclubs: Venue[];
    restaurants: Venue[];
    hotels: Venue[];
    festive: Venue[];
  };
  destinationName: string;
}

const VenueShowcase: React.FC<VenueShowcaseProps> = ({ venues, destinationName }) => {
  // Trova categorie con almeno 1 venue
  const categories = [
    { key: 'nightclubs', label: 'Night Clubs'},
    { key: 'beachclubs', label: 'Beach Clubs'},
    { key: 'restaurants', label: 'Restaurants'},
    { key: 'hotels', label: 'Hotels'},
    { key: 'festive', label: 'Festive'}
  ].filter(cat => (venues as any)[cat.key]?.length > 0)

  const [activeCategory, setActiveCategory] = useState(categories[0]?.key)

  const currentVenues = (venues as any)[activeCategory] || []

  // Usa l'ordine manuale del JSON (admin controlla l'ordine)
  // Nessun sort - rispetta l'ordine esatto in portfolio.json

  return (
    <section className="px-6 pb-16">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="info">Exclusive Partners</Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          Our Partner Venues
        </h2>
        <p className="mt-2 text-sm text-white/50 max-w-md">
          Curated access to the city's most exclusive destinations. Contact our concierge for reservations.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pt-2 pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`
              shrink-0 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] transition
              ${activeCategory === cat.key
                ? 'bg-white/10 text-white ring-1 ring-white/20'
                : 'bg-white/5 text-white/50 ring-1 ring-white/10 hover:bg-white/[0.07] hover:text-white/70'
              }
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Venue Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentVenues.map((venue: Venue, index: number) => (
          <VenueCard
            key={`${venue.name}-${index}`}
            venue={venue}
            destinationName={destinationName}
            category={activeCategory}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentVenues.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-white/40">No venues available in this category</p>
        </div>
      )}
    </section>
  )
}

interface VenueCardProps {
  venue: Venue;
  destinationName: string;
  category: string;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, destinationName, category }) => {
  const isPremium = venue.tier === 'premium'
  const isFeatured = venue.tier === 'featured'

  // Crea URL per la pagina venue: /destination/dubai/venue/nightclubs/ushuaia-dubai
  const venueSlug = venue.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const destinationSlug = destinationName.toLowerCase()
  const venueUrl = `#/destination/${destinationSlug}/venue/${category}/${venueSlug}`

  return (
    <a
      href={venueUrl}
      className={`
        group relative block overflow-hidden rounded-2xl p-5 backdrop-blur-[2px] transition-all duration-300
        ${isPremium
          ? 'bg-gradient-to-br from-bluelite-accent/10 via-white/5 to-white/5 ring-2 ring-bluelite-accent/30 hover:ring-bluelite-accent/50'
          : isFeatured
          ? 'bg-white/5 ring-1 ring-bluelite-accent/20 hover:ring-bluelite-accent/30 hover:bg-white/[0.07]'
          : 'bg-white/5 ring-1 ring-white/10 hover:ring-white/20 hover:bg-white/[0.07]'
        }
      `}
    >
      {/* Background Image with Gradient Mask */}
      <div className="absolute inset-0 opacity-[0.8] group-hover:opacity-[0.12] transition-opacity duration-300">
        <img 
          src={venue.images?.[0] || venue.profileImage || "/DemoCut.jpg"} 
          alt={venue.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/80 to-transparent" />
      </div>

      {/* Premium Glow Effect */}
      {isPremium && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-bluelite-accent/5 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Badge */}
          {isPremium && (
            <div className="mb-3">
              <Badge variant="premium" className="px-2.5 py-0.5 text-[9px]">Premium Partner</Badge>
            </div>
          )}
          {isFeatured && !isPremium && (
            <div className="mb-3">
              <Badge variant="partner" className="px-2.5 py-0.5 text-[9px]">Partner</Badge>
            </div>
          )}

          {/* Venue Name */}
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {venue.name}
          </h3>

          {/* Location */}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/40">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>{venue.location || destinationName}</span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex items-center shrink-0 self-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/40 transition-transform group-hover:translate-x-0.5">
            <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Decorative Pattern (visible on hover) */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 opacity-0 transition-opacity duration-300 group-hover:opacity-10">
        <div className="h-full w-full rounded-full bg-gradient-to-br from-white to-transparent blur-2xl" />
      </div>
    </a>
  )
}

export default VenueShowcase

