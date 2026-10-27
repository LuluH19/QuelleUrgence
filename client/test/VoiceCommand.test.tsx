import { act, fireEvent, render, screen } from '@testing-library/react'
import VoiceCommand from '../components/VoiceCommand'

const push = jest.fn()
const back = jest.fn()
let mockPathname = '/'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, back }),
  usePathname: () => mockPathname,
}))

type Handler = ((ev: unknown) => void) | null

class FakeRecognition {
  static last: FakeRecognition | null = null
  lang = ''
  continuous = false
  interimResults = false
  maxAlternatives = 1
  onstart: Handler = null
  onresult: Handler = null
  onerror: Handler = null
  onend: Handler = null
  constructor() {
    FakeRecognition.last = this
  }
  start() {
    this.onstart?.({})
  }
  stop() {
    this.onend?.({})
  }
  abort() {
    this.onerror?.({ error: 'aborted' })
    this.onend?.({})
  }
  say(...alternatives: string[]) {
    const result = Object.assign(
      alternatives.map((transcript) => ({ transcript, confidence: 0.9 })),
      { isFinal: true },
    )
    this.onresult?.({ resultIndex: 0, results: [result] })
    this.onend?.({})
  }
  fail(error: string) {
    this.onerror?.({ error })
    this.onend?.({})
  }
}

const win = window as unknown as { webkitSpeechRecognition?: unknown }

function startListening() {
  fireEvent.click(screen.getByRole('button', { name: /^commandes vocales/i }))
  return FakeRecognition.last!
}

describe('VoiceCommand', () => {
  beforeEach(() => {
    push.mockClear()
    back.mockClear()
    mockPathname = '/'
    FakeRecognition.last = null
  })

  afterEach(() => {
    delete win.webkitSpeechRecognition
  })

  it('est désactivé avec une explication si le navigateur ne gère pas la reconnaissance', () => {
    render(<VoiceCommand />)
    const button = screen.getByRole('button', { name: /^commandes vocales/i })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(button)
    expect(screen.getByText(/ne prend pas en charge la reconnaissance vocale/i)).toBeInTheDocument()
  })

  describe('avec moteur vocal', () => {
    beforeEach(() => {
      win.webkitSpeechRecognition = FakeRecognition
    })

    it('indique l’écoute avec aria-pressed et la région live', () => {
      render(<VoiceCommand />)
      const recognition = startListening()
      expect(recognition.lang).toBe('fr-FR')
      expect(screen.getByRole('button', { name: /^commandes vocales/i })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('status')).toHaveTextContent(/écoute en cours/i)
    })

    it('navigue vers la carte et affiche ce qui a été compris', () => {
      render(<VoiceCommand />)
      const recognition = startListening()
      act(() => recognition.say('aller à la carte'))
      expect(push).toHaveBeenCalledWith('/map')
      expect(screen.getByRole('region', { name: /commandes vocales/i })).toHaveTextContent('Compris : « aller à la carte »')
      expect(screen.getByRole('button', { name: /^commandes vocales/i })).toHaveAttribute('aria-pressed', 'false')
    })

    it('ne lance jamais l’appel au 114 et demande une confirmation', () => {
      render(<VoiceCommand />)
      const recognition = startListening()
      act(() => recognition.say('appeler le 114'))
      const link = screen.getByRole('link', { name: /oui, appeler le 114/i })
      expect(link).toHaveAttribute('href', 'tel:114')
      expect(link).toHaveFocus()
      expect(push).not.toHaveBeenCalled()
    })

    it('redirige la recherche vers la liste avec ?q=', () => {
      render(<VoiceCommand />)
      const recognition = startListening()
      act(() => recognition.say('rechercher Necker'))
      expect(push).toHaveBeenCalledWith('/hopitaux?q=necker')
    })

    it('émet un événement si la liste est déjà affichée', () => {
      mockPathname = '/hopitaux'
      const listener = jest.fn()
      window.addEventListener('quelleurgence:voice-search', listener)
      render(<VoiceCommand />)
      const recognition = startListening()
      act(() => recognition.say('rechercher Bichat'))
      expect(push).not.toHaveBeenCalled()
      expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ query: 'bichat' })
      window.removeEventListener('quelleurgence:voice-search', listener)
    })

    it('signale une commande non reconnue', () => {
      render(<VoiceCommand />)
      const recognition = startListening()
      act(() => recognition.say('bonjour'))
      expect(screen.getByRole('status')).toHaveTextContent(/commande non reconnue/i)
    })

    it('liste les commandes sur « quelles commandes »', () => {
      render(<VoiceCommand />)
      const recognition = startListening()
      act(() => recognition.say('quelles commandes'))
      expect(screen.getByRole('heading', { name: /exemples de commandes/i })).toBeInTheDocument()
    })

    it('explique le refus du micro', () => {
      render(<VoiceCommand />)
      const recognition = startListening()
      act(() => recognition.fail('not-allowed'))
      expect(screen.getByRole('status')).toHaveTextContent(/accès au micro refusé/i)
    })
  })
})
