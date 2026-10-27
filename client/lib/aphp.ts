import type { AphService } from '@/types/api';
import type AttendanceData from '@/types/attendance';

// L'API AP-HP bloque les IP des serveurs (Vercel renvoie 403), mais autorise
// les appels CORS depuis le navigateur : on l'appelle donc côté client.

interface ApiInstitution {
  institutionCode: string;
  institutionName: string;
  institutionEnfant: boolean;
}

export async function getAphpServices(): Promise<AphService[]> {
  const apiUrl = process.env.NEXT_PUBLIC_APHP_HOSPITALS_API_URL;

  if (!apiUrl) {
    console.error('NEXT_PUBLIC_APHP_HOSPITALS_API_URL is not defined in environment variables');
    return [];
  }

  const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });

  if (!res.ok) {
    throw new Error(`APHP API Error: ${res.status} ${res.statusText}`);
  }

  const data: ApiInstitution[] = await res.json();

  return data.map(institution => ({
    name: institution.institutionName?.toUpperCase() || '',
    code: institution.institutionCode,
    isPediatric: institution.institutionEnfant,
  }));
}

export async function getAttendance(hospitalCode: string): Promise<AttendanceData[] | null> {
  const apiBase = process.env.NEXT_PUBLIC_APHP_ATTENDANCE_API_BASE;

  if (!apiBase) {
    console.error('NEXT_PUBLIC_APHP_ATTENDANCE_API_BASE is not defined in environment variables');
    return null;
  }

  try {
    const res = await fetch(`${apiBase}/${encodeURIComponent(hospitalCode)}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.error(`Erreur API d'affluence: ${res.status} ${res.statusText}`);
      return null;
    }

    return (await res.json()) as AttendanceData[];
  } catch (error) {
    console.error("Échec de la récupération des données d'affluence", error);
    return null;
  }
}
