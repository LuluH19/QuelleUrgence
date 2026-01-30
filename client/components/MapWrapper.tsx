'use client'

import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  )
})

interface MapWrapperProps {
  fullScreen?: boolean
  initialCenter?: [number, number]
  initialZoom?: number
  focusRecordId?: string
}

export default function MapWrapper({ fullScreen = false, initialCenter, initialZoom, focusRecordId }: MapWrapperProps) {
  return (
    <MapComponent
      fullScreen={fullScreen}
      initialCenter={initialCenter}
      initialZoom={initialZoom}
      focusRecordId={focusRecordId}
    />
  )
}