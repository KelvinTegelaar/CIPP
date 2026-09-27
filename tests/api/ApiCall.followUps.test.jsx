import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, it, expect, vi } from 'vitest'

// Drive the REAL ApiPostCall mutation against a mocked axios: follow-up requests ride the same
// mutation so a form page shows one results section for the whole chain.
vi.mock('axios', () => ({ default: { post: vi.fn() } }))

import axios from 'axios'
import { ApiPostCall } from '../../src/api/ApiCall'

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

const httpError = (status, data) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status, data },
  })

const followUps = [
  { url: '/api/ExecCAExclusion', data: { PolicyId: 'policy-1' } },
  {
    url: '/api/ExecScheduleAuditExclusionVacation',
    data: { Users: ['user-1'] },
  },
]

beforeEach(() => {
  axios.post.mockReset()
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => ({ version: 'test' }) }))
  )
})

describe('ApiPostCall follow-up requests', () => {
  it('returns every response in one result, keeping a failed follow-up next to the primary', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { Results: ['User: jane@contoso.com'] } })
      .mockRejectedValueOnce(
        httpError(500, { Results: 'Failed to add CA exclusion' })
      )
      .mockResolvedValueOnce({ data: { Results: 'Scheduled audit exclusion' } })
    const onResult = vi.fn()
    const { result } = renderHook(() => ApiPostCall({ onResult }), { wrapper })

    let data
    await act(async () => {
      data = await result.current.mutateAsync({
        url: '/api/ExecJitAdmin',
        data: {},
        followUps,
      })
    })

    expect(axios.post.mock.calls.map(([url]) => url)).toEqual([
      '/api/ExecJitAdmin',
      '/api/ExecCAExclusion',
      '/api/ExecScheduleAuditExclusionVacation',
    ])
    expect(data).toEqual([
      { Results: ['User: jane@contoso.com'] },
      { Results: 'Failed to add CA exclusion' },
      { Results: 'Scheduled audit exclusion' },
    ])
    expect(onResult).toHaveBeenCalledTimes(1)
  })

  it('sends no follow-ups when the primary request fails', async () => {
    axios.post.mockRejectedValueOnce(
      httpError(400, { Results: ['Failed to create user'] })
    )
    const { result } = renderHook(() => ApiPostCall({}), { wrapper })

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          url: '/api/ExecJitAdmin',
          data: {},
          followUps,
        })
      ).rejects.toThrow()
    })

    expect(axios.post).toHaveBeenCalledTimes(1)
  })
})
