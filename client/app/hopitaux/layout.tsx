import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Liste des hôpitaux',
    description: 'Consultez la liste des hôpitaux avec services d\'urgence les plus proches de votre position.',
}

export default function HopitauxLayout({
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