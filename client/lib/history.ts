/**
 * Historique local des dernières urgences consultées (US14).
 *
 * Stocké uniquement dans le localStorage du navigateur : identifiant, nom,
 * téléphone public de l'établissement et date de consultation. Aucune donnée
 * personnelle n'est enregistrée ni transmise.
 */

export const HISTORY_STORAGE_KEY = 'urgences-history';
export const HISTORY_MAX_ENTRIES = 5;
const HISTORY_CHANGE_EVENT = 'urgences-history-change';

export interface HistoryEntry {
  /** recordid OpenDataSoft de l'hôpital */
  id: string;
  name: string;
  phone?: string;
  /** Date de consultation au format ISO 8601 */
  viewedAt: string;
}

const EMPTY_HISTORY: HistoryEntry[] = [];

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    // Accès refusé (navigation privée, cookies bloqués...)
    return null;
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    entry.id.trim() !== '' &&
    typeof entry.name === 'string' &&
    entry.name.trim() !== '' &&
    (entry.phone === undefined || typeof entry.phone === 'string') &&
    typeof entry.viewedAt === 'string' &&
    !Number.isNaN(Date.parse(entry.viewedAt))
  );
}

/** Analyse la valeur brute stockée ; toute donnée corrompue est ignorée. */
export function parseHistory(raw: string | null): HistoryEntry[] {
  if (!raw) return EMPTY_HISTORY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY_HISTORY;
    const seen = new Set<string>();
    const entries: HistoryEntry[] = [];
    for (const item of data) {
      if (!isHistoryEntry(item) || seen.has(item.id)) continue;
      seen.add(item.id);
      entries.push({
        id: item.id,
        name: item.name,
        ...(item.phone ? { phone: item.phone } : {}),
        viewedAt: item.viewedAt,
      });
    }
    return entries
      .sort((a, b) => Date.parse(b.viewedAt) - Date.parse(a.viewedAt))
      .slice(0, HISTORY_MAX_ENTRIES);
  } catch {
    return EMPTY_HISTORY;
  }
}

function readRaw(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(HISTORY_STORAGE_KEY);
  } catch {
    return null;
  }
}

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
  }
}

export function getHistory(): HistoryEntry[] {
  return parseHistory(readRaw());
}

/**
 * Enregistre la consultation d'un hôpital : dédoublonnage par identifiant,
 * plus récent en premier, limité à HISTORY_MAX_ENTRIES.
 */
export function addToHistory(
  hospital: { id: string; name: string; phone?: string | null },
  viewedAt: Date = new Date()
): HistoryEntry[] {
  const storage = getStorage();
  const id = hospital.id?.trim();
  const name = hospital.name?.trim();
  if (!storage || !id || !name) return getHistory();

  const entry: HistoryEntry = {
    id,
    name,
    ...(hospital.phone?.trim() ? { phone: hospital.phone.trim() } : {}),
    viewedAt: viewedAt.toISOString(),
  };
  const next = [entry, ...getHistory().filter((item) => item.id !== id)].slice(0, HISTORY_MAX_ENTRIES);

  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota dépassé ou stockage indisponible : l'historique n'est pas critique
    return getHistory();
  }
  notifyChange();
  return next;
}

export function clearHistory(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    return;
  }
  notifyChange();
}

/* ---- Intégration avec useSyncExternalStore ---- */

let cachedRaw: string | null = null;
let cachedEntries: HistoryEntry[] = EMPTY_HISTORY;

/** Renvoie une référence stable tant que la valeur stockée ne change pas. */
export function getHistorySnapshot(): HistoryEntry[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEntries = parseHistory(raw);
  }
  return cachedEntries;
}

/** Côté serveur (et pendant l'hydratation) l'historique est vide. */
export function getServerHistorySnapshot(): HistoryEntry[] {
  return EMPTY_HISTORY;
}

export function subscribeToHistory(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event: StorageEvent) => {
    // Synchronisation entre onglets
    if (event.key === null || event.key === HISTORY_STORAGE_KEY) callback();
  };
  window.addEventListener(HISTORY_CHANGE_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(HISTORY_CHANGE_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Ex. : "mardi 28 octobre 2026 à 14:05" */
export function formatViewedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return dateFormatter.format(date);
}

/** Nettoie un numéro pour un lien tel: (chiffres et + uniquement). */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
