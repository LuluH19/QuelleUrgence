import type { HospitalWithMock, Professionnal } from "@/types/api";

/** Poids des critères dans le score de recommandation (somme = 100) */
export const WEIGHTS = {
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
  if (selectedSpecializations.length === 0) return 100; // pas de filtre = neutre max
  if (!professionnal) return 0; // spécialités demandées mais données inconnues
  let match = 0;
  for (const key of selectedSpecializations) {
    if (professionnal[key as keyof Professionnal]) match++;
  }
  if (match === 0) return 0;
  return Math.round((match / selectedSpecializations.length) * 100);
}

/**
 * Score accessibilité : tag OSM wheelchair (yes / limited / no).
 */
function accessibilityScore(wheelchair: string | undefined): number {
  if (wheelchair === "yes") return 100;
  if (wheelchair === "limited") return 65;
  if (wheelchair === "no") return 30;
  return 50; // neutre si pas de donnée
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
  const a = accessibilityScore(hospital.fields.wheelchair);

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

  // À score égal, le plus proche passe devant (distance inconnue en dernier).
  withScore.sort(
    (a, b) =>
      b.score - a.score ||
      (a.hospital.fields.dist ?? Infinity) - (b.hospital.fields.dist ?? Infinity)
  );
  const sorted = withScore.map((x) => x.hospital);
  const recommendedRecordId = sorted[0]?.recordid ?? null;

  return { sorted, recommendedRecordId };
}

/** Libellés en français des spécialités médicales (clés de Professionnal). */
export const SPECIALIZATION_LABELS: Record<keyof Professionnal, string> = {
  internist: "Médecine interne",
  pmr: "Médecine physique et réadaptation",
  rheumatologist: "Rhumatologie",
  cardiologist: "Cardiologie",
  pulmonologist: "Pneumologie",
  nephrologist: "Néphrologie",
  gasteroenterologist: "Gastro-entérologie",
  endocrinologist: "Endocrinologie",
  dermatologist: "Dermatologie",
  ent: "ORL",
  gynecologist: "Gynécologie",
  urologist: "Urologie",
  orthopedist: "Orthopédie",
  psychologist: "Psychologie",
  neurosurgeon: "Neurochirurgie",
  pediatric_surgeon: "Chirurgie pédiatrique",
  orthopedic_surgeon: "Chirurgie orthopédique",
};

/** Distance en km au format français (virgule décimale), ex. "1,2". */
export function formatKm(distMeters: number): string {
  return (distMeters / 1000).toFixed(1).replace(".", ",");
}

export interface RecommendationReasonsInput {
  hospital: HospitalWithMock;
  selectedSpecializations: string[];
  /** Ensemble des sites comparés (pour savoir si c'est le plus proche) */
  candidates?: HospitalWithMock[];
  trafficLevel?: number | null;
}

/**
 * Explique en phrases courtes et simples pourquoi un site est recommandé,
 * un motif par critère (distance, spécialités, accessibilité, affluence).
 * Destiné à être affiché tel quel et lu par les lecteurs d'écran.
 */
export function getRecommendationReasons({
  hospital,
  selectedSpecializations,
  candidates = [],
  trafficLevel,
}: RecommendationReasonsInput): string[] {
  const reasons: string[] = [];

  const dist = hospital.fields.dist;
  if (dist != null) {
    const isClosest = candidates.every(
      (c) => c.fields.dist == null || c.fields.dist >= dist
    );
    reasons.push(
      isClosest && candidates.length > 1
        ? `C'est le plus proche : ${formatKm(dist)} km.`
        : `Il est à ${formatKm(dist)} km.`
    );
  } else {
    reasons.push("Distance inconnue.");
  }

  if (selectedSpecializations.length > 0) {
    const professionnal = hospital.mockData?.professionnal;
    const matched = selectedSpecializations.filter(
      (key) => professionnal?.[key as keyof Professionnal]
    );
    const labels = matched
      .map((key) => SPECIALIZATION_LABELS[key as keyof Professionnal] ?? key)
      .join(", ");
    if (matched.length === selectedSpecializations.length) {
      reasons.push(
        matched.length === 1
          ? `Il a la spécialité choisie : ${labels}.`
          : `Il a toutes les spécialités choisies : ${labels}.`
      );
    } else if (matched.length > 0) {
      reasons.push(
        `Il a ${matched.length} des ${selectedSpecializations.length} spécialités choisies : ${labels}.`
      );
    } else {
      reasons.push("Il n'a aucune des spécialités choisies.");
    }
  }

  switch (hospital.fields.wheelchair) {
    case "yes":
      reasons.push("Il est accessible en fauteuil roulant.");
      break;
    case "limited":
      reasons.push("Il est en partie accessible en fauteuil roulant.");
      break;
    case "no":
      reasons.push("Il n'est pas accessible en fauteuil roulant.");
      break;
    default:
      reasons.push("Accès en fauteuil roulant : information non disponible.");
  }

  if (trafficLevel != null) {
    const level =
      trafficLevel < 34 ? "faible" : trafficLevel < 67 ? "moyenne" : "forte";
    reasons.push(`L'affluence y est ${level}.`);
  }

  return reasons;
}
