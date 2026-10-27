/**
 * Mode "urgence cognitive" (US13) : interface simplifiée pour les personnes
 * neuroatypiques (recommandations FALC et WCAG COGA).
 *
 * L'état est persisté en localStorage et appliqué via un attribut sur <html>.
 * Les styles associés sont dans app/cognitive-mode.scss :
 * - [data-cognitive="hide"] : masqué quand le mode est actif ;
 * - [data-cognitive="only"] : affiché uniquement quand le mode est actif ;
 * - [data-cognitive-collapse] : contenu replié quand le mode est actif.
 */

export const COGNITIVE_MODE_STORAGE_KEY = 'urgences-cognitive-mode';
export const COGNITIVE_MODE_ATTRIBUTE = 'data-cognitive-mode';
const COGNITIVE_MODE_EVENT = 'urgences:cognitive-mode-change';

/**
 * Script exécuté dans <head> avant le premier rendu : applique le mode
 * sauvegardé sans flash au chargement de la page.
 */
export const cognitiveModeInitScript = `(function(){try{if(localStorage.getItem('${COGNITIVE_MODE_STORAGE_KEY}')==='on'){document.documentElement.setAttribute('${COGNITIVE_MODE_ATTRIBUTE}','on');}}catch(e){}})();`;

export function isCognitiveModeActive(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute(COGNITIVE_MODE_ATTRIBUTE) === 'on';
}

export function setCognitiveMode(active: boolean): void {
  if (typeof document === 'undefined') return;
  if (active) {
    document.documentElement.setAttribute(COGNITIVE_MODE_ATTRIBUTE, 'on');
  } else {
    document.documentElement.removeAttribute(COGNITIVE_MODE_ATTRIBUTE);
  }
  try {
    if (active) {
      localStorage.setItem(COGNITIVE_MODE_STORAGE_KEY, 'on');
    } else {
      localStorage.removeItem(COGNITIVE_MODE_STORAGE_KEY);
    }
  } catch {
    // stockage indisponible (navigation privée) : le mode reste actif pour la page
  }
  window.dispatchEvent(new Event(COGNITIVE_MODE_EVENT));
}

/** Abonnement aux changements (même onglet et autres onglets). */
export function subscribeCognitiveMode(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== COGNITIVE_MODE_STORAGE_KEY) return;
    if (e.newValue === 'on') {
      document.documentElement.setAttribute(COGNITIVE_MODE_ATTRIBUTE, 'on');
    } else {
      document.documentElement.removeAttribute(COGNITIVE_MODE_ATTRIBUTE);
    }
    callback();
  };
  window.addEventListener(COGNITIVE_MODE_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(COGNITIVE_MODE_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}
