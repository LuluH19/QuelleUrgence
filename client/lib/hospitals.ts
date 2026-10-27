import { Hospital } from '@/types/api';

export async function getHospitals(latitude: number, longitude: number): Promise<Hospital[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_HOSPITALS_API_URL;
    const radius = process.env.NEXT_PUBLIC_SEARCH_RADIUS;
    const apiUrl = `${baseUrl}&geofilter.distance=${latitude},${longitude},${radius}`;
    
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      const errorDetails = await res.text();
      console.error(`Erreur API: ${res.status} ${res.statusText}`, errorDetails);
      throw new Error('Échec de la récupération des données des hôpitaux');
    }

    const data = await res.json();
    return data.records as Hospital[];
  } catch (error) {
    console.error(error);
    return [];
  }
}