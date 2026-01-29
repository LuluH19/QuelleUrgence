import Link from "next/link";
import Image from "next/image";
import { HospitalWithMock } from "@/types/api";

function HospitalCard({ hospital }: { hospital: HospitalWithMock }) {
    const distance = hospital.fields.dist ? (hospital.fields.dist / 1000).toFixed(1) : null;
  
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
}

export default HospitalCard;