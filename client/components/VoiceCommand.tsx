'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaTimes } from 'react-icons/fa'
import { parseVoiceAlternatives, VOICE_COMMANDS_HELP, type VoiceCommand as Command } from '@/lib/voiceCommands'
import { buildSearchUrl, dispatchVoiceSearch } from '@/lib/voiceSearch'

/*
 * Types minimaux de l'API Web Speech : lib.dom (TypeScript 5.9) ne déclare que
 * SpeechRecognitionResult / Alternative / ResultList, pas SpeechRecognition.
 */
interface RecognitionResultEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface RecognitionErrorEvent extends Event {
  readonly error: string
}

interface Recognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: Recognition, ev: Event) => void) | null
  onresult: ((this: Recognition, ev: RecognitionResultEvent) => void) | null
  onerror: ((this: Recognition, ev: RecognitionErrorEvent) => void) | null
  onend: ((this: Recognition, ev: Event) => void) | null
}

type RecognitionConstructor = new () => Recognition

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor
    webkitSpeechRecognition?: RecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const noopSubscribe = () => () => {}

type Feedback = { tone: 'success' | 'error' | 'info'; text: string }

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':
    'Accès au micro refusé. Autorisez le micro pour ce site dans les réglages du navigateur, puis réessayez.',
  'service-not-allowed':
    'La reconnaissance vocale est bloquée par le navigateur. Vérifiez les autorisations du site.',
  'no-speech': 'Aucune parole détectée. Appuyez à nouveau sur le bouton et parlez après le signal.',
  'audio-capture': 'Aucun micro détecté. Vérifiez qu’un micro est branché et activé.',
  network: 'Erreur réseau : la reconnaissance vocale de ce navigateur nécessite une connexion internet.',
  'language-not-supported': 'Le français n’est pas pris en charge par la reconnaissance vocale de ce navigateur.',
}

export default function VoiceCommand() {
  const router = useRouter()
  const pathname = usePathname()
  const baseId = useId()
  const panelId = `${baseId}-panel`
  const unsupportedId = `${baseId}-unsupported`

  // null pendant le rendu serveur, puis true/false côté client (pas d'écart d'hydratation).
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionConstructor() !== null,
    () => null,
  )

  const recognitionRef = useRef<Recognition | null>(null)
  const handledRef = useRef(false)
  const confirmLinkRef = useRef<HTMLAnchorElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [listening, setListening] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [confirmCall, setConfirmCall] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const report = useCallback((next: Feedback, spoken?: string) => {
    setFeedback(next)
    setAnnouncement(spoken ?? next.text)
  }, [])

  useEffect(() => {
    if (confirmCall) confirmLinkRef.current?.focus()
  }, [confirmCall])

  useEffect(() => {
    return () => recognitionRef.current?.abort()
  }, [])

  const execute = useCallback(
    (command: Command, heard: string) => {
      setShowHelp(false)
      setConfirmCall(false)
      const prefix = `Compris : « ${heard} ».`

      switch (command.type) {
        case 'navigate':
          if (pathname === command.route) {
            report({ tone: 'info', text: `Vous êtes déjà sur ${command.label}.` }, `${prefix} Vous êtes déjà sur ${command.label}.`)
          } else {
            report({ tone: 'success', text: `Ouverture de ${command.label}.` }, `${prefix} Ouverture de ${command.label}.`)
            router.push(command.route)
          }
          break
        case 'search':
          report(
            { tone: 'success', text: `Recherche de « ${command.query} » dans la liste des hôpitaux.` },
            `${prefix} Recherche de ${command.query} dans la liste des hôpitaux.`,
          )
          if (pathname === '/hopitaux') dispatchVoiceSearch(command.query)
          else router.push(buildSearchUrl(command.query))
          break
        case 'back':
          report({ tone: 'success', text: 'Retour à la page précédente.' }, `${prefix} Retour à la page précédente.`)
          if (window.history.length > 1) router.back()
          else router.push('/')
          break
        case 'help':
          setShowHelp(true)
          report(
            { tone: 'info', text: 'Voici les commandes disponibles.' },
            `${prefix} Liste des commandes affichée : ${VOICE_COMMANDS_HELP.map((c) => c.example).join(', ')}.`,
          )
          break
        case 'call114':
          // Jamais d'appel automatique : l'utilisateur doit confirmer.
          setConfirmCall(true)
          report(
            { tone: 'info', text: 'Confirmez l’appel au 114 avec le lien ci-dessous, ou annulez.' },
            `${prefix} Confirmez l'appel au 114 : le lien d'appel a le focus. Appuyez sur Entrée pour appeler, ou Échap pour annuler.`,
          )
          break
        default:
          report(
            { tone: 'error', text: 'Commande non reconnue. Dites « quelles commandes » pour la liste.' },
            `${prefix} Commande non reconnue. Dites quelles commandes pour obtenir la liste.`,
          )
      }
    },
    [pathname, report, router],
  )

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const startListening = useCallback(() => {
    const Ctor = getRecognitionConstructor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 3
    handledRef.current = false

    recognition.onstart = () => {
      setListening(true)
      report({ tone: 'info', text: 'Écoute en cours… Parlez maintenant.' }, 'Écoute en cours. Parlez maintenant.')
    }
    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex]
      if (!result || !result.isFinal) return
      const alternatives: string[] = []
      for (let i = 0; i < result.length; i++) alternatives.push(result[i].transcript)
      const { transcript: heard, command } = parseVoiceAlternatives(alternatives)
      handledRef.current = true
      setTranscript(heard)
      execute(command, heard)
    }
    recognition.onerror = (event) => {
      if (event.error === 'aborted') return
      handledRef.current = true
      report({
        tone: 'error',
        text: ERROR_MESSAGES[event.error] ?? 'La reconnaissance vocale a rencontré une erreur. Réessayez.',
      })
    }
    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
      if (!handledRef.current) {
        report({ tone: 'info', text: 'Écoute arrêtée. Aucune commande reçue.' })
      }
    }

    recognitionRef.current = recognition
    setPanelOpen(true)
    setTranscript(null)
    setShowHelp(false)
    setConfirmCall(false)
    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      report({ tone: 'error', text: 'Impossible de démarrer l’écoute. Réessayez dans un instant.' })
    }
  }, [execute, report])

  const closePanel = useCallback(() => {
    recognitionRef.current?.abort()
    setPanelOpen(false)
    setConfirmCall(false)
    setShowHelp(false)
    buttonRef.current?.focus()
  }, [])

  const handleToggle = () => {
    if (supported === false) {
      setPanelOpen((open) => !open)
      return
    }
    if (listening) stopListening()
    else startListening()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape') return
    if (listening) {
      recognitionRef.current?.abort()
      report({ tone: 'info', text: 'Écoute annulée.' })
    } else if (panelOpen) {
      closePanel()
    }
  }

  // Rendu serveur : rien, pour éviter un bouton inutilisable avant hydratation.
  if (supported === null) return null

  const toneClass =
    feedback?.tone === 'error'
      ? 'border-red-700 text-red-800'
      : feedback?.tone === 'success'
        ? 'border-green-700 text-green-800'
        : 'border-black text-black'

  return (
    <div
      className="fixed right-4 bottom-[6.5rem] md:bottom-6 md:right-6 z-[9998] flex flex-col items-end gap-2"
      onKeyDown={handleKeyDown}
    >
      {/* Région annoncée par les lecteurs d'écran (toujours présente dans le DOM). */}
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>

      {panelOpen && (
        <section
          id={panelId}
          aria-label="Commandes vocales"
          className="w-[calc(100vw-2rem)] max-w-sm rounded-xl border-2 border-black bg-white p-4 text-black shadow-lg"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="text-base font-bold">
              Commandes vocales{' '}
              <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-bold uppercase text-white">bêta</span>
            </h2>
            <button
              type="button"
              onClick={closePanel}
              className="rounded p-1 focus:outline-none focus:ring-4 focus:ring-red-600"
            >
              <FaTimes aria-hidden="true" />
              <span className="sr-only">Fermer le panneau des commandes vocales</span>
            </button>
          </div>

          {supported === false ? (
            <p id={unsupportedId} className="text-sm">
              Votre navigateur ne prend pas en charge la reconnaissance vocale (c’est le cas de Firefox).
              Utilisez Chrome, Edge ou Safari, ou naviguez avec le clavier et les liens du menu.
            </p>
          ) : (
            <>
              {listening && (
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
                  <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-red-600" aria-hidden="true" />
                  Écoute en cours…
                </p>
              )}
              {transcript && (
                <p className="mb-2 text-sm">
                  <span className="font-bold">Compris :</span> « {transcript} »
                </p>
              )}
              {feedback && !listening && (
                <p className={`mb-2 border-l-4 pl-2 text-sm font-semibold ${toneClass}`}>{feedback.text}</p>
              )}

              {confirmCall && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    ref={confirmLinkRef}
                    href="tel:114"
                    className="rounded-full bg-black px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-red-600"
                  >
                    Oui, appeler le 114
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmCall(false)
                      report({ tone: 'info', text: 'Appel annulé.' })
                      buttonRef.current?.focus()
                    }}
                    className="rounded-full border-2 border-black px-4 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-red-600"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {showHelp && (
                <div className="mt-2">
                  <h3 className="mb-1 text-sm font-bold">Exemples de commandes</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {VOICE_COMMANDS_HELP.map((item) => (
                      <li key={item.example}>
                        <span className="font-semibold">« {item.example} »</span> : {item.description}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm">
                    Plus d’informations sur la{' '}
                    <Link href="/aide" className="font-semibold underline focus:outline-none focus:ring-4 focus:ring-red-600">
                      page d’aide
                    </Link>
                    .
                  </p>
                </div>
              )}

              {!transcript && !listening && !feedback && (
                <p className="text-sm">Appuyez sur le micro puis dites par exemple « aller à la carte ».</p>
              )}
            </>
          )}
        </section>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-pressed={listening}
        aria-disabled={supported === false ? true : undefined}
        aria-describedby={supported === false && panelOpen ? unsupportedId : undefined}
        aria-controls={panelOpen ? panelId : undefined}
        title={
          supported === false
            ? 'Commandes vocales indisponibles sur ce navigateur'
            : listening
              ? 'Arrêter l’écoute'
              : 'Activer les commandes vocales (bêta)'
        }
        className={[
          'relative flex items-center gap-2 rounded-full border-[3px] border-black px-4 py-3 font-bold shadow-lg',
          'transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-600',
          supported === false
            ? 'cursor-not-allowed bg-gray-200 text-gray-700'
            : listening
              ? 'bg-red-700 text-white'
              : 'bg-white text-black hover:bg-primary hover:text-white',
        ].join(' ')}
      >
        {supported === false ? (
          <FaMicrophoneSlash className="h-5 w-5" aria-hidden="true" />
        ) : (
          <FaMicrophone className={`h-5 w-5 ${listening ? 'animate-pulse' : ''}`} aria-hidden="true" />
        )}
        <span className="sr-only md:not-sr-only">Commandes vocales</span>
        <span className="sr-only">{supported === false ? ' (indisponibles)' : ''}</span>
        <span className="rounded bg-primary px-1.5 py-0.5 text-xs uppercase text-white">bêta</span>
      </button>
    </div>
  )
}
