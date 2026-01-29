'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import type { ComponentType } from 'react'

interface Hospital {
  recordid: string
  fields: {
    name: string
    phone?: string
    dist?: string
    meta_geo_point?: [number, number] | number[]
    geometry?: {
      coordinates?: [number, number] | number[]
    }
    lat?: number
    lon?: number
  } & Record<string, unknown>
}

async function getHospitals(latitude: number, longitude: number): Promise<Hospital[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_HOSPITALS_API_URL
    const radius = process.env.NEXT_PUBLIC_SEARCH_RADIUS
    const apiUrl = `${baseUrl}&geofilter.distance=${latitude},${longitude},${radius}`
    
    const res = await fetch(apiUrl, { cache: 'no-store' })

    if (!res.ok) {
      console.error(`Failed to fetch hospitals: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    return data.records as Hospital[]
  } catch (error) {
    console.error('Error fetching hospitals:', error)
    return []
  }
}

const extractCoordinates = (hospital: Hospital): [number, number] | null => {
  const fields = hospital.fields
  
  // Primary format: meta_geo_point (data.gouv.fr API)
  if (fields.meta_geo_point && Array.isArray(fields.meta_geo_point)) {
    const [lat, lon] = fields.meta_geo_point
    if (typeof lat === 'number' && typeof lon === 'number') {
      return [lat, lon]
    }
  }
  
  // Fallback: GeoJSON format [longitude, latitude]
  if (fields.geometry?.coordinates && Array.isArray(fields.geometry.coordinates)) {
    const [lon, lat] = fields.geometry.coordinates
    if (typeof lat === 'number' && typeof lon === 'number') {
      return [lat, lon]
    }
  }
  
  // Fallback: separate lat/lon fields
  if (fields.lat && fields.lon) {
    return [fields.lat, fields.lon]
  }
  
  return null
}

interface MapContentProps {
  fullScreen?: boolean
}

// Constants
const PARIS_COORDS: [number, number] = [48.8566, 2.3522]
const DEFAULT_ZOOM = 13
const PARIS_FALLBACK_ZOOM = 12

function MapContent({ fullScreen = false }: MapContentProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])
  const userMarkerRef = useRef<LeafletMarker | null>(null)
  const userPositionRef = useRef<[number, number] | null>(null)
  const hospitalsDataRef = useRef<Array<{ hospital: Hospital; coords: [number, number] }>>([])
  const mapInitializedRef = useRef<boolean>(false)
  const markerEventHandlersRef = useRef<Map<LeafletMarker, { mouseover: () => void }>>(new Map())

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const container = mapRef.current

    const initMap = async () => {
      if (mapInstanceRef.current) return undefined

      const L = (await import('leaflet')) as typeof import('leaflet')

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Red pin icon for hospitals
      const redIcon = L.divIcon({
        className: 'red-hospital-marker',
        html: `
          <svg width="30" height="41" viewBox="0 0 30 41" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 11.25 15 26 15 26s15-14.75 15-26C30 6.716 23.284 0 15 0z" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="15" cy="15" r="6" fill="#FFFFFF"/>
          </svg>
        `,
        iconSize: [30, 41],
        iconAnchor: [15, 41],
        popupAnchor: [0, -41],
      })

      // Blue user location icon
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#FFFFFF" stroke-width="3" opacity="0.9"/>
            <circle cx="20" cy="20" r="10" fill="#FFFFFF"/>
            <circle cx="20" cy="20" r="5" fill="#3B82F6"/>
          </svg>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      ;(container as any)._leaflet_id = null

      const map = L.map(container, {
        keyboard: false
      }).setView(PARIS_COORDS, PARIS_FALLBACK_ZOOM)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map
      
      const disableMapFocus = () => {
        const mapContainer = container.querySelector('.leaflet-container') as HTMLElement
        if (mapContainer) {
          mapContainer.setAttribute('tabindex', '-1')
        }
        
        const controlLinks = container.querySelectorAll('.leaflet-control a')
        controlLinks.forEach((link) => {
          (link as HTMLElement).setAttribute('tabindex', '-1')
        })
      }
      
      const timers: NodeJS.Timeout[] = []
      timers.push(setTimeout(disableMapFocus, 100))
      timers.push(setTimeout(disableMapFocus, 500))
      
      const observer = new MutationObserver(disableMapFocus)
      observer.observe(container, {
        childList: true,
        subtree: true
      })

      // Create popup HTML with hospital name and itinerary button
      const createPopupHTML = (hospitalName: string, lat: number, lng: number): string => {
        const userPos = userPositionRef.current
        // Only include origin if we have a valid user position (not fallback Paris)
        let itineraryUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        
        // Only add origin if user position is available and not the default Paris fallback
        if (userPos) {
          itineraryUrl += `&origin=${userPos[0]},${userPos[1]}`
        }
        
        return `
          <div style="padding: 8px; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 12px; font-size: 16px; color: #1f2937;">
              ${hospitalName}
            </div>
            <a 
              href="${itineraryUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                display: inline-block;
                background-color: #DC2626;
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                font-size: 14px;
                transition: background-color 0.2s;
                width: 100%;
                text-align: center;
                box-sizing: border-box;
              "
              onmouseover="this.style.backgroundColor='#B91C1C'"
              onmouseout="this.style.backgroundColor='#DC2626'"
            >
              Itinéraire
            </a>
          </div>
        `
      }

      // Update all popups with current user position
      const updatePopups = () => {
        hospitalsDataRef.current.forEach(({ hospital, coords }) => {
          const [lat, lng] = coords
          const marker = markersRef.current.find(m => {
            const markerLatLng = m.getLatLng()
            return Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lng) < 0.0001
          })
          
          if (marker) {
            const newPopupContent = createPopupHTML(hospital.fields.name, lat, lng)
            marker.setPopupContent(newPopupContent)
          }
        })
      }

      // Load and display hospitals on the map
      const loadHospitals = async (latitude: number, longitude: number) => {
        try {
          const hospitals = await getHospitals(latitude, longitude)
          
          if (hospitals.length === 0) {
            return
          }

          // Ensure map + container are ready before adding markers (Leaflet appendChild safety)
          const mapInstance = mapInstanceRef.current
          if (!mapInstance || !mapInstance.getContainer()) {
            console.error('Map container not ready')
            return
          }

          let markersAdded = 0
          
          // Store hospitals data for popup updates
          hospitalsDataRef.current = []
          
          // Add red markers for each hospital
          hospitals.forEach((hospital) => {
            const coords = extractCoordinates(hospital)
            if (!coords) {
              return
            }

            const [lat, lng] = coords
            hospitalsDataRef.current.push({ hospital, coords })
            
            const popupContent = createPopupHTML(hospital.fields.name, lat, lng)
            
            if (!mapInstanceRef.current) return

            const marker = L.marker([lat, lng], { icon: redIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup(popupContent, {
                className: 'hospital-popup',
                closeButton: true,
                autoClose: false,
                closeOnClick: false,
              })
            
            // Open popup on hover - store handler for cleanup
            const handleMouseOver = () => {
              marker.openPopup()
            }
            marker.on('mouseover', handleMouseOver)
            markerEventHandlersRef.current.set(marker, { mouseover: handleMouseOver })
            
            // Optional: close popup on mouseout (comment out if you want it to stay open)
            // marker.on('mouseout', () => {
            //   marker.closePopup()
            // })
            
            markersRef.current.push(marker)
            markersAdded++
          })

          // Don't recenter the map after hospitals load - let user control it
          // The map is already centered on user position when geolocation succeeds
        } catch (error) {
          console.error('Error loading hospitals:', error)
        }
      }

      // Custom logger to filter Chrome extension errors without overriding console.error globally
      const logError = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        // Ignore Chrome extension errors
        if (message.includes('runtime.lastError') || message.includes('Receiving end does not exist')) {
          return
        }
        console.error(...args)
      }

      // Validate coordinates (accepts any valid lat/lng range)
      const isValidCoordinates = (lat: number, lng: number): boolean => {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      }
      
      // Center map on coordinates (prevents race conditions)
      const centerMapOnCoords = (coords: [number, number], zoom: number = DEFAULT_ZOOM) => {
        if (!mapInitializedRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, zoom)
          mapInitializedRef.current = true
        }
      }

      // Get user location and load hospitals
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Debug: log user position
            console.log('User position:', latitude, longitude)
            
            // Validate coordinates before using them
            if (!isValidCoordinates(latitude, longitude)) {
              logError('Invalid coordinates detected, using Paris as fallback:', latitude, longitude)
              // Use Paris coordinates instead
              userPositionRef.current = PARIS_COORDS
              
              // Add user location marker at Paris
              if (userMarkerRef.current) {
                userMarkerRef.current.remove()
              }
              userMarkerRef.current = L.marker(PARIS_COORDS, { 
                icon: userIcon,
                zIndexOffset: 1000
              })
                .addTo(map)
                .bindPopup('Votre position (approximative)', { closeButton: false })
              
              centerMapOnCoords(PARIS_COORDS)
              await loadHospitals(PARIS_COORDS[0], PARIS_COORDS[1])
              return
            }
            
            // Store user position for itinerary links (only if geolocation succeeded)
            userPositionRef.current = [latitude, longitude]
            
            // Add user location marker
            if (userMarkerRef.current) {
              userMarkerRef.current.remove()
            }
            userMarkerRef.current = L.marker([latitude, longitude], { 
              icon: userIcon,
              zIndexOffset: 1000 // Ensure user marker is on top
            })
              .addTo(map)
              .bindPopup('Votre position', { closeButton: false })
            
            // Center map on user position only once at initialization
            centerMapOnCoords([latitude, longitude])
            
            // Load hospitals
            await loadHospitals(latitude, longitude)
            
            // Update popups with user position
            updatePopups()
          },
          async (error) => {
            logError('❌ MapComponent - Erreur:', error.code, error.message)

            if (error.code === 1) {
              console.warn("🚫 Géolocalisation refusée par l'utilisateur")
            } else if (error.code === 2) {
              console.warn('📍 Position indisponible')
            } else if (error.code === 3) {
              console.warn('⏱️ Timeout de géolocalisation')
            } else {
              logError("Geolocation error:", error)
            }

            // Don't set userPositionRef if geolocation failed or was denied
            // This way Google Maps will use the user's current location automatically
            userPositionRef.current = null
            
            // Ensure the map is initialized before fallback
            centerMapOnCoords(PARIS_COORDS)

            // Fallback to Paris for loading hospitals
            await loadHospitals(PARIS_COORDS[0], PARIS_COORDS[1])
          },
          {
            timeout: 10000,
            enableHighAccuracy: false,
          }
        )
      } else {
        // Fallback to Paris if geolocation not supported
        userPositionRef.current = null
        centerMapOnCoords(PARIS_COORDS)
        await loadHospitals(PARIS_COORDS[0], PARIS_COORDS[1])
      }
      
      // Retourner les ressources à nettoyer
      return { observer, timers }
    }

    let cleanupResources: { observer?: MutationObserver; timers?: NodeJS.Timeout[] } | undefined
    
    initMap().then((resources) => {
      cleanupResources = resources
    })

    return () => {
      // Cleanup marker event listeners
      markerEventHandlersRef.current.forEach((handlers, marker) => {
        marker.off('mouseover', handlers.mouseover)
      })
      markerEventHandlersRef.current.clear()
      
      // Remove markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (cleanupResources?.observer) {
        cleanupResources.observer.disconnect()
      }
      if (cleanupResources?.timers) {
        cleanupResources.timers.forEach(timer => clearTimeout(timer))
      }
    }
  }, [])


  const mapClasses = fullScreen
    ? "w-full h-full"
    : "w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border-2 border-gray-300 shadow-md"

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className={mapClasses}
        role="application"
        aria-label="Carte interactive des hôpitaux"
        aria-live="polite"
      />
    </>
  )
}

interface MapComponentProps {
  fullScreen?: boolean
}

const MapComponent = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  )
}) as ComponentType<MapContentProps>

export default MapComponent