'use client'

import type { BadgeProps } from '../types/components'

const Badge = ({ 
  children, 
  variant = 'info', 
  icon, 
  className = '',
  onClick 
}: BadgeProps) => {
  const variants = {
    info: 'bg-white/5 text-white/50 ring-1 ring-white/10',
    partner: 'bg-bluelite-accent/10 text-bluelite-accent/80 ring-1 ring-bluelite-accent/20',
    premium: 'bg-bluelite-accent/20 text-bluelite-accent ring-1 ring-bluelite-accent/30'
  }

  const baseClasses = 'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em]'
  
  // Icons based on variant
  const getIcon = () => {
    if (icon) return icon
    
    switch (variant) {
      case 'premium':
      case 'partner':
        return (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {variant === 'premium' ? (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
            ) : (
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        )
      case 'info':
      default:
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L2 7v6c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
    }
  }

  const content = onClick ? (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className} transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-bluelite-accent/40`}
    >
      {getIcon()}
      <span>{children}</span>
    </button>
  ) : (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {getIcon()}
      <span>{children}</span>
    </div>
  )

  return content
}

export default Badge
