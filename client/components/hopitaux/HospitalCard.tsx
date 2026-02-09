import Link from "next/link";
import Image from "next/image";
import { HospitalWithMock } from "@/types/api";

interface HospitalCardProps {
  hospital: HospitalWithMock;
  isRecommended?: boolean;
}

function HospitalCard({ hospital, isRecommended = false }: HospitalCardProps) {
    const distance = hospital.fields.dist ? (hospital.fields.dist / 1000).toFixed(1) : null;
    const cardLabel = isRecommended
      ? `Recommandé : ${hospital.fields.name}. Hôpital avec services d'urgence.`
      : `${hospital.fields.name}. Hôpital avec services d'urgence.`;

    return (
        <article
            className={`p-4 rounded-lg shadow-md hover:shadow-lg transition-all focus-within:ring-4 focus-within:ring-red-600 focus-within:ring-offset-2 focus-within:ring-offset-slate-100 ${
              isRecommended
                ? "bg-primary border-2 border-amber-400 ring-2 ring-amber-400/50"
                : "bg-primary"
            }`}
            role="listitem"
            aria-label={cardLabel}
        >
            {isRecommended && (
                <div className="mb-3 flex items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-bold text-black"
                    >
                        <span aria-hidden="true">★</span>
                        Recommandé
                    </span>
                    <span className="sr-only">
                        Ce site est recommandé selon la distance, le trafic, les spécialités et l&apos;accessibilité.
                    </span>
                </div>
            )}
            <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="font-bold text-white flex-1 text-lg min-w-0">
                    <Link
                        href={`/hopitaux/${hospital.recordid}`}
                        className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary rounded"
                        aria-label={`Voir les détails de ${hospital.fields.name}${isRecommended ? ", site recommandé" : ""}`}
                    >
                        {hospital.fields.name}
                    </Link>
                </h2>
                {distance && (
                    <span
                        className="flex-shrink-0 font-bold py-2 px-4 rounded-full text-black bg-white text-sm"
                        aria-label={`Distance : ${distance} kilomètres`}
                    >
                        {distance} km
                    </span>
                )}
            </div>

            {hospital.fields.phone && (
                <Link
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
                </Link>
            )}
            {!hospital.fields.phone && (
                <p className="text-white/90 text-sm italic">Aucun numéro de téléphone disponible</p>
            )}
        </article>
    );
}

export default HospitalCard;