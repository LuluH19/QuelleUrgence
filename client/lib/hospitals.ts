import { NextResponse } from 'next/server';
import { Hospital } from '@/types/api';

interface ApiHospital {
  institutionCode: string;
  institutionName: string;
  institutionEnfant: boolean;
  // L'API peut contenir d'autres champs que nous ignorons
}

export async function GET() {
  const apiUrl = process.env.APHP_HOSPITALS_API_URL;

  if (!apiUrl) {
    console.error('APHP_HOSPITALS_API_URL is not defined in environment variables');
    return NextResponse.json(
      { error: 'Configuration error: APHP_HOSPITALS_API_URL is missing' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: {
        // Revalider les données toutes les 24 heures
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      // Ajout de logs détaillés pour comprendre l'erreur de l'API distante
      const errorBody = await response.text();
      console.error(`APHP API Error: Status ${response.status} ${response.statusText}`, { body: errorBody });
      throw new Error(`Failed to fetch from APHP API: ${response.statusText}`);
    }

    const data: ApiHospital[] = await response.json();

    // Transformer les données pour inclure le type de service (adulte/enfant)
    const simplifiedHospitals = data.map(hospital => ({
      name: hospital.institutionName?.toUpperCase() || '',
      code: hospital.institutionCode,
      isPediatric: hospital.institutionEnfant,
    }));

    return NextResponse.json(simplifiedHospitals);

  } catch (error) {
    console.error('Error caught in /api/hospitals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch or parse hospital data', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

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