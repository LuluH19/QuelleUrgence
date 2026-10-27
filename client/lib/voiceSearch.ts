import { useEffect } from 'react'

/** Paramètre d'URL lu par la liste des hôpitaux : /hopitaux?q=necker */
export const SEARCH_QUERY_PARAM = 'q'

/** Événement émis quand une recherche vocale vise la page déjà affichée. */
export const VOICE_SEARCH_EVENT = 'quelleurgence:voice-search'

export type VoiceSearchDetail = { query: string }

export function buildSearchUrl(query: string): string {
  return `/hopitaux?${SEARCH_QUERY_PARAM}=${encodeURIComponent(query)}`
}

export function dispatchVoiceSearch(query: string): void {
  window.dispatchEvent(new CustomEvent<VoiceSearchDetail>(VOICE_SEARCH_EVENT, { detail: { query } }))
}

/**
 * Remplit une recherche à partir du paramètre `?q=` au montage, puis à chaque
 * recherche vocale émise sur la page courante. `onQuery` doit être stable
 * (un setter de useState par exemple).
 */
export function useSearchQueryFromVoice(onQuery: (query: string) => void): void {
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get(SEARCH_QUERY_PARAM)
    if (initial) onQuery(initial)

    const handler = (event: Event) => {
      const query = (event as CustomEvent<VoiceSearchDetail>).detail?.query
      if (typeof query === 'string') onQuery(query)
    }
    window.addEventListener(VOICE_SEARCH_EVENT, handler)
    return () => window.removeEventListener(VOICE_SEARCH_EVENT, handler)
  }, [onQuery])
}
