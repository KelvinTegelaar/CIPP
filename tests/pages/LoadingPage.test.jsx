import React from 'react'
import { act, screen } from '@testing-library/react'
import { renderWithTheme } from '../test-utils'
import LoadingPage from '../../src/pages/loading'

vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: () => ({ isSuccess: true, data: { version: '10.7.5' } }),
}))

describe('LoadingPage', () => {
  it('renders the waiting state with a progress bar', () => {
    renderWithTheme(<LoadingPage />)

    expect(screen.getByText('Logging into CIPP')).toBeInTheDocument()
    expect(screen.getByText('Please wait while we log you in...')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  // regression lock: a 20s timer used to swap in cold-start copy here. CIPP runs
  // as a container now, so there is no cold start to blame and no timer to fire.
  it('never mentions a cold start, however long it waits', () => {
    vi.useFakeTimers()
    try {
      renderWithTheme(<LoadingPage />)
      act(() => {
        vi.advanceTimersByTime(120000)
      })

      expect(screen.queryByText(/cold start/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/function app/i)).not.toBeInTheDocument()
      expect(screen.getByText('Please wait while we log you in...')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
