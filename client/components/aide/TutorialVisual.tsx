import Image from 'next/image';
import type { ReactNode } from 'react';
import type { TutorialImage, TutorialVisualKind } from '@/data/tutorials';

/**
 * Visuel d'un tutoriel.
 * Si une capture d'écran est fournie (`image`), elle est affichée.
 * Sinon, un schéma simplifié en HTML/CSS reprend les éléments de l'interface.
 * Le schéma est décoratif (aria-hidden) : sa description est donnée en légende.
 */

function ExampleBadge() {
  return (
    <span className="absolute top-2 right-2 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
      Exemple
    </span>
  );
}

function Call114Schema() {
  const items = [
    { icon: '/images/icons/home-black.svg', label: 'Accueil' },
    { icon: '/images/icons/map-black.svg', label: 'Carte' },
    { icon: '/images/icons/hospital-black.svg', label: 'Liste des hôpitaux' },
  ];
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs rounded-lg bg-white p-4 shadow-lg">
      <div className="flex items-center gap-4 rounded-full bg-black px-4 py-3 text-white ring-4 ring-amber-400">
        <Image src="/images/icons/phone-white.svg" alt="" width={40} height={40} className="w-10 h-10" />
        <span className="font-bold">Appeler le 114</span>
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-4 px-4 py-2 opacity-60">
          <Image src={item.icon} alt="" width={40} height={40} className="w-8 h-8" />
          <span className="font-bold text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function FilterSchema() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <div className="flex items-center gap-3 rounded-full border-2 border-black bg-white px-5 py-2 text-gray-600">
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        Rechercher un hôpital
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border-2 border-primary bg-primary px-4 py-1 font-semibold text-white">
          Spécifications
          <span className="ml-2 rounded-full bg-white px-2 text-xs text-primary">1</span>
        </span>
        <span className="rounded-full border-2 border-black bg-white px-4 py-1 font-semibold text-black">
          Spécialisations médicales
        </span>
      </div>
      <div className="rounded-lg border-2 border-primary bg-white p-3 text-sm text-black">
        <p className="flex items-center gap-2"><span className="inline-block w-4 h-4 border-2 border-gray-500 rounded-sm" /> Accès pompiers</p>
        <p className="flex items-center gap-2"><span className="inline-block w-4 h-4 border-2 border-gray-500 rounded-sm" /> Assistante sociale</p>
        <p className="flex items-center gap-2 font-bold"><span className="inline-block w-4 h-4 rounded-sm bg-primary" /> Accessible en fauteuil roulant</p>
      </div>
      <div className="rounded-lg border-2 border-amber-400 bg-primary p-3 text-white">
        <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black">★ Recommandé</span>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-bold">Hôpital A</span>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black">1,2 km</span>
        </div>
      </div>
    </div>
  );
}

function AttendanceSchema() {
  const cards = [
    { title: "Temps avant de voir l'infirmier", time: '20 min', patients: '4 patients' },
    { title: 'Temps avant de voir le médecin', time: '1h10', patients: '9 patients' },
    { title: "Temps total passé à l'hôpital", time: '3h', patients: '15 patients' },
  ];
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg bg-primary px-4 py-2 font-bold text-white">Service Adultes</span>
        <span className="rounded-lg border-2 border-primary bg-white px-4 py-2 font-bold text-primary">Service Pédiatrique</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card) => (
          <div key={card.title} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md">
            <div className="bg-primary p-2 text-center text-sm font-semibold text-white">{card.title}</div>
            <div className="p-3 text-center">
              <p className="text-2xl font-bold text-primary">{card.time}</p>
              <p className="text-sm text-black">{card.patients}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapPin({ className }: { className: string }) {
  return (
    <svg className={`absolute w-7 h-7 text-primary ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function MapSchema() {
  return (
    <div className="relative w-full max-w-md h-64 overflow-hidden rounded-lg border-2 border-black bg-emerald-50">
      <div className="absolute inset-x-0 top-1/3 h-3 bg-white" />
      <div className="absolute inset-y-0 left-1/4 w-3 bg-white" />
      <div className="absolute inset-y-0 right-1/4 w-2 bg-white" />
      <MapPin className="top-6 left-10" />
      <MapPin className="bottom-8 left-1/3" />
      <MapPin className="top-1/2 right-10" />
      <span className="absolute bottom-6 right-1/3 flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-white ring-4 ring-primary/30">
        5
      </span>
      <div className="absolute top-4 right-4 w-44 rounded-xl bg-[#3C0F7D] p-3 text-white shadow-lg">
        <p className="font-bold leading-tight">Hôpital A</p>
        <p className="text-xs opacity-90">1,2 km</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="underline">Téléphone</span>
          <span className="rounded-full bg-[#EF4444] px-2 py-1 font-bold">Itinéraire</span>
        </div>
      </div>
    </div>
  );
}

const schemas: Record<TutorialVisualKind, () => ReactNode> = {
  call114: Call114Schema,
  filter: FilterSchema,
  attendance: AttendanceSchema,
  map: MapSchema,
};

interface TutorialVisualProps {
  kind: TutorialVisualKind;
  description: string;
  image?: TutorialImage;
}

export default function TutorialVisual({ kind, description, image }: TutorialVisualProps) {
  const Schema = schemas[kind];
  return (
    <figure className="flex flex-col gap-3">
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="w-full max-w-2xl h-auto rounded-lg border-2 border-black"
        />
      ) : (
        <div
          className="relative flex justify-center rounded-lg bg-slate-100 p-4 pt-10 select-none"
          aria-hidden="true"
        >
          <ExampleBadge />
          <Schema />
        </div>
      )}
      <figcaption className="text-sm md:text-base text-black">
        {!image && <span className="font-bold">Schéma simplifié, valeurs d&apos;exemple. </span>}
        {description}
      </figcaption>
    </figure>
  );
}
