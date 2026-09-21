import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '../../test-utils'

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }))
vi.mock('../../../src/hooks/use-breakpoint', () => ({
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
  useTableViewMode: () => 'table',
}))

import {
  SecureScoreCard,
  secureScoreAxisProps,
} from '../../../src/components/CippComponents/SecureScoreCard'

const scoreData = [
  { createdDateTime: '2026-07-01T00:00:00Z', currentScore: 40, maxScore: 100 },
  { createdDateTime: '2026-07-15T00:00:00Z', currentScore: 55, maxScore: 100 },
  { createdDateTime: '2026-07-29T00:00:00Z', currentScore: 60, maxScore: 100 },
]

describe('SecureScoreCard', () => {
  beforeEach(() => {
    layoutState.isMobile = false
  })

  // recharts reads its axis children's props without mounting them, so there is no element to
  // assert against — the config is exported and tested directly.

  // A fixed interval drew a label for every point regardless of card width, which overlapped
  // into an unreadable run whenever the card was narrower than a full desktop column (e.g. the
  // dashboard's third-width layout). preserveStartEnd lets recharts thin labels at any width.
  it('hands x-axis spacing back to recharts on desktop', () => {
    const axis = secureScoreAxisProps({ isMobile: false })

    expect(axis.x.interval).toBe('preserveStartEnd')
    expect(axis.x.minTickGap).toBeGreaterThanOrEqual(32)
    expect(axis.x.tick.fontSize).toBe(12)
    expect(axis.y.width).toBeUndefined()
  })

  it('hands x-axis spacing back to recharts on a narrow chart', () => {
    const axis = secureScoreAxisProps({ isMobile: true })

    expect(axis.x.interval).toBe('preserveStartEnd')
    expect(axis.x.minTickGap).toBeGreaterThan(5)
    expect(axis.x.tick.fontSize).toBeLessThan(12)
    // and the y-axis gutter narrows so the plot keeps the width it has
    expect(axis.y.width).toBeLessThan(40)
  })

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
