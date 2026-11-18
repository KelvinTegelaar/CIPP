import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, it, expect, vi } from 'vitest'

// Drive the REAL ApiPostCall mutation against a mocked axios: a raw file block (Blob) must leave
// with its own content type, or the backend parses the bytes as JSON text and never sees them.
vi.mock('axios', () => ({
  default: { post: vi.fn(), interceptors: { request: { use: vi.fn() } } },
}))

import axios from 'axios'
import { ApiPostCall } from '../../src/api/ApiCall'

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

const post = async (data) => {
  const { result } = renderHook(() => ApiPostCall({}), { wrapper })
  await act(async () => {
    await result.current.mutateAsync({ url: '/api/ExecUploadAppPackage', data })
  })
  return axios.post.mock.calls[0][2].headers
}

beforeEach(() => {
  axios.post.mockReset()
  axios.post.mockResolvedValue({ data: { Results: {} } })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ version: 'test' }) }))
  )
})

describe('ApiPostCall request content type', () => {
  it('sends a Blob body with its own type instead of application/json', async () => {
    const headers = await post(
      new Blob([new Uint8Array(8)], { type: 'application/octet-stream' })
    )

    expect(headers['Content-Type']).toBe('application/octet-stream')
    expect(headers['X-CIPP-Version']).toBe('test')
  })

  it('keeps application/json for an ordinary object body', async () => {
    const headers = await post({ packageId: 'x' })

    expect(headers['Content-Type']).toBe('application/json')
  })
})
