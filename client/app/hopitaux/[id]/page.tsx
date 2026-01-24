"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import MapWrapper from '@/components/MapWrapper';
import Attendance from '@/components/Attendance';

interface HospitalDetails {
  recordid: string;
  fields: {
    name: string;
    addr_street?: string;
    addr_postcode?: string;
    addr_city?: string;
    phone?: string;
    lat?: number;
    lon?: number;
    website?: string;
    email?: string;
    emergency?: string;
  };
}

interface AphService {
  name: string;
  code: string;
  isPediatric: boolean;
}

interface AccessibilityOptions {
  wheelchairAccessibleParking?: boolean;
  wheelchairAccessibleEntrance?: boolean;
  wheelchairAccessibleRestroom?: boolean;
  wheelchairAccessibleSeating?: boolean;
}

interface MockHospitalData {
  name: string;
  place_id: string;
  fire_fighter: boolean;
  social_worker: boolean;
}

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [hospital, setHospital] = useState<HospitalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [aphServices, setAphServices] = useState<AphService[]>([]);
  const [matchingServices, setMatchingServices] = useState<AphService[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [mockData, setMockData] = useState<MockHospitalData | null>(null);
  const [accessibilityOptions, setAccessibilityOptions] = useState<AccessibilityOptions | null>(null);
  const [characteristicsLoading, setCharacteristicsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await params;
      setHospitalId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!hospitalId) return;

    async function fetchHospital() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_HOSPITALS_SINGLE_API_URL;
        
        if (!baseUrl) {
          throw new Error('Configuration error: NEXT_PUBLIC_HOSPITALS_SINGLE_API_URL is missing');
        }

        const apiUrl = `${baseUrl}&rows=100&q=recordid:${hospitalId}`;
        
        const res = await fetch(apiUrl, { cache: 'no-store' });

        if (!res.ok) {
          throw new Error('Hôpital non trouvé');
        }

        const data = await res.json();
        
        if (data.records && data.records.length > 0) {
          setHospital(data.records[0]);
        } else {
          setError('Hôpital non trouvé');
        }
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    }

    fetchHospital();
  }, [hospitalId]);

  // Récupérer les services APHP
  useEffect(() => {
    async function fetchAphpServices() {
      try {
        const res = await fetch('/api/hospitals');
        if (res.ok) {
          const data = await res.json();
          setAphServices(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des services AP-HP:', error);
      }
    }
    fetchAphpServices();
  }, []);

  // Trouver tous les services APHP correspondants au nom de l'hôpital
  useEffect(() => {
    if (!hospital || aphServices.length === 0) return;

    const hospitalNameUpper = hospital.fields.name.toUpperCase();
    const matches = aphServices.filter(service =>
      hospitalNameUpper.includes(service.name) || service.name.includes(hospitalNameUpper)
    );

    setMatchingServices(matches);
    
    // Sélectionner automatiquement le premier service s'il n'y en a qu'un
    if (matches.length === 1) {
      setSelectedCode(matches[0].code);
    }
  }, [hospital, aphServices]);

  useEffect(() => {
    if (!hospital) return;

    async function fetchCharacteristics() {
      setCharacteristicsLoading(true);
      
      try {
        const mockRes = await fetch(`/api/hospitals/mock/search?name=${encodeURIComponent(hospital!.fields.name)}`);
        if (mockRes.ok) {
          const mockHospital: MockHospitalData = await mockRes.json();
          setMockData(mockHospital);
          if (mockHospital.place_id && mockHospital.place_id !== 'TODO_GOOGLE_PLACE_ID') {
            const accessRes = await fetch(`/api/hospitals/accessibility/${mockHospital.place_id}`);
            if (accessRes.ok) {
              const accessData = await accessRes.json();
              setAccessibilityOptions(accessData);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des caractéristiques:', error);
      } finally {
        setCharacteristicsLoading(false);
      }
    }

    fetchCharacteristics();
  }, [hospital]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
          <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto pb-8">
            <div className="p-8 text-center" role="status" aria-live="polite">
              <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" aria-hidden="true"></div>
              <p className="mt-4 text-black font-medium">Chargement...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !hospital) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
          <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto pb-8">
            <div className="p-4 bg-rose-50 border-rose-300 border rounded-lg" role="alert">
              <p className="text-rose-700 font-medium">⚠️ {error || 'Hôpital non trouvé'}</p>
            </div>
            <Link 
              aria-label="Retour à la liste des hôpitaux"
              href="/hopitaux" 
              className="mt-4 inline-flex items-center gap-2 text-primary font-bold hover:underline focus:outline-none focus:ring-4 focus:ring-red-600 rounded px-2 py-1"
            >
              ← Retour à la liste
            </Link>
          </div>
        </main>
      </>
    );
  }

  const address = [
    hospital.fields.addr_street,
    hospital.fields.addr_postcode,
    hospital.fields.addr_city
  ].filter(Boolean).join(', ');

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="relative shadow-[0_4px_4px_rgba(0,0,0,0.25)]" aria-label="En-tête de la page">
          <div className="absolute top-0 left-0 w-full h-full">
            <Image 
              src="/images/home/hero-banner.webp" 
              alt="Vue d'un service d'urgences hospitalier moderne et accueillant" 
              objectFit="cover"
              fill={true}
              placeholder='blur'
              blurDataURL='/images/home/hero-banner.webp'
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40 z-10" aria-hidden="true"></div>
          </div>
          <Link 
            href="/hopitaux" 
            className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 text-white font-bold hover:underline focus:ring-4 focus:ring-red-600 outline-none px-3 py-2 bg-primary rounded-full transition-all hover:scale-105"
            aria-label="Retour à la liste des hôpitaux"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la liste
          </Link>
          <div className="relative z-10 flex flex-row justify-around items-center gap-4 pt-4 px-4 w-full min-h-[250px] md:min-h-[300px] lg:min-h-[350px]">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white text-left">
              {hospital.fields.name}
            </h1>
          </div>
        </section>

        <section className='py-6 px-4 flex flex-col gap-4 items-center' aria-labelledby="map-heading">
          <h2 id="map-heading" className='text-lg md:text-xl lg:text-2xl font-bold text-left w-full'>Localisation</h2>
          <MapWrapper />
          <button 
            className="bg-primary text-white px-4 py-2 rounded-full font-bold w-fit focus:outline-none focus:ring-4 focus:ring-red-600" 
            type="button"
            aria-label="Accéder à l'emplacement de l'hôpital sur la carte interactive"
            onClick={() => {
              router.push(`/map?lat=${hospital.fields.lat}&lon=${hospital.fields.lon}`);
            }}
          >
            Accéder à la carte
          </button>
        </section>

        <section className='py-6 px-4 flex flex-col gap-4' aria-labelledby="characteristics-heading">
          <h2 id="characteristics-heading" className='text-lg md:text-xl lg:text-2xl font-bold text-left w-full'>Caractéristiques</h2>
          
          {characteristicsLoading ? (
            <div className="flex items-center gap-2 text-slate-500" role="status" aria-live="polite">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" aria-hidden="true"></div>
              <span>Chargement des caractéristiques...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockData && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <span aria-hidden="true">🏥</span>
                    Services spéciaux
                  </h3>
                  <ul className="space-y-2" role="list">
                    <li className="flex items-center gap-2">
                      <span 
                        className={`w-5 h-5 flex items-center justify-center rounded-full ${mockData.fire_fighter ? 'bg-green-500' : 'bg-gray-300'}`}
                        aria-hidden="true"
                      >
                        {mockData.fire_fighter ? '✓' : '✗'}
                      </span>
                      <span className={mockData.fire_fighter ? 'text-black' : 'text-gray-500'}>
                        Accès pompiers
                      </span>
                      <span className="sr-only">
                        {mockData.fire_fighter ? 'Disponible' : 'Non disponible'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span 
                        className={`w-5 h-5 flex items-center justify-center rounded-full ${mockData.social_worker ? 'bg-green-500' : 'bg-gray-300'}`}
                        aria-hidden="true"
                      >
                        {mockData.social_worker ? '✓' : '✗'}
                      </span>
                      <span className={mockData.social_worker ? 'text-black' : 'text-gray-500'}>
                        Assistante sociale
                      </span>
                      <span className="sr-only">
                        {mockData.social_worker ? 'Disponible' : 'Non disponible'}
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
                  <span aria-hidden="true">♿</span>
                  Accessibilité
                </h3>
                {accessibilityOptions && Object.keys(accessibilityOptions).length > 0 ? (
                  <ul className="space-y-2" role="list">
                    {accessibilityOptions.wheelchairAccessibleEntrance !== undefined && (
                      <li className="flex items-center gap-2">
                        <span 
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-xs ${accessibilityOptions.wheelchairAccessibleEntrance ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-hidden="true"
                        >
                          {accessibilityOptions.wheelchairAccessibleEntrance ? '✓' : '✗'}
                        </span>
                        <span className={accessibilityOptions.wheelchairAccessibleEntrance ? 'text-black' : 'text-gray-500'}>
                          Entrée accessible fauteuil roulant
                        </span>
                        <span className="sr-only">
                          {accessibilityOptions.wheelchairAccessibleEntrance ? 'Disponible' : 'Non disponible'}
                        </span>
                      </li>
                    )}
                    {accessibilityOptions.wheelchairAccessibleParking !== undefined && (
                      <li className="flex items-center gap-2">
                        <span 
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-xs ${accessibilityOptions.wheelchairAccessibleParking ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-hidden="true"
                        >
                          {accessibilityOptions.wheelchairAccessibleParking ? '✓' : '✗'}
                        </span>
                        <span className={accessibilityOptions.wheelchairAccessibleParking ? 'text-black' : 'text-gray-500'}>
                          Parking accessible fauteuil roulant
                        </span>
                        <span className="sr-only">
                          {accessibilityOptions.wheelchairAccessibleParking ? 'Disponible' : 'Non disponible'}
                        </span>
                      </li>
                    )}
                    {accessibilityOptions.wheelchairAccessibleRestroom !== undefined && (
                      <li className="flex items-center gap-2">
                        <span 
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-xs ${accessibilityOptions.wheelchairAccessibleRestroom ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-hidden="true"
                        >
                          {accessibilityOptions.wheelchairAccessibleRestroom ? '✓' : '✗'}
                        </span>
                        <span className={accessibilityOptions.wheelchairAccessibleRestroom ? 'text-black' : 'text-gray-500'}>
                          Toilettes accessibles fauteuil roulant
                        </span>
                        <span className="sr-only">
                          {accessibilityOptions.wheelchairAccessibleRestroom ? 'Disponible' : 'Non disponible'}
                        </span>
                      </li>
                    )}
                    {accessibilityOptions.wheelchairAccessibleSeating !== undefined && (
                      <li className="flex items-center gap-2">
                        <span 
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-white text-xs ${accessibilityOptions.wheelchairAccessibleSeating ? 'bg-green-500' : 'bg-gray-300'}`}
                          aria-hidden="true"
                        >
                          {accessibilityOptions.wheelchairAccessibleSeating ? '✓' : '✗'}
                        </span>
                        <span className={accessibilityOptions.wheelchairAccessibleSeating ? 'text-black' : 'text-gray-500'}>
                          Places assises accessibles
                        </span>
                        <span className="sr-only">
                          {accessibilityOptions.wheelchairAccessibleSeating ? 'Disponible' : 'Non disponible'}
                        </span>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Informations d&apos;accessibilité non disponibles pour cet établissement.
                  </p>
                )}
              </div>
              {!mockData && !accessibilityOptions && (
                <div className="col-span-full text-center py-4">
                  <p className="text-gray-500 italic">
                    Les caractéristiques de cet établissement ne sont pas encore disponibles.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {matchingServices.length > 0 && (
          <section className='py-6 px-4 flex flex-col gap-4 items-center' aria-labelledby="affluence-heading">
            <h2 id="affluence-heading" className='text-lg md:text-xl lg:text-2xl font-bold text-left w-full'>Affluence en temps réel</h2>
            
            {matchingServices.length === 1 && selectedCode && (
              <div className="w-full max-w-4xl">
                <Attendance hospitalCode={selectedCode} />
              </div>
            )}

            {matchingServices.length > 1 && (
              <div className="w-full max-w-4xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Choisissez un service pour voir l'affluence">
                  {matchingServices.map(service => (
                    <button
                      key={service.code}
                      onClick={() => setSelectedCode(service.code)}
                      className={`px-6 py-4 rounded-lg font-bold text-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-600 ${
                        selectedCode === service.code
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-white text-primary border-primary border-2 hover:border-primary hover:bg-primary hover:text-white'
                      }`}
                      aria-pressed={selectedCode === service.code}
                      aria-controls={`attendance-${service.code}`}
                    >
                      {service.isPediatric ? '👶 Service Pédiatrique' : '👨‍⚕️ Service Adultes'}
                    </button>
                  ))}
                </div>

                {selectedCode && (
                  <div
                    id={`attendance-${selectedCode}`}
                    role="region"
                    aria-label={`Affluence pour le service ${matchingServices.find(s => s.code === selectedCode)?.isPediatric ? 'pédiatrique' : 'adultes'}`}
                  >
                    <Attendance hospitalCode={selectedCode} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

