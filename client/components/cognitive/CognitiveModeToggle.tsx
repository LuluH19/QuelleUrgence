'use client';

import { useCognitiveMode } from './useCognitiveMode';

interface CognitiveModeToggleProps {
  /** "nav" : entrée du menu principal ; "banner" : encart sur la page d'accueil. */
  variant?: 'nav' | 'banner';
}

function SimpleModeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" strokeLinejoin="round" />
      <path strokeLinecap="round" d="M7 12h10" />
    </svg>
  );
}

/**
 * Bouton bascule du mode "urgence cognitive" (interface simplifiée).
 * Le nom accessible reste fixe ("Mode simple"), l'état est porté par aria-pressed.
 */
export default function CognitiveModeToggle({ variant = 'nav' }: CognitiveModeToggleProps) {
  const [active, setActive] = useCognitiveMode();

  if (variant === 'banner') {
    return (
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border-2 border-primary bg-white">
        <p className="text-base font-bold text-black">
          {active ? 'Le mode simple est activé.' : 'Besoin d’une page plus simple ?'}
        </p>
        <button
          type="button"
          aria-pressed={active}
          onClick={() => setActive(!active)}
          className={`min-h-[48px] inline-flex items-center gap-3 px-5 py-3 rounded-full border-2 border-primary font-bold focus:outline-none focus:ring-4 focus:ring-red-600 ${
            active ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-primary hover:text-white'
          }`}
        >
          <SimpleModeIcon className="w-6 h-6" />
          <span>Mode simple</span>
          <span aria-hidden="true" className="text-sm font-normal">
            {active ? '(activé)' : '(désactivé)'}
          </span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => setActive(!active)}
      title="Mode simple : interface simplifiée pour les situations d'urgence"
      className={`flex flex-row items-center justify-center md:justify-start gap-2 md:gap-4 px-4 py-3 rounded-full w-fit md:w-auto md:mx-4 focus:outline-none focus:ring-4 focus:ring-red-600 ${
        active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-black hover:text-white'
      }`}
    >
      <SimpleModeIcon className="w-10 h-10" />
      <span className="sr-only md:not-sr-only text-base font-bold">Mode simple</span>
    </button>
  );
}
