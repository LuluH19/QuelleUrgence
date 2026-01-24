import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Professionnal {
  internist: boolean;
  pmr: boolean;
  rheumatologist: boolean;
  cardiologist: boolean;
  pulmonologist: boolean;
  nephrologist: boolean;
  gasteroenterologist: boolean;
  endocrinologist: boolean;
  dermatologist: boolean;
  ent: boolean;
  gynecologist: boolean;
  urologist: boolean;
  orthopedist: boolean;
  psychologist: boolean;
  neurosurgeon: boolean;
  pediatric_surgeon: boolean;
  orthopedic_surgeon: boolean;
}

interface MockHospital {
  name: string;
  place_id: string;
  fire_fighter: boolean;
  social_worker: boolean;
  professionnal: Professionnal;
}

interface MockData {
  hospitals: MockHospital[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  try {
    const { placeId } = await params;

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID required' },
        { status: 400 }
      );
    }

    const mockFilePath = path.join(process.cwd(), 'data', 'hospitalMock.json');
    
    try {
      await fs.access(mockFilePath);
    } catch {
      return NextResponse.json(
        { 
          error: 'Data not available',
          message: 'The data file is not accessible, please contact the administrator of the website.'
        },
        { status: 404 }
      );
    }

    const fileContent = await fs.readFile(mockFilePath, 'utf-8');
    const mockData: MockData = JSON.parse(fileContent);
    const hospital = mockData.hospitals.find(h => h.place_id === placeId);

    if (!hospital) {
      return NextResponse.json(
        { error: 'Hospital not found in the mock data' },
        { status: 404 }
      );
    }

    return NextResponse.json(hospital);

  } catch (error) {
    console.error('Error while reading the mock file:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
