import './globals.scss'
import { Metadata } from 'next';
import TextScaleInit from '@/components/TextScaleInit';
export const metadata: Metadata = {
  title: {
    default: 'Quelles Urgences',
    template: '%s | Quelles Urgences',
  },
  description: 'Application de gestion des urgences',
  icons: {
    icon: '/images/logo/logo-red.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="pb-20 md:pb-0 md:pl-64">
        <TextScaleInit />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:ring-4 focus:ring-red-600 focus:rounded-lg"
        >
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  )
}