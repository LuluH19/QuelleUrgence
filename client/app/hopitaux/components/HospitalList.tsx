import HospitalCard from "./HospitalCard";
import { HospitalWithMock } from "@/types/api";

function HospitalList({ hospitals }: { hospitals: HospitalWithMock[] }) {
    if (hospitals.length === 0) {
        return (
          <div className="p-8 text-center bg-white rounded-lg shadow" role="status">
            <p className="text-slate-600 text-lg">Aucun hôpital trouvé à proximité.</p>
          </div>
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