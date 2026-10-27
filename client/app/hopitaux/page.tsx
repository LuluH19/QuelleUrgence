"use client";

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import HospitalList from '@/components/hopitaux/HospitalList';
import SearchBar from '@/components/SearchBar';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import AccessibilityBar from '@/components/AccessibilityBar';
import RecentHospitals from '@/components/RecentHospitals';
import CognitiveCollapse from '@/components/cognitive/CognitiveCollapse';
import CognitiveListLimiter from '@/components/cognitive/CognitiveListLimiter';
import RecommendationCriteria from '@/components/hopitaux/RecommendationCriteria';
import { getHospitals } from '@/lib/hospitals';
import { useSearchQueryFromVoice } from '@/lib/voiceSearch';
import { sortByRecommendation, getRecommendationReasons } from '@/lib/recommendation';
import type { Hospital, Professionnal, MockHospitalData, HospitalWithMock } from '@/types/api';
export const dynamic = 'force-dynamic';

async function enrichWithMock(hospitals: Hospital[]): Promise<HospitalWithMock[]> {
  return Promise.all(
    hospitals.map(async (hospital) => {
      try {
        const mockRes = await fetch(`/api/hospitals/mock/search?name=${encodeURIComponent(hospital.fields.name)}`);
        if (mockRes.ok) {
          const mockData: MockHospitalData = await mockRes.json();
          return { ...hospital, mockData };
        }
      } catch (error) {
        console.error(`Erreur pour ${hospital.fields.name}:`, error);
      }
      return hospital;
    })
  );
}

export default function HopitauxPage() {
  const [hospitals, setHospitals] = useState<HospitalWithMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  useSearchQueryFromVoice(setSearchQuery);
  const [selectedSpecifications, setSelectedSpecifications] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      const loadHospitals = async (latitude: number, longitude: number) => {
        const nearbyHospitals = await getHospitals(latitude, longitude);
        setHospitals(await enrichWithMock(nearbyHospitals));
        setLoading(false);
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await loadHospitals(latitude, longitude);
          },
          async (geoError) => {
            if (geoError.code === 1) {
              console.warn("🚫 Géolocalisation refusée - utilisation de Paris par défaut");
            } else {
              console.warn("Erreur de géolocalisation : ", geoError.message);
              setError("Impossible d'obtenir votre position. Affichage des hôpitaux de Paris.");
            }
            await loadHospitals(48.8566, 2.3522);
          },
          {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 300000,
          }
        );
      } else {
        setError("La géolocalisation n'est pas supportée par votre navigateur.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const specificationOptions = [
    { value: 'fire_fighter', label: 'Accès pompiers' },
    { value: 'social_worker', label: 'Assistante sociale' },
    { value: 'wheelchair', label: 'Accessible en fauteuil roulant' }
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
          switch (spec) {
            case 'fire_fighter':
              return hospital.mockData?.fire_fighter;
            case 'social_worker':
              return hospital.mockData?.social_worker;
            case 'wheelchair':
              return hospital.fields.wheelchair === 'yes';
            default:
              return false;
          }
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

    return filtered;
  }, [hospitals, searchQuery, selectedSpecifications, selectedSpecializations]);

  const { sorted: sortedHospitals, recommendedRecordId } = useMemo(() => {
    return sortByRecommendation(filteredHospitals, selectedSpecializations, null);
  }, [filteredHospitals, selectedSpecializations]);

  const recommendedHospital = sortedHospitals[0] ?? null;
  const recommendationReasons = useMemo(() => {
    if (!recommendedHospital) return [];
    return getRecommendationReasons({
      hospital: recommendedHospital,
      selectedSpecializations,
      candidates: filteredHospitals,
    });
  }, [recommendedHospital, filteredHospitals, selectedSpecializations]);

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" tabIndex={-1}>
        <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto pb-8">
          <h1 className="sr-only text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Hôpitaux avec services d&apos;urgence
          </h1>
          <CognitiveCollapse label="Chercher ou filtrer les hôpitaux">
          <SearchBar
            placeholder="Rechercher un hôpital"
            value={searchQuery}
            onChange={setSearchQuery}
            className="mb-4"
          />
          <RecentHospitals className="mb-6" />
           {!loading && hospitals.length > 0 && (
            <div className="mb-6 relative z-30">
              <div className="flex items-center justify-start gap-3 py-2 flex-wrap">
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
              
              <div className="text-center text-sm text-black mt-4" role="status">
                {filteredHospitals.length} {filteredHospitals.length > 1 ? 'hôpitaux trouvés' : 'hôpital trouvé'}
                {recommendedHospital && (
                  <>
                    {'. '}Site recommandé : <strong>{recommendedHospital.fields.name}</strong>
                  </>
                )}
              </div>
            </div>
          )}

          {!loading && sortedHospitals.length > 0 && (
            <RecommendationCriteria>
              <AccessibilityBar />
            </RecommendationCriteria>
          )}
          </CognitiveCollapse>

          {loading && <Loading message="Localisation en cours..." ariaLabel="Chargement des hôpitaux à proximité" />}
          {error && <ErrorMessage message={error} />}
          {!loading && (!error || hospitals.length > 0) && (
            <CognitiveListLimiter count={sortedHospitals.length}>
            <HospitalList
              hospitals={sortedHospitals}
              recommendedRecordId={recommendedRecordId}
              recommendationReasons={recommendationReasons}
            />
            </CognitiveListLimiter>
          )}
        </div>
      </main>
    </>
  );
}