'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  isCognitiveModeActive,
  setCognitiveMode,
  subscribeCognitiveMode,
} from '@/lib/cognitiveMode';

/** État du mode "urgence cognitive" (false côté serveur et pendant l'hydratation). */
export function useCognitiveMode(): [boolean, (active: boolean) => void] {
  const active = useSyncExternalStore(
    subscribeCognitiveMode,
    isCognitiveModeActive,
    () => false
  );
  const set = useCallback((value: boolean) => setCognitiveMode(value), []);
  return [active, set];
}
