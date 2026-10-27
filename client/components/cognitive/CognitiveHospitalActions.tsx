import Link from 'next/link';

interface CognitiveHospitalActionsProps {
  name: string;
  phone?: string;
  /** [latitude, longitude] de l'hôpital, si connues. */
  center: [number, number] | null;
}

/**
 * Actions essentielles de la fiche hôpital, affichées uniquement en mode simple :
 * une action principale (y aller), une action secondaire (appeler).
 */
export default function CognitiveHospitalActions({ name, phone, center }: CognitiveHospitalActionsProps) {
  const directionsUrl = center
    ? `https://www.google.com/maps/dir/?api=1&destination=${center[0]},${center[1]}`
    : null;

  return (
    <section
      data-cognitive="only"
      className="py-6 px-4 flex flex-col gap-4 items-stretch max-w-2xl mx-auto"
      aria-labelledby="cognitive-hospital-actions-heading"
    >
      <h2 id="cognitive-hospital-actions-heading" className="text-2xl font-bold text-black">
        Que voulez-vous faire ?
      </h2>
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cognitive-main-action w-full min-h-[72px] flex items-center justify-center px-6 py-4 rounded-2xl bg-primary text-white text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-4"
        >
          Y aller
          <span className="sr-only"> : itinéraire vers {name} (nouvelle fenêtre)</span>
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="w-full min-h-[56px] flex items-center justify-center px-6 py-3 rounded-2xl bg-white text-primary text-xl font-bold border-2 border-primary focus:outline-none focus:ring-4 focus:ring-red-600"
        >
          Appeler l&apos;hôpital
          <span className="sr-only"> {name} au {phone}</span>
        </a>
      )}
      <p className="text-lg text-black">
        C&apos;est grave ? Appelez le{' '}
        <a href="tel:114" className="font-bold underline focus:outline-none focus:ring-4 focus:ring-red-600 rounded">
          114
        </a>
        .
      </p>
    </section>
  );
}
