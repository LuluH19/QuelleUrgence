import HospitalCard from "@/components/hopitaux/HospitalCard";
import { HospitalWithMock } from "@/types/api";
import NotFoundData from "@/components/NotFoundData";

function HospitalList({ hospitals }: { hospitals: HospitalWithMock[] }) {
    if (hospitals.length === 0) {
        return (
          <NotFoundData message="Aucun hôpital trouvé à proximité." />
        );
    }

    return (
        <div className="space-y-3" role="list" aria-label="Liste des hôpitaux avec services d'urgence">
            {hospitals.map(hospital => (
                <HospitalCard key={hospital.recordid} hospital={hospital} />
            ))}
        </div>
    );
}

export default HospitalList;