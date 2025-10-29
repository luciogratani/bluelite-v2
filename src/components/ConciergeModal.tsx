'use client'
import { useState } from 'react'
import Badge from './Badge'
import type { ConciergeModalProps } from '../types/components'
import type { ConciergeFormData } from '../types/portfolio'

const ConciergeModal = ({ isOpen, onClose, onSubmit }: ConciergeModalProps) => {
  const [formStep, setFormStep] = useState(0)
  const [formData, setFormData] = useState<ConciergeFormData>({
    name: '',
    contactMethod: 'phone',
    contactDetails: '',
    services: [],
    timeline: '',
    budget: '',
    requirements: '',
    source: ''
  })

  const handleSubmit = () => {
    onSubmit(formData)
    onClose()
    setFormStep(0)
    setFormData({
      name: '',
      contactMethod: 'phone',
      contactDetails: '',
      services: [],
      timeline: '',
      budget: '',
      requirements: '',
      source: ''
    })
  }

  const handleClose = () => {
    onClose()
    setFormStep(0)
    setFormData({
      name: '',
      contactMethod: 'phone',
      contactDetails: '',
      services: [],
      timeline: '',
      budget: '',
      requirements: '',
      source: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white/[0.08] p-8 ring-1 ring-white/20 backdrop-blur-2xl shadow-2xl">
        {/* Close Button */}
        <div className="absolute top-6 right-6">
          <button
            onClick={handleClose}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Form Steps */}
        <div className="min-h-[250px] flex items-center justify-center">
          {/* Step 0: Welcome */}
          {formStep === 0 && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 mt-8 animate-fade-in">
              {/* Privacy Badge */}
              <Badge variant="info">Encrypted & Confidential</Badge>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold tracking-tight text-white">
                  Personal Concierge Service
                </h3>
                <p className="text-sm text-white/60 max-w-md">
                  Our senior concierge team will handle your request with absolute discretion. 
                  Simply provide your details and we'll take care of the rest.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Contact Information */}
          {formStep === 1 && (
            <div className="space-y-6 animate-slide-in">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Preferred Contact Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, contactMethod: 'phone'})}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 transition ${
                      formData.contactMethod === 'phone' 
                        ? 'bg-white/10 ring-white/20 text-white' 
                        : 'bg-white/5 ring-white/10 text-white/60 hover:bg-white/[0.07]'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm">Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, contactMethod: 'email'})}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 ring-1 transition ${
                      formData.contactMethod === 'email' 
                        ? 'bg-white/10 ring-white/20 text-white' 
                        : 'bg-white/5 ring-white/10 text-white/60 hover:bg-white/[0.07]'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm">Email</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  {formData.contactMethod === 'phone' ? 'Phone Number *' : 'Email Address *'}
                </label>
                <input
                  type={formData.contactMethod === 'phone' ? 'tel' : 'email'}
                  value={formData.contactDetails}
                  onChange={(e) => setFormData({...formData, contactDetails: e.target.value})}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none"
                  placeholder={formData.contactMethod === 'phone' ? '+1 (555) 123-4567' : 'your@email.com'}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Services, Timeline & Budget */}
          {formStep === 2 && (
            <div className="space-y-6 animate-slide-in">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Services Needed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'transfer', label: 'Private Transfer' },
                    { id: 'villa', label: 'Villa Rental' },
                    { id: 'jet', label: 'Private Jet' },
                    { id: 'yacht', label: 'Yacht Charter' },
                    { id: 'car', label: 'Supercar Rental' },
                    { id: 'legal', label: 'Legal Counsel' }
                  ].map((service) => (
                    <label key={service.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 cursor-pointer hover:bg-white/[0.07] transition">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, services: [...formData.services, service.id]})
                          } else {
                            setFormData({...formData, services: formData.services.filter(s => s !== service.id)})
                          }
                        }}
                        className="w-4 h-4 text-bluelite-accent bg-white/5 border-white/20 rounded focus:ring-bluelite-accent/40"
                      />
                      <span className="text-sm text-white/80">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none"
                  >
                    <option value="">Select budget</option>
                    <option value="under-50k">Under $50K</option>
                    <option value="50-100k">$50K - $100K</option>
                    <option value="100k-plus">$100K+</option>
                    <option value="discuss">Discuss privately</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Requirements & Submit */}
          {formStep === 3 && (
            <div className="space-y-6 animate-slide-in">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  rows={4}
                  className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/40 ring-1 ring-white/10 backdrop-blur-sm transition focus:ring-2 focus:ring-bluelite-accent/40 focus:outline-none resize-none"
                  placeholder="Any specific requirements or preferences..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-white/10 px-6 py-4 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md shadow-lg shadow-black/20 transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-bluelite-accent/40"
                >
                  Submit Request
                </button>
                <p className="mt-3 text-center text-xs text-white/50">
                  You'll hear from our senior concierge team within 2 hours
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {formStep === 0 ? (
          /* Welcome Screen - Centered Get Started */
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setFormStep(formStep + 1)}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm text-white ring-1 ring-white/20 backdrop-blur-md shadow-lg shadow-black/20 transition hover:bg-white/15"
            >
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : (
          /* Form Steps - Standard Navigation */
          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setFormStep(formStep - 1)}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.07]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            
            {formStep < 3 ? (
              <button
                type="button"
                onClick={() => setFormStep(formStep + 1)}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/20 backdrop-blur-md shadow-lg shadow-black/20 transition hover:bg-white/15"
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </div>
        )}

        {/* Step Counter */}
        {formStep > 0 && (
          <div className="mt-4 flex justify-center">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`w-2 h-2 rounded-full transition ${
                  step <= formStep 
                    ? 'bg-white/60' 
                    : 'bg-white/20'
                }`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConciergeModal
