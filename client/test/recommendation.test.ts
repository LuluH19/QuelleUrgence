import {
  WEIGHTS,
  formatKm,
  getRecommendationReasons,
  getRecommendationScore,
  sortByRecommendation,
} from '../lib/recommendation'
import type { HospitalWithMock, Professionnal } from '../types/api'

const noSpecialty: Professionnal = {
  internist: false, pmr: false, rheumatologist: false, cardiologist: false,
  pulmonologist: false, nephrologist: false, gasteroenterologist: false,
  endocrinologist: false, dermatologist: false, ent: false, gynecologist: false,
  urologist: false, orthopedist: false, psychologist: false, neurosurgeon: false,
  pediatric_surgeon: false, orthopedic_surgeon: false,
}

function hospital(
  id: string,
  dist: number | undefined,
  wheelchair?: string,
  specialties: Partial<Professionnal> = {}
): HospitalWithMock {
  return {
    recordid: id,
    fields: { name: `Hôpital ${id}`, dist, wheelchair },
    mockData: {
      name: `Hôpital ${id}`,
      place_id: id,
      fire_fighter: false,
      social_worker: false,
      professionnal: { ...noSpecialty, ...specialties },
    },
  }
}

describe('recommendation', () => {
  it('weights sum to 100', () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBe(100)
  })

  it('scores a close, accessible hospital with the chosen specialty higher', () => {
    const good = getRecommendationScore({
      hospital: hospital('a', 1000, 'yes', { cardiologist: true }),
      selectedSpecializations: ['cardiologist'],
    })
    const bad = getRecommendationScore({
      hospital: hospital('b', 20000, 'no'),
      selectedSpecializations: ['cardiologist'],
    })
    expect(good).toBeGreaterThan(bad)
    expect(good).toBeLessThanOrEqual(100)
    expect(bad).toBeGreaterThanOrEqual(0)
  })

  it('uses wheelchair accessibility to decide between equally distant sites', () => {
    const { sorted, recommendedRecordId } = sortByRecommendation(
      [hospital('no', 3000, 'no'), hospital('yes', 3000, 'yes'), hospital('limited', 3000, 'limited')],
      []
    )
    expect(sorted.map((h) => h.recordid)).toEqual(['yes', 'limited', 'no'])
    expect(recommendedRecordId).toBe('yes')
  })

  it('takes traffic into account when it is provided', () => {
    const traffic = new Map([['busy', 100], ['calm', 0]])
    const { recommendedRecordId } = sortByRecommendation(
      [hospital('busy', 2000, 'yes'), hospital('calm', 2000, 'yes')],
      [],
      traffic
    )
    expect(recommendedRecordId).toBe('calm')
  })

  it('breaks ties by distance and puts unknown distance last', () => {
    const { sorted } = sortByRecommendation(
      [hospital('unknown', undefined, 'yes'), hospital('far', 1900, 'yes'), hospital('near', 500, 'yes')],
      []
    )
    // near et far ont le même score (distance <= 2 km = 100) : le plus proche passe devant
    expect(sorted.map((h) => h.recordid)).toEqual(['near', 'far', 'unknown'])
  })

  it('does not give the full specialty score when specialty data is missing', () => {
    const withoutData: HospitalWithMock = { recordid: 'x', fields: { name: 'X', dist: 1000, wheelchair: 'yes' } }
    const withData = hospital('y', 1000, 'yes', { ent: true })
    const { recommendedRecordId } = sortByRecommendation([withoutData, withData], ['ent'])
    expect(recommendedRecordId).toBe('y')
  })

  it('returns an empty result for an empty list', () => {
    expect(sortByRecommendation([], [])).toEqual({ sorted: [], recommendedRecordId: null })
  })

  it('formats distances in French', () => {
    expect(formatKm(1234)).toBe('1,2')
  })

  it('explains in plain words why a site is recommended', () => {
    const best = hospital('a', 1200, 'yes', { cardiologist: true, ent: true })
    const reasons = getRecommendationReasons({
      hospital: best,
      selectedSpecializations: ['cardiologist', 'ent'],
      candidates: [best, hospital('b', 5000, 'no')],
    })
    expect(reasons).toEqual([
      "C'est le plus proche : 1,2 km.",
      'Il a toutes les spécialités choisies : Cardiologie, ORL.',
      'Il est accessible en fauteuil roulant.',
    ])
  })

  it('states missing or negative information honestly', () => {
    const reasons = getRecommendationReasons({
      hospital: hospital('a', undefined),
      selectedSpecializations: [],
      trafficLevel: 80,
    })
    expect(reasons).toEqual([
      'Distance inconnue.',
      'Accès en fauteuil roulant : information non disponible.',
      "L'affluence y est forte.",
    ])
  })
})
