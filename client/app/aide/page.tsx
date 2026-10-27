import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import AccessibilityBar from '@/components/AccessibilityBar';
import AudioReader from '@/components/aide/AudioReader';
import LsfVideo from '@/components/aide/LsfVideo';
import TutorialVisual from '@/components/aide/TutorialVisual';
import { tutorials, upcomingTutorials, type Tutorial } from '@/data/tutorials';

export const metadata: Metadata = {
  title: 'Aide et tutoriels',
  description:
    "Tutoriels accessibles pour utiliser Quelles Urgences : contacter le 114, filtrer les hôpitaux, consulter l'affluence. En texte, en audio, en images et en langue des signes.",
};

const focusRing = 'focus:outline-none focus:ring-4 focus:ring-red-600';
const h2Class = 'text-lg md:text-xl lg:text-2xl font-bold text-left w-full';
const h3Class = 'text-base md:text-lg lg:text-xl font-bold text-primary';

/** Texte lu par la synthèse vocale : reprend exactement le texte écrit. */
function buildAudioText(tutorial: Tutorial): string {
  const steps = tutorial.steps.map((step, i) => `Étape ${i + 1}. ${step}`);
  const notes = tutorial.notes?.length ? ['À savoir.', ...tutorial.notes] : [];
  return [`${tutorial.title}.`, tutorial.intro, ...steps, ...notes].join(' ');
}

const needs = [
  {
    title: 'Vous êtes sourd ou malentendant',
    tips: [
      'Utilisez le 114 : il marche par SMS.',
      'Chaque tutoriel aura une vidéo en langue des signes (LSF).',
      'Tous les tutoriels sont écrits.',
    ],
  },
  {
    title: 'Vous êtes aveugle ou malvoyant',
    tips: [
      'Le site marche avec les lecteurs d’écran.',
      'Appuyez sur « Écouter le tutoriel » pour entendre chaque tutoriel.',
      'Vous pouvez agrandir le texte avec les boutons « A+ » et « A− » plus bas sur cette page.',
      'Au début de chaque page, le lien « Aller au contenu principal » permet de passer le menu.',
    ],
  },
  {
    title: 'Vous avez du mal à utiliser vos mains',
    tips: [
      'Vous pouvez utiliser le site avec le clavier.',
      'La touche Tab passe à l’élément suivant. Maj + Tab revient en arrière.',
      'La touche Entrée ouvre un lien ou appuie sur un bouton. La touche Espace coche une case.',
      'L’élément actif est entouré en rouge.',
    ],
  },
  {
    title: 'Vous avez du mal à lire ou à comprendre',
    tips: [
      'Les tutoriels sont écrits avec des phrases courtes.',
      'Faites une étape à la fois.',
      'Vous pouvez écouter le texte au lieu de le lire.',
      'Les schémas montrent où se trouvent les boutons.',
    ],
  },
  {
    title: 'Vous êtes en fauteuil roulant',
    tips: [
      'Dans la liste des hôpitaux, le filtre « Spécifications » propose « Accessible en fauteuil roulant ».',
      'La fiche de chaque hôpital indique son accessibilité, quand elle est connue.',
    ],
  },
];

function BackToSummary() {
  return (
    <a
      href="#sommaire"
      className={`inline-flex w-fit items-center gap-2 rounded px-2 py-1 font-bold text-primary underline ${focusRing}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      Retour au sommaire
    </a>
  );
}

function TutorialSection({ tutorial }: { tutorial: Tutorial }) {
  const headingId = `${tutorial.id}-titre`;
  return (
    <section
      id={tutorial.id}
      aria-labelledby={headingId}
      className="scroll-mt-4 flex flex-col gap-5 rounded-xl border-2 border-primary bg-white p-4 md:p-6 shadow-md"
    >
      <h2 id={headingId} className={`${h2Class} text-primary`}>
        {tutorial.title}
      </h2>
      <p className="text-base md:text-lg text-black">{tutorial.intro}</p>

      <div className="flex flex-col gap-3">
        <h3 className={h3Class}>En texte</h3>
        <ol className="list-decimal pl-8 space-y-2 text-base md:text-lg text-black leading-relaxed marker:font-bold marker:text-primary">
          {tutorial.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {tutorial.notes && tutorial.notes.length > 0 && (
          <div className="rounded-lg border-l-4 border-primary bg-slate-100 p-4 text-black">
            <p className="font-bold">À savoir</p>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-base">
              {tutorial.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
        {tutorial.link && (
          <Link
            href={tutorial.link.href}
            className={`w-fit rounded-2xl bg-primary px-4 py-2 font-bold text-white hover:opacity-90 transition-opacity ${focusRing}`}
          >
            {tutorial.link.label}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className={h3Class}>En audio</h3>
        <AudioReader text={buildAudioText(tutorial)} title={tutorial.title} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className={h3Class}>En images</h3>
        <TutorialVisual kind={tutorial.visual} description={tutorial.visualDescription} image={tutorial.image} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className={h3Class}>En langue des signes (LSF)</h3>
        <LsfVideo title={tutorial.title} config={tutorial.lsf} fallbackTranscript={tutorial.steps} />
      </div>

      <BackToSummary />
    </section>
  );
}

export default function AidePage() {
  const summary = [
    { id: 'comment-utiliser', title: 'Comment utiliser cette aide' },
    ...tutorials.map((t) => ({ id: t.id, title: t.title })),
    { id: 'selon-vos-besoins', title: 'Aide selon vos besoins' },
    { id: 'reglages-affichage', title: 'Agrandir le texte' },
    { id: 'bientot-disponible', title: 'Tutoriels bientôt disponibles' },
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50" tabIndex={-1}>
        <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto pb-8 flex flex-col gap-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">Aide et tutoriels</h1>

          <nav id="sommaire" aria-labelledby="sommaire-titre" className="scroll-mt-4 rounded-xl bg-white p-4 md:p-6 shadow-md">
            <h2 id="sommaire-titre" className={h2Class}>
              Sommaire
            </h2>
            <ol className="mt-3 list-decimal pl-8 space-y-2 text-base md:text-lg">
              {summary.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={`rounded px-1 font-bold text-primary underline ${focusRing}`}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section id="comment-utiliser" aria-labelledby="comment-utiliser-titre" className="scroll-mt-4 flex flex-col gap-3">
            <h2 id="comment-utiliser-titre" className={h2Class}>
              Comment utiliser cette aide
            </h2>
            <p className="text-base md:text-lg text-black">Chaque tutoriel explique une action, étape par étape.</p>
            <p className="text-base md:text-lg text-black">Chaque tutoriel existe en 4 versions :</p>
            <ul className="list-disc pl-8 space-y-1 text-base md:text-lg text-black">
              <li>
                <strong>En texte</strong> : des étapes courtes et numérotées.
              </li>
              <li>
                <strong>En audio</strong> : le bouton « Écouter le tutoriel » lit le texte à voix haute.
              </li>
              <li>
                <strong>En images</strong> : un schéma montre où se trouvent les boutons.
              </li>
              <li>
                <strong>En langue des signes (LSF)</strong> : une vidéo en langue des signes française.
              </li>
            </ul>
          </section>

          {tutorials.map((tutorial) => (
            <TutorialSection key={tutorial.id} tutorial={tutorial} />
          ))}

          <section id="selon-vos-besoins" aria-labelledby="selon-vos-besoins-titre" className="scroll-mt-4 flex flex-col gap-4">
            <h2 id="selon-vos-besoins-titre" className={h2Class}>
              Aide selon vos besoins
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {needs.map((need) => (
                <div key={need.title} className="rounded-lg bg-white p-4 shadow-md text-black">
                  <h3 className={h3Class}>{need.title}</h3>
                  <ul className="mt-2 list-disc pl-6 space-y-1 text-base">
                    {need.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <BackToSummary />
          </section>

          <section id="reglages-affichage" aria-labelledby="reglages-affichage-titre" className="scroll-mt-4 flex flex-col gap-3">
            <h2 id="reglages-affichage-titre" className={h2Class}>
              Agrandir le texte
            </h2>
            <p className="text-base md:text-lg text-black">
              Appuyez sur « A+ » pour agrandir le texte. Appuyez sur « A− » pour le réduire. Votre choix est gardé
              sur cet appareil.
            </p>
            <AccessibilityBar />
            <BackToSummary />
          </section>

          <section id="bientot-disponible" aria-labelledby="bientot-disponible-titre" className="scroll-mt-4 flex flex-col gap-3">
            <h2 id="bientot-disponible-titre" className={h2Class}>
              Tutoriels bientôt disponibles
            </h2>
            {/* [À COMPLÉTER] : tutoriels des fonctionnalités en cours de développement (voir data/tutorials.ts). */}
            <ul className="list-disc pl-8 space-y-1 text-base md:text-lg text-black">
              {upcomingTutorials.map((item) => (
                <li key={item.id}>
                  {item.title} : tutoriel en préparation.
                </li>
              ))}
            </ul>
            <BackToSummary />
          </section>
        </div>
      </main>
    </>
  );
}
