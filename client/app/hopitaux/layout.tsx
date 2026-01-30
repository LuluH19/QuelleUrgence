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
    return <>{children}</>;
}