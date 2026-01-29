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
}

export default function MapWrapper({ fullScreen = false }: MapWrapperProps) {
  return <MapComponent fullScreen={fullScreen} />
}