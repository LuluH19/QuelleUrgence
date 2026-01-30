import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

async function getHospitalName(id: string): Promise<string | null> {
  const baseUrl = process.env.NEXT_PUBLIC_HOSPITALS_SINGLE_API_URL;

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_HOSPITALS_SINGLE_API_URL manquant');
    return null;
  }

  const apiUrl = `${baseUrl}&rows=1&q=recordid:${id}`;
  const res = await fetch(apiUrl, { next: { revalidate: 3600 } });

  if (!res.ok) return null;

  const data = await res.json();
  return data.records?.[0]?.fields?.name ?? null;
}

export async function generateMetadata(
  props: Props
): Promise<Metadata> {
  const params = await props.params;
  const hospitalName = await getHospitalName(params.id);

  return {
    title: hospitalName
      ? `${hospitalName} – Urgences`
      : `Détail de l'hôpital`,
    description: hospitalName
      ? `Consultez les informations de l'hôpital ${hospitalName}.`
      : `Consultez les détails de l'hôpital.`,
  };
}

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
