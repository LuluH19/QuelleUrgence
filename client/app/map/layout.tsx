import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Carte des urgences',
    description: 'Visualisez les hôpitaux avec services d\'urgence les plus proches de votre position.',
}

export default function MapLayout({
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
