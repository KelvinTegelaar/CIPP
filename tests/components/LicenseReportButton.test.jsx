import React from 'react'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import { LicenseReportButton } from '../../src/components/CippPdf/LicenseReportButton'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

// The report is rendered server-side: the dialog POSTs the page's analysis settings, the section
// switches and the branding default for this report type to ExecGetLicenseReportPdf, and shows the
// returned PDF in an iframe.
const TENANT = 'contoso.onmicrosoft.com'

// The ListLicenseRecommendations Results the page holds; the button only reads its Summary.
const REPORT = {
  Summary: {
    Tenant: TENANT,
    Currency: 'EUR',
    MonthlySpend: 2433.75,
    TotalPotentialMonthly: 838.3,
    DataAvailable: true,
  },
}

// The page's apiData: the same settings its table request carries.
const SETTINGS = {
  currency: 'EUR',
  inactiveDays: 30,
  tenureMonths: 12,
  recommendDowngrades: true,
  recommendUpgrades: false,
  recommendTerms: true,
  protectSecurityFeatures: false,
}

const branding = getResult({
  data: { colour: '#0E4C92', reportDefaults: { licensing: 'preset-7' } },
})

let fetchMock
beforeEach(() => {
  api.get = (opts) =>
    opts.url === '/api/ListBrandingSettings' ? branding : getResult()
  fetchMock = vi.fn(() =>
    Promise.resolve({
      ok: true,
      blob: () =>
        Promise.resolve(new Blob(['%PDF-'], { type: 'application/pdf' })),
    })
  )
  vi.stubGlobal('fetch', fetchMock)
  URL.createObjectURL = vi.fn(() => 'blob:license-report')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const renderButton = (props = {}) =>
  renderWithProviders(
    <LicenseReportButton
      report={REPORT}
      tenantName={TENANT}
      settings={SETTINGS}
      {...props}
    />,
    { settings: settingsWith({ currentTenant: TENANT }) }
  )

const openDialog = async () => {
  await userEvent.click(screen.getByRole('button', { name: /client report/i }))
  return screen.findByRole('dialog')
}

const lastRequest = () => {
  const [url, init] = fetchMock.mock.calls.at(-1)
  return { url, body: JSON.parse(init.body) }
}

describe('LicenseReportButton', () => {
  it('renders nothing on the server until the dialog is opened', async () => {
    renderButton()
    expect(fetchMock).not.toHaveBeenCalled()

    await openDialog()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  })

  it("sends the page's analysis settings, every section and the licensing branding default", async () => {
    renderButton()
    await openDialog()
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const { url, body } = lastRequest()
    expect(url).toBe('/api/ExecGetLicenseReportPdf')
    expect(body).toEqual({
      tenantFilter: TENANT,
      ...SETTINGS,
      sections: {
        spend: true,
        reclaim: true,
        downgrades: true,
        upgrades: true,
        terms: true,
        method: true,
      },
      brandingPresetId: 'preset-7',
    })
  })

  it('re-renders without a section once its switch is turned off', async () => {
    renderButton()
    await openDialog()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const card = screen.getByText('Cheaper plans').closest('.MuiPaper-root')
    await userEvent.click(within(card).getByRole('switch'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(lastRequest().body.sections).toMatchObject({
      downgrades: false,
      spend: true,
    })
  })

  it("downloads the rendered PDF under the tenant's name and today's date", async () => {
    const saved = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function () {
        saved.push({ href: this.href, download: this.download })
      }
    )
    renderButton()
    await openDialog()
    const download = screen.getByRole('button', { name: /download pdf/i })
    await waitFor(() => expect(download).toBeEnabled())

    await userEvent.click(download)

    const today = new Date().toISOString().split('T')[0]
    expect(saved).toEqual([
      {
        href: 'blob:license-report',
        download: `Licensing_Report_${TENANT}_${today}.pdf`,
      },
    ])
  })

  it('explains a failed render instead of showing an empty preview', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 500 })
    )
    renderButton()
    await openDialog()

    expect(
      await screen.findByText(/the report could not be generated/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeDisabled()
  })

  it('stays disabled for a tenant with no license data, and while the page refetches', () => {
    const { unmount } = renderButton({
      report: { Summary: { ...REPORT.Summary, DataAvailable: false } },
    })
    expect(
      screen.getByRole('button', { name: /client report/i })
    ).toBeDisabled()
    unmount()

    renderButton({ disabled: true })
    expect(
      screen.getByRole('button', { name: /client report/i })
    ).toBeDisabled()
  })
})
