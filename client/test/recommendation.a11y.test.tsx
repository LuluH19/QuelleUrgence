import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import HospitalList from '../components/hopitaux/HospitalList'
import RecommendationCriteria from '../components/hopitaux/RecommendationCriteria'
import AccessibilityBar from '../components/AccessibilityBar'
import type { HospitalWithMock } from '../types/api'

/**
 * Audit automatisé (axe-core) des composants de recommandation.
 * Le contraste n'est pas testable dans jsdom (pas de rendu CSS) : il est
 * désactivé ici et doit être vérifié dans le navigateur.
 */
async function axeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  })
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)
}

const hospitals: HospitalWithMock[] = [
  { recordid: 'h1', fields: { name: 'Hôpital Proche', dist: 1200, phone: '0102030405', wheelchair: 'yes' } },
  { recordid: 'h2', fields: { name: 'Hôpital Loin', dist: 8000 } },
]

describe('Recommandation : accessibilité', () => {
  it('liste avec site recommandé sans violation axe', async () => {
    const { container } = render(
      <main>
        <HospitalList
          hospitals={hospitals}
          recommendedRecordId="h1"
          recommendationReasons={["C'est le plus proche : 1,2 km.", 'Il est accessible en fauteuil roulant.']}
        />
      </main>
    )
    expect(await axeViolations(container)).toEqual([])
  })

  it('le site recommandé est signalé par du texte, pas seulement par la couleur', () => {
    render(
      <HospitalList
        hospitals={hospitals}
        recommendedRecordId="h1"
        recommendationReasons={["C'est le plus proche : 1,2 km."]}
      />
    )
    expect(screen.getByText('Recommandé')).toBeVisible()
    expect(screen.getByText('Pourquoi ce site est recommandé :')).toBeInTheDocument()
    // Nom accessible commençant par le texte visible (commande vocale) + description des motifs
    const link = screen.getByRole('link', { name: /^Hôpital Proche, site recommandé/ })
    expect(link).toHaveAccessibleDescription(/le plus proche/)
    expect(screen.getAllByText('Recommandé')).toHaveLength(1)
  })

  it('section des critères sans violation axe et repliable au clavier', async () => {
    const { container } = render(
      <main>
        <RecommendationCriteria>
          <AccessibilityBar />
        </RecommendationCriteria>
      </main>
    )
    expect(await axeViolations(container)).toEqual([])
    expect(screen.getByRole('heading', { name: "Critères d'affichage" })).toBeInTheDocument()
    expect(container.querySelector('details > summary')).toHaveTextContent('Pourquoi ce classement ?')
    expect(screen.getByRole('button', { name: 'Agrandir la taille du texte' })).toBeInTheDocument()
  })
})
