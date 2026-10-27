'use client';

import { useId, useState, type ReactNode } from 'react';

interface CognitiveListLimiterProps {
  /** Nombre total d'éléments de la liste enveloppée. */
  count: number;
  children: ReactNode;
}

/**
 * En mode simple : n'affiche que le premier élément de la liste (l'hôpital
 * recommandé) et propose un bouton pour voir les autres. Sans effet hors mode.
 * Le masquage est fait en CSS (app/cognitive-mode.scss), donc sans flash.
 */
export default function CognitiveListLimiter({ count, children }: CognitiveListLimiterProps) {
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const others = count - 1;

  return (
    <div>
      {count > 0 && (
        <h2 data-cognitive="only" className="text-2xl font-bold text-black mb-4">
          L&apos;hôpital conseillé pour vous
        </h2>
      )}
      <div id={listId} data-cognitive-list={showAll ? 'expanded' : 'collapsed'}>
        {children}
      </div>
      {others > 0 && (
        <div data-cognitive="only" className="mt-6">
          <button
            type="button"
            aria-expanded={showAll}
            aria-controls={listId}
            onClick={() => setShowAll((v) => !v)}
            className="w-full min-h-[56px] flex items-center justify-between gap-3 px-5 py-3 rounded-xl border-2 border-primary bg-white text-primary text-lg font-bold focus:outline-none focus:ring-4 focus:ring-red-600"
          >
            <span>
              Voir les autres hôpitaux ({others})
            </span>
            <span aria-hidden="true" className="text-2xl leading-none">{showAll ? '−' : '+'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
