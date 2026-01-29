import type { Metadata } from 'next'
import './globals.scss'

export const metadata: Metadata = {
  title: 'Quelles Urgences',
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
        {children}
      </body>
    </html>
  )
}