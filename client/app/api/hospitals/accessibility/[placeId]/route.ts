import { NextResponse } from 'next/server';

interface AccessibilityOptions {
  wheelchairAccessibleParking?: boolean;
  wheelchairAccessibleEntrance?: boolean;
  wheelchairAccessibleRestroom?: boolean;
  wheelchairAccessibleSeating?: boolean;
}

interface PlaceDetailsResponse {
  formattedAddress?: string;
  accessibilityOptions?: AccessibilityOptions;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY is not defined in environment variables');
    return NextResponse.json(
      { error: 'Configuration error: Google Places API key is missing' },
      { status: 500 }
    );
  }

  if (!placeId) {
    return NextResponse.json(
      { error: 'Place ID is required' },
      { status: 400 }
    );
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=formattedAddress,accessibilityOptions&key=${apiKey}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Google Places API Error for ${placeId}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      return NextResponse.json(
        { error: 'Failed to fetch accessibility data from Google Places' },
        { status: response.status }
      );
    }

    const data: PlaceDetailsResponse = await response.json();
    
    return NextResponse.json({
      formattedAddress: data.formattedAddress,
      accessibilityOptions: data.accessibilityOptions || {}
    });

  } catch (error) {
    console.error(`Error fetching accessibility for ${placeId}:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
