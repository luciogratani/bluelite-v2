import type { ReactNode } from 'react'
import type { ConciergeFormData } from './portfolio'

export interface CountUpProps {
  to: number
  from?: number
  direction?: 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
  startWhen?: boolean
  separator?: string
  onStart?: () => void
  onEnd?: () => void
}

export interface BadgeProps {
  children: ReactNode
  variant?: 'info' | 'partner' | 'premium'
  icon?: ReactNode
  className?: string
  onClick?: () => void
}

export interface ConciergeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: ConciergeFormData) => void
}

export interface CustomMapProps {
  plusCode: string
  venueName: string
}

export interface Coordinates {
  lat: number
  lng: number
}
