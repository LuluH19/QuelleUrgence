import HospitalCard from "@/components/hopitaux/HospitalCard";
import { HospitalWithMock } from "@/types/api";
import NotFoundData from "@/components/NotFoundData";

interface HospitalListProps {
  hospitals: HospitalWithMock[];
  recommendedRecordId?: string | null;
  /** Motifs affichés sur la carte du site recommandé */
  recommendationReasons?: string[];
}

function HospitalList({ hospitals, recommendedRecordId = null, recommendationReasons = [] }: HospitalListProps) {
    if (hospitals.length === 0) {
        return (
          <NotFoundData message="Aucun hôpital trouvé à proximité." />
        );
    }

    return (
        <div className="space-y-3" role="list" aria-label="Liste des hôpitaux avec services d'urgence, triée par recommandation">
            {hospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.recordid}
                  hospital={hospital}
                  isRecommended={hospital.recordid === recommendedRecordId}
                  recommendationReasons={hospital.recordid === recommendedRecordId ? recommendationReasons : undefined}
                />
            ))}
        </div>
    );
}

export default HospitalList;