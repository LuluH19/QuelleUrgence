'use client';

import { useId, useState, type ReactNode } from 'react';
import { useCognitiveMode } from './useCognitiveMode';

interface CognitiveCollapseProps {
  /** Texte du bouton qui déplie le contenu (affiché seulement en mode simple). */
  label: string;
  children: ReactNode;
  /**
   * Démonte le contenu tant qu'il est replié (utile pour la carte Leaflet,
   * qui s'affiche mal si elle est initialisée dans un conteneur masqué).
   */
  unmountWhenClosed?: boolean;
  className?: string;
  /** Classes du conteneur du bouton (visible seulement en mode simple). */
  buttonWrapperClassName?: string;
  /** Classes du conteneur du contenu. */
  contentClassName?: string;
}

/**
 * Hors mode simple : affiche simplement le contenu.
 * En mode simple : contenu replié derrière un bouton (repli des éléments secondaires).
 * Le repli initial est fait en CSS pour éviter tout flash avant l'hydratation.
 */
export default function CognitiveCollapse({
  label,
  children,
  unmountWhenClosed = false,
  className,
  buttonWrapperClassName,
  contentClassName,
}: CognitiveCollapseProps) {
  const [active] = useCognitiveMode();
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const showContent = !unmountWhenClosed || !active || open;

  return (
    <div className={className} data-cognitive-collapse={open ? 'open' : 'closed'}>
      <div data-cognitive="only" className={buttonWrapperClassName}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((o) => !o)}
          className="w-full min-h-[56px] flex items-center justify-between gap-3 px-5 py-3 mb-3 rounded-xl border-2 border-primary bg-white text-primary text-lg font-bold focus:outline-none focus:ring-4 focus:ring-red-600"
        >
          <span>{label}</span>
          <span aria-hidden="true" className="text-2xl leading-none">{open ? '−' : '+'}</span>
        </button>
      </div>
      <div id={contentId} data-cognitive-collapse-content="" className={contentClassName}>
        {showContent && children}
      </div>
    </div>
  );
}
