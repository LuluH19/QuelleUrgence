"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import MapWrapper from '@/components/MapWrapper';
import Attendance from '@/components/Attendance';
import Specification from '@/components/Specification';
import NotFoundData from '@/components/NotFoundData';
import type { Hospital, MockHospitalData, AphService } from '@/types/api';

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [aphServices, setAphServices] = useState<AphService[]>([]);
  const [matchingServices, setMatchingServices] = useState<AphService[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [mockData, setMockData] = useState<MockHospitalData | null>(null);
  const [specificationsLoading, setspecificationsLoading] = useState(true);
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
      setspecificationsLoading(true);
      
      try {
        const mockRes = await fetch(`/api/hospitals/mock/search?name=${encodeURIComponent(hospital!.fields.name)}`);
        if (mockRes.ok) {
          const mockHospital: MockHospitalData = await mockRes.json();
          setMockData(mockHospital);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des caractéristiques:', error);
      } finally {
        setspecificationsLoading(false);
      }
    }

    fetchCharacteristics();
  }, [hospital]);

  if (loading) {
    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" tabIndex={-1}>
          <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto pb-8">
            <Loading message="Chargement..." ariaLabel="Chargement des caractéristiques de l'hôpital" />
          </div>
        </main>
      </>
    );
  }

  if (error || !hospital) {
    return (
      <>
        <Header />
        <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" tabIndex={-1}>
          <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto pb-8">
            <ErrorMessage message={error || 'Hôpital non trouvé'} />
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

  const hospitalCenter: [number, number] | null = (() => {
    const fields = hospital.fields;

    if (fields.meta_geo_point && Array.isArray(fields.meta_geo_point)) {
      const [lat, lon] = fields.meta_geo_point;
      if (typeof lat === 'number' && typeof lon === 'number') {
        return [lat, lon];
      }
    }

    if (fields.geometry?.coordinates && Array.isArray(fields.geometry.coordinates)) {
      const [lon, lat] = fields.geometry.coordinates;
      if (typeof lat === 'number' && typeof lon === 'number') {
        return [lat, lon];
      }
    }

    if (fields.lat && fields.lon) {
      return [fields.lat, fields.lon];
    }

    return null;
  })();

  return (
    <>
      <Header />
      <main id="main-content" className="bg-white" tabIndex={-1}>
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
          <MapWrapper
            initialCenter={hospitalCenter ?? undefined}
            initialZoom={16}
            focusRecordId={hospital.recordid}
          />
          <div className="w-full max-w-4xl flex flex-col items-center justify-center gap-2">
            {hospital.fields.phone && (
              <Link 
                href={`tel:${hospital.fields.phone}`} 
                className="flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-red-600 rounded px-2 py-1 -ml-2 hover:bg-black/10 transition-colors"
                aria-label={`Appeler ${hospital.fields.name} au ${hospital.fields.phone}`}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm md:text-base lg:text-lg text-start sm:text-center w-full text-black font-bold underline">Téléphone : {hospital.fields.phone}</span>
              </Link>
            )}
            {!hospital.fields.phone && (
              <p className="text-white/70 text-sm italic">Aucun numéro de téléphone disponible</p>
            )}
          </div>
          
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

          {matchingServices.length === 0 && (
            <NotFoundData message="Le traffic en temps réel n&apos;est pas encore disponible pour ce site." />
          )}
        </section>

        <section className='py-6 px-4 flex flex-col gap-4' aria-labelledby="characteristics-heading">
          <h2 id="characteristics-heading" className='text-lg md:text-xl lg:text-2xl font-bold text-left w-full'>Spécifications</h2>
          
          {specificationsLoading ? (
            <Loading message="Chargement des caractéristiques..." ariaLabel="Chargement des caractéristiques de l'hôpital" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const specifications = [
                  mockData?.fire_fighter && {
                    imagePath: "/images/icons/fire_fighter-white.svg",
                    description: "Accès pompiers"
                  },
                  mockData?.social_worker && {
                    imagePath: "/images/icons/fire_fighter-white.svg",
                    description: "Assistante sociale"
                  },
                  hospital.fields.wheelchair === 'yes' && {
                    imagePath: "/images/icons/wheelchair-white.svg",
                    description: "Accessible en fauteuil roulant"
                  },
                  hospital.fields.wheelchair === 'limited' && {
                    imagePath: "/images/icons/wheelchair-white.svg",
                    description: "Accessibilité fauteuil roulant partielle"
                  }
                ].filter(Boolean) as { imagePath: string; description: string }[];

                const isOdd = specifications.length % 2 !== 0;

                return specifications.map((spec, index) => (
                  <Specification
                    key={spec.description}
                    fullWidth={isOdd && index === specifications.length - 1}
                    imagePath={spec.imagePath}
                    description={spec.description}
                  />
                ));
              })()}
              
              {!mockData && !hospital.fields.wheelchair && (
                <div className="col-span-full flex items-center justify-center">
                  <NotFoundData message="Les spécifications de cet établissement ne sont pas encore disponibles." />
                </div>
              )}
            </div>
          )}
        </section>

        {mockData?.professionnal && (
          <section className='py-6 px-4 flex flex-col gap-4' aria-labelledby="specializations-heading">
            <h2 id="specializations-heading" className='text-lg md:text-xl lg:text-2xl font-bold text-left w-full'>Spécialisations médicales</h2>
            
            {specificationsLoading ? (
              <Loading message="Chargement des spécialisations..." ariaLabel="Chargement des spécialisations médicales" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const specializations = [
                    mockData.professionnal.internist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Médecine interne"
                    },
                    mockData.professionnal.pmr && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Médecine physique et réadaptation"
                    },
                    mockData.professionnal.rheumatologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Rhumatologie"
                    },
                    mockData.professionnal.cardiologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Cardiologie"
                    },
                    mockData.professionnal.pulmonologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Pneumologie"
                    },
                    mockData.professionnal.nephrologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Néphrologie"
                    },
                    mockData.professionnal.gasteroenterologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Gastro-entérologie"
                    },
                    mockData.professionnal.endocrinologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Endocrinologie"
                    },
                    mockData.professionnal.dermatologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Dermatologie"
                    },
                    mockData.professionnal.ent && {
                      imagePath: "/images/logo/logo.svg",
                      description: "ORL (Oto-rhino-laryngologie)"
                    },
                    mockData.professionnal.gynecologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Gynécologie"
                    },
                    mockData.professionnal.urologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Urologie"
                    },
                    mockData.professionnal.orthopedist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Orthopédie"
                    },
                    mockData.professionnal.psychologist && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Psychologie"
                    },
                    mockData.professionnal.neurosurgeon && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Neurochirurgie"
                    },
                    mockData.professionnal.pediatric_surgeon && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Chirurgie pédiatrique"
                    },
                    mockData.professionnal.orthopedic_surgeon && {
                      imagePath: "/images/logo/logo.svg",
                      description: "Chirurgie orthopédique"
                    }
                  ].filter(Boolean) as { imagePath: string; description: string }[];

                  return specializations.map((spec, index) => (
                    <Specification
                      key={spec.description}
                      fullWidth={false}
                      imagePath={spec.imagePath}
                      description={spec.description}
                    />
                  ));
                })()}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

