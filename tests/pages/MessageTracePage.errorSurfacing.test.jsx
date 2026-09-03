import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import Page from '../../src/pages/email/tools/message-trace/index.jsx'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, postResult } from '../mocks/api-call'

// Regression coverage: a failed search used to leave the table showing stale rows and any
// previous informational banner in place, because errors were only handled in onResult
// (which never fires on a rejected mutation).
describe('Message Trace page - API error surfacing', () => {
  let messageTraceState
  let capturedOnResult
  let latestOnError

  beforeEach(() => {
    vi.clearAllMocks()
    messageTraceState = postResult()
    messageTraceState.mutate = vi.fn((variables, options) => {
      latestOnError = options?.onError
    })
    capturedOnResult = null
    api.post = (opts) => {
      if (opts?.queryKey === 'MessageTrace') {
        capturedOnResult = opts.onResult
        return messageTraceState
      }
      return postResult()
    }
  })

  it('shows the backend error and clears a stale info banner when the search fails', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    // First search succeeds via the V2 fallback and shows the informational banner.
    await user.click(screen.getByRole('button', { name: 'Search' }))
    act(() => {
      capturedOnResult({
        Results: [],
        Metadata: {
          Note: 'Served via Get-MessageTraceV2 while the Graph message trace service principal activates for this tenant.',
        },
      })
    })
    expect(await screen.findByText(/Served via Get-MessageTraceV2/)).toBeInTheDocument()

    // The first submit collapses the filter accordion; re-expand it to reach Search again.
    await user.click(screen.getByRole('button', { name: 'Find a message' }))
    await user.click(await screen.findByRole('button', { name: 'Search' }))
    act(() => {
      latestOnError({
        response: {
          data: {
            Results: [],
            Metadata: {
              Error:
                'Message trace queries are limited to a 10 day window. Narrow the date range, or use a historical search for longer periods.',
            },
          },
        },
      })
    })

    expect(await screen.findByText(/limited to a 10 day window/)).toBeInTheDocument()
    expect(screen.queryByText(/Served via Get-MessageTraceV2/)).not.toBeInTheDocument()
  })
})
