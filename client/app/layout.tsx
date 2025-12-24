import type { Metadata } from 'next'
import './globals.scss'

export const metadata: Metadata = {
  title: 'Urgences',
  description: 'Application de gestion des urgences',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}