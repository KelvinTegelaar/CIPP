import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'

// Multi-row table actions send one request per row (CippApiDialog bulkRequest). A row the
// backend fails with an error status must not abandon the rows after it.
vi.mock('axios', () => {
  const isAxiosError = (e) => Boolean(e && e.isAxiosError)
  return {
    default: { get: vi.fn(), post: vi.fn(), isAxiosError },
    isAxiosError,
  }
})

import axios from 'axios'
import { ApiGetCall, ApiPostCall } from '../../src/api/ApiCall'

const wrapper = ({ children }) => {
  const store = configureStore({
    reducer: { toasts: (s = { toasts: [] }) => s },
  })
  return (
    <Provider store={store}>
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    </Provider>
  )
}

const httpError = (status, data) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    config: {},
    response: { status, headers: {}, data },
  })

const failedRow = (resultText) => ({
  Results: [{ resultText, state: 'error' }],
})

beforeEach(() => {
  axios.get.mockReset()
  axios.post.mockReset()
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ version: 'test' }) }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('bulk requests with a failed row', () => {
  it('POST: sends the remaining rows and reports the failed one as an error', async () => {
    // Invoke-ExecSendPush shapes: success and its catch block (500).
    axios.post
      .mockResolvedValueOnce({
        data: {
          Results: {
            resultText: 'Received an MFA confirmation: ',
            state: 'success',
          },
        },
      })
      .mockRejectedValueOnce(
        httpError(500, {
          Results: { resultText: 'User not found', state: 'error' },
        })
      )
      .mockResolvedValueOnce({
        data: {
          Results: {
            resultText: 'Received an MFA confirmation: ',
            state: 'success',
          },
        },
      })
    const onResult = vi.fn()
    const { result } = renderHook(() => ApiPostCall({ onResult }), { wrapper })

    let data
    await act(async () => {
      data = await result.current.mutateAsync({
        url: '/api/ExecSendPush',
        data: [
          { UserEmail: 'a@contoso.com' },
          { UserEmail: 'b@contoso.com' },
          { UserEmail: 'c@contoso.com' },
        ],
        bulkRequest: true,
      })
    })

    expect(axios.post).toHaveBeenCalledTimes(3)
    expect(data[1]).toEqual(failedRow('User not found'))
    expect(
      onResult.mock.calls.map(([, meta]) => Boolean(meta?.failed))
    ).toEqual([false, true, false])
  })

  it('GET: sends the remaining rows and reports the failed one as an error', async () => {
    // Invoke-ExecStandardsRun shapes: success and its catch block.
    const failure =
      'Failed to start standards run for tenant: b.com. Error: Tenant not found'
    axios.get
      .mockResolvedValueOnce({
        data: {
          Results: 'Successfully started Standards Run for tenant a.com',
        },
      })
      .mockRejectedValueOnce(httpError(500, { Results: failure }))
      .mockResolvedValueOnce({
        data: {
          Results: 'Successfully started Standards Run for tenant c.com',
        },
      })
    const onResult = vi.fn()
    const { result } = renderHook(
      () =>
        ApiGetCall({
          url: '/api/ExecStandardsRun',
          queryKey: 'bulk-get-failed-row',
          data: [
            { tenantFilter: 'a.com' },
            { tenantFilter: 'b.com' },
            { tenantFilter: 'c.com' },
          ],
          bulkRequest: true,
          onResult,
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(axios.get).toHaveBeenCalledTimes(3)
    expect(result.current.data[1]).toEqual(failedRow(failure))
    expect(
      onResult.mock.calls.map(([, meta]) => Boolean(meta?.failed))
    ).toEqual([false, true, false])
  })
})
