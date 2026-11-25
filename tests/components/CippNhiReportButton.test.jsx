import React from 'react'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import { CippNhiReportButton } from '../../src/components/CippComponents/CippNhiReportButton'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

const TENANT = 'contoso.onmicrosoft.com'
let fetchMock

beforeEach(() => {
  api.get = () => getResult({ data: { reportDefaults: { nhi: 'preset-nhi' } } })
  fetchMock = vi.fn(() =>
    Promise.resolve({
      ok: true,
      blob: () =>
        Promise.resolve(new Blob(['%PDF-'], { type: 'application/pdf' })),
    })
  )
  vi.stubGlobal('fetch', fetchMock)
  URL.createObjectURL = vi.fn(() => 'blob:nhi-report')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('CippNhiReportButton', () => {
  it('renders the case on open with the NHI report preset', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CippNhiReportButton
        caseData={{ CaseId: 'NHI-1', DisplayName: 'Sample App' }}
        tenantFilter={TENANT}
      />,
      { settings: settingsWith({ currentTenant: TENANT }) }
    )
    expect(fetchMock).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'PDF report' }))
    await screen.findByRole('dialog')
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const url = new URL(fetchMock.mock.calls.at(-1)[0], 'https://example.com')
    expect(url.pathname).toBe('/api/ExecGetNhiReportPdf')
    expect(url.searchParams.get('caseId')).toBe('NHI-1')
    expect(url.searchParams.get('tenantFilter')).toBe(TENANT)
    expect(url.searchParams.get('brandingPresetId')).toBe('preset-nhi')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled()
    )
  })

  it('waits for the branding before rendering, so the preset is applied the first time', async () => {
    api.get = getResult({ isSuccess: false, isLoading: true })
    let refresh
    const Harness = () => {
      const [, setTick] = React.useState(0)
      refresh = () => setTick((tick) => tick + 1)
      return (
        <CippNhiReportButton
          caseData={{ CaseId: 'NHI-1', DisplayName: 'Sample App' }}
          tenantFilter={TENANT}
        />
      )
    }
    const user = userEvent.setup()
    renderWithProviders(<Harness />, {
      settings: settingsWith({ currentTenant: TENANT }),
    })
    await user.click(screen.getByRole('button', { name: 'PDF report' }))
    await screen.findByText('Generating report…')
    expect(fetchMock).not.toHaveBeenCalled()

    api.get = getResult({ data: { reportDefaults: { nhi: 'preset-nhi' } } })
    act(() => refresh())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const url = new URL(fetchMock.mock.calls[0][0], 'https://example.com')
    expect(url.searchParams.get('brandingPresetId')).toBe('preset-nhi')
  })
})
