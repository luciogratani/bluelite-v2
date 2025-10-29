'use client'
import { useState, useEffect } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'

interface AdminProps {}

interface Destination {
  name: string;
  description: string;
  highlight: string;
  hidden: boolean;
  venues: {
    nightclubs: Venue[];
    beachclubs: Venue[];
    restaurants: Venue[];
    hotels: Venue[];
    festive: Venue[];
  };
}

interface Venue {
  name: string;
  location: string;
  tier: 'standard' | 'featured' | 'premium';
  instagram: string;
  plusCode: string;
  images: string[];
}

interface DestinationsTabProps {
  localData: any;
  setLocalData: (data: any) => void;
  editingDestination: number | null;
  setEditingDestination: (index: number | null) => void;
  showDeleteConfirm: number | null;
  setShowDeleteConfirm: (index: number | null) => void;
}

interface VenuesTabProps {
  localData: any;
  setLocalData: (data: any) => void;
  instagramSessionActive: boolean;
  instagramSessionId: string | null;
  scrapingProgress: { [key: number]: { active: boolean; progress: number; message: string } };
  setScrapingProgress: React.Dispatch<React.SetStateAction<{ [key: number]: { active: boolean; progress: number; message: string } }>>;
  addToast: (type: 'success' | 'error' | 'info', message: string, duration?: number) => void;
}

const Admin: React.FC<AdminProps> = () => {
  const { portfolioData: initialData, loading, error, savePortfolio } = usePortfolio()
  
  // Local state for editing
  const [localData, setLocalData] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [supabaseStatus, setSupabaseStatus] = useState('checking')
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activeTab, setActiveTab] = useState('destinations')
  const [editingDestination, setEditingDestination] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  
  // Instagram scraping state
  const [instagramSessionActive, setInstagramSessionActive] = useState(false)
  const [instagramSessionId, setInstagramSessionId] = useState<string | null>(null)
  
  // Progress and notification state
  const [scrapingProgress, setScrapingProgress] = useState<{ [key: number]: { active: boolean; progress: number; message: string } }>({})
  const [toastNotifications, setToastNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string; duration?: number }>>([])

  // Initialize local data when portfolio loads
  useEffect(() => {
    if (initialData) {
      setLocalData(JSON.parse(JSON.stringify(initialData)))
    }
  }, [initialData])

  // Check for changes
  useEffect(() => {
    if (initialData && localData) {
      const changed = JSON.stringify(initialData) !== JSON.stringify(localData)
      setHasChanges(changed)
    }
  }, [initialData, localData])

  // Check Supabase status
  useEffect(() => {
    if (loading) {
      setSupabaseStatus('checking')
    } else if (error) {
      setSupabaseStatus('error')
    } else if (initialData) {
      setSupabaseStatus('connected')
    }
  }, [loading, error, initialData])

  // Loading state
  if (loading || !localData) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  // Save all changes to database
  const handleUpdate = async () => {
    setSaving(true)
    const success = await savePortfolio(localData)
    setSaving(false)
    if (success) {
      setHasChanges(false)
      console.log('Portfolio updated successfully!')
    }
  }

  // Discard all changes
  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      setLocalData(JSON.parse(JSON.stringify(initialData)))
      setHasChanges(false)
      setEditingDestination(null)
    }
  }

  // Toast notification functions
  const addToast = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setToastNotifications(prev => [...prev, { id, type, message, duration }])
    
    // Auto remove after duration
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(toast => toast.id !== id))
    }, duration)
  }

  const removeToast = (id: string) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== id))
  }

  // Toggle Instagram browser session
  const toggleInstagramSession = async () => {
    if (instagramSessionActive && instagramSessionId) {
      // Close browser
      try {
        const response = await fetch('/api/scrape-instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            closeBrowser: true,
            sessionId: instagramSessionId
          })
        })
        
        if (response.ok) {
          setInstagramSessionActive(false)
          setInstagramSessionId(null)
          addToast('info', 'Instagram session closed')
          console.log('Instagram browser closed')
        }
      } catch (error) {
        console.error('Error closing Instagram browser:', error)
        // Reset state anyway
        setInstagramSessionActive(false)
        setInstagramSessionId(null)
      }
    } else {
      // Open browser
      try {
        const response = await fetch('/api/scrape-instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instagramHandle: 'dummy', // Placeholder
            venueName: 'dummy'
          })
        })
        
        const result = await response.json()
        
        if (result.success && result.status === 'waiting') {
          setInstagramSessionActive(true)
          setInstagramSessionId(result.sessionId)
          addToast('success', 'Instagram browser opened - Please login manually')
          console.log('Instagram browser opened')
        } else {
          // Check if it's a Vercel deployment error
          if (result.error && result.error.includes('headless')) {
            addToast('error', 'Instagram scraping is not available in production. Please use the local development environment.')
          } else {
            addToast('error', `Error: ${result.error}`)
          }
        }
      } catch (error) {
        console.error('Error opening Instagram browser:', error)
        // Check if it's a network error that might indicate Vercel deployment
        if (error instanceof TypeError && error.message.includes('fetch')) {
          addToast('error', 'Instagram scraping is not available in production. Please use the local development environment.')
        } else {
          addToast('error', 'Failed to open Instagram browser. Please try again.')
        }
      }
    }
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Bluelite Admin</h1>
              <p className="text-sm text-white/50 mt-1">Portfolio Management</p>
            </div>
            <div className="flex items-center gap-4">
              {saving && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white"></div>
                  Saving...
                </div>
              )}
              {error && (
                <div className="text-sm text-red-400">
                  Error: {error}
                </div>
              )}
              <div className="h-6 w-px bg-white/10" />
              <button
                onClick={() => window.location.href = '#/'}
                className="text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white transition"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className={`border-r border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-80'
        }`}>
          <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
            {/* Collapse Toggle */}
            <div className={`${sidebarCollapsed ? 'mb-4' : 'mb-6'}`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-full flex items-center justify-center p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition ${
                  sidebarCollapsed ? 'p-3' : ''
                }`}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {!sidebarCollapsed && (
                  <span className="ml-2 text-sm font-medium">Menu</span>
                )}
              </button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('destinations')}
                className={`w-full rounded-xl transition ${
                  activeTab === 'destinations'
                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                } ${
                  sidebarCollapsed 
                    ? 'flex items-center justify-center p-3' 
                    : 'text-left px-4 py-3'
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="font-medium">Destinations</span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('venues')}
                className={`w-full rounded-xl transition ${
                  activeTab === 'venues'
                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                } ${
                  sidebarCollapsed 
                    ? 'flex items-center justify-center p-3' 
                    : 'text-left px-4 py-3'
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M3 3h18v18H3V3zM7 7h10v2H7V7zM7 11h10v2H7v-2zM7 15h10v2H7v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="font-medium">Venues</span>
                  )}
                </div>
              </button>
            </nav>

            {/* Instagram Scraping Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                onClick={toggleInstagramSession}
                className={`w-full rounded-xl transition ${
                  instagramSessionActive
                    ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 text-white ring-2 ring-pink-500/50 shadow-lg shadow-pink-500/20'
                    : 'text-white/60 hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-600/10 hover:text-white/80'
                } ${
                  sidebarCollapsed 
                    ? 'flex items-center justify-center p-3' 
                    : 'text-left px-4 py-3'
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
                  </svg>
                  {!sidebarCollapsed && (
                    <span className="font-medium">
                      {instagramSessionActive ? 'End Session' : 'Scraping'}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto min-h-0">
          {activeTab === 'destinations' && (
            <DestinationsTab
              localData={localData}
              setLocalData={setLocalData}
              editingDestination={editingDestination}
              setEditingDestination={setEditingDestination}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
            />
          )}
          
          {activeTab === 'venues' && (
            <VenuesTab
              localData={localData}
              setLocalData={setLocalData}
              instagramSessionActive={instagramSessionActive}
              instagramSessionId={instagramSessionId}
              scrapingProgress={scrapingProgress}
              setScrapingProgress={setScrapingProgress}
              addToast={addToast}
            />
          )}
        </main>
      </div>

      {/* Footer with Update Button */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Supabase Status */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  supabaseStatus === 'connected' ? 'bg-green-400' :
                  supabaseStatus === 'error' ? 'bg-red-400' :
                  'bg-yellow-400 animate-pulse'
                }`}></div>
                <span className="text-xs text-white/60">
                  Supabase: {
                    supabaseStatus === 'connected' ? 'Connected' :
                    supabaseStatus === 'error' ? 'Error' :
                    'Checking...'
                  }
                </span>
              </div>
              {error && (
                <div className="text-xs text-red-400 max-w-md truncate">
                  {error}
                </div>
              )}
              <div className="text-xs text-white/40">
                {localData?.destinations?.length || 0} destinations
              </div>
            </div>

            {/* Update/Discard Buttons */}
            <div className="flex items-center gap-3">
              {hasChanges && (
                <>
                  <button
                    onClick={handleDiscard}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm font-medium ring-1 ring-white/10 hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
                  >
                    {saving ? 'Updating...' : 'Update Database'}
                  </button>
                </>
              )}
              {!hasChanges && (
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  All changes saved
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 transform ${
              toast.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-100' 
                : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-100'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 ml-2 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Destinations Tab Component
const DestinationsTab: React.FC<DestinationsTabProps> = ({
  localData,
  setLocalData,
  editingDestination,
  setEditingDestination,
  showDeleteConfirm,
  setShowDeleteConfirm
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const destinations = localData?.destinations || []

  // Add new destination
  const addDestination = () => {
    const newDestination = {
      name: 'New Destination',
      description: 'DESCRIPTION IN UPPERCASE.',
      highlight: 'HIGHLIGHT TEXT',
      hidden: false,
      venues: {
        nightclubs: [],
        beachclubs: [],
        restaurants: [],
        hotels: [],
        festive: []
      }
    }
    setLocalData({
      ...localData,
      destinations: [newDestination, ...destinations]
    })
    setEditingDestination(0) // First position
  }

  // Update destination field
  const updateDestination = (index: number, field: keyof Destination, value: any) => {
    setLocalData({
      ...localData,
      destinations: destinations.map((dest: Destination, i: number) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    })
  }

  // Delete destination
  const deleteDestination = (index: number) => {
    setLocalData({
      ...localData,
      destinations: destinations.filter((_: Destination, i: number) => i !== index)
    })
    setShowDeleteConfirm(null)
    if (editingDestination === index) {
      setEditingDestination(null)
    }
  }

  // Toggle hidden
  const toggleHidden = (index: number) => {
    updateDestination(index, 'hidden', !destinations[index].hidden)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newDestinations = [...destinations]
    const [moved] = newDestinations.splice(draggedIndex, 1)
    newDestinations.splice(index, 0, moved)
    
    setLocalData({
      ...localData,
      destinations: newDestinations
    })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Destinations</h2>
            <p className="text-sm text-white/50 mt-1">Manage your portfolio destinations | Drag and drop to reorder</p>
          </div>
          <button
            onClick={addDestination}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/20 transition hover:bg-white/15"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add Destination
          </button>
        </div>
      </div>

      {/* Destinations List */}
      <div className="space-y-4">
        {destinations.map((destination: Destination, index: number) => (
          <div
            key={index}
            draggable={editingDestination !== index}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`rounded-xl bg-white/5 ring-1 ring-white/10 transition ${
              draggedIndex === index ? 'opacity-50' : ''
            } ${
              editingDestination !== index ? 'cursor-move hover:bg-white/[0.07]' : ''
            }`}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Drag Handle */}
                {editingDestination !== index && (
                  <div className="flex-shrink-0 mt-1 self-start sm:self-auto">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <path d="M9 5h2M9 12h2M9 19h2M15 5h2M15 12h2M15 19h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingDestination === index ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Name</label>
                        <input
                          type="text"
                          value={destination.name}
                          onChange={(e) => updateDestination(index, 'name', e.target.value)}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Description</label>
                        <textarea
                          value={destination.description}
                          onChange={(e) => updateDestination(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Highlight</label>
                        <input
                          type="text"
                          value={destination.highlight}
                          onChange={(e) => updateDestination(index, 'highlight', e.target.value)}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-white">{destination.name}</h3>
                      <p className="text-sm text-white/60 mt-1 line-clamp-2">{destination.description}</p>
                      {destination.highlight && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                          </svg>
                          {destination.highlight}
                        </div>
                      )}
                      {destination.hidden && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-400">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.826M9.363 5.365A9.466 9.466 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.363 2.077m-2.171 1.927A9.466 9.466 0 0112 19c-7 0-10-7-10-7a13.16 13.16 0 011.363-2.077" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Hidden
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {editingDestination === index ? (
                    <button
                      onClick={() => setEditingDestination(null)}
                      className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 hover:bg-white/15 transition"
                    >
                      Done
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingDestination(index)}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 hover:bg-white/15 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleHidden(index)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 transition ${
                          destination.hidden
                            ? 'bg-orange-500/20 text-orange-400 ring-orange-500/30 hover:bg-orange-500/30'
                            : 'bg-white/10 text-white/80 ring-white/20 hover:bg-white/15'
                        }`}
                      >
                        {destination.hidden ? 'Show' : 'Hide'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(index)}
                        className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {destinations.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p>No destinations yet. Click "Add Destination" to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md mx-4 ring-1 ring-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Destination?</h3>
            <p className="text-white/60 mb-6">
              Are you sure you want to delete "{destinations[showDeleteConfirm]?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 hover:bg-white/15 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteDestination(showDeleteConfirm)}
                className="flex-1 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/30 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Venues Tab Component
const VenuesTab: React.FC<VenuesTabProps> = ({ localData, setLocalData, instagramSessionActive, instagramSessionId, scrapingProgress, setScrapingProgress, addToast }) => {
  const [selectedDestination, setSelectedDestination] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('nightclubs')
  const [editingVenue, setEditingVenue] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null)
  const [draggedVenueIndex, setDraggedVenueIndex] = useState<number | null>(null)
  const [scrapingSessions, setScrapingSessions] = useState<Record<number, string | null>>({})
  const [scrapedProfileImages, setScrapedProfileImages] = useState<Record<number, string>>({})
  const [scrapedImages, setScrapedImages] = useState<Record<number, string[]>>({})
  const [deleteImageMode, setDeleteImageMode] = useState<Record<number, boolean>>({})
  const [selectedImagesToDelete, setSelectedImagesToDelete] = useState<Record<number, Set<string>>>({})

  const destinations = localData?.destinations || []
  const currentDestination = destinations[selectedDestination]
  const currentVenues = currentDestination?.venues?.[selectedCategory] || []

  const categories = [
    { 
      key: 'nightclubs', 
      label: 'Nightclubs', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    },
    { 
      key: 'beachclubs', 
      label: 'Beachclubs', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
          <path d="M12 3v6M12 15v6M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
      )
    },
    { 
      key: 'restaurants', 
      label: 'Restaurants', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
          <path d="M8 2c0 3 1.5 4 3 6 1.5-2 3-3 3-6M11 8v13M8 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 8c-1.5 0-2.5-1-2.5-2.5S6.5 3 8 3M15 8c1.5 0 2.5-1 2.5-2.5S16.5 3 15 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    { 
      key: 'hotels', 
      label: 'Hotels', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
          <path d="M3 21h18M9 8h6M10 21V8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v13M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    { 
      key: 'festive', 
      label: 'Festive', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ]

  // Add new venue
  const addVenue = () => {
    const newVenue = {
      name: '',
      location: '',
      tier: 'standard',
      instagram: '',
      plusCode: '',
      images: []
    }
    
    const newData = { ...localData }
    newData.destinations[selectedDestination].venues[selectedCategory] = [
      newVenue,
      ...currentVenues
    ]
    setLocalData(newData)
    setEditingVenue(0) // First position
  }

  // Update venue field
  const updateVenue = (index: number, field: keyof Venue, value: any) => {
    const newData = { ...localData }
    newData.destinations[selectedDestination].venues[selectedCategory][index] = {
      ...currentVenues[index],
      [field]: value
    }
    setLocalData(newData)
  }

  // Delete venue
  const deleteVenue = (index: number) => {
    const newData = { ...localData }
    newData.destinations[selectedDestination].venues[selectedCategory] = 
      currentVenues.filter((_: Venue, i: number) => i !== index)
    setLocalData(newData)
    setShowDeleteConfirm(null)
    if (editingVenue === index) {
      setEditingVenue(null)
    }
  }

  // Cycle through venue tiers
  const cycleVenueTier = (index: number) => {
    const currentTier = currentVenues[index].tier
    const tiers = ['standard', 'featured', 'premium']
    const currentIndex = tiers.indexOf(currentTier)
    const nextIndex = (currentIndex + 1) % tiers.length
    updateVenue(index, 'tier', tiers[nextIndex])
  }

  // Drag and drop handlers
  const handleVenueDragStart = (e: React.DragEvent, index: number) => {
    setDraggedVenueIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleVenueDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedVenueIndex === null || draggedVenueIndex === index) return
    
    const newVenues = [...currentVenues]
    const [moved] = newVenues.splice(draggedVenueIndex, 1)
    newVenues.splice(index, 0, moved)
    
    const newData = { ...localData }
    newData.destinations[selectedDestination].venues[selectedCategory] = newVenues
    setLocalData(newData)
    setDraggedVenueIndex(index)
  }

  const handleVenueDragEnd = () => {
    setDraggedVenueIndex(null)
  }

  // Scrape Instagram images - Use existing session or create new one
  const scrapeInstagramImages = async (venueIndex: number) => {
    const venue = currentVenues[venueIndex]
    if (!venue.instagram.trim()) {
      addToast('error', 'Please enter Instagram handle first')
      return
    }

    // Check if we have an active Instagram session
    if (!instagramSessionActive || !instagramSessionId) {
      addToast('error', 'Please open Instagram session first by clicking "Scraping" in the sidebar')
      return
    }

    // Start progress tracking
    setScrapingProgress(prev => ({
      ...prev,
      [venueIndex]: { active: true, progress: 0, message: 'Starting scraping...' }
    }))

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScrapingProgress(prev => {
          if (prev[venueIndex]?.active) {
            const currentProgress = prev[venueIndex].progress
            if (currentProgress < 90) {
              return {
                ...prev,
                [venueIndex]: {
                  ...prev[venueIndex],
                  progress: currentProgress + Math.random() * 10,
                  message: currentProgress < 30 ? 'Navigating to profile...' :
                           currentProgress < 60 ? 'Extracting images...' :
                           'Downloading images...'
                }
              }
            }
          }
          return prev
        })
      }, 500)

      const response = await fetch('/api/scrape-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instagramHandle: venue.instagram,
          venueName: venue.name || 'untitled',
          confirm: true,
          sessionId: instagramSessionId
        })
      })

      clearInterval(progressInterval)

      const result = await response.json()

      if (result.success && result.status === 'completed') {
        // Complete progress
        setScrapingProgress(prev => ({
          ...prev,
          [venueIndex]: { active: true, progress: 100, message: 'Completed!' }
        }))

        // Scraping completed successfully
        const profileImage = result.profileImage
        const scrapedImages = result.images || []
        
        // Update venue with profileImage and images
        if (profileImage) {
          const newData = { ...localData }
          newData.destinations[selectedDestination].venues[selectedCategory][venueIndex] = {
            ...currentVenues[venueIndex],
            profileImage: profileImage
          }
          setLocalData(newData)
        }
        
        updateVenue(venueIndex, 'images', scrapedImages)
        addToast('success', `Successfully scraped ${scrapedImages.length} images${profileImage ? ' and profile image' : ''}!`)
        
        // Clear progress after success
        setTimeout(() => {
          setScrapingProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[venueIndex]
            return newProgress
          })
        }, 2000)
      } else {
        setScrapingProgress(prev => ({
          ...prev,
          [venueIndex]: { active: false, progress: 0, message: 'Failed' }
        }))
        
        // Check if it's a Vercel deployment error
        if (result.error && (result.error.includes('headless') || result.error.includes('production'))) {
          addToast('error', 'Instagram scraping is not available in production. Please use the local development environment.')
        } else {
          addToast('error', `Error: ${result.error || 'Failed to scrape images'}`)
        }
      }
    } catch (error) {
      console.error('Error scraping images:', error)
      setScrapingProgress(prev => ({
        ...prev,
        [venueIndex]: { active: false, progress: 0, message: 'Failed' }
      }))
      
      // Check if it's a network error that might indicate Vercel deployment
      if (error instanceof TypeError && error.message.includes('fetch')) {
        addToast('error', 'Instagram scraping is not available in production. Please use the local development environment.')
      } else {
        addToast('error', 'Failed to scrape images. Please try again.')
      }
    }
  }

  // Toggle delete image mode for a venue
  const toggleDeleteImageMode = (venueIndex: number) => {
    setDeleteImageMode(prev => ({
      ...prev,
      [venueIndex]: !prev[venueIndex]
    }))
    // Reset selected images when exiting delete mode
    if (deleteImageMode[venueIndex]) {
      setSelectedImagesToDelete(prev => {
        const newSelected = { ...prev }
        delete newSelected[venueIndex]
        return newSelected
      })
    }
  }

  // Toggle image selection for deletion
  const toggleImageSelection = (venueIndex: number, imageUrl: string) => {
    setSelectedImagesToDelete(prev => {
      const newSelected = { ...prev }
      if (!newSelected[venueIndex]) {
        newSelected[venueIndex] = new Set<string>()
      }
      // Create a new Set to ensure React detects the change
      const updatedSet = new Set(newSelected[venueIndex])
      if (updatedSet.has(imageUrl)) {
        updatedSet.delete(imageUrl)
      } else {
        updatedSet.add(imageUrl)
      }
      newSelected[venueIndex] = updatedSet
      return newSelected
    })
  }

  // Delete selected images
  const deleteSelectedImages = (venueIndex: number) => {
    const selected = selectedImagesToDelete[venueIndex]
    if (!selected || selected.size === 0) {
      addToast('error', 'No images selected for deletion.')
      return
    }

    const venue = currentVenues[venueIndex]
    const remainingImages = venue.images?.filter((img: string) => !selected.has(img)) || []
    updateVenue(venueIndex, 'images', remainingImages)

    // Exit delete mode and clear selection
    setDeleteImageMode(prev => {
      const newMode = { ...prev }
      delete newMode[venueIndex]
      return newMode
    })
    setSelectedImagesToDelete(prev => {
      const newSelected = { ...prev }
      delete newSelected[venueIndex]
      return newSelected
    })

    addToast('success', `Successfully deleted ${selected.size} image(s)!`)
  }

  // Confirm and proceed with scraping - Save final images
  const confirmScraping = async (venueIndex: number) => {
    const sessionId = scrapingSessions[venueIndex]
    if (!sessionId) {
      addToast('error', 'No active scraping session found. Please start scraping first.')
      return
    }

    const venue = currentVenues[venueIndex]
    try {
      const response = await fetch('/api/scrape-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instagramHandle: venue.instagram,
          venueName: venue.name || 'untitled',
          confirm: true,
          sessionId: sessionId
        })
      })

      const result = await response.json()

      if (result.success && result.status === 'completed') {
        // Ottieni le immagini dalla risposta
        const profileImage = result.profileImage || scrapedProfileImages[venueIndex]
        const scrapedImgs = result.images || scrapedImages[venueIndex] || []
        
        // Usa tutte le immagini (non c'è più discard durante scraping)
        const finalImages = scrapedImgs

        // Aggiorna venue con profileImage e immagini finali
        if (profileImage) {
          const newData = { ...localData }
          newData.destinations[selectedDestination].venues[selectedCategory][venueIndex] = {
            ...currentVenues[venueIndex],
            profileImage: profileImage
          }
          setLocalData(newData)
        }
        updateVenue(venueIndex, 'images', finalImages)

        // Pulisci gli stati temporanei
        setScrapedProfileImages(prev => {
          const newProfiles = { ...prev }
          delete newProfiles[venueIndex]
          return newProfiles
        })
        setScrapedImages(prev => {
          const newImages = { ...prev }
          delete newImages[venueIndex]
          return newImages
        })

        addToast('success', `Successfully saved ${finalImages.length} images${profileImage ? ' and profile image' : ''}! Browser remains open. Click "Close Browser" when done.`)
      } else {
        addToast('error', `Error: ${result.error || 'Failed to scrape images'}`)
      }
    } catch (error) {
      console.error('Error confirming scraping:', error)
      addToast('error', 'Failed to confirm scraping. Please try again.')
    }
  }

  // Close browser manually
  const closeBrowser = async (venueIndex: number) => {
    const sessionId = scrapingSessions[venueIndex]
    if (!sessionId) {
      addToast('error', 'No active browser session found.')
      return
    }

    const venue = currentVenues[venueIndex]
    try {
      const response = await fetch('/api/scrape-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instagramHandle: venue.instagram,
          venueName: venue.name || 'untitled',
          closeBrowser: true,
          sessionId: sessionId
        })
      })

      const result = await response.json()

      if (result.success) {
        setScrapingSessions(prev => {
          const newSessions = { ...prev }
          delete newSessions[venueIndex]
          return newSessions
        })
        // Pulisci anche gli stati temporanei di scraping
        setScrapedProfileImages(prev => {
          const newProfiles = { ...prev }
          delete newProfiles[venueIndex]
          return newProfiles
        })
        setScrapedImages(prev => {
          const newImages = { ...prev }
          delete newImages[venueIndex]
          return newImages
        })
        addToast('success', 'Browser closed successfully!')
      } else {
        addToast('error', `Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error closing browser:', error)
      addToast('error', 'Failed to close browser. Please try again.')
      // Rimuovi la sessione comunque per evitare stati inconsistenti
      setScrapingSessions(prev => {
        const newSessions = { ...prev }
        delete newSessions[venueIndex]
        return newSessions
      })
    }
  }

  // Validation
  const isVenueValid = (venue: Venue) => {
    return venue.name.trim() !== '' && 
           venue.location.trim() !== '' && 
           venue.instagram.trim() !== '' && 
           venue.plusCode.trim() !== ''
  }

  if (destinations.length === 0) {
    return (
      <div className="p-8 text-center text-white/60">
        <p>No destinations available. Add a destination first.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Venues</h2>
        <p className="text-sm text-white/50 mt-1">Manage venues for each destination and category</p>
      </div>

      {/* Destination Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/60 mb-3">Destination</label>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {destinations.map((dest: Destination, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedDestination(index)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedDestination === index
                  ? 'bg-white/10 text-white ring-1 ring-white/20'
                  : 'bg-white/5 text-white/60 ring-1 ring-white/10 hover:bg-white/[0.07] hover:text-white/80'
              }`}
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/60 mb-3">Category</label>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`shrink-0 rounded-lg px-4 py-3 text-sm font-medium transition flex flex-col items-center gap-2 min-w-[80px] ${
                selectedCategory === cat.key
                  ? 'bg-white/10 text-white ring-1 ring-white/20'
                  : 'bg-white/5 text-white/60 ring-1 ring-white/10 hover:bg-white/[0.07] hover:text-white/80'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="text-xs">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Venue Button */}
      <div className="mb-6">
        <button
          onClick={addVenue}
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/20 transition hover:bg-white/15"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Venue
        </button>
      </div>

      {/* Venues List */}
      <div className="space-y-4">
        {currentVenues.map((venue: Venue, index: number) => (
          <div
            key={index}
            draggable={editingVenue !== index}
            onDragStart={(e) => handleVenueDragStart(e, index)}
            onDragOver={(e) => handleVenueDragOver(e, index)}
            onDragEnd={handleVenueDragEnd}
            className={`rounded-xl bg-white/5 ring-1 ring-white/10 transition ${
              draggedVenueIndex === index ? 'opacity-50' : ''
            } ${
              editingVenue !== index ? 'cursor-move hover:bg-white/[0.07]' : ''
            }`}
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Drag Handle */}
                {editingVenue !== index && (
                  <div className="flex-shrink-0 mt-1 self-start sm:self-auto">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <path d="M9 5h2M9 12h2M9 19h2M15 5h2M15 12h2M15 19h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingVenue === index ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Name *</label>
                        <input
                          type="text"
                          value={venue.name}
                          onChange={(e) => updateVenue(index, 'name', e.target.value)}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                          placeholder="Venue name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Location *</label>
                        <input
                          type="text"
                          value={venue.location}
                          onChange={(e) => updateVenue(index, 'location', e.target.value)}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                          placeholder="Venue location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Instagram *</label>
                        <input
                          type="text"
                          value={venue.instagram}
                          onChange={(e) => updateVenue(index, 'instagram', e.target.value)}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                          placeholder="@instagram"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Plus Code *</label>
                        <input
                          type="text"
                          value={venue.plusCode}
                          onChange={(e) => updateVenue(index, 'plusCode', e.target.value)}
                          className="w-full rounded-lg bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                          placeholder="Plus code for location"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">Images</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <button
                              type="button"
                              onClick={() => scrapeInstagramImages(index)}
                              disabled={!instagramSessionActive || !!scrapingSessions[index] || scrapingProgress[index]?.active}
                              className={`w-full px-4 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                instagramSessionActive 
                                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                                  : 'bg-gray-500 cursor-not-allowed'
                              }`}
                            >
                              📷 {instagramSessionActive ? 'Scrape from Instagram' : 'Open Instagram Session First'}
                            </button>
                            
                            {/* Progress Bar */}
                            {scrapingProgress[index]?.active && (
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs text-white/60">
                                  <span>{scrapingProgress[index].message}</span>
                                  <span>{Math.round(scrapingProgress[index].progress)}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${scrapingProgress[index].progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-white/40 self-center">
                            {venue.images?.length || 0} images
                          </span>
                        </div>
                        
                        {/* Preview profileImage se presente */}
                        {scrapedProfileImages[index] && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-white/60 mb-2">Profile Image</label>
                            <div className="relative inline-block">
                              <img
                                src={scrapedProfileImages[index]}
                                alt={`${venue.name} profile`}
                                className="h-20 w-20 rounded-full object-cover ring-2 ring-white/20"
                              />
                            </div>
                          </div>
                        )}

                        {/* Preview immagini scrapate */}
                        {scrapedImages[index] && scrapedImages[index].length > 0 && (
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-white/60 mb-2">Gallery Images</label>
                            <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                              {scrapedImages[index].map((img, imgIndex) => (
                                <div key={imgIndex} className="relative">
                                  <img
                                    src={img}
                                    alt={`${venue.name} ${imgIndex + 1}`}
                                    className="w-full h-20 object-cover rounded-lg"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Preview immagini salvate con modalità eliminazione */}
                        {venue.images && venue.images.length > 0 && !scrapedImages[index] && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-medium text-white/60">Saved Images ({venue.images.length})</label>
                              <div className="flex gap-2">
                                {deleteImageMode[index] ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => deleteSelectedImages(index)}
                                      disabled={!selectedImagesToDelete[index] || selectedImagesToDelete[index].size === 0}
                                      className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Delete Selected ({selectedImagesToDelete[index]?.size || 0})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleDeleteImageMode(index)}
                                      className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-medium hover:bg-white/20 transition-all"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => toggleDeleteImageMode(index)}
                                    className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-medium hover:bg-white/20 transition-all"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline mr-1">
                                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Delete Images
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                              {venue.images.map((img, imgIndex) => (
                                <div 
                                  key={imgIndex} 
                                  className={`relative cursor-pointer transition-all ${
                                    deleteImageMode[index] 
                                      ? selectedImagesToDelete[index]?.has(img)
                                        ? 'ring-2 ring-red-500/50 opacity-60'
                                        : 'hover:ring-2 hover:ring-white/30'
                                      : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (deleteImageMode[index]) {
                                      toggleImageSelection(index, img)
                                    }
                                  }}
                                >
                                  <img
                                    src={img}
                                    alt={`${venue.name} ${imgIndex + 1}`}
                                    className="w-full h-20 object-cover rounded-lg"
                                  />
                                  {deleteImageMode[index] && (
                                    <div className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                      selectedImagesToDelete[index]?.has(img)
                                        ? 'bg-red-500 border-red-500'
                                        : 'bg-black/50 border-white/40'
                                    }`}>
                                      {selectedImagesToDelete[index]?.has(img) && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{venue.name}</h3>
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          venue.tier === 'premium' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : venue.tier === 'featured'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                          </svg>
                          {venue.tier === 'premium' ? 'Premium' : venue.tier === 'featured' ? 'Featured' : 'Standard'}
                        </div>
                      </div>
                      <p className="text-sm text-white/60 mb-2">{venue.location}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-white/40 mb-3">
                        {venue.instagram && (
                          <span>📷 {venue.instagram}</span>
                        )}
                        {venue.plusCode && (
                          <span>📍 {venue.plusCode}</span>
                        )}
                        {venue.images && venue.images.length > 0 && (
                          <span>🖼️ {venue.images.length} images</span>
                        )}
                      </div>
                      {!isVenueValid(venue) && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2 py-1 text-xs text-red-400">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          Incomplete data
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {editingVenue === index ? (
                    <button
                      onClick={() => setEditingVenue(null)}
                      className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 hover:bg-white/15 transition"
                    >
                      Done
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingVenue(index)}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 hover:bg-white/15 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => cycleVenueTier(index)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 transition ${
                          venue.tier === 'premium'
                            ? 'bg-purple-500/20 text-purple-400 ring-purple-500/30 hover:bg-purple-500/30'
                            : venue.tier === 'featured'
                            ? 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30 hover:bg-yellow-500/30'
                            : 'bg-white/10 text-white/80 ring-white/20 hover:bg-white/15'
                        }`}
                      >
                        {venue.tier === 'premium' ? 'Premium' : venue.tier === 'featured' ? 'Featured' : 'Standard'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm({ destination: selectedDestination, category: selectedCategory, venue: index })}
                        className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {currentVenues.length === 0 && (
          <div className="text-center py-12 text-white/40">
            <p>No venues in this category yet. Click "Add Venue" to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md mx-4 ring-1 ring-white/20">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Venue?</h3>
            <p className="text-white/60 mb-6">
              Are you sure you want to delete "{currentVenues[showDeleteConfirm.venue]?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/20 hover:bg-white/15 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteVenue(showDeleteConfirm.venue)}
                className="flex-1 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/30 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
