export interface Venue {
  name: string
  location: string
  tier: string
  images: string[]
  profileImage?: string
  instagram: string
  plusCode: string
}

export interface Venues {
  nightclubs: Venue[]
  beachclubs: Venue[]
  restaurants: Venue[]
  hotels: Venue[]
  festive: Venue[]
  [key: string]: Venue[] // Permette accesso dinamico alle categorie
}

export interface Destination {
  name: string
  description: string
  highlight: string
  venues: Venues
  hidden?: boolean // Opzionale - esiste solo se settato in Supabase
}

export interface PortfolioData {
  destinations: Destination[]
}

export interface ConciergeFormData {
  name: string
  contactMethod: 'phone' | 'email'
  contactDetails: string
  services: string[]
  timeline: string
  budget: string
  requirements: string
  source: string
}
