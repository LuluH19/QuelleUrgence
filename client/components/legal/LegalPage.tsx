import Link from 'next/link'
import Header from '@/components/Header'

interface LegalPageProps {
  title: string
  lastUpdated: React.ReactNode
  children: React.ReactNode
}

export default function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main id="main-content" className="bg-white min-h-screen" tabIndex={-1}>
        <article className="px-4 py-6 sm:px-6 max-w-4xl mx-auto flex flex-col gap-8 text-sm md:text-base text-gray-900">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">{title}</h1>
            <p className="text-gray-700">Dernière mise à jour : {lastUpdated}</p>
          </header>
          {children}
          <nav aria-label="Autres pages d'informations légales" className="border-t border-gray-300 pt-4">
            <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1">
              <li>
                <Link href="/mentions-legales" className={legalLinkClassName}>
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/donnees-personnelles" className={legalLinkClassName}>
                  Données personnelles
                </Link>
              </li>
              <li>
                <Link href="/accessibilite" className={legalLinkClassName}>
                  Déclaration d&apos;accessibilité
                </Link>
              </li>
            </ul>
          </nav>
        </article>
      </main>
    </>
  )
}

export const legalLinkClassName =
  'text-primary font-medium underline underline-offset-4 hover:no-underline rounded focus:outline-none focus:ring-4 focus:ring-red-600'

interface LegalSectionProps {
  id: string
  title: string
  children: React.ReactNode
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  const headingId = `${id}-heading`
  return (
    <section id={id} aria-labelledby={headingId} className="flex flex-col gap-3 scroll-mt-4">
      <h2 id={headingId} className="text-lg md:text-xl lg:text-2xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Texte à remplacer par l'éditeur du site, volontairement très visible. */
export function ToComplete({ children }: { children: React.ReactNode }) {
  return (
    <mark className="bg-yellow-200 text-black font-semibold px-1 rounded">
      [À COMPLÉTER : {children}]
    </mark>
  )
}

interface ExternalLinkProps {
  href: string
  children: React.ReactNode
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={legalLinkClassName}>
      {children}
      <span className="sr-only"> (nouvelle fenêtre)</span>
    </a>
  )
}
