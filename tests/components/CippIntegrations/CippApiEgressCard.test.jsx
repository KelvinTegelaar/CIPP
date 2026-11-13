import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippApiEgressCard } from '../../../src/components/CippIntegrations/CippApiEgressCard'
import { api, getResult } from '../../mocks/api-call'

vi.mock('../../../src/api/ApiCall', async () =>
  (await import('../../mocks/api-call')).apiCallMock()
)

const MiB = 1048576

// A client as Invoke-ListApiEgress returns it; endpoint encoding counts are null on rows from before Craft tracked them.
const client = (Name, Bytes, Requests, BrRequests, GzipRequests) => ({
  AppId: `${Name}-id`,
  Name,
  Bytes,
  Requests,
  Shed: 0,
  Endpoints: [
    {
      Endpoint: 'ListUsers',
      Bytes,
      Requests,
      BrRequests,
      GzipRequests,
      BrBytes: 0,
      GzipBytes: 0,
    },
  ],
  Ips: [],
})

const idle = getResult({ isSuccess: false })

// Only ListApiEgress answers; the table's own lookups stay idle
const egress = (...Clients) => {
  const result = getResult({
    data: {
      Results: {
        Enabled: true,
        CapBytes: 1024 * MiB,
        BytesToday: Clients.reduce((n, c) => n + c.Bytes, 0),
        Clients,
        ClientIds: Clients.map((c) => c.AppId),
        Trend: [],
        Endpoints: [],
        Ips: [],
      },
    },
  })
  return (opts) => (opts?.url === '/api/ListApiEgress' ? result : idle)
}

describe('CippApiEgressCard uncompressed warning', () => {
  it('names a large client that mostly takes uncompressed responses', () => {
    api.get = egress(
      client('Nightly sync', 600 * MiB, 100, 5, 5),
      client('Dashboard', 300 * MiB, 100, 100, 0)
    )
    renderWithProviders(<CippApiEgressCard />)
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toMatch(/Nightly sync/)
    expect(alert.textContent).toMatch(/90%/)
    expect(alert.textContent).not.toMatch(/Dashboard/)
  })

  it('stays hidden for compressed, small or untracked traffic', () => {
    api.get = egress(
      client('Compressed', 600 * MiB, 100, 30, 0),
      client('Small', 10 * MiB, 100, 0, 0),
      client('Untracked', 600 * MiB, 100, null, null)
    )
    renderWithProviders(<CippApiEgressCard />)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
