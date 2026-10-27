'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  clearHistory,
  formatViewedAt,
  getHistorySnapshot,
  getServerHistorySnapshot,
  subscribeToHistory,
  toTelHref,
} from '@/lib/history';

interface RecentHospitalsProps {
  className?: string;
}

/**
 * Affiche les dernières urgences consultées (stockées localement).
 * Rien n'est rendu côté serveur ni tant que l'historique est vide.
 */
function RecentHospitals({ className = '' }: RecentHospitalsProps) {
  const entries = useSyncExternalStore(subscribeToHistory, getHistorySnapshot, getServerHistorySnapshot);
  const [cleared, setCleared] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const headingId = useId();

  useEffect(() => {
    // Après effacement, le focus est déplacé sur le message de confirmation
    if (cleared) statusRef.current?.focus();
  }, [cleared]);

  if (entries.length === 0 && !cleared) return null;

  const handleClear = () => {
    clearHistory();
    setCleared(true);
  };

  return (
    <section
      className={`p-4 bg-white rounded-lg shadow border-2 border-primary text-black ${className}`}
      aria-labelledby={headingId}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 id={headingId} className="text-lg md:text-xl font-bold text-primary">
          Dernières urgences consultées
        </h2>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors focus:outline-none focus:ring-4 focus:ring-red-600"
            aria-label="Effacer l'historique des urgences consultées"
          >
            Effacer l&apos;historique
          </button>
        )}
      </div>

      {entries.length > 0 ? (
        <>
          <p className="text-sm text-slate-700 mb-3">
            Historique enregistré uniquement sur cet appareil.
          </p>
          <ul className="space-y-3">
            {entries.map((entry) => {
              const viewedAtLabel = formatViewedAt(entry.viewedAt);
              return (
                <li
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-200 pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/hopitaux/${encodeURIComponent(entry.id)}`}
                      className="font-bold text-primary underline break-words focus:outline-none focus:ring-4 focus:ring-red-600 rounded"
                    >
                      {entry.name}
                    </Link>
                    {viewedAtLabel && (
                      <p className="text-sm text-slate-700">
                        Consulté le <time dateTime={entry.viewedAt}>{viewedAtLabel}</time>
                      </p>
                    )}
                  </div>
                  {entry.phone && (
                    <a
                      href={toTelHref(entry.phone)}
                      className="flex-shrink-0 w-fit px-4 py-2 rounded-full bg-primary text-white font-bold text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-4 focus:ring-red-600"
                      aria-label={`Appeler le ${entry.phone} (${entry.name})`}
                    >
                      Appeler le {entry.phone}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p ref={statusRef} role="status" tabIndex={-1} className="text-sm text-slate-700 focus:outline-none focus:ring-4 focus:ring-red-600 rounded">
          Votre historique des urgences consultées a été effacé.
        </p>
      )}
    </section>
  );
}

export default RecentHospitals;
