"use client";

import { useState, useEffect, FC, memo, useMemo } from 'react';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import type { Hospital, Professionnal, PlaceDetails, MockHospitalData, HospitalWithMock } from '@/types/api';
export const dynamic = 'force-dynamic';

async function getHospitals(latitude: number, longitude: number): Promise<Hospital[]> {
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

// --- UI Components ---

const HospitalCard: FC<{ hospital: HospitalWithMock }> = memo(({ hospital }) => {
  const distance = hospital.fields.dist 
    ? (hospital.fields.dist / 1000).toFixed(1) 
    : null;
  
  return (
    <article 
      className="p-4 bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow focus-within:ring-4 focus-within:ring-red-600"
      role="listitem"
      aria-label={`Hôpital ${hospital.fields.name}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-bold text-white flex-1 text-lg">
        <Link 
        href={`/hopitaux/${hospital.recordid}`}
        aria-label={`Voir les détails de ${hospital.fields.name}`}
        >
          {hospital.fields.name}
        </Link>
        </p>
        {distance && (
          <span className="flex-shrink-0 font-bold py-2 px-4 rounded-full text-black bg-white text-sm" aria-label={`Distance: ${distance} kilomètres`}>
            {distance} km
          </span>
        )}
      </div>

      {hospital.fields.phone && (
        <a 
          href={`tel:${hospital.fields.phone}`} 
          className="flex items-center gap-2 w-fit mt-3 focus:outline-none focus:ring-4 focus:ring-red-600 rounded px-2 py-1 -ml-2 hover:bg-black/10 transition-colors"
          aria-label={`Appeler ${hospital.fields.name} au ${hospital.fields.phone}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Image 
            src="/images/icons/phone-white.svg" 
            alt=""
            width={20} 
            height={20}  
            quality={100}
            aria-hidden="true"
          />
          <span className="text-white font-bold underline">{hospital.fields.phone}</span>
        </a>
      )}
      {!hospital.fields.phone && (
        <p className="text-white/70 text-sm italic">Aucun numéro de téléphone disponible</p>
      )}
    </article>
  );
});
HospitalCard.displayName = 'HospitalCard';

const HospitalList: FC<{ hospitals: HospitalWithMock[] }> = ({ hospitals }) => {
  if (hospitals.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow" role="status">
        <p className="text-slate-600 text-lg">Aucun hôpital trouvé à proximité.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Liste des hôpitaux avec services d'urgence">
      {hospitals.map(hospital => (
        <HospitalCard key={hospital.recordid} hospital={hospital} />
      ))}
    </div>
  );
};

// --- Main Page Component ---

export default function HopitauxPage() {
  const [hospitals, setHospitals] = useState<HospitalWithMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
  const [selectedSpecifications, setSelectedSpecifications] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const nearbyHospitals = await getHospitals(latitude, longitude);
            const hospitalsWithMock = await Promise.all(
              nearbyHospitals.map(async (hospital) => {
                let result: HospitalWithMock = hospital;
                try {
                  const mockRes = await fetch(`/api/hospitals/mock/search?name=${encodeURIComponent(hospital.fields.name)}`);
                  if (mockRes.ok) {
                    const mockData: MockHospitalData = await mockRes.json();
                    result = { ...result, mockData };
                    
                    if (mockData.place_id && mockData.place_id !== 'TODO_GOOGLE_PLACE_ID') {
                      const accessRes = await fetch(`/api/hospitals/accessibility/${mockData.place_id}`);
                      if (accessRes.ok) {
                        const placeData: PlaceDetails = await accessRes.json();
                        result = { 
                          ...result, 
                          placeAddress: placeData.formattedAddress,
                          accessibilityOptions: placeData.accessibilityOptions,
                        };
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Erreur pour ${hospital.fields.name}:`, error);
                }
                
                return result;
              })
            );
            
            setHospitals(hospitalsWithMock);
            setLoading(false);
          },
          (geoError) => {
            console.error("Erreur de géolocalisation : ", geoError);
            setError("Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation.");
            setLoading(false);
          }
        );
      } else {
        setError("La géolocalisation n'est pas supportée par votre navigateur.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const distanceOptions = [
    { value: '', label: 'Tous les hôpitaux' },
    { value: '5', label: 'Jusqu\'à 5 km' },
    { value: '10', label: 'Jusqu\'à 10 km' },
    { value: '15', label: 'Jusqu\'à 15 km' },
    { value: '20', label: 'Jusqu\'à 20 km' },
    { value: '25', label: 'Jusqu\'à 25 km' },
    { value: '30', label: 'Jusqu\'à 30 km' },
    { value: '35', label: 'Jusqu\'à 35 km' },
    { value: '40', label: 'Jusqu\'à 40 km' },
    { value: '45', label: 'Jusqu\'à 45 km' },
    { value: '50', label: 'Jusqu\'à 50 km' },
    { value: '100', label: 'Jusqu\'à 100 km' }
  ];

  const specificationOptions = [
    { value: 'fire_fighter', label: 'Accès pompiers' },
    { value: 'social_worker', label: 'Assistante sociale' },
    { value: 'wheelchairAccessibleEntrance', label: 'Entrée accessible fauteuil roulant' },
    { value: 'wheelchairAccessibleParking', label: 'Parking accessible fauteuil roulant' },
    { value: 'wheelchairAccessibleRestroom', label: 'Toilettes accessibles fauteuil roulant' },
    { value: 'wheelchairAccessibleSeating', label: 'Places assises accessibles' }
  ];

  const specializationOptions = [
    { value: 'internist', label: 'Médecine interne' },
    { value: 'pmr', label: 'Médecine physique et réadaptation' },
    { value: 'rheumatologist', label: 'Rhumatologie' },
    { value: 'cardiologist', label: 'Cardiologie' },
    { value: 'pulmonologist', label: 'Pneumologie' },
    { value: 'nephrologist', label: 'Néphrologie' },
    { value: 'gasteroenterologist', label: 'Gastro-entérologie' },
    { value: 'endocrinologist', label: 'Endocrinologie' },
    { value: 'dermatologist', label: 'Dermatologie' },
    { value: 'ent', label: 'ORL' },
    { value: 'gynecologist', label: 'Gynécologie' },
    { value: 'urologist', label: 'Urologie' },
    { value: 'orthopedist', label: 'Orthopédie' },
    { value: 'psychologist', label: 'Psychologie' },
    { value: 'neurosurgeon', label: 'Neurochirurgie' },
    { value: 'pediatric_surgeon', label: 'Chirurgie pédiatrique' },
    { value: 'orthopedic_surgeon', label: 'Chirurgie orthopédique' }
  ];

  const filteredHospitals = useMemo(() => {
    let filtered = [...hospitals];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(hospital => 
        hospital.fields.name.toLowerCase().includes(query)
      );
    }

    if (selectedSpecifications.length > 0) {
      filtered = filtered.filter(hospital => {
        return selectedSpecifications.every(spec => {
          if (spec === 'fire_fighter') {
            return hospital.mockData?.fire_fighter;
          }
          if (spec === 'social_worker') {
            return hospital.mockData?.social_worker;
          }
          if (spec === 'wheelchairAccessibleEntrance') {
            return hospital.accessibilityOptions?.wheelchairAccessibleEntrance;
          }
          if (spec === 'wheelchairAccessibleParking') {
            return hospital.accessibilityOptions?.wheelchairAccessibleParking;
          }
          if (spec === 'wheelchairAccessibleRestroom') {
            return hospital.accessibilityOptions?.wheelchairAccessibleRestroom;
          }
          if (spec === 'wheelchairAccessibleSeating') {
            return hospital.accessibilityOptions?.wheelchairAccessibleSeating;
          }
          
          return false;
        });
      });
    }
    if (selectedSpecializations.length > 0) {
      filtered = filtered.filter(hospital => {
        if (!hospital.mockData?.professionnal) return false;
        return selectedSpecializations.every(spec => {
          return hospital.mockData!.professionnal[spec as keyof Professionnal];
        });
      });
    }

    if (maxDistanceKm !== null) {
      filtered = filtered.filter(hospital => {
        const distanceM = hospital.fields.dist ? hospital.fields.dist as number : Infinity;
        const distanceKm = distanceM / 1000;
        return distanceKm <= maxDistanceKm;
      });
    }

    return filtered;
  }, [hospitals, searchQuery, maxDistanceKm, selectedSpecifications, selectedSpecializations]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto pb-8">
          <h1 className="sr-only text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Hôpitaux avec services d&apos;urgence
          </h1>
          <SearchBar
            placeholder="Rechercher un hôpital"
            value={searchQuery}
            onChange={setSearchQuery}
            className="mb-4"
          />
          {!loading && !error && hospitals.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-72 -mx-4 px-4 md:px-2 md:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <MultiSelectFilter
                  label="Distance"
                  options={distanceOptions}
                  selectedValues={maxDistanceKm !== null ? [String(maxDistanceKm)] : ['']}
                  onChange={(values) => setMaxDistanceKm(values[0] ? parseInt(values[0], 10) : null)}
                  mode="single"
                />
                <MultiSelectFilter
                  label="Spécifications"
                  options={specificationOptions}
                  selectedValues={selectedSpecifications}
                  onChange={setSelectedSpecifications}
                />
                <MultiSelectFilter
                  label="Spécialisations médicales"
                  options={specializationOptions}
                  selectedValues={selectedSpecializations}
                  onChange={setSelectedSpecializations}
                />
              </div>
              <div className="text-center text-sm text-black -mt-64">
                {filteredHospitals.length} {filteredHospitals.length > 1 ? 'hôpitaux trouvés' : 'hôpital trouvé'}
              </div>
            </div>
          )}

          {loading && <Loading message="Localisation en cours..." ariaLabel="Chargement des hôpitaux à proximité" />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            <HospitalList hospitals={filteredHospitals} />
          )}
        </div>
      </main>
    </>
  );
}