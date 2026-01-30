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
    return <>{children}</>;
}
