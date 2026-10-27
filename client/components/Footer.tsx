'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const linkClassName =
  'inline-block py-2 text-white underline underline-offset-4 hover:no-underline rounded focus:outline-none focus:ring-4 focus:ring-red-600'

export default function Footer() {
  const pathname = usePathname()

  // Sur mobile, la page carte occupe tout l'écran (overlay fixe) : le pied de page
  // serait masqué tout en restant atteignable au clavier, on le retire donc sur mobile.
  const hiddenOnMobile = pathname === '/map'

  return (
    <footer
      className={`bg-gray-900 text-white px-4 py-6 ${hiddenOnMobile ? 'hidden md:block' : ''}`}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-sm">
          Quelles Urgences. En cas d&apos;urgence vitale, appelez le 15 ou le 112
          (114 pour les personnes sourdes ou malentendantes).
        </p>
        <nav aria-label="Informations légales">
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1 text-sm">
            <li>
              <Link href="/mentions-legales" className={linkClassName}>
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/donnees-personnelles" className={linkClassName}>
                Données personnelles
              </Link>
            </li>
            <li>
              <Link href="/donnees-personnelles#stockage-local" className={linkClassName}>
                Cookies et stockage local
              </Link>
            </li>
            <li>
              <Link href="/accessibilite" className={linkClassName}>
                Accessibilité : [À COMPLÉTER : non / partiellement / totalement] conforme
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
