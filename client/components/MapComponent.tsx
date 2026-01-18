'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

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
    [key: string]: any
  }
}

async function getHospitals(latitude: number, longitude: number): Promise<Hospital[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_HOSPITALS_API_URL
    const radius = process.env.NEXT_PUBLIC_SEARCH_RADIUS
    const apiUrl = `${baseUrl}&geofilter.distance=${latitude},${longitude},${radius}`
    
    const res = await fetch(apiUrl, { cache: 'no-store' })

    if (!res.ok) {
      return []
    }

    const data = await res.json()
    return data.records as Hospital[]
  } catch (error) {
    console.error(error)
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

function MapContent() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<LeafletMarker[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const container = mapRef.current

    const initMap = async () => {
      if (mapInstanceRef.current) return undefined

      const L = (await import('leaflet')).default

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

      ;(container as any)._leaflet_id = null

      const map = L.map(container, {
        keyboard: false
      }).setView([48.8566, 2.3522], 12)

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
      
      setTimeout(disableMapFocus, 100)
      setTimeout(disableMapFocus, 500)
      
      const observer = new MutationObserver(disableMapFocus)
      observer.observe(container, {
        childList: true,
        subtree: true
      })

      // Load and display hospitals on the map
      const loadHospitals = async (latitude: number, longitude: number) => {
        try {
          const hospitals = await getHospitals(latitude, longitude)
          
          if (hospitals.length === 0) {
            return
          }

          let markersAdded = 0
          
          // Add red markers for each hospital
          hospitals.forEach((hospital) => {
            const coords = extractCoordinates(hospital)
            if (!coords) {
              return
            }

            const [lat, lng] = coords
            
            const marker = L.marker([lat, lng], { 
              icon: redIcon,
              keyboard: false
            })
              .addTo(map)
              .bindPopup(`<b>${hospital.fields.name}</b>`)
              .on('popupopen', () => {
                setTimeout(() => {
                  const closeButton = container.querySelector('.leaflet-popup-close-button') as HTMLElement
                  if (closeButton) {
                    closeButton.setAttribute('tabindex', '-1')
                  }
                }, 10)
              })
            
            markersRef.current.push(marker)
            markersAdded++
          })

          // Adjust map view to include all markers
          if (markersAdded > 0) {
            const coordsList = hospitals
              .map(h => extractCoordinates(h))
              .filter((c): c is [number, number] => c !== null)
            
            if (coordsList.length > 0) {
              const bounds = L.latLngBounds(coordsList)
              bounds.extend([latitude, longitude])
              map.fitBounds(bounds, { padding: [50, 50] })
            }
          }
        } catch (error) {
          console.error('Error loading hospitals:', error)
        }
      }

      // Get user location and load hospitals
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            
            // Center map on user position
            map.setView([latitude, longitude], 12)
            
            // Load hospitals
            await loadHospitals(latitude, longitude)
          },
          async (error) => {
            console.error("Geolocation error:", error)
            // Fallback to Paris if geolocation fails
            await loadHospitals(48.8566, 2.3522)
          }
        )
      } else {
        // Fallback to Paris if geolocation not supported
        await loadHospitals(48.8566, 2.3522)
      }
      
      // Retourner la fonction de nettoyage de l'observer
      return observer
    }

    let observer: MutationObserver | undefined
    
    initMap().then((obs) => {
      observer = obs
    })

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      if (observer) observer.disconnect()
    }
  }, [])


  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={mapRef}
        className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border-2 border-gray-300 shadow-md"
        aria-hidden="true"
      />
    </>
  )
}

const MapComponent = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  )
})

export default MapComponent