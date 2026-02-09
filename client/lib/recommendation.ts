import type { HospitalWithMock, AccessibilityOptions, Professionnal } from "@/types/api";

/** Poids des critères dans le score de recommandation (somme = 100) */
const WEIGHTS = {
  distance: 35,
  traffic: 20,
  specialty: 25,
  accessibility: 20,
} as const;

/**
 * Score de distance : plus proche = meilleur.
 * dist en mètres. 0–5 km => 100, 5–15 => dégradé, >15 => faible.
 */
function distanceScore(distMeters: number | undefined): number {
  if (distMeters == null) return 50; // neutre si pas de distance
  const km = distMeters / 1000;
  if (km <= 2) return 100;
  if (km <= 5) return 100 - (km - 2) * 15;
  if (km <= 15) return 55 - (km - 5) * 3;
  return Math.max(0, 55 - (km - 5) * 3);
}

/**
 * Score trafic : moins d’affluence = meilleur.
 * trafficLevel 0–100 (0 = vide, 100 = saturé). En liste on n’a pas le trafic, donc neutre.
 */
function trafficScore(trafficLevel: number | null | undefined): number {
  if (trafficLevel == null) return 70; // neutre quand pas de donnée
  return Math.round(100 - trafficLevel);
}

/**
 * Score spécialité : nombre de spécialités sélectionnées présentes.
 */
function specialtyScore(
  professionnal: Professionnal | undefined,
  selectedSpecializations: string[]
): number {
  if (!professionnal || selectedSpecializations.length === 0) return 100; // pas de filtre = neutre max
  let match = 0;
  for (const key of selectedSpecializations) {
    if (professionnal[key as keyof Professionnal]) match++;
  }
  if (match === 0) return 0;
  return Math.round((match / selectedSpecializations.length) * 100);
}

/**
 * Score accessibilité : nombre d’options d’accessibilité (entrée, parking, toilettes, sièges).
 */
function accessibilityScore(opts: AccessibilityOptions | undefined): number {
  if (!opts) return 50;
  const count = [
    opts.wheelchairAccessibleEntrance,
    opts.wheelchairAccessibleParking,
    opts.wheelchairAccessibleRestroom,
    opts.wheelchairAccessibleSeating,
  ].filter(Boolean).length;
  return count === 0 ? 30 : 30 + count * 17.5; // 30, 47.5, 65, 82.5, 100
}

export interface RecommendationInput {
  hospital: HospitalWithMock;
  selectedSpecializations: string[];
  /** Niveau d’affluence 0–100 si disponible (sinon non utilisé) */
  trafficLevel?: number | null;
}

/**
 * Calcule un score de recommandation entre 0 et 100 à partir de :
 * distance, trafic, spécialité, accessibilité.
 */
export function getRecommendationScore({
  hospital,
  selectedSpecializations,
  trafficLevel,
}: RecommendationInput): number {
  const d = distanceScore(hospital.fields.dist);
  const t = trafficScore(trafficLevel);
  const s = specialtyScore(hospital.mockData?.professionnal, selectedSpecializations);
  const a = accessibilityScore(hospital.accessibilityOptions);

  return Math.round(
    (d * WEIGHTS.distance +
      t * WEIGHTS.traffic +
      s * WEIGHTS.specialty +
      a * WEIGHTS.accessibility) /
      100
  );
}

/**
 * Trie les hôpitaux par score de recommandation (meilleur en premier)
 * et retourne la liste triée + l’id du premier (recommandé).
 */
export function sortByRecommendation(
  hospitals: HospitalWithMock[],
  selectedSpecializations: string[],
  trafficByRecordId?: Map<string, number> | null
): { sorted: HospitalWithMock[]; recommendedRecordId: string | null } {
  if (hospitals.length === 0) return { sorted: [], recommendedRecordId: null };

  const withScore = hospitals.map((h) => ({
    hospital: h,
    score: getRecommendationScore({
      hospital: h,
      selectedSpecializations,
      trafficLevel: trafficByRecordId?.get(h.recordid) ?? null,
    }),
  }));

  withScore.sort((a, b) => b.score - a.score);
  const sorted = withScore.map((x) => x.hospital);
  const recommendedRecordId = sorted[0]?.recordid ?? null;

  return { sorted, recommendedRecordId };
}
