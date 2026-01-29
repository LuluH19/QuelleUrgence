import { NextResponse } from 'next/server';

// Interface pour correspondre à la structure des données OpenDataSoft
interface ApiHospitalRecord {
  recordid: string;
  fields: {
    name: string;
    [key: string]: any;
  };
}

interface ApiResponse {
  records: ApiHospitalRecord[];
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

    const data: ApiResponse = await response.json();

    // Vérifier que records existe et est un tableau
    if (!data.records || !Array.isArray(data.records)) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid API response: records array not found');
    }

    // Transformer les données pour inclure le type de service (adulte/enfant)
    const simplifiedHospitals = data.records.map(record => ({
      name: record.fields.name?.toUpperCase() || '',
      code: record.recordid,
      isPediatric: false, // OpenDataSoft n'a pas ce champ, on met false par défaut
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