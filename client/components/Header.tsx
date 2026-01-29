'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const pathname = usePathname()
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  const isActive = (path: string) => pathname === path
  const isHovered = (path: string) => hoveredLink === path

  return (
    <header className="fixed bottom-0 left-0 right-0 md:top-0 md:left-0 md:bottom-0 md:right-auto bg-white shadow-lg z-[9999] md:w-64">
      <nav className="h-full">
        <ul className="flex md:flex-col justify-around md:justify-start items-center h-full md:py-8 py-3 gap-2 md:gap-6">
            <li className="w-full flex md:block items-center justify-center">
                <Link 
                  href="/"
                  aria-label="Accueil"
                  onMouseEnter={() => setHoveredLink('/')}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`flex flex-row items-center justify-center md:justify-start gap-2 md:gap-4 px-4 py-3 transition-all duration-200 w-fit md:w-auto md:mx-4 focus:outline-none focus:ring-4 focus:ring-red-600 ${
                    isActive('/') || isHovered('/') 
                      ? 'bg-black rounded-full' 
                      : ''
                  }`}
                >
                    <Image 
                        src={(isActive('/') || isHovered('/')) ? "/images/icons/home-white.svg" : "/images/icons/home-black.svg"}
                        alt=""
                        width={100} 
                        height={100} 
                        className="w-10 h-10"
                    />
                    <span className={`hidden md:inline text-base font-bold transition-colors ${
                      (isActive('/') || isHovered('/')) ? 'text-white' : 'text-gray-700'
                    }`} aria-hidden="true">
                      Accueil
                    </span>
                </Link>
            </li>
            <li className="w-full flex md:block items-center justify-center">
                <Link 
                  href="/map"
                  aria-label="Carte"
                  onMouseEnter={() => setHoveredLink('/map')}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`flex flex-row items-center justify-center md:justify-start gap-2 md:gap-4 px-4 py-3 transition-all duration-200 w-fit md:w-auto md:mx-4 focus:outline-none focus:ring-4 focus:ring-red-600 ${
                    isActive('/map') || isHovered('/map')
                      ? 'bg-black rounded-[35px]' 
                      : ''
                  }`}
                >
                    <Image 
                        src={(isActive('/map') || isHovered('/map')) ? "/images/icons/map-white.svg" : "/images/icons/map-black.svg"}
                        alt=""
                        width={100} 
                        height={100} 
                        className="w-10 h-10"
                    />
                    <span className={`hidden md:inline text-base font-bold transition-colors ${
                      (isActive('/map') || isHovered('/map')) ? 'text-white' : 'text-gray-700'
                    }`} aria-hidden="true">
                      Carte
                    </span>
                </Link>
            </li>
            <li className="w-full flex md:block items-center justify-center">
                <Link 
                  href="/hopitaux"
                  aria-label="Liste des hôpitaux"
                  onMouseEnter={() => setHoveredLink('/hopitaux')}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`flex flex-row items-center justify-center md:justify-start gap-2 md:gap-4 px-4 py-3 transition-all duration-200 w-fit md:w-auto md:mx-4 focus:outline-none focus:ring-4 focus:ring-red-600 ${
                    isActive('/hopitaux') || isHovered('/hopitaux')
                      ? 'bg-black rounded-full' 
                      : ''
                  }`}
                >
                    <Image 
                        src={(isActive('/hopitaux') || isHovered('/hopitaux')) ? "/images/icons/hospital-white.svg" : "/images/icons/hospital-black.svg"}
                        alt="" 
                        width={100} 
                        height={100} 
                        className="w-10 h-10"
                    />
                    <span className={`hidden md:inline text-base font-bold transition-colors ${
                      (isActive('/hopitaux') || isHovered('/hopitaux')) ? 'text-white' : 'text-gray-700'
                    }`} aria-hidden="true">
                      Liste des hôpitaux
                    </span>
                </Link>
            </li>
        </ul>
      </nav>
    </header>
  )
}
