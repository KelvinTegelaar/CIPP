import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test-utils'
import { SecureScoreCard } from '../../../src/components/CippComponents/SecureScoreCard'

const scoreData = [
  { createdDateTime: '2026-07-01T00:00:00Z', currentScore: 40, maxScore: 100 },
  { createdDateTime: '2026-07-15T00:00:00Z', currentScore: 55, maxScore: 100 },
  { createdDateTime: '2026-07-29T00:00:00Z', currentScore: 60, maxScore: 100 },
]

describe('SecureScoreCard', () => {
  it('does not trigger the recharts zero-size warning on first render', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderWithTheme(<SecureScoreCard data={scoreData} isLoading={false} />)

    const sizeWarnings = warnSpy.mock.calls.filter((args) =>
      String(args[0]).includes('should be greater than 0'),
    )
    expect(sizeWarnings).toEqual([])
    warnSpy.mockRestore()
  })

  it('renders the card title and description with data', () => {
    renderWithTheme(<SecureScoreCard data={scoreData} isLoading={false} />)

    expect(screen.getByText('Secure Score')).toBeInTheDocument()
    expect(
      screen.getByText('The Secure Score measures your security posture across your tenant.'),
    ).toBeInTheDocument()
  })

  it('shows the empty state when there is no data', () => {
    renderWithTheme(<SecureScoreCard data={[]} isLoading={false} />)

    expect(screen.getByText('No secure score data available')).toBeInTheDocument()
  })

  it('shows the loading state without chart or empty state', () => {
    renderWithTheme(<SecureScoreCard data={null} isLoading={true} />)

    expect(screen.getByText('Secure Score')).toBeInTheDocument()
    expect(screen.queryByText('No secure score data available')).not.toBeInTheDocument()
  })
})
