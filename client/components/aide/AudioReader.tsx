'use client';

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

/** Événement envoyé quand un lecteur démarre, pour que les autres se remettent à zéro. */
const SPEECH_START_EVENT = 'aide-speech-start';

type Support = 'unknown' | 'supported' | 'unsupported';

const noopSubscribe = () => () => {};
const getSupport = (): Support =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
    ? 'supported'
    : 'unsupported';
const getServerSupport = (): Support => 'unknown';

/**
 * Découpe le texte en phrases : certains navigateurs coupent la lecture
 * des textes longs, on lit donc phrase par phrase.
 */
function splitIntoChunks(text: string): string[] {
  return (text.match(/[^.!?:]+[.!?:]*/g) ?? [])
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function pickFrenchVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'fr-FR') ??
    voices.find((v) => v.lang.toLowerCase().startsWith('fr')) ??
    null
  );
}

interface AudioReaderProps {
  /** Texte lu à voix haute. */
  text: string;
  /** Nom du tutoriel, utilisé dans le nom accessible du bouton. */
  title: string;
}

export default function AudioReader({ text, title }: AudioReaderProps) {
  const support = useSyncExternalStore(noopSubscribe, getSupport, getServerSupport);
  const [speaking, setSpeaking] = useState(false);
  const readerId = useId();
  const speakingRef = useRef(false);

  const stop = useCallback(() => {
    speakingRef.current = false;
    setSpeaking(false);
    if (getSupport() === 'supported') {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Un autre lecteur démarre : celui-ci n'est plus en lecture.
  useEffect(() => {
    const onOtherStart = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== readerId) {
        speakingRef.current = false;
        setSpeaking(false);
      }
    };
    window.addEventListener(SPEECH_START_EVENT, onOtherStart);
    return () => window.removeEventListener(SPEECH_START_EVENT, onOtherStart);
  }, [readerId]);

  // Arrêter la lecture si on quitte la page.
  useEffect(() => {
    return () => {
      if (speakingRef.current && getSupport() === 'supported') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const play = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    window.dispatchEvent(new CustomEvent(SPEECH_START_EVENT, { detail: readerId }));

    const voice = pickFrenchVoice();
    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) return;

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      if (voice) utterance.voice = voice;
      if (index === chunks.length - 1) {
        utterance.onend = () => {
          speakingRef.current = false;
          setSpeaking(false);
        };
      }
      utterance.onerror = () => {
        speakingRef.current = false;
        setSpeaking(false);
      };
      synth.speak(utterance);
    });

    speakingRef.current = true;
    setSpeaking(true);
  };

  const toggle = () => {
    if (speaking) {
      stop();
    } else {
      play();
    }
  };

  if (support === 'unsupported') {
    return (
      <p className="text-sm md:text-base text-black bg-slate-100 border-l-4 border-primary p-3 rounded">
        La lecture audio n&apos;est pas disponible sur ce navigateur. Vous pouvez lire le texte
        ci-dessus ou utiliser le lecteur d&apos;écran de votre appareil.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={support === 'unknown'}
        aria-pressed={speaking}
        className={`inline-flex items-center gap-3 w-fit min-h-[44px] px-5 py-3 rounded-full font-bold border-2 border-primary transition-colors focus:outline-none focus:ring-4 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed ${
          speaking ? 'bg-white text-primary' : 'bg-primary text-white hover:bg-white hover:text-primary'
        }`}
      >
        {speaking ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        <span>
          Écouter le tutoriel
          <span className="sr-only"> : {title}</span>
        </span>
      </button>
      <p className="text-sm text-black" aria-live="polite">
        {speaking ? 'Lecture en cours. Appuyez à nouveau sur le bouton « Écouter le tutoriel » pour arrêter.' : ''}
      </p>
    </div>
  );
}
