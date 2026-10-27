/**
 * Contenu des tutoriels de la page /aide (ticket #13, US11).
 *
 * Chaque tutoriel est disponible en 4 formats :
 * - texte simple (étapes courtes, style FALC) : `steps` ;
 * - audio : généré à partir du même texte par la synthèse vocale du navigateur ;
 * - visuel : schéma HTML/CSS (`visual`) ou capture d’écran si `image` est renseigné ;
 * - LSF : vidéo hébergée, renseignée dans `lsf`. Tant que `lsf.videoSrc` est vide,
 *   la page affiche « Vidéo LSF bientôt disponible ».
 *
 * Script à valider par le PM. Les URL des vidéos LSF et des sous-titres (.vtt)
 * sont à fournir par le DevOps : ne pas mettre d’URL tant que la vidéo n’existe pas.
 */

export type TutorialVisualKind = 'call114' | 'filter' | 'attendance' | 'map';

export interface LsfVideoConfig {
  /** URL de la vidéo LSF (mp4/webm). Vide tant que la vidéo n’est pas tournée. */
  videoSrc: string;
  /** URL du fichier de sous-titres WebVTT (français). Vide si absent. */
  captionsSrc: string;
  /** Image affichée avant la lecture (optionnelle). */
  poster?: string;
  /**
   * Transcription de la vidéo. Si absente, la transcription reprend les étapes
   * écrites du tutoriel.
   */
  transcript?: string[];
}

export interface TutorialImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Tutorial {
  /** Identifiant utilisé pour l’ancre (#id) du sommaire. */
  id: string;
  title: string;
  /** Phrase d’introduction : à quoi sert ce tutoriel. */
  intro: string;
  /** Étapes numérotées, une idée par phrase. */
  steps: string[];
  /** Informations importantes à connaître (encadré). */
  notes?: string[];
  visual: TutorialVisualKind;
  /** Description textuelle du visuel (alternative pour les lecteurs d’écran). */
  visualDescription: string;
  /** Capture d’écran réelle, à fournir. Si absente, le schéma `visual` est affiché. */
  image?: TutorialImage;
  /** Lien vers la page concernée. */
  link?: { href: string; label: string };
  lsf: LsfVideoConfig;
}

export const tutorials: Tutorial[] = [
  {
    id: 'tutoriel-114',
    title: 'Contacter le 114',
    intro:
      "Le 114 est le numéro d’urgence pour les personnes sourdes, malentendantes ou qui ont du mal à parler. Il est gratuit.",
    steps: [
      'Cherchez le bouton noir « Appeler le 114 ». Il a un dessin de téléphone.',
      "Sur téléphone, il est en bas de l’écran. C’est le premier bouton du menu.",
      "Sur ordinateur, il est en haut du menu, à gauche de l’écran.",
      'Appuyez sur le bouton.',
      'Votre téléphone ouvre son application d’appel avec le numéro 114.',
      'Lancez la communication.',
      'Expliquez ce qui se passe, où vous êtes et qui a besoin d’aide.',
    ],
    notes: [
      'Vous pouvez aussi envoyer un SMS au 114.',
      "Sur un ordinateur, le bouton peut ne pas marcher. Utilisez votre téléphone.",
      'Si vous pouvez parler et entendre, appelez le 15 (SAMU), le 17 (police), le 18 (pompiers) ou le 112.',
    ],
    visual: 'call114',
    visualDescription:
      "Schéma du bouton noir et arrondi « Appeler le 114 », avec un dessin de téléphone blanc. Il se trouve dans le menu du site.",
    lsf: { videoSrc: '', captionsSrc: '' },
  },
  {
    id: 'tutoriel-filtrer',
    title: 'Trouver et filtrer les hôpitaux',
    intro:
      'La liste des hôpitaux montre les hôpitaux avec un service d’urgence près de vous. Vous pouvez choisir ce dont vous avez besoin.',
    steps: [
      'Dans le menu, appuyez sur « Liste des hôpitaux ».',
      'Le site demande votre position. Acceptez pour voir les hôpitaux près de vous.',
      'Si vous refusez, le site montre les hôpitaux de Paris.',
      'Pour chercher un hôpital par son nom, écrivez le nom dans la barre « Rechercher un hôpital ».',
      'Appuyez sur le bouton « Spécifications ».',
      'Cochez ce dont vous avez besoin : accès pompiers, assistante sociale ou accessible en fauteuil roulant.',
      'Appuyez sur le bouton « Spécialisations médicales ».',
      'Cochez une ou plusieurs spécialités. Par exemple : Cardiologie.',
      'Sous les filtres, le site affiche le nombre d’hôpitaux trouvés.',
      'Le premier hôpital de la liste a l’étiquette « Recommandé ». C’est le site le plus adapté à vos choix.',
      'Pour enlever vos choix, ouvrez le filtre et appuyez sur « Effacer tout ».',
      'Appuyez sur le nom d’un hôpital pour voir sa fiche.',
    ],
    notes: [
      'La distance de chaque hôpital est écrite en kilomètres (km).',
      'Vous pouvez appeler un hôpital en appuyant sur son numéro de téléphone.',
    ],
    visual: 'filter',
    visualDescription:
      "Schéma de la page Liste des hôpitaux : en haut, la barre « Rechercher un hôpital ». Dessous, deux boutons : « Spécifications » et « Spécialisations médicales ». Dessous, une carte d’hôpital avec l’étiquette « Recommandé » et la distance en kilomètres.",
    link: { href: '/hopitaux', label: 'Aller à la liste des hôpitaux' },
    lsf: { videoSrc: '', captionsSrc: '' },
  },
  {
    id: 'tutoriel-affluence',
    title: "Consulter l’affluence d’un hôpital",
    intro:
      "L’affluence, c’est le nombre de personnes aux urgences et le temps d’attente. Elle vous aide à choisir un hôpital.",
    steps: [
      'Ouvrez la liste des hôpitaux.',
      'Appuyez sur le nom d’un hôpital.',
      'La fiche de l’hôpital s’ouvre.',
      'Descendez jusqu’à la partie « Affluence en temps réel ».',
      'Si on vous le demande, choisissez « Service Adultes » ou « Service Pédiatrique ». Le service pédiatrique est pour les enfants.',
      'Lisez la phrase du haut : elle donne le nombre de personnes prises en charge.',
      'Lisez les 3 cases : le temps avant de voir l’infirmier, le temps avant de voir le médecin, et le temps total passé à l’hôpital.',
      'Chaque case donne aussi le nombre de patients.',
    ],
    notes: [
      "L’affluence est disponible seulement pour les hôpitaux de l’AP-HP (Assistance Publique - Hôpitaux de Paris).",
      "Pour les autres hôpitaux, le site affiche : « Le traffic en temps réel n’est pas encore disponible pour ce site ».",
      "Les temps sont des estimations. Ils sont calculés avec les moyennes à cette heure-ci.",
    ],
    visual: 'attendance',
    visualDescription:
      "Schéma de la partie « Affluence en temps réel » : trois cases côte à côte. Case 1 : temps avant de voir l’infirmier. Case 2 : temps avant de voir le médecin. Case 3 : temps total passé à l’hôpital. Chaque case montre un temps et un nombre de patients.",
    link: { href: '/hopitaux', label: 'Choisir un hôpital dans la liste' },
    lsf: { videoSrc: '', captionsSrc: '' },
  },
  {
    id: 'tutoriel-carte',
    title: 'Utiliser la carte',
    intro: 'La carte montre où sont les hôpitaux avec un service d’urgence.',
    steps: [
      'Dans le menu, appuyez sur « Carte ».',
      'Le site demande votre position. Acceptez pour voir les hôpitaux autour de vous.',
      'Chaque repère sur la carte est un hôpital.',
      'Un rond avec un nombre regroupe plusieurs hôpitaux. Appuyez dessus pour zoomer.',
      'Appuyez sur un repère.',
      'Une fenêtre s’ouvre. Elle donne le nom de l’hôpital, la distance et le téléphone.',
      'Appuyez sur « Itinéraire » pour voir le trajet dans Google Maps.',
    ],
    notes: [
      'Depuis la fiche d’un hôpital, le bouton « Accéder à la carte » montre cet hôpital sur la carte.',
    ],
    visual: 'map',
    visualDescription:
      "Schéma de la carte : plusieurs repères d’hôpitaux et un rond avec un nombre qui regroupe des hôpitaux. Une fenêtre ouverte montre le nom d’un hôpital, sa distance, son téléphone et un bouton « Itinéraire ».",
    link: { href: '/map', label: 'Aller à la carte' },
    lsf: { videoSrc: '', captionsSrc: '' },
  },
];

/**
 * Fonctionnalités en cours de développement par d’autres équipes.
 * [À COMPLÉTER] : rédiger le tutoriel (texte, audio, visuel, LSF) quand la
 * fonctionnalité est livrée, puis la déplacer dans `tutorials`.
 */
export const upcomingTutorials: { id: string; title: string }[] = [
  { id: 'aide-commandes-vocales', title: 'Commandes vocales (bêta)' },
  { id: 'aide-urgence-cognitive', title: 'Mode « urgence cognitive »' },
  { id: 'aide-historique', title: 'Historique des hôpitaux consultés' },
];
