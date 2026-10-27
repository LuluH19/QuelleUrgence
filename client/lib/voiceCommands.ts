/**
 * Analyse des commandes vocales (US12, bêta).
 *
 * Fonctions pures, sans dépendance au navigateur : elles transforment la
 * transcription renvoyée par le moteur de reconnaissance vocale en une
 * commande structurée que le composant VoiceCommand exécute ensuite.
 */

export type VoiceRoute = '/' | '/map' | '/hopitaux' | '/aide' | '/mentions-legales'

export type VoiceCommand =
  | { type: 'navigate'; route: VoiceRoute; label: string }
  | { type: 'search'; query: string }
  | { type: 'back' }
  | { type: 'help' }
  | { type: 'call114' }
  | { type: 'unknown' }

export interface VoiceCommandHelpItem {
  /** Exemple de phrase à prononcer. */
  example: string
  /** Effet de la commande. */
  description: string
}

/** Liste affichée par la commande "aide" / "quelles commandes". */
export const VOICE_COMMANDS_HELP: VoiceCommandHelpItem[] = [
  { example: 'Aller à l’accueil', description: 'Ouvre la page d’accueil.' },
  { example: 'Aller à la carte', description: 'Ouvre la carte des urgences.' },
  { example: 'Liste des hôpitaux', description: 'Ouvre la liste des hôpitaux.' },
  { example: 'Rechercher Necker', description: 'Recherche un hôpital par son nom dans la liste.' },
  { example: 'Aller à l’aide', description: 'Ouvre la page d’aide.' },
  { example: 'Retour', description: 'Revient à la page précédente.' },
  { example: 'Appeler le 114', description: 'Propose d’appeler le 114, avec confirmation.' },
  { example: 'Quelles commandes', description: 'Affiche cette liste.' },
]

/**
 * Normalise une transcription : minuscules, sans accents, apostrophes et
 * ponctuation remplacées par des espaces, chiffres épelés regroupés
 * ("1 1 4" devient "114", "cent quatorze" devient "114").
 */
export function normalizeTranscript(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bcent quatorze\b/g, '114')
    .replace(/\bun un quatre\b/g, '114')
    .replace(/(\d) (?=\d)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

const POLITE_PREFIX =
  /^(?:(?:ok|bon|alors|euh|s il te plait|s il vous plait|stp|svp|je veux|je voudrais|j aimerais|peux tu|pouvez vous|tu peux|vous pouvez|merci de)\s+)+/
const POLITE_SUFFIX = /(?:\s+(?:s il te plait|s il vous plait|stp|svp|merci))+$/

function stripPoliteness(text: string): string {
  return text.replace(POLITE_PREFIX, '').replace(POLITE_SUFFIX, '').trim()
}

function hasWord(text: string, pattern: string): boolean {
  return new RegExp(`(?:^| )(?:${pattern})(?: |$)`).test(text)
}

const CALL_VERBS = 'appel|appelle|appeler|appelez|appelles|composer|compose|composez|telephoner|telephone|contacter|contacte'
const NAV_VERBS =
  'aller|va|vas|allez|allons|ouvrir|ouvre|ouvrez|afficher|affiche|affichez|montrer|montre|montrez|voir|direction|page'

/** Verbes de recherche, testés sur la transcription en minuscules (accents conservés). */
const SEARCH_PREFIX =
  /^(?:(?:ok|alors|euh|je veux|je voudrais|j['’ ]aimerais|peux[- ]tu|pouvez[- ]vous|tu peux)\s+)*(?:re)?(?:cherch(?:er|e|es|ez)|trouv(?:er|e|ez))(?:[- ]moi)?\s+(.*)$/

const SEARCH_LEADING_WORDS =
  /^(?:(?:l['’]|le |la |les |un |une |des |du |de |d['’])\s*)?(?:(?:h[oô]pital|h[oô]pitaux|clinique|centre hospitalier)\s+)?/

function extractSearchQuery(transcript: string): string | null {
  const lowered = transcript.toLowerCase().replace(/\s+/g, ' ').trim()
  const match = lowered.match(SEARCH_PREFIX)
  if (!match) return null
  const query = match[1]
    .replace(SEARCH_LEADING_WORDS, '')
    .replace(/\s+(?:s['’ ]il (?:te|vous) pla[iî]t|stp|svp|merci)$/, '')
    .replace(/[.!?,;:]+$/, '')
    .trim()
  return query
}

const NAV_TARGETS: Array<{ pattern: string; route: VoiceRoute; label: string }> = [
  { pattern: 'mentions legales|mention legale|mentions', route: '/mentions-legales', label: 'les mentions légales' },
  { pattern: 'accueil|page principale|debut', route: '/', label: 'l’accueil' },
  { pattern: 'carte|map|plan', route: '/map', label: 'la carte' },
  { pattern: 'liste|hopitaux|hopital|hopitals|urgences', route: '/hopitaux', label: 'la liste des hôpitaux' },
]

/**
 * Transforme une transcription en commande. Ne fait aucun effet de bord.
 */
export function parseVoiceCommand(transcript: string): VoiceCommand {
  const text = stripPoliteness(normalizeTranscript(transcript))
  if (!text) return { type: 'unknown' }

  // 1. Appel du 114 (jamais déclenché automatiquement par l'appelant).
  if (
    hasWord(text, '114') ||
    (hasWord(text, CALL_VERBS) && hasWord(text, 'urgence|urgences|secours|samu'))
  ) {
    return { type: 'call114' }
  }

  // 2. Recherche : la requête est extraite de la transcription d'origine
  // pour conserver les accents des noms d'hôpitaux.
  const query = extractSearchQuery(transcript)
  if (query !== null) {
    return query ? { type: 'search', query } : { type: 'unknown' }
  }

  // 3. Aide : page d'aide si un verbe de navigation est présent, sinon liste des commandes.
  if (hasWord(text, 'commande|commandes|que (?:puis|peux) je dire|qu est ce que je peux dire|help')) {
    return { type: 'help' }
  }
  if (hasWord(text, 'aide|aider')) {
    if (hasWord(text, NAV_VERBS) || hasWord(text, 'centre')) {
      return { type: 'navigate', route: '/aide', label: 'la page d’aide' }
    }
    return { type: 'help' }
  }

  // 4. Navigation vers une page.
  for (const target of NAV_TARGETS) {
    if (hasWord(text, target.pattern)) {
      return { type: 'navigate', route: target.route, label: target.label }
    }
  }

  // 5. Retour.
  if (
    hasWord(text, 'retour|retourner|retourne|revenir|reviens|revenez|precedent|precedente|arriere|back')
  ) {
    return { type: 'back' }
  }

  return { type: 'unknown' }
}

/**
 * Teste les différentes alternatives proposées par le moteur vocal et renvoie
 * la première reconnue (ou la première transcription si aucune ne l'est).
 */
export function parseVoiceAlternatives(transcripts: string[]): {
  transcript: string
  command: VoiceCommand
} {
  const candidates = transcripts.map((t) => t.trim()).filter(Boolean)
  for (const transcript of candidates) {
    const command = parseVoiceCommand(transcript)
    if (command.type !== 'unknown') return { transcript, command }
  }
  return { transcript: candidates[0] ?? '', command: { type: 'unknown' } }
}
