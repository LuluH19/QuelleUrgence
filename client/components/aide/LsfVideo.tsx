import type { LsfVideoConfig } from '@/data/tutorials';

interface LsfVideoProps {
  title: string;
  config: LsfVideoConfig;
  /** Transcription par défaut (étapes écrites) si la config n'en fournit pas. */
  fallbackTranscript: string[];
}

/**
 * Lecteur de la vidéo en langue des signes française (LSF).
 * Tant que `config.videoSrc` est vide, un message « Vidéo LSF bientôt disponible » est affiché.
 */
export default function LsfVideo({ title, config, fallbackTranscript }: LsfVideoProps) {
  const transcript = config.transcript ?? fallbackTranscript;

  if (!config.videoSrc) {
    return (
      <div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-primary bg-slate-50 p-4">
        <svg
          className="w-12 h-12 flex-shrink-0 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <rect x="2" y="5" width="15" height="14" rx="2" />
          <path strokeLinejoin="round" d="M17 10l5-3v10l-5-3z" />
        </svg>
        <div className="text-black">
          <p className="font-bold text-base md:text-lg">Vidéo LSF bientôt disponible</p>
          <p className="text-sm md:text-base">
            En attendant, vous pouvez lire le texte ou l&apos;écouter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <video
        className="w-full max-w-2xl rounded-lg bg-black"
        controls
        preload="metadata"
        poster={config.poster || undefined}
        aria-label={`Vidéo en langue des signes française : ${title}`}
      >
        <source src={config.videoSrc} />
        {/* Sans fichier .vtt, la piste reste vide : la transcription ci-dessous prend le relais. */}
        <track kind="captions" src={config.captionsSrc || undefined} srcLang="fr" label="Français" default />
        Votre navigateur ne peut pas lire cette vidéo. Lisez la transcription ci-dessous.
      </video>
      <details className="rounded-lg border-2 border-primary bg-white">
        <summary className="cursor-pointer px-4 py-2 font-bold text-primary rounded-lg focus:outline-none focus:ring-4 focus:ring-red-600">
          Transcription de la vidéo
        </summary>
        <ol className="list-decimal pl-10 pr-4 pb-4 pt-2 space-y-1 text-black">
          {transcript.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
