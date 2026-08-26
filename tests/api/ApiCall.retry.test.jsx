import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'

// Drive the REAL ApiGetCall hook against a mocked axios so we test the actual retry wiring
// (retryFn + retryDelay + queryFn), not a reimplementation of it. The question under test: when
// Craft sheds a saturated request with a 503 ("Server busy, please retry", no Retry-After header),
// does the CIPP frontend retry the GET — and does it correctly NOT retry a real 500?

vi.mock('axios', () => {
  const isAxiosError = (e) => Boolean(e && e.isAxiosError)
  return {
    default: { get: vi.fn(), post: vi.fn(), isAxiosError },
    isAxiosError,
  }
})

import axios from 'axios'
import { ApiGetCall } from '../../src/api/ApiCall'

// Shaped like a real axios error so isAxiosError(err) is true and err.response.status is read.
const axiosError = (status, { retryAfter } = {}) => {
  const headers = {}
  if (retryAfter != null) headers['retry-after'] = String(retryAfter)
  const err = new Error(`Request failed with status code ${status}`)
  err.isAxiosError = true
  err.config = {}
  err.response = { status, headers, data: { error: 'shed' } }
  return err
}

const wrapper = ({ children }) => {
  const store = configureStore({
    reducer: { toasts: (s = { toasts: [] }) => s },
  })
  const queryClient = new QueryClient()
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
}

let keyCounter = 0
const uniqueKey = () => `retry-test-${keyCounter++}`

beforeEach(() => {
  axios.get.mockReset()
  // buildVersionedHeaders() runs inside the queryFn (before axios.get) and fetches /version.json.
  // Stub fetch so it resolves instantly instead of stalling; the query then reaches the mocked axios.
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ version: 'test' }) }))
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ApiGetCall retry behaviour on a Craft 503', () => {
  it('retries a 503 shed and recovers when a worker frees up', async () => {
    axios.get
      .mockRejectedValueOnce(axiosError(503))
      .mockResolvedValueOnce({ data: { ok: true } })

    const key = uniqueKey()
    const { result } = renderHook(
      () => ApiGetCall({ url: '/api/ListThing', queryKey: key }),
      {
        wrapper,
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 15000,
    })
    // Initial attempt (503) + one retry (200) = two calls, and the recovered data surfaces.
    expect(axios.get).toHaveBeenCalledTimes(2)
    expect(result.current.data).toEqual({ ok: true })
  }, 20000)

  it('keeps retrying a persistent 503 before finally surfacing the error', async () => {
    axios.get.mockRejectedValue(axiosError(503))

    const key = uniqueKey()
    const { result } = renderHook(
      () => ApiGetCall({ url: '/api/ListThing', queryKey: key }),
      {
        wrapper,
      }
    )

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 15000,
    })
    // Default retry=3 → initial + retries; proves it did not give up after the first 503.
    expect(axios.get.mock.calls.length).toBeGreaterThanOrEqual(3)
  }, 20000)

  it('does NOT retry a 500 — it is in the no-retry list and must surface immediately', async () => {
    axios.get.mockRejectedValue(axiosError(500))

    const key = uniqueKey()
    const { result } = renderHook(
      () => ApiGetCall({ url: '/api/ListThing', queryKey: key }),
      {
        wrapper,
      }
    )

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 15000,
    })
    expect(axios.get).toHaveBeenCalledTimes(1)
  }, 15000)

  it('honours Retry-After on a 503 rather than the immediate exponential backoff', async () => {
    const stamps = []
    axios.get.mockImplementation(() => {
      stamps.push(Date.now())
      // First call sheds with a 3s Retry-After; the retry then succeeds.
      return stamps.length === 1
        ? Promise.reject(axiosError(503, { retryAfter: 3 }))
        : Promise.resolve({ data: { ok: true } })
    })

    const key = uniqueKey()
    const { result } = renderHook(
      () => ApiGetCall({ url: '/api/ListThing', queryKey: key }),
      {
        wrapper,
      }
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 15000,
    })
    expect(axios.get).toHaveBeenCalledTimes(2)
    // The gap must reflect the 3s Retry-After, not react-query's ~1-2s first exponential step.
    expect(stamps[1] - stamps[0]).toBeGreaterThanOrEqual(2700)
  }, 20000)
})
