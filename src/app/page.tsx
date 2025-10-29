'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import Noise from '../components/Noise'
import ConciergeModal from '../components/ConciergeModal'
import GateScreen, { WelcomeBackScreen } from '../components/GateScreen'
import CountUp from '../components/CountUp'
import VenueShowcase from '../components/VenueShowcase'
import VenueDetail from '../components/VenueDetail'
import Badge from '../components/Badge'
import Admin from '../components/Admin'
import type { Venue } from '../types/portfolio'
import type { ConciergeFormData } from '../types/portfolio'

// ⚙️ TOGGLE PER ATTIVARE/DISATTIVARE IL GATE SCREEN
// Cambia questo valore per saltare il gate screen durante lo sviluppo
const ENABLE_GATE_SCREEN = true // false per disabilitare

// Custom hook for scroll-based blur
const useScrollBlur = () => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Convert scroll distance to blur amount
  // Adjust 300 based on how fast you want blur to increase
  const maxBlurDistance = 300 // pixels
  const blurRatio = Math.min(scrollY / maxBlurDistance, 1)
  
  return {
    blurAmount: blurRatio * 12, // 0-12px blur
    scaleAmount: 1 + blurRatio * 0.15, // 1.0-1.15 scale
    scrollY
  }
}

export default function HomePage() {
  const { portfolioData, loading } = usePortfolio()
  const destinations = (portfolioData?.destinations ?? []).filter(dest => !dest.hidden)

  const [route, setRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash || '#/'
    }
    return '#/'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const onHashChange = () => setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Aggiorna gli stati del gate screen quando cambia la rotta
  useEffect(() => {
    if (route === '#/admin') {
      setShowGate(false)
      setIsReturningUser(false)
    }
  }, [route])

  // Scroll-based blur effect for hero video
  const { blurAmount, scaleAmount, scrollY } = useScrollBlur()

  // Concierge modal state
  const [showConciergeForm, setShowConciergeForm] = useState(false)

  // Gate screen state - INIZIALIZZA SEMPRE FALSE SUL SERVER
  const [showGate, setShowGate] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)

  // Usa useEffect per impostare gli stati dopo l'hydration
  useEffect(() => {
    if (!ENABLE_GATE_SCREEN) return
    if (typeof window === 'undefined') return
    
    // Non mostrare il gate screen se si è in admin
    if (route === '#/admin') return
    
    const userData = localStorage.getItem('blueliteUser')
    const hasSeenGate = sessionStorage.getItem('blueliteGateSeen')
    
    // Se ha già visto il gate in questa sessione, non mostrarlo
    if (hasSeenGate) return
    
    setShowGate(true)
    
    // Controlla se è un utente che ritorna
    if (userData && !hasSeenGate) {
      setIsReturningUser(true)
    }
  }, [route])

  const [isSplashFading, setIsSplashFading] = useState(false)

  const handleGateEnter = () => {
    // Inizia fade out
    setIsSplashFading(true)
    
    // Dopo l'animazione, nascondi completamente
    setTimeout(() => {
      sessionStorage.setItem('blueliteGateSeen', 'true')
      setShowGate(false)
      setIsReturningUser(false)
      setIsSplashFading(false)
      
      // Aggiorna lastVisit e visitCount
      const userData = localStorage.getItem('blueliteUser')
      if (userData) {
        const user = JSON.parse(userData)
        user.lastVisit = new Date().toISOString()
        user.visitCount = (user.visitCount || 1) + 1
        localStorage.setItem('blueliteUser', JSON.stringify(user))
      }
    }, 600) // Durata dell'animazione fade
  }

  const currentDestination = useMemo(() => {
    const match = route.match(/^#\/destination\/(.+)$/)
    if (!match) return null
    const slug = decodeURIComponent(match[1]).toLowerCase()
    return destinations.find((d) => d.name.toLowerCase() === slug) || null
  }, [route, destinations])

  // Calculate venue statistics for current destination
  const venueStats = useMemo(() => {
    if (!currentDestination?.venues) {
      return {
        nightclubs: 0,
        beachclubs: 0,
        restaurants: 0,
        hotels: 0,
        festive: 0,
        total: 0
      }
    }

    const venues = currentDestination.venues
    const nightclubs = venues.nightclubs?.length || 0
    const beachclubs = venues.beachclubs?.length || 0
    const restaurants = venues.restaurants?.length || 0
    const hotels = venues.hotels?.length || 0
    const festive = venues.festive?.length || 0
    const total = nightclubs + beachclubs + restaurants + hotels + festive

    return {
      nightclubs,
      beachclubs,
      restaurants,
      hotels,
      festive,
      total
    }
  }, [currentDestination])

  // Parse venue route: #/destination/dubai/venue/nightclubs/ushuaia-dubai
  const currentVenue = useMemo(() => {
    const match = route.match(/^#\/destination\/([^\/]+)\/venue\/([^\/]+)\/(.+)$/)
    if (!match) return null
    
    const [, destinationSlug, categorySlug, venueSlug] = match
    const destination = destinations.find((d) => d.name.toLowerCase() === destinationSlug.toLowerCase())
    
    if (!destination?.venues) return null
    
    // Find venue in the specified category
    const categoryVenues = destination.venues[categorySlug] || []
    const venue = categoryVenues.find((v) => {
      const slug = v.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return slug === venueSlug
    })
    
    return venue ? { venue, destination: destination.name, category: categorySlug } : null
  }, [route, destinations])

  // Se il gate screen è attivo, mostra SOLO quello (splash screen completa)
  if (showGate || isReturningUser) {
    const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('blueliteUser') || '{}') : {}
    
    return (
      <div className={`transition-opacity duration-600 ${isSplashFading ? 'opacity-0' : 'opacity-100'}`}>
        {showGate && !isReturningUser ? (
          <GateScreen onEnter={handleGateEnter} />
        ) : (
          <WelcomeBackScreen
            userName={userData.name}
            visitCount={userData.visitCount || 1}
            city={userData.city}
            onEnter={handleGateEnter}
          />
        )}
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // Render admin page
  if (route === '#/admin') {
    return <Admin />
  }

  // Render venue detail page
  if (currentVenue) {
    return (
      <VenueDetail
        venue={currentVenue.venue}
        destination={currentVenue.destination}
        category={currentVenue.category}
        onContactConcierge={(venue: Venue) => {
          console.log('Contact concierge for:', venue)
          setShowConciergeForm(true)
        }}
      />
    )
  }

  if (currentDestination) {
    const d = currentDestination
    return (
      <div className="min-h-screen bg-black text-bluelite-text">
        {/* Detail Hero */}
        <section className="relative h-svh xs:h-screen overflow-hidden">
          <Noise patternRefreshInterval={2} patternAlpha={12} />
          <div className="pointer-events-none absolute inset-0 vignette" />

          <div className="relative z-10 flex h-full flex-col px-6 pt-safe pb-safe">
            {/* Brand line */}
            <div className="flex items-center justify-between pt-2">
              <a href="#/" className="micro-translate inline-flex items-center gap-2 text-white/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M16 5l-8 7 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs uppercase tracking-[0.2em]">Back</span>
              </a>
              <div className="h-6 w-px bg-white/10" />
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">Destination</div>
            </div>

            {/* Content */}
            <div className="mt-auto">
              <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-[0.25em]">
                <span>Highlight</span>
                <span className="h-3 w-px bg-white/10" />
                <span>{d.highlight}</span>
              </div>
              <h1 className="mt-2 text-[34px] leading-9 font-semibold tracking-tight text-white">
                {d.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {d.description}
              </p>

              <div className="mt-6 flex gap-3">
                <a href="#destinations" className="micro-translate inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-bluelite-accent/40">
                  Choose another destination
                </a>
                <a href="#contact" className="micro-translate inline-flex items-center gap-2 rounded-full bg-white/0 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 ring-1 ring-white/10 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-bluelite-accent/40">
                  Contact concierge
                </a>
              </div>
            </div>

            <div className="mt-10 mb-1 flex items-center justify-center text-white/40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-bounce">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </section>

        {/* By The Numbers - Venue Statistics */}
        <section className="px-6 py-16">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/50 ring-1 ring-white/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Verified Partners</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Our Network in {d.name}
            </h2>
            <p className="mt-2 text-sm text-white/50 max-w-md mx-auto">
              Curated partnerships with the city's most exclusive venues
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 max-w-4xl mx-auto">
            {/* Locali Notturni */}
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-[2px] text-center transition hover:bg-white/[0.07]">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-white">
                <CountUp from={0} to={venueStats.nightclubs} duration={1.5} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Night Clubs
              </div>
            </div>

            {/* Beach Clubs */}
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-[2px] text-center transition hover:bg-white/[0.07]">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                  <path d="M12 3v6M12 15v6M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-white">
                <CountUp from={0} to={venueStats.beachclubs} duration={1.5} delay={0.1} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Beach Clubs
              </div>
            </div>

            {/* Ristoranti */}
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-[2px] text-center transition hover:bg-white/[0.07]">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                  <path d="M8 2c0 3 1.5 4 3 6 1.5-2 3-3 3-6M11 8v13M8 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 8c-1.5 0-2.5-1-2.5-2.5S6.5 3 8 3M15 8c1.5 0 2.5-1 2.5-2.5S16.5 3 15 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-white">
                <CountUp from={0} to={venueStats.restaurants} duration={1.5} delay={0.2} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Restaurants
              </div>
            </div>

            {/* Hotel */}
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-[2px] text-center transition hover:bg-white/[0.07]">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                  <path d="M3 21h18M9 8h6M10 21V8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v13M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-white">
                <CountUp from={0} to={venueStats.hotels} duration={1.5} delay={0.3} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Hotels
              </div>
            </div>

            {/* Festive */}
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-[2px] text-center transition hover:bg-white/[0.07]">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                  <path d="M12 2v20M2 12h20M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="text-3xl font-semibold tracking-tight text-white">
                <CountUp from={0} to={venueStats.festive} duration={1.5} delay={0.4} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Festive
              </div>
            </div>
          </div>

          {/* Total Count */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-5 py-2 ring-1 ring-white/10 backdrop-blur-[2px]">
              <span className="text-2xl font-semibold tracking-tight text-white">
                <CountUp from={0} to={venueStats.total} duration={2} delay={0.5} />
              </span>
              <span className="h-4 w-px bg-white/10" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Total Partners</span>
            </div>
          </div>
        </section>

        {/* Venue Showcase */}
        {d.venues && (
          <VenueShowcase
            venues={d.venues}
            destinationName={d.name}
          />
        )}

        <footer className="px-6 pb-6 pt-2 text-[10px] text-white/40">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between sm:gap-0">
            <span className="uppercase tracking-[0.2em]">Private network only</span>
            <span>© {new Date().getFullYear()} Bluelite — Discretion. Precision. Elegance.</span>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-bluelite-text">
      {/* Hero */}
        <section className="relative h-svh xs:h-screen overflow-hidden">
          {/* Background video */}
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-all duration-500 ease-out"
              style={{ 
                filter: `blur(${blurAmount}px) brightness(${0.8 + (1 - blurAmount/12) * 0.2})`,
                transform: `scale(${scaleAmount})`,
                willChange: 'filter, transform'
              }}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              webkit-playsinline="true"
              x-webkit-airplay="allow"
            >
              <source src="/hero_bw.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

        {/* Vertical vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 0% via-transparent 35% via-transparent 65% to-black/45 100%" />

        {/* Grain + vignette layers */}
        <Noise patternRefreshInterval={2} patternAlpha={10} />
        <div className="pointer-events-none absolute inset-0 vignette" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col px-6 pt-safe pb-safe">
          {/* Brand line */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm tracking-widest text-white/60">BLUELITE</div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">The art of Luxury</div>
          </div>

          {/* Headline + subcopy + CTA */}
          <div className="mt-auto">
            <h1 className="text-[28px] leading-8 font-semibold tracking-tight text-white">
              Journeys for the discerning
            </h1>
            <p className="mt-2 text-white/60 text-sm">
              A curated selection of destinations crafted for absolute comfort and privacy.
            </p>
            <a
              href="#destinations"
              className="micro-translate mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs \
               uppercase tracking-[0.2em] text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none \
                focus:ring-2 focus:ring-bluelite-accent/40 backdrop-blur-[2px]"
            >
              Explore destinations
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Scroll cue */}
          <div className="mt-10 mb-1 flex items-center justify-center text-white/40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-bounce">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* List */}
      <main id="destinations" className="px-6 pb-10">
        <section className="pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Choose your destination</h2>
          <p className="mt-1 text-xs text-white/50">Curated places for refined journeys</p>

          <div className="mt-6 divide-y divide-white/10 rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-[2px]">
            {destinations.map((d) => (
              <a
                key={d.name}
                href={`#/destination/${encodeURIComponent(d.name.toLowerCase())}`}
                className="group block px-4 py-5 focus:outline-none focus:ring-2 focus:ring-bluelite-accent/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40 text-[10px] uppercase tracking-[0.25em]">Destination</span>
                      <span className="h-3 w-px bg-white/10" />
                      <span className="text-white/50 text-[10px] uppercase tracking-[0.25em]">{d.highlight}</span>
                    </div>
                    <h3 className="mt-2 text-[32px] leading-8 font-semibold tracking-tight text-white">
                      {d.name}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      {d.description}
                    </p>
                  </div>
                  <div className="shrink-0 self-center text-white/40 transition-transform group-hover:translate-x-0.5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Private Network Only Section */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="info">Exclusive Access</Badge>
            <h2 className="mt-6 text-[32px] leading-9 font-semibold tracking-tight text-white">
              Private Network Only
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/50 max-w-lg mx-auto">
              Verified members only. No public listings. Every booking is handled with absolute discretion through our secure concierge team.
            </p>
          </div>
        </section>

        {/* Concierge Services Section */}
        <section id="services" className="px-6 pb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Concierge services</h2>
            <p className="mt-1 text-xs text-white/50">On-demand luxury at your fingertips</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Villa Rental */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-[2px] transition hover:bg-white/[0.07]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                      <path d="M3 21h18M3 10l9-7 9 7M5 10v11M19 10v11M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Curated Portfolio</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    Villa Rental
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Exclusive estates in the world's most sought-after locations
                  </p>
                </div>
                <div className="ml-4 text-white/30 transition-transform group-hover:translate-x-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Private Jet */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-[2px] transition hover:bg-white/[0.07]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                      <path d="M3 21h18M10 21V10l-7-3v3l2 2v3M14 21V10l7-3v3l-2 2v3M12 4l4 6M12 4l-4 6M12 4V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">On Demand</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    Private Jet
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Charter flights tailored to your schedule, anywhere in the world
                  </p>
                </div>
                <div className="ml-4 text-white/30 transition-transform group-hover:translate-x-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Yacht Charter */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-[2px] transition hover:bg-white/[0.07]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                      <path d="M2 20l10-15 10 15M12 5v15M6 20h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Crewed & Captained</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    Yacht Charter
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Superyachts with full crew for Mediterranean and Caribbean waters
                  </p>
                </div>
                <div className="ml-4 text-white/30 transition-transform group-hover:translate-x-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Supercar Rental */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-[2px] transition hover:bg-white/[0.07]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                      <path d="M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 0V7a1 1 0 0 1 1-1h3l2-3h4l2 3h3a1 1 0 0 1 1 1v10M19 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Premium Fleet</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    Supercar Rental
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Ferrari, Lamborghini, Rolls-Royce — delivered to your location with white-glove service
                  </p>
                </div>
                <div className="ml-4 text-white/30 transition-transform group-hover:translate-x-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Private Transfer */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-[2px] transition hover:bg-white/[0.07] mt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="8.5" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="15.5" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Available 24/7</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    Private Transfer
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Executive chauffeur service with luxury vehicles and professional drivers
                  </p>
                </div>
                <div className="ml-4 text-white/30 transition-transform group-hover:translate-x-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Private Legal Counsel */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-[2px] transition hover:bg-white/[0.07]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-white/60">
                      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 6v12M16 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Confidential</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">
                    Private Legal Counsel
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Discreet legal representation, reputation protection, and risk management by top-tier attorneys
                  </p>
                </div>
                <div className="ml-4 text-white/30 transition-transform group-hover:translate-x-0.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowConciergeForm(true)}
              className="micro-translate inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-white/90 ring-1 ring-white/20 backdrop-blur-md shadow-lg shadow-black/20 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-bluelite-accent/40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Request concierge service
            </button>
        </div>
        </section>
      </main>

      <footer className="px-6 pb-6 pt-2 text-[10px] text-white/40">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between sm:gap-0">
          <span className="uppercase tracking-[0.2em]">Private network only</span>
          <span>© {new Date().getFullYear()} Bluelite - Discretion. Precision. Elegance.</span>
        </div>
      </footer>

      {/* Concierge Request Modal */}
      <ConciergeModal
        isOpen={showConciergeForm}
        onClose={() => setShowConciergeForm(false)}
        onSubmit={(formData: ConciergeFormData) => {
          console.log('Form submitted:', formData)
          // Handle form submission here
        }}
      />
    </div>
  )
}