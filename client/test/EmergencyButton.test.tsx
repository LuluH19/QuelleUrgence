import { render, screen } from '@testing-library/react'
import EmergencyButton from '../components/EmergencyButton'

describe('EmergencyButton', () => {
  it('renders anchor with correct href and aria-label and shows texts', () => {
    render(<EmergencyButton />)

    const link = screen.getByRole('link', { name: /Appeler le numéro d'urgence 114/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'tel:114')
    expect(link).toHaveAttribute('aria-label', "Appeler le numéro d'urgence 114")

    // Both text nodes are present in the DOM (Tailwind controls visibility)
    expect(screen.getByText(/Appeler le 114/i)).toBeInTheDocument()
    expect(screen.getByText(/^114$/)).toBeInTheDocument()
  })
})
