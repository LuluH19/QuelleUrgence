"use client";

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import HospitalList from '@/components/hopitaux/HospitalList';
import SearchBar from '@/components/SearchBar';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';
import AccessibilityBar from '@/components/AccessibilityBar';
import { getHospitals } from '@/app/api/hospitals/route';
import { sortByRecommendation } from '@/lib/recommendation';
import type { Professionnal, PlaceDetails, MockHospitalData, HospitalWithMock } from '@/types/api';
export const dynamic = 'force-dynamic';

export default function HopitauxPage() {
  const [hospitals, setHospitals] = useState<HospitalWithMock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
          async (geoError) => {
            if (geoError.code === 1) {
              console.warn("🚫 Géolocalisation refusée - utilisation de Paris par défaut");
              const parisHospitals = await getHospitals(48.8566, 2.3522);
              setHospitals(parisHospitals);
              setLoading(false);
              return;
            }

            console.error("Erreur de géolocalisation : ", geoError);
            setError("Impossible d'obtenir votre position. Affichage des hôpitaux de Paris.");
            const parisHospitals = await getHospitals(48.8566, 2.3522);
            setHospitals(parisHospitals);
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
          switch (spec) {
            case 'fire_fighter':
              return hospital.mockData?.fire_fighter;
            case 'social_worker':
              return hospital.mockData?.social_worker;
            case 'wheelchairAccessibleEntrance':
              return hospital.accessibilityOptions?.wheelchairAccessibleEntrance;
            case 'wheelchairAccessibleParking':
              return hospital.accessibilityOptions?.wheelchairAccessibleParking;
            case 'wheelchairAccessibleRestroom':
              return hospital.accessibilityOptions?.wheelchairAccessibleRestroom;
            case 'wheelchairAccessibleSeating':
              return hospital.accessibilityOptions?.wheelchairAccessibleSeating;
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

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" tabIndex={-1}>
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
              
              <div className="text-center text-sm text-black mt-4">
                {filteredHospitals.length} {filteredHospitals.length > 1 ? 'hôpitaux trouvés' : 'hôpital trouvé'}
              </div>
            </div>
          )}

          {/* En gros c'est un texte qui permet d'affiché un texte qui explique de pourquoi Le site recommandé est mis 
          en évidence visuellement et textuellement. C'est pour ça que je le laisse en commentaire pour l'instant, mais 
          je pense que c'est important de le remettre à terme, peut-être en l'intégrant dans une section "Comment ça marche ?" 
          ou "Pourquoi ce classement ?"
           */}
          {
          /* {!loading && !error && sortedHospitals.length > 0 && (
            <section
              className="mb-6 p-4 bg-white/80 rounded-xl border-2 border-primary text-left"
              aria-labelledby="critères-affichage"
            >
              <h2 id="critères-affichage" className="text-base font-bold text-primary mb-2">
                Critères d&apos;affichage
              </h2>
              <p className="text-sm text-black leading-relaxed">
                La liste est triée selon : <strong>distance</strong>, <strong>trafic</strong> (affluence), <strong>spécialités médicales</strong> et <strong>accessibilité</strong> (entrée, parking, toilettes, places assises). Le site <strong>recommandé</strong> est mis en évidence en premier avec un bandeau « Recommandé ».
              </p>
              <div className="mt-4 pt-4 border-t border-primary/30">
                <AccessibilityBar />
              </div>
            </section>
          )} */
          }

          {loading && <Loading message="Localisation en cours..." ariaLabel="Chargement des hôpitaux à proximité" />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            <HospitalList
              hospitals={sortedHospitals}
              recommendedRecordId={recommendedRecordId}
            />
          )}
        </div>
      </main>
    </>
  );
}