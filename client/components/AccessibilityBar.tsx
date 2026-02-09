'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'urgences-text-scale';
const MIN = 0.9;
const MAX = 1.5;
const STEP = 0.15;

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

export default function AccessibilityBar() {
  const [scale, setScale] = useState(() => getStoredScale());

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(scale));
    try {
      localStorage.setItem(STORAGE_KEY, String(scale));
    } catch {
      // ignore
    }
  }, [scale]);

  const increase = () => setScale((s) => Math.min(MAX, s + STEP));
  const decrease = () => setScale((s) => Math.max(MIN, s - STEP));

  return (
    <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Taille du texte">
      <button
        type="button"
        onClick={decrease}
        disabled={scale <= MIN}
        className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg border-2 border-primary bg-white text-primary font-bold hover:bg-primary hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Réduire la taille du texte"
      >
        A−
      </button>
      <span className="text-sm font-medium text-black" aria-live="polite">
        Taille du texte
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={scale >= MAX}
        className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg border-2 border-primary bg-white text-primary font-bold hover:bg-primary hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Agrandir la taille du texte"
      >
        A+
      </button>
    </div>
  );
}
