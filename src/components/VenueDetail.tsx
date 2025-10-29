'use client'
import { useState, useEffect } from 'react'
import Noise from './Noise'
import CustomMap from './CustomMap'
import Badge from './Badge'
import type { Venue } from '../types/portfolio'

interface VenueDetailProps {
  venue: Venue;
  destination: string;
  category: string;
  onContactConcierge: (venue: Venue) => void;
}

const VenueDetail: React.FC<VenueDetailProps> = ({ venue, destination, category, onContactConcierge }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lastUserInteraction, setLastUserInteraction] = useState(Date.now())

  // Get images from venue data, fallback to Demo.jpg if not available
  const images = venue?.images || Array(9).fill('/Demo.jpg')
  
  // Get profile image with fallback messaging
  const profileImage = venue?.profileImage || '/Demo.jpg'
  
  // Auto-scroll through images
  useEffect(() => {
    if (images.length === 0) return
    
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length)
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [images.length, lastUserInteraction]) // Reset timer when user interacts

  const isPremium = venue?.tier === 'premium'
  const isFeatured = venue?.tier === 'featured'

  const destinationUrl = `#/destination/${destination.toLowerCase()}`
  const venueName = venue?.name || 'Venue'

  // Handle user interaction with gallery
  const handleImageSelect = (index: number) => {
    setSelectedImage(index)
    setLastUserInteraction(Date.now()) // Reset timer
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={images[0] || '/Demo.jpg'} 
            alt={venueName}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        </div>

        {/* Noise & Vignette */}
        <Noise patternRefreshInterval={2} patternAlpha={8} />
        <div className="pointer-events-none absolute inset-0 vignette" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col px-6 pt-safe pb-safe">
          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <a 
              href={destinationUrl}
              className="micro-translate inline-flex items-center gap-2 text-white/60 transition hover:text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M16 5l-8 7 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs uppercase tracking-[0.2em]">Back</span>
            </a>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">{category}</div>
          </div>

          {/* Venue Info */}
          <div className="mt-auto pb-6">
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

            <h1 className="text-[42px] leading-[1.1] font-semibold tracking-tight text-white">
              {venueName}
            </h1>
            
            <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>{venue?.location || destination}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="px-6 py-12">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-white">Gallery</h2>
          <p className="mt-1 text-xs text-white/50">Experience the venue through our exclusive photography</p>
        </div>

        {/* Main Image */}
        <div className="mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
          <img 
            key={selectedImage}
            src={images[selectedImage]} 
            alt={`${venueName} - Image ${selectedImage + 1}`}
            className="h-full w-full object-cover object-center animate-fade-in"
          />
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-9 gap-2">
          {images.map((img, index) => (
              <button
                key={index}
                onClick={() => handleImageSelect(index)}
                className={`
                aspect-[4/5] overflow-hidden rounded-xl transition-all
                ${selectedImage === index 
                  ? 'ring-2 ring-bluelite-accent/50 ring-offset-2 ring-offset-black' 
                  : 'opacity-60 hover:opacity-100 ring-1 ring-white/10'
                }
              `}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Info & CTA Section */}
      <section className="px-6 py-16">
        <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur-[2px]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src={profileImage}
                  alt={`${venueName} profile`}
                  className="h-18 w-18 shrink-0 rounded-full object-cover ring-2 ring-white/20"
                />
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {venueName}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                An exclusive venue in the heart of {destination}, offering unparalleled luxury and sophistication. 
                Experience world-class service and ambiance at this premier destination.
              </p>
            </div>
            
            {/* Instagram Link */}
            {venue?.instagram && (
              <a
                href={venue.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-white/20"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/80">
                  <path d="M12 2C8.134 2 7.734 2.01 6.628 2.057C5.522 2.104 4.78 2.263 4.14 2.54C3.46 2.834 2.884 3.22 2.31 3.798C1.738 4.374 1.352 4.946 1.058 5.632C0.78 6.27 0.622 7.01 0.576 8.112C0.53 9.21 0.52 9.61 0.52 13.47C0.52 17.334 0.53 17.734 0.576 18.84C0.622 19.946 0.78 20.688 1.058 21.328C1.352 22.014 1.738 22.586 2.31 23.164C2.884 23.742 3.46 24.128 4.14 24.422C4.78 24.702 5.522 24.858 6.628 24.906C7.734 24.954 8.134 24.964 12 24.964C15.866 24.964 16.266 24.954 17.372 24.906C18.478 24.858 19.22 24.702 19.86 24.422C20.54 24.128 21.116 23.742 21.69 23.164C22.262 22.586 22.648 22.014 22.942 21.328C23.22 20.688 23.378 19.946 23.424 18.84C23.47 17.734 23.48 17.334 23.48 13.47C23.48 9.606 23.47 9.206 23.424 8.1C23.378 6.994 23.22 6.252 22.942 5.612C22.648 4.926 22.262 4.354 21.69 3.776C21.116 3.198 20.54 2.812 19.86 2.518C19.22 2.24 18.478 2.082 17.372 2.036C16.266 1.99 15.866 1.98 12 1.98ZM12 3.684C15.816 3.684 16.172 3.692 17.262 3.738C18.308 3.782 18.886 3.938 19.23 4.08C19.662 4.262 19.978 4.46 20.32 4.806C20.668 5.146 20.866 5.462 21.048 5.894C21.19 6.238 21.346 6.814 21.39 7.862C21.436 8.952 21.444 9.308 21.444 13.124C21.444 16.94 21.436 17.296 21.39 18.386C21.346 19.432 21.19 20.01 21.048 20.354C20.866 20.786 20.668 21.102 20.32 21.444C19.978 21.794 19.662 21.992 19.23 22.174C18.886 22.318 18.31 22.472 17.262 22.518C16.172 22.564 15.816 22.572 12 22.572C8.184 22.572 7.828 22.564 6.738 22.518C5.692 22.472 5.114 22.318 4.77 22.174C4.338 21.992 4.022 21.794 3.68 21.444C3.332 21.102 3.134 20.786 2.952 20.354C2.81 20.01 2.654 19.432 2.61 18.386C2.564 17.296 2.556 16.94 2.556 13.124C2.556 9.308 2.564 8.952 2.61 7.862C2.654 6.814 2.81 6.238 2.952 5.894C3.134 5.462 3.332 5.146 3.68 4.806C4.022 4.46 4.338 4.262 4.77 4.08C5.114 3.938 5.692 3.782 6.738 3.738C7.828 3.692 8.184 3.684 12 3.684ZM12 8.252C9.606 8.252 7.66 10.198 7.66 12.592C7.66 14.986 9.606 16.932 12 16.932C14.394 16.932 16.34 14.986 16.34 12.592C16.34 10.198 14.394 8.252 12 8.252ZM12 15.544C10.48 15.544 9.248 14.312 9.248 12.792C9.248 11.272 10.48 10.04 12 10.04C13.52 10.04 14.752 11.272 14.752 12.792C14.752 14.312 13.52 15.544 12 15.544ZM18.76 7.166C18.234 7.166 17.81 6.742 17.81 6.216C17.81 5.69 18.234 5.266 18.76 5.266C19.286 5.266 19.71 5.69 19.71 6.216C19.71 6.742 19.286 7.166 18.76 7.166Z" fill="currentColor"/>
                </svg>
              </a>
            )}
          </div>

          <button
            onClick={() => onContactConcierge(venue)}
            className="mt-8 w-full rounded-xl bg-white/10 px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-white/90 ring-1 ring-white/20 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-bluelite-accent/40"
          >
            Contact Concierge
          </button>
        </div>
      </section>

      {/* Map Section */}
      {venue?.plusCode && (
        <section className="px-6 pb-16">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-white">Location</h2>
            <p className="mt-1 text-xs text-white/50">Find us on the map</p>
          </div>
          
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            {/* Custom Map Component */}
            <CustomMap 
              plusCode={venue.plusCode} 
              venueName={venueName}
            />
          </div>
          
          {/* Plus Code Display */}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-bluelite-accent">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-xs text-white/60">{venue.plusCode}</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(venue.plusCode)}
              className="text-xs text-bluelite-accent hover:text-white transition"
            >
              Copy
            </button>
          </div>
          
          {/* Directions Button */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.plusCode)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L4 7v10c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V7l-8-5z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Get Directions</span>
          </a>
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 pb-6 pt-2 text-[10px] text-white/40">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between sm:gap-0">
          <span className="uppercase tracking-[0.2em]">Private network only</span>
          <span>© {new Date().getFullYear()} Bluelite — Discretion. Precision. Elegance.</span>
        </div>
      </footer>
    </div>
  )
}

export default VenueDetail
