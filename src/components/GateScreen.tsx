'use client'
import { useState } from 'react'
import Badge from './Badge'

interface GateScreenProps {
  onEnter: () => void;
}

const GateScreen: React.FC<GateScreenProps> = ({ onEnter }) => {
  const [step, setStep] = useState<'welcome' | 'member' | 'new' | 'confirm'>('welcome')
  const [formData, setFormData] = useState<{
    name: string;
    city: string;
    memberCode: string;
    visitCount?: number;
  }>({
    name: '',
    city: '',
    memberCode: ''
  })

  const handleNewUser = () => {
    if (!formData.name.trim() || !formData.city.trim()) {
      return
    }

    // Salva in localStorage
    const userData = {
      name: formData.name,
      city: formData.city,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitCount: 1
    }
    localStorage.setItem('blueliteUser', JSON.stringify(userData))

    // Aggiorna il formData con i dati completi per mostrare nella conferma
    setFormData({...formData, visitCount: 1})

    // Mostra conferma
    setStep('confirm')
  }

  const handleMemberCode = () => {
    // Per ora mostra messaggio che il codice non è valido
    // In futuro qui andrebbe la validazione del codice
    alert('This code is not valid. Our concierge team will contact you shortly.')
  }

  const handleEnter = () => {
    onEnter()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-lg px-6">
        {/* Welcome Screen */}
        {step === 'welcome' && (
          <div className="space-y-8 text-center animate-fade-in">
            {/* Logo with breathing animation */}
            <div className="flex justify-center">
              <div className="text-2xl tracking-[0.3em] text-white font-semibold animate-breathe">
                BLUELITE
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="flex justify-center">
              <Badge variant="info">Encrypted & Confidential</Badge>
            </div>

            <div className="space-y-6 pt-8">
              <p className="text-sm text-white/60">Are you a member?</p>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('member')}
                  className="w-full rounded-xl bg-white/10 px-6 py-4 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15"
                >
                  I have a member code
                </button>

                <button
                  onClick={() => setStep('new')}
                  className="w-full rounded-xl bg-white/5 px-6 py-4 text-sm font-medium text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
                >
                  I'm new here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Member Code Screen */}
        {step === 'member' && (
          <div className="space-y-8 text-center animate-fade-in">
            <div className="text-xl tracking-tight text-white font-semibold">
              Enter your member code
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={formData.memberCode}
                onChange={(e) => setFormData({...formData, memberCode: e.target.value})}
                className="w-full rounded-xl bg-white/5 px-4 py-3 text-center text-white placeholder-white/40 ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none uppercase tracking-widest"
                placeholder="XXXX-XXXX-XXXX"
              />

              <p className="text-xs text-white/50">
                Forgot your code? Contact concierge
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>

              <button
                onClick={handleMemberCode}
                className="flex-1 rounded-xl bg-white/10 px-6 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* New User Screen */}
        {step === 'new' && (
          <div className="space-y-8 text-center animate-fade-in">
            <div>
              <h2 className="text-xl tracking-tight text-white font-semibold">
                Welcome to Bluelite
              </h2>
              <p className="mt-2 text-sm text-white/60">
                We'd like to know you better
              </p>
            </div>

            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Your name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none"
                  placeholder="Marco Rossi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  City of residence *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none"
                  placeholder="Milano"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>

              <button
                onClick={handleNewUser}
                disabled={!formData.name.trim() || !formData.city.trim()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Skip option - small and discreet */}
            <button
              onClick={handleEnter}
              className="text-xs text-white/30 hover:text-white/50 transition"
            >
              Continue as guest →
            </button>
          </div>
        )}

        {/* Confirm Screen */}
        {step === 'confirm' && (
          <div className="space-y-8 text-center animate-fade-in">
            <div className="space-y-3">
              <div className="text-2xl tracking-tight text-white font-semibold">
                Perfect, {formData.name}
              </div>
              <p className="text-sm text-white/60">
                from {formData.city}
              </p>
              {/* First visit counter */}
              <p className="text-xs text-white/40">
                Your first visit • Welcome to Bluelite
              </p>
            </div>

            <p className="text-sm text-white/70 max-w-md mx-auto">
              You're about to access our private collection of curated experiences.
            </p>

            <div className="pt-4">
              <button
                onClick={handleEnter}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-4 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15"
              >
                Enter Bluelite
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component for returning users
interface WelcomeBackScreenProps {
  userName: string;
  visitCount: number;
  city: string;
  onEnter: () => void;
}

export const WelcomeBackScreen: React.FC<WelcomeBackScreenProps> = ({ userName, visitCount, city, onEnter }) => {
  // Funzione per determinare il messaggio personalizzato
  const getWelcomeMessage = () => {
    const count = visitCount || 1

    if (count === 1) {
      return `Welcome back, ${userName}`
    } else if (count === 2) {
      return `Good to see you again, ${userName}`
    } else if (count === 3) {
      return `You're becoming a regular, ${userName}`
    } else if (count === 4) {
      return `Always a pleasure, ${userName}`
    } else if (count >= 5 && count < 10) {
      return `Welcome back to your private collection, ${userName}`
    } else if (count >= 10) {
      return `It's wonderful to have you back, ${userName}`
    }

    return `Welcome back, ${userName}` // fallback
  }

  // Funzione per determinare il messaggio secondario
  const getSecondaryMessage = () => {
    const count = visitCount || 1

    if (count === 2) {
      return "We're glad you're finding value in our curated experiences."
    } else if (count === 3) {
      return "Your continued trust means everything to us."
    } else if (count >= 4) {
      return `Ready for your next adventure from ${city}?`
    }

    return ""
  }

  const welcomeMessage = getWelcomeMessage()
  const secondaryMessage = getSecondaryMessage()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-fade-in">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-lg px-6 text-center space-y-8">
        {/* Logo with breathing animation */}
        <div className="flex justify-center">
          <div className="text-2xl tracking-[0.3em] text-white font-semibold animate-breathe">
            BLUELITE
          </div>
        </div>

        <div className="space-y-4">
          {/* Main welcome message */}
          <div className="text-xl tracking-tight text-white font-semibold">
            {welcomeMessage}
          </div>

          {/* Secondary message (optional) */}
          {secondaryMessage && (
            <p className="text-sm text-white/60 max-w-md mx-auto">
              {secondaryMessage}
            </p>
          )}

          {/* Visit counter (subtle) */}
          {visitCount > 1 && (
            <p className="text-xs text-white/40">
              Visit #{visitCount} • Since your first visit
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15"
          >
            Continue
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GateScreen

