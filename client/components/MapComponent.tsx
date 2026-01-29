'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import { getHospitals } from '@/app/api/hospitals/route'
import type { Hospital } from '@/types/api'

const extractCoordinates = (hospital: Hospital): [number, number] | null => {
  const fields = hospital.fields
  
  if (fields.meta_geo_point && Array.isArray(fields.meta_geo_point)) {
    const [lat, lon] = fields.meta_geo_point
    if (typeof lat === 'number' && typeof lon === 'number') {
      return [lat, lon]
    }
  }
  
  if (fields.geometry?.coordinates && Array.isArray(fields.geometry.coordinates)) {
    const [lon, lat] = fields.geometry.coordinates
    if (typeof lat === 'number' && typeof lon === 'number') {
      return [lat, lon]
    }
  }
  
  if (fields.lat && fields.lon) {
    return [fields.lat, fields.lon]
  }
  
  return null
}

interface MapContentProps {
  fullScreen?: boolean
}

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
  const markerClusterGroupRef = useRef<{ addLayer: (layer: any) => void; clearLayers: () => void } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const container = mapRef.current

    const initMap = async () => {
      if (mapInstanceRef.current) return undefined

      const L = (await import('leaflet')).default
      await import('leaflet.markercluster')
      
      if (!L.markerClusterGroup) {
        const MarkerClusterModule = await import('leaflet.markercluster')
        const MarkerClusterGroup = (MarkerClusterModule as any).default?.MarkerClusterGroup || 
                                   (MarkerClusterModule as any).MarkerClusterGroup ||
                                   ((MarkerClusterModule as any).default && typeof (MarkerClusterModule as any).default === 'function' ? (MarkerClusterModule as any).default : null)
        
        if (MarkerClusterGroup) {
          L.markerClusterGroup = (options: any) => new MarkerClusterGroup(options)
        }
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

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

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#340788" stroke="#FFFFFF" stroke-width="3" opacity="0.9"/>
            <circle cx="20" cy="20" r="10" fill="#FFFFFF"/>
            <circle cx="20" cy="20" r="5" fill="#340788"/>
          </svg>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      ;(container as any)._leaflet_id = null

      const map = L.map(container).setView(PARIS_COORDS, PARIS_FALLBACK_ZOOM)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map

      const markerClusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        animate: true,
        maxClusterRadius: 80,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount()
          
          return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: 'marker-cluster',
            iconSize: L.point(40, 40),
          })
        }
      })

      map.addLayer(markerClusterGroup)
      markerClusterGroupRef.current = markerClusterGroup
      
      const disableMapFocus = () => {
        const mapContainer = container.querySelector('.leaflet-container') as HTMLElement
        if (mapContainer) {
          mapContainer.setAttribute('tabindex', '-1')
        }
        
        const controlLinks = container.querySelectorAll('.leaflet-control a')
        controlLinks.forEach((link) => {
          (link as HTMLElement).setAttribute('tabindex', '-1')
        })
        
        // Désactiver le focus sur les clusters de marqueurs
        const clusterMarkers = container.querySelectorAll('.marker-cluster, .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large')
        clusterMarkers.forEach((cluster) => {
          (cluster as HTMLElement).setAttribute('tabindex', '-1')
        })
        
        // Désactiver le focus sur tous les marqueurs Leaflet
        const allMarkers = container.querySelectorAll('.leaflet-marker-icon')
        allMarkers.forEach((marker) => {
          (marker as HTMLElement).setAttribute('tabindex', '-1')
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

      const formatDistance = (lat: number, lng: number): string | null => {
        const userPos = userPositionRef.current

        const fromUser =
          userPos != null
            ? (() => {
                const R = 6371e3 // metres
                const toRad = (deg: number) => (deg * Math.PI) / 180
                const φ1 = toRad(userPos[0])
                const φ2 = toRad(lat)
                const Δφ = toRad(lat - userPos[0])
                const Δλ = toRad(lng - userPos[1])

                const a =
                  Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                return R * c
              })()
            : null

        if (fromUser == null || Number.isNaN(fromUser)) return null

        if (fromUser >= 1000) {
          const km = fromUser / 1000
          return `${km.toFixed(1)} km`
        }

        const rounded = Math.round(fromUser / 50) * 50
        return `${rounded} m`
      }

      const getPhone = (fields: Hospital['fields']): string | null => {
        const anyFields = fields as Record<string, unknown>
        const phone =
          (anyFields.phone as string | undefined) ||
          (anyFields.telephone as string | undefined) ||
          (anyFields.tel as string | undefined)
        if (!phone) return null
        return phone.trim()
      }

      const createPopupHTML = (hospital: Hospital, lat: number, lng: number): string => {
        const userPos = userPositionRef.current
        let itineraryUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        
        if (userPos) {
          itineraryUrl += `&origin=${userPos[0]},${userPos[1]}`
        }

        const distanceLabel = formatDistance(lat, lng)
        const phone = getPhone(hospital.fields)
        const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : null
        const hospitalName = hospital.fields.name

        return `
          <div style="
            padding: 12px 14px;
            min-width: 220px;
            max-width: 260px;
            background-color: #3C0F7D;
            color: #FFFFFF;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.35);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            <div style="font-weight: 700; margin-bottom: 6px; font-size: 15px; line-height: 1.3;">
              ${hospitalName}
            </div>
            ${
              distanceLabel
                ? `<div style="font-size: 13px; margin-bottom: 8px; opacity: 0.9;">
                     ${distanceLabel}
                   </div>`
                : ''
            }
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 8px;
              margin-top: 6px;
            ">
              ${
                phone
                  ? `<a
                       href="${phoneHref}"
                       style="
                         display: inline-flex;
                         align-items: center;
                         gap: 6px;
                         font-size: 13px;
                         color: #FFFFFF;
                         text-decoration: none;
                         white-space: nowrap;
                       "
                     >
                       <span style="
                         display: inline-flex;
                         align-items: center;
                         justify-content: center;
                         width: 20px;
                         height: 20px;
                         border-radius: 999px;
                         background-color: rgba(255, 255, 255, 0.16);
                       ">
                         📞
                       </span>
                       <span>${phone}</span>
                     </a>`
                  : ''
              }
              <a 
                href="${itineraryUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  flex: 1;
                  background-color: #EF4444;
                  color: #FFFFFF;
                  padding: 6px 10px;
                  border-radius: 999px;
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 13px;
                  transition: background-color 0.15s, transform 0.1s;
                  text-align: center;
                  box-sizing: border-box;
                  margin-left: auto;
                "
                onmouseover="this.style.backgroundColor='#B91C1C'; this.style.transform='translateY(-1px)'"
                onmouseout="this.style.backgroundColor='#EF4444'; this.style.transform='translateY(0)'"
              >
                Itinéraire
              </a>
            </div>
          </div>
        `
      }

      const updatePopups = () => {
        hospitalsDataRef.current.forEach(({ hospital, coords }) => {
          const [lat, lng] = coords
          const marker = markersRef.current.find(m => {
            const markerLatLng = m.getLatLng()
            return Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lng) < 0.0001
          })
          
          if (marker) {
            const newPopupContent = createPopupHTML(hospital, lat, lng)
            marker.setPopupContent(newPopupContent)
          }
        })
      }

      const loadHospitals = async (latitude: number, longitude: number) => {
        try {
          const hospitals = await getHospitals(latitude, longitude)
          
          if (hospitals.length === 0) {
            return
          }

          const mapInstance = mapInstanceRef.current
          if (!mapInstance || !mapInstance.getContainer()) {
            console.error('Map container not ready')
            return
          }

          let markersAdded = 0
          
          hospitalsDataRef.current = []
          
          hospitals.forEach((hospital) => {
            const coords = extractCoordinates(hospital)
            if (!coords) {
              return
            }

            const [lat, lng] = coords
            hospitalsDataRef.current.push({ hospital, coords })
            
            const popupContent = createPopupHTML(hospital, lat, lng)
            
            if (!mapInstanceRef.current) return

            const marker = L.marker([lat, lng], { 
              icon: redIcon
            })
              .bindPopup(popupContent, {
                className: 'hospital-popup',
                closeButton: true,
                autoClose: false,
                closeOnClick: false,
              })
              .on('popupopen', () => {
                setTimeout(() => {
                  const closeButton = document.querySelector('.leaflet-popup-close-button') as HTMLElement
                  if (closeButton) {
                    closeButton.setAttribute('tabindex', '-1')
                  }
                }, 0)
              })
            
            const handleMouseOver = () => {
              marker.openPopup()
            }
            marker.on('mouseover', handleMouseOver)
            markerEventHandlersRef.current.set(marker, { mouseover: handleMouseOver })

            if (markerClusterGroupRef.current) {
              markerClusterGroupRef.current.addLayer(marker)
            }
            
            markersRef.current.push(marker)
            markersAdded++
          })
        } catch (error) {
          console.error('Error loading hospitals:', error)
        }
      }

      const logError = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        if (message.includes('runtime.lastError') || message.includes('Receiving end does not exist')) {
          return
        }
        console.error(...args)
      }

      const isValidCoordinates = (lat: number, lng: number): boolean => {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      }
      
      const centerMapOnCoords = (coords: [number, number], zoom: number = DEFAULT_ZOOM) => {
        if (!mapInitializedRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.setView(coords, zoom)
          mapInitializedRef.current = true
        }
      }

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
                zIndexOffset: 1000,
                keyboard: false
              })
                .addTo(map)
                .bindPopup('Votre position (approximative)', { closeButton: false })
              
              centerMapOnCoords(PARIS_COORDS)
              await loadHospitals(PARIS_COORDS[0], PARIS_COORDS[1])
              return
            }
            
            userPositionRef.current = [latitude, longitude]
            
            if (userMarkerRef.current) {
              userMarkerRef.current.remove()
            }
            userMarkerRef.current = L.marker([latitude, longitude], { 
              icon: userIcon,
              zIndexOffset: 1000,
              keyboard: false
            })
              .addTo(map)
              .bindPopup('Votre position', { closeButton: false })
            
            centerMapOnCoords([latitude, longitude])
            
            await loadHospitals(latitude, longitude)
            
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
      markerEventHandlersRef.current.forEach((handlers, marker) => {
        marker.off('mouseover', handlers.mouseover)
      })
      markerEventHandlersRef.current.clear()
      
      if (markerClusterGroupRef.current) {
        markerClusterGroupRef.current.clearLayers()
        markerClusterGroupRef.current = null
      }
      
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
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
        crossOrigin=""
      />
      <style jsx global>{`
        .marker-cluster {
          background-color: rgba(52, 7, 136, 0.6);
        }
        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font-weight: bold;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(52, 7, 136, 0.8);
        }
      `}</style>
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

const MapComponent = dynamic(() => Promise.resolve(MapContent), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  )
})

export default MapComponent