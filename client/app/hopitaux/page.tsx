"use client";

import { useState, useEffect, FC, memo } from 'react';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// --- Types Definition ---

interface Hospital {
  recordid: string;
  fields: {
    name: string;
    phone?: string;
    dist?: string;
  };
}

// --- API Fetching Functions ---

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

const LoadingSpinner: FC = () => (
  <div className="p-8 text-center" role="status" aria-live="polite">
    <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" aria-hidden="true"></div>
    <p className="mt-4 text-black font-medium">Localisation en cours...</p>
    <span className="sr-only">Chargement des hôpitaux à proximité</span>
  </div>
);

const ErrorMessage: FC<{ message: string }> = ({ message }) => (
  <div className="p-4 bg-rose-50 border-rose-300 border rounded-lg" role="alert" aria-live="assertive">
    <p className="text-rose-700 font-medium">⚠️ {message}</p>
  </div>
);

const HospitalCard: FC<{ hospital: Hospital }> = memo(({ hospital }) => {
  const distance = hospital.fields.dist 
    ? (parseFloat(hospital.fields.dist) / 1000).toFixed(1) 
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

const HospitalList: FC<{ hospitals: Hospital[] }> = ({ hospitals }) => {
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
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const nearbyHospitals = await getHospitals(latitude, longitude);
            setHospitals(nearbyHospitals);
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <div className="px-4 py-6 sm:px-6 max-w-2xl mx-auto pb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Hôpitaux avec services d&apos;urgence
          </h1>
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            <HospitalList hospitals={hospitals} />
          )}
        </div>
      </main>
    </>
  );
}