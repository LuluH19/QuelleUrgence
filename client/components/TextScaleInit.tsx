'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'urgences-text-scale';
const MIN = 0.9;
const MAX = 1.5;

function getStoredScale(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v != null) {
      const n = parseFloat(v);
      if (n >= MIN && n <= MAX) return n;
    }
  } catch {
    // ignore
  }
  return 1;
}

/** Applique la taille de texte sauvegardée au chargement (pour toutes les pages). */
export default function TextScaleInit() {
  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(getStoredScale()));
  }, []);
  return null;
}
