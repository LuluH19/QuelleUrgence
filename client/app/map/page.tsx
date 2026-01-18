"use client";

import Header from '@/components/Header';
import MapWrapper from '@/components/MapWrapper';

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
        <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto pb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Carte des urgences
          </h1>
          <div className="mb-4">
            <p className="text-gray-700 text-center">
              Visualisez les hôpitaux avec services d&apos;urgence les plus proches de votre position.
            </p>
          </div>
          <MapWrapper />
        </div>
      </main>
    </>
  );
}

