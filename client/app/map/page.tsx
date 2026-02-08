"use client";

import Header from '@/components/Header';
import MapWrapper from '@/components/MapWrapper';

export default function MapPage() {
  return (
    <>
      <Header />
      {/* Mobile: Full screen layout */}
      <div className="md:hidden fixed inset-0 flex flex-col bg-white pt-4 pb-20">
        <div className="px-4 py-2 flex-shrink-0">
          <h1 className="text-xl font-bold text-primary text-center">
            Carte des urgences
          </h1>
        </div>
        <div className="flex-1 relative">
          <MapWrapper fullScreen={true} />
        </div>
      </div>
      {/* Desktop: Normal layout */}
      <main id="main-content" className="hidden md:block min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" tabIndex={-1}>
        <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto pb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">
            Carte des urgences
          </h1>
          <div className="mb-4">
            <p className="text-gray-700 text-center">
              Visualisez les hôpitaux avec services d&apos;urgence les plus proches de votre position.
            </p>
          </div>
          <MapWrapper fullScreen={false} />
        </div>
      </main>
    </>
  );
}
