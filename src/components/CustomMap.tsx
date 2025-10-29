'use client'
import { useEffect, useRef, useState } from 'react'
import type { CustomMapProps, Coordinates } from '../types/components'

// Google Maps types
declare global {
  interface Window {
    google?: any
  }
  
  const google: any
}

// Map style interface
interface MapStyle {
  elementType?: string
  featureType?: string
  stylers: Array<{ color?: string }>
}

const CustomMap: React.FC<CustomMapProps> = ({ plusCode, venueName }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const isLoadingRef = useRef<boolean>(false)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [hasApiKey, setHasApiKey] = useState<boolean>(true)

  useEffect(() => {
    if (!plusCode || !mapRef.current || mapInstanceRef.current) return

    const loadMap = async (): Promise<void> => {
      try {
        // Prevent multiple loads
        if (isLoadingRef.current) return
        isLoadingRef.current = true

        // Check if API key is available
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.')
          setHasApiKey(false)
          return
        }

        // Load Google Maps Script if not already loaded
        if (!window.google || !window.google.maps) {
          // Check if script already exists
          const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
          
          if (!existingScript) {
            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
            document.head.appendChild(script)
            
            await new Promise<void>((resolve, reject) => {
              script.onload = () => resolve()
              script.onerror = () => reject(new Error('Failed to load Google Maps script'))
            })
          } else {
            // Wait for existing script to fully load
            await new Promise<void>((resolve) => {
              const checkGoogle = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.Map) {
                  clearInterval(checkGoogle)
                  resolve()
                }
              }, 50)
            })
          }
        }

        // Convert Plus Code to coordinates using Geocoder
        const geocoder = new google.maps.Geocoder()
        const geocodeResult = await new Promise<any>((resolve, reject) => {
          geocoder.geocode({ address: plusCode }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
              resolve(results[0].geometry.location)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          })
        })

        const coords: Coordinates = {
          lat: geocodeResult.lat(),
          lng: geocodeResult.lng()
        }
        setCoordinates(coords)

        // Dark luxury style for the map
        const darkStyle: MapStyle[] = [
          { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d4af37' }] // Gold accent
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#1a1a1a' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#1a1a1a' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#2a2a2a' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2833' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }]
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#1a1a1a' }]
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#000000' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
          }
        ]

        // Create map with Minimal Luxury controls
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: coords.lat, lng: coords.lng },
          zoom: 17,
          styles: darkStyle,
          disableDefaultUI: true, // Disabilita tutti i controlli di default
          zoomControl: true, // Solo zoom per navigazione essenziale
          mapTypeControl: false, // No cambio tipo mappa
          scaleControl: false, // No barra scala
          streetViewControl: false, // No omino street view
          rotateControl: false, // No freccette/compass
          fullscreenControl: false, // No fullscreen
          gestureHandling: 'cooperative', // Richiede Ctrl per scroll (UX elegante)
          tilt: 0, // Disabilita tilt 3D
          heading: 0, // Mappa sempre orientata a Nord
          clickableIcons: false // Disabilita click su POI/icone Google
        })

        // Custom marker with SVG (no deprecation)
        const markerElement = document.createElement('div')
        markerElement.innerHTML = `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background: #d4af37; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.5);"></div>
          </div>
        `
        
        // Create overlay for custom marker
        const overlay = new google.maps.OverlayView()
        overlay.onAdd = function() {
          const panes = this.getPanes()
          if (panes) {
            panes.overlayMouseTarget.appendChild(markerElement)
          }
        }
        
        overlay.draw = function() {
          const projection = this.getProjection()
          if (projection) {
            const position = projection.fromLatLngToDivPixel(
              new google.maps.LatLng(coords.lat, coords.lng)
            )
            if (position) {
              markerElement.style.left = position.x + 'px'
              markerElement.style.top = position.y + 'px'
              markerElement.style.position = 'absolute'
            }
          }
        }
        
        overlay.setMap(map)

        mapInstanceRef.current = map
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    loadMap()

    return () => {
      // Cleanup
      isLoadingRef.current = false
    }
  }, [plusCode, venueName])

  if (!hasApiKey) {
    return (
      <div 
        className="h-full w-full flex items-center justify-center bg-gray-900 text-gray-400"
        style={{ minHeight: '300px' }}
      >
        <div className="text-center">
          <p className="text-sm">Map unavailable</p>
          <p className="text-xs mt-1">Google Maps API key not configured</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full"
      style={{ minHeight: '300px' }}
    />
  )
}

export default CustomMap
