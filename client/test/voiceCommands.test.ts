import { normalizeTranscript, parseVoiceAlternatives, parseVoiceCommand } from '../lib/voiceCommands'
import { buildSearchUrl } from '../lib/voiceSearch'

describe('normalizeTranscript', () => {
  it('passe en minuscules, retire accents et ponctuation', () => {
    expect(normalizeTranscript("  Aller à l'Accueil ! ")).toBe('aller a l accueil')
    expect(normalizeTranscript('Liste des HÔPITAUX')).toBe('liste des hopitaux')
  })

  it('regroupe les chiffres épelés du 114', () => {
    expect(normalizeTranscript('appeler le 1 1 4')).toBe('appeler le 114')
    expect(normalizeTranscript('appeler le cent quatorze')).toBe('appeler le 114')
  })
})

describe('parseVoiceCommand : navigation', () => {
  it.each([
    ['Aller à l’accueil', '/'],
    ["va à la page d'accueil", '/'],
    ['ACCUEIL', '/'],
    ['retour à l’accueil', '/'],
    ['aller à la carte', '/map'],
    ['Ouvre la carte s’il te plaît', '/map'],
    ['carte', '/map'],
    ['liste des hôpitaux', '/hopitaux'],
    ['afficher les hopitaux', '/hopitaux'],
    ['je veux voir la liste', '/hopitaux'],
    ["aller à l'aide", '/aide'],
    ["ouvre la page d'aide", '/aide'],
    ['mentions légales', '/mentions-legales'],
  ])('« %s » ouvre %s', (phrase, route) => {
    expect(parseVoiceCommand(phrase)).toMatchObject({ type: 'navigate', route })
  })
})

describe('parseVoiceCommand : recherche', () => {
  it.each([
    ['rechercher Necker', 'necker'],
    ['Recherche hôpital Bichat', 'bichat'],
    ["cherche l'hôpital de la Pitié-Salpêtrière", 'pitié-salpêtrière'],
    ['trouve-moi Lariboisière', 'lariboisière'],
    ['je veux rechercher Saint-Antoine s’il vous plaît', 'saint-antoine'],
    ['rechercher la carte', 'carte'],
  ])('« %s » recherche « %s »', (phrase, query) => {
    expect(parseVoiceCommand(phrase)).toEqual({ type: 'search', query })
  })

  it('une recherche sans nom est non reconnue', () => {
    expect(parseVoiceCommand('rechercher hôpital')).toEqual({ type: 'unknown' })
  })
})

describe('parseVoiceCommand : retour, aide, appel', () => {
  it.each(['retour', 'Revenir en arrière', 'page précédente', 'reviens'])('« %s » revient en arrière', (phrase) => {
    expect(parseVoiceCommand(phrase)).toEqual({ type: 'back' })
  })

  it.each(['aide', 'Quelles commandes ?', 'quelles sont les commandes', 'que puis-je dire', 'peux-tu m’aider'])(
    '« %s » liste les commandes',
    (phrase) => {
      expect(parseVoiceCommand(phrase)).toEqual({ type: 'help' })
    },
  )

  it.each(['appeler le 114', 'Appelle le 1 1 4', 'appeler le cent quatorze', '114', 'appeler les urgences'])(
    '« %s » demande la confirmation d’appel',
    (phrase) => {
      expect(parseVoiceCommand(phrase)).toEqual({ type: 'call114' })
    },
  )
})

describe('parseVoiceCommand : non reconnu', () => {
  it.each(['', '   ', 'bonjour', 'quelle heure est-il'])('« %s » est non reconnu', (phrase) => {
    expect(parseVoiceCommand(phrase)).toEqual({ type: 'unknown' })
  })
})

describe('parseVoiceAlternatives', () => {
  it('retient la première alternative reconnue', () => {
    expect(parseVoiceAlternatives(['à la quarte', 'à la carte'])).toEqual({
      transcript: 'à la carte',
      command: { type: 'navigate', route: '/map', label: 'la carte' },
    })
  })

  it('renvoie la première transcription si rien n’est reconnu', () => {
    expect(parseVoiceAlternatives(['bonjour', 'bonsoir'])).toEqual({
      transcript: 'bonjour',
      command: { type: 'unknown' },
    })
    expect(parseVoiceAlternatives([])).toEqual({ transcript: '', command: { type: 'unknown' } })
  })
})

describe('buildSearchUrl', () => {
  it('encode la requête dans le paramètre q', () => {
    expect(buildSearchUrl('pitié salpêtrière')).toBe('/hopitaux?q=piti%C3%A9%20salp%C3%AAtri%C3%A8re')
  })
})
