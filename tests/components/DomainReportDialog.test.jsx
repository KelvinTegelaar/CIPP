import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import { DomainReportDialog } from '../../src/components/CippPdf/DomainReportDialog'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

const TENANT = 'contoso.onmicrosoft.com'
let fetchMock

const respond = (status) =>
  vi.fn(() =>
    Promise.resolve(
      status === 200
        ? {
            ok: true,
            blob: () =>
              Promise.resolve(new Blob(['%PDF-'], { type: 'application/pdf' })),
          }
        : { ok: false, status }
    )
  )

const requestedUrl = () =>
  new URL(fetchMock.mock.calls.at(-1)[0], 'http://localhost')

beforeEach(() => {
  api.get = (opts) =>
    opts.url === '/api/ListBrandingSettings'
      ? getResult({
          data: {
            reportDefaults: {
              domain: 'preset-domain',
              mailFlow: 'preset-mail',
            },
          },
        })
      : getResult()
  fetchMock = respond(200)
  vi.stubGlobal('fetch', fetchMock)
  URL.createObjectURL = vi.fn(() => 'blob:report')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('DomainReportDialog', () => {
  it('asks for every domain of the selected tenant with the domain branding default', async () => {
    renderWithProviders(
      <DomainReportDialog tenantFilter={TENANT} open onClose={() => {}} />
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const url = requestedUrl()
    expect(url.pathname).toBe('/api/ExecGetDomainReportPdf')
    expect(url.searchParams.get('tenantFilter')).toBe(TENANT)
    expect(url.searchParams.has('domain')).toBe(false)
    expect(url.searchParams.get('brandingPresetId')).toBe('preset-domain')
    expect(url.searchParams.get('includeDetails')).toBe('true')
  })

  it('does not render a report while closed or for All Tenants', () => {
    const { unmount } = renderWithProviders(
      <DomainReportDialog
        tenantFilter={TENANT}
        open={false}
        onClose={() => {}}
      />
    )
    unmount()
    renderWithProviders(
      <DomainReportDialog tenantFilter="AllTenants" open onClose={() => {}} />
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('re-requests the report without the technical pages when details are switched off', async () => {
    renderWithProviders(
      <DomainReportDialog tenantFilter={TENANT} open onClose={() => {}} />
    )
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    await userEvent.click(screen.getByLabelText(/include technical details/i))
    await waitFor(() =>
      expect(requestedUrl().searchParams.get('includeDetails')).toBe('false')
    )
  })

  it('tells the user to run the analyser when the tenant has no stored results', async () => {
    fetchMock = respond(404)
    vi.stubGlobal('fetch', fetchMock)
    renderWithProviders(
      <DomainReportDialog tenantFilter={TENANT} open onClose={() => {}} />
    )
    expect(
      await screen.findByText(/no domain analyser results for this tenant yet/i)
    ).toBeInTheDocument()
  })
})
