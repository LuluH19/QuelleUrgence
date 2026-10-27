import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import RecentHospitals from '../components/RecentHospitals'
import {
  HISTORY_MAX_ENTRIES,
  HISTORY_STORAGE_KEY,
  addToHistory,
  clearHistory,
  formatViewedAt,
  getHistory,
  parseHistory,
  toTelHref,
} from '../lib/history'

jest.mock('next/link', () => {
  const Link = ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  )
  return { __esModule: true, default: Link }
})

beforeEach(() => {
  localStorage.clear()
  jest.restoreAllMocks()
})

describe('lib/history', () => {
  it('ajoute une consultation, dédoublonne et place la plus récente en premier', () => {
    addToHistory({ id: 'a', name: 'Hôpital A' }, new Date('2026-10-01T10:00:00Z'))
    addToHistory({ id: 'b', name: 'Hôpital B', phone: '01 23 45 67 89' }, new Date('2026-10-02T10:00:00Z'))
    addToHistory({ id: 'a', name: 'Hôpital A' }, new Date('2026-10-03T10:00:00Z'))

    const history = getHistory()
    expect(history.map((e) => e.id)).toEqual(['a', 'b'])
    expect(history[0].viewedAt).toBe('2026-10-03T10:00:00.000Z')
    expect(history[1].phone).toBe('01 23 45 67 89')
  })

  it(`limite l'historique à ${HISTORY_MAX_ENTRIES} entrées`, () => {
    for (let i = 0; i < HISTORY_MAX_ENTRIES + 3; i++) {
      addToHistory({ id: `h${i}`, name: `Hôpital ${i}` }, new Date(2026, 0, i + 1))
    }
    const history = getHistory()
    expect(history).toHaveLength(HISTORY_MAX_ENTRIES)
    expect(history[0].id).toBe(`h${HISTORY_MAX_ENTRIES + 2}`)
  })

  it('ignore les données corrompues', () => {
    expect(parseHistory('pas du json')).toEqual([])
    expect(parseHistory('{"id":"a"}')).toEqual([])
    expect(
      parseHistory(
        JSON.stringify([
          { id: 'ok', name: 'Valide', viewedAt: '2026-10-01T10:00:00Z' },
          { id: '', name: 'Sans id', viewedAt: '2026-10-01T10:00:00Z' },
          { id: 'x', name: 'Date invalide', viewedAt: 'hier' },
          { id: 'y', name: 42, viewedAt: '2026-10-01T10:00:00Z' },
          null,
        ])
      ).map((e) => e.id)
    ).toEqual(['ok'])

    localStorage.setItem(HISTORY_STORAGE_KEY, '{corrompu')
    addToHistory({ id: 'a', name: 'Hôpital A' })
    expect(getHistory().map((e) => e.id)).toEqual(['a'])
  })

  it('ne plante pas si le localStorage est indisponible', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => addToHistory({ id: 'a', name: 'Hôpital A' })).not.toThrow()
    expect(getHistory()).toEqual([])
    expect(() => clearHistory()).not.toThrow()
  })

  it('formate la date en français et nettoie les numéros de téléphone', () => {
    expect(formatViewedAt('2026-10-28T12:00:00Z')).toMatch(/octobre 2026/)
    expect(formatViewedAt('invalide')).toBe('')
    expect(toTelHref('01 23.45-67 89')).toBe('tel:0123456789')
  })
})

describe('RecentHospitals', () => {
  it("n'affiche rien quand l'historique est vide", () => {
    const { container } = render(<RecentHospitals />)
    expect(container).toBeEmptyDOMElement()
  })

  it("affiche la liste avec lien, appel direct et efface l'historique", () => {
    addToHistory({ id: 'rec1', name: 'Hôpital Lariboisière', phone: '01 49 95 65 65' })
    addToHistory({ id: 'rec2', name: 'Hôpital Necker' })
    render(<RecentHospitals />)

    const region = screen.getByRole('region', { name: 'Dernières urgences consultées' })
    const items = within(region).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByRole('link', { name: 'Hôpital Necker' })).toHaveAttribute('href', '/hopitaux/rec2')
    expect(within(items[0]).queryByRole('link', { name: /Appeler/ })).not.toBeInTheDocument()

    const call = within(items[1]).getByRole('link', { name: /Appeler le 01 49 95 65 65/ })
    expect(call).toHaveAttribute('href', 'tel:0149956565')
    expect(call).toHaveAccessibleName('Appeler le 01 49 95 65 65 (Hôpital Lariboisière)')
    expect(items[1].querySelector('time')).toHaveTextContent(/\d{4}/)

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: "Effacer l'historique des urgences consultées" }))
    })

    expect(getHistory()).toEqual([])
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/a été effacé/)
    expect(status).toHaveFocus()
  })

  it("se met à jour quand une consultation est enregistrée", () => {
    render(<RecentHospitals />)
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    act(() => {
      addToHistory({ id: 'rec3', name: 'Hôpital Cochin' })
    })
    expect(screen.getByRole('link', { name: 'Hôpital Cochin' })).toBeInTheDocument()
  })
})
