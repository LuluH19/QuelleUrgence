import type { Metadata } from 'next'
import './globals.scss'
import EmergencyButton from '@/components/EmergencyButton'

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
      <body className="pb-20 md:pb-0 md:pl-64">
        {children}
        <EmergencyButton />
      </body>
    </html>
  )
}