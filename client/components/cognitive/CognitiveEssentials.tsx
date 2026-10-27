import Link from 'next/link';

const PHONE_ICON =
  'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z';

/**
 * Actions essentielles affichées uniquement en mode simple (page d'accueil).
 * Textes courts au format FALC : une idée par phrase, verbes d'action.
 */
export default function CognitiveEssentials() {
  return (
    <section
      data-cognitive="only"
      className="w-full flex flex-col gap-5 py-2"
      aria-labelledby="cognitive-essentials-heading"
    >
      <h2 id="cognitive-essentials-heading" className="text-2xl font-bold text-black">
        Vous avez besoin d&apos;aide ?
      </h2>

      <div className="flex flex-col gap-2">
        <p className="text-lg text-black">C&apos;est grave ? Appelez les secours.</p>
        <Link
          href="tel:114"
          className="cognitive-main-action w-full min-h-[72px] flex items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-red-700 text-white text-2xl font-bold border-4 border-black focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-4"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={PHONE_ICON} />
          </svg>
          Appeler le 114
        </Link>
        <Link
          href="sms:114"
          className="w-full min-h-[56px] flex items-center justify-center px-6 py-3 rounded-2xl bg-white text-black text-lg font-bold border-2 border-black underline focus:outline-none focus:ring-4 focus:ring-red-600"
        >
          Je ne peux pas parler : envoyer un SMS au 114
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-lg text-black">Vous voulez aller aux urgences ?</p>
        <Link
          href="/hopitaux"
          className="w-full min-h-[64px] flex items-center justify-center px-6 py-4 rounded-2xl bg-primary text-white text-xl font-bold focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-4"
        >
          Voir l&apos;hôpital le plus proche
        </Link>
      </div>
    </section>
  );
}
