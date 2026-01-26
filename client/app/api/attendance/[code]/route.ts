import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const apiBase = process.env.APHP_ATTENDANCE_API_BASE;

  if (!apiBase) {
    console.error('APHP_ATTENDANCE_API_BASE is not defined in environment variables');
    return NextResponse.json(
      { error: 'Configuration error: APHP_ATTENDANCE_API_BASE is missing' },
      { status: 500 }
    );
  }

  const apiUrl = `${apiBase}/${code}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MonApp/1.0 (+contact@mondomaine.com)',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erreur lors de l'appel à l'API APHP pour le code ${code}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });
      return NextResponse.json({ error: 'Failed to fetch data from APHP API', details: errorBody }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error(`Erreur interne du serveur lors de la récupération de l'affluence pour le code ${code}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}