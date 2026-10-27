import type { ReactNode } from "react";
import { WEIGHTS } from "@/lib/recommendation";

interface RecommendationCriteriaProps {
  /** Contenu additionnel toujours visible (ex. réglage de la taille du texte) */
  children?: ReactNode;
}

/**
 * Explique en langage simple comment la liste est triée et comment
 * repérer le site recommandé. Le détail est repliable (<details>) :
 * accessible au clavier et annoncé « réduit / développé » par les lecteurs d'écran.
 */
export default function RecommendationCriteria({ children }: RecommendationCriteriaProps) {
  return (
    <section
      className="mb-6 p-4 bg-white rounded-xl border-2 border-primary text-left"
      aria-labelledby="criteres-affichage"
    >
      <h2 id="criteres-affichage" className="text-base font-bold text-primary mb-2">
        Critères d&apos;affichage
      </h2>
      <p className="text-sm text-black leading-relaxed">
        Le site <strong>recommandé</strong> est le premier de la liste. Il porte l&apos;étiquette
        {" "}<strong>« Recommandé »</strong> avec une étoile, et la raison du choix est écrite sous son nom.
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer w-fit min-h-[44px] flex items-center gap-2 rounded px-2 -ml-2 font-bold text-primary underline focus:outline-none focus-visible:ring-4 focus-visible:ring-red-600">
          Pourquoi ce classement ?
        </summary>
        <div className="mt-2 text-sm text-black leading-relaxed">
          <p>Chaque hôpital reçoit une note sur 100 calculée avec 4 critères :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong>Distance</strong> ({WEIGHTS.distance} %) : plus l&apos;hôpital est proche de vous, mieux il est classé.
            </li>
            <li>
              <strong>Spécialités médicales</strong> ({WEIGHTS.specialty} %) : l&apos;hôpital a les spécialités
              choisies dans le filtre « Spécialisations médicales ».
            </li>
            <li>
              <strong>Accessibilité</strong> ({WEIGHTS.accessibility} %) : accès en fauteuil roulant
              (oui, en partie ou non), selon OpenStreetMap.
            </li>
            <li>
              <strong>Affluence</strong> ({WEIGHTS.traffic} %) : le nombre de personnes aux urgences.
              Cette information est visible sur la fiche de chaque hôpital de l&apos;AP-HP.
              Dans cette liste, elle ne change pas le classement.
            </li>
          </ul>
          <p className="mt-2">
            À note égale, le plus proche passe en premier. Ce classement est une aide :
            en cas d&apos;urgence vitale, appelez le 15 ou le 112. Personnes sourdes ou
            malentendantes : envoyez un SMS au 114.
          </p>
        </div>
      </details>

      {children && <div className="mt-4 pt-4 border-t border-primary/30">{children}</div>}
    </section>
  );
}
